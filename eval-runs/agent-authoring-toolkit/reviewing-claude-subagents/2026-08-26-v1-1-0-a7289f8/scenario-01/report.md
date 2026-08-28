## Review: applying-migration-tasks — stopped at the structural gate

**Verdict: not yet — gated**

The definition is built around a conversation it cannot have. Its control flow pauses on ambiguity, shows a per-task diff, and presents options at a decision point — three interactions that only exist in the main thread, where the user can see and answer them. A subagent returns exactly one message to its parent, so each of those branches either collapses into a silent decision written to disk or an early exit that looks identical to a completed run. That is a fit-for-purpose failure (`A1`), not a wording problem, and it drags a second High with it: the body instructs actions the declared tools cannot perform (`A11`). Two Mediums sit underneath — a halt rule that contradicts the return contract (`A28`), and a tool grant, `Bash` included, well past what the remit's verbs need (`R1`). Because a redesign will replace the sentences these findings quote, the detail sweep was not run.

### Summary

| #   | Severity | Pass      | Key(s) | Finding                                                                                                 | Notes       |
| --- | -------- | --------- | ------ | ------------------------------------------------------------------------------------------------------- | ----------- |
| 1   | High     | Structure | A1     | The definition's shape is an interactive, steerable procedure — the one shape a subagent cannot deliver | inferential |
| 2   | High     | Structure | A11    | `pause`, `present the options`, and the per-task diff need a human channel the declared tools lack      | inferential |
| 3   | Medium   | Structure | A28    | "Stop at" is ambiguous between halting the traversal and skipping the task; the report contradicts it   | inferential |
| 4   | Medium   | Structure | R1     | The `tools` grant exceeds the remit — unrestricted `Bash` on an unattended repository editor            | inferential |

### What's already right

- **Clean roster position** (`A2`). The scope directory holds this definition alone, and the remit does not collide with the built-ins it competes with: `Explore` is read-only research, `Plan` produces plans rather than applying them, and this one applies an already-agreed plan. No routing contention to resolve.
- **The iteration is externally bounded** (`A28`). "Work through `migrations/plan.md` in order" ties the loop to a finite artifact rather than to an open-ended "keep fixing until", which is the right shape; only the halt rule inside the loop needs settling.
- **One subject, one job** (`R12`). Every instruction acts on the same plan file with the same criteria, so the split test says one artifact. Do not split this on the strength of Finding 1: the fix there is a change of form, not a second definition, and adding a sibling with an adjacent description would cost routing permanently.
- **A report shape is stated** (line 19), which gives a later detail pass something to sharpen rather than invent.

### Findings

#### Finding 1 — `A1`: the artifact does not earn the subagent form

- **Severity:** High · **Pass:** Structure · **Confidence:** high
- **Where:** `applying-migration-tasks.md:15` and `:17` (with the `description`, line 3)
- **Evidence:** "4. Show the diff you produced, and pause if the task's intent was ambiguous." and "Stop at any task marked **decision required** and present the options."
- **Defect:** The definition describes a procedure the user is meant to watch and steer step by step — per-task diffs, a pause on ambiguity, an options prompt on a decision point — which is the one shape a subagent cannot deliver, since only its final message reaches the parent and no intermediate step is visible or interruptible.
- **Manifests:** A parent delegates a 12-task plan in which task 3 is marked **decision required**. The subagent has no channel to present options mid-run, so it either halts after task 2 leaving the plan two-thirds unapplied, or picks an option itself and writes tasks 3–12 to disk. Either way the user first learns of the decision from the final report, after the edits are already on disk, and cannot tell from that report which of the two happened.
- **Fix:** Convert this to a skill. See the Redesign recommendation below.
- **Notes:** Inferential — this review reads the definition and never spawns the subagent, so the predicted behavior is not an observation.

#### Finding 2 — `A11`: the body instructs actions the declared tools cannot perform

