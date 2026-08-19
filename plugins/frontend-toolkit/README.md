# frontend-toolkit

A suite of skills for frontend work. Unlike this marketplace's single-skill
plugins, `frontend-toolkit` is designed to accumulate skills over time; it
starts with one:

- **`updating-dependencies`** — refreshes a project's npm dependencies
  through two stops. It categorizes every outdated package and **you select**
  which bumps to pursue; each selected bump is researched by a dedicated
  read-only subagent (**`dependency-update-researcher`**) that reads the
  changelog and traces how the repo actually uses the package; then **you
  approve** per bump, and only approved bumps are applied. An audit baseline
  taken before any change attributes only _new_ security advisories to the
  update. The skill edits `package.json` and the lockfile but **never
  commits or pushes** — you review the working tree and commit.

The plugin also bundles two MCP servers — **playwright** and
**chrome-devtools**, both headless and isolated. They are general frontend
tooling rather than a dependency of any skill here: installing the plugin makes
browser automation and devtools access available to you and to Claude in every
session where the plugin is enabled, whether or not a skill reaches for them.
Disable the plugin when you do not want them loaded.

This README documents the consumer's interface — installation, pinning
behavior, and scope. The workflow itself lives in
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

## Pinning

The skill has no configuration file and no pinning setting to choose. Each
dependency keeps the version style it already has: the new version is
written behind that entry's existing prefix, so a `^` entry stays `^`, a `~`
entry stays `~`, and an exact pin stays exact. The skill never runs
`npm install <pkg>@<version>`, which would write npm's own configured prefix
over the entry's style.

## What a run looks like

1. Confirm the repo is npm-managed.
2. Categorize the outdated packages into patch / minor / major with a script
   — any `0.x` bump counts as at least minor — and snapshot the audit
   baseline before anything changes.
3. Show the table, and **stop: you select which bumps to pursue**.
4. Research each selected bump with one subagent per package. A bump the
   researcher could not analyze — the subagent is missing, or its report
   carries no verdict line — reaches the next step flagged **no verdict**,
   never graded by the skill itself.
5. Present the verdict table and **stop: you approve per bump** — a verdict
   informs your decision, it never bypasses it.
6. Apply the approved bumps in one pass, then run the audit diff against the
   baseline — only advisories the update _introduced_ count against it, and
   the diff names the package each one reaches through, so a bump that
   introduces one is pinned back and reported.
7. Report applied / blocked / deferred / not selected. Nothing is committed;
   the changes stay in the working tree for you to review.

## Scope

Verification of the updated tree — running the project's checks, builds, or
visual regression — is deliberately out of scope in this version. The skill
guarantees attribution (which bump introduced which advisory) and process
(research before you decide, approval before anything is applied), not that
your test suite still passes. Run your own checks on the working tree before committing.
