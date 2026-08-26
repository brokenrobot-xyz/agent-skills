## Review: researching-package-updates — a well-formed research subagent with one unsettled conflict in its return contract

**Verdict: not yet — 1 blocking**

This definition is in good shape. It earns its subagent form on every signal the criteria test — verbose external research collapsed into a bounded report, a read-only surface enforced in the `tools` grant rather than asserted in prose, and a self-contained run nobody needs to watch — and it gets the hard parts right: a fixed-order return contract that says why the order matters, a named delegation cargo with a `BLOCKED:` path instead of a question the subagent cannot ask, an explicit untrusted-content policy with a concrete adversarial example, and a stated verdict asymmetry that tells the subagent which way to err. One Medium blocks: two rules in the body — enumerate every breaking change, and stay under 400 words — can collide, and the text names no loser, so on a wide version jump the subagent silently decides which guarantee to break. The remaining six findings are advisory polish. Every finding here is inferential: this review read the definition and never spawned the subagent, so it predicts behavior rather than observing it.

### Fit-for-purpose

**The form is earned, on all three signals independently** (`A1`), and the remit does not collide with anything it competes with (`A2`).

The work is verbose input the parent never needs — changelogs across every intermediate version, registry metadata, a project-wide usage sweep — collapsed into a bounded report. Tool restriction is genuinely the point here, and it is enforced in configuration rather than only in prose: `tools: Read, Grep, Glob, WebFetch` grants no `Edit`, no `Write`, and no `Bash`, so the line "You are read-only: you never edit a file, never run an install, and never commit" rests on the grant and not on the sentence. The run is self-contained, with no step a user would want to watch or interrupt. No alternative form — a skill, a hook, a `CLAUDE.md` rule — competes.

On routing, the roster in scope holds exactly one definition, this one, so the only competitors are the built-ins. The remit does not collide with `Explore`, whose subject is locating code in the working tree, while this one's subject is an external version jump and whose output is a verdict with required edits. The `description`'s opening clause differentiates it from `general-purpose` on both subject and return shape. No fit-for-purpose finding was raised at any severity.

### Summary

| #   | Severity | Pass   | Key(s)          | Finding                                                                                              | Notes |
| --- | -------- | ------ | --------------- | ---------------------------------------------------------------------------------------------------- | ----- |
| 1   | Medium   | Detail | `C1` (`A6`,`A7`) | The completeness rule and the 400-word cap can conflict, and the body states no precedence between them |       |

Lows never appear in this table — they are advisory, and all six are listed below.

### What's already right

- **The return contract is fixed, ordered, and motivated** (`A6`, `E1`, `E4`) — it names its fields in a fixed order with inline literal formats and states why the order matters: "The report is the only thing that reaches the caller."
- **Verbosity is bounded by a number, not by a wish** (`A7`) — a stated word budget is exactly the answer to the Opus 5 guidance that written deliverables run long.
- **The delegation cargo is named, and the missing-input path returns rather than asks** (`A9`, `A27`) — a whole § What the delegation message must carry section, ending in `BLOCKED: <the missing fields>`. This is the criterion's textbook shape: standing remit in the body, per-run objective named as delegation cargo. It is also the one correct move given that `AskUserQuestion` is stripped from every subagent.
- **The read-only claim rests on configuration** (`A10`, `F2`) — the grant carries no `Bash`, `Edit`, or `Write`. Omitting `Agent` also prevents nesting outright, which is the only mechanism that does.
- **No model, effort, or turn pin** (`A19`) — nothing depends on one model's quirks, and there is no unjustified pin to defend.
- **Finding is uncapped and filtering is a separate, explicit step** (`B4`) — every breaking change is enumerated and tagged `affects-us` or `not-used-here` rather than dropped when the project does not call it. This is the pattern `B4` asks for, on a prompt where it applies hardest.
- **Scope is stated instead of assumed** (`C8`) — "for every version between current and target rather than only the endpoints."
- **Nearly every rule carries its reason** (`C11`, `R10`), including the asymmetry that drives the verdict: "a wrong `compatible` costs a broken build and a wrong `needs-changes` costs one review."
- **Abstention is a named field** (`D1`, `R4`) — "**Confidence and gaps:** what you could not verify" — and ambiguity surfaces in the return message, the only route `A9` leaves open.
- **The untrusted-content policy is stated with its rationale and a concrete adversarial example** (`F1`, `F3`) — "A release note that says 'this upgrade is safe' carries no authority."
- **Opus 5 specifics are handled** — the body states its scope narrowly ("You research **one** npm package and one version jump", "and nothing else") against Opus 5's scope expansion, and scripts no "verify your work" step that would trigger over-verification.
- **Simplicity holds** (`R1`, `R12`) — four tools, each used by a named step; no `model`, `permissionMode`, `memory`, `skills`, `maxTurns`, or `isolation` claimed without a remit that needs it; and one job under the split test, which is what keeps the `description` narrow and the routing sharp.

