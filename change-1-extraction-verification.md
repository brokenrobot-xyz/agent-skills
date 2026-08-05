# Change 1 verification record — extracting `prompt-quality-criteria`

**Change:** groups `B`–`G` moved out of `reviewing-claude-skills/references/best-practices-checklist.md`
into the new `prompt-quality-criteria` plugin.
**Date:** 2026-08-05.
**Specification:** [`reviewing-claude-subagents-brief.md`](reviewing-claude-subagents-brief.md) § 6.
**Status:** complete. This file is the evidence, kept until Change 2 lands.

## Why this record exists

The brief's verification step is a before/after run of `reviewing-claude-skills`' eval suite, and
risk `R4` says do not weaken that control. The suite is LLM-graded and has no runner in this
repository, so the agreed substitute is a **mechanical equivalence proof**: show that the extraction
changed the location of the criteria and nothing else. A proof by comparison only holds if every
difference is enumerated in advance, which is what the tables below do.

## Contents

- [What was verified](#what-was-verified)
- [The lexical substitution](#the-lexical-substitution)
- [The eight reference resolutions](#the-eight-reference-resolutions)
- [Changes outside the moved text](#changes-outside-the-moved-text)
- [Reproducing the proof](#reproducing-the-proof)
- [What this proof does not cover](#what-this-proof-does-not-cover)

## What was verified

| Claim                                             | Method                                                              | Result                      |
| :------------------------------------------------ | :------------------------------------------------------------------ | :-------------------------- |
| The removal took exactly the `B`–`G` slice        | `diff` of the deleted lines against the pre-edit slice              | identical                   |
| No criterion was lost or gained across the split  | key inventory before vs. union of both files after                  | 77 = 77, identical set      |
| No criterion's meaning changed                    | word-level `diff` of the moved text, every difference accounted for | 27 lexical + 8 resolutions  |
| Every per-model paragraph and carve-out survived  | presence count for each, before vs. after                           | 6 of 6 present              |
| `B`–`G` keys still resolve for the grading script | updated two-file lookup run against a synthetic report              | resolves real, catches fake |
| Manifests and formatting stay valid               | `format:check`, `marketplace:check`, `plugins:check`, `test`        | all pass                    |

## The lexical substitution

The rubric had to stop saying "skill", because a subagent definition is not one. The pass was purely
lexical — 27 tokens, a strict 1:1 swap with no sentence restructured:

| Original  | Replacement | Count |
| :-------- | :---------- | ----: |
| `skill`   | `prompt`    |    22 |
| `skill's` | `prompt's`  |     3 |
| `skills`  | `prompts`   |     2 |

`prompt-criteria.md` defines the term once, so every substituted sentence still reads correctly:
"the artifact under review — a skill's `SKILL.md` body, a subagent definition's body, or any
Markdown that becomes instructions for Claude."

The word `subagents` was **not** substituted where it describes model behaviour ("delegates to
subagents readily", "dispatches parallel subagents"). Those sentences are about what the model does,
not about what the artifact is.

## The eight reference resolutions

Moving `B`–`G` broke every reference pointing from them into groups that stayed behind. The brief's
§ 6 step 4 anticipated one of these (`F5` → `H4`); the other seven were found during the move. Three
of the four items the brief listed — `C7` and `D5` citing the group `B` doc, and `C9` qualifying
`B3` — stay internal to the shared plugin and were never breaks.

| #   | Where     | Was                                  | Now                                                                       |
| --- | :-------- | :----------------------------------- | :------------------------------------------------------------------------ |
| 1   | `B` intro | "`SKILL.md` Step 5 carries the rule" | "The caller reports this alongside any group `B` finding"                 |
| 2   | `B1`      | "(See also `A17`.)"                  | "(See also the caller's over-prescription criterion.)"                    |
| 3   | `B5`      | "the `A` authoring doc endorses"     | Anthropic's skill-authoring best-practices doc, cited inline with its URL |
| 4   | Fable 5   | "(`A17`)"                            | "(see the caller's over-prescription criterion)"                          |
| 5   | `C2`      | "(overlaps A9)"                      | "(overlaps the caller's examples criterion)"                              |
| 6   | `E2`      | "(overlaps A9/C2)"                   | "(overlaps `C2` and the caller's examples criterion)"                     |
| 7   | `F2`      | "(overlaps A16)"                     | "(overlaps the caller's tool-permission criterion)"                       |
| 8   | `F5`      | "(overlaps `H4`)"                    | "(overlaps the caller's eval edge-case criterion)"                        |

The formula is deliberate and stated in the shared file: **a criterion the shared plugin does not
hold is named by description, never by key**, because the key differs per caller. Group `A` in
`reviewing-claude-skills` is skill authoring; group `A` in `reviewing-claude-subagents` will be
subagent authoring, so a hardcoded `A17` would be wrong for one of them.

Nothing in groups `A`, `H`, or `R` referenced `B`–`G`, so the skills checklist has no dangling
references after the removal.

## Changes outside the moved text

These are navigational or mechanical consequences, not criteria edits. Each is listed so the diff
contains no unexplained line.

| File                                              | Change                                                                                                                                                                                            |
| :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `best-practices-checklist.md`                     | Header note that `B`–`G` live elsewhere; Contents and Sources rows collapsed to a pointer; the example key in the preamble changed from `D1` to `H10`, since `D1` no longer resolves in that file |
| `reviewing-claude-skills/SKILL.md`                | Normative references list the shared skill; Step 2 invokes it and states the absent-dependency behaviour; Step 4 names both criteria sources; Step 5 reports ungraded groups                      |
| `reviewing-claude-skills/evals/evals.json`        | Grading script resolves keys across both files and fails loudly if the shared file is missing; universal assertion reworded; scenarios 19 and 20 added                                            |
| `reviewing-claude-skills/plugin.json`             | `prompt-quality-criteria` declared; version `1.0.0` → `1.1.0`                                                                                                                                     |
| `README.md` (plugin and root), `marketplace.json` | Catalog, dependency notes, and the new entry                                                                                                                                                      |

**Step numbers were deliberately not changed.** The invocation went inside Step 2, which already
assembled criteria, rather than becoming a new step. Eighteen eval `targets` strings pin to step
numbers, and renumbering would have invalidated all of them for no behavioural gain.

**The `writing-simplified-technical-english` invocation was upgraded** to carry its plugin-scoped
name, its mode, and what the caller consumes from it — the same four statements the new edge
carries. That applies the naming document's invocation rule to both of Change 1's edges, per its
follow-on item 5.

## Reproducing the proof

From the repository root, against the commit before this change:

```sh
# 1. the removed text is exactly the B–G slice
git show HEAD:plugins/reviewing-claude-skills/references/best-practices-checklist.md \
  | sed -n '120,260p' > /tmp/bg-before.md
sed -n '/^## B\. Model-specific/,$p' \
  plugins/prompt-quality-criteria/references/prompt-criteria.md > /tmp/bg-after.md

# 2. every word-level difference is a listed substitution or resolution
diff <(tr -s '[:space:]' '\n' < /tmp/bg-before.md) \
     <(tr -s '[:space:]' '\n' < /tmp/bg-after.md)

# 3. no criterion lost across the split — 77 before, 77 after
git show HEAD:plugins/reviewing-claude-skills/references/best-practices-checklist.md \
  | grep -oE '^- \*\*[A-HR][0-9]{1,2} —' | sort > /tmp/keys-before
cat plugins/reviewing-claude-skills/references/best-practices-checklist.md \
    plugins/prompt-quality-criteria/references/prompt-criteria.md \
  | grep -oE '^- \*\*[A-HR][0-9]{1,2} —' | sort > /tmp/keys-after
diff /tmp/keys-before /tmp/keys-after
```

## What this proof does not cover

State these plainly rather than letting the passing checks imply more than they show.

- **It verifies the text, not the behaviour.** The criteria are identical and the keys resolve, but
  no run has confirmed that the reviewer actually invokes the shared skill and scores `B`–`G` from
  what it returns. Scenarios 19 and 20 exist to test exactly that, and neither has been run.
- **The two new eval scenarios are unrun**, so their assertions are written from the design rather
  than from an observed output. The suite's own `H8` says assertions settle on the second pass; treat
  them as provisional until a first run.
- **No prose check was run.** `writing-simplified-technical-english` is not installed in this
  session, so the new `SKILL.md`, `README.md`, and criteria file have not been graded against the
  twelve conventions. Run it before Change 2 lands.
- **The `N/A` reading of `R6` is unchanged.** The naming document is not reachable from `CLAUDE.md`,
  so a reviewer run against this repository still scores the project-scoped items `N/A`. That was a
  deliberate decision, not an oversight.
