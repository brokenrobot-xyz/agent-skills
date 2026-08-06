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

## What this evidence does not cover

- **One run, one target, one model.** The other four real subagents were scored by hand during the dry
  run, not by the plugin.
- **No baseline run.** Nothing measured what a run without the plugin would have missed, so `H6` stays
  a hypothesis for every scenario in `evals/evals.json`.
- **No eval scenario has been executed.** All sixteen are written from the design. Their assertions
  settle on a first run, which `H8` says is the normal order and which has not happened yet.
- **The author graded this run.** No run graded itself, which is what `H10` forbids, but the same
  author wrote the criteria and read the result.
