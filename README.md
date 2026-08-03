# agent-skills

The [brokenrobot.xyz](https://www.brokenrobot.xyz) plugin marketplace for
[Claude Code](https://claude.com/claude-code). Each plugin ships exactly one
agent skill, so you install only what you want — a skill with a hook never
rides along with an unrelated one.

## Install

Add the marketplace once:

```
/plugin marketplace add brokenrobot-xyz/agent-skills
```

Then install plugins from it:

```
/plugin install committing-conventionally@brokenrobot-xyz
```

Dependencies auto-install: installing `reviewing-claude-skills` also installs
`writing-simplified-technical-english`, which it invokes for its prose check.

## Catalog

| Plugin | Category | What it does |
| --- | --- | --- |
| [committing-conventionally](plugins/committing-conventionally/README.md) | git | Authors Conventional-Commits commits and enforces them with a `PreToolUse` deny-hook. Reads the host project's commit vocabulary from `.brokenrobot-xyz/commits.json`; falls back to vanilla Conventional Commits defaults. |
| [writing-simplified-technical-english](plugins/writing-simplified-technical-english/README.md) | writing | Revises agent-facing prose — skills, agent definitions, specs, technical docs — so an agent cannot read a sentence two ways. Twelve conventions adapted from ASD-STE100 Simplified Technical English. |
| [reviewing-claude-skills](plugins/reviewing-claude-skills/SKILL.md) | skill-authoring | Reviews a Claude Code skill against skill-authoring and prompting best practices, producing a severity-ranked gap analysis with optional fixes. Depends on `writing-simplified-technical-english`. |

## Category vocabulary

Marketplace entries carry one `category` plus free-form `tags`. Categories are
a controlled vocabulary — reuse an existing one before adding a new one, and
add new ones here first:

| Category | Scope |
| --- | --- |
| `git` | Version-control workflow: commits, branches, history. |
| `writing` | Prose quality: documentation, agent-facing text, style enforcement. |
| `skill-authoring` | Building, reviewing, and maintaining agent skills themselves. |

## Repository layout

Plugin bundles live under [`plugins/`](plugins/), one directory per plugin,
each following the [Agent Skills](https://agentskills.io) layout (`SKILL.md`
at the root, with `scripts/`, `references/`, `evals/` as needed) plus a
`.claude-plugin/plugin.json` manifest. The marketplace manifest is
[`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json); each
entry's `source` is an explicit `./plugins/<name>` path. (Don't switch to
`metadata.pluginRoot`: as of Claude Code 2.1.220 the field passes validation
but is ignored at install time, so relative sources must be repo-root
relative.)

Bundles are self-contained: no paths escape the bundle, scripts and tests are
zero-dependency Node (`.mjs`), and host-project customization lives in the
consumer repo's `.brokenrobot-xyz/` folder — never inside a bundle.

## Development

Validate everything and run the tests:

```sh
claude plugin validate --strict .
for p in plugins/*/; do claude plugin validate --strict "$p"; done
node plugins/committing-conventionally/tests/commit-message-cases.mjs
```

CI runs the same checks on every push and pull request.

## License

[MIT](LICENSE)
