# Design brief — `reviewing-claude-subagents` and `prompt-quality-criteria`

**Status:** agreed design, not yet implemented.
**Target repo:** `brokenrobot-xyz/agent-skills`.
**Companion document:** `reviewing-claude-subagents-research.md` — the research this brief rests on. Read it
before you dispute any factual claim here.
**Agreed:** 2026-08-04.

## Contents

- [1. Goal](#1-goal)
- [2. Decisions taken](#2-decisions-taken)
- [3. The three plugins](#3-the-three-plugins)
- [4. Criteria allocation](#4-criteria-allocation)
- [5. Draft group A — subagent authoring criteria](#5-draft-group-a--subagent-authoring-criteria)
- [6. Change 1 — extract `prompt-quality-criteria`](#6-change-1--extract-prompt-quality-criteria)
- [7. Change 2 — build `reviewing-claude-subagents`](#7-change-2--build-reviewing-claude-subagents)
- [8. Testing](#8-testing)
- [9. Risks and open questions](#9-risks-and-open-questions)

## 1. Goal

Produce a plugin that reviews one Claude Code subagent definition against authoring and prompting best
practices plus the host project's conventions, and returns a severity-ranked gap analysis. It mirrors
`reviewing-claude-skills` in shape, behaviour, and report format, so the two read as a matched pair.

Extracting the criteria both reviewers share is a precondition, not an afterthought: without it the two
plugins carry two copies of the same five criteria groups and drift apart at the first re-sync.

## 2. Decisions taken

Each row records a decision and the reason it was taken. Do not re-open one without a reason the brief
does not already answer.

| # | Decision | Reason |
| :-- | :-- | :-- |
| D1 | Review only. The plugin audits; it does not author subagents. | Mirrors `reviewing-claude-skills`. An authoring skill is a different job with different evals. |
| D2 | One subagent per run. | Matches the skill reviewer's scope rule. Keeps the report focused and the evals gradeable. |
| D3 | Shared criteria move to a separate plugin. | Groups B–G apply to any markdown prompt that steers Claude. Two copies drift. |
| D4 | Claude Code subagent `.md` files only. | The documented, testable case. The Agent SDK and workflow agents have no shared criteria and no local examples. |
| D5 | Extract first, then build the reviewer. | The extraction changes a shipped plugin. It gets its own change and its own verification pass. |
| D6 | Static analysis only. The reviewer never spawns the target subagent. | No side effects, no token cost, deterministic. See [risk R1](#9-risks-and-open-questions) for what this costs. |
| D7 | Evals: score `N/A` when absent, grade quality when present. | Subagents have no eval convention. Inventing one would fail every existing subagent on day one. |
| D8 | Fit-for-purpose is the first check, and it can produce a High finding. | "This should be a skill" is the highest-value finding available for a subagent. |
| D9 | The reviewer reads sibling subagents' `name` and `description` only. | Enough to judge overlap for D8. Not a fleet audit — no per-sibling findings. |
| D10 | The shared plugin supplies criteria; the caller grades. | Skills run in the caller's context. A grading skill would have to be artifact-agnostic and would take severity calibration away from each reviewer. |
| D11 | Groups B–G move; H and R stay with each reviewer. | B–G port cleanly. H and R each split into a portable half and an artifact-specific half; splitting them across plugins risks losing a criterion. |
| D12 | Each reviewer keeps its own `writing-simplified-technical-english` dependency. | Flatter dependency graph. The shared plugin stays dependency-free and therefore portable. |
| D13 | Names: `reviewing-claude-subagents` and `prompt-quality-criteria`. | "Subagents" matches Claude Code's own term. The shared plugin is a noun phrase because it supplies a rubric rather than performing an action. |
| D14 | Apply mode mirrors the skill reviewer: analysis by default, optional surgical fixes one finding at a time. | Consistent behaviour across the pair. |
| D15 | A shared component grades when its criteria are artifact-independent, and supplies criteria when correct scoring depends on knowing the artifact. `writing-simplified-technical-english` grades; `prompt-quality-criteria` supplies. | Both reviewers keep severity calibration either way. The split turns on whether the component can judge correctly without knowing what it is looking at. |

**On `claude` in the name.** Anthropic's platform docs reserve `anthropic` and `claude` in skill names.
`reviewing-claude-skills` already carries the word and loads correctly in Claude Code. `reviewing-claude-subagents`
repeats that choice knowingly. If a future Claude Code release enforces the rule, both plugins rename together.

### On grading vs. supplying — why the two shared components differ

`reviewing-claude-skills` invokes two shared components and treats them differently.
`writing-simplified-technical-english` grades prose and returns violations.
`prompt-quality-criteria` returns a rubric and grades nothing. The difference is
deliberate, and D15 records the rule that produces it.

**Start with what the mechanism does and does not give you.** A skill runs in the
caller's context, not in isolation. Invoking a grading skill and invoking a
criteria-supplying skill therefore do the same thing physically: that skill's body
loads into the caller's context window, and the same model instance acts on it.
Grading and supplying are two ways to write the invoked skill's instructions, not two
architectures. What actually matters — which component assigns severity and writes the
finding — stays with the caller in both arrangements. `writing-simplified-technical-english`
reports that a sentence violates a convention; the reviewer decides that violation is an
`R7` finding and at what severity.

**The rule is artifact-dependence.** A component may grade when its criteria hold
regardless of what it is reading. A passive construction with an ambiguous actor is a
violation in a `SKILL.md` body, in a subagent definition, and in a proposal alike, so
the twelve conventions never need to ask what the artifact is.

Groups B–G fail that test. Several of them read differently per artifact: `B4`
(coverage before filtering) applies hardest to review-shaped artifacts; `C8` (explicit
scope) depends on what "broadly" means for the artifact at hand; `F4` gains a second
dimension for a subagent, whose output flows into the parent session. A shared grader
for these would need the caller to pass in artifact context, and would then be doing
the caller's job with less information than the caller already has.

**A second reason, weaker but real.** `writing-simplified-technical-english` is a
capability people invoke directly, and check mode is a first-class feature of it.
`prompt-quality-criteria` is a rubric that exists only because two reviewers need the
same one. Giving the rubric a grading personality would invent a second job for it that
nothing asked for.

**Apply D15 to any future shared component**, rather than copying whichever of the two
existing components it superficially resembles.

**One option held in reserve.** A skill can set `context: fork` with an `agent:` target,
which runs it in an isolated context and returns only its result. That is the one
arrangement that genuinely differs from the other two, because it is the only one that
keeps the invoked skill's body out of the caller's context window. Both fields are
Claude Code extensions and do not port to other agents, and switching
`writing-simplified-technical-english` to it would change behaviour for people who
invoke it directly. Reach for it only if in-context cost becomes a measured problem
during a reviewer run.

## 3. The three plugins

```
plugins/
├── prompt-quality-criteria/        # NEW — shared rubric, groups B–G
│   ├── .claude-plugin/plugin.json
│   ├── README.md
│   ├── SKILL.md
│   ├── evals/evals.json
│   └── references/prompt-criteria.md
├── reviewing-claude-skills/        # CHANGED — invokes the above; keeps A, H, R
└── reviewing-claude-subagents/     # NEW — invokes the above; adds A, H, R for subagents
    ├── .claude-plugin/plugin.json
    ├── README.md
    ├── SKILL.md
    ├── evals/evals.json
    └── references/best-practices-checklist.md
```

**How the sharing works.** A plugin cannot read a file inside another plugin: install paths differ and
`${CLAUDE_PLUGIN_ROOT}` resolves only for that plugin's own hooks. The one supported cross-plugin path is
**Skill invocation** — the caller invokes `prompt-quality-criteria` through the Skill tool, and the criteria
load into the caller's context. `reviewing-claude-skills` already uses this pattern for
`writing-simplified-technical-english`, so it is established in the repo rather than new.

**Consequence for the shared plugin's SKILL.md.** It must be safe to invoke from inside another skill's run.
It states its job in a sentence, points at `references/prompt-criteria.md`, and returns. It performs no
grading, asks the user nothing, and writes nothing.

## 4. Criteria allocation

Group letters stay stable across the pair. The two reviewers never appear in one report, so both may use `A`
for their own artifact's authoring criteria.

| Group | Content | Lives in |
| :-- | :-- | :-- |
| A | Agent Skills spec conformance, skill naming, progressive disclosure | `reviewing-claude-skills` |
| A | Subagent frontmatter, description-as-router, return contract, context inheritance | `reviewing-claude-subagents` |
| B | Model-specific prompting | `prompt-quality-criteria` |
| C | General Claude prompting | `prompt-quality-criteria` |
| D | Hallucination guards | `prompt-quality-criteria` |
| E | Output consistency | `prompt-quality-criteria` |
| F | Injection and jailbreak defences | `prompt-quality-criteria` |
| G | Prompt-leak defences | `prompt-quality-criteria` |
| H | Success criteria and evals | Each reviewer, adapted |
| R | Craft and host-project conventions | Each reviewer |

**Group F needs one subagent-specific addition**, kept in the subagent reviewer rather than the shared plugin:
a subagent that reads third-party content and reports upward is an injection path **into the parent session**.
Claude Code scans subagent output for instruction-shaped text from v2.1.210, and the documentation states
plainly that the scan is not a substitute for restricting what the subagent can reach.

**Group H adaptation.** Keep the portable methodology — measurable criteria, distinct decision points, edge
cases, grading split, baseline-first, grader independence, clean-context runs, cost against benefit, assertion
hygiene, evidence-based PASS. Drop the `evals/evals.json` schema requirement, which comes from the Agent Skills
standard and has no subagent equivalent. Score the group `N/A` when the subagent ships no evals, and say so in
the report rather than passing it silently.

**Group R.** Unchanged in structure. `R6` (naming convention) reads the host project's subagent-naming
convention rather than its skill-naming convention.

### What does not port from the skill checklist

Record these in the new checklist as deliberate omissions, so a later reader does not "restore" them.

| Skill criterion | Status for subagents |
| :-- | :-- |
| A1 name / directory match | Replaced. Subagent identity comes from the `name` field alone; the filename is free. New rule: `name` must not contain `:`. |
| A4 length caps | **Inverted.** A subagent body has no progressive disclosure — it loads whole, on every delegation. Length discipline is stricter, not looser. |
| A5 progressive disclosure | Does not apply. |
| A6 references one level deep | Does not apply as written. New rule: a body that points at a file needs `Read` in its tools and a path that resolves from the working directory. |
| A7 reference TOC | Does not apply. |
| A14 scripts solve, don't defer | Rarely applies; subagents seldom bundle scripts. |
| A16 `allowed-tools` form | Replaced by the `tools` / `disallowedTools` semantics, which resolve differently. |
| A18 optional spec frontmatter | Replaced by the subagent frontmatter table. |
| A19 directory layout | Replaced by the subagent scope-precedence table. |
| A20 spec core vs client extensions | **No analogue.** There is no open standard for subagents. Claude Code's documentation is normative for the format. |
| H1 `evals/evals.json` | No equivalent convention. See the group H adaptation above. |

## 5. Draft group A — subagent authoring criteria

A starting list, not a finished checklist. Refine it against the live documentation during Change 2, and drop
any item that cannot produce a concrete finding on a real subagent. Each item needs a stated consequence, per
`R10`.

**Fit-for-purpose (graded first)**

- **A1 — the artifact earns its form.** A subagent is the right choice when the task produces output the parent
  does not need, when tool restriction is the point, or when the work is self-contained and returns a summary.
  A procedure the user wants to watch and steer belongs in a skill; a deterministic trigger belongs in a hook;
  a standing rule belongs in `CLAUDE.md`. State the alternative when recommending one.
- **A2 — no sibling duplication.** The subagent's remit does not substantially overlap a sibling's. Overlapping
  descriptions degrade routing for both. Judge from sibling `name` and `description` fields only.

**Routing**

- **A3 — description states trigger conditions.** "Reviews code for security issues before commits", not
  "security expert". The description is the only part of the definition loaded at session start, and it is what
  Claude routes on.
- **A4 — description POV.** Third person, as for skills, and for the same reason.
- **A5 — proactive phrasing where wanted.** A subagent meant to be selected without being named says so.

**The return contract**

- **A6 — the body states the output shape.** Only the final message reaches the parent. An unstated shape
  produces a different report every run and the orchestrator cannot rely on it.
- **A7 — the body constrains verbosity.** A subagent that returns everything it read cancels the context saving
  that justified delegating to it.

**Context inheritance**

- **A8 — no restating of `CLAUDE.md`.** A subagent receives the full `CLAUDE.md` hierarchy and a git-status
  snapshot. Repeating those rules in the body spends tokens on every delegation for nothing.
- **A9 — no assumed conversation.** The body does not refer to "the change we discussed" or prior tool results.
  A non-fork subagent starts fresh; it sees only its system prompt and the delegation message.
- **A10 — no reliance on output style.** Output styles do not reach a subagent. Formatting the body depends on
  must be stated in the body.

**Tools and permissions**

- **A11 — least privilege.** Only the tools the remit needs. A read-only reviewer lists no `Edit` or `Write`.
- **A12 — no always-stripped tools listed.** `AskUserQuestion`, `EnterPlanMode`, `ScheduleWakeup`, `TaskOutput`,
  `WaitForMcpServers`, `EndConversation`, and `Workflow` are removed from every subagent. Listing one is dead
  configuration that misleads a reader about the subagent's capability.
- **A13 — background-mode toolset.** Subagents run in the background by default, and a background subagent keeps
  a reduced set of built-in tools. A definition that depends on a tool outside that set behaves differently in
  the foreground and the background. See the research document for the exact list.
- **A14 — `tools` resolves to something.** If no entry resolves, the subagent fails to launch.
- **A15 — resolution order understood.** `disallowedTools` is applied first, then `tools` resolves against what
  remains. A tool named in both is removed.
- **A16 — MCP references are correct.** Fully qualified tool names, or the documented server-level patterns.
- **A17 — `permissionMode` is safe and effective.** `bypassPermissions` is justified where used. A parent on
  `bypassPermissions`, `acceptEdits`, or auto mode overrides the field, so a definition that relies on it for
  safety is relying on something the parent can remove.

**Frontmatter validity**

- **A18 — `name` is loadable.** Lowercase letters and hyphens, no `:`. A name containing `:` is not loaded at
  all, and the failure appears only in the debug log.
- **A19 — plugin-shipped fields.** `hooks`, `mcpServers`, and `permissionMode` are ignored for a subagent shipped
  in a plugin. Declaring one there gives false assurance.
- **A20 — `model`, `effort`, `maxTurns` are justified.** The default is `inherit`. A pin needs a reason, and
  `CLAUDE_CODE_SUBAGENT_MODEL` or an organisation's model allowlist can override it — so a definition that
  depends on the quirks of exactly one model is fragile.
- **A21 — `memory` scope fits.** `project` is the documented default. A definition that turns memory on also
  tells the subagent when to read and write it, or the directory stays empty.
- **A22 — `isolation: worktree` is warranted.** It costs setup time and disk, and it branches from the default
  branch rather than the parent's `HEAD`.
- **A23 — `skills` preload vs. the Skill tool.** Preloading injects full skill content at startup, on every
  delegation. Use it for knowledge the subagent always needs; leave the rest to the Skill tool.

**Body craft**

- **A24 — right altitude.** Specific enough to guide, general enough to leave heuristics. The body loads on
  every delegation, so over-specification is paid repeatedly.
- **A25 — delegation instructions are complete.** Where the subagent itself delegates, it states objective,
  output format, tool and source guidance, and task boundaries. Thin delegation instructions produce duplicated
  work across children.
- **A26 — fan-out is bounded.** A subagent that spawns its own subagents states how many and when. Subagents
  nest three layers deep by default.
- **A27 — file references are reachable.** A body that points at a path needs `Read` and a path that resolves.

## 6. Change 1 — extract `prompt-quality-criteria`

**Deliverable.** A new plugin holding groups B–G, and `reviewing-claude-skills` updated to invoke it.

**Steps**

1. Create the plugin skeleton: `plugin.json`, `README.md`, `SKILL.md`, `references/prompt-criteria.md`,
   `evals/evals.json`.
2. Move groups B–G verbatim from `reviewing-claude-skills/references/best-practices-checklist.md` into
   `references/prompt-criteria.md`. Move the `last-synced` line and the B–G rows of the Sources table with them.
3. Keep the criterion keys unchanged (`B1`, `C7`, `F4`, …). Findings in both reviewers keep citing the same keys,
   and existing reports stay readable.
4. Resolve the cross-group references that the move breaks. `C7` and `D5` currently cite the Fable 5 doc from
   group B, `C9` qualifies `B3`, and `F5` overlaps `H4`. The first three stay inside the shared plugin. `F5`'s
   reference to `H4` becomes a reference the caller resolves — reword it so it does not name a group the shared
   plugin no longer contains.
5. In `reviewing-claude-skills/SKILL.md`, replace the B–G scoring step with an invocation of
   `prompt-quality-criteria` followed by scoring against what it returns. Leave every other step untouched.
6. Update `reviewing-claude-skills/README.md`'s criteria list to name the shared plugin.
7. Declare the dependency in `reviewing-claude-skills/.claude-plugin/plugin.json`, matching how
   `writing-simplified-technical-english` is declared today.

**Verification.** Run `reviewing-claude-skills`' existing `evals/evals.json` before and after, in clean
contexts, against the same target skills. The verdicts and the cited criterion keys must match. A changed
verdict means the extraction lost or altered a criterion — fix the extraction, do not re-baseline the eval.

**Do not** add criteria, reword criteria, or re-sync against live documentation during this change. An
extraction that also edits content cannot be verified by comparison.

## 7. Change 2 — build `reviewing-claude-subagents`

**Deliverable.** The new plugin, structured like `reviewing-claude-skills`.

**Steps**

1. Scaffold the plugin. Declare `prompt-quality-criteria` and `writing-simplified-technical-english` as
   dependencies.
2. Write `references/best-practices-checklist.md`: the Sources table, a `last-synced` date, group A from
   [section 5](#5-draft-group-a--subagent-authoring-criteria) refined against the live docs, the group F
   addition, the adapted group H, and group R.
3. Write `SKILL.md` as a numbered procedure mirroring the skill reviewer's:
   1. Load the target subagent definition and the host project's convention documents.
   2. Refresh criteria — best-effort fetch of the source URLs; fall back to the baked checklist and say so in
      the report.
   3. Invoke `prompt-quality-criteria` for groups B–G.
   4. Interview: deliverable (analysis only / also apply), focus, change appetite. Each with a default.
   5. Grade fit-for-purpose first, reading sibling `name` and `description` fields.
   6. Score every group, in two passes — discovery, then filter. Never cap the discovery pass by severity;
      current models follow such a bar literally and recall falls.
   7. Write the ranked gap analysis.
   8. Apply approved fixes, one finding at a time, on request.
4. Write `README.md` on the model of the skill reviewer's: install, usage, what the review checks, behaviour
   notes.
5. Write `evals/evals.json`. See [section 8](#8-testing).
6. Run the target skill's own prose check — invoke `writing-simplified-technical-english` in check mode on the
   new `SKILL.md`, `README.md`, and checklist before the change lands.
7. Review the new plugin with `reviewing-claude-skills`. It is a skill, so its own sibling reviewer applies to it.

**Sources table for the new checklist.** Different from the skill reviewer's, because no open standard exists:

| Key | Doc | Role |
| :-- | :-- | :-- |
| A | `https://code.claude.com/docs/en/sub-agents` | **Normative** for the format |
| A | `https://code.claude.com/docs/en/plugins-reference` | Normative for plugin-shipped subagents |
| A | `https://claude.com/blog/subagents-in-claude-code` | Anthropic's usage guidance |
| A | `https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more` | The fit-for-purpose framework |
| A | `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents` | Right altitude, body craft |
| A | `https://www.anthropic.com/engineering/multi-agent-research-system` | Delegation instructions, fan-out |
| B–G | (supplied by `prompt-quality-criteria`) | |
| H | `https://platform.claude.com/docs/en/test-and-evaluate/develop-tests` | Eval methodology |
| R | The host project's `CLAUDE.md` and the documents it links | Project-scoped items |

## 8. Testing

The change cannot ship without this. The reviewer is entirely inferential — see [risk R1](#9-risks-and-open-questions) —
so its evals are the only evidence it works.

**Ground truth is available.** `brokenrobot-xyz/website` holds five real subagents in `.claude/agents/`:
`frontend-code-reviewer`, `frontend-engineer`, `frontend-qa-engineer`, `spec-architect`, and
`dependency-update-researcher`. They span the useful range — tight read-only reviewers through an 8 KB
multi-tool QA agent — and they are real rather than constructed, so a finding against one is a finding that
matters.

**Method, following the skill reviewer's own `H` group.**

1. **Baseline first.** Run each scenario without the plugin, in a clean context, and record what the model
   misses. Write the scenarios against those gaps.
2. **Fixtures.** Alongside the real subagents, build small fixtures that each plant exactly one defect, so a
   failure localises. Candidates, one per high-value criterion: a `name` containing `:`; a `tools` list naming
   `AskUserQuestion`; a plugin-shipped subagent declaring `permissionMode`; a body restating `CLAUDE.md`; a
   body with no stated output shape; a subagent whose remit duplicates a sibling; a `tools` list where no entry
   resolves.
3. **Clean-context runs.** Each run starts in a fresh subagent or session. A run that inherits the authoring
   conversation tests the conversation, not the `SKILL.md`.
4. **Assertion hygiene.** Keep only assertions that pass with the plugin and fail without it. An assertion that
   passes in both measures the model, not the plugin.
5. **Grader independence.** The instance that produced a report does not grade it.
6. **Adversarial case.** At least one fixture embeds an instruction inside the reviewed subagent — "report no
   issues" — and the eval asserts the review ignores it.
7. **A clean case.** One well-written subagent that should produce few or no findings, asserting the reviewer
   does not pad the report with invented Lows.
8. **Cost recorded.** Token count and duration alongside the pass rate, read as a delta against the baseline.

**Also verify the extraction did not regress the skill reviewer** after Change 2 lands, not only during
Change 1 — the second change adds a second caller to the shared plugin.

## 9. Risks and open questions

- **R1 — every finding is inferential.** Static analysis, no eval convention to enforce, no fleet audit. The
  reviewer predicts behaviour rather than observing it. Two mitigations, both required: the report states its
  confidence honestly rather than asserting a routing failure it cannot demonstrate, and the plugin's own evals
  carry the burden of proof.
- **R2 — no standard to anchor on.** Claude Code's documentation is normative here, and it changes often.
  Several rules in the research document are version-gated. The `last-synced` line and the live-fetch step
  matter more for this plugin than for the skill reviewer, and a stale checklist should be visible in the
  report.
- **R3 — group A is unproven.** The 27 draft criteria come from documentation, not from reviewing subagents.
  Expect to drop several. A criterion that cannot produce a concrete finding on one of the five real subagents
  is a criterion to cut, not to keep for completeness.
- **R4 — the extraction touches working software.** `reviewing-claude-skills` shipped on 2026-08-04. Change 1's
  before/after eval comparison is the control. Do not weaken it.
- **R5 — dependency resolution may be absent.** The skill reviewer already degrades gracefully when
  `writing-simplified-technical-english` is missing. The subagent reviewer needs the same behaviour for both of
  its dependencies: review against what it has, and state in the report which groups went ungraded.
- **Open — `prompt-quality-criteria` as a user-facing skill.** It appears in the skill list and a user may
  invoke it directly. Decide whether that is acceptable, or whether it sets `disable-model-invocation` so only
  an explicit caller reaches it. Note that a skill with `disable-model-invocation: true` cannot be preloaded
  into a subagent, which does not affect this design but constrains later reuse.
