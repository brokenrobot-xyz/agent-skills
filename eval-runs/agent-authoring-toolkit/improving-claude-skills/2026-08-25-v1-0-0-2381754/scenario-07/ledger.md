# Improvement loop ledger — summarizing-minutes

Target bundle: `<workspace>/.claude/skills/summarizing-minutes`
Starting commit: 4789bbba8062c0b74f72c08684e7966a87e27cfa
Round cap: 4 review rounds (default), at most 3 apply rounds — all spent.
Round 1 commit: 3b4183f · Round 2 commit: 7832170 · Round 3 commit: c27bd89

Blocking findings only (High/Medium). Ledger key = criterion key + file + section.

### Ledger — after round 4 (final)

| Ledger key                                          | Severity | First seen | Status   | Note                                           |
| --------------------------------------------------- | -------- | ---------- | -------- | ---------------------------------------------- |
| F1 · SKILL.md · body (data boundary)                | High     | 1          | resolved | fixed round 1                                  |
| A8 · SKILL.md · write destination                   | Medium   | 1          | resolved | fixed round 1                                  |
| A9 · references/style.md · no example               | Medium   | 1          | resolved | fixed round 1                                  |
| R2 · SKILL.md · write target ambiguity              | Medium   | 1          | resolved | fixed round 1                                  |
| D1 · SKILL.md · missing owner/date                  | Medium   | 1          | resolved | fixed round 1                                  |
| C1 · SKILL.md · cut order                           | Medium   | 1          | resolved | fixed round 1                                  |
| C1 · SKILL.md · section collision                   | Medium   | 1          | resolved | fixed round 1                                  |
| H1 · evals/evals.json · set level                   | Medium   | 1          | resolved | fixed round 1                                  |
| H9 · evals/evals.json · scenario 1 inputs           | Medium   | 1          | resolved | fixed round 1                                  |
| A21 · SKILL.md · word-cap verification              | Medium   | 1          | resolved | wc -w measurement, round 2                     |
| H4 · evals/evals.json · scenario coverage           | Medium   | 1          | resolved | exists-but-empty scenario, round 2             |
| A8 · SKILL.md · word-count mechanism                | Medium   | 2          | resolved | fixed round 2                                  |
| A22 · SKILL.md · overwrite check                    | Medium   | 2          | resolved | new overwrite guard, round 2                   |
| R3 · evals/evals.json · eval 5 vs style.md          | Medium   | 2          | resolved | fixture reworded, round 2                      |
| H4 · evals/evals.json · eval 2 overflow vacuous     | Medium   | 2          | resolved | overflow fixture added, round 2                |
| C1 · references/style.md · precedence test          | Medium   | 2          | resolved | test 3 discriminator, round 3                  |
| R14 · SKILL.md · steps 2-5 phase interleaving       | Medium   | 3          | resolved | four-phase collapse, round 3                   |
| C1 · SKILL.md · fit loop exit                       | Medium   | 3          | resolved | tier-exhaustion exit, round 3                  |
| H3 · evals/evals.json · no completed-write scenario | Medium   | 3          | resolved | eval 13 added, round 3                         |
| R14 · SKILL.md · Compose/Fit chatter duplication    | Medium   | 4          | new      | UNFIXED — introduced by round 3's collapse     |
| R3 · SKILL.md · Compose/Fit chatter duplication     | Medium   | 4          | new      | UNFIXED — same defect, detail pass's key       |
| A8 · SKILL.md · Extract taxonomy omits Actions      | Medium   | 4          | new      | UNFIXED — latent since the original step 1     |
| R3 · SKILL.md · Extract taxonomy omits Actions      | Medium   | 4          | new      | UNFIXED — same defect, detail pass's key       |
| C1 · SKILL.md · Fit temp path vs tool grant         | Medium   | 4          | new      | UNFIXED — $TMPDIR unresolvable under the grant |

Round 1: High 1, Medium 10, Low 6. Gated no. Applied 11/11. 5 of round 2's findings were new.
Round 2: High 0, Medium 7, Low 15. Gated no. Applied 7/7 (+1 eval added by the loop at verify).
3 of round 3's findings were new.
Round 3: High 0, Medium 4, Low 12. Gated no. Applied 4/4. All 5 of round 4's findings were new.
Round 4: High 0, Medium 5, Low 13. Gated no. Not applied — round cap reached.

Blocking key set, round 3: {R14·steps2-5, C1·style-precedence, C1·fit-loop-exit,
H3·no-completed-write} — all resolved.
Blocking key set, round 4: {R14·chatter, R3·chatter, A8·extract-taxonomy, R3·extract-taxonomy,
C1·fit-temp-path} — all new.

Exit gate, checked in order against this file:

1. Acceptable — no, 5 unwaived blocking findings.
2. Plateaued — no, the round 3 and round 4 key sets share no member.
3. Contested-only — no, no key was ever resolved and then reported again.
4. Re-gated after a restructure — no, no round gated; the structure pass returned no High in
   any of the four rounds.
5. Round cap — YES. Four review rounds and three apply rounds are spent. Loop stops here.

Trend: 11 -> 7 -> 4 -> 5 blocking. Three rounds of real convergence, then a rebound made
entirely of defects the round 3 restructure introduced.
