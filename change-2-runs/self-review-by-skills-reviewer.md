[33mWarning: no stdin data received in 3s, proceeding without it. If piping from a slow command, redirect stdin explicitly: < /dev/null to skip, or wait longer.[39m

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

One correction before the report: your message said "the reviewing-claude-subagents skill," and I first reached for that skill itself. It reviews _subagent definitions_; the target here is a _skill bundle_, so I ran `reviewing-claude-skills` against it instead.

I'll review **reviewing-claude-subagents** against skill-authoring and prompting best practices, then give you a ranked list of what to fix.

**What I checked** (criteria groups): A. skill authoring — spec conformance, name, description, structure, progressive disclosure · B. model-specific prompting (Opus 5 subset, from `model: opus`) · C. general prompting · D. hallucination guardrails · E. output consistency · F. injection & jailbreak defenses · G. prompt-leak defenses · H. success criteria & evals · R. craft & project conventions.

**What I read:** `SKILL.md`, `references/best-practices-checklist.md`, all 16 scenarios and 15 fixtures in `evals/evals.json`, `README.md`, `.claude-plugin/plugin.json`, and the host project's `CLAUDE.md`.

**Scoping:** defaults, as you asked — analysis only, all groups weighted equally, surgical change appetite.

---

# Gap analysis — `reviewing-claude-subagents`

## 1. Verdict

This is a strong, unusually self-aware skill bundle. It conforms to the Agent Skills spec, ships 16 well-designed eval scenarios with committed fixtures, states its own limits honestly, and implements the coverage-then-filter pattern that Anthropic's Opus 5 guidance calls for in review prompts. I re-fetched all ten source documents behind my criteria and **found no drift** — and I spot-checked the target's own factual claims about Claude Code against `code.claude.com/docs/en/sub-agents`, where the always-stripped tool list, the background tool filter, the plugin-ignored fields, the `name`-colon rule and its v2.1.218 gate, and the `disallowedTools`-then-`tools` resolution order all check out verbatim. The defects that remain are mostly cases where the skill fails a criterion it applies to _others_: it grades subagents for unjustified model pins while pinning `opus` without a reason, for tool grants nothing uses while granting an unused `Write`, and for restating rules from an authoritative source while carrying a drifted second copy of its own checklist. The one High finding is structural: the twelve-convention prose grading that `R7` depends on is ordered from a reference section rather than from a numbered step, so a run that ticks every box in the progress checklist can skip it silently — the exact failure mode this skill treats as unacceptable everywhere else.

## 2. What's already right

- **Progressive disclosure is used correctly** (`A5`, `A6`, `A7`). `SKILL.md` is 278 body lines; the 372-line checklist sits in `references/` with a `## Contents` table of contents; references are one level deep.
- **Frontmatter conforms.** `name` matches the parent directory, `allowed-tools` uses the spec's space-separated form (`A16`), `compatibility` is 246 chars and states genuine requirements — Claude Code plus network access (`A18`).
- **`B4` — coverage before filtering — is implemented, with the reasoning stated.** `SKILL.md:197-201` names the exact failure mode ("a current model told to 'only report what matters' will faithfully investigate and then silently discard borderline findings"). This is the single most important item for a review skill on Opus 5, and it is right.
- **Hallucination guards are thorough** (`D1`–`D4`). Verify-before-reporting, quote-the-exact-line, mark-inferential-findings, and three separate "say it went ungraded" instructions.
- **Injection defenses are complete and red-teamed** (`F1`, `F3`, `F5`). Content-is-data is stated twice — for the definition under review and for fetched pages — and `eval-adversarial-ignore-instructions` is a real embedded-injection scenario with a detectable tell (the fixture's genuine defects go missing if the run obeys).
- **Eval methodology is exemplary against `H1`, `H5`, `H6`, `H8`, `H10`–`H13`.** Standard `evals/evals.json` schema with documented extension keys, per-scenario `baseline` hypotheses, an explicit `coverage_map` with a self-declared `uncovered` list, clean-context runs, grader independence, `timing.json` cost capture, and the drop-assertions-that-pass-in-both rule. All 15 fixture paths I checked exist.
- **`R12` and `R3`'s manifest cross-check pass.** Extracting groups `B`–`G` into `prompt-quality-criteria` is precisely the "criteria a consumer must score with itself are extracted regardless" case. Both declared dependencies in `plugin.json` are invoked, and both invocations are declared.
- **`R13` is fully satisfied for `prompt-quality-criteria`** (`SKILL.md:110-123`): plugin-scoped doubled name, mode stated, consumption stated, and an explicit fallback. It is the model the other invocation should follow.
- **`G1`/`G2` pass by holding no secrets** — correctly, with no over-engineered leak defenses.

## 3. Findings

### High

> **Finding 1 — `R13`, `A5`: the `writing-simplified-technical-english` invocation is ordered from a reference section, not from a numbered step, so a run that completes the progress checklist can skip `R7` grading silently.**
> `SKILL.md:38-43` carries the instruction ("Invoke it **in check mode** whenever you score prose"), but it sits in § Normative references. The 8-item progress checklist at `SKILL.md:51-61` has a dedicated line for the _other_ dependency — "3. Invoke the shared criteria for groups B–G" — and none for this one. Step 6 (`SKILL.md:192-231`) orders the scoring of "all nine groups" and never names the invocation. Step 7 item 6 (`SKILL.md:252-253`) then instructs the reviewer to report the seven ungraded conventions "When `writing-simplified-technical-english` was unavailable" — presupposing an invocation attempt that no step orders. A run that ticks all eight boxes therefore scores `R7` from `R8`–`R11` alone, grades seven of twelve conventions as nothing, and reports no gap. `R13` names this exact hazard: state the four things "in the step itself rather than in a separate section that would drift from it." The asymmetry with Step 3 is the evidence that the drift has already started.
> → Give the invocation its own numbered step (or fold it into Step 6 as an explicit ordered action) and add a matching line to the progress checklist. Keep the four `R13` elements that `SKILL.md:38-43` already states correctly — move them, do not rewrite them.

### Medium

> **Finding 2 — `A20`: the `model: opus` pin is load-bearing and its purpose is undocumented.**
> `SKILL.md:6` pins `opus`, `evals/evals.json` names `["opus"]` in all 16 scenarios, and Step 4 (`SKILL.md:170-172`) makes group `B` scoring depend on the pin — so the pin is load-bearing. No line in `SKILL.md` or `README.md` says why. This is the skill's own `A19` criterion turned on itself: "The default is `inherit`, so a pin needs a stated reason… All five real subagents pinned a model with no stated reason." Managed settings and org `availableModels` allowlists can override a skill's pin, so a run may land on a different model than the one the group `B` guidance assumes.
> → Add a one-line reason next to the pin or in `README.md`'s behavior notes (for example, that the two-pass sweep and severity calibration were tuned and evaluated on Opus 5), so a reader can tell a deliberate pin from a copied line.

> **Finding 3 — `A16`, `F2`, `R1`, `R3`: `allowed-tools` grants `Write`, which no instruction uses.**
> `SKILL.md:5` lists `Write`. Step 7 is titled "Write the gap analysis (**inline**)" and Step 8 applies fixes with surgical edits; no step writes a file. `Write` overwrites a whole file, so on a run that has already opened a subagent definition it is the one grant that can destroy the artifact under review, and `R3`'s manifest-versus-procedure cross-check calls a declared capability nothing uses dead weight. `Read`, `Edit`, `Bash`, `Grep`, `WebFetch`, and `Skill` all trace to instructions; `Glob` is unnamed but plausibly serves Step 1's recursive search.
> → Remove `Write` from `allowed-tools`.

> **Finding 4 — `R3`, `A10`: `SKILL.md` carries a second copy of rules `references/best-practices-checklist.md` owns, and the two copies have already diverged.**
> `SKILL.md:80-83` restates the duplicate-`name` resolution rule that the checklist states at lines 182-186. The checklist's version adds two facts the `SKILL.md` copy drops: that the same-tree case includes subfolders, and that `/doctor` reports the clash. This is observed drift, not predicted drift. The same pattern appears at `SKILL.md:117-119`, which restates qualifications for `F4` and `B4` while acknowledging in the same sentence that "the shared criteria file says so," and at `SKILL.md:207-213`, where the six deterministic lookups paraphrase `A12`, `A13`, `A14`, `A17`, `A18`, and `R6`.
> → In Step 1, reference the checklist's `A17` for the resolution rule instead of restating it; keep only the instruction ("When a duplicate `name` exists, report it"). Reduce Step 6's six bullets to the criterion keys plus the tool to settle them with, and drop the paraphrased rule text.

> **Finding 5 — `H7`: all 16 scenarios name `opus` only.**
> Every `"models"` value in `evals/evals.json` is `["opus"]`. Anthropic's authoring checklist asks for testing "with Haiku, Sonnet, and Opus," and the skill's own `H7` makes the sharper version of this argument for subagents: a pin overridable from outside means "tested on one model only is tested on a configuration the user can change." The same holds for a skill, since managed settings can override the pin.
> → Add at least one model to the highest-signal scenarios — `eval-clean-subagent` (does a smaller model invent findings?) and `eval-adversarial-ignore-instructions` (does the injection guard hold?) are the two where a model change is most likely to flip the result.

> **Finding 6 — `H5`, `H13`: the machine check for "report-only unless apply was chosen" can never fail.**
> `evals/evals.json:78` runs `git diff --quiet -- evals/files/` from the bundle root. But `how_to_run[0]` (line 15) instructs the grader to "Copy the scenario's definition files into a scratch workspace's `.claude/agents/`," so the run under test edits the scratch copy and never touches `evals/files/`. The check passes whether or not the reviewer wrote to the fixture, which is exactly the always-passes assertion `H13` says to remove or replace. A second, smaller inconsistency sits alongside it: the script greps `report.md` while `how_to_run[2]` saves output to `with_skill/outputs/`.
> → Point the check at the scratch workspace (a checksum of the copied fixtures before and after the run, or `git diff` inside a scratch repo), and reconcile the report path with `how_to_run`.

> **Finding 7 — `H3`, `H4`: three documented branches have no scenario, including the whole of Step 8.**
> The `coverage_map.uncovered` list (lines 52-61) is honest about uncovered _criteria_ but says nothing about uncovered _steps_, which is what `H3` grades. Step 8's interactive apply — behavioral forks, surgical edits, the never-reword-a-`description` rule, the eval-refresh rule — has no scenario; the universal assertion at line 28 only asserts that apply does _not_ happen. Step 2's failed-fetch branch, which must produce a staleness note, has none. Step 1's duplicate-`name` branch has none, and neither does a prompt naming a subagent that does not exist (`H4`'s absent-input case).
> → Add one apply-mode scenario (the `eval-capability-mismatch` fixture with "review and apply the fixes I approve" would exercise the fork-asking and surgical-edit rules), and extend `coverage_map.uncovered` to list uncovered steps alongside uncovered criteria.

> **Finding 8 — `H14`: the grading instructions never require evidence for a PASS.**
> `how_to_run[4]` (line 19) mandates a fresh grader and a different model; `grading.judgment_graded` (line 81) names what to grade. Neither requires the grader to record PASS or FAIL with a quotation from the actual output. The standard is explicit — "Don't give the benefit of the doubt" — and this skill's own `H14` states it as a criterion: "An opinion without a quotation is not a grade."
> → Add the evidence rule to `how_to_run` (or to `grading`), matching the `grading.json` shape the standard documents.

### Low

> **Finding 9 — `R7`, `A10`: four term-and-mechanics drifts across the bundle.**
> Graded with `writing-simplified-technical-english` in check mode against all twelve conventions. (a) Convention 9 — "the documentation" is _declared_ in `references/best-practices-checklist.md:5-6` to mean Claude Code's subagent pages, but `SKILL.md:44` uses it for every URL in both § Sources, including Anthropic engineering posts and `platform.claude.com`; one declared term now carries two meanings. (b) Convention 9 — "delegation prompt" (checklist line 114) and "delegation message" (lines 117, 120) name one concept. (c) Conventions 9 and 12 — "dry run" (line 64) versus "dry-run" (lines 141, 156). (d) Convention 1 — hidden actors in "so the checklist itself gets updated" (`SKILL.md:104`) and "so the documentation behind groups `B`–`G` gets fetched too" (line 93). One convention-5 miss also stands: `SKILL.md:23`'s "never assert a routing failure you cannot demonstrate" states no consequence. Conventions 2, 3, 4, 7, 8, 10, and 11 produced nothing worth reporting; the contractions at checklist lines 236-237 are inside a verbatim quotation and correctly excluded, as are the `name` and `description` fields.
> → Pick one term per concept; name the actor in the two passives; add the consequence to line 23.

> **Finding 10 — `B` (Opus 5): two instructions work against the model the skill pins.**
> (a) `SKILL.md:282` — "After each edit, re-read the changed span for correctness." The Opus 5 guidance says to remove re-check instructions the model already performs ("double-check your answer," "re-verify before responding"), and Claude Code's own harness guidance now tells the model not to re-read a file it just edited, since a failed edit errors. (b) The Opus 5 guidance says the model "delegates to subagents more readily than prior models" and that a prompt should cap or scope delegation; `SKILL.md` never says whether any part of the review may be delegated. A run that hands the definition read to a subagent gets a summary of a file this skill requires quoting exact lines from.
> → Delete the re-read instruction, or narrow it to the case a validator would catch. Add one sentence scoping delegation — the natural rule is that the reviewer reads the definition itself and may delegate nothing that produces a finding.

> **Finding 11 — `A1` (platform note): the name contains the reserved word `claude`.**
> `reviewing-claude-subagents` satisfies every open-standard rule — charset, 26 characters, no leading, trailing, or consecutive hyphens, and it matches the parent directory. But Anthropic's authoring doc lists `anthropic` and `claude` as reserved words a `name` "cannot contain," and names `claude-tools` as an example to avoid. Claude Code does not enforce this today (the skill loads), so the consequence is portability: the bundle may be rejected on upload as an Anthropic-platform skill. **Likely deliberate** — the sibling `reviewing-claude-skills` shares the pattern and the name carries the marketplace's identity.
> → No change needed if portability to the Anthropic platform is not a goal; worth a line in `README.md` if it is.

> **Finding 12 — `E2`, `C2`: only one of the report's six parts has a worked example.**
> `SKILL.md:258-268` gives an excellent input-to-output example for a finding. The per-group coverage table (Step 7 item 5) is described abstractly — "one row per group `A`–`H` and `R`, each with a status of `Pass`, `Gap`, or `N/A`, and the IDs of that group's findings" — with no skeleton, and "IDs" is undefined against a report whose findings are numbered `Finding 1`. Since `evals/evals.json`'s grading script greps the report for criterion keys, the table's exact column contents matter more than prose describes them.
> → Add a three-row table skeleton showing what goes in the ID column.

> **Finding 13 — `A14`, `A19`, `H5`: the machine-checkable grading script ships as a JSON string array, not as an executable file.**
> `evals/evals.json:66-79` holds 12 lines of bash, comments and all, that a grader must reassemble by hand before running. `H5` asks the eval set to _automate_ the machine-checkable half, and `A19` puts executable code in `scripts/`. The script itself is well-written — it resolves the sibling criteria file across two layouts and fails loudly rather than silently skipping `B`–`G`.
> → Move it to `scripts/check-report.sh` and reference the path from `evals/evals.json`.

> **Finding 14 — `C1`, `R9`: a group-`B` scoring rule sits at the end of the interview step.**
> `SKILL.md:170-172` ("Group `B` is conditional: apply only the subset matching the subagent's model… State which subset you used") closes Step 4, two steps before Step 6 does the scoring it governs. A run that works step by step reads it while asking scoping questions and acts on it after the fit-for-purpose grade.
> → Move it into Step 6 beside the other scoring instructions.

> **Finding 15 — `B1`: the 26-line brief is printed even when the user has pre-answered every scoping question.**
> `SKILL.md:159-160` says "Skip any the user has already answered," which covers the questions but not the brief that precedes them. On an invocation like "review X, use the defaults," the reviewer still prints a full brief that asks nothing — forced ceremony on a model whose narration already runs long.
> → Add a clause letting the brief compress to a sentence or two when the user pre-scoped the run.

> **Finding 16 — `A11`: a dated narrative sentence sits in the checklist body.**
> `references/best-practices-checklist.md:52-54` — "Between 2026-08-04 and 2026-08-06 the sub-agents page dropped its best-practices list, changed how a blocked model alias resolves, and added a flag that appends text to every subagent's system prompt." `A11` permits a dated `last-synced` metadata line (which the file has, at line 13) but not dated prose in the body, because a dated instruction goes quietly stale rather than failing loudly. **Likely deliberate** — it is the evidence for "Treat the `last-synced` date as load-bearing," and it will read as history rather than as guidance.
> → Optional: reframe as "the sub-agents page changed three normative rules within a single 48-hour window," which makes the same argument without the date.

## 4. Per-group coverage

| Group                              | Status | Findings                             |
| :--------------------------------- | :----- | :----------------------------------- |
| A — skill authoring                | Gap    | 3, 4, 11, 13, 16 (and 2, 12 in part) |
| B — model-specific (Opus 5 subset) | Gap    | 10, 15                               |
| C — general prompting              | Gap    | 12, 14                               |
| D — hallucination guardrails       | Pass   | —                                    |
| E — output consistency             | Gap    | 12                                   |
| F — injection & jailbreak defenses | Gap    | 3                                    |
| G — prompt-leak defenses           | Pass   | —                                    |
| H — success criteria & evals       | Gap    | 5, 6, 7, 8                           |
| R — craft & project conventions    | Gap    | 1, 3, 4, 9, 14                       |

`A20` carries Finding 2; `A15` scores `N/A` (no MCP tools); `R5` scores `N/A` (the skill authors no commits); `R6` scores `N/A` — the host project's `CLAUDE.md` defines behavioral guidelines but no skill-naming convention, and I did not invent one.

## 5. Criteria notes

- **The refresh succeeded and found no drift.** I fetched all four URLs in my checklist's § Sources and all but three in the shared criteria file's, and reconciled each against the baked criteria. Both criteria files carry `last-synced: 2026-07-29` and both are accurate as of today.
- **Three URLs went unfetched:** the standalone `prompting-claude-sonnet-5`, `prompting-claude-opus-4-8`, and `prompting-claude-fable-5` pages. Their model-specific sections are reproduced in `claude-prompting-best-practices`, which I did fetch, so the group `B` subsets are covered — but `D5` is sourced to the Fable 5 page specifically and I verified it only indirectly.
- **Group `B` subset used: Opus 5**, resolved from `SKILL.md:6`'s durable `opus` alias. Because Finding 10 is a group `B` finding: managed settings and org `availableModels` allowlists can override a model pin, so this skill should not depend on the quirks of exactly one model — which is also the substance of Findings 2 and 5.
- **Both dependency skills were available and invoked.** `prompt-quality-criteria` supplied groups `B`–`G`, cited with unchanged keys. `writing-simplified-technical-english` graded all twelve conventions in check mode, folded into `R7` as Finding 9. No group went ungraded.
- **The target's factual claims were spot-checked, not assumed.** I fetched `code.claude.com/docs/en/sub-agents` and verified `A12`, `A13`, `A14`, `A17`, `A18`, `A19`, `A24`, and `A26` against it. All hold, including the version gates (v2.1.178, v2.1.198, v2.1.210, v2.1.218, v2.1.219, v2.1.222). `README.md`'s criteria counts are also correct: 26 + 14 + 13 = 53, and the checklist's five `_Unexercised:_` notes match its stated count.
- **`A4` note, not a finding:** at 278 body lines and roughly 4.4k tokens (a four-chars-per-token estimate over 17.6 KB), `SKILL.md` is under both bounds but approaching the ~5000-token one. Finding 4's deletions would buy headroom.

---

You asked for analysis only, so I have changed nothing. Findings 1, 3, and 14 are one-line surgical fixes; Findings 2, 5, 8, and 16 are additions of a sentence or two; Finding 4 is the only one that touches more than a few lines. Say the word if you want me to apply any of them, one at a time.