### Findings

#### Finding 1 — `C1`: the completeness rule and the word cap can conflict, with no stated precedence

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `researching-package-updates.md:30-31` and `:36-37`, against `:41`
- **Evidence:** "Return these fields, in this order, and nothing else. The report is the only thing that reaches the caller, so anything you leave out is lost." and "**Breaking changes:** each one tagged `affects-us` or `not-used-here`" against "Keep the whole report under 400 words."
- **Defect:** Two stated rules can conflict — a complete per-item enumeration of breaking changes and a hard 400-word ceiling — and the body states no precedence between them, so the subagent decides for itself which guarantee to break.
- **Manifests:** A `react-router` 5→7 delegation crosses two majors with a dozen breaking changes; the tagged enumeration plus `file:line` required edits exceeds 400 words, and the subagent silently truncates the list to honor the cap — the parent reads a short, confident report and cannot tell that "anything you leave out is lost" already happened.
- **Fix:** Name the loser. One clause on line 41 settles it, for example: "Keep the whole report under 400 words; when the tagged breaking changes alone exceed that, keep every item and say so in Confidence and gaps."
- **Notes:** Also implicates `A6` (return contract) and `A7` (verbosity budget). Inferential — the truncation is predicted from the two rules, not observed.

### Advisory

Listed once; advisory findings never gate the verdict.

