# Session Readiness Toolkit — inspect-step pilot on `agent-skills`

**Status:** inspect done, draft confirmed. **Date:** 2026-09-02.
**Companion to:** [session-readiness-toolkit-design.md](session-readiness-toolkit-design.md), whose
second pre-build task this is, and [references/invariants.md](../plugins/session-readiness-toolkit/skills/authoring-readiness-checks/references/invariants.md),
whose IDs this record cites.

A hand-run of step 1 (inspect) against this repository, written up the way step 2 (confirm) would
present it. Nothing was generated and no remedy was interviewed. The machine probes were read-only.
The point is the stress test: a plugins-and-evals repository has a different shape from the Node
app the pattern was mined from, and the categories either hold under it or they do not.

## Ecosystem

| Signal                                                                                     | Reading                                                                                                                                                                                                      |
| :----------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json` + `package-lock.json`, `"type": "module"`                                   | npm, ESM. `engines` floors node ≥ 26.7.0 and npm ≥ 11.19.0; `.node-version` pins 26.7.0 and CI installs from it.                                                                                             |
| Eight `npm run *:check` scripts, mirrored one-per-step in `.github/workflows/pipeline.yml` | The verification set. All need `node_modules`: prettier, `yaml`, and the Claude Code CLI are devDependencies. Bundled plugin scripts are zero-dependency Node by rule.                                       |
| `.claude/settings.json` (committed)                                                        | Sandbox on; `enabledMcpjsonServers: ["github"]` committed, so no per-machine enable step; the token env var is denied to subprocesses and `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1`.                              |
| `.mcp.json`                                                                                | The GitHub MCP server runs as a Docker container, image pinned `v1.2.0`, fed `AGENT_SKILLS_GITHUB_PERSONAL_ACCESS_TOKEN`. `gh` is denied in permissions, so this server is the session's only GitHub access. |
| `plugins/frontend-toolkit/.mcp.json`                                                       | Two `npx`-launched MCP servers at pinned versions, `--browser=chrome`. Live only when that plugin is loaded.                                                                                                 |
| `plugins/committing-conventionally/hooks/hooks.json`                                       | A `PreToolUse` deny-hook run with `node`. Live only when that plugin is loaded, which the README's dogfooding command does.                                                                                  |
| `.gitignore`, `allowWrite: ../../../.git`                                                  | Worktrees under `.claude/worktrees/`. A fresh one has no `node_modules` and no `settings.local.json`, which the ignore comment says "may hold secrets, e.g. the GitHub MCP token".                           |
| `eval-runs/`, `plugins/*/evals/`                                                           | Eval campaigns, run by hand with clean-context subagents. Orientation, not readiness — deferred by the record.                                                                                               |

## The draft, sorted by the rule

What the confirm step would put in front of the user. **Consequence** is the line's payload (R3);
**Scope** is where R4 applies.

### Readiness — outside the checkout

| #   | Concern                                      | Evidence in the repo                                                     | Consequence when ✗                                                                                                                                                  | Scope                                                                     |
| :-- | :------------------------------------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------ |
| 1   | `node` present and equal to `.node-version`  | `.node-version`, `engines`, CI                                           | Nothing runs: no script, no test, no prettier, no CLI validator. When dogfooding, the commit deny-hook cannot run either, so nonconforming commits are not blocked. | Everything.                                                               |
| 2   | `npm` ≥ 11.19.0                              | `engines`                                                                | Dependencies cannot be installed; the preparation step (12) is skipped.                                                                                             | Everything downstream of 12.                                              |
| 3   | `git` present                                | The freshness stamp is a `git hash-object` (P10)                         | The stamp cannot be computed, so dependencies reinstall every session.                                                                                              | Cost only.                                                                |
| 4   | Docker CLI present and daemon running        | `.mcp.json`                                                              | The GitHub MCP server does not start. With `gh` denied, the session has no GitHub access at all.                                                                    | GitHub reads: issues, PRs, CI runs. Local work unaffected.                |
| 5   | Google Chrome installed                      | `frontend-toolkit/.mcp.json` `--browser=chrome`                          | The playwright and chrome-devtools tools start but every browser call fails.                                                                                        | Only the frontend-toolkit browser tools, only when that plugin is loaded. |
| 6   | `jq` present                                 | The report envelope (S4); the evals' grading scripts                     | The session report degrades to plain text; eval grading scripts cannot parse transcripts.                                                                           | Report fidelity; eval campaigns.                                          |
| 7   | A node version manager                       | `.node-version`                                                          | Keeping `node` on the pin is manual.                                                                                                                                | Invited path only (P11).                                                  |
| 8   | Session CLI version vs the devDependency pin | Global `claude` on `PATH`; `@anthropic-ai/claude-code` in `package.json` | `claude plugin validate` runs the pinned CLI while the session runs another; the two may disagree on what a manifest is allowed to contain.                         | Manifest validation. Today: session 2.1.258, pin 2.1.235.                 |

### Readiness — inside the checkout, not regenerable

| #   | Concern                                                               | Evidence in the repo                                | Consequence when ✗                                                                                                                                               | Scope                                                                                                                                                          |
| :-- | :-------------------------------------------------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 9   | `AGENT_SKILLS_GITHUB_PERSONAL_ACCESS_TOKEN` reaches the MCP server    | `.mcp.json`; the sandbox `credentials.envVars` deny | The GitHub server starts but every call fails or runs anonymous.                                                                                                 | GitHub reads. **The hook cannot probe this** — see strain 2.                                                                                                   |
| 10  | `.claude/settings.local.json` present in the checkout being worked in | `.gitignore` comment; worktrees                     | In a fresh worktree the token's carrier is absent, so 9 fails there even when the main checkout is fine.                                                         | Worktree sessions. How Claude Code resolves project settings inside `.claude/worktrees/` is unverified.                                                        |
| 11  | Git identity                                                          | The record's own example of this category           | Commits are attributed to whatever `~/.gitconfig` says. There is no repo-local override and no pin to compare against, so the probe can only state the identity. | Today: the global config's address, with no repo-local override. Whether that is intended for this repository is the confirm step's question, not the probe's. |

### Preparation — inside the checkout, regenerable

| #   | Concern                                          | Evidence in the repo                                     | Probe behind it (A1)                                          | Action                                                                                                      |
| :-- | :----------------------------------------------- | :------------------------------------------------------- | :------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------- |
| 12  | `node_modules` fresh against `package-lock.json` | `package-lock.json`; every script; the README's `npm ci` | Stamp inside `node_modules/` holding the lockfile's hash (A4) | Install when missing or stale. Today the tree is **absent** in this checkout, so a first run would install. |

That is the whole preparation set. This repository has no index, no generated code, and no warmed
cache. The category holds; it is just small here.

### Not concerns, and why

| Candidate                                                                          | Why it is dropped                                                                                                                                                                                                                        |
| :--------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The GitHub MCP Docker image, and the `npx` cache for the two frontend MCP packages | Regenerable state outside the checkout, but the consumer fetches it itself on first start — no preparation step is needed and none should exist. At most a readiness note about first-start cost and the network it needs. See strain 1. |
| `yq`                                                                               | Allowed in permissions, used nowhere, not installed.                                                                                                                                                                                     |
| `gh`                                                                               | Installed, denied by permissions, and correctly so — the MCP server is the sanctioned path.                                                                                                                                              |
| Editor configuration                                                               | `.editorconfig` and prettier config bind the editor and CI, not the session. Prettier itself rides on 12.                                                                                                                                |
| Eval campaigns and their tags                                                      | Orientation facts, deferred by the record.                                                                                                                                                                                               |

### Observable only from inside a session

Neither consumer in the record's model can probe these with a script. Only a model, running as
the invited path, can answer them, because the answer is a property of the session it is in.

| #   | Concern                                                | How it is observed                                                    | Consequence when ✗                                                                                                    |
| :-- | :----------------------------------------------------- | :-------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| 13  | The working-copy plugins are loaded via `--plugin-dir` | The model checks whether the five bundles' skills are available to it | Edits to a bundle are not what is being tested (README § Running the working copy); the commit deny-hook is not live. |
| 14  | The GitHub MCP server is connected and authenticated   | One cheap MCP call succeeds                                           | The only honest ✓ for 9 and 10; the hook's line for them can never be better than "not checked".                      |

## What the machine says today

The report a first run would emit in this checkout, under the FOUND/DONE shape (R9), from the
read-only probes taken for this record. DONE is projected: the hook did not run, so nothing was
installed.

```
FOUND
  ✓ tools        node 26.7.0 (=.node-version), npm 11.19.0 (≥11.19.0), git 2.55.0, jq 1.7.1, fnm
  ✓ containers   docker 29.7.2, daemon running, github-mcp-server:v1.2.0 image present
  ✓ browser      Google Chrome present — the frontend-toolkit browser tools can launch
  ✗ github token AGENT_SKILLS_GITHUB_PERSONAL_ACCESS_TOKEN not checked — the sandbox hides it from
                 subprocesses by design; one github MCP call from the session is the only real probe
                 fix: (no troubleshooting doc exists yet — this is what the interview step writes)
  ✗ claude cli   the session runs 2.1.258 but package.json pins 2.1.235 for the validators — the
                 two may disagree on what a plugin manifest is allowed to contain
                 fix: (to be interviewed)
  · identity     git user.email comes from ~/.gitconfig with no repo-local override —
                 commits in this checkout carry that address

DONE
  ✓ node_modules installed (npm install, ~Ns) — the tree was absent   [projected]
```

Two lines use glyphs the website's contract does not have. The token line is a ✗ by the
"not checked is a finding" rule (I3), but its cause is a policy, not a missing prerequisite, and no
fix clears it. The identity line is not a finding at all — there is nothing to compare against —
yet it is worth the model's knowing. Whether the report needs a third state is a confirm-step
question (strain 5).

## Where the categories strained

1. **Regenerable-outside-the-checkout state that self-heals.** The Docker image and the `npx`
   package cache sit outside the checkout, are fully regenerable from pins the checkout carries,
   and are fetched by their own consumer on first use. The assignment rule sends them to readiness;
   regenerability sends them to preparation; the right answer is neither. The rule needs a clause:
   _state its consumer regenerates on first use is not a concern; probe it only when the first-use
   cost or the network it needs is worth a line._
2. **A probe the sandbox forbids.** The token is a readiness concern in the record's third
   category, and the repository's own sandbox policy hides it from every subprocess, the hook
   included. The catalog's "not checked" line (P4) was written for a missing prerequisite; here the
   cause is deliberate policy and no remedy clears it. The honest line says so and names the
   in-session check that does work (14). Platform fact to verify at build: whether hooks run under
   the sandbox's env scrub at all.
3. **Concerns only a model can observe.** Whether the working-copy plugins are loaded, and whether
   an MCP server is connected and authenticated, are properties of the running session. No script
   sees them; the invited path — a model — does. This widens P11: the invited path does not just
   run _more_ of the shared probes, it has a probe class of its own, and those checks live in the
   on-demand skill's body rather than in the probe library.
4. **Conditional concerns.** Chrome matters only when `frontend-toolkit` is loaded; the node
   deny-hook matters only when `committing-conventionally` is loaded. Loading is a launch-time
   fact the hook cannot see. R4's scoping carries it — "only the frontend-toolkit browser tools" —
   so the line is true whether or not the plugin is live. The rule holds; the wording does the work.
5. **Two report states the contract lacks.** "Unobservable by design" and "stated, not judged"
   (the identity line). Either the ✓/✗ contract grows a third glyph, or both fold into ✗/✓ with
   wording — the website folded "not checked" into ✗, so precedent favors wording. Decided 2026-09-02: wording; see the design record's ledger.
6. **The credential case behaved exactly as the record predicted.** Inside the checkout, not
   regenerable, therefore readiness (9, 10, 11). The third line of the rule earned its place on the
   first repository of a different shape.
7. **Preparation is thin here.** One step. The record's "first build: both categories together"
   still holds, but this repository proves the readiness side; the website remains the richer
   preparation case, and the generated hook for this repo will look lopsided. That is correct, not
   a defect.
8. **A live drift the pilot caught by accident.** The global CLI is 23 patch versions ahead of the
   pinned one (8). Not a defect in the pattern — evidence that the P6 sub-family (pins in more than
   one place) also covers "the pin versus what actually runs".
9. **Absence was silent, not screaming.** This checkout had never been installed: no
   `node_modules`, so none of the eight checks could run, and the two design documents already on
   this branch had failed `format:check` for two commits without anyone knowing. The record says a
   missing tree screams. It screams only when something tries to use it; when a session never runs
   the checks, the absence is silent and the branch drifts. That is the case for preparation on the
   automatic path — install unbidden, so the checks are runnable before anyone thinks to run them.
   The install itself added a nuance: npm's install-scripts policy skipped the pinned CLI's
   postinstall with a warning, and the CLI still ran. A preparation step's partial success is what
   R12 says the hook must surface rather than swallow.

## The interview the remedy step would run

The record calls this the long pole. For this repository it is about nine questions:

1. Install with `npm install` in the hook, as A5 recommends, while the README tells humans
   `npm ci`? Or align the README?
2. Where does the token live — shell environment or `settings.local.json` `env` — and what is the
   remedy text for a worktree session where it is absent?
3. Is the GitHub server's consequence wording right: "no GitHub access at all", given `gh` is
   denied?
4. Chrome: what is the install remedy, and is "only the frontend-toolkit browser tools" the right
   scope?
5. The CLI version pair (8): is the policy "bump the devDependency to match the session", or
   "the pin is authoritative and the session should match it", or neither?
6. Git identity: is there an expected address or domain for this repository? If yes, the probe
   gains a pin and the line becomes a real ✗/✓; if no, the line stays informational or is dropped.
7. `jq`: worth a line here, given only the report envelope and eval grading need it?
8. Which glyph or wording for the two extra states (strain 5)?
9. Should the hook probe 4 and 5 at all, or leave Docker and Chrome to the invited path as the
   website leaves containers?

## Verdict

The categories hold under a repository of a different shape. The assignment rule needs one clause
(strain 1), the report contract needs a decision on two extra states (strain 5), and the invited
path gains a probe class of its own (strain 3). None of those is a redesign. The cost side also
held: the interview is nine questions for a repository with one preparation step, which is the
record's estimate for the website scaled down.

Next: the confirm step, on the tables above. Then the deferred packaging and naming decision, and
then the skill.
