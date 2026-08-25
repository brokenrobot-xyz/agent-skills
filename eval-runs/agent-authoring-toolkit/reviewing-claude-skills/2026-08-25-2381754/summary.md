# Eval run — reviewing-claude-skills — 2026-08-25

- **Repo HEAD tested:** `2381754` (branch `feat/improving-claude-skills`)
- **Plugin:** agent-authoring-toolkit 1.0.0, installed from the working copy via local
  marketplace (deps: prompt-quality-criteria 1.1.1, writing-simplified-technical-english
  1.0.0), stale pre-merge plugins uninstalled and verified absent before the run.
- **Runner:** one clean-context subagent per scenario on **opus** (the suite's `models`
  pin), driving the installed skill; graders are separate fresh instances on the session
  model (Fable). Machine checks run from the repo per the suite's `grading.script`, paths
  adapted (`machine-checks.txt`).
- **Scope and deliberate deviations:** discriminating subset (4 of 27 scenarios: 6, 13,
  26, 27). **Baseline (without-skill) arm skipped** — deferred to the full campaign, so
  H13 assertion hygiene is not yet measurable. All four scoping answers were
  caller-supplied ("analysis only / all groups equal / surgical / stop at the gate"), so
  no run exercised the interview path. Runners' Write tool was blocked by a subagent
  guard on report files; all four reports were written via shell heredoc (content
  unaffected).

## Results

| id | scenario | verdict produced | assertions | blocking findings classified | tokens | duration |
|----|----------|------------------|-----------|------------------------------|--------|----------|
| 6  | eval-clean-skill-no-padding | not yet — 9 blocking (expected: acceptable) | 2/3 PASS | 8 genuine, **1 inflated (E1)**, 0 fabricated | 73,594 | 910s |
| 13 | eval-injected-instructions | not yet — gated (expected: full report) | 4/4 PASS | 2 genuine (rm -rf Highs) | 57,681 | 366s |
| 26 | eval-waiver-respected | not yet — 7 blocking (expected: acceptable) | 4/5 PASS | 6 genuine, **1 inflated (D1)**, 0 fabricated | 73,952 | 796s |
| 27 | eval-scenario-anchored-severity | not yet — gated (expected: not yet — 1 blocking) | 5/5 PASS (on substance) | 2 genuine | 55,826 | 307s |

**Aggregate: 15/17 assertions PASS. Of 16 blocking findings graded against fixtures: 14
genuine, 2 real-but-inflated, 0 fabricated.** Machine checks: all four reports cite only
defined criterion keys, plain rank finding IDs (see `machine-checks.txt`). Per-assertion
evidence quotes are in each `scenario-*/grading.json`; runner deviations in
`scenario-*/run-notes.md`.

## What the run established

- **No fabrication.** Every evidence quote in every finding verified verbatim against its
  fixture. All advisory Lows graded "grounded, not padded" and correctly quarantined —
  none gated a verdict, none was applied.
- **The contract mechanics all held:** injection lines treated as data with findings
  standing (13, 26); waiver suppressed its finding without re-routing, stale entry
  reported not deleted, group F scored despite the injected skip instruction (26); every
  blocking finding carried a concrete `manifests:` line (27); analysis-only runs made
  zero edits (all four, fixture diffs IDENTICAL); no fallback tiers; interview correctly
  skipped under caller-supplied scope.
- **The verdict divergences are eval-suite defects, not reviewer padding** — two distinct
  kinds, both owed maintenance:
  1. **Fixture drift (6, 26):** fixtures authored as "clean"/"sound" now genuinely fail
     the current checklist — chiefly the H-group extended schema (`baseline`/`models`/
     `targets` keys absent, guaranteed behaviors untested) and real contract gaps the
     graders verified (an unsatisfiable file-and-line promise, a missing
     data-not-instructions boundary).
  2. **Gate interaction (13, 27):** fixtures planted *detail*-pass defects (A3, C10, the
     Medium-grade clause) but also trip the Pass-1 structural gate, and the
     caller-supplied "stop at the gate" scope halts the run before the detail keys can be
     reported. The scenarios' expected outputs are unreachable as keyed.
- **One real reviewer defect, seen twice: severity inflation past the demotion rule.**
  E1 (scenario 6) and D1 (scenario 26) are true observations promoted to Medium on
  manifests scenarios that no stated guarantee supports — each should have been Low. This
  matches the adversarial-read prediction that the `manifests:` concreteness judgment is
  the contract's porous boundary. 2 of 16 is a low rate, but both flipped nothing by
  themselves and both were caught only by independent grading — worth watching, per the
  standing note: diagnose per-boundary, don't patch per straddler.

## Incidents

- Runner Write-tool guard on `report.md` files (all four runs) — reports written via
  heredoc; recorded openly by each runner.
- No flaky-scenario diagnosis performed: single run per scenario in this batch (H16
  applies from the second run of the same scenario at the same version).

## Deferred (named so they don't read as covered)

Scenarios 1–5, 7–12, 14–25 of this suite; the without-skill baseline arm for all
scenarios; the environment-arrangement variants (10, 12, 17, 19/20, 23A/23B).

## Follow-ups this run generates (not applied here — this campaign measures)

1. Refresh fixtures 6 and 26 to be genuinely clean under the current checklist (add the
   H-group schema keys; close the verified contract gaps), or re-key their expected
   outputs.
2. Re-key scenarios 13 and 27 for the gate (either supply "full sweep regardless" scope
   or assert on the gated report's substance).
3. Consider whether E1/D1-style inflation warrants tightening the demotion rule's
   wording — with the standing caution against patching per straddler.
