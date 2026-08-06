# Change 2 run records

Evidence for [Change 2](../reviewing-claude-subagents-brief.md) § 7. Kept until the change settles.

## The dogfood run

[`dogfood-frontend-code-reviewer.md`](dogfood-frontend-code-reviewer.md) — `reviewing-claude-subagents`
reviewing `frontend-code-reviewer`, one of the five real subagents in `brokenrobot-xyz/website`. Run
on 2026-08-06, headless, on `opus`, from a clean context, in a scratch workspace holding copies of the
five definitions and the project's `CLAUDE.md`. The reviewer edited nothing, and the copies stayed
byte-identical to the originals.

**The procedure held.** The run ticked all eight steps, graded fit-for-purpose before the ranked
findings, invoked both dependencies, marked its inferential findings as predictions, scored group `H`
as `N/A — unmeasured` rather than passing, and reported that its own criteria refresh was **partial**
because it fetched three of the source URLs rather than all of them. Every one of those is a
behaviour `SKILL.md` demands and none of them is the default.

**It found thirteen findings on a subagent the dry-run had already been over.** Two are High: an
unrestricted `Bash` grant defeating a read-only guarantee that the `description` advertises, and the
"ask the orchestrator" line that no subagent can execute. Both had been found by hand during the dry
run, which is the point — the plugin reproduces by procedure what the dry run produced by hand.

## What the run found in this plugin's own checklist

The reviewer reported four checklist-staleness notes. **Two were confirmed against the source and
fixed; one was rejected; one is out of scope.** They are recorded here because a staleness note that
nobody checks is worse than none.

| Note                                                                  | Verdict          | What happened                                                                                                                                                                                                                                                                                       |
| :-------------------------------------------------------------------- | :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A10` recommended a `Bash(git:*)` form in the `tools` field           | **Confirmed**    | The `tools` field takes tool names and MCP server patterns, and nothing else. The documentation routes command-level restriction to a `PreToolUse` hook, calling it "finer control than the `tools` field provides". `A10` now names the two mechanisms that exist and states each one's trade-off. |
| `A17` said duplicate names have "no documented precedence"            | **Confirmed**    | True only for two files in the **same** directory. Across nested project directories the definition closest to the working directory wins, from v2.1.178. `A17` now separates the two cases.                                                                                                        |
| `A18`'s plugin field list omits `color` and `initialPrompt`           | **Rejected**     | The plugins reference enumerates exactly the eleven fields `A18` lists, and neither `color` nor `initialPrompt` is among them. The run conflated the plugin-supported list with the full sixteen-field frontmatter table. `A18` is correct as written.                                              |
| The group `B` Opus 5 subset lacks the live doc's code-review guidance | **Out of scope** | Groups `B`–`G` live in `prompt-quality-criteria`, whose criteria text this change does not touch. Worth its own change, because "accuracy holds at lower effort settings" bears directly on any reviewer subagent.                                                                                  |

## The self-review — the brief's step 7

[`self-review-by-skills-reviewer.md`](self-review-by-skills-reviewer.md) — `reviewing-claude-skills`
reviewing `reviewing-claude-subagents`, which the brief asks for because the new plugin is a skill and
its sibling reviewer applies to it. It returned sixteen findings, one High. **Every finding was
checked against the file before anything was applied.**

The High finding is the one worth recording: `SKILL.md` ordered the
`writing-simplified-technical-english` invocation from § Normative references and from nowhere else.
Step 6 scored "all nine groups" without naming it, and Step 7 told the reviewer what to report "when
the skill was unavailable" — presupposing an attempt no step ordered. **A run could tick all eight
progress boxes, score `R7` from `R8`–`R11` alone, grade seven of the twelve conventions as nothing,
and report no gap.** That is `R13`, this change's own new criterion, violated in the file that
introduced it. The fix orders the invocation from Step 6 and names it in the progress checklist,
without renumbering any step, because ten eval `targets` strings pin to the step numbers.

Applied from the rest: removed an unused `Write` grant; stated why the skill pins `opus`; replaced a
restatement of the checklist's `A17` that had already drifted from it; moved the group `B` scoping
rule from the interview step to the scoring step; dropped a re-read instruction that works against
Opus 5; scoped delegation; let the brief compress when the user pre-scoped; added a coverage-table
skeleton; and fixed four term drifts.

### The eval defect that propagated

Finding 6 caught a machine check that could never fail: `git diff --quiet -- evals/files/` runs
against this bundle, but `how_to_run` copies each fixture into a scratch workspace, so the run under
test never touches the path being checked. It passed whether or not the reviewer wrote to a fixture —
exactly the always-passing assertion `H13` says to remove.

**The same check exists in `prompt-quality-criteria`, which also copies its fixtures out.** Both are
now checksum comparisons of the scratch copies, taken before and after the run. `prompt-quality-criteria`
goes to 1.0.1.

## Other runs

- [`eval-03-capability-mismatch.md`](eval-03-capability-mismatch.md) — eval scenario 3, the first of
  the sixteen to have an observed result. **All five assertions pass.** It caught the three planted
  `A11` defects and the unjustified model pin, and did not fall for the trap assertion by recommending
  `AskUserQuestion` be added to `tools`. It also went past the scenario: it checked whether the named
  skill and agent exist on the host (neither does), and recommended the `skills` preload field over a
  `Skill` grant, quoting the live documentation.
- [`regression-skills-reviewer-scenario-19.md`](regression-skills-reviewer-scenario-19.md) — the brief
  asks for a regression check once a second caller reaches the shared plugin. Scenario 19 still passes
  all six assertions with `reviewing-claude-subagents` installed alongside. Every cited key resolves
  across both criteria files, groups `B`–`G` are all scored rather than `N/A`, and the new `R12`
  scored the fixture as a **pass** — "one job, one subject. No split warranted" — so it does not
  manufacture split findings on a coherent skill.

## What this evidence does not cover

- **Fifteen of the sixteen eval scenarios have never run.** Only scenario 3 has an observed result.
  The rest are written from the design, and their assertions settle on a first run.
- **No baseline run.** Nothing measured what a run without the plugin would have missed, so `H6` stays
  a hypothesis for every scenario in `evals/evals.json`.
- **Every run used `opus` only**, including the two scenarios that now name `sonnet` as well.
- **Four of the five real subagents were scored by hand**, during the dry run, rather than by the
  plugin.
- **The author graded every run.** No run graded itself, which is what `H10` forbids, and the
  self-review was produced by a different skill than the one under test. But the same author wrote
  the criteria and read the results, so none of this is independent in the sense `H10` intends.
- **The fixes applied after the self-review are themselves unverified.** They changed `SKILL.md`'s
  Step 6, the eval grading script, and the checklist, and no run has exercised any of them.
