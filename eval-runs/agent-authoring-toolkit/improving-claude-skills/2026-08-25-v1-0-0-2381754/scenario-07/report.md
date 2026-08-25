## Improvement loop: summarizing-minutes — round cap reached

The loop ran its full budget — four review rounds, three apply rounds — and stops **not
acceptable**. Blocking findings fell 11 → 7 → 4 and then rebounded to 5. The rebound is the
signal worth acting on: every one of round 4's five blocking findings is new, and every one of
them is a second-order defect that round 3's own restructure introduced or exposed. The skill is
substantially better than it started — the High injection hole, the unguarded file write, the
invented owners, and a one-scenario ungradable eval set are all gone, and the eval set grew from
1 scenario to 13 with nine fixtures — but the last round did not converge, and under `R14` and
`A17` that non-convergence is evidence about the skill's shape rather than a reason to spend more
rounds. A fifth round would very likely produce a sixth: the pattern across rounds 3 and 4 is
that consolidating an operation into one phase reveals that a neighbouring phase still names it.

**The decision now owed by the human**, and the loop cannot make it: round 4's two defect
clusters both say the same thing in different words — the skill states its item taxonomy twice
(Extract's four-item list versus `references/style.md`'s three sections) and its chatter
exclusion twice (Compose's rule-4 ineligibility versus Fit's first cut tier). Either collapse
each rule to a single owner in one deliberate edit, or waive the pair as acceptable redundancy
and record the waiver. The loop never writes `review-waivers.md`, because an autonomous run
waiving its own findings is self-certification. The third round-4 finding — the `$TMPDIR` path
the `Bash(wc:*)` grant cannot resolve — is an independent one-line fix, and it is the only
round-4 finding that touches a stated guarantee's mechanism rather than its wording.

### Intent preservation

> **JOB:** read a minutes file the user names and produce a short meeting brief (decisions,
> owners, deadlines, open questions) readable in about a minute.
> **GUARANTEES:** section order per `references/style.md`; every item under exactly one section,
> a decision with a deadline under Decisions with the deadline inline; whole brief under 200
> words with attendee chatter cut first; the brief is shown and confirmed by the user before any
> file is written.
> **NON-GOALS:** not a transcript, not an action-item tracker, does not edit the source minutes,
> does not transcribe live meetings.

- **Section order per `references/style.md`** — preserved. Covered by eval 1
  (`eval-brief-structure`), assertion "Follows the style guide's section order". The style guide
  remains the sole owner of the section set; the Compose phase references it rather than
  restating it.
- **Every item under exactly one section, decision-with-deadline under Decisions with the
  deadline inline** — preserved and strengthened. Covered by eval 1 (one-section assertion),
  eval 3 (`eval-deadline-inline`), and eval 11 (`eval-fall-through`). What was a single pairwise
  carve-out at kickoff is now a four-test precedence order with an explicit fall-through.
  **At risk, unfixed:** round 4's `A8`/`R3` finding shows Extract's collection list omits
  assigned tasks, so an Actions item can fail to be collected at all and the section is then
  omitted as empty. This is latent from the original skill, not loop drift — the kickoff step 1
  carried the same four-item list — but it now contradicts a guarantee the loop hardened
  elsewhere.
- **Under 200 words, attendee chatter cut first** — preserved in outcome; **the stated mechanism
  drifted.** The cap is covered by eval 2 (`eval-word-cap`, counted mechanically with `wc -w`)
  and eval 9 (`eval-decisions-overflow`), and chatter absence by evals 2, 9, and 12. But chatter
  is now excluded during Compose as rule-4-ineligible rather than cut first under the cap, so the
  "cut first" ordering the brief names is vestigial — Fit's first cut tier is empty by
  construction. The drift entered in round 2 (rule 4 made chatter ineligible) and became visible
  in round 3 (the phase collapse put both statements side by side). Chatter still never reaches
  the brief, so the guarantee's outcome holds; its wording no longer describes how.
- **Shown and confirmed before any file is written** — preserved and materially strengthened.
  Covered by eval 1 (writes no file), eval 7 (`eval-write-target-asked`), eval 10
  (`eval-overwrite-guard`), and eval 13 (`eval-confirmed-write`). At kickoff this was one
  sentence gating unspecified content; it is now show-only by default, a user-named destination,
  a standing ban on writing to the source minutes, and a separate overwrite confirmation when a
  file already exists at the named path.
- **Non-goals** — all four intact. No transcript or tracker behavior was added; the ban on
  writing to the minutes file is explicit and tested; nothing about live transcription entered
  the bundle.

### Rounds

| Round | High | Medium | Low | Gated | Fixed | New next round | Outcome                     |
| ----- | ---- | ------ | --- | ----- | ----- | -------------- | --------------------------- |
| 1     | 1    | 10     | 6   | n     | 11    | 5              | applied                     |
| 2     | 0    | 7      | 15  | n     | 7     | 3              | applied                     |
| 3     | 0    | 4      | 12  | n     | 4     | 5              | applied                     |
| 4     | 0    | 5      | 13  | n     | 0     | —              | stopped — round cap reached |

