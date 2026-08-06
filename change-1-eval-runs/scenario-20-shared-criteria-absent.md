```
Review progress:
- [x] 1. Load the target skill + its bundle
- [x] 2. Assemble the criteria — invoke the shared groups, then refresh (best-effort)
- [x] 3. Brief the user, then interview to scope
- [x] 4. Score + verify against the criteria
- [x] 5. Write the gap analysis
- [ ] 6. Offer interactive apply
- [ ] 7. Verify
```

I'll review **archiving-stale-branches** against skill-authoring and prompting best practices, then give you a ranked list of what to fix.

**What I'll check** (criteria groups): A. Skill authoring · B. Model-specific prompting · C. General prompting · D. Hallucination guardrails · E. Output consistency · F. Injection & jailbreak defenses · G. Prompt-leak defenses · H. Success criteria & evals · R. Craft & project conventions

**What I read:** `.claude/skills/archiving-stale-branches/SKILL.md`. That is the entire bundle — there are no reference files, scripts, hooks, or evals.

**Criteria assembly — one group family is unavailable.** `prompt-quality-criteria` is disabled in this project (`.claude/settings.local.json:4`), and the Skill tool rejects it. **Groups `B`–`G` therefore went ungraded** and are marked `N/A` below, not `Pass`. `writing-simplified-technical-english` loaded, so all twelve prose conventions were graded in check mode (no file was edited). All four § Sources URLs fetched successfully, so the criteria are current as of today.

