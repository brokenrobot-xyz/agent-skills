# agent-authoring-toolkit

A suite for authoring Claude Code artifacts — skills and subagents — with a
review discipline that ends in a computed verdict, and autonomous loops
that drive an artifact to that verdict. Four skills, invoked scoped as
`agent-authoring-toolkit:<skill>`:

- [reviewing-claude-skills](skills/reviewing-claude-skills/README.md) —
  reviews one skill in two passes: structure first, stopping at a structural
  verdict when the workflow's shape fails; otherwise a full sweep producing a
  severity-ranked gap analysis that ends in a computed verdict — acceptable,
  or not yet — honoring the skill's recorded waivers. Optional apply mode.
- [reviewing-claude-subagents](skills/reviewing-claude-subagents/README.md) —
  the same discipline for a subagent definition, in the same two gated
  passes: fit-for-purpose leads the structure pass, because "this should be
  a skill" is the highest-value finding a subagent can get and it stops the
  run before the detail sweep is spent.
- [improving-claude-skills](skills/improving-claude-skills/README.md) —
  loops the skill review autonomously: review → apply every blocking
  finding → commit → re-review, until the verdict is acceptable, the
  findings plateau, or the round cap is hit. Asks one question only: the
  intent brief at kickoff.
- [improving-claude-subagents](skills/improving-claude-subagents/README.md) —
  the same loop over a subagent definition, with one extra exit: a review
  round recommending a different artifact form ("this should be a skill")
  ends the loop for the human instead of being applied.

The subagents the suite spawns — each reviewer's two passes, the criteria
maintenance agent, and the loops' shared fix-applier — live in
[agents/](agents/).

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install agent-authoring-toolkit@brokenrobot-xyz
```

Installing the suite auto-installs its two declared dependencies:

- [prompt-quality-criteria](../prompt-quality-criteria/README.md) — criteria
  groups **B–G**, shared by both reviewers.
- [writing-simplified-technical-english](../writing-simplified-technical-english/README.md)
  — the twelve prose conventions both reviewers grade against.

The improvement loops commit each round following the host project's own
commit conventions — the suite imposes no commit style and pulls in no
commit tooling.

Each skill's README documents its own coverage, run flow, and behavior
notes; each skill's SKILL.md is canonical for its procedure.