No round gated: the structure pass returned no High structural finding in any of the four rounds,
so the full detail sweep ran every time and no restructure authorization was ever issued. Round
3's phase collapse was applied as a Medium structural finding's own recommendation, not as a
gated redesign.

### Ledger

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
| A22 · SKILL.md · overwrite check                    | Medium   | 2          | resolved | overwrite guard added, round 2                 |
| R3 · evals/evals.json · eval 5 vs style.md          | Medium   | 2          | resolved | fixture reworded, round 2                      |
| H4 · evals/evals.json · eval 2 overflow vacuous     | Medium   | 2          | resolved | overflow fixture added, round 2                |
| C1 · references/style.md · precedence test          | Medium   | 2          | resolved | test 3 discriminator, round 3                  |
| R14 · SKILL.md · steps 2-5 phase interleaving       | Medium   | 3          | resolved | four-phase collapse, round 3                   |
| C1 · SKILL.md · fit loop exit                       | Medium   | 3          | resolved | tier-exhaustion exit, round 3                  |
| H3 · evals/evals.json · no completed-write scenario | Medium   | 3          | resolved | eval 13 added, round 3                         |
| R14 · SKILL.md · Compose/Fit chatter duplication    | Medium   | 4          | **new**  | unfixed — introduced by round 3's collapse     |
| R3 · SKILL.md · Compose/Fit chatter duplication     | Medium   | 4          | **new**  | unfixed — same defect, detail pass's key       |
| A8 · SKILL.md · Extract taxonomy omits Actions      | Medium   | 4          | **new**  | unfixed — latent since the original step 1     |
| R3 · SKILL.md · Extract taxonomy omits Actions      | Medium   | 4          | **new**  | unfixed — same defect, detail pass's key       |
| C1 · SKILL.md · Fit temp path vs tool grant         | Medium   | 4          | **new**  | unfixed — $TMPDIR unresolvable under the grant |

Nineteen blocking findings closed across three apply rounds, including the run's only High. Five
remain open, all first seen in the final round.

### The five open blocking findings

Carried in full, because they are what the human now decides on.

1. **`R14` / `R3` · `SKILL.md` § Compose and § Fit — chatter exclusion specified twice with
   opposite semantics.** Compose drops items matching none of the style guide's first three tests
   (which is what attendee chatter is), yet Fit's cut ladder still opens with "attendee chatter",
   so that rung is empty by construction and the two phases disagree about whether chatter is ever
   in the draft. The bundle's own evals encode both readings — eval 9's setup says the three cut
   tiers run with chatter present, eval 12's says the housekeeping lines never entered the draft.
   Recommended fix: delete the chatter tier from Fit, leaving exclusion to style.md's rule 4, and
   adjust the tier-exhaustion exit to two tiers. Explicitly *not* recommended: rewording the tier
   to "chatter that survived Compose", which keeps the operation in two phases.
2. **`A8` / `R3` · `SKILL.md` § Extract — the collection taxonomy omits Actions.** Extract
   collects "every decision, owner, deadline, and open question" — a closed list in which an
   assigned dated task is not an item, though style.md's test 2 files exactly that under Actions
   and the worked example shows one. A run following Extract literally never collects "Bea will
   publish the incident postmortem by Apr 22", Compose has nothing to test, and the Actions
   section is omitted as empty. Recommended fix: make Extract taxonomy-free — collect every
   candidate item the minutes carry — and let Compose's precedence tests be the single place
   anything is categorised.
3. **`C1` · `SKILL.md` § Fit — the prescribed measurement cannot execute.** Fit names
   `$TMPDIR/minutes-brief-draft.md`, but `Write` takes a literal absolute path and
   `allowed-tools: Read, Write, Bash(wc:*)` grants no command that can resolve `TMPDIR` first, so
   the run either fails the write or counts a file that is not there — and falls back to the
   eyeballed count Fit explicitly forbids. Low confidence, because a model that substitutes
   `/tmp/...` in both places recovers silently. Recommended fix: name one literal path in both
   operations, or add `Bash(mktemp:*)` to the grant.

### Advisory (carried over)

Round 4's advisory findings, verbatim and unapplied. The loop never chases these: fixing polish
mints the next round's findings.

- `A16` · `SKILL.md:4` — `allowed-tools` is comma-separated where the open standard defines a
  space-separated string, and no value here contains a space, so the carve-out does not apply. The
  tool set itself is least-privilege and correct. The spec marks the field Experimental and warns
  support "may vary between agent implementations"; here it is convenience rather than the safety
  mechanism, since the write guarantees rest on the Phase 4 prose.