- **Severity:** High · **Pass:** Structure · **Confidence:** high
- **Where:** `applying-migration-tasks.md:15` and `:17`
- **Evidence:** "pause if the task's intent was ambiguous" / "present the options"
- **Defect:** Three instructions in the body are unreachable through the declared tools: `pause`, `present the options`, and the per-task `Show the diff you produced` all require an interactive channel to a human, and Claude Code strips `AskUserQuestion` from every subagent, so the definition's stated behavior on its two most consequential branches cannot execute.
- **Manifests:** On the first plan task whose intent is ambiguous, the subagent looks for a way to pause and finds none in `Read, Edit, Write, Grep, Glob, Bash`; predicted behavior is that it either resolves the ambiguity silently and edits (its `Edit`/`Write` grant makes that the path of least resistance) or emits its final report early. The definition promises a pause the runtime cannot provide, and the parent has no way to distinguish "paused for you" from "decided for you".
- **Fix:** Remove the interactive verbs from the body and re-express those branches as return-contract entries: name a field in the final message (for example `deferred:` with task id, the reason it was deferred, and the options as data) and instruct the subagent to skip the task and continue rather than pause. Whether that field is enough depends on Finding 1's answer — if this becomes a skill, the pause is legitimate and no rewrite is needed; if it stays a subagent, every human-facing interaction has to become cargo in the one message that reaches the parent.
- **Notes:** Subordinate to Finding 1 — a conversion to a skill dissolves it. Inferential.

#### Finding 3 — `A28`: the halt rule contradicts the return contract

- **Severity:** Medium · **Pass:** Structure · **Confidence:** high
- **Where:** `applying-migration-tasks.md:17` and `:19`
- **Evidence:** "Stop at any task marked **decision required** and present the options." against "Report which tasks you completed, which you skipped, and where you deviated from the plan."
- **Defect:** The plan file bounds the iteration, but the one halt rule the body states is ambiguous in scope — "Stop at" reads either as "halt the whole traversal here" or "skip this task and continue" — and the return contract's "which you skipped" implies the second reading while the imperative implies the first, so the subagent cannot check its own stopping condition against evidence.
- **Manifests:** Two runs over the same plan, with a decision-required task at position 3 of 12, produce opposite results: run A halts and reports 9 tasks skipped with nothing applied after task 2; run B skips task 3 and applies tasks 4–12 to disk. Both reports are consistent with the body, so the parent cannot tell from the report whether the remaining tasks are unstarted or already written.
- **Fix:** State one checkable halt rule and make the return contract encode it. Either "halt the traversal at the first decision-required task; report every later task as unstarted" or "never halt; skip decision-required and ambiguous tasks, apply the rest, and list each skip with its reason" — and add the corresponding field (`halted-at:` or `skipped:`) to the report so the parent reads the stopping state instead of inferring it. This criterion would otherwise score `N/A` here: the plan file bounds the loop, so the finding is about the conflicting halt rule, not about a missing one, and no additional stopping condition should be added.
- **Notes:** Inferential.

#### Finding 4 — `R1`: the capability surface exceeds the remit

- **Severity:** Medium · **Pass:** Structure · **Confidence:** high
- **Where:** `applying-migration-tasks.md:4` (`tools` frontmatter field)
- **Evidence:** "tools: Read, Edit, Write, Grep, Glob, Bash"
- **Defect:** The capability surface exceeds the remit: no instruction in the body executes a command, yet the definition grants unrestricted `Bash` to an agent that runs unattended and edits the repository, and `Grep`/`Glob` are unused by a workflow that reads only "the files it names".
- **Manifests:** A plan task whose text reads "run the migration against the dev database" is inside the remit as the body states it ("Read the task and the files it names. Make the edit."), but `Bash` makes execution reachable, so the subagent runs the command. The parent sees the effect only in the final report, after the database has been touched — an action no line of the definition authorized and no review of the definition would predict from the body alone.
- **Fix:** Cut the grant to what the remit's verbs require: `Read` and `Edit` cover reading the named files, making the edit, and ticking the checkbox in `migrations/plan.md`; keep `Write` only if the plan can create new files, and drop `Grep`/`Glob` unless a body instruction actually searches. If the diff step needs `git diff`, note that `tools` cannot narrow `Bash`'s arguments — the two mechanisms that can are a `PreToolUse` hook in this definition's frontmatter (available here because this is a project-level, not plugin-shipped, definition, but skipped until the workspace is trusted) or a session-wide settings rule, which applies to the whole session rather than to this subagent alone. Prefer producing the diff from the `Edit` results over adding `Bash` back.
- **Notes:** Inferential.

