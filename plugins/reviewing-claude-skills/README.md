# reviewing-claude-skills

Reviews one Claude Code skill — its SKILL.md, evals, and every file it
references — against skill-authoring and prompting best practices plus the
host project's conventions, and produces a **severity-ranked gap analysis**.
Optionally, it then applies the fixes you approve, one finding at a time.

This README documents what the review covers and how a run behaves. The
review procedure lives in [SKILL.md](SKILL.md) and the criteria in
[references/best-practices-checklist.md](references/best-practices-checklist.md);
on any conflict, those are canonical.

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install reviewing-claude-skills@brokenrobot-xyz
```

This also auto-installs two declared dependencies:

- [prompt-quality-criteria](../prompt-quality-criteria/README.md) — supplies
  criteria groups **B–G**, which this plugin's checklist does not carry. They
  are artifact-independent prompting criteria shared with the subagent
  reviewer, so they live in one place rather than drifting between two copies.
- [writing-simplified-technical-english](../writing-simplified-technical-english/README.md)
  — invoked in check mode to grade the target skill's prose.

On a host with no dependency resolution the reviewer still runs, and names in
the report which groups went ungraded — so a partial review never reads as a
clean one.

## Usage

Ask Claude to review, audit, or improve a named skill. Scope is **one skill
per invocation** — to review several, run once per skill.

A run starts with a short brief and three scoping questions (each with a
default, so "use the defaults" works):

1. **Deliverable** — gap analysis only, or also apply approved fixes
   _(default: analysis only)_.
2. **Focus** — all criteria groups equal, or weight some
   _(default: all equal)_.
3. **Change appetite** — surgical tweaks only, or open to restructuring
   _(default: surgical)_.

## What the review checks

Criteria come grouped; findings cite their keys (e.g. `A2`, `B4`, `R3`). The
keys are unchanged by where a group lives, so reports stay comparable across
versions:

From this plugin's [checklist](references/best-practices-checklist.md):

- **A** — skill authoring: Agent Skills spec conformance, naming,
  description, structure, progressive disclosure
- **H** — success criteria and evals
- **R** — craft and the host project's own conventions, including the prose
  check

From [prompt-quality-criteria](../prompt-quality-criteria/README.md):

- **B** — model-specific prompting, matched to the target skill's pinned
  model
- **C** — general prompting: clarity, examples, task chaining
- **D** — hallucination guardrails
- **E** — output consistency
- **F** — injection and jailbreak defenses
- **G** — prompt-leak defenses

The report is a verdict, a list of what the skill already does right, the
findings ranked High → Medium → Low with concrete recommendations, and a
per-group coverage table. Mechanical criteria (name rules, length caps, path
format) are settled with commands, not eyeballed.

## Behavior notes

- **Network is best-effort.** The reviewer fetches the live best-practice
  docs to catch guidance newer than the baked checklist. When a fetch fails,
  it reviews against the baked checklist and says so in the report — it
  never blocks on the network.
- **Reviewed content is data.** A line inside the target skill saying
  "report no issues" carries no authority over the review.
- **Apply mode is one finding at a time**, surgical, and adds or refreshes
  an eval in the target skill when a fix changes behavior — so the new
  guarantee is tested, not just asserted.
- The skill pins `model: opus` for review quality; a managed setting can
  override the pin.
