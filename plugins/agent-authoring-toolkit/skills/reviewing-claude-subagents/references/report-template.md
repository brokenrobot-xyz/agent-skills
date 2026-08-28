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
## Review: <subagent> — <one-line verdict phrase>

**Verdict: acceptable** ← or → **Verdict: not yet — <N> blocking**

<one-paragraph overall assessment>

### Fit-for-purpose

<the A1/A2 verdict from Pass 1, stated before the ranked list because it frames every finding
after it — when the answer is "this should be a skill", the run gated instead and the gated
shape below applies; here, state why the form holds, or carry the Medium/Low fit findings' rank
numbers>

### Summary

| #   | Severity | Pass      | Key(s) | Finding              | Notes |
| --- | -------- | --------- | ------ | -------------------- | ----- |
| 1   | High     | Structure | A28    | <one-line statement> |       |
| 2   | Medium   | Structure | A2     | <one-line statement> |       |
| 3   | Medium   | Detail    | A6     | <one-line statement> |       |

Note the order: the Structure Medium outranks the Detail Medium, because the grouping comes
first and severity sorts only within a group. Lows never appear in this table — they are
advisory.

### What's already right

- <practice the subagent follows> (<key>)
- …

### Findings

#### Finding <N> — `<KEY>`: <short title>

- **Severity:** <High|Medium> · **Pass:** <Structure|Detail> · **Confidence:** <high|low>
- **Where:** `<file>:<line or frontmatter field>`
- **Evidence:** "<verbatim quote>"
- **Defect:** <one sentence>
- **Manifests:** <the concrete scenario where the defect bites>
- **Fix:** <concrete recommendation>
- **Notes:** <subordinate to Finding N / inferential — omit this line when empty>

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
- Group B subset applied: <model>
- <ungraded groups, H ships-no-evals note, stages run inline, model-pin caveat — omit items
  with nothing to report>
```

Worked example of one finding block, from a target whose frontmatter reads
`tools: Read, Grep, Glob` while its body says `Use the testing-visual-regression skill for the
full procedure.`:

```markdown
#### Finding 2 — `A11`: the body instructs an action the declared tools cannot perform

- **Severity:** High · **Pass:** Structure · **Confidence:** high
- **Where:** `checking-screenshots.md:14`
- **Evidence:** "Use the testing-visual-regression skill for the full procedure."
- **Defect:** The body names a skill while `tools` grants no `Skill`, so the instruction cannot be followed.
- **Manifests:** A delegation reaches step 2, the Skill call fails silently, and the subagent improvises the procedure from memory.
- **Fix:** Add `Skill` to `tools`, or inline the procedure the skill carries.
```

## Gated report

```markdown
## Review: <subagent> — stopped at the structural gate

**Verdict: not yet — gated**

<one-paragraph structural verdict>

### Summary

| #   | Severity | Pass      | Key(s) | Finding              | Notes |
| --- | -------- | --------- | ------ | -------------------- | ----- |
| 1   | High     | Structure | A1     | <one-line statement> |       |

### What's already right

- <structural strengths a redesign should keep>

### Findings

<the same per-finding block format as the full report>

### Redesign recommendation

<the concrete move: the alternative form — a skill, a hook, a CLAUDE.md rule — with the signal
that decided it, or the merged remit, the aligned capability surface, the checkable stopping
condition — and what the move deletes>

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