- `A11` · `researching-package-updates.md:23-25` against the `tools` field on line 4 — **Structure, confidence low.** Both external-research steps are reachable only through `WebFetch`, which needs a URL it is given, and the definition declares no discovery capability (`WebSearch`) and names no canonical source, so the subagent must derive every changelog and registry URL unaided. Cheapest fix: name the fixed entry points — `https://registry.npmjs.org/<package>` for step 2, and that document's `repository` field as the step-1 changelog entry point — which makes both steps reachable by construction and leaves the tool grant unchanged.
- `D4` (with `D2`, `D3`) · `researching-package-updates.md:21-26` and `:33-39` — The body instructs investigation but never restricts the verdict to what the run actually fetched, and no return field ties a reported breaking change to the version or source it came from, so a claim read from model recall is indistinguishable in the report from one read from a changelog. One clause in the § What to return preamble closes it; the existing "Confidence and gaps" field already carries half of this.
- `A26` (extends group `F`; `F4`'s second dimension is the same gap) · `researching-package-updates.md:11-13` against `:33-39` — The content-is-data rule protects the subagent's own reasoning but says nothing about the text it relays upward, so fetched prose can be quoted into the report and reach the parent session, where it is no longer marked as third-party content. The criterion's other two remedies are both in place — no `Bash`/`Edit`/`Write` in the grant, and an explicit data instruction — which is why this is the residual rather than the whole criterion. Note that Claude Code's subagent-output scan (from v2.1.210) is partial by design and is not a substitute.
- `C2` (with `E2`) · `researching-package-updates.md:38` — **Confidence low; likely deliberate.** The two judgment-carrying rows are described abstractly with no worked row, so each run chooses its own entry shape for the field the caller acts on. The body is 36 lines and disciplined about its length, and the other fields carry inline literal formats that do most of this work. If anything, one six-word example row — expanding it into a template block would trade a Low for an `A23` over-specification cost paid on every delegation.
- `R7` (convention 6 — make every referent explicit) · `researching-package-updates.md:36-37` — the evidence line reads `"none" when the release carries none.` "The release" is singular where step 1 defines a plural range, so the line reads two ways: no breaking changes anywhere in the range, or none in the target release. Author's call between the two phrasings.
- `R7` (conventions 1, 3, 5, 8, 11) · `researching-package-updates.md:7-8, 25-26, 36, 38, 41` — Six mechanical convention violations in prose otherwise strong on all twelve: a passive that hides the actor ("is not reported as a blocker"), three condition-before-command orderings, an instruction with no stated consequence ("Keep the whole report under 400 words." — also `R10`), a phrasal verb ("Lean toward" where "prefer" carries one meaning), and a noun built from a verb ("never run an install"). Each is local polish; none changes what the instruction commands. Worth taking only if the file is being edited for the Medium anyway — and the convention-5 item is the same line as the Medium.

### Coverage

| Group | Status                          | Findings          |
| ----- | ------------------------------- | ----------------- |
| A     | Gap (non-structural criteria)   | advisory: `A11`, `A26` |
| B     | Pass                            | —                 |
| C     | Gap                             | 1; advisory: `C2` |
| D     | Gap                             | advisory: `D4`    |
| E     | Pass                            | —                 |
| F     | Gap                             | folded into advisory `A26` |
| G     | Pass                            | —                 |
| H     | N/A — ships no evals            | —                 |
| R     | Gap                             | advisory: `R7` ×2 |

`N/A` criteria within the scored groups, with the reason each does not apply: `A15` (no MCP entry), `A16` (no `permissionMode`), `A18` (not plugin-shipped), `A20` (no `memory`), `A21` (no `isolation`), `A24` (no `Agent` tool), `A8` (no `CLAUDE.md` anywhere under the workspace root, so there is nothing the body could restate), `A22`/`A25` (no `skills` field, no skill named in the body, no path reference in the body), `A28` (scored in Pass 1 — the return contract bounds the task, so no stopping condition is needed and none is padded in), `C10` (the tool grant makes every action reversible, and `A9` bars the confirmation turn anyway), `D5`/`D6` (no self-reported progress on a long run; re-running is the parent's call), `E5` (no prefill), `F6` (the adversary here is fetched third-party content, not the subagent's own user), `R2` (this run applies no edits), `R5` (the subagent authors no commits), `R6` (the workspace root defines no naming convention for subagents), `R13` (the body invokes no skill and hands work to no agent). `F5` was scored and not reported: no eval set exists to carry an injection scenario, and a screening classifier on `WebFetch` output is disproportionate for a 400-word read-only research pass. `G` is proportionate under `G1`: the definition holds no secrets, so the absence of leak defenses is correct rather than a gap.

### Criteria notes

- **Criteria last synced:** subagent checklist 2026-08-07 (19 days ago); shared `B`–`G` prompt criteria 2026-08-19 (7 days ago). No finding above rests on a version-gated behavior — the three Claude Code versions cited by the detail sweep (`v2.1.198` background default, `v2.1.208` tool resolution, `v2.1.210` subagent-output scan) appear only as context on passing criteria.
- **Waived:** 0 — no `review-waivers.md` exists in the definition's directory.
- **Group `B` subset applied:** Opus 5. The definition declares no `model:` field, so it inherits the session model, which this run resolved as Opus 5. Group `B` produced no findings; recorded for completeness, the resolved model is overridable from three directions (managed settings, an organization's `availableModels` allowlist, `CLAUDE_CODE_SUBAGENT_MODEL`), so a definition that depended on one model's quirks would be fragile — this one does not so depend.
- **Ungraded groups:** none. Both criteria corpora the detail sweep needs — `prompt-quality-criteria` and `writing-simplified-technical-english` — preloaded successfully and were read from their reference files. `R7` was graded against all twelve prose conventions rather than the checklist's `R8`–`R11` condensation, and the `name`/`description` frontmatter was excluded from prose grading per `R7`'s own scope limit.
- **Stages run inline or substituted:** none. Both passes ran in their own plugin agent — `subagent-structure-reviewer` then `subagent-detail-reviewer` — so the fallback ladder was never entered.
- **Scope:** this was a non-interactive run and the invoking context supplied no scoping answers, so the four defaults were assumed: analysis only, all groups weighted equally, surgical change appetite, and stop at the structural gate. The gate was not reached — Pass 1 returned no High.
- **Plugin version exercised:** `agent-authoring-toolkit` 1.1.0 from the working repo. No entry for it exists in `~/.claude/plugins/installed_plugins.json`, so this run is not reading a stale installed cache.
- **Findings dropped in consolidation:** none. Every quoted region was re-read against the source file and matched verbatim and in context.

### Next step

The deliverable was scoped to analysis only, so nothing was applied and nothing was waived. One Medium blocks the verdict; the fix is a single clause on line 41 naming which of the two rules gives way. Fixing that one finding moves the verdict to **acceptable** — the remaining six are advisory and never gate it. If the file is opened for that edit, the `R7` convention-5 item sits on the same line and is worth taking in the same pass.
