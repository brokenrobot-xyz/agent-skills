# prompt-quality-criteria

Supplies criteria groups **B–G** for grading a Markdown prompt that steers
Claude — a skill's `SKILL.md` body, a subagent definition's body, or any
agent-facing instructions. It returns the criteria and **grades nothing**; the
caller holds the artifact, so the caller assigns severity and writes the
findings.

This README says what the rubric covers and why it supplies rather than
grades. The criteria live in
[references/prompt-criteria.md](references/prompt-criteria.md) and the
procedure in [SKILL.md](SKILL.md); on any conflict, those are canonical.

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install prompt-quality-criteria@brokenrobot-xyz
```

It auto-installs alongside
[reviewing-claude-skills](../reviewing-claude-skills/README.md), which
declares it as a dependency. Installing it directly is also fine — the
criteria are useful on their own.

## Usage

Two callers, two behaviors:

- **Another skill invokes it** — the criteria load into that skill's context
  and it scores its own artifact against them. The rubric asks the user
  nothing and edits nothing, so it never interrupts a review the user already
  scoped.
- **You invoke it directly** — ask what to check in a prompt you name, and it
  presents the criteria and scores that prompt, because in that case there is
  no other caller to do the scoring.

## What the criteria cover

Findings cite the keys as written (e.g. `B4`, `D1`, `F5`). The keys are stable
across callers, so two reviewers' reports stay comparable. Thirty-two criteria
in six groups:

- **B** — model-specific prompting, matched to the artifact's pinned model
  (Sonnet 5, Opus 5, Opus 4.8, Fable 5/Mythos 5). Conditional: apply only the
  matching subset.
- **C** — general Claude prompting: clarity, examples, structure, chaining,
  explicit scope, confirmation before irreversible actions.
- **D** — hallucination guards: permitting "I don't know", grounding in
  evidence, verification, auditing progress claims against tool results.
- **E** — output consistency: specified formats, examples over abstraction,
  structured output.
- **F** — injection and jailbreak defenses: content-as-data, least privilege,
  labeling and isolating untrusted content, red-teaming.
- **G** — prompt-leak defenses, proportionate to the secrets the artifact
  actually holds.

## Why it supplies criteria instead of grading them

The rule is artifact-dependence. A component may grade when its criteria hold
regardless of what it is reading. These do not: `B4` bites hardest on a
review-shaped prompt, `C8`'s "broadly" depends on what the artifact spans, and
`F4` gains a second dimension when the artifact's output flows into a parent
session. A grader here would need the caller to hand over that context, and
would then be doing the caller's job with less information than the caller
already has.

The contrast is
[writing-simplified-technical-english](../writing-simplified-technical-english/README.md),
which does grade: a passive construction with an ambiguous actor is a
violation in a `SKILL.md`, in a subagent definition, and in a proposal alike,
so its conventions never need to ask what the artifact is.

## Behavior notes

- **The keys are a contract.** Renaming one breaks every caller's reports and
  every eval that greps for it. Add criteria rather than renumbering.
- **A few criteria overlap ones the caller keeps** — skill-authoring
  conformance, eval coverage, tool permissions. Those name the caller's
  criterion by description rather than by key, because the key differs per
  caller.
- **It fetches nothing.** The file carries a `last-synced` date and the source
  URL behind each group; a caller that refreshes criteria live fetches those
  and notes staleness in its own report. This skill holds no report to note it
  in.
- **No model pin.** It does no judgment work of its own, so it runs on
  whatever the caller runs on.
