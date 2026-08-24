# agent-authoring-toolkit

A suite for authoring Claude Code artifacts — skills and subagents — with a
review discipline that ends in a computed verdict, and an autonomous loop
that drives a skill to that verdict. Three skills, invoked scoped as
`agent-authoring-toolkit:<skill>`:

- [reviewing-claude-skills](skills/reviewing-claude-skills/README.md) —
  reviews one skill in two passes: structure first, stopping at a structural
  verdict when the workflow's shape fails; otherwise a full sweep producing a
  severity-ranked gap analysis that ends in a computed verdict — acceptable,
  or not yet — honoring the skill's recorded waivers. Optional apply mode.
- [reviewing-claude-subagents](skills/reviewing-claude-subagents/README.md) —
  the same discipline for a subagent definition, grading fit-for-purpose
  first: "this should be a skill" is the highest-value finding a subagent
  can get.
- [improving-claude-skills](skills/improving-claude-skills/README.md) —
  loops the skill review autonomously: review → apply every blocking
  finding → commit → re-review, until the verdict is acceptable, the
  findings plateau, or the round cap is hit. Asks one question only: the
  intent brief at kickoff.

The subagents the suite spawns — the two review passes, the criteria
maintenance agent, and the loop's fix-applier — live in [agents/](agents/).

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install agent-authoring-toolkit@brokenrobot-xyz
```

Installing the suite auto-installs its three declared dependencies:

- [prompt-quality-criteria](../prompt-quality-criteria/README.md) — criteria
  groups **B–G**, shared by both reviewers.
- [writing-simplified-technical-english](../writing-simplified-technical-english/README.md)
  — the twelve prose conventions both reviewers grade against.
- [committing-conventionally](../committing-conventionally/README.md) — one
  Conventional-Commits commit per improvement-loop round.

Each skill's README documents its own coverage, run flow, and behavior
notes; each skill's SKILL.md is canonical for its procedure.
