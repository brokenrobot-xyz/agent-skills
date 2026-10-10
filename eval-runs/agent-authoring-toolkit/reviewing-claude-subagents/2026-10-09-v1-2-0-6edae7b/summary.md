# Eval run — reviewing-claude-subagents — 2026-10-09

- **Repo HEAD tested:** `6edae7b` (branch `chore/claude-5-5-models`, clean tree)
- **Plugin:** agent-authoring-toolkit 1.2.0 (deps: prompt-quality-criteria 1.2.0,
  writing-simplified-technical-english 1.0.0), loaded from the working copy with `--plugin-dir`;
  the installed 1.1.x copies were disabled. Criteria `last-synced: 2026-10-09`.
- **Model:** runners on `opus` → claude-opus-5-5, except scenario 13's sonnet arm (below).
  Graders on `fable` → Fable 5.1, never the model under test (H10).
- **Runner:** one clean-context subagent per scenario, fixtures copied into a scratch
  workspace's `.claude/agents/` (`review-waivers.md` beside the definition it waives), verbatim
  prompt. Machine checks from the repo root (`machine-checks.txt`).
- **Purpose:** first campaign after moving the toolkit to the Claude 5.5 generation and
  reconciling the subagent checklist with the current Claude Code docs.

## Scope and deliberate deviations

- **Subset: 5 of 22 scenarios** — 6, 7, 13, 15, 19 — chosen for what the branch changed:
  6 `TaskOutput` → `ScheduleWakeup` in the stripped-tool list; 7 the reworded A17; 13 the
  clean-subagent regression risk, both model arms; 15 shared criteria with the Opus 5.5
  inheritance; 19 the `haiku` pin and waiver verdict. Scenario 15 ran twice (below). **8 runs.**
- **Baseline (without-skill) arm deferred** again, so H13 assertion hygiene stays unmeasured.
- **No scoping answers were supplied** except in scenario 15's forced arm: Step 2's
  non-interactive rail fired and the four defaults were assumed and stated in each report.
- **Scenario 15 has a forced-sweep arm.** As on 2026-08-26, the verbatim run stops at the
  structural gate, making the B–G assertions unreachable. `scenario-15-gated` ran as written;
  `scenario-15-forced-sweep` supplied all four scope answers in the request, the last being "run
  the full detail sweep regardless, even if the structure pass finds a High".
- **The sonnet arm is not pure.** Scenario 13-sonnet's runner transcript has 19 responses on
  claude-sonnet-5-5 and 2 on claude-opus-5-5: the skill's `model: claude-opus-5-5` pin took
  effect only briefly inside the runner subagent.
- **Sibling scope was narrowed** to each workspace's `.claude/agents/`, as before, so A2 was
  scored against a near-empty roster.
- **Nested reviewer transcripts are committed** under each scenario's `nested/`, closing the gap
  the 2026-08-26 campaign recorded. The user's email address is redacted to `<user-email>`.
- **Artifacts are prettier-formatted** per the repo's format check (whitespace and Markdown
  syntax only). The `.jsonl` transcripts, which the check does not cover, hold the verbatim output.

## Results

| id  | scenario                             | model  | verdict produced      | expected                                | assertions                   | blocking (genuine / inflated) | tokens | duration |
| --- | ------------------------------------ | ------ | --------------------- | --------------------------------------- | ---------------------------- | ----------------------------- | ------ | -------- |
| 6   | eval-stripped-tool-listed            | opus   | not yet — 4 blocking  | A12 names all three tools + consequence | 11/12                        | 4 / 0                         | 61,486 | 202 s    |
| 7   | eval-name-contains-colon             | opus   | not yet — 5 blocking  | A17 High: colon, does not load          | 12/12                        | 4 / 1                         | 62,027 | 199 s    |
| 13  | eval-clean-subagent                  | opus   | not yet — 3 blocking  | acceptable                              | 12/14                        | 1 / 2                         | 66,437 | 232 s    |
| 13  | eval-clean-subagent                  | sonnet | not yet — 2 blocking  | acceptable                              | 12/14                        | 1 / 1                         | 58,627 | 264 s    |
| 15  | eval-shared-criteria-invoked (gated) | opus   | not yet — gated       | full report                             | 7/7 reachable, 8 unreachable | 2 / 0                         | 58,505 | 189 s    |
| 15  | ⤷ forced-sweep arm                   | opus   | not yet — 10 blocking | full report                             | 14/15                        | 9 / 1                         | 75,638 | 401 s    |
| 19  | eval-waiver-respected                | opus   | not yet — 5 blocking  | acceptable                              | 11/13                        | 2 / 3                         | 68,994 | 265 s    |

