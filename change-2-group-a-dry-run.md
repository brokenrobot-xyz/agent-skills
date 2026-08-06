# Group A dry-run — the 27 draft criteria against five real subagents

**Run:** 2026-08-06.
**Targets:** the five subagents in `brokenrobot-xyz/website/.claude/agents/` —
`dependency-update-researcher`, `frontend-code-reviewer`, `frontend-engineer`, `frontend-qa-engineer`,
and `spec-architect`.
**Purpose:** risk `R3` in [the brief](reviewing-claude-subagents-brief.md) says the 27 draft criteria
come from documentation rather than from reviewing subagents, and that a criterion which cannot
produce a concrete finding is a criterion to cut.

## Contents

- [How the test was applied](#how-the-test-was-applied)
- [Criteria that fired](#criteria-that-fired)
- [Criteria that scored but passed](#criteria-that-scored-but-passed)
- [Criteria that scored N/A](#criteria-that-scored-na)
- [Criteria cut or merged](#criteria-cut-or-merged)
- [The criterion this dry-run added](#the-criterion-this-dry-run-added)
- [Result](#result)

## How the test was applied

The brief's test reads: "A criterion that cannot produce a concrete finding on one of the five real
subagents is a criterion to cut, not to keep for completeness." Applied literally, that test cuts
every criterion for a frontmatter field none of these five sets — `permissionMode`, `memory`,
`isolation`, and the plugin-shipped fields — and the checklist loses its whole safety half.

**The test was therefore read as targeting vacuous criteria, not unexercised ones.** A criterion is
vacuous when no artifact could falsify it, or when it restates a criterion that already scores the
same defect. A criterion that scores `N/A` because a field is absent is doing its job, and `N/A` is an
honest verdict. Four criteria fail the vacuity test and are cut below; the unexercised ones stay, and
this record names them so a later reader knows which were never proven.

## Criteria that fired

Each row is a concrete, citable finding on a real subagent. These twelve carry the checklist.

| Criterion                 | Subagent                    | The finding                                                                                                                                                                                                                                |
| :------------------------ | :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A1` fit-for-purpose      | `frontend-engineer`         | Edits `src/`, works through `tasks.md` in order, and ticks boxes as it goes. The steering doc puts that shape in a skill: use a skill "when you want the procedure to play out inside the main thread so you can see and steer each step." |
| `A1` fit-for-purpose      | `spec-architect`            | Authors proposals and invokes the `openspec-propose` skill. Same question, weaker: the output is a reviewable artifact rather than source code.                                                                                            |
| `A5` proactive phrasing   | `frontend-code-reviewer`    | It exists to run at a gate before every commit, and it carries no "use proactively" phrasing, which is what the documentation names as the way to encourage that routing.                                                                  |
| `A6` output shape         | `spec-architect`            | "Report back the change folder you created and its task groups" names two topics and no shape.                                                                                                                                             |
| `A7` verbosity            | `frontend-qa-engineer`      | Step 8 lists nine things to report and caps none of them, on the largest definition in the fleet.                                                                                                                                          |
| `A8` restates `CLAUDE.md` | `frontend-engineer:43`      | "Simplicity First / Surgical Changes — minimum code that satisfies the task… leave pre-existing dead code alone" restates `CLAUDE.md` § Simplicity First and § Surgical Changes, which the subagent already receives whole.                |
| `A8` restates `CLAUDE.md` | `frontend-code-reviewer:49` | "**Surgical** — every changed line traces to a task. Flag unrelated 'improvements', drive-by refactors, speculative abstractions, and orphaned imports/vars." Same source, same waste.                                                     |
| `A9` assumed conversation | `frontend-code-reviewer:19` | "ask the orchestrator for the list of changed files" instructs an action no subagent can take: `AskUserQuestion` is stripped from every subagent, and this one's tools carry no `SendMessage`.                                             |
| `A11` least privilege     | `frontend-code-reviewer`    | The body promises "You are read-only… you don't edit code" while `tools` grants unrestricted `Bash`, which writes files. The guarantee rests on prose, not on configuration.                                                               |
| `A11` least privilege     | `spec-architect`            | "Never touch `src/`" with `Write`, `Edit`, and `Bash` granted. Same shape.                                                                                                                                                                 |
| `A16` MCP references      | `frontend-qa-engineer`      | `tools` grants the servers as `mcp__playwright` and `mcp__chrome-devtools`, and the body then names `lighthouse_audit` and `performance_start_trace` unqualified.                                                                          |
| `A20` model pin justified | all five                    | Every definition pins `model` (`opus` on three, `sonnet` on two) and none states why. The pin is overridable from three directions, so a definition depending on one model's quirks is fragile.                                            |
| `A24` right altitude      | `frontend-qa-engineer`      | 8 KB of highly prescriptive procedure, loaded whole on every delegation, much of it duplicating the `testing-visual-regression` skill it also tells the agent to use.                                                                      |
| `A27` file references     | `spec-architect:29–31`      | Markdown links written `../../docs/architecture.md`, relative to the definition file. A subagent starts in the main conversation's working directory, so those paths resolve outside the repository.                                       |

## Criteria that scored but passed

Scoreable, exercised, and clean on all five. They stay, and the fleet is evidence they do not
misfire.

`A2` sibling duplication (five distinct remits), `A3` trigger conditions (all five state when to use
them), `A4` description point of view (all third person), `A12` always-stripped tools (none listed),
`A13` background toolset (every listed tool survives the background filter), `A14` `tools` resolves
(all entries valid, including the three server-level MCP patterns), `A18` `name` is loadable (all
lowercase and hyphens, none containing `:`), `A23` preload versus the Skill tool (three definitions
reference skills by name and correctly leave them to the Skill tool rather than preloading them).

## Criteria that scored N/A

None of the five sets these fields, so none was exercised. They stay, because absence scores `N/A`
rather than `Pass`, and each names a defect that is silent when it happens.

`A17` `permissionMode`, `A19` plugin-shipped fields, `A21` `memory` scope, `A22` `isolation:
worktree`.

**These four are unproven.** Fixtures cover them, and a fixture is weaker evidence than a real
subagent.

## Criteria cut or merged

| Draft                             | Disposition                | Reason                                                                                                                                                                                                   |
| :-------------------------------- | :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A10` no reliance on output style | **Cut**, folded into `A6`  | No artifact falsifies it. A body that depends on an output style reads exactly like a body that does not, so the reviewer would be guessing. `A6` already requires the body to state the shape it needs. |
| `A15` resolution order understood | **Cut**, folded into `A14` | It describes what the reviewer must know, not a property of the subagent. The one defect it catches — a tool named in both `tools` and `disallowedTools` — is a `A14` resolution finding.                |
| `A25` delegation instructions     | **Merged** with `A26`      | Neither fires unless the subagent spawns its own subagents, and none of the five does. One conditional criterion covers both.                                                                            |
| `A26` fan-out is bounded          | **Merged** with `A25`      | Same trigger, same evidence.                                                                                                                                                                             |

## The criterion this dry-run added

Three separate findings turned out to be one defect wearing three faces, and no draft criterion named
it.

- `frontend-qa-engineer` tells the agent to "Use the **`testing-visual-regression`** skill for the
  full procedure" three times. Its `tools` list is `Read, Grep, Glob, Bash, mcp__playwright,
mcp__chrome-devtools`. **There is no `Skill` tool**, so the instruction cannot be followed.
- `frontend-code-reviewer:19` tells the agent to ask the orchestrator for a file list. No subagent
  can ask anyone anything.
- `frontend-qa-engineer:71` says "hand it back to the `frontend-engineer`", and
  `frontend-engineer:45` says "hand verification to `frontend-qa-engineer`". Neither lists `Agent`,
  so neither can invoke the other.

The shared defect is that **the body instructs an action the declared tools cannot perform**. It is
silent at authoring time and produces a confused subagent at run time, which is exactly the class the
draft criteria were weakest at catching. It becomes its own criterion, and it is the highest-yield
finding this dry-run produced: it fired on three of the five real subagents.

## Result

Twenty-seven draft criteria became **twenty-five**: two cut, two merged into one, one added. Twelve
fired on real subagents, eight scored and passed, four went unexercised. The checklist then adds one
more, `A26`, for the subagent-specific injection path that [the brief](reviewing-claude-subagents-brief.md)
§ 4 assigns to group `F`, which brings group `A` to twenty-six.

The three definitions that produced the most findings — `frontend-code-reviewer`, `frontend-engineer`,
and `frontend-qa-engineer` — are also the three most used, which is the argument for the plugin
rather than against those subagents.
