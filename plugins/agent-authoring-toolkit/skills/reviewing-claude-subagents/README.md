# reviewing-claude-subagents

Reviews one Claude Code subagent definition — its frontmatter, its body, the tools it declares, and
the siblings it competes with for routing — against subagent-authoring and prompting best practices
plus the host project's conventions, and produces a **severity-ranked gap analysis**. Optionally, the reviewer
then applies the fixes you approve, one finding at a time.

This README documents what the review covers and how a run behaves. The review procedure lives in
[SKILL.md](SKILL.md) and the criteria in
[references/best-practices-checklist.md](references/best-practices-checklist.md); on any conflict,
those two files are canonical.

## Install

This skill ships in the [agent-authoring-toolkit](../../README.md) plugin:

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install agent-authoring-toolkit@brokenrobot-xyz
```

The install command also installs two declared dependencies this skill uses:

- [prompt-quality-criteria](../../../prompt-quality-criteria/README.md) — supplies criteria groups **B–G**,
  which this skill's checklist does not carry. They are prompt criteria shared with
  [reviewing-claude-skills](../reviewing-claude-skills/README.md), so they live in one place rather
  than drifting between two copies.
- [writing-simplified-technical-english](../../../writing-simplified-technical-english/README.md) — invoked
  in check mode to grade the subagent's body prose.

On a host with no dependency resolution the reviewer still runs, and names in the report which groups
went ungraded, so a partial review never reads as a clean one.

## Usage

Ask Claude to review, audit, or improve a named subagent. Scope is **one subagent per invocation** —
to review several, run once per subagent.

A run starts with a short brief and three scoping questions, each with a default, so "use the
defaults" works:

1. **Deliverable** — the gap analysis alone, or also apply the fixes you approve. _(default: analysis
   only)_
2. **Focus** — weight every group equally, or weight some higher. _(default: all equal)_
3. **Change appetite** — surgical tweaks, or open to restructuring. _(default: surgical)_

The reviewer resolves the subagent from `.claude/agents/`, `~/.claude/agents/`, or an enabled plugin's
`agents/` directory, searching each recursively.

## What the review checks

Nine groups. This skill's checklist defines fifty-five criteria, and `prompt-quality-criteria` supplies groups **B**–**G** on top of them. Findings cite the criterion key.

**From this skill's checklist**

- **A — subagent authoring**, twenty-eight criteria in eight parts: fit-for-purpose, routing, the return
  contract, context inheritance, tools and permissions, frontmatter validity, body craft, and the task
  contract.
- **H — evals methodology**, thirteen portable criteria plus one that replaces the skill standard's
  schema requirement. Subagents have no eval convention, so a subagent shipping no evals scores `N/A`
  and the report says the group went unmeasured.
- **R — craft and project conventions**, thirteen criteria. Two of them read the host project's own
  documents and score `N/A` when the project defines no rule.

**From `prompt-quality-criteria`**

- **B** model-specific prompting, **C** general prompting, **D** hallucination guards, **E** output
  consistency, **F** injection and jailbreak defenses, **G** prompt-leak defenses.

## The three things this reviewer looks for that a skill reviewer cannot

- **Fit-for-purpose, graded first.** "This should be a skill" is the highest-value finding available
  for a subagent, and it changes what the rest of the review is worth. A definition that should not be
  a subagent does not need its `tools` list tuned.
- **Instructions the declared tools cannot perform.** A body that says "use the X skill" without
  `Skill` in `tools`, or that tells the subagent to ask the user something, describes work the
  subagent cannot do. The defect is silent at authoring time. It fired on three of the five real
  subagents used to validate this checklist.
- **Context the subagent already has.** A non-fork subagent receives the whole `CLAUDE.md` hierarchy
  on every delegation. A body restating those rules pays for them twice and lets the two copies drift.

## Behavior notes

- **Static analysis only.** The reviewer reads a definition and never spawns the subagent, so every
  finding predicts behavior rather than observing it. The report marks confidence wherever the
  reviewer cannot demonstrate a finding from the file.
- **The criteria track a moving target.** No open standard governs subagents, so Claude Code's
  documentation is normative, and Anthropic revises it often. The checklist carries a `last-synced` date, every
  review reports that date and its age instead of fetching anything, and bringing the checklist
  back in line with its sources is maintenance done outside a review.
- **The reviewer reads two fields from each sibling.** `A2` needs each sibling's `name` and `description` to
  judge overlapping remits, and its comparison set includes the built-in subagents, which compete in
  the same roster. The review writes no per-sibling finding, because it covers one subagent.
- **The reviewer never rewords a `description` for prose style.** It drives routing, so `R7` excludes it and
  only `A3`, `A4`, or `A5` can change it.
- **Report-only by default.** Unless you chose analysis and apply, the reviewer edits no file. When
  you did choose it, the reviewer edits one finding at a time.
