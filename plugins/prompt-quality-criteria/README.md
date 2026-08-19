# prompt-quality-criteria

This skill supplies criteria groups **B–G** for scoring a Markdown prompt that steers Claude: a
skill's `SKILL.md` body, a subagent definition's body, or any other agent-facing instructions. The
skill returns the criteria and scores nothing. The caller holds the prompt under review, so the
caller assigns each severity and writes each finding.

This README states what the criteria cover and why the skill supplies them instead of scoring them.
The criteria live in [references/prompt-criteria.md](references/prompt-criteria.md) and the
procedure lives in [SKILL.md](SKILL.md). When this README conflicts with either file, those two
files are canonical.

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install prompt-quality-criteria@brokenrobot-xyz
```

Claude Code also installs this plugin alongside
[reviewing-claude-skills](../reviewing-claude-skills/README.md), which declares this plugin as a
dependency. You may also install this plugin on its own, because the criteria are useful without a
caller.

## Usage

Two kinds of caller reach the skill, and the skill behaves differently for each:

- **Another skill invokes the skill.** The criteria load into the caller's context, and the caller
  scores its own prompt against them. `prompt-quality-criteria` asks the user nothing and edits
  nothing, so `prompt-quality-criteria` never interrupts a review that the caller already scoped.
- **You invoke the skill directly.** Name a prompt, and the skill presents the criteria and scores
  that prompt, because no other caller is present to score it.

## What the criteria cover

Every finding cites the criterion key as `references/prompt-criteria.md` writes it — `B4`, `D1`,
`F5`. The keys are stable for every caller, so two callers' reports stay comparable. The file holds
thirty-eight criteria in six groups:

- **B** — model-specific prompting, matched to the prompt's pinned model (Sonnet 5, Opus 5, Opus
  4.8, and Fable 5 with Mythos 5). Apply only the subset that matches the model.
- **C** — general Claude prompting: clarity, examples, structure, chaining, explicit scope, and
  confirmation before an irreversible action.
- **D** — hallucination guards: permitting "I do not know", grounding in evidence, verifying, and
  auditing progress claims against tool results.
- **E** — output consistency: specified formats, examples instead of abstract description, and
  structured output.
- **F** — injection and jailbreak defenses: content as data, least privilege, labeling and isolating
  untrusted content, and red-teaming.
- **G** — prompt-leak defenses, proportionate to the secrets that the prompt actually holds.

## Why the skill supplies criteria instead of scoring them

The rule is the following test: a shared component may score when its criteria apply unchanged to
every kind of prompt that the component reads. These criteria fail that test. `B4` applies hardest
to a prompt that finds, reviews, or audits. `C8`'s "broadly" depends on what the prompt spans. `F4`
gains a second dimension when the prompt's
output reaches a parent session. A scorer inside this skill would need the caller to supply that
context, and would then do the caller's work with less information than the caller already holds.

[writing-simplified-technical-english](../writing-simplified-technical-english/README.md) is the
contrasting case, and that skill does score. A passive construction with an ambiguous actor is a
violation in a `SKILL.md`, in a subagent definition, and in a proposal alike, so an agent applying
those twelve conventions never needs to ask which kind of prompt it is reading.

## Behavior notes

- **The criterion keys are a contract.** Renaming a key breaks every caller's report and every eval
  that greps for that key. Add a criterion rather than renumbering the existing keys.
- **Four criteria overlap a criterion that the caller keeps.** `C2`, `E2`, `F2`, and `F5` each name
  the caller's criterion by description rather than by key, because the key differs for each caller.
- **The skill fetches no URL.** `references/prompt-criteria.md` carries a `last-synced` date and the
  source URL behind each group. A caller reads that date and records the criteria's age in the
  caller's own report; it does not refresh the criteria mid-review. Refreshing them — fetching those
  URLs and reconciling the file — is maintenance a maintainer does.
- **The skill pins no model.** The skill judges nothing, so the skill runs on whatever model the
  caller runs on.
