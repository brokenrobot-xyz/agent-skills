# Research findings — Claude Code subagents, for the `reviewing-claude-subagents` plugin

**Researched:** 2026-08-04.
**Companion document:** `reviewing-claude-subagents-brief.md` — the design these findings support.

**How to read the confidence markers.** Every claim carries one:

- **[DOC]** — read directly from Anthropic's own documentation or engineering writing. Treat as fact.
- **[3P]** — reported by a third party. Useful, unverified. Do not write one into a checklist without
  confirming it against a **[DOC]** source first.

Claude Code's behaviour is version-gated in many places. Where the documentation names a version, this
document repeats it. A rule without a version note was current as of the research date.

**Refreshed:** 2026-08-06. Every source in § 17 was re-fetched. § 0 lists what changed.

## Contents

- [0. Refresh log — 2026-08-06](#0-refresh-log--2026-08-06)
- [1. Headline finding — no open standard for subagents](#1-headline-finding--no-open-standard-for-subagents)
- [2. The subagent file format](#2-the-subagent-file-format)
- [3. Scopes and precedence](#3-scopes-and-precedence)
- [4. Tool resolution — the two filters](#4-tool-resolution--the-two-filters)
- [5. Plugin-shipped subagents](#5-plugin-shipped-subagents)
- [6. What loads at startup, and what does not](#6-what-loads-at-startup-and-what-does-not)
- [7. Model resolution](#7-model-resolution)
- [8. Routing and invocation](#8-routing-and-invocation)
- [9. Foreground, background, and limits](#9-foreground-background-and-limits)
- [10. The injection surface](#10-the-injection-surface)
- [11. Other frontmatter fields](#11-other-frontmatter-fields)
- [12. Anthropic's stated best practices](#12-anthropics-stated-best-practices)
- [13. Anthropic's engineering guidance on agent prompts](#13-anthropics-engineering-guidance-on-agent-prompts)
- [14. Subagent vs skill vs hook vs CLAUDE.md](#14-subagent-vs-skill-vs-hook-vs-claudemd)
- [15. Third-party anti-patterns](#15-third-party-anti-patterns)
- [16. Skills and subagents compared](#16-skills-and-subagents-compared)
- [17. Sources](#17-sources)

## 0. Refresh log — 2026-08-06

Two days after the original research, seven of the eight source documents still matched. The rest of
this document was corrected in place, so read the sections below as current. This log states what
moved, so a reader who compared the two dates does not have to.

**One claim was withdrawn.**

- **§ 12's list of four stated best practices no longer exists.** The sub-agents page carried "Design
  focused subagents", "Write detailed descriptions", "Limit tool access", and "Check into version
  control" as a labelled list. The page now carries no best-practices section. Only the
  version-control advice survives, inside the project-scope paragraph. **Do not anchor a criterion to
  that list.** The underlying advice still appears in Anthropic's blog writing, which is where a
  criterion should cite it.

**Four claims were narrowed.**

| §   | Was                                                             | Now                                                                                                                                                                                  |
| :-- | :-------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4   | Zero-resolution refuses to launch                               | The page hedges twice: the subagent **usually** fails to launch. State the consequence with that hedge.                                                                              |
| 7   | A blocked model value runs the subagent on the inherited model  | From v2.1.222 a blocked **family alias** such as `opus` runs on the newest version of that family the allowlist permits. Only other blocked values fall back to the inherited model. |
| 6   | Git status is part of every non-fork subagent's initial context | Git status is absent when the working directory is not a Git repository, and when `includeGitInstructions` is `false`.                                                               |
| 14  | Four-tier context cost hierarchy                                | Seven tiers, and subagents now sit alongside hooks and skills at "low" rather than in a lowest tier of their own. Appending a system prompt is a new middle tier.                    |

**Five behaviours were added.**

- **`--append-subagent-system-prompt` (v2.1.205)** appends text to every subagent's system prompt in
  non-interactive mode, nested subagents included. A subagent definition is therefore not the whole
  system prompt, and a criterion must not assume that it is.
- **`CLAUDE_CODE_SUBAGENT_MODEL=inherit` (v2.1.196)** now behaves as though the variable were unset.
  Earlier versions forced every subagent onto the main conversation's model.
- **A per-invocation `model` survives a resume (v2.1.211).**
- **The `isolation: worktree` working-directory check widened (v2.1.203, v2.1.210)** to the whole
  repository, and to the main checkout when the session itself runs in a linked worktree.
- **`--add-dir` directories are scanned for subagents**, so the set of loaded definitions depends on
  how the session was launched.

**Two quotations got sharper**, and both strengthen a draft criterion.

- On sibling duplication: "flooding Claude with options makes automatic delegation less reliable."
- On grader independence, from the eval methodology doc: "Generally best practice to use a different
  model to evaluate than the model used to generate the evaluated output." That asks for a different
  **model**, which is stricter than a different instance.

**One case was added to the suit-the-work list**: verification before committing, where "a second
opinion is warranted before committing code."

## 1. Headline finding — no open standard for subagents

**[DOC/3P]** Skills have a real specification: the Agent Skills standard at `agentskills.io/specification`,
originally developed by Anthropic, released as an open standard, and now governed under the Linux Foundation's
Agentic AI Foundation. It defines the directory layout, the frontmatter schema, progressive disclosure, and a
validation tool, and it is honoured by a reported 30+ agent products.

**There is no equivalent for subagents.** Searching for one surfaces only per-vendor implementations — Claude
Code's subagents, Cursor's, and a subagent model setting in Codex's `config.toml`. `AGENTS.md` is a different
artifact: it is project context, the counterpart of `CLAUDE.md`, not an agent definition.

**Why this matters for the plugin.** The skill reviewer's checklist opens with a precedence rule — the open
standard is the base, Anthropic's docs extend it, a conflict with the standard is a finding, and a skill leaning
on an extension is not portable. **That rule has nothing to attach to for subagents.** Claude Code's own
documentation is normative for the format, full stop. Two consequences:

1. There is no portability criterion. A subagent is a Claude Code artifact by definition.
2. The checklist tracks a moving target. Anthropic's documentation revises frequently and gates behaviour by
   version, so the `last-synced` line and the live-fetch step carry more weight than they do for skills.

## 2. The subagent file format

**[DOC]** A subagent is a Markdown file with YAML frontmatter. The frontmatter configures; the body becomes the
system prompt. Only `name` and `description` are required. Sixteen fields are supported:

| Field             | Required | Notes                                                                                                                                                                                                                                                                                                                                       |
| :---------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`            | Yes      | Lowercase letters and hyphens. Unique identifier; **the filename need not match**. **Cannot contain `:`** — that is reserved for plugin-scoped identifiers. A file whose name contains one is **not loaded**, and the error goes only to the debug log. Before v2.1.218 such names were accepted. Hooks receive this value as `agent_type`. |
| `description`     | Yes      | When Claude should delegate to this subagent.                                                                                                                                                                                                                                                                                               |
| `tools`           | No       | Allowlist. Inherits every tool available to subagents if omitted. **To preload skills, use the `skills` field rather than listing `Skill` here.**                                                                                                                                                                                           |
| `disallowedTools` | No       | Denylist, removed from the inherited or specified list.                                                                                                                                                                                                                                                                                     |
| `model`           | No       | `sonnet`, `opus`, `haiku`, `fable`, a full model ID, or `inherit`. Defaults to `inherit`.                                                                                                                                                                                                                                                   |
| `permissionMode`  | No       | `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`, or `manual` (alias for `default`, v2.1.200+).                                                                                                                                                                                                                     |
| `maxTurns`        | No       | Maximum agentic turns before the subagent stops.                                                                                                                                                                                                                                                                                            |
| `skills`          | No       | Skills preloaded into context at startup. **Full content is injected, not just the description.**                                                                                                                                                                                                                                           |
| `mcpServers`      | No       | Server names referencing configured servers, or inline definitions.                                                                                                                                                                                                                                                                         |
| `hooks`           | No       | Lifecycle hooks scoped to this subagent.                                                                                                                                                                                                                                                                                                    |
| `memory`          | No       | `user`, `project`, or `local`.                                                                                                                                                                                                                                                                                                              |
| `background`      | No       | `true` forces background execution. Unset lets Claude choose.                                                                                                                                                                                                                                                                               |
| `effort`          | No       | `low`, `medium`, `high`, `xhigh`, `max`. Overrides session effort.                                                                                                                                                                                                                                                                          |
| `isolation`       | No       | `worktree` is the only valid value.                                                                                                                                                                                                                                                                                                         |
| `color`           | No       | `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, `cyan`.                                                                                                                                                                                                                                                                       |
| `initialPrompt`   | No       | Auto-submitted as the first user turn when the agent runs as the **main** session.                                                                                                                                                                                                                                                          |

**[DOC]** The `--agents` CLI flag accepts the same fields as JSON for session-scoped subagents, using `prompt`
in place of the Markdown body.

**[DOC]** Claude Code watches `~/.claude/agents/` and `.claude/agents/` and picks up edits within seconds. Two
cases still need a restart: creating the **first** agent file in a directory that did not exist when the session
started, and sessions launched with `--disable-slash-commands`.

**[DOC]** A subagent starts in the main conversation's working directory. Inside a subagent, `cd` does not
persist between Bash calls and does not affect the main conversation.

**[DOC]** From v2.1.205, the `--append-subagent-system-prompt` flag appends text to **every** subagent's system
prompt in non-interactive mode, nested subagents included. The definition's body is therefore not necessarily
the whole system prompt, so a criterion must not assume that the body is all the subagent reads.

## 3. Scopes and precedence

**[DOC]** When several definitions share a `name`, the higher-priority location wins:

| Priority | Location                     | Scope                       |
| :------- | :--------------------------- | :-------------------------- |
| 1        | Managed settings             | Organisation-wide           |
| 2        | `--agents` CLI flag          | Current session             |
| 3        | `.claude/agents/`            | Current project             |
| 4        | `~/.claude/agents/`          | All the user's projects     |
| 5        | Plugin's `agents/` directory | Where the plugin is enabled |

**[DOC]** Both `.claude/agents/` and `~/.claude/agents/` are scanned **recursively**; the subfolder path does
not affect identity, which comes only from `name`.

**[DOC]** A `.claude/agents/` directory inside a path passed with `--add-dir` loads alongside the project's own
subagents. The set of loaded definitions therefore depends on how the session was launched, which a reviewer
cannot read from a definition file.

**[DOC] A real hazard.** If two files under the same `.claude/agents/` tree declare the same `name`, Claude Code
loads **only one, chosen by filesystem read order** — no documented precedence. `/doctor` reports same-directory
duplicates. Across nested project directories, the definition closest to the working directory wins (v2.1.178+).

**[DOC]** Plugin `agents/` directories are also scanned recursively, but there a subfolder **does** become part
of the identifier: `agents/review/security.md` in plugin `my-plugin` registers as `my-plugin:review:security`.

## 4. Tool resolution — the two filters

This is the densest source of latent defects in real subagent definitions.

**[DOC] Filter 1 — removed from every subagent, even when listed in `tools`:**

- `Agent` — when the subagent is at the depth limit
- `AskUserQuestion`
- `EndConversation`
- `EnterPlanMode`
- `ExitPlanMode` — unless the subagent's `permissionMode` is `plan`
- `ScheduleWakeup`
- `TaskOutput`
- `WaitForMcpServers`
- `Workflow`

**[DOC] Filter 2 — background subagents.** Subagents run in the background by default from v2.1.198. A
background subagent keeps every MCP tool but **only** these built-in tools:

`Read`, `Grep`, `Glob`, `Bash`, `PowerShell`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`, `WebSearch`,
`TodoWrite`, `Skill`, `ToolSearch`, `EnterWorktree`, `ExitWorktree`, `Monitor`, `TaskStop`, `SendMessage`,
`Artifact`.

Everything else is removed, inherited or explicitly listed. **The same definition therefore resolves to
different tools in the foreground and the background**, and the removal reports no error unless it leaves the
`tools` list resolving to nothing. Forks skip both filters.

**[DOC]** Agent-team teammates additionally keep `TaskCreate`, `TaskGet`, `TaskList`, `TaskUpdate`, `CronCreate`,
`CronDelete`, `CronList`.

**[DOC] Resolution order.** If both fields are set, `disallowedTools` is applied **first**, then `tools` resolves
against what remains. A tool named in both is removed.

**[DOC] Zero-resolution is a launch failure.** When nothing in `tools` resolves — every entry misspelled, or
naming a tool unavailable to subagents — Claude Code **usually** refuses to launch the subagent, and the Agent
tool returns an error naming the unresolved entries. The page hedges with "usually" twice and states no
exception, so a criterion states the consequence with the same hedge. Before v2.1.208 the subagent launched
with no tools and returned empty or confusing results.

**[DOC] MCP patterns.** Both fields accept `mcp__<server>` and `mcp__<server>__*` for server-level grants or
removals. In `disallowedTools`, `mcp__*` removes every MCP tool from every server.

**[DOC] `Agent(agent_type)` allowlist syntax** restricts which subagent types can be spawned — **but only for an
agent running as the main thread via `claude --agent`**. In a subagent definition, listing `Agent` permits
nesting, and any type list inside the parentheses is **ignored**. Omitting `Agent` entirely prevents nesting.

## 5. Plugin-shipped subagents

**[DOC]** Location: `agents/` in the plugin root. Supported fields: `name`, `description`, `model`, `effort`,
`maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation`.

**[DOC] For security reasons, `hooks`, `mcpServers`, and `permissionMode` are not supported for plugin-shipped
agents — they are ignored when the agent loads.** The documented workaround is to copy the file into
`.claude/agents/` or `~/.claude/agents/`, or to add rules to `permissions.allow` in settings, which then apply
to the whole session rather than to that subagent alone.

This is a high-value review criterion: a plugin subagent declaring `permissionMode: plan` as a safety measure
has no safety measure, and nothing warns the author.

**[DOC]** Plugin subagents appear in the @-mention typeahead under their scoped name, such as
`my-plugin:code-reviewer`.

## 6. What loads at startup, and what does not

**[DOC]** A non-fork subagent's initial context contains:

- **System prompt** — the agent's own body, plus environment details Claude Code appends. **Not** the full
  Claude Code system prompt.
- **Task message** — the delegation prompt Claude writes at hand-off.
- **`CLAUDE.md` files** — every level of the hierarchy the main conversation loads, including
  `~/.claude/CLAUDE.md`, project rules, `CLAUDE.local.md`, and managed policy files.
- **Git status** — a snapshot taken at the start of the parent session. Absent when the working directory is
  not a Git repository, and when `includeGitInstructions` is `false`.
- **Preloaded skills** — full content of anything named in `skills`.
- **Sibling roster** — v2.1.206+, only when the subagent's tools include `SendMessage` and another agent is named.

**[DOC]** The built-in `Explore` and `Plan` agents are the **only** ones that skip `CLAUDE.md` and git status.
There is no frontmatter field to change this.

**[DOC] Never reaches a non-fork subagent:**

- **Conversation history** — it does not see prior messages, the skills already invoked, or the files Claude
  already read.
- **Output style** — the subagent runs its own system prompt.
- **Auto memory** — the main conversation's auto memory is not loaded. Use the `memory` field instead.
- **The parent's context window size** — a subagent's window is sized by its own model.

**Two criteria fall straight out of this.** A body that restates `CLAUDE.md` rules pays for them twice, on every
delegation. A body that refers to prior conversation is broken by construction.

**[DOC]** Anthropic's own note: "The main conversation reads Explore and Plan results with full CLAUDE.md
context, so most rules don't need to reach the subagent itself."

## 7. Model resolution

**[DOC]** Resolution order, highest first:

1. The `CLAUDE_CODE_SUBAGENT_MODEL` environment variable
2. The per-invocation `model` parameter
3. The definition's `model` frontmatter
4. The main conversation's model

**[DOC]** Values are checked against an organisation's `availableModels` allowlist. From v2.1.222 a blocked
**family alias** such as `opus` runs the subagent on the newest version of that family the allowlist permits.
Any other blocked value, and a family the allowlist permits no version of, falls back to the inherited model.
Either way **a definition depending on the quirks of exactly one model is fragile** — the pin can be overridden
from three directions.

**[DOC]** From v2.1.196, setting `CLAUDE_CODE_SUBAGENT_MODEL` to `inherit` behaves as though the variable were
unset, and resolution continues down the list. Earlier versions forced every subagent onto the main
conversation's model.

**[DOC]** A per-invocation `model` parameter survives a resume from v2.1.211. Earlier versions dropped it.

**[DOC]** From v2.1.198, subagents inherit the main conversation's extended-thinking configuration. There is no
per-subagent thinking setting. Before v2.1.198, subagents ran with extended thinking disabled regardless.

## 8. Routing and invocation

**[DOC]** "Claude uses each subagent's description to decide when to delegate." To encourage proactive
delegation, include phrases such as "use proactively" in the description.

**[DOC]** Anthropic's guidance is to be specific about **trigger conditions, not capability**: "Reviews code for
security issues before commits" routes better than "security expert".

**[3P]** Only `name`, `description`, and the tool list load at session start; the body never enters the parent
conversation at all.

**[3P]** Automatic routing to custom agents is a reported weak point in 2026. The suggested remedies are sharper
"use when" conditions in the description and explicit invocation by name where the delegation matters.

**[DOC]** Three escalating ways to invoke explicitly:

- **Natural language** — name the subagent; Claude decides.
- **@-mention** — guarantees that subagent runs for one task. Typed manually as `@agent-<name>`.
- **`--agent <name>` or the `agent` setting** — the whole session takes on that subagent's system prompt, tool
  restrictions, and model. The subagent's prompt **replaces** the default Claude Code system prompt entirely.

## 9. Foreground, background, and limits

**[DOC]** From v2.1.198 subagents run in the background by default; Claude runs one in the foreground when it
needs the result before continuing. Background subagents surface permission prompts in the main session
(v2.1.186+); before that they auto-denied.

**[DOC]** Three separate limits:

- **Depth** — subagents nest three layers below the main conversation by default (v2.1.219+). Configurable via
  `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`; `1` turns nesting off. Earlier versions differed: five layers and
  unchangeable on v2.1.172–v2.1.216, one layer on v2.1.217–v2.1.218.
- **Session total** — 200 subagents per session by default (v2.1.212+), raised with
  `CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION`. Cannot be turned off. `/clear` resets the count.
- **Concurrent** — 20 running at once by default (v2.1.217+), raised with `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`.
  Sessions with ultracode active are exempt.

**[DOC]** Subagents support auto-compaction using the same logic as the main conversation.

**[DOC]** Subagent transcripts live at `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`,
persist independently of main-conversation compaction, and are deleted after `cleanupPeriodDays` (30 by default).

**[DOC] Warning worth carrying into a criterion:** "Running many subagents that each return detailed results can
consume significant context." The context saving that justifies delegating is cancelled by a verbose return.

## 10. The injection surface

**[DOC]** From v2.1.210, Claude Code scans each subagent's final report before Claude reads it. The rationale is
stated plainly: a subagent may have read files, web pages, or command output the user never reviewed, and text
from those sources can carry instructions aimed at the main conversation.

The scan makes two changes, and **never removes or rewords anything**:

- **Backslash insertion** into text imitating Claude Code's own output — a `<system-reminder>` tag, or a line
  starting with `Human:` or `Assistant:`.
- **A marker line** prepended when the report imitates such a tag or mentions permission settings such as
  `bypassPermissions`.

**[DOC] The critical sentence for the checklist:** the scan "doesn't judge whether content is malicious, and it
doesn't change what an instruction in a report can do… It isn't a substitute for restricting what a subagent can
reach."

So a subagent that reads third-party content and reports upward is an injection path **into the parent session**,
and the platform mitigation is partial by design. The remedy is tool restriction plus an explicit
content-is-data instruction in the body.

**[DOC]** Related: from v2.1.198 a subagent treats messages from the agent that launched it as normal task
direction. Two limits hold regardless of sender — no agent message counts as approval for a pending permission
prompt, and no agent message can change a subagent's permission settings, `CLAUDE.md`, or configuration.

## 11. Other frontmatter fields

**`skills` [DOC].** Injects **full** skill content at startup — not just the description. It controls preloading,
not access: without it the subagent can still invoke skills through the Skill tool. To block skills entirely,
omit `Skill` from `tools` or add it to `disallowedTools`. Skills with `disable-model-invocation: true` cannot be
preloaded, including the bundled `/verify` and `/code-review`.

**`memory` [DOC].** Three scopes: `user` (`~/.claude/agent-memory/<name>/`), `project`
(`.claude/agent-memory/<name>/`), `local` (`.claude/agent-memory-local/<name>/`). **`project` is the documented
recommended default.** When enabled, the system prompt gains memory instructions plus the first 200 lines or
25 KB of `MEMORY.md`, and Read/Write/Edit are automatically enabled. The field has no effect when auto memory is
turned off. Anthropic's tip is to include memory instructions in the body so the subagent maintains its own
knowledge base.

**`isolation: worktree` [DOC].** Gives the subagent an isolated repository copy, branched **from the default
branch rather than the parent session's `HEAD`**. Auto-removed if the subagent makes no changes. Bash and
PowerShell run inside the worktree; a command resolving to the main checkout fails (v2.1.203+). From v2.1.210
the check covers the whole repository rather than only the launch directory, and it also covers the main
checkout when the session itself runs in a linked worktree. For Bash, Claude Code also
inspects the command itself and fails anything redirecting git into the main checkout via `git -C`, `--git-dir`,
`GIT_DIR`, `GIT_WORK_TREE`, or a `cd`. A command too complex to check also fails.

**`permissionMode` [DOC].** Six modes plus the `manual` alias. **Parent precedence matters:** if the parent uses
`bypassPermissions` or `acceptEdits`, that takes precedence and cannot be overridden; if the parent uses auto
mode, the subagent inherits it and its own `permissionMode` is **ignored**. `bypassPermissions` allows writes to
`.git`, `.claude`, `.vscode`, and similar protected directories.

**`hooks` [DOC].** All hook events supported. `Stop` in frontmatter is converted to `SubagentStop` at runtime.
Project-level subagent hooks require accepting the workspace trust dialog; until then the subagent runs but its
frontmatter hooks are skipped, with an error only in the debug log (v2.1.218+).

**`mcpServers` [DOC].** Inline definitions connect when the subagent starts and disconnect when it finishes.
Useful for keeping a server's tool descriptions out of the main conversation's context entirely.

## 12. Anthropic's stated best practices

**Withdrawn on the 2026-08-06 refresh.** The sub-agents page carried a labelled list of four best practices —
design focused subagents, write detailed descriptions, limit tool access, and check into version control. That
list is gone, and the page now carries no best-practices section. **Do not cite it.** The one sentence that
survives sits in the project-scope paragraph: "Check them into version control so your team can use and
improve them collaboratively." Anchor the other three to the blog writing quoted below, which still states
them.

**[DOC]** From Anthropic's subagents blog post — when subagents suit the work: research-heavy tasks where
gathering context means reading dozens of files; multiple independent tasks with no dependencies between them;
work needing a fresh perspective or unbiased review; **verification before committing, where "a second opinion
is warranted before committing code"**; and pipeline workflows with distinct sequential phases. The stated
threshold: "When a task requires exploring ten or more files, or involves three or more independent pieces of
work, that's a strong signal to direct Claude toward subagents."

**[DOC]** When to avoid delegation: sequential work where step two needs step one's full output; multiple edits
to the same file; small quick tasks where overhead exceeds benefit; work requiring subagent-to-subagent
coordination; and defining too many specialists — "a handful of well-scoped agents". Anthropic notes directly
that **defining too many specialist agents reduces automatic delegation reliability**.

**[DOC]** From the sub-agents docs, choosing between a subagent and the main conversation. Main conversation
when: the task needs frequent back-and-forth; multiple phases share significant context; the change is quick and
targeted; latency matters. Subagent when: output is verbose and unneeded downstream; tool restrictions are the
point; the work is self-contained and returns a summary.

## 13. Anthropic's engineering guidance on agent prompts

### Right altitude — from _Effective context engineering for AI agents_ [DOC]

Two failure modes bracket the target:

- **Too complex** — intricate logic hardcoded into the prompt, producing brittle systems that are hard to
  maintain.
- **Too vague** — high-level guidance with no concrete signals, either failing to direct behaviour or wrongly
  assuming shared understanding.

The middle ground is "specific enough to guide behavior effectively, yet flexible enough to provide the model
with strong heuristics to guide behavior."

Other rules from the same source:

- Organise prompts into clearly delineated sections, using XML tags or Markdown headers.
- "You should be striving for the minimal set of information that fully outlines your expected behavior" —
  minimal does not mean short.
- On tools: self-contained, robust to error, unambiguous in intended use, minimal functional overlap,
  descriptive parameters. **"If a human engineer can't definitively say which tool should be used in a given
  situation, an AI agent can't be expected to do better."**
- On examples: do not stuff the prompt with edge cases; "curate a set of diverse, canonical examples that
  effectively portray the expected behavior."
- On sub-agent architectures: specialised sub-agents handle focused tasks with clean context windows, each
  returning **condensed summaries of roughly 1,000–2,000 tokens** to the coordinating main agent. That is a
  usable order-of-magnitude anchor for the return-contract criterion.

### The eight multi-agent principles — from _How we built our multi-agent research system_ [DOC]

1. **Think like your agents** — simulate to observe behaviour step by step and find failure modes.
2. **Teach the orchestrator how to delegate** — give "objective, output format, guidance on tools and sources,
   and clear task boundaries."
3. **Scale effort to query complexity** — embed explicit resource-allocation rules.
4. **Tool design and selection are critical** — give explicit heuristics, such as examining available tools
   first and preferring specialised over generic ones.
5. **Let agents improve themselves** — use Claude to diagnose failures and rewrite tool descriptions.
6. **Start wide, then narrow down.**
7. **Guide the thinking process** — extended and interleaved thinking as controllable scratchpads.
8. **Parallel tool calling transforms speed** — 3+ simultaneous calls, 3–5 parallel subagents.

**Delegation detail [DOC].** Early attempts with "simple, short instructions" like "research the semiconductor
shortage" led subagents to perform identical searches. Effective delegation specifies each subagent's distinct
focus, preventing "work duplication, gaps, or failure to find necessary information."

**Stated resource allocation [DOC]:** simple fact-finding, 1 agent and 3–10 tool calls; direct comparisons, 2–4
subagents at 10–15 calls each; complex research, 10+ subagents with clearly divided responsibilities.

**Observed failure modes [DOC]:** spawning 50+ subagents for simple queries; endless searching for nonexistent
sources; preferring SEO content farms over authoritative sources; overly verbose queries returning little; and
agents continuing past the point of sufficient information.

**Evaluation approach [DOC]:** start with ~20 queries rather than delaying a large eval; LLM-as-judge against a
rubric covering factual accuracy, citation precision, completeness, source quality, and tool efficiency; and
human testing alongside, which caught source-selection biases automation missed.

## 14. Subagent vs skill vs hook vs `CLAUDE.md`

**[DOC]** From _Steering Claude Code_:

| Method        | Best for                                                             |
| :------------ | :------------------------------------------------------------------- |
| `CLAUDE.md`   | Project overview, build commands, structure, team conventions        |
| Rules         | Specific constraints; path-scoped to limit context cost              |
| Skills        | Procedural workflows invoked via slash commands                      |
| Subagents     | Isolated side tasks returning only final results                     |
| Hooks         | Deterministic automation — linters, notifications, blocking commands |
| Output styles | Significant role changes; highest instruction weight                 |

**[DOC] The key distinction is isolation and visibility.** Skills execute in the main conversation thread: each
step is visible and steerable, and intermediate results stay in context. Subagents run in isolated context
windows; only the final aggregated message returns, and **the subagent's body never enters the parent
conversation at all**.

**[DOC] Rule of thumb, as stated:** choose subagents when side-task clutter would distract from the primary
work; choose skills when collaborative visibility matters.

**[DOC] Context cost hierarchy**, corrected on the 2026-08-06 refresh. Seven tiers, from cheapest: hooks,
skills, and subagents all at **low**; path-scoped rules at **medium**; an appended system prompt at
**moderate**; output styles and the `CLAUDE.md` root at **high**. Subagents no longer occupy a cheapest tier of
their own, so "a subagent costs less context than a skill" is not a claim this source supports.

## 15. Third-party anti-patterns

**[3P] throughout this section.** Directionally consistent with Anthropic's own guidance, but confirm before
writing any of it into a checklist as a rule.

- **Persona sprawl with blind auto-routing.** The reported failure pattern is a roster of ten personas plus
  auto-routing, burning the token budget on work one session would have done faster.
- **Spray-and-pray spawning.** Subagents are described as a context-isolation primitive, not a productivity
  multiplier — they "reward careful design and punish 'I'll just spawn ten of these and see what happens'".
- **Verbose returns.** Aggressive summarisation belongs in the system prompt.
- **Ignoring cost.** Each subagent has its own context window; heavy parallel spawning is reported as the
  fastest route to rate limits on subscription plans.
- **Unscoped tools.**
- **The reported working pattern:** two or three narrowly scoped agents, read-heavy work, tight tool lists,
  small structured outputs, and explicit invocation when a delegation matters. Start with one specialist — a
  code reviewer is suggested as the safest first — and delete the agents nobody invokes.
- **Treat agent definitions as code:** version-controlled Markdown, reviewed in PRs, iterated when outputs
  disappoint.
- **Misspelled frontmatter fields fail silently.** Run the agent once to confirm behaviour.

## 16. Skills and subagents compared

The delta that drives the new checklist.

| Dimension                   | Skill                                                | Subagent                                                                                           |
| :-------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| Open standard               | Yes — agentskills.io, under the Linux Foundation     | **None.** Claude Code docs are normative                                                           |
| Portability                 | 30+ agent products                                   | Claude Code only                                                                                   |
| Required frontmatter        | `name`, `description`                                | `name`, `description`                                                                              |
| Total frontmatter fields    | 6 in the spec, plus Claude Code extensions           | 16, no spec                                                                                        |
| Progressive disclosure      | Yes — body loads on activation, references on demand | **No.** The body loads whole, on every delegation                                                  |
| Reference files             | First-class, `references/`, one level deep           | Only if the body has `Read` and a resolvable path                                                  |
| Execution context           | Main conversation; visible and steerable             | Isolated window; only the final message returns                                                    |
| Sees conversation history   | Yes                                                  | **No** (except a fork)                                                                             |
| Sees `CLAUDE.md`            | Yes                                                  | **Yes** — so restating it in the body is waste                                                     |
| Sees output style           | Yes                                                  | **No**                                                                                             |
| Body enters parent context  | Yes                                                  | **Never**                                                                                          |
| Discovery mechanism         | Description, matched against the task                | Description, matched for delegation routing                                                        |
| Tool control                | `allowed-tools` (experimental in the spec)           | `tools` + `disallowedTools`, two runtime filters, resolution order, launch failure on zero-resolve |
| Eval convention             | `evals/evals.json` in the standard                   | **None**                                                                                           |
| Cross-artifact interference | Minimal                                              | **Real** — overlapping descriptions degrade routing for all of them                                |

## 17. Sources

**Normative — Anthropic documentation**

| Doc                                         | URL                                                                                |
| :------------------------------------------ | :--------------------------------------------------------------------------------- |
| Create custom subagents                     | `https://code.claude.com/docs/en/sub-agents`                                       |
| Plugins reference (agents section)          | `https://code.claude.com/docs/en/plugins-reference`                                |
| Skill authoring best practices              | `https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices` |
| Define success criteria & build evaluations | `https://platform.claude.com/docs/en/test-and-evaluate/develop-tests`              |

**Anthropic guidance and engineering writing**

| Doc                                                       | URL                                                                                  |
| :-------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| How and when to use subagents in Claude Code              | `https://claude.com/blog/subagents-in-claude-code`                                   |
| Steering Claude Code: CLAUDE.md, skills, hooks, subagents | `https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more` |
| Effective context engineering for AI agents               | `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents`  |
| How we built our multi-agent research system              | `https://www.anthropic.com/engineering/multi-agent-research-system`                  |
| Writing effective tools for AI agents                     | `https://www.anthropic.com/engineering/writing-tools-for-agents`                     |
| Building effective agents                                 | `https://www.anthropic.com/research/building-effective-agents`                       |

**Standards context**

| Doc                        | URL                                          |
| :------------------------- | :------------------------------------------- |
| Agent Skills specification | `https://agentskills.io/specification`       |
| Agent Skills repository    | `https://github.com/agentskills/agentskills` |

**Third-party, marked [3P] above**

| Source                                                    | URL                                                             |
| :-------------------------------------------------------- | :-------------------------------------------------------------- |
| Tembo — Claude Code Subagents: A 2026 Practical Guide     | `https://www.tembo.io/blog/claude-code-subagents`               |
| Nimbalyst — Claude Code Subagents: A Practical 2026 Guide | `https://nimbalyst.com/blog/claude-code-subagents-guide/`       |
| Leland — Claude Code Subagents vs. Agents                 | `https://www.joinleland.com/library/a/claude-subagents`         |
| Developers Digest — Subagent Frontmatter                  | `https://www.developersdigest.tech/guides/subagent-frontmatter` |

**Not consulted, and deliberately so.** The Agent SDK and workflow-agent documentation, and Cursor's and
Codex's subagent implementations. Decision D4 in the brief scopes the plugin to Claude Code subagent `.md`
files. Revisit these only if that scope changes.
