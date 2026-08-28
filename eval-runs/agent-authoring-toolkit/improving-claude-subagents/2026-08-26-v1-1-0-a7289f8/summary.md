# Eval run — improving-claude-subagents — 2026-08-26

- **Repo HEAD tested:** `a7289f8` (branch `feat/improving-claude-subagents`, clean tree)
- **Plugin:** agent-authoring-toolkit 1.1.0, served live from the working copy by the
  `brokenrobot-xyz` marketplace, registered as a **directory** source pointing at this repo
  (deps: prompt-quality-criteria 1.1.1, writing-simplified-technical-english 1.0.0).
- **Runner:** one clean-context subagent per scenario on **opus** (every scenario's `models`
  pin), driving the installed skill in a scratch git workspace with the fixture committed.
  Graders are separate fresh instances on **Fable**. Machine checks run per workspace
  (`machine-checks.txt`).
- **First execution of this suite.** The skill and its 7 scenarios were authored on 2026-08-26
  and had never been run.

## Scope and deliberate deviations

- **Subset: 4 of 7 scenarios** — 1, 2, 3, 7. Deferred: 4 (round cap), 5 (dirty-tree abort),
  6 (reviewer-missing abort). 5 and 6 need environment arrangement; 4 is partly answered anyway,
  since two of the four runs reached the cap on their own.
- **Baseline (without-skill) arm skipped** for all four — deferred. The loop's value cannot yet
  be read as a delta.
- **Sibling scope narrowed by the harness** to each workspace's `.claude/agents/`, excluding
  `~/.claude/agents/` and the repo's plugin `agents/` directories.
- **The intent-brief confirmation was answered `confirmed, use the default cap`** and nothing
  else, per the suite's `how_to_run`. No run asked a second question — the one-question contract
  held in all four.
- **Runners ended their turns prematurely and were resumed by coordinator messages** — l02 once,
  l07 three times. This is a harness artifact of running the loop inside a subagent that cannot
  receive user input; it inflates l07's wall clock and nothing else. Graders were told to treat
  it as such and confirmed it changed no grade.
- **Only the runner transcript is committed per scenario.** The reviewer's two agents and the
  fix-applier ran as nested subagents whose transcripts were not bundled.
- Commits went to the workspace's `main`, per the skill's own instruction, departing from the
  usual branch-first convention. Noted by the l03 runner.

## Results

| id  | scenario                     | exit verdict                      | expected                        | rounds | commits | assertions | universal   | tokens  | duration |
| --- | ---------------------------- | --------------------------------- | ------------------------------- | ------ | ------- | ---------- | ----------- | ------- | -------- |
| 1   | eval-converges-two-rounds    | **round cap reached**             | acceptable, well before the cap | 4      | 3       | 3/6        | 7/7         | 183,122 | 3457 s   |
| 2   | eval-refit-exit              | **not acceptable — refit needed** | not acceptable — refit needed   | 1      | 0       | **5/5**    | 6/7 (1 N/A) | 73,803  | 383 s    |
| 3   | eval-single-file-restructure | **round cap reached**             | converges after a restructure   | 4      | 3       | 5/6        | 7/7         | 186,723 | 3470 s   |
| 7   | eval-sibling-untouched       | **not acceptable — plateaued**    | acceptable, sibling untouched   | 3      | 1       | 4/5        | 7/7         | 175,982 | 914 s    |

**Aggregate: 17/22 scenario assertions PASS; 27/29 universal assertions PASS.** Every stated
exit verdict was graded _correctly computed_ for what the rounds actually found — including both
cap exits. Total 619,630 tokens, 8,224 s of runner wall clock.

Machine checks: all pass. 7 apply commits across 4 runs, **every one touching only its target
definition file**; all four tracked trees clean at the end; l07's protected sibling byte-identical
to the fixture commit by empty diff. See `machine-checks.txt`.

## What the run established

- **Every rail that guards the user's files held, in all four runs.** No commit touched a path
  beyond the target. No `review-waivers.md` was written. No advisory finding was applied. No run
  authored a skill, hook file, or `CLAUDE.md` rule in the target's stead. Exactly one question
  was asked per run. Each apply round produced exactly one commit and a clean tree.
- **The refit exit — the behavior that distinguishes this loop from the skills loop — works.**
  Scenario 2 scored 5/5: round 1 gated on `A1` High recommending a skill, the loop stopped at
  exit-gate check 2 before any apply round, zero commits, target byte-identical, and the final
  report handed the conversion to the human with the recommended form and deciding signal
  verbatim.
- **The gated-round routing distinguishes shape fixes from form changes correctly.** Scenario 3
  gated on `A28`, correctly did _not_ fire the refit exit (Pass 1 returned `A1` as a strength),
  routed to a single-file restructure, and replaced the open-ended remit with two genuinely
  evidence-checkable stop clauses. Every later round passed the structural gate.
- **The file boundary holds even under temptation.** Scenario 7's `A2` overlap invites a
  symmetric fix across two files. The fix-applier declined it twice, with the reason recorded in
  the commit message, the ledger, and the run notes, and declined `A10`'s configuration half on
  the same grounds. The sibling was never written to — not modified, staged, deleted, or
  reverted.
- **Applied edits are real fixes, not rewording.** 6 of the 7 graded commits actually fix the
  finding they claim and preserve every intent-brief guarantee. The exception is l03's
  `7153d11`, graded `actually_fixes_it: false`.
- **Both cap-terminating runs still improved their targets.** This is churn-while-improving, not
  churn-while-degrading — a materially different failure from the loop damaging what it touches.

