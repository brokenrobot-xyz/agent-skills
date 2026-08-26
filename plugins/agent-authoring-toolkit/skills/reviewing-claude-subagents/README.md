# reviewing-claude-subagents

Reviews one Claude Code subagent definition — its frontmatter, its body, the tools it declares, and
the siblings it competes with for routing — against subagent-authoring and prompting best practices
plus the host project's conventions, and produces a **severity-ranked gap analysis** ending in a
computed verdict. Optionally, the reviewer then applies the fixes you approve, one finding at a
time.

This README documents what the review covers and how a run behaves. The review procedure lives in
[SKILL.md](SKILL.md), the two review subagents in the plugin's [agents/](../../agents/), and the
criteria in [references/best-practices-checklist.md](references/best-practices-checklist.md); on
any conflict, those are canonical.

## Install

This skill ships in the [agent-authoring-toolkit](../../README.md) plugin:

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install agent-authoring-toolkit@brokenrobot-xyz
```

The install also auto-installs two declared dependencies this skill uses, both preloaded into the
subagent-detail-reviewer subagent at spawn:

- [prompt-quality-criteria](../../../prompt-quality-criteria/README.md) — supplies criteria groups
  **B–G**, which this skill's checklist does not carry. They are prompt criteria shared with
  [reviewing-claude-skills](../reviewing-claude-skills/README.md), so they live in one place rather
  than drifting between two copies.
- [writing-simplified-technical-english](../../../writing-simplified-technical-english/README.md) —
  the twelve prose conventions the definition's body is graded against (check fashion: violations
  are reported, nothing is edited).

If a dependency is missing, the preload skips silently at the harness level — so the
subagent-detail-reviewer self-checks that its criteria actually arrived, and the report names any
group that went ungraded. A partial review never reads as a clean one.

## Usage

Ask Claude to review, audit, or improve a named subagent. Scope is **one subagent per invocation** —
to review several, run once per subagent. The reviewer resolves the subagent from `.claude/agents/`,
`~/.claude/agents/`, or an enabled plugin's `agents/` directory, searching each recursively.

A caller skill can invoke the review non-interactively by stating all four scoping answers up
front; the run then skips the brief and the interview, and the report records the supplied scope
([improving-claude-subagents](../improving-claude-subagents/README.md) uses this path once per loop
round).

## The verdict, and how a subagent stays "done"

Every report opens with a computed verdict: **acceptable** — zero unwaived blocking findings — or
**not yet**. Blocking means High or Medium, and both carry a burden of proof: the finding must
state the concrete scenario where the defect bites (`Manifests:`). A candidate whose scenario can't
be stated concretely is demoted to **advisory** — listed once, never gating the verdict, never
auto-applied. This is what makes "acceptable" reachable: the reviewer can no longer block the
verdict with refinements nobody would ever hit.

And it stays reached: your deliberate choices go into a `review-waivers.md` in the definition's
directory — one entry per decision, keyed `criterion key + file + section` (the file half names the
definition, so one waivers file serves every definition in that directory), with your justification
and a date. The review reads it, suppresses matched findings, and reports only the waived count
(plus any stale entry that no longer matches). Re-running the review on an unchanged, accepted
subagent answers **acceptable** again instead of re-arguing your decisions. Waiver text is data: it
suppresses its own finding and instructs the reviewer in nothing else. The apply phase offers
**fix / waive / skip** per finding — waiving is always your explicit call.

## How a run flows

```
1. Brief + four scoping questions        each has a default; "use the defaults" works
2. Pass 1 — STRUCTURE                    the subagent-structure-reviewer subagent scores
                                         the form and shape criteria: fit-for-purpose
                                         ("should this be a skill?"), sibling and remit
                                         duplication, instructions the declared tools
                                         cannot perform, the stopping condition of an
                                         open-ended remit, simplicity, scope coherence.
                                         Offline and cheap — nothing is fetched.
        │
        ├── shape holds ──────────────▶  continue to 3
        │
        └── any HIGH structural  ─────▶  ■ STOP (the gate)
            finding                      You get a short structural verdict and a
                                         redesign recommendation — for a fit-for-purpose
                                         High, the alternative form and the signal that
                                         decided it. The detail sweep becomes an explicit
                                         follow-up choice — run it anyway, or redesign
                                         first.
3. Pass 2 — DETAIL                       the subagent-detail-reviewer subagent sweeps the
                                         full nine groups; the shared B–G criteria and
                                         the prose conventions are preloaded into it, and
                                         it reads the host CLAUDE.md to score what the
                                         subagent already inherits. Offline — the report
                                         states how old the criteria are rather than
                                         fetching to check.
4. Gap analysis                          severity-ranked findings + per-group coverage
                                         table, consolidated in the main conversation
