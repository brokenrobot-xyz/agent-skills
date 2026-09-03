# authoring-readiness-checks

Writes a session-readiness kit into your repository: the files that tell a
Claude Code session, before it types anything, what this machine is missing
and what each absence forbids. Detecting that `node` is absent is trivial.
Telling the model that the absence forbids the build, the tests, and the
commit hook is what stops it attributing a tool failure to the code and
"fixing" something that was never broken.

This README documents what the skill writes and how a run behaves. The
procedure lives in [SKILL.md](SKILL.md), the contract every generated file
holds in [references/invariants.md](references/invariants.md), and the
contents of each file in [references/artifacts.md](references/artifacts.md);
on any conflict, those are canonical.

## What it writes

Five files:

| File                | Job                                                                                                                                                                     |
| :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Probe library       | The detection layer, shared by the two consumers below so they cannot drift apart. Every ✗ line and its wording live here.                                              |
| `SessionStart` hook | Runs unbidden on `startup` and `resume`. Reports what it found, installs only regenerable state behind a probe, and never fails the session.                            |
| On-demand skill     | Runs when you ask. Same probes, narrower authority: it diagnoses and guides from the troubleshooting doc, and never fixes.                                              |
| Troubleshooting doc | Where every remedy lives, keyed by the ✗ line's prefix. Every remedy in it came from you.                                                                               |
| Self-check          | One script that runs the hook against a throwaway directory with stubbed tools and asserts the output contract, the read-only contract, and the symptom-to-remedy join. |

Plus the `hooks` entry in `.claude/settings.json` that fires the hook, or the
exact block to paste when the harness refuses that edit.

## Two categories, separated by authority

Every concern the skill finds lands in one of two categories, and the category
is what the generated file may do about it. **Readiness** is anything outside
the checkout — runtimes, daemons, global tools — and anything inside it that
cannot be regenerated, such as credentials and git identity. The hook observes
these and states the consequence; nothing acts. **Preparation** is regenerable
state inside the checkout — a dependency tree, a virtual environment, an
index. The hook rebuilds these when a probe says they are missing or stale,
then reports what it did and what it cost. A fixed rule assigns the category;
you are never asked to choose one.

The hook's report keeps the two apart:

```
FOUND
  ✓ tools        node 26.7.0 (=.node-version), git 2.55.0, jq
  ✗ docker       daemon not running — the github MCP server cannot start; local work is unaffected
                 fix: run the checking-readiness skill for a guide

DONE
  ✓ node_modules installed (npm install, 31s) — the tree was absent
```

## How a run flows

```
1. Inspect        manifests, lockfiles, pins, MCP and hooks config, CI, .gitignore,
                  sandbox settings, and any kit already present
2. Confirm        ■ STOP — the sorted draft and a sample report, for you to correct
3. Interview      ■ STOP per batch — every remedy comes from you; a symptom you
                  cannot fix gets an entry that says so
4. Write          the five files, or an update in place of the kit that exists
5. Self-check     run → fix → re-run until it passes
```

**Re-runs update in place.** The skill reads whatever kit is there, whoever
wrote it, and presents the drift at the confirm stop: concerns the repository
grew or lost, probe wording that no longer matches a troubleshooting heading,
and every edit it did not derive from the repository. A hand edit is a
question, never a silent rewrite.

## What it never does

- **Invent a remedy.** Nothing ships in the troubleshooting doc that you did
  not give at the interview.
- **Act outside the checkout.** The hook never installs a tool, changes a
  version, or edits a setting; the on-demand skill acts on nothing at all.
- **Fail the session.** Every path in the generated hook exits 0 and reports.
- **Change this machine, or commit.** The skill writes files into the working
  tree for you to review. It installs nothing itself; the self-check runs the
  hook only against a throwaway directory with stubbed tools.

## Requirements

- Claude Code, since the hook speaks its `SessionStart` contract.
- A repository, with a manifest or lockfile when it has one — without one the
  kit carries readiness concerns only. The skill is language-agnostic in what
  it inspects: the lockfile family identifies the ecosystem. The hook, its probe library, and the self-check are POSIX sh by
  default, so they can report the repository's own runtime as missing; you can
  choose the repository's language for all three at the interview.

## Install

This skill ships in the [session-readiness-toolkit](../../README.md) plugin:

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install session-readiness-toolkit@brokenrobot-xyz
```

Invoke it scoped as `session-readiness-toolkit:authoring-readiness-checks`, or
ask for a session-start hook, readiness checks, or a dev-environment check.
