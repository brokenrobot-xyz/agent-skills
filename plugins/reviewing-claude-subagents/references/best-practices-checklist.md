# Reviewing-claude-subagents checklist

The criteria the reviewer scores against. A review fetches nothing: it scores from this file and
records the file's age in the report (`SKILL.md` Step 3). Bringing this file back in line with the
URLs below is maintenance, done outside a review. This file calls Claude Code's subagent pages
**the documentation** throughout.

**Groups `B`–`G` are not in this file.** They are prompt criteria shared with the skill reviewer, so
they live in the `prompt-quality-criteria` skill, which `SKILL.md` Step 4 invokes and Step 6 scores
against. Their keys are unchanged, and a finding cites `B4` or `F1` exactly as the shared file writes
it.

**last-synced:** 2026-08-07. When this date is stale, re-fetch the URLs below and reconcile any new
guidance into this file. The shared criteria carry their own `last-synced` date for the docs behind
groups `B`–`G`.

## Contents

- [Sources](#sources)
- [Why there is no precedence rule](#why-there-is-no-precedence-rule)
- [A. Subagent authoring](#a-subagent-authoring)
- **B–G** — supplied by the `prompt-quality-criteria` skill, not by this file
- [H. Success criteria & evaluations](#h-success-criteria--evaluations)
- [R. Craft and project conventions](#r-craft-and-project-conventions)
- [What deliberately does not port from the skill checklist](#what-deliberately-does-not-port-from-the-skill-checklist)

## Sources

| Key | Doc                                                       | URL                                                                                |
| --- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A   | **Create custom subagents** (normative for the format)    | https://code.claude.com/docs/en/sub-agents                                         |
| A   | **Plugins reference** (normative for plugin subagents)    | https://code.claude.com/docs/en/plugins-reference                                  |
| A   | How and when to use subagents in Claude Code              | https://claude.com/blog/subagents-in-claude-code                                   |
| A   | Steering Claude Code (the fit-for-purpose framework)      | https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more |
| A   | Effective context engineering for AI agents               | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents  |
| A   | How we built our multi-agent research system              | https://www.anthropic.com/engineering/multi-agent-research-system                  |
| B–G | Supplied by the `prompt-quality-criteria` skill           | (that skill's `references/prompt-criteria.md` carries the source rows)             |
| H   | Define success criteria & build evaluations               | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests                |
| R   | The host project's `CLAUDE.md` and the documents it links | (project-scoped; see § R)                                                          |

## Why there is no precedence rule

The skill reviewer's checklist opens with a precedence rule: the Agent Skills open standard is the
base, Anthropic's docs extend it, and a skill leaning on an extension is not portable. **That rule has
nothing to attach to here.** No open standard for subagents exists, and searching for one surfaces only
per-vendor implementations. Claude Code's documentation is normative for the format, so a conflict with
it is a finding and there is no portability criterion to score.

Two consequences follow, and both raise the cost of a stale checklist.

- **This checklist tracks a moving target.** Claude Code gates behavior by version, and Anthropic
  revises the documentation often. The sub-agents page once changed three normative rules inside a
  single 48-hour window: it dropped its best-practices list, changed how a blocked model alias
  resolves, and added a flag that appends text to every subagent's system prompt. Treat the
  `last-synced` date as load-bearing.
- **Report a version-gated rule with its version.** A reader running an older Claude Code needs to
  know which rules apply, so a finding that rests on a versioned behavior names the version.

Each item below is a pass criterion. Cite the criterion key in findings. An item whose evidence comes
from a doc outside its own group names that source inline, so a re-sync checks the page the item
actually came from.

## A. Subagent authoring

Twenty-eight criteria. Twelve of them fired on a real subagent during the dry run that produced this
list. Seven have never been exercised outside a fixture, and each of those seven carries an
_Unexercised:_ note.

### Fit-for-purpose — score this first

- **A1 — the artifact earns its form.** A subagent is the right choice when the task produces verbose
  output the parent does not need, when tool restriction is the point, or when the work is
  self-contained and returns a summary. A procedure the user wants to watch and steer belongs in a
  skill: "Use a skill when you want the procedure to play out inside the main thread so you can see
  and steer each step." A deterministic trigger belongs in a hook, and a standing rule belongs in
  `CLAUDE.md`. When you recommend a different form, name it. This can be a High finding, because a
  subagent that should have been a skill hides every intermediate step from the user who wanted to see
  them.
- **A2 — no sibling duplication.** The subagent's remit does not substantially overlap a sibling's,
  because "flooding Claude with options makes automatic delegation less reliable" and an overlap
  degrades routing for both definitions. The comparison set includes the built-in subagents the
  documentation names — `Explore`, `Plan`, and `general-purpose` — because they sit in the same
  roster Claude routes over, so a custom subagent that duplicates Explore's research remit degrades
  routing the same way a custom sibling does. Judge from `name` and `description` fields only. Do
  not write a per-sibling finding; this review covers one subagent.

### Routing

- **A3 — description states trigger conditions.** The `description` states when to delegate, not what
  the subagent is good at. "Reviews code for security issues before commits" routes better than
  "security expert". The documentation states the mechanism — "Claude uses each subagent's description
  to decide when to delegate" — so Claude cannot reliably select a subagent whose description states no trigger.
- **A4 — description point of view.** Third person, for the same reason a skill's description is:
  the description is injected into the system prompt, and a mixed point of view degrades routing.
- **A5 — proactive phrasing where the subagent wants it.** A subagent that Claude should select
  without the user naming it says so in its description. The documentation names the mechanism directly: "To encourage proactive
  delegation, include phrases like 'use proactively' in your subagent's description field." Score this
  `N/A` when the subagent is meant to be invoked explicitly.

### The return contract

- **A6 — the body states the output shape.** Only the final message reaches the parent, so an unstated
  shape produces a different report every run and the orchestrator cannot rely on it. The body states
  the shape it needs, because nothing else will: a subagent never sees the output style, so the body
  must state any formatting the caller expects. Prefer named fields in a fixed order over a
  description of topics.
- **A7 — the body constrains verbosity.** A subagent that returns everything it read cancels the
  context saving that justified delegating to it. Anthropic's own anchor is "a condensed, distilled
  summary of its work (often 1,000-2,000 tokens)", from _Effective context engineering for AI
  agents_ — not from the multi-agent research post, so a re-sync checks the page the quote actually
  came from. A body that lists what to report without bounding how much is a finding.

### Context inheritance

- **A8 — the body does not restate `CLAUDE.md`.** A non-fork subagent receives every level of the
  `CLAUDE.md` hierarchy that the main conversation loads. Restating those rules in the body spends
  tokens on every delegation and buys nothing, and the two copies drift. Read the host project's
  `CLAUDE.md` before scoring this, and quote the overlap. _Exception:_ the built-in `Explore` and
  `Plan` agents skip `CLAUDE.md`, and a rule that must reach them belongs in the delegation message
  rather than in a definition.
- **A9 — the body assumes no conversation.** A non-fork subagent sees only its system prompt, the
  delegation message, and the context listed under `A8`. It does not see prior messages, the skills
  already invoked, or the files Claude already read. A body that refers to "the change we discussed",
  to an earlier tool result, or that tells the subagent to ask the user or the orchestrator something,
  is broken by construction. The body either states every input the subagent needs, or names it as something the delegation
  message must carry.

### Tools and permissions

- **A10 — least privilege.** `tools` grants only what the remit needs. A read-only reviewer lists no
  `Edit` and no `Write`. **An unrestricted `Bash` grant defeats a read-only claim**, because `Bash`
  writes files; a body promising "I never edit" while `tools` grants bare `Bash` rests its guarantee
  on prose rather than on configuration. **The `tools` field cannot narrow a single tool's
  arguments** — it accepts tool names and the MCP server patterns `A15` covers, and nothing else, so
  a `Bash(git:*)` entry there is not a documented form. Recommend one of the two mechanisms that do
  exist: a `PreToolUse` hook in the definition's frontmatter, which the documentation covers and
  which can inspect and deny a single tool call, or a `permissions.deny` rule
  in settings. State the trade-off when you recommend either: a frontmatter hook does not apply to a
  plugin-shipped subagent at all (`A18`) and is skipped until the workspace is trusted — a gate on
  project-level definitions only, because hooks from `~/.claude/agents/` and from `--agents`
  definitions run without it — and a `permissions.deny` rule applies to the whole session rather
  than to this subagent alone.
- **A11 — the body's instructions are possible with the declared tools.** Every action the body tells
  the subagent to take is reachable through a declared tool. A body that says "use the X skill" needs
  `Skill` in `tools`. A body that hands work to another subagent needs `Agent`. A body that asks
  anyone a question cannot work at all, because Claude Code strips `AskUserQuestion` from every subagent.
  This defect is silent at authoring time and produces a confused subagent at run time. It fired on
  three of the five real subagents in the dry run, which makes it the highest-yield item in this
  group.
- **A12 — no always-stripped tool is listed.** Claude Code removes `AskUserQuestion`,
  `EndConversation`, `EnterPlanMode`, `ScheduleWakeup`, `TaskOutput`, `WaitForMcpServers`, and
  `Workflow` from every subagent, even when `tools` names them. It also removes `ExitPlanMode` unless
  `permissionMode` is `plan`, and `Agent` at the depth limit. Listing one is dead configuration that
  misleads a reader about what the subagent can do. A fork is the exception: forks skip both tool
  filters and receive the main conversation's exact tool pool, and in a fork at the depth limit
  `Agent` stays listed but returns an error instead of spawning. This is a deterministic lookup, not
  a judgment.
- **A13 — the toolset survives background mode.** Subagents run in the background by default from
  v2.1.198, and a background subagent keeps every MCP tool but only these built-in tools: `Read`,
  `Grep`, `Glob`, `Bash`, `PowerShell`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`, `WebSearch`,
  `TodoWrite`, `Skill`, `ToolSearch`, `EnterWorktree`, `ExitWorktree`, `Monitor`, `TaskStop`,
  `SendMessage`, and `Artifact`. A definition depending on a built-in tool outside that list behaves
  differently in the foreground and the background, and Claude Code reports no error when it removes
  the tool unless the removal leaves `tools` resolving to nothing. `Agent` and
  `ExitPlanMode` are the exceptions: they follow `A12`'s conditions wherever the subagent runs.
  _Unexercised:_ all five subagents in the dry run used only background-safe tools.
- **A14 — `tools` resolves as intended.** Every entry names a real tool or a documented MCP pattern.
  When nothing in `tools` resolves, the subagent **usually** fails to launch and the Agent tool returns
  an error naming the entries, from v2.1.208 — before that version, the subagent launched with no
  tools. The documentation hedges with "usually" and states no exception, so
  state the consequence with the same hedge. When both fields are set, `disallowedTools` applies
  first and `tools` then resolves against what remains, so a tool named in both fields is removed. A
  tool appearing in both fields is dead configuration. An `Agent(agent_type)` allowlist is honored
  only for an agent running as the main thread via `claude --agent`: in a subagent definition,
  listing `Agent` permits nesting and the type list inside the parentheses is ignored, so a
  definition relying on that list for safety has none. Omitting `Agent` entirely is what prevents
  nesting.
- **A15 — MCP references are correct and consistent.** `tools` uses fully qualified names or the
  documented server-level patterns `mcp__<server>` and `mcp__<server>__*`. `disallowedTools`
  additionally accepts the bare `mcp__*` wildcard, which removes every MCP tool from every server.
  When the body names an MCP
  tool, it names it the same way the grant does, so a reader can tell which grant covers it.
- **A16 — `permissionMode` is safe and effective.** A `bypassPermissions` grant is justified where it
  appears. **A definition cannot rely on `permissionMode` for safety**, because a parent on
  `bypassPermissions` or `acceptEdits` takes precedence and the subagent cannot override it, and a parent in
  auto mode makes Claude Code ignore the subagent's own setting entirely. Score `N/A` when the field is absent.
  _Unexercised:_ none of the five real subagents set this field.

### Frontmatter validity

- **A17 — `name` is loadable.** Lowercase letters and hyphens. **Claude Code does not load a `name`
  containing `:` at all**, because it reserves `:` for plugin-scoped identifiers, and the only trace is
  a line in the debug log. Claude Code accepted such names before v2.1.218, so a definition that worked once can stop
  loading after an upgrade. Identity comes from `name` alone and the filename is free, so a filename
  mismatch is not a finding here. This is a deterministic lookup.

    **Two definitions sharing a `name` resolve differently depending on where they sit.** In the same
    `.claude/agents/` tree, including its subfolders, Claude Code loads one of them chosen by
    filesystem read order, with no documented precedence, and `/doctor` reports the clash. Across
    nested project directories, the definition closest to the working directory wins from v2.1.178.
    Across scopes, the higher-priority location wins: managed settings, then the `--agents` CLI
    flag, then `.claude/agents/`, then `~/.claude/agents/`, then a plugin's `agents/` directory.
    Report the same-tree case as a defect and the other two as resolution rules the reader should
    know.

- **A18 — plugin-shipped fields.** A subagent shipped in a plugin supports `name`, `description`,
  `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, and
  `isolation`. **Claude Code ignores `hooks`, `mcpServers`, and `permissionMode` for security reasons**, and
  nothing warns the author. A plugin subagent declaring `permissionMode: plan` as a safety measure has
  no safety measure. Score `N/A` when the subagent is not plugin-shipped. _Unexercised:_ none of the
  five real subagents is plugin-shipped.
- **A19 — `model`, `effort`, and `maxTurns` are justified.** The default is `inherit`, so a pin needs
  a stated reason. **The pin is overridable from three directions:** the
  `CLAUDE_CODE_SUBAGENT_MODEL` environment variable, the per-invocation `model` parameter, and an
  organization's `availableModels` allowlist. From v2.1.222 a blocked family alias such as `opus` runs
  on the newest version of that family the allowlist permits, and any other blocked value falls back
  to the inherited model. A definition depending on the quirks of exactly one model is therefore
  fragile. All five real subagents pinned a model with no stated reason.
- **A20 — `memory` scope fits, and the body uses it.** `project` is the documented recommended
  default. When memory is on, the body also tells the subagent when to read and when to write it, or
  the directory stays empty and the field buys nothing. Score `N/A` when the field is absent.
  _Unexercised:_ none of the five real subagents set this field.
- **A21 — `isolation: worktree` is warranted.** It costs setup time and disk, and it branches from
  the default branch rather than the parent's `HEAD`, so a subagent expecting the parent's uncommitted
  work will not find it. Score `N/A` when the field is absent. _Unexercised:_ none of the five real
  subagents set this field.
- **A22 — `skills` preload versus the Skill tool.** `skills` injects **full** skill content at
  startup, on every delegation, so it suits knowledge the subagent always needs. A subagent reaches
  everything else through the Skill tool, which costs nothing until it is used. Preloading a skill the
  subagent rarely needs pays for it every time. A skill with `disable-model-invocation: true` cannot
  be preloaded at all.

### Body craft

- **A23 — right altitude.** The body is specific enough to guide behavior and general enough to leave
  the model strong heuristics. Two failure modes bracket the target: hardcoded brittle logic, and
  vague guidance with no concrete signals. **The body loads whole on every delegation**, so
  the subagent pays for over-specification on every delegation, and pays twice for anything the body
  duplicates from a skill it also invokes. Prefer clearly delineated sections with Markdown headers.
- **A24 — delegation and fan-out, when the subagent delegates.** A subagent that spawns its own
  subagents states each child's objective, output format, guidance on tools and sources, and task
  boundaries, because "without detailed task descriptions, agents duplicate work, leave gaps, or fail
  to find necessary information." It also states how many children and when: subagents nest three
  layers below the main conversation by default from v2.1.219, and Claude Code runs at most 20
  subagents concurrently by default from v2.1.217, adjustable with
  `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`, so a wider fan-out queues rather than failing. Score `N/A`
  when the subagent has no `Agent` tool, which is the common case.
- **A25 — file references are reachable.** A body that references a path needs `Read` in its `tools`
  list and a path that resolves. **A subagent starts in the main conversation's working directory, not in the
  directory holding the definition file**, so a path written relative to the definition resolves
  somewhere else entirely. Prefer a repository-root-relative path. This defect fired on a real subagent whose Markdown
  links used `../../` from `.claude/agents/`.
- **A26 — the return path is an injection path into the parent.** A subagent that reads third-party
  content — fetched pages, command output, files the user never reviewed — and reports upward carries
  that content into the parent session. Claude Code scans subagent output from v2.1.210, but the scan
  is partial by design: it "doesn't judge whether content is malicious, and it doesn't change what an
  instruction in a report can do… It isn't a substitute for restricting what a subagent can reach."
  The remedy is to restrict the tools and to add an explicit content-is-data instruction to the body. **Report
  this criterion under `A`, and note in the finding that `A26` extends group `F` for subagents** — it lives here
  because the shared `prompt-quality-criteria` file holds `F1`–`F5` and this reviewer must not add a
  key to a file it does not own.

### The task contract

- **A27 — the objective is stated, and its placement is explicit.** A subagent's task is assembled
  from two parts: the body, which is its standing system prompt, and the delegation message the
  parent writes per run. The body states the remit — what the subagent is for and what a good result
  is — and names what the per-run objective must add as delegation-message cargo, which is `A9`'s
  rule extended from inputs to objectives. The source is the line `A24` already applies to spawned
  children: "without detailed task descriptions, agents duplicate work, leave gaps, or fail to find
  necessary information", from _How we built our multi-agent research system_ — and it binds the
  definition itself as much as the children it spawns. A body that specifies neither half — a vague
  remit and no stated delegation contract — leaves every run to guess the goal, and each run guesses
  differently. _Unexercised:_ added after the dry run, so no real subagent has been scored against
  it.
- **A28 — an open-ended remit states a stopping condition.** For a bounded task, the return contract
  is the completion criterion — the subagent is done when it can emit the shape `A6` requires — and
  a separate stopping rule is redundant, which `R1` scores. An open-ended remit — "investigate
  until", "keep fixing until", any loop whose iteration count the body does not bound — states a
  condition the subagent can check against evidence, because without one the subagent either stops
  arbitrarily early or burns tokens past the point of value, and the parent cannot tell which
  happened. A condition like "until you understand it" fails this criterion too, because nothing can
  check it. This can be a High finding on an iterative remit. Score `N/A` when the return contract
  bounds the task, and do not demand a stopping condition a bounded remit does not need — that is
  the padding failure mode in the other direction. _Unexercised:_ added after the dry run, so no
  real subagent has been scored against it.

## H. Success criteria & evaluations

**Subagents have no eval convention**, so this group scores the methodology and never the format.
`H1` below replaces the skill checklist's `evals/evals.json` schema requirement, which comes from the
Agent Skills standard and has no subagent equivalent. Keys `H2`–`H14` keep the skill reviewer's
numbering and meaning, so a reader who knows one reviewer's report can read the other's.

- **H1 — evals exist, in whatever form the project uses.** There is no standard location or schema for
  subagent evals. When the subagent ships none, **score this group `N/A` and say so in the report** —
  never `Pass`. Inventing a convention would fail every existing subagent on day one, and passing an
  ungraded group silently would tell the reader the subagent is tested when nothing tested it. When
  evals do exist, score `H2`–`H14` against them. When this group is `N/A`, `A27` and `A28` are the
  only graded success-criteria surface, so weigh their findings accordingly.
- **H2 — measurable and specific.** Expected behaviors are concrete and checkable. "Clearly define
  what you want to achieve. Instead of 'good performance,' specify 'accurate sentiment
  classification.'"
- **H3 — distinct decision points.** Each scenario targets a different branch of the body, so a
  failure localizes the regression rather than implicating the whole body.
- **H4 — edge cases.** Covers absent input, boundary cases, and adversarial input. The source names
  irrelevant or nonexistent input data, overly long input, and ambiguous cases where humans would not
  reach consensus.
- **H5 — grading split.** The eval set separates machine-checkable checks from judgment-graded ones,
  and automates the machine-checkable half. "Structure questions to allow for automated grading."
- **H6 — baseline-first.** The evals record what a run without the subagent misses, which is the
  before-and-after evidence that delegating earns its cost.
- **H7 — model coverage.** Scenarios name the models the subagent must pass on. `A19` makes this
  matter more than it does for a skill: the model pin is overridable from three directions, so a
  subagent tested on one model only is tested on a configuration the user can change.
- **H8 — evals precede the prose, assertions follow the first run.** Find the gap by running the task
  without the subagent. Write the scenarios against that gap. Measure the baseline. Then write the
  minimum body that passes. Assertions settle on the second pass, so a scenario set reaching its
  assertions after a first run is correct rather than late.
- **H9 — criteria are specific, measurable, achievable, and relevant.** Base targets on a benchmark, a
  prior experiment, or expert knowledge rather than on hope. Volume of cheap automated checks beats a
  handful of hand-graded ones: "More questions with slightly lower signal automated grading is better
  than fewer questions with high-quality human hand-graded evals."
- **H10 — grader independence.** The instance that produced an output does not grade it. The source
  goes further than instance independence: "Generally best practice to use a different model to
  evaluate than the model used to generate the evaluated output." Self-grading in the same run is not
  evidence.
- **H11 — clean-context runs.** Each run starts from a fresh context. A run that inherits the
  authoring conversation tests the conversation rather than the definition.
- **H12 — cost recorded against benefit.** Runs capture token count, duration, and pass rate, and
  each of the three is read as a delta against the baseline. A subagent exists to save the parent's context, so a
  run that does not measure cost cannot show whether it did.
- **H13 — assertion hygiene.** An assertion that passes both with and without the subagent measures
  the model rather than the subagent, so the author removes or replaces it. The author investigates an
  assertion that fails in both rather than keeping it.
- **H14 — evidence-based PASS.** The grader records PASS or FAIL with evidence quoting the actual
  output, and gives no benefit of the doubt. An opinion without a quotation is not a grade.

## R. Craft and project conventions

Sources: this checklist for `R1`–`R4` and `R7`–`R13`, which are portable craft criteria; the **host
project's own convention documents** for `R5` and `R6`, which are project-scoped. Read the host
project's `CLAUDE.md` and the documents it links before scoring the project-scoped items. Where the
project defines no convention for a project-scoped item, score that item `N/A` — never invent a house
rule the project does not have, because a finding against an invented rule cannot be acted on and
discredits every finding beside it. A project's conventions may also narrow any other item in this group;
when one does, cite the project's document alongside the key.

- **R1 — simplicity first.** No speculative capability, tool grant, or frontmatter field beyond what
  the subagent's remit requires.
- **R2 — surgical.** The reviewer's own apply edits touch only what a finding requires.
- **R3 — single source of truth.** The body references its authoritative sources rather than restating
  their rules, and the body sources any restated rule and keeps it in sync. `A8` is the subagent-specific case of
  this criterion and takes precedence when the source is `CLAUDE.md`. This also covers the
  manifest-versus-procedure cross-check for a plugin-shipped subagent: every skill the body names is
  reachable through the declared tools, and every declared capability is used by some instruction. A
  declared capability nothing uses is dead weight, and a named skill nothing declares fails at run
  time — which is `A11` scored from the other direction.
- **R4 — ask when uncertain.** The body tells the subagent to surface ambiguity rather than guess
  silently. **`A9` constrains how:** a subagent cannot ask the user, so surfacing means reporting the
  ambiguity in the return message rather than requesting an answer.
- **R5 — commit hygiene.** When the subagent authors commits, it conforms to the host project's commit
  conventions. Score `N/A` when it authors none or the project defines no commit convention.
- **R6 — naming convention.** The `name` follows the host project's **subagent**-naming convention
  where one exists. Score `N/A` when the project defines none. Note that a project's skill-naming
  convention does not automatically govern subagents; check whether the project says it does.
- **R7 — prose conventions.** The body and any prose the definition ships follow the twelve
  conventions the `writing-simplified-technical-english` skill carries. Invoke that skill in check mode
  to grade all twelve. When it is not installed, judge against `R8`–`R11` below and report that the
  other seven went ungraded. Two scope limits hold: the `name` and `description` frontmatter is **not**
  covered, because `A3`, `A4`, and `A17` govern it and rewording a `description` for prose style
  damages routing; and the conventions carry **no sentence-length rule**, so do not invent one.
- **R8 — named actor.** Instructions use the active voice. Flag a passive construction where the actor
  is ambiguous. Passive is fine where the actor genuinely does not matter.
- **R9 — notes versus instructions.** Notes, blockquotes, and parentheticals carry information only. A
  normative rule hiding in an aside is a finding, because the subagent may not read it as a rule.
- **R10 — guardrail consequences.** Every prohibition states its risk or result, so the model can weigh
  it against a conflicting instruction. A bare "never do X" is a finding.
- **R11 — closed sets and explicit referents.** No "etc." or "and so on" closing a list the subagent
  must act on, because an open set invites invented members; state the membership test instead. No bare
  "this", "it", or "they" where two antecedents are plausible, because a pronoun with two plausible
  antecedents is a coin flip.
- **R12 — scope coherence.** The subagent does one job. Apply the split test: the same subject and the
  same criteria producing a different output is one artifact with two modes; a different subject or
  different criteria is a second artifact; and criteria a consumer must score with itself are
  extracted regardless. Two responsibilities in one definition make its `description` vague, and a
  vague description is what stops Claude selecting the right subagent. **Splitting has a permanent cost**
  — every definition joins the roster Claude routes over whether it runs or not, and a sibling with
  an adjacent description competes for the same routing — so recommending a split for tidiness alone
  is a finding in the other direction. This differs from `A2`, which compares the
  subagent against its siblings; `R12` asks whether one definition is internally coherent.
- **R13 — invocation completeness.** Where the body tells the subagent to invoke a skill or hand work
  to another agent, that instruction states four things, and it states them at the point of use rather
  than in a separate section that would drift from it: **the plugin-scoped name** where one applies,
  **the mode** when the invoked skill has more than one, **what the subagent takes from the result and
  where that goes**, and **what it does when the skill is unavailable**. `A11` scores whether the
  invocation is possible at all; `R13` scores whether it is specified well enough to act on. An
  instruction that omits the fallback degrades silently, and a silent degradation reads to the caller
  as a clean result rather than a partial one.

## What deliberately does not port from the skill checklist

The table below records these decisions so a later reader does not restore one of these criteria by
mistake.

| Skill criterion                          | Status for subagents                                                                                                                                                                                                                                                             |
| :--------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `A1` name and directory match            | **Replaced by `A17`.** Identity comes from the `name` field alone and the filename is free. The new rule is that `name` must not contain `:`.                                                                                                                                    |
| `A4` length caps                         | **Inverted, and carried by `A23`.** A subagent body has no progressive disclosure: it loads whole on every delegation, so length discipline is stricter rather than looser. No fixed line or token cap applies, because the right length depends on how often the subagent runs. |
| `A5` progressive disclosure              | Does not apply. A subagent has no equivalent mechanism.                                                                                                                                                                                                                          |
| `A6` references one level deep           | **Replaced by `A25`.** A body that points at a file needs `Read` and a path that resolves from the working directory.                                                                                                                                                            |
| `A7` reference table of contents         | Does not apply. A subagent ships no reference directory.                                                                                                                                                                                                                         |
| `A14` scripts solve rather than defer    | Rarely applies. Subagents seldom bundle scripts, so score it under `R1` when one appears.                                                                                                                                                                                        |
| `A16` `allowed-tools` form               | **Replaced by `A10`, `A12`, `A13`, `A14`, and `A15`.** The `tools` and `disallowedTools` semantics resolve through two runtime filters and a defined order, which the single skill criterion does not model.                                                                     |
| `A18` optional spec frontmatter          | **Replaced by `A16` and `A18`–`A22`**, which score the frontmatter fields that carry a defect worth reporting.                                                                                                                                                                   |
| `A19` directory layout                   | **Replaced by the scope-precedence rule in `A17`.**                                                                                                                                                                                                                              |
| `A20` spec core versus client extensions | **No analogue.** There is no open standard for subagents, so every field is a Claude Code field and none is an extension.                                                                                                                                                        |
| `H1` `evals/evals.json`                  | **Replaced.** No equivalent convention exists; see this checklist's `H1`.                                                                                                                                                                                                        |
