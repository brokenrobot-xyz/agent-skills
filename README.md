# agent-skills

The [brokenrobot.xyz](https://www.brokenrobot.xyz) plugin marketplace for
[Claude Code](https://claude.com/claude-code). Plugins are focused, so you
install only what you want: most ship exactly one agent skill, and a skill
with a hook never rides along with an unrelated one. `frontend-toolkit` is
the exception — a suite that scopes its skills under the suite's name.

## Install

Add the marketplace once:

```
/plugin marketplace add brokenrobot-xyz/agent-skills
```

Then install plugins from it:

```
/plugin install committing-conventionally@brokenrobot-xyz
```

Dependencies auto-install: installing either reviewer also installs
`prompt-quality-criteria`, which supplies its B–G criteria, and
`writing-simplified-technical-english`, which supplies its prose conventions.

## Catalog

| Plugin                                                                                         | Category        | What it does                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [committing-conventionally](plugins/committing-conventionally/README.md)                       | git             | Authors Conventional-Commits commits and enforces them with a `PreToolUse` deny-hook. Reads the host project's commit vocabulary from `.brokenrobot-xyz/commits.json`; falls back to vanilla Conventional Commits defaults.                                                                                                                                  |
| [writing-simplified-technical-english](plugins/writing-simplified-technical-english/README.md) | writing         | Revises agent-facing prose — skills, agent definitions, specs, technical docs — so an agent cannot read a sentence two ways. Twelve conventions adapted from ASD-STE100 Simplified Technical English.                                                                                                                                                        |
| [prompt-quality-criteria](plugins/prompt-quality-criteria/README.md)                           | skill-authoring | Supplies criteria groups B–G for grading any Markdown prompt that steers Claude — model-specific prompting, hallucination guards, output consistency, injection and prompt-leak defenses. Returns the criteria; the caller scores.                                                                                                                           |
| [reviewing-claude-skills](plugins/reviewing-claude-skills/README.md)                           | skill-authoring | Reviews a Claude Code skill against skill-authoring and prompting best practices, producing a severity-ranked gap analysis with optional fixes. Depends on `prompt-quality-criteria` and `writing-simplified-technical-english`.                                                                                                                             |
| [reviewing-claude-subagents](plugins/reviewing-claude-subagents/README.md)                     | skill-authoring | Reviews a Claude Code subagent definition — frontmatter, body, declared tools, and routing siblings — producing a severity-ranked gap analysis with optional fixes. Grades fit-for-purpose first: "this should be a skill" is the highest-value finding a subagent can get. Depends on `prompt-quality-criteria` and `writing-simplified-technical-english`. |
| [frontend-toolkit](plugins/frontend-toolkit/README.md)                                         | frontend        | A suite of frontend skills, starting with `updating-dependencies`: detects and categorizes outdated npm packages, researches the bumps the user selects with a dedicated subagent, and applies only the bumps the user approves. Never commits.                                                                                                              |

## Category vocabulary

Marketplace entries carry one `category` plus free-form `tags`. Categories are
a controlled vocabulary — reuse an existing one before adding a new one, and
add new ones here first:

| Category          | Scope                                                               |
| ----------------- | ------------------------------------------------------------------- |
| `git`             | Version-control workflow: commits, branches, history.               |
| `writing`         | Prose quality: documentation, agent-facing text, style enforcement. |
| `skill-authoring` | Building, reviewing, and maintaining agent skills themselves.       |
| `frontend`        | Frontend project upkeep: npm dependencies, tooling, build hygiene.  |

## Repository layout

Plugin bundles live under [`plugins/`](plugins/), one directory per plugin,
each following the [Agent Skills](https://agentskills.io) layout (`SKILL.md`
at the root, with `scripts/`, `references/`, `evals/` as needed), plus a
`.claude-plugin/plugin.json` manifest and, where the skill spawns subagents,
an `agents/` directory. A suite plugin (`frontend-toolkit`) instead holds one
such layout per skill under `skills/<name>/`, with `agents/` and an optional
`.mcp.json` at the plugin root. The
marketplace manifest is
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json); each
entry's `source` is an explicit `./plugins/<name>` path. (Don't switch to
`metadata.pluginRoot`: as of Claude Code 2.1.235 the field is still in the
schema and passes `--strict`, but nothing reads it when a source is
resolved, so relative sources must stay repo-root relative.)

Bundles are self-contained: no paths escape the bundle, scripts and tests are
zero-dependency Node (`.mjs`), and host-project customization lives in the
consumer repo's `.brokenrobot-xyz/` folder — never inside a bundle.

## Development

Node 26 (see `.node-version`); `npm ci` provides everything else, including
the Claude Code CLI. Each step is atomic, so a failure names the thing that
broke:

```sh
npm ci

# `<subject>:check` inspects what the repository actually contains
npm run format:check              # prettier
npm run marketplace:check         # the marketplace manifest
npm run plugins:check             # every plugin manifest, and its agents
npm run frontmatter:check         # every shipped SKILL.md and agent definition parses

# `test:<subject>:check` runs a hermetic suite against one script
npm run test:commits:check        # the commit-message vocabulary and deny-hook
npm run test:dependencies:check   # the npm dependency categorizer
npm run test:frontmatter:check    # the frontmatter checker itself
```

The Pipeline workflow runs each of these as its own step on every push and
pull request to `main`. There is no aggregate `npm test`: an atomic step
names the failure, where a chained one only reports the first thing to break.

Note the split. **Bundled** scripts stay zero-dependency, because they run on
a consumer's machine; the checkers under `scripts/` are repository tooling
that never ships, so they may take a devDependency (`yaml`, to parse
frontmatter the way the harness does rather than by regex).

## License

[MIT](LICENSE)
