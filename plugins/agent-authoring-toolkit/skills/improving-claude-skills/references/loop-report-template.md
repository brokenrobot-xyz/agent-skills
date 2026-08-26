# Loop ledger and final report templates

## Contents

- [The ledger](#the-ledger)
- [Final report](#final-report)

Text in `<angle brackets>` is a placeholder; everything else is literal structure. The dedupe
and exit rules live in each consuming loop's `SKILL.md`; this file owns the layout and the
status glossary. Two loops share it — `improving-claude-skills` and
`improving-claude-subagents` — so a layout change here changes both; for a subagent target,
read "skill" as "subagent" and "bundle" as "definition file".

## The ledger

Persisted as a structured file in the session's scratch directory — never inside the target
bundle, where it would become the next round's finding — and rendered inline after every review
round. The file is the source of truth the exit gate's set comparisons read; the inline table is
its rendering. One row per deduped finding;
the **Ledger key** is `criterion key + file + section` (`SKILL.md` Step 4 owns the dedupe rule
and its rationale).

```markdown
### Ledger — after round <r>

| Ledger key                  | Severity | First seen | Status     | Note                  |
| --------------------------- | -------- | ---------- | ---------- | --------------------- |
| R3 · SKILL.md · step 4      | Medium   | 1          | resolved   |                       |
| A2 · SKILL.md · frontmatter | Medium   | 1          | persisting |                       |
| C10 · SKILL.md · step 2     | Medium   | 2          | new        |                       |
| E1 · SKILL.md · step 5      | Medium   | 1          | contested  | oscillated rounds 1→3 |
```

The ledger holds blocking findings (High/Medium) only — advisory findings are never tracked or
applied; the final round's Advisory section is carried into the final report as-is. Statuses:
`new` (first appeared this round), `persisting` (reported again, unfixed or fix ineffective),
`resolved` (no longer reported), `contested` (resolved then reappeared — excluded from further
apply).

## Final report

```markdown
## Improvement loop: <skill> — <acceptable | not acceptable — plateaued | not acceptable — contested | not acceptable — re-gated | round cap reached>

<one-paragraph verdict, written as SKILL.md Step 8 directs — a plateaued or capped run names
the decision now owed by the human>

### Intent preservation

> <the confirmed intent brief, restated verbatim>

- <guarantee> — preserved, covered by <eval scenario in the target>
- <guarantee> — **drifted**: <how, and in which round>

### Rounds

| Round | High | Medium | Low | Gated | Fixed | New next round | Outcome                                    |
| ----- | ---- | ------ | --- | ----- | ----- | -------------- | ------------------------------------------ |
| 1     | <n>  | <n>    | <n> | <y/n> | <n>   | <n>            | <applied / gated → restructured / stopped> |

### Ledger

<the final ledger table, as above>

### Advisory (carried over)

<the last round's Advisory section, verbatim — the loop applied none of these; take or leave
them by hand>

### Contested findings

<omit this section when none. One block per contested key: the rounds it oscillated across, what
each direction of the fix looked like, and the framing for the human — either evidence of a
structural tension the skill's shape creates, or a reviewer false positive. The loop does not
arbitrate these; you do.>

### Round commits

| Round | Commit                    |
| ----- | ------------------------- |
| 1     | <hash> <one-line subject> |

<for a non-git target, replace the table with the backup path and a note that restore is
whole-run, not per-round>

### Run notes

<omit items with nothing to report: stages run inline under a fallback, stray-edit incidents and
their reverts, the round cap in effect if non-default>
```
