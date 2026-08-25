# Report templates

## Contents

- [Full report](#full-report)
- [Gated report](#gated-report)

The layout of both report shapes. Text in `<angle brackets>` is a placeholder; everything else
is literal structure. The content rules — ranking, subordination, coverage semantics — live in
`SKILL.md` Step 7; this file owns only the layout. Ordering, both shapes: **Structure findings
first, then Detail; High → Medium within each — Lows are advisory and appear only in the
Advisory section.** The `#` column is the finding's rank number, and the detail blocks below
reuse the same numbers.

## Full report

```markdown
## Review: <skill> — <one-line verdict phrase>

**Verdict: acceptable** ← or → **Verdict: not yet — <N> blocking**

<one-paragraph overall assessment>

### Summary

| #   | Severity | Pass      | Key(s) | Finding              | Notes |
| --- | -------- | --------- | ------ | -------------------- | ----- |
| 1   | High     | Structure | R14    | <one-line statement> |       |
| 2   | Medium   | Structure | A17    | <one-line statement> |       |
| 3   | Medium   | Detail    | R3     | <one-line statement> |       |

Note the order: the Structure Medium outranks the Detail Medium, because the grouping comes
first and severity sorts only within a group. Lows never appear in this table — they are
advisory.

### What's already right

- <practice the skill follows> (<key>)
- …

### Findings

#### Finding <N> — `<KEY>`: <short title>

- **Severity:** <High|Medium> · **Pass:** <Structure|Detail> · **Confidence:** <high|low>
- **Where:** `<file>:<line or section>`
- **Evidence:** "<verbatim quote>"
- **Defect:** <one sentence>
- **Manifests:** <the concrete scenario where the defect bites>
- **Fix:** <concrete recommendation>
- **Notes:** <subordinate to Finding N / contested — omit this line when empty>

### Advisory

Listed once; advisory findings never gate the verdict.

- `<KEY>` · <file>:<section> — <one line>
- …

### Coverage

| Group | Status             | Findings |
| ----- | ------------------ | -------- |
| A     | <Pass / Gap / N/A> | <2, 5>   |
| …     |                    |          |
| R     |                    |          |

### Criteria notes

- Criteria last synced: <checklist date> (<N> days ago); shared B–G: <date> (<N> days ago)
- Waived: <N> (<keys>) — <M> stale <omit when zero>
- <ungraded groups, stages run inline, model-pin caveat — omit items with nothing to report>
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

**Verdict: not yet — gated**

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

| Group / criterion                 | Status                          |
| --------------------------------- | ------------------------------- |
| <each swept structural criterion> | <its status>                    |
| <every unswept group>             | not scored — gated on structure |

### Criteria notes

- Criteria last synced: <checklist date> (<N> days ago) — the shared B–G file goes unread in a
  gated run, so it carries no date here

### Next step

<the offer: run the detail sweep now anyway, or redesign first and re-review>
```