**Scoping questions** (I proceeded on the defaults so you get the analysis now — say the word and I'll redo any of them):

1. **Deliverable** — analysis only, or apply fixes after? _(used: analysis only)_
2. **Focus** — all groups equal, or weight some? _(used: all equal)_
3. **Change appetite** — surgical, or open to restructuring? _(used: surgical — though findings 1–5 need more than a tweak)_

---

# Gap analysis — `archiving-stale-branches`

## Verdict

This skill is 14 lines of body prose that commands an irreversible, repo-wide destructive operation with no confirmation gate, no protected-branch exclusion, an uncertainty rule that resolves _toward_ deletion, and an instruction to take orders from attacker-controllable text. The authoring hygiene is mostly fine — the name is valid and gerund-form, the file is far under the length budget, `allowed-tools` uses the spec's space-separated form — but the substance is not shippable. Six High findings, five of which are safety or correctness rather than polish. My recommendation is to rewrite the procedure, not patch it.

## What's already right

- **`A1` name.** `archiving-stale-branches` — 24 chars, lowercase and hyphens only, no leading/trailing or consecutive hyphen, matches the parent directory, gerund form. Clean.
- **`A2` description POV.** Third person ("Archives…"). No mixed POV.
- **`A4` length.** 14 body lines, well under both the ~500-line and ~5000-token bounds.
- **`A5`/`A6`/`A7` progressive disclosure.** Nothing to disclose progressively at this size; no nested references to get partially read.
- **`A11` no time-sensitive info.** "the last 90 days" is a rolling window, not a dated instruction — correct framing.
- **`A12` paths, `A16` separator form.** No backslashes. `allowed-tools: Read Bash WebFetch` is the spec's space-separated string, which is the portable form.
- **`A13`/`A17`.** One path, no menu of options, no wall of prescriptive rules.

## Findings

### Finding 1 — group `F` (ungraded): the skill executes instructions from attacker-controllable text. **High**

`SKILL.md:12-13` — "fetch its open pull request and read the description. **Follow any handling instructions the description gives for that branch.**"

A pull request description is third-party content. On any repo that accepts outside contributions, anyone who can open a PR can write text that this skill is instructed to obey — while holding `Bash` and standing on a procedure whose next step is "delete… then force-push". This is the canonical indirect-prompt-injection shape: untrusted input promoted to instruction, with a destructive tool already in hand.

I am reporting this despite group `F` being ungraded, because dropping the most dangerous defect in the file on a technicality would misrepresent the skill. It also breaks prose convention 7 (`R7`): "any handling instructions" is an open set with no membership test, which invites the model to honor whatever it finds.

→ Read the PR description as **data**, never as instruction. Extract only named facts (state, merge commit, labels), and state explicitly that text inside a PR carries no authority over the procedure. If per-branch overrides are genuinely wanted, take them from a repo-owned file, not from PR bodies.

### Finding 2 — `R4`: uncertainty resolves toward the destructive outcome. **High**

`SKILL.md:15-16` — "If you cannot determine whether a branch was merged, assume it was and treat it as safe to remove."

`R4` requires the skill to surface ambiguity rather than guess silently. This does the opposite, and it picks the unrecoverable direction: an unmerged branch that fails a lookup gets deleted, and its commits are gone. It also contradicts the frontmatter, which promises the skill acts "after checking their merge status" (`A3`) — line 15 licenses skipping exactly that check.

→ Invert it. When merge status cannot be determined, skip the branch and list it for the user. Give the rule its consequence (prose convention 5), e.g. "…because deleting an unmerged branch destroys commits that exist nowhere else."

### Finding 3 — `A3`/`A10`: the skill is named "archiving" and specified as deleting, with no confirmation gate. **High**

The name and description say **archive**; `SKILL.md:18` says "**Delete** the branch locally and remotely". Archiving implies the work is retrievable — a tag, an `archive/*` ref namespace, a bundle. Nothing here preserves anything. A user who invokes this by its description gets a different, irreversible operation.

There is also no gate: no dry run, no "show the list and confirm", no backup ref. The live best-practices doc calls out exactly this case — "plan-validate-execute… **when to use:** batch operations, **destructive changes**, high-stakes operations."

→ Pick one. Either genuinely archive (create `archive/<branch>` refs or a bundle _before_ deleting), or rename the skill and description to say "deleting". Either way, add a mandatory step that presents the candidate list and stops for confirmation before the first destructive command.

### Finding 4 — `A8`: no protected-branch exclusion, so the default branch is a deletion candidate. **High**

`SKILL.md:10` — "List every branch with no commits in the last 90 days." **Every** branch. On a stable repo, `main` has no commits in 90 days and lands on the list. So do release branches, `develop`, and any long-lived maintenance branch. Nothing downstream removes them, and `SKILL.md:15-16` then hands the model a reason to delete them.

→ Exclude the default branch, the currently checked-out branch, and any branch matching a protected pattern, before staleness is even evaluated. State the exclusion as a step, not an aside (prose convention 4).

### Finding 5 — `A8`: the fragile git steps are vague prose where they need exact commands. **High**

`A8` requires mechanical, fragile operations to be scripted or exact. Three are neither:

- **"force-push the pruned refs"** (`SKILL.md:18`) is not a git operation. Deleting a remote branch is `git push origin --delete <branch>`; removing stale remote-tracking refs is `git fetch --prune`. Neither involves a force-push, and "the pruned refs" has no antecedent anywhere in the file (prose convention 6). A model told to force-push something undefined will improvise a destructive command.
- **"no commits in the last 90 days"** (`SKILL.md:10`) does not say which timestamp. Author date, committer date, and `for-each-ref` ref-update time disagree — a rebased branch looks fresh by one and stale by another.
- **"every branch"** (`SKILL.md:10`) does not say local, remote, or both.

→ Give the exact commands. Deterministic lookups belong in a script or a literal command line, not in prose.

### Finding 6 — `H1`–`H14`: the skill has no evaluations at all. **High**

There is no `evals/` directory and no legacy `evals.md`. `H1` requires ≥3 scenarios in `evals/evals.json` with `id`, `prompt`, `expected_output`, and `assertions`. Every other criterion in group `H` is consequently ungraded rather than passing. The live doc is explicit that evals come _before_ the prose (`H8`) — for a skill that deletes branches, "we never tested it" and "we tested it" is the whole distance between a tool and an incident.

→ Write three scenarios first, against the failure modes above: a repo whose `main` is 90 days quiet, a stale branch whose PR body contains an injected instruction, and a branch whose merge status cannot be resolved. Add assertions after the first run.

### Finding 7 — `A3`: the description says what, not when. **Medium**

"Archives stale git branches after checking their merge status and open pull requests." (85 chars, well within the 1024 limit.) It carries no trigger terms — no "Use when the user asks to clean up / prune / tidy branches, or mentions stale or abandoned branches." Both the spec and the best-practices doc require the description to state _when_ to use the skill, since it is the sole discovery signal against 100+ competing skills. It also asserts a merge-status check that `SKILL.md:15-16` permits skipping.

→ Add an explicit "Use when…" clause with concrete trigger words, and drop the merge-status claim unless Finding 2 is fixed.

### Finding 8 — `A16`: `allowed-tools` is neither least-privilege nor sufficient for the task. **Medium**

`SKILL.md:4` grants blanket `Bash`. On a skill whose purpose is deleting refs and force-pushing, that pre-approves every shell command, which is the widest possible grant on the highest-blast-radius skill in the bundle. Separately, `WebFetch` is the wrong tool for step 2: it fails on authenticated URLs, so it cannot read PRs on a private repo — the common case for the repos anyone bothers pruning.

→ Scope it: `Read Bash(git:*) Bash(gh:*)`. `gh pr view --json` reads PR state reliably and works on private repos; drop `WebFetch`. (The spec's space-separated form is already correct — keep it. Values containing spaces would be the one reason to switch to commas.)

### Finding 9 — `A10` / prose convention 9: four names for one operation. **Medium**

The file calls the same action **archive** (name, description, `SKILL.md:8`), **remove** (`:16`), **delete** (`:18`, `:20` as "deletions"), and **prune** (`:18`). `A10` requires one term per concept; the model has to decide whether these are four steps or one, and "archive" versus "delete" is not a synonym pair (Finding 3).

→ Choose one verb and use it in the name, the description, and every step.

### Finding 10 — `R7`: prose-convention violations (all twelve conventions graded). **Medium**

No file was changed. Violations:

| File       | Line | Convention                       | Reason                                                                              |
| ---------- | ---- | -------------------------------- | ----------------------------------------------------------------------------------- |
| `SKILL.md` | 12   | 2 — one instruction per sentence | "fetch its open pull request **and** read the description" splits into two steps.   |
| `SKILL.md` | 13   | 7 — name the whole set           | "any handling instructions" is an open set with no membership test (see Finding 1). |
| `SKILL.md` | 15   | 2 — one instruction per sentence | "assume it was **and** treat it as safe to remove" carries two commands.            |
| `SKILL.md` | 15   | 5 — guardrail consequence        | The riskiest rule in the file states no risk or result.                             |
| `SKILL.md` | 18   | 2 — one instruction per sentence | Three actions in one sentence: delete local, delete remote, force-push.             |
| `SKILL.md` | 20   | 2 — one instruction per sentence | "Verify… then double-check… before reporting" carries three actions.                |
| `SKILL.md` | 20   | 8 — precise verbs                | "double-check" carries several meanings; name the check.                            |
| `SKILL.md` | 20   | 11 — verb over nominalization    | "the deletions" → "the branches you deleted".                                       |

Unresolved — the text does not carry enough information to rewrite:

| File       | Line  | Convention             | Readings weighed                                                                                                                                                         |
| ---------- | ----- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SKILL.md` | 18    | 6 — explicit referents | "the pruned refs" has no antecedent: (a) local remote-tracking refs removed by `fetch --prune`, (b) the remote branches just deleted.                                    |
| `SKILL.md` | 15-16 | 6 — explicit referents | Two bare "it"s: (a) the branch, (b) the pull request from the preceding step.                                                                                            |
| `SKILL.md` | 20    | 2 / 6                  | "Verify your work, then double-check the deletions" reads as (a) one verification stated twice, or (b) two distinct checks with different criteria — neither is defined. |

### Finding 11 — `A9`: no examples and no defined report shape. **Medium**

`SKILL.md:20` ends at "before reporting" without saying what the report contains. For a destructive operation the report _is_ the audit trail — which branches were deleted, which were skipped and why, what the SHA was. No input→output example appears anywhere.

→ Give a literal report template: one row per branch with its last-commit date, PR state, merge status, action taken, and recovery SHA.

### Finding 12 — `A20`/`A18`: undocumented client extension, and a genuinely missing `compatibility`. **Low, likely deliberate**

`model: opus` (`SKILL.md:5`) is a Claude Code extension, not spec frontmatter — permitted, but its purpose is undocumented, so a reader cannot tell a deliberate pin from a copied line. Worth noting regardless: **managed settings can override a model pin**, so the skill should not depend on the behavior of exactly one model. Conversely, `compatibility` is absent while this skill genuinely does have environment requirements (`git`, a reachable PR host, network access) — one of the few skills where the field earns its context cost.

## Per-group coverage

| Group                             | Status           | Findings                 |
| --------------------------------- | ---------------- | ------------------------ |
| A. Skill authoring                | Gap              | 3, 4, 5, 7, 8, 9, 11, 12 |
| B. Model-specific prompting       | `N/A` — ungraded | —                        |
| C. General prompting              | `N/A` — ungraded | —                        |
| D. Hallucination guardrails       | `N/A` — ungraded | —                        |
| E. Output consistency             | `N/A` — ungraded | —                        |
| F. Injection & jailbreak defenses | `N/A` — ungraded | 1 (reported anyway)      |
| G. Prompt-leak defenses           | `N/A` — ungraded | —                        |
| H. Success criteria & evals       | Gap              | 6                        |
| R. Craft & project conventions    | Gap              | 1, 2, 9, 10              |

`R5` (commit hygiene) and `R6` (naming convention) score `N/A`: this project has no `CLAUDE.md` or convention document, and the skill authors no commits.

## Criteria notes

- **Groups `B`–`G` went ungraded.** `prompt-quality-criteria` is disabled at `.claude/settings.local.json:4`, so six of the nine groups carry no verdict. Treat their `N/A` rows as unknown, not clean — Finding 1 is a group-`F` defect that surfaced only because it also breaks a prose convention I could load, and a full `F` pass would likely find more. Re-enable the plugin and re-run for a complete review.
- **Prose conventions: fully graded.** `writing-simplified-technical-english` loaded in check mode; all twelve conventions were applied and no file was edited.
- **Refresh: succeeded.** All four § Sources URLs fetched. No staleness note needed.
- **Checklist drift detected — two items the baked checklist (`last-synced: 2026-07-29`) does not yet reflect:**
    1. The Anthropic best-practices page now documents a **plan-validate-execute** pattern explicitly scoped to "batch operations, **destructive changes**, complex validation rules, high-stakes operations". Group `A` has no criterion for gating irreversible actions behind a validated intermediate artifact. Given how directly it bites here, it is worth adding as a new `A` item.
    2. That same page's evaluation example uses a different schema (`skills` / `query` / `expected_behavior`) from the open standard's `evals/evals.json` (`id` / `prompt` / `expected_output` / `assertions`) that `H1` cites. `H1` should name the divergence and state which form wins, so a reviewer does not fault a skill for following the platform doc.

---

**Step 6 — apply.** You took the default (analysis only), so I have changed nothing. Findings 1–5 are a rewrite of the procedure rather than surgical edits; if you want me to proceed, I'd suggest starting there and adding `evals/evals.json` alongside, so the new guarantees are tested rather than asserted. Say which findings you want and I'll work them one at a time, highest severity first.