### Advisory

None — Pass 1 returned no Low findings, and the detail sweep that would surface most Lows did not run.

### Redesign recommendation

**Make this a skill, not a subagent.** The deciding signal is the third one — the user wants to steer: the body's own control flow is built around pausing, showing a diff, and presenting options, all of which only work inside the main thread where the user sees and answers each step. The other two signals argue the same way: tool restriction is not the point (the grant is `Read, Edit, Write, Grep, Glob, Bash`, a full write surface), and the output is deliberately un-condensed — per-task diffs are the deliverable, not a distilled summary, so there is no parent-context saving to buy.

If a subagent form must be kept for some part of this, keep only the non-interactive half: apply the tasks that carry no decision and no ambiguity, and return the decision-required and ambiguous tasks as _data_ in the final message for the parent to resolve — then move the interactive traversal into a skill.

The move deletes Finding 2 outright (a skill may legitimately pause and ask), and it dissolves Finding 3's ambiguity, because a skill running in the main thread has no "halt versus skip" fork to resolve silently — it asks. Finding 4 survives the move in a different form: a skill inherits the session's tool surface, so the `Bash` exposure becomes a permissions question rather than a frontmatter one.

### Coverage

| Group / criterion              | Status                          |
| ------------------------------ | ------------------------------- |
| `A1` — artifact earns its form | Gap — Finding 1 (High)          |
| `A2` — no sibling duplication  | Pass                            |
| `A11` — instructions vs. tools | Gap — Finding 2 (High)          |
| `A28` — stopping condition     | Gap — Finding 3 (Medium)        |
| `R1` — simplicity first        | Gap — Finding 4 (Medium)        |
| `R12` — scope coherence        | Pass                            |
| A (non-structural criteria)    | not scored — gated on structure |
| B                              | not scored — gated on structure |
| C                              | not scored — gated on structure |
| D                              | not scored — gated on structure |
| E                              | not scored — gated on structure |
| F                              | not scored — gated on structure |
| G                              | not scored — gated on structure |
| H                              | not scored — gated on structure |
| R (non-structural criteria)    | not scored — gated on structure |

### Criteria notes

- Criteria last synced: 2026-08-07 (19 days ago) — the shared B–G file goes unread in a gated run, so it carries no date here.
- Scope: this was a non-interactive run and no scope was supplied by the invoking context, so the four defaults were assumed — analysis only (no apply), all groups weighted equally, surgical change appetite, and stop at the structural gate. The gate stopped this run on that fourth default.
- Plugin version exercised: the working copy of `agent-authoring-toolkit` at version 1.1.0. The plugin is not present in `~/.claude/plugins/installed_plugins.json`, so no stale installed cache competes with it.
- Pass 1 ran as the spawned plugin agent `subagent-structure-reviewer`; no stage ran inline or under substitution. Pass 2 was never spawned, by design of the gate.
- Every finding above is inferential: this review read the definition and never spawned the subagent, so it predicts behavior rather than observing it.

### Next step

Two choices, yours:

1. **Redesign first** — convert `applying-migration-tasks` to a skill along the lines above, then re-review the result. This is the recommended order, because the detail sweep's line-level findings would land on sentences the conversion rewrites or deletes.
2. **Sweep now anyway** — run the full detail sweep (groups A–H and R) against the definition as it stands, accepting that findings inside the sections Finding 1 implicates are subordinate to it and may not survive the redesign.