**Aggregate: 79 PASS, 8 FAIL, 8 UNREACHABLE over 7 graded runs. Blocking findings: 23 genuine,
8 inflated, 0 fabricated; none of the inflated ones depends on a criterion this branch added or
changed.** Runner tokens: 451,714. Grader tokens: 680,662. Per-assertion PASS/FAIL with quoted
evidence is in each scenario's `grading.json`.

FAILs, one line each with the grader's evidence:

- **6 / a3** — report.md:78 reads only "are unused by the remit and stripped from every subagent;
  remove them"; both review passes stated the consequence ("these three entries are dead
  configuration") and the orchestrator dropped it when merging R1 and A12.
- **13-opus / a1, a6** and **13-sonnet / a1, a6** — the control is not "acceptable". Both arms
  agree on the one genuine Medium (`risky` is an undefined verdict value) and both inflate a
  different borderline item (opus: A7, A26; sonnet: D3/D2) — the reviewer's pre-existing Medium/Low
  boundary, not a 5.5 regression.
- **15-forced / U3** — Finding 10's locator is "body (no length bound)", with no line or field.
- **19 / a4, U1** — the same two FAILs as 2026-08-26: the verdict is not "acceptable" (3 of 5
  blocking inflated, all present last campaign), and the waiver-integrity finding cites a section
  rather than a criterion key (the checklist mandates the finding but assigns none).

## What the branch changed, as measured

- **Validated.** A12's current stripped-tool list: the three tools named, `ScheduleWakeup`
  included (6). A17 reworded: the High states only what the current text supports and no removed
  version claim reappears (7). Group B for an Opus 5.5 pin: inherited Opus 5 paragraph, B6 cited,
  no other paragraph (15-forced). The new Haiku 5.5 paragraph and B6/B7 produced zero findings on
  the `haiku`-pinned waiver fixture (19). The `skills` preload delivers the shared criteria
  (15-forced, nested transcript lines 1–2).
- **No regression** attributable to the branch in this suite.

## Machine checks

Every criterion key cited in all seven reports resolves to a defined criterion in the checklist
or `prompt-criteria.md`. Every scratch fixture, `review-waivers.md` included, is byte-identical
before and after its run (`machine-checks.txt`).

## Incidents

- **Structure pass disagrees between scenario 15's arms on the identical fixture.** Gated: A1
  High + R12 High; forced: R1 High + A1 Medium. The grader's diagnosis: R12 vs R1 is an ambiguous
  criterion set — no structure-pass key owns "remit delegated to fetched content" (that is
  A26/F1 in Pass 2), so each run picks the nearest key; A1 Medium vs High is sampling variance on
  A1's permissive "can be a High", and the fixture supports High. Diagnosed, not averaged.
- **COVERAGE mislabel.** The forced sweep's detail reviewer reported B–G as "scored (read from
  disk)" although its preload arrived; the definition reserves that label for an announced
  failed preload, and the report relayed it.
- **Version and criteria-age reporting describe the installed copy, not the running one**, as in
  the reviewing-claude-skills run of the same date: scenario 19's report states the 1.1.1 cache's
  `last-synced: 2026-08-19` while its Haiku 5.5 resolution proves the 2026-10-09 copy was used.
- **Harness.** Write refused `report.md` inside several runners; heredocs used. One runner's Bash
  read of `installed_plugins.json` was denied. No grade affected.

## Follow-ups

1. Give the structure pass an owner for delegated-remit defects, and tighten A1's "can be a High".
2. Report-assembly: keep a merged finding's stated consequence (6); give the waiver-integrity
   finding a key (19); require a line or field in every locator (15).
3. Report the running copy's version and criteria age; fix the COVERAGE "read from disk" label.
4. Name the forced-sweep arm in scenario 15's record.
