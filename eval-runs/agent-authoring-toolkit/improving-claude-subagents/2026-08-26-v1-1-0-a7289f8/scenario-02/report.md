## Improvement loop: `applying-refactor-tasks` — not acceptable — refit needed

Round 1's review gated at the structural gate, and its redesign recommendation is a **different artifact form**, so the loop is terminal on its first review: the fix is not an edit to this definition file but the authoring of a new artifact in a new location, which is outside this loop's file boundary and is your decision, not the loop's. The reviewer's recommended form, verbatim: **"Convert this to a skill invoked in the main thread, and delete the subagent definition rather than keeping both (a retained twin re-competes for the same routing under `A2`)."** The deciding signal, verbatim: **"the user wants to see and steer each step, which is the checklist's own dividing line ('Use a skill when you want the procedure to play out inside the main thread so you can see and steer each step')."** The two supporting signals: the grant `Read, Grep, Glob, Edit, Write, Bash` restricts nothing, so tool restriction cannot justify delegation; and the work is not self-contained — every task boundary is a designed hand-back point. The second High (`A11`) is subordinate and dissolves under the same move: in a skill the pause becomes a real turn boundary, whereas no tool in a subagent's pool restores blocking semantics. Nothing was edited and nothing was committed — a refit exit fires before any apply round. The decision now owed by you is the conversion itself: author the skill and delete this definition, or, if a delegated form is genuinely wanted, author a _different_ artifact with a _different_ guarantee — an autonomous applier that drops "reviewable before the next task starts" and returns one consolidated diff — rather than rewording this one.

### Intent preservation

> **Job:** Apply one existing refactor task list to the codebase, task by task, in the order the list gives, so the whole refactor stays reviewable as it lands.
> **Guarantees:** works through the task list in order, one task at a time; shows each task's diff so the change is reviewable before the next task starts; pauses and describes ambiguity rather than silently choosing a reading; keeps its write-capable tool grant (`Read, Grep, Glob, Edit, Write, Bash`) because it edits code and runs tests; returns the ticked checklist, per-task diff summaries, and every ambiguity hit.
> **Non-goals:** authoring or planning the refactor, deciding whether to refactor, committing or pushing.

The target ships no evals, so each guarantee is cited to the definition line that carries it. The file is byte-identical to its starting commit, so no guarantee drifted _during_ the run:

- **In order, one task at a time** — preserved, carried by line 12 (`For each task, in order:`).
- **Shows each task's diff, reviewable before the next starts** — preserved _as text_ on line 14, but **flagged**: `A11` finds the "before moving on" half unreachable in the subagent form. This is the pre-existing defect the refit addresses, not drift introduced by the loop.
- **Pauses and describes ambiguity** — preserved _as text_ on lines 16–18, **flagged** for the same reason; the reading is still recorded in the return contract (lines 23–24), which is the half that does survive the form.
- **Write-capable tool grant** — preserved, line 4, untouched.
- **Returns ticked checklist, diff summaries, ambiguities** — preserved, lines 23–24.

Both flags are the reason for the refit, and both are resolved by the recommended form rather than by any edit inside the file.

### Rounds

| Round | High | Medium | Low | Gated | Fixed | New next round | Outcome                       |
| ----- | ---- | ------ | --- | ----- | ----- | -------------- | ----------------------------- |
| 1     | 2    | 0      | —   | y     | 0     | —              | gated → refit exit (terminal) |

Low is `—` because a gated run never reaches the detail sweep.

### Ledger

| Ledger key                                         | Severity | First seen | Status | Note                                                    |
| -------------------------------------------------- | -------- | ---------- | ------ | ------------------------------------------------------- |
| A1 · applying-refactor-tasks.md · whole definition | High     | 1          | new    | gated; redesign recommendation = convert to a **skill** |
| A11 · applying-refactor-tasks.md · body/tools      | High     | 1          | new    | subordinate to A1; no subagent tool restores blocking   |

### Advisory (carried over)

None. Round 1 gated at the structural gate, so the detail sweep that produces advisory findings never ran. If you keep the artifact as a subagent against the recommendation, re-review to get an advisory list.

### Contested findings

None.

### Round commits

No commits. The refit exit fires at the exit gate, before any apply round, so the definition file is unchanged at its starting commit `134e010 chore: install fixture subagent definitions`. Working tree verified clean.

### Run notes

- **Round cap:** default (4 review rounds), confirmed at kickoff. 1 of 4 used; the loop exited on a terminal condition, not the cap.
- **Waivers:** none exist, and none were written — this loop never writes `review-waivers.md`.
- No fallback substitutions, no stray-edit incidents, no declined fixes.
