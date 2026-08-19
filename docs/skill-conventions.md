# Skill naming, splitting, and dependency conventions

Conventions for `brokenrobot-xyz/agent-skills`. Codes cited here resolve as follows: `A…` and
`R…` codes are criteria in the two reviewers' checklists,
`plugins/reviewing-claude-skills/references/best-practices-checklist.md` and
`plugins/reviewing-claude-subagents/references/best-practices-checklist.md`; `D15` is rule 3 of the
split test below, which this document records.

## When to create a new skill

A skill may offer more than one mode. Modes are not a reason to split. Apply this test:

1. **Same subject, same criteria, different output → one skill with two modes.**
   `writing-simplified-technical-english` applies the twelve conventions to the same prose in both
   its check and revise modes; only the output differs. Both reviewers are the same shape: analyse
   and apply share criteria and subject.
2. **Different subject, or different criteria → separate skills.** Two responsibilities in one
   skill make its `description` vague, and a vague description is what stops the right skill being
   selected.
3. **A consumer must grade with the criteria itself → extract the criteria as its own skill**,
   regardless of rules 1 and 2.

Rule 3 is `D15`. Criteria groups B–G cannot be scored without knowing the artifact, so each reviewer
must score them itself, so the criteria have to be separable — which is why `prompt-quality-criteria`
exists. The twelve prose conventions are artifact-independent, so
`writing-simplified-technical-english` grades for every caller and nothing needs its conventions
alone. That asymmetry, not tidiness, decides where a skill's boundary falls.

Both reviewers score this test as `R12`. The criterion carries the split cost in both directions, so
it can produce a finding against an unnecessary split as well as against an overloaded artifact.

## What splitting costs

Weigh these before splitting for tidiness alone. They are permanent; the benefits of a split are
usually conceptual.

- **Startup context, forever.** Each skill's `name` and `description` load at startup for every
  skill, at roughly 100 tokens each. A second skill pays that in every session, used or not.
- **Routing competition.** Two skills with adjacent descriptions match the same prompts, and Claude
  selects from all of them. Anthropic states this for subagents — "defining too many specialist
  agents reduces automatic delegation reliability" — and the selection mechanism for skills is the
  same one.
- **A dependency that can fail.** The half that does the work needs the half that holds the
  criteria. It either invokes it, adding a hop and a failure mode, or restates the criteria, which
  is an `R3` drift finding.
- **Redundancy with progressive disclosure.** If the motivation is that a body of criteria is
  bulky, `references/` already solves that without a second skill.

## Naming

- **Gerund** (`verb` + `-ing`) names a skill that **does** something — `committing-conventionally`,
  `reviewing-claude-skills`.
- **Noun phrase** names a skill that **is** content the caller works from — `prompt-quality-criteria`.
  Suffix a rubric with `-criteria`.

`A1` permits both forms; this section narrows the choice to one form per kind.

**Subagents** take a different form, because a subagent is a worker rather than a procedure:
`<object>-<agent-noun>`, where the noun says what the agent **is** and the object says what it works
on — `structure-reviewer`, `detail-reviewer`, `criteria-refresher`, `dependency-update-researcher`.
No gerunds, because a gerund names the step that spawns the agent, not the agent.

Both reviewers score the name form as `R6`: the skills reviewer against the two skill forms, the
subagents reviewer against the subagent form. Both read this section.

**A known exception, left deliberately.** `writing-simplified-technical-english` is named for its
revise mode, while check mode is what both reviewers depend on. Its `description` states check mode,
and descriptions are what drive selection, so the name misleads a human reader more than it misleads
Claude. Renaming would break every `R7` reference for a cosmetic gain. Leave it.

## Invoking another skill

A caller reaches another skill through the Skill tool. Four things must be true of the step that
does the invoking, and **the step itself is where they belong**. A separate "Dependencies" section
would restate the step and then drift from it.

Every step that invokes another skill states:

1. **The plugin-scoped name.** The form is `plugin:skill`. Where a plugin's name matches its skill's
   name — the case for every single-skill plugin in this repository — the scoped form doubles, as in
   `writing-simplified-technical-english:writing-simplified-technical-english`. A suite plugin's
   skills scope under the suite's name, as in `frontend-toolkit:updating-dependencies`. An unscoped
   name is not guaranteed to resolve when several plugins are installed.
