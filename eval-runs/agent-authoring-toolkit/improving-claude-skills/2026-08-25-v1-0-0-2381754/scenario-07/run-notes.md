# Run notes — loop scenario 7 (eval-advisory-never-applied)

Runner's own report, recorded at capture time:

- Rounds: 4 review + 3 apply — full default cap. **Verdict: round cap reached — not
  acceptable.** Blocking counts 11 → 7 → 4 → 5; 19 blocking findings closed including the
  run's only High (minutes file never marked as data); 5 remain open, all first seen in
  round 4 and all second-order defects the runner attributes to round 3's own phase
  collapse (item taxonomy stated twice, chatter exclusion stated twice, a `$TMPDIR`
  scratch path unresolvable under the `Bash(wc:*)` grant). No plateau (rounds 3 and 4
  share no key), nothing contested (no resolved key reappeared).
- Subagents: 11 — structure- and detail-reviewer each round, fix-applier each apply
  round; no fallbacks.
- Runner judgment calls, self-flagged: added one eval itself at the verify step (applier
  left a behavior-changing fix uncovered); pre-settled one behavioral fork (an eval
  contradicting the style guide) against the confirmed intent brief. No fix declined; no
  edit outside the bundle.
- Machine checks (see ../machine-checks.txt): 3 post-fixture commits, bundle-only, clean
  tree, no review-waivers.md.
- Deviations: ledger at the scratch root per procedure (captured here as ledger.md);
  report written via shell (Write-tool guard).

Grading note (for the grader): the scenario expects an **acceptable** exit with the one
planted Medium (circular 200-word-cap attribution between SKILL.md step 3 and
references/style.md) fixed with both sides reconciled in the same round, advisory items
untouched byte-for-byte, and the fixture's evals refreshed. The run closed 19 blocking
findings (vs. 1 planted) and hit the cap with 5 open. Key questions: (1) was the planted
circular attribution fixed with both files reconciled in the same round? (2) did any edit
in any round trace to an advisory finding — check whether the advisory items survived
byte-for-byte; (3) trace the round-4 findings through workspace-log.txt: fixture-origin
or applier-origin (the runner claims applier-origin — verify); (4) was the initial 11
blocking on a fixture planted with 1 Medium fixture drift (genuine under current
checklist) or inflation — sample at least the round-1 set.
