# Run notes — scenario 27 (eval-scenario-anchored-severity)

Runner's own report, recorded at capture time:

- Subagents spawned: one — `agent-authoring-toolkit:structure-reviewer` (Pass 1), resolved
  normally, no fallback tier. `detail-reviewer` never spawned: the run stopped at the
  structural gate, as the supplied scope directed.
- Scoping questions asked: none — all four answers were caller-supplied, and the report's
  Criteria notes record the supplied scope.
- Deviation: the runner's Write tool refused to create the report file (subagent guard);
  the report was written via shell heredoc instead, content unchanged.
- Outcome: **gated** — `Verdict: not yet — gated` on one High (`A8`: step 2 names three
  secret categories but supplies no patterns, and folds an unbounded "anything that looks
  sensitive" judgment clause into the same step) plus one Medium (`A22`: no validation
  between writing the `.redacted` file and declaring success). Seven structural strengths
  recorded.

Grading note (for the grader, not a grade): the scenario's `expected_output` anticipated a
Pass 2 detail report ("not yet — 1 blocking" with a Manifests-carrying Medium and prose
candidates in Advisory). The run instead gated at Pass 1 — the structure-reviewer caught
the planted "anything that looks sensitive" clause as a structural `A8` High before the
detail pass could grade it Medium. Whether that counts as pass, fail, or an eval-design
incident (fixture carries an ungraded structural defect) is the grader's call to make with
evidence.
