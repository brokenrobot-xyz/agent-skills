# Eval run — reviewing-claude-skills — 2026-10-10 (scenario 16 re-run)

- **Repo HEAD tested:** `3fc2883` (branch `chore/claude-5-5-models`, clean tree)
- **Plugin:** agent-authoring-toolkit 1.2.0 (deps: prompt-quality-criteria 1.2.0,
  writing-simplified-technical-english 1.0.0), loaded from the working copy with `--plugin-dir`;
  the installed 1.1.x copies were disabled. Criteria `last-synced: 2026-10-09`.
- **Model:** runner on `opus` → claude-opus-5-5. Grader on `fable` → Fable 5.1 (H10).
- **Runner:** one clean-context subagent, the fixture copied into a scratch workspace's
  `.claude/skills/`, verbatim prompt, the same runner prompt as the 2026-10-09 run.
- **Purpose:** confirm the fix for the regression the 2026-10-09 campaign found
  (`../2026-10-09-v1-2-0-6edae7b/`, scenario 16, assertion 2). Commit `3fc2883` scoped B2 to
  instructions that try to change how much the model thinks, and added to B3 that a nudge scoped
  to a step that states its effort level "is the pattern this criterion asks for, not a `B2`
  finding".

## Scope and deliberate deviations

- **One scenario, one run:** 16. Nothing else changed between `6edae7b` and `3fc2883` except
  `prompt-criteria.md`'s B2 and B3 and the 2026-10-09 run record.
- **Baseline (without-skill) arm deferred**, as in the campaign.
- **Scope reply supplied by the operator as a simulated user:** `use the defaults` (this skill
  has no non-interactive rail; see the 2026-10-09 summary).
- **Artifacts are prettier-formatted** per the repo's format check (whitespace and Markdown
  syntax only). The `.jsonl` transcripts, which the check does not cover, hold the verbatim output.
- Nested reviewer transcripts are under `scenario-16/nested/`. The user's email address is
  redacted to `<user-email>`.

## Results

| id  | scenario                  | verdict produced     | assertions | blocking (genuine / inflated) | tokens | duration |
| --- | ------------------------- | -------------------- | ---------- | ----------------------------- | ------ | -------- |
| 16  | eval-blanket-tool-default | not yet — 6 blocking | 11/11      | 6 / 0                         | 68,181 | 270 s    |

Grader tokens: 87,743. Per-assertion evidence is in `scenario-16/grading.json`.

- **Assertion 2 — PASS** (FAIL at `6edae7b`). No finding at any severity keys B2 or B3 or calls
  the step-4 nudge a defect; the report credits it: "Step 4 scopes its tool nudge to a step that
  states its effort level, the B3 pattern, so the B2 carve-out applies (B2, B3)". The detail
  reviewer's transcript shows it read the post-fix text.
- **Advisory A20/C1 (Low)** — "no `effort:` field is set … Add `effort: low`, or reword step 4" —
  is a frontmatter-consistency note, not a flag on the nudge: both suggested fixes keep the
  nudge and its scope, and it cites neither B2 nor B3. It is the one remaining route by which the
  scoping clause draws comment.
- **The fix introduced no new problem.** All six blocking Mediums are genuine and none depends on
  a branch change. Two differ from the first run (an A8 Medium on the blanket "If in doubt" line,
  a C8 Medium on step 2); the grader judges them run-to-run variation independent of the fix.

## Machine checks

Every criterion key cited in the report resolves to a defined criterion. The scratch fixture is
byte-identical before and after the run (`machine-checks.txt`).

## Incidents

- The detail reviewer labelled B–G "scored (read from disk)". Whether its preload arrived was not
  checked for this run (the 2026-10-09 subagent campaign found the same label on a run whose
  preload did arrive); its transcript does show the post-fix criteria text was read.
- The report states the description length as 161 characters; it is 159.
- Write refused `report.md` inside the runner; a shell heredoc was used. No grade affected.