## The central defect: applier-minted churn, reproduced on two fixtures

Neither scenario 1 nor scenario 3 converged; both burned the full 4-round cap. The mechanism is
the same in both, and it is a **skill/criteria defect**, not an eval-suite artifact:

**Scenario 1.** Round 1 gated on a High `R1` that the suite authored as non-gating — a defensible
_Medium_-grade observation (unused `Read`/`Grep`/`Glob` grants) inflated to a gate. That skipped
the round-1 detail sweep and minted a frontmatter `PreToolUse` hook. Thereafter **9 of the 14
blocking findings in rounds 2–4 sat on text the loop's own appliers had written** — 3 of 7, then
4 of 4, then 2 of 3.

**Scenario 3.** The same in-frontmatter `PreToolUse` regex-hook remedy drove the same escalation,
though the diffs refine the runner's headline: round 2's five blockers were **all fixture-original**
(0 self-inflicted), round 3's were 1 of 2, and round 4's were **2 of 2**. Commit `7153d11` — the
hook — is the one applied edit graded as not actually fixing its finding.

The shared root is that **the criteria's recommended remedy for a prose-only guarantee is an
in-frontmatter `PreToolUse` regex hook, and a regex hook is itself reviewable surface**: each hook
invites findings about its own bypasses (`--output`/`-o`, newline/CR in l01), which the next round
reports, which the next applier patches. The loop converges only if the remedy is not itself a
finding generator.

A secondary contributor: **`A10·tools` in scenario 3 was claimed fixed in round 2, re-reported in
round 3, and re-fixed into the hook.** The grader's view is that it should have been routed to
**contested** and excluded from apply. The contested mechanism exists and did not catch it.

## Severity drift across rounds

Recorded because it recurs and is severity-independent of the exits it influenced:

| run | criterion               | drift                              | evidence changed             | disclosed by the report |
| --- | ----------------------- | ---------------------------------- | ---------------------------- | ----------------------- |
| l07 | `A2` · description      | Medium → High                      | **no**                       | yes                     |
| l01 | `C1` · § What to return | Low (advisory) → Medium (blocking) | **no**                       | yes                     |
| l03 | `A28` · How to work     | High → Low → strength              | yes (the restructure landed) | yes                     |

Two of the three moved on byte-identical evidence. In l01 the `C1` escalation helped defeat the
acceptable exit. In l07 the `A2` escalation gated rounds 2–3 but did **not** cause the plateau,
which is severity-independent. Every instance was disclosed by the report that made it — the
reviewer is candid about the drift, which is worth something, but the drift is a reviewer-side
skill defect.

## Incidents

- **The `Write` tool was blocked for report files** in every run (same subagent guard as the
  reviewer suite). Worked around by heredoc — except in l02, where the inverse happened: `Write`
  succeeded and a **Conventional-Commits hook rejected the heredoc**, misreading a Markdown
  heading as a commit subject. l07 and l03 hit the same hook and worked around it by chunked
  assembly and `printf`/`cp`. No content was altered.
- **A repo hook rejected the round-1 commit in l01 and l03** for an attribution trailer; the
  trailer was removed and the commit retried.
- **Subagent payloads tripped the instruction-shaped-content filter** in l07 (twice) and were
  treated as data.
- **Runners ended turns prematurely** (l02 ×1, l07 ×3) and were resumed by coordinator message.
  l07's 1,964 s self-reported elapsed is inflated by the round trips; the 914 s in the table is
  the harness-measured figure.
- **No flaky-scenario diagnosis performed:** one run per scenario. H16 applies from the second
  run of the same scenario at the same version.

## Deferred (named so they do not read as covered)

Scenarios 4, 5, and 6; the without-skill baseline arm for all scenarios; any second run for
flakiness diagnosis; the nested-agent transcripts.

## Follow-ups this run generates (not applied here — this campaign measures)

1. **Address applier-minted churn directly** — it is the reason two of four runs failed. Options
   worth weighing: forbid the applier from introducing new reviewable surface (hooks especially)
   in a round, treat a finding on loop-authored text differently from one on fixture text, or
   require the reviewer to distinguish the two. Reproduced on two fixtures, so it is not a
   per-fixture straddler.
2. **Reconsider the in-frontmatter `PreToolUse` regex hook as the criteria's recommended remedy**
   for an unenforced read-only guarantee. It is the specific move at the center of both failures,
   and one instance was graded as not actually fixing its finding.
3. **Tighten the contested route** so a finding claimed fixed, re-reported, and re-fixed is
   excluded from apply rather than re-applied (l03's `A10·tools`).
4. **Investigate the round-1 `R1` gate over-trigger in scenario 1** — a Medium-grade observation
   reaching High cost the run its detail sweep and started the churn. This is the reviewer's
   gate calibration, shared with the reviewing-claude-subagents suite's own findings.
5. **Require the fix-applier's what-moved-where map in the final report**, not only in the commit
   message (l03's sole assertion failure).
6. **Rescope universal assertion 1 to workspace paths.** As written it forbids any write outside
   the target definition file, which literally contradicts the ledger `SKILL.md` Step 4 mandates.
   The grader ruled the ledger exempt; the assertion's wording should say so.
7. **Re-key scenario 7's assertion 2**, which expects the target's description to be narrowed —
   a fix that would contradict the intent brief's own routing guarantee, leaving the loop caught
   between two of its rules.
8. Run scenarios 4, 5, 6 and the baseline arm before this suite's pass rate is read as a measure
   of the skill rather than of the model.