2. **The mode**, where the invoked skill has more than one. "Invoke it in check mode" rather than
   "invoke it", because the wrong mode returns the wrong kind of result: revise mode edits the file
   the caller only meant to grade.
3. **What the step consumes** from the result, and where that goes. "Fold its violations into `R7`."
   A step that invokes a skill without saying what it does with the answer leaves the model to guess,
   and the guess varies by run.
4. **What the step does when the skill is unavailable, and what is lost.** Dependency resolution is
   not guaranteed on every host. A caller that omits this degrades silently, and a silent
   degradation reads to the user as a clean result rather than an ungraded one.

Both reviewers score invocation completeness as `R13`. It is separate from the manifest cross-check
below because no cross-check reaches it: a step naming the right skill in the manifest can still
omit the mode, the consumed result, and the absent-dependency behaviour.

## Keeping the manifest and the procedure in agreement

Every skill named by an invoking step is declared as a dependency in the caller's
`.claude-plugin/plugin.json`, and every declared dependency is invoked by some step.

The overlap between the two is deliberate. The manifest says what gets installed; the step says what
it is for. Because they carry different information about the same edge, a disagreement between them
is detectable — a declared dependency nothing invokes is dead weight, and an invoked skill nothing
declares fails on a clean install. That is the opposite of the `metadata`-restating-`description`
case recorded below, where one side carried no information the other lacked. `R3` covers this
cross-check.

There are four invocation edges, and each needs all four statements above:

| Caller                       | Invoked skill                          | Mode   | Consumed as                                        |
| :--------------------------- | :------------------------------------- | :----- | :------------------------------------------------- |
| `reviewing-claude-skills`    | `prompt-quality-criteria`              | supply | Criteria the caller scores against, for groups B–G |
| `reviewing-claude-skills`    | `writing-simplified-technical-english` | check  | Violations folded into `R7`                        |
| `reviewing-claude-subagents` | `prompt-quality-criteria`              | supply | Criteria the caller scores against, for groups B–G |
| `reviewing-claude-subagents` | `writing-simplified-technical-english` | check  | Violations folded into `R7`                        |

## Why there is no role field

An earlier version of this document defined three skill roles — `capability`, `grader`, `supplier` —
and declared them in a `metadata` field. That was withdrawn. Three reasons, recorded so the idea is
not proposed again:

1. **The set was not derived.** Two roles came from `D15`. The third was added to absorb a
   counterexample, and the axis that unified all three was written afterwards to fit.
2. **Role is caller-relative.** `writing-simplified-technical-english` is a grader when a reviewer
   invokes its check mode, and is not one when a person invokes its revise mode. A field in the
   callee's own frontmatter cannot express something that varies by caller.
3. **The field would restate the `description`.** A skill's modes are already advertised where
   discovery happens. Declaring them again in `metadata` is the unsourced restatement `R3` treats as
   drift.

What survived is the part that decides something: the split test above.

## Sources

**Sourced — re-check when the source changes:**

| Rule                                                                                  | Source                                                                                                                                                                            |
| :------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gerund form is preferred for a skill name; a noun phrase is acceptable                | [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)                                                                |
| `name` and `description` load at startup for all skills, at roughly 100 tokens each   | [Agent Skills specification](https://agentskills.io/specification)                                                                                                                |
| The `description` drives selection among many skills                                  | [Skill authoring best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)                                                                |
| Too many specialist agents reduces automatic delegation reliability                   | [How and when to use subagents](https://claude.com/blog/subagents-in-claude-code) — stated for subagents; applied here to skills by inference from the shared selection mechanism |
| `references/` plus progressive disclosure holds bulky material without a second skill | [Agent Skills specification](https://agentskills.io/specification)                                                                                                                |
| A skill runs in the caller's context; a subagent runs isolated                        | [Steering Claude Code](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)                                                                        |

**House rules — no external source. Change them by deciding to, not by re-syncing:**

- The split test, and the priority of rule 3 over rules 1 and 2.
- The mapping from kind of skill to grammatical name form.
- The `-criteria` suffix for a rubric.
- `D15` itself, which rests on one sourced fact — a skill loads into the caller's context rather
  than an isolated one — and on a judgement that criteria groups B–G cannot be scored without
  knowing the artifact.