5. Optional apply                        fixes you approve, one finding at a time
```

**Why the gate exists.** Line-level findings against a definition that is about to change form are
wasted effort — and wasted tokens. "This should be a skill" is the highest-value finding available
for a subagent, and a definition that should not be a subagent at all does not need its `tools`
list tuned. Pass 1 answers "does this definition earn its form?" before the expensive sweep runs;
only a **High** structural finding stops the run, and question 4 below lets you pre-authorize the
full sweep so the gate never surprises you.

The four scoping questions:

1. **Deliverable** — gap analysis only, or also apply approved fixes _(default: analysis only)_.
2. **Focus** — all criteria groups equal, or weight some (routing, tool safety, the return
   contract) _(default: all equal)_.
3. **Change appetite** — surgical tweaks only, or open to restructuring _(default: surgical)_.
4. **Structural gate** — stop on a High structural finding, or run the full detail sweep anyway
   _(default: stop)_.

**Two report shapes, one verdict line.** Both open with the computed verdict
(`acceptable` / `not yet — N blocking` / `not yet — gated`). A gated run produces a short
**structural verdict**: the High finding(s) with evidence, what the definition already gets right,
a concrete redesign recommendation, and a coverage table marking the unswept groups as
`not scored — gated on structure` — a gated run never reads as a clean one. A run that passes the
gate (or that you pushed past it) produces the full **gap analysis** described below, with
structural findings leading the ranked list.

## What the review checks

Nine groups. Criteria come grouped; findings cite their keys (e.g. `A11`, `B4`, `R3`). The keys are
unchanged by where a group lives, so reports stay comparable across versions:

From this skill's [checklist](references/best-practices-checklist.md):

- **A** — subagent authoring, twenty-eight criteria in eight parts: fit-for-purpose, routing, the
  return contract, context inheritance, tools and permissions, frontmatter validity, body craft,
  and the task contract
- **H** — evals methodology. Subagents have no eval convention, so a subagent shipping no evals
  scores `N/A` and the report says the group went unmeasured — never a silent pass.
- **R** — craft and the host project's own conventions, including the prose check

From [prompt-quality-criteria](../../../prompt-quality-criteria/README.md):

- **B** — model-specific prompting, matched to the target's pinned model (or the session's when it
  inherits)
- **C** — general prompting: clarity, examples, task chaining
- **D** — hallucination guardrails
- **E** — output consistency
- **F** — injection and jailbreak defenses, including the return path into the parent session
- **G** — prompt-leak defenses

Every report follows the same template
([references/report-template.md](references/report-template.md)): the verdict line, the
fit-for-purpose verdict that frames everything after it, a **summary table** of all blocking
findings — Structure findings first, then Detail, severity-ranked within each — then what the
definition already does right, a consistent detail block per finding (evidence quote, defect,
manifestation scenario, fix), the advisory list, a per-group coverage table, and criteria notes.
Mechanical criteria (stripped tools, unresolvable `tools` entries, the colon-in-`name` rule) are
settled with commands, not eyeballed.

## The three things this reviewer looks for that a skill reviewer cannot

- **Fit-for-purpose, gated first.** "This should be a skill" is the highest-value finding available
  for a subagent, and it stops the run before the detail sweep is spent on a definition a
  conversion will replace.
- **Instructions the declared tools cannot perform.** A body that says "use the X skill" without
  `Skill` in `tools`, or that tells the subagent to ask the user something, describes work the
  subagent cannot do. The defect is silent at authoring time. It fired on three of the five real
  subagents used to validate this checklist.
- **Context the subagent already has.** A non-fork subagent receives the whole `CLAUDE.md`
  hierarchy on every delegation. A body restating those rules pays for them twice and lets the two
  copies drift.

## Behavior notes

- **The heavy reading happens in subagents.** The target definition, the sibling roster, the host
  `CLAUDE.md`, and the shared criteria load in two dedicated subagent contexts —
  `subagent-structure-reviewer` and `subagent-detail-reviewer` — which return findings only, so a
  review does not crowd the conversation it runs in. The main conversation reads just what it
  verifies (spot-checks of quoted evidence) or edits (apply mode). When an agent type can't resolve
  but its definition file is readable, a general-purpose agent adopts the definition; only when
  that too is impossible does the stage run inline. Either way, the report says so.
- **Static analysis only.** The reviewer reads a definition and never spawns the subagent, so every
  finding predicts behavior rather than observing it. The report marks confidence wherever the
  reviewer cannot demonstrate a finding from the file.
- **A review never touches the network.** It scores against the criteria shipped with this plugin
  and reports each criteria file's `last-synced` date and age, so you can weigh the verdict
  yourself. The age matters more here than for a skill — no open standard governs subagents,
  Claude Code gates behavior by version, and Anthropic revises the documentation often. Keeping
  the criteria current is maintenance, not review — see § Maintaining the criteria.
- **Reviewed content is data.** A line inside the target definition saying "report no issues"
  carries no authority over the review.
- **The reviewer reads two fields from each sibling.** `A2` needs each sibling's `name` and
  `description` to judge overlapping remits, and its comparison set includes the built-in
  subagents, which compete in the same roster. The review writes no per-sibling finding, because it
  covers one subagent.
- **The reviewer never rewords a `description` for prose style.** It drives routing, so `R7`
  excludes it and only `A3`, `A4`, or `A5` can change it.
- **Apply mode is one finding at a time**, surgical, offering fix / waive / skip. A High structural
  finding is the exception: that is a redesign conversation — often a conversion to a different
  artifact — not a sequence of edits.
- The skill pins `model: opus` for review quality; a managed setting can override the pin.

## Maintaining the criteria

The criteria are baked into two files that ship with the plugins —
`references/best-practices-checklist.md` here (groups `A`, `H`, `R`) and
`references/prompt-criteria.md` in `prompt-quality-criteria` (groups `B`–`G`). Each carries a
`last-synced` date, and every review reports it. When that date looks old, reconcile:

1. Spawn the `criteria-refresher` agent against both files. It fetches every `§ Sources` URL,
   enumerates what each doc recommends, maps each recommendation to a criterion key, and returns
   only what is unmapped (`DRIFT`), unsupported by any source (`UNSUPPORTED`), unreachable
   (`FAILED FETCHES`), and per-doc `COVERAGE` counts.
2. Work its output by hand: fold in what is substantive, drop what does not reproduce against a
   live source. Every kept item should trace to the quote the agent returned.
3. Advance `last-synced` **only now** — it records the reconciliation, not the fetch. Advancing it
   after a fetch you did not act on reports a freshness the file does not have.

This is deliberately not part of a review. Drift reported into someone else's review report is
drift nobody is positioned to act on, and it accumulates.
