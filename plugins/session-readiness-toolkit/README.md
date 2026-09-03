# session-readiness-toolkit

A suite for session readiness: making sure a Claude Code session knows, before
it types anything, what the machine it runs on is missing and what each
absence forbids. Like this marketplace's other suites it is designed to
accumulate skills over time; it starts with one:

- **`authoring-readiness-checks`** — inspects your repository, confirms the
  sorted concerns with you, interviews you for every remedy, and writes a
  per-repository kit: a `SessionStart` hook that reports findings and installs
  only regenerable state behind a probe, a shared probe library, an on-demand
  diagnosing skill, a troubleshooting doc keyed by symptom, and a self-check.
  Re-runs update the kit in place and ask before touching a hand edit. See
  [its README](skills/authoring-readiness-checks/README.md).

The plugin ships **no hook of its own**. A `SessionStart` hook is the most
privileged thing a plugin can carry — it runs automatically, before you have
typed anything, in every repository where the plugin is enabled — so this
suite ships the know-how instead. The generated hook lands in your own diff,
gets reviewed there, and is owned there.

This README documents the consumer's interface. The workflow itself lives in
[the skill](skills/authoring-readiness-checks/SKILL.md) and its references;
on any conflict, those files are canonical.

## Requirements

- Claude Code. The generated hook speaks its `SessionStart` contract, and the
  skill re-verified that contract against the current documentation on the
  date its references record.
- A repository, with a manifest or lockfile when it has one; without one the
  kit carries readiness concerns only. The skill is language-agnostic in what
  it inspects; the scripts it writes are POSIX sh by default, or the
  repository's language when you choose that at the interview.

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install session-readiness-toolkit@brokenrobot-xyz
```

The suite declares no dependencies on other plugins.
