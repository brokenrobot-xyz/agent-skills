# frontend-toolkit

A suite of skills for frontend work. Unlike this marketplace's single-skill
plugins, `frontend-toolkit` is designed to accumulate skills over time; it
starts with one:

- **`updating-dependencies`** — refreshes a project's npm dependencies.
  By default, patch bumps are applied directly; every other bump is
  researched by a dedicated read-only subagent
  (**`dependency-update-researcher`**) that reads the changelog and traces
  how the repo actually uses the package, and is applied only after you
  approve. Which categories auto-apply is configurable. An audit baseline
  taken before any change attributes only _new_ security advisories to the
  update. The skill edits `package.json` and the lockfile but **never
  commits or pushes** — you review the working tree and commit.

The plugin also bundles two MCP servers — **playwright** and
**chrome-devtools**, both headless and isolated — as the browser-automation
foundation for the suite's future skills. Installing the plugin makes them
available in every session where the plugin is enabled.

This README documents the consumer's interface — installation, configuration,
and scope. The workflow itself lives in
[the skill](skills/updating-dependencies/SKILL.md) and
[the agent definition](agents/dependency-update-researcher.md); on any
conflict, those files are canonical.

## Requirements

- Node.js and npm, with the project's dependencies installed. **npm is the
  only supported package manager** — the skill stops and reports rather than
  improvising commands for a pnpm/yarn/bun repo.
- Network access to the npm registry and github.com for changelog research.
- The bundled MCP servers run via `npx` and download on first use.

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install frontend-toolkit@brokenrobot-xyz
```

## Configuration

Optional. Create `.brokenrobot-xyz/frontend.json` at the root of the
repository being updated (the _consumer_ repo — not this marketplace). The
file is namespaced by skill, so future suite skills add sections rather
than files:

```json
{
    "updating-dependencies": {
        "pinning": "exact",
        "autoApply": ["patch", "minor"]
    }
}
```

| Key         | Values                                           | Default                | Meaning                                                                                                                                     |
| ----------- | ------------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pinning`   | `"exact"`, `"preserve"`                          | detected from the repo | `exact`: every update is written as an exact version (`--save-exact`). `preserve`: every dependency keeps its existing `^`/`~`/exact style. |
| `autoApply` | array drawn from `"patch"`, `"minor"`, `"major"` | `["patch"]`            | Categories that apply without stopping for your approval. `[]` gates everything.                                                            |

Without a `pinning` value, the skill detects the policy from the repo's own
signals: `.npmrc` `save-exact=true` or an all-exact `package.json` means
`exact`; any existing `^`/`~` range means `preserve`. The config file
overrides detection. An invalid value for either key stops the run rather
than guessing — a guessed policy would silently substitute behavior the
repo did not choose.

Three rules bound what `autoApply` can do:

1. **Research is the constant.** Only an auto-applied patch skips the
   subagent; minors and majors are always researched, and a gated patch is
   researched too, so an approval is never blind.
2. **Auto applies only a `compatible` verdict.** A `needs-changes` or
   `risky` verdict stops for your approval whatever the config says —
   auto-apply removes the ceremony for clean bumps, never the safety net
   for dirty ones.
3. **No config makes a `0.x` bump automatic.** 0.x semver promises
   nothing, so those always stop.

## What a run looks like

1. Resolve the config (pinning policy + auto-apply set), list outdated
   packages, and snapshot the audit baseline before anything changes.
2. Categorize into patch / minor / major (any `0.x` bump counts as at least
   minor) and show the table.
3. Apply auto patches directly, then diff the audit against the baseline —
   only advisories the update _introduced_ count against it; a bump that
   introduces one is pinned back and reported.
4. Research every remaining bump with one subagent per package and present
   a consolidated verdict table with a **Gate** column: `auto` (in your
   auto-apply set, `compatible`, not 0.x) or `approval`.
5. Apply the `auto` rows without stopping, category by category, each with
   its own audit diff.
6. **Stop for your approval** on the rest, then apply what you approved the
   same way.
7. Report what was applied (auto vs approved), blocked, and deferred.
   Nothing is committed; committing each category separately keeps
   regressions bisectable.

## Scope

Verification of the updated tree — running the project's checks, builds, or
visual regression — is deliberately out of scope in this version. The skill
guarantees attribution (which bump introduced which advisory) and process
(research before majors, approval before risk), not that your test suite
still passes. Run your own checks on the working tree before committing.
