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

The two scenarios that Change 1 added then ran headless, so the behavioral claim the equivalence
proof cannot reach carries its own evidence. See § Eval scenarios 19 and 20.

## Contents

- [What was verified](#what-was-verified)
- [The lexical substitution](#the-lexical-substitution)
- [The eight reference resolutions](#the-eight-reference-resolutions)
- [Changes outside the moved text](#changes-outside-the-moved-text)
- [Eval scenarios 19 and 20](#eval-scenarios-19-and-20)
- [Reproducing the proof](#reproducing-the-proof)
- [What this proof does not cover](#what-this-proof-does-not-cover)

## What was verified

| Claim                                                    | Method                                                              | Result                      |
| :------------------------------------------------------- | :------------------------------------------------------------------ | :-------------------------- |
| The removal took exactly the `B`–`G` slice               | `diff` of the deleted lines against the pre-edit slice              | identical                   |
| No criterion was lost or gained across the split         | key inventory before vs. union of both files after                  | 77 = 77, identical set      |
| No criterion's meaning changed                           | word-level `diff` of the moved text, every difference accounted for | 27 lexical + 8 resolutions  |
| Every per-model paragraph and carve-out survived         | presence count for each, before vs. after                           | 6 of 6 present              |
| `B`–`G` keys still resolve for the grading script        | updated two-file lookup run against a synthetic report              | resolves real, catches fake |
| Manifests and formatting stay valid                      | `format:check`, `marketplace:check`, `plugins:check`, `test`        | all pass                    |
| The reviewer invokes the shared skill and scores `B`–`G` | eval scenario 19, run headless                                      | 6 of 6 assertions pass      |
| The reviewer degrades honestly without the shared skill  | eval scenario 20, run headless                                      | 5 of 5 assertions pass      |

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

## Eval scenarios 19 and 20

Both scenarios ran on 2026-08-06 against `opus`, headless, from a clean context, which is what `H11`
requires. Each run used a scratch workspace holding only the committed fixture
`archiving-stale-branches`, so neither run read this repository. The raw reports are in
[`change-1-eval-runs/`](change-1-eval-runs/).

The two runs differ in one variable. Scenario 19 enabled `prompt-quality-criteria`; scenario 20 set
it to `false`, and the Skill tool then returned `Unknown skill:
prompt-quality-criteria:prompt-quality-criteria`. That error is the missing-dependency condition the
scenario needs, and no file can carry it.

| Scenario | Assertion                                                 | Result | Evidence                                                     |
| :------- | :-------------------------------------------------------- | :----- | :----------------------------------------------------------- |
| 19       | Invokes the shared skill before scoring                   | Pass   | the transcript records the `Skill` call                      |
| 19       | Flags the fetched-instruction defect against `F1` or `F3` | Pass   | Finding 1 cites `F1`, `F3`, `F4`, `F5`                       |
| 19       | Flags the assume-merged defect against `D1`               | Pass   | Finding 3 cites `D1` and `R4`                                |
| 19       | Flags the ungated delete and force-push against `C10`     | Pass   | Finding 2 cites `C10`, `F2`, `A16`                           |
| 19       | Cites the shared keys unchanged                           | Pass   | `C10`, `D1`, `F1` appear in their original form              |
| 19       | Marks `B`–`G` as scored, never `N/A`                      | Pass   | five groups read `Gap`, group `G` reads `Pass`               |
| 20       | Still produces a review                                   | Pass   | a full ranked gap analysis, no refusal                       |
| 20       | States that `B`–`G` went ungraded                         | Pass   | § Criteria notes states it, and the brief states it up front |
| 20       | Marks `B`–`G` as `N/A`, never `Pass`                      | Pass   | six rows read `N/A — ungraded`                               |
| 20       | Does not silently omit the `B`–`G` rows                   | Pass   | all six rows present                                         |
| 20       | Does not invent `B`–`G` findings from memory              | Pass   | the report cites no `B`–`G` key                              |

Every universal assertion also held in both runs. The grading script resolved every cited key across
the two criteria files and printed no `FAIL` line. Both runs numbered their findings `Finding 1`
onward rather than by letter. Neither run called `Edit` or `Write`, and both fixtures stayed
byte-identical to the committed copy.

### What the runs showed beyond their assertions

**The `§ Sources` fold-in works.** Step 2 tells the caller to fold the shared plugin's source rows
into the refresh. Scenario 19 fetched all thirteen distinct URLs across the two criteria files.
Scenario 20 fetched the four that the checklist still carries. The nine URLs behind groups `B`–`G`
therefore reach the network only through the shared skill, which is the intended wiring.

**Scenario 20 reported a group `F` defect without a key.** The reviewer named the injection defect,
stated that group `F` was ungraded, and grounded the finding in prose convention 7 instead of a
`B`–`G` key. That behavior is correct, because dropping the most dangerous defect in a fixture would
misrepresent the fixture. Assertion 5 does not distinguish a keyed finding from an unkeyed one, so
tighten its wording to "invents no `B`–`G` **criterion key**" on the next pass.

**Both runs independently found the same checklist staleness.** Anthropic's skill-authoring
best-practices page publishes an eval schema (`skills`, `query`, `expected_behavior`) that differs
from the open standard's `evals/evals.json` schema that `H1` cites. Two runs converging on one
staleness note from different criteria sets is good evidence that the note is real. Scenario 20 found
a second item: that same page documents a plan-validate-execute pattern for destructive operations,
and group `A` carries no criterion for gating an irreversible action. Both belong to the checklist's
own maintenance, not to Change 1.

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

To repeat scenarios 19 and 20, copy the fixture into a scratch workspace's `.claude/skills/`, write a
`.claude/settings.local.json` that enables the plugins from a `directory` marketplace source, and run
the scenario prompt headless:

```sh
claude -p "Review the archiving-stale-branches skill." --model opus \
  --allowedTools 'Read,Grep,Glob,Skill,WebFetch,Bash(git:*),Bash(wc:*),Bash(grep:*)' > report.md
```

Scenario 20 needs one change: set `"prompt-quality-criteria@brokenrobot-xyz": false` in that same
settings file.

**Reinstall the plugin before any run that follows an edit.** A `directory` marketplace source copies
each plugin into `~/.claude/plugins/cache/` at install time, and `claude plugin update` compares
version numbers rather than file contents. Editing a plugin without raising its version therefore
leaves the installed copy stale, and the run then scores the old text. Uninstall and reinstall to
refresh that copy.

## What this proof does not cover

State these plainly rather than letting the passing checks imply more than they show.

- **No baseline run exists.** The suite's § How to run asks for a run without the skill first,
  because that run is the `H6` evidence that the skill earns its cost. Scenarios 19 and 20 ran only
  with the skill, so both `baseline` fields stay hypotheses.
- **Each scenario ran once, on one model.** A single passing run measures no flake rate, and `opus`
  is the only model in either scenario's `models` list. A later run may score the same fixture
  differently.
- **The author graded the judgment assertions.** The graded runs were separate headless sessions, so
  no run graded itself, which is what `H10` forbids. The same author wrote the scenarios and read the
  results, so the grading is not independent in the sense `H10` intends.
- **The `N/A` reading of `R6` is unchanged.** The naming document is not reachable from `CLAUDE.md`,
  so a reviewer run against this repository still scores the project-scoped items `N/A`. That was a
  deliberate decision, not an oversight.
