# Report templates

## Contents

- [Full report](#full-report)
- [Gated report](#gated-report)

The layout of both report shapes. Text in `<angle brackets>` is a placeholder; everything else
is literal structure. The content rules — ranking, subordination, coverage semantics — live in
`SKILL.md` Step 7; this file owns only the layout. Ordering, both shapes: **Structure findings
first, then Detail; High → Medium → Low within each.** The `#` column is the finding's rank
number, and the detail blocks below reuse the same numbers.

## Full report

```markdown
## Review: <skill> — <one-line verdict phrase>

<one-paragraph overall assessment>

### Summary

| #   | Severity | Pass      | Key(s) | Finding                        | Notes                |
| --- | -------- | --------- | ------ | ------------------------------ | -------------------- |
| 1   | High     | Structure | R14    | <one-line statement>           |                      |
| 2   | Low      | Structure | A17    | <one-line statement>           | likely deliberate    |
| 3   | Medium   | Detail    | R3     | <one-line statement>           |                      |

Note the order: the Structure Low outranks the Detail Medium, because the grouping comes first
and severity sorts only within a group.

### What's already right

- <practice the skill follows> (<key>)
- …

### Findings

#### Finding <N> — `<KEY>`: <short title>

- **Severity:** <High|Medium|Low> · **Pass:** <Structure|Detail> · **Confidence:** <high|low>
- **Where:** `<file>:<line or section>`
- **Evidence:** "<verbatim quote>"
- **Defect:** <one sentence>
- **Fix:** <concrete recommendation>
- **Notes:** <likely deliberate / subordinate to Finding N / contested — omit this line when empty>

### Coverage

| Group | Status         | Findings |
| ----- | -------------- | -------- |
| A     | <Pass|Gap|N/A> | <2, 5>   |
| …     |                |          |
| R     |                |          |

### Criteria notes

- <drift notes, staleness caveats, ungraded groups, stages run inline, model-pin caveat —
  omit items with nothing to report>
```

Worked example of one finding block, from a target whose `evals/evals.json` says
`"grading": "Score each assertion as a rubric — manual / self-scored."`:

```markdown
#### Finding 3 — `H10`: evals permit the run under test to grade itself

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `evals/evals.json:12`
- **Evidence:** "manual / self-scored"
- **Defect:** The same instance may produce and grade the output, which H10 rules out as evidence.
- **Fix:** Name the grader: a fresh instance or the human, never the run under test.
```

## Gated report

```markdown
## Review: <skill> — stopped at the structural gate

<one-paragraph structural verdict>

### Summary

| #   | Severity | Pass      | Key(s) | Finding              | Notes |
| --- | -------- | --------- | ------ | -------------------- | ----- |
| 1   | High     | Structure | R14    | <one-line statement> |       |

### What's already right

- <structural strengths a redesign should keep>

### Findings

<the same per-finding block format as the full report>

### Redesign recommendation

<the concrete collapse: fewer phases, a knob hardcoded, a computed decision moved to the
user — and what the collapse deletes>

### Coverage

| Group | Status                            |
| ----- | --------------------------------- |
| <swept structural criteria>: their status  |
| <every unswept group>: not scored — gated on structure |

### Next step

<the offer: run the detail sweep now anyway, or redesign first and re-review; note the
criteria refresh has not run>
```