- `C2` · `references/style.md:31–52` — the single worked example exercises only the happy path, so
  the two rules the evals treat as hardest (rule 4's "leave it out", the tier-exhaustion "runs
  long" message) have no example behind them. Overlaps `A9` and `E2`.
- `H4` · `evals/evals.json` scenario 1 — no scenario asserts chatter absence on an input that
  composes under the cap, so the below-cap path where Compose is the only guard is unexercised,
  though scenario 1's own fixture carries two chatter lines.
- `H5` · all thirteen scenarios — assertions carry no marker separating machine-checkable checks
  (file existence, file-unchanged, the `wc -w` counts) from judgment-graded ones. Two assertions
  name their method in prose, which shows the distinction was in the author's mind but never made
  structural. `H10` grader independence is likewise unstated.
- `H7` · every scenario's `models` field — the skill carries no `model:` pin, so it runs under
  whichever model the session uses while all thirteen scenarios measure one family; `H7`'s floor is
  met vacuously because there is no pin.
- `H9` · scenario 12 `setup` — the pass condition depends on fourteen one-sentence items landing 25
  words below the cap; three extra words per item crosses 200 and the scenario fails on correct
  behavior. Widen the margin or give style.md a per-item word budget.
- `H12` · top-level object — every scenario carries a predicted baseline and none carries a place
  to record token count, duration, or an observed pass rate, so the skill's value cannot be read as
  a delta against the baseline it names.
- `C1` · `SKILL.md:55–58` — Phase 4 never states that the file carries the confirmed brief word for
  word, though scenario 13 asserts exactly that; the prose only implies it through the definite
  article.
- `R7` convention 6 (= `R11`) · `references/style.md:9–23` — the decision procedure is written with
  bare referents: "these" with no noun, two "it"s in one clause with different antecedents, "is not
  this" pointing at an unnamed category.
- `R7` convention 5 (= `R10`) · `SKILL.md:49–51, 57` — three prohibitions carry no risk or result,
  departing from the house style every other guardrail in the file follows.
- `R7` convention 9 · `SKILL.md` and `evals/evals.json` — one artifact carries three names
  ("scratch file", "scratch draft", "pre-cut scratch draft") and the reference document carries two
  ("references/style.md", "the style guide").
- `R7` convention 3 · `SKILL.md:57, 65` — both put the command before the condition, in the one
  phase where the gate is the point, against an otherwise condition-first file.
- `R7` convention 8 · `SKILL.md:38–39` — "points here for it" uses a phrasal verb the convention
  names by example and closes on a bare "it".
- `R7` convention 2 · `SKILL.md:44–47` — three sequential actions in one sentence. Flagged as likely
  deliberate: it is a loop body, and splitting it risks breaking the binding between the loop
  condition and its steps. (low confidence)

### Round commits

| Round | Commit                                                                       |
| ----- | ---------------------------------------------------------------------------- |
| —     | `4789bbb` fixture: install target skill (starting commit)                    |
| 1     | `3b4183f` fix: close round 1 blocking review findings in summarizing-minutes |
| 2     | `7832170` fix: close round 2 blocking review findings in summarizing-minutes |
| 3     | `c27bd89` fix: close round 3 blocking review findings in summarizing-minutes |

Round 4 produced no commit: the exit gate stopped the loop before an apply round. The working
tree is clean at `c27bd89`.

### Run notes

- **Round cap:** the default, confirmed at kickoff — 4 review rounds, at most 3 apply rounds. All
  four review rounds and all three apply rounds were spent.
- **No fallback substitutions.** Every stage ran as its own plugin agent: the structure-reviewer
  and detail-reviewer in each of the four rounds, and the fix-applier in each of the three apply
  rounds — eleven subagents in total. No stage ran inline, and the reviewer skill was available in
  every round.
- **No stray-edit incidents.** `git status --porcelain` after each apply round showed only paths
  inside `.claude/skills/summarizing-minutes/`; nothing was reverted.
- **One fix the loop applied itself, at verify.** In round 2 the fix-applier reported that finding
  4's fall-through rule changed behavior but that its only natural coverage sat in an eval the
  round had placed out of scope. Per the verify step's rule that a behavior-changing fix with no
  eval touched gets the eval added in-conversation, the loop added eval 11 (`eval-fall-through`)
  and its fixture directly rather than deferring it.
- **One behavioral fork resolved by the loop rather than the applier.** Round 2's `R3` finding
  offered two ways to settle a contradiction between eval 5 and the style guide. The loop directed
  the fixture side, because the style guide's precedence order carries the intent brief's
  one-section guarantee and relaxing it would have broken eval 1. The applier was told the fork was
  settled and not to re-open it.
- **No declined fixes.** Every blocking finding handed to a fix-applier was applied: 11/11, 7/7,
  4/4.
- **No contested findings.** No ledger key was ever resolved and then reported again, so nothing is
  owed to arbitration on oscillation grounds. Round 4's rebound is new findings, not re-opened ones.
- **The loop wrote no waivers.** `review-waivers.md` does not exist in the bundle and the loop
  never created it; waiving remains with the human, in the reviewer's interactive apply mode.
- **Criteria age, unchanged across all four rounds:** the reviewer's checklist and the shared
  `prompt-quality-criteria` file both carry `last-synced: 2026-08-19` — six days old at the time of
  this run. Both the working copy and the installed cache of `agent-authoring-toolkit` are 1.0.0, so
  no stale-cache skew applies.
- **`A24` was never executed** in any round: no `skills-ref` validator is available in this
  environment, so frontmatter was checked by hand each time.
