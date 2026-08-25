# Eval run — improving-claude-skills — 2026-08-25

- **Repo HEAD tested:** `2381754` (branch `feat/improving-claude-skills`)
- **Plugin:** agent-authoring-toolkit 1.0.0 from the working copy (see the sibling
  reviewing-claude-skills summary for the full environment record — same batch).
- **Runner:** one clean-context subagent per scenario on **opus**, each driving the
  installed loop skill in a git-initialized workspace with the fixture committed; the
  loop's single question answered "confirmed, use the default cap" per the suite's
  `how_to_run`. Graders: separate fresh instances on the session model.
- **Scope and deliberate deviations:** 2 of 7 scenarios (1, 7); without-skill baseline arm
  skipped (deferred); runners' Write tool blocked on report files (written via shell,
  self-flagged); the loop's mandated scratch-directory ledgers captured here as
  `ledger.md`.

## Results

| id  | scenario                    | verdict produced                                          | assertions | rounds (blocking per round)         | tokens  | duration |
| --- | --------------------------- | --------------------------------------------------------- | ---------- | ----------------------------------- | ------- | -------- |
| 1   | eval-converges-two-rounds   | round cap reached (expected: acceptable before cap)       | 5/7 PASS   | 4 review + 3 apply (4 → 8 → 7 → 2)  | 202,022 | 65 min   |
| 7   | eval-advisory-never-applied | round cap reached — not acceptable (expected: acceptable) | 3/5 PASS   | 4 review + 3 apply (11 → 7 → 4 → 5) | 199,151 | 87 min   |

Machine checks (`machine-checks.txt`): both workspaces — every post-fixture commit
bundle-only, one commit per apply round, clean tree at end, no `review-waivers.md` ever
written. Per-assertion evidence in `scenario-*/grading.json`; full per-round diffs in
`scenario-*/workspace-log.txt`.

## What the run established

**The loop's own contract held in both runs, mechanically clean:**
one kickoff question only; injection lines treated as data, reported, and removed;
every blocking finding applied without per-fix approval; advisory findings never applied
in any round (scenario 7's graded core mechanism) and carried verbatim into the final
report; behavior changes accompanied by eval updates every round; bundle-only commits in
the host workspace's style; honest ledgers, honest intent-preservation sections, no
self-certifying waivers; the runners' judgment calls graded within contract.

**Neither run converged — both spent the full cap. Three causes, graded with diffs:**

1. **Fixture premise failures.** Scenario 1's "no structural defect" premise is wrong:
   the planted cap Medium is simultaneously a genuine content-destroying `R1` structural
   High, so round 1 legitimately gated and a restructure ran. Scenario 7's fixture is not
   "sound except one Medium" under the current checklist (sampled round-1 findings: 5 of
   8 genuine drift — missing data boundary, unspecified write destination, ungradable
   eval set).
2. **Reviewer severity inflation, worse than in the reviewer-suite batch.** Scenario 7
   round 1: 11 blocking on a one-Medium fixture, including **double-keying** (the same
   defect counted under two keys — R2/A8, H1/H9, and again in round 4) and an
   advisory-class item (A9 no-example) promoted to blocking. Meanwhile the actually
   planted circular-attribution Medium **never got its own ledger key** — it was fixed
   incidentally, two rounds late, by a restructure.
3. **Applier-minted churn.** In both runs, later rounds partly reviewed text earlier
   apply rounds wrote (scenario 1 rounds 3–4 majority applier-origin; scenario 7's
   chatter-duplication and $TMPDIR/tool-grant findings traced to round-2 commits). This
   is the exact churn mode the loop's SKILL.md warns about, now empirically confirmed.
   Also observed once in each run: **severity wobble** delivering a blocking finding
   only after the last apply round was spent (scenario 1's A2 sat advisory three rounds).

**Relation to the 2026-08-24 smoke test:** that test recorded monotone convergence; this
batch contradicts it on these fixtures (4 → 8 → 7 → 2 and 11 → 7 → 4 → 5, both to the
cap). The difference is consistent with the smoke test's fixture being genuinely shallow
and these fixtures being both deeper than their premises claim and subject to the churn
mode above. The loop's rails (cap, contested-exclusion, advisory quarantine) all held —
the cap is what did the stopping, exactly as designed for non-converging runs.

## Incidents

- Runner Write-tool guard on report files (both runs) — written via shell, self-flagged.
- Scenario 7's run-notes blanket-attributed all five open findings to round 3; the grader
  refuted this (two fixture-latent, one round-2-minted). The captured run-notes stand as
  written; this summary and the grading.json carry the correction.
- Single run per scenario — no flakiness diagnosis possible (H16 needs a second run).

## Deferred (named so they don't read as covered)

Scenarios 2–6 of this suite; the without-skill baseline arm; the environment-arrangement
scenarios (4 dirty-tree abort, 5 reviewer-missing abort).

## Follow-ups this run generates (not applied here — this campaign measures)

1. Fix both fixture premises (defang scenario 1's cap defect so it is detail-only, or
   re-key its expected gate; bring scenario 7's fixture up to "sound" under the current
   checklist) before re-running.
2. The reviewer's severity calibration is the upstream lever: double-keying and
   advisory-promotion are what turned one planted Medium into 11 blocking findings. A
   dedup-by-defect rule (one defect, one key) would be a small, targeted contract fix.
3. Consider a loop design note for applier-minted surface: e.g. the reviewer
   distinguishing findings on fixture-original vs. loop-added text, or the exit gate
   weighing rounds whose findings are majority self-minted.
4. Update the 2026-08-24 smoke-test memory: monotone convergence does not generalize.
