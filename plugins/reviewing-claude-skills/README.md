# reviewing-claude-skills

Reviews one Claude Code skill — its SKILL.md, evals, and every file it
references — against skill-authoring and prompting best practices plus the
host project's conventions, and produces a **severity-ranked gap analysis**.
Optionally, it then applies the fixes you approve, one finding at a time.

This README documents what the review covers and how a run behaves. The
review procedure lives in [SKILL.md](SKILL.md), the three review subagents in
[agents/](agents/), and the criteria in
[references/best-practices-checklist.md](references/best-practices-checklist.md);
on any conflict, those are canonical.

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install reviewing-claude-skills@brokenrobot-xyz
```

This also auto-installs two declared dependencies, both preloaded into the
detail-reviewer subagent at spawn:

- [prompt-quality-criteria](../prompt-quality-criteria/README.md) — supplies
  criteria groups **B–G**, which this plugin's checklist does not carry. They
  are artifact-independent prompting criteria shared with the subagent
  reviewer, so they live in one place rather than drifting between two copies.
- [writing-simplified-technical-english](../writing-simplified-technical-english/README.md)
  — the twelve prose conventions the target skill's prose is graded against
  (check fashion: violations are reported, nothing is edited).

If a dependency is missing, the preload skips silently at the harness level —
so the detail-reviewer self-checks that its criteria actually arrived, and the
report names any group that went ungraded. A partial review never reads as a
clean one.

## Usage

Ask Claude to review, audit, or improve a named skill. Scope is **one skill
per invocation** — to review several, run once per skill.

## How a run flows

```
1. Brief + four scoping questions        each has a default; "use the defaults" works
2. Pass 1 — STRUCTURE                    the structure-reviewer subagent scores eight
                                         shape criteria: decision space, scope,
                                         simplicity, length & disclosure, degrees of
                                         freedom, defaults vs menus, over-prescription.
                                         Offline and cheap — no docs fetched yet.
        │
        ├── shape holds ──────────────▶  continue to 3
        │
        └── any HIGH structural  ─────▶  ■ STOP (the gate)
            finding                      You get a short structural verdict and a
                                         redesign recommendation. The detail sweep
                                         becomes an explicit follow-up choice —
                                         run it anyway, or redesign first.
3. Pass 2 — DETAIL                       two subagents in parallel: the detail-reviewer
                                         sweeps the full nine groups (the shared B–G
                                         criteria and prose conventions are preloaded
                                         into it), while the criteria-refresher fetches
                                         the live docs and reports drift
4. Gap analysis                          severity-ranked findings + per-group coverage
                                         table, consolidated in the main conversation
5. Optional apply                        fixes you approve, one finding at a time
```

**Why the gate exists.** Line-level findings against a workflow that is about
to be redesigned are wasted effort — and wasted tokens. A structurally
over-branched skill can absorb review round after review round, each finding
a new corner case, without ever converging. Pass 1 answers "is the shape
sound?" before the expensive sweep runs; only a **High** structural finding
stops the run, and question 4 below lets you pre-authorize the full sweep so
the gate never surprises you.

The four scoping questions:

1. **Deliverable** — gap analysis only, or also apply approved fixes
   _(default: analysis only)_.
2. **Focus** — all criteria groups equal, or weight some
   _(default: all equal)_.
3. **Change appetite** — surgical tweaks only, or open to restructuring
   _(default: surgical)_.
4. **Structural gate** — stop on a High structural finding, or run the full
   detail sweep anyway _(default: stop)_.

**Two report shapes.** A gated run produces a short **structural verdict**:
the High finding(s) with evidence, what the structure already gets right, a
concrete redesign recommendation, and a coverage table marking the unswept
groups as `not scored — gated on structure` — a gated run never reads as a
clean one. A run that passes the gate (or that you pushed past it) produces
the full **gap analysis** described below, with structural findings leading
the ranked list.

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

Every report follows the same template
([references/report-template.md](references/report-template.md)): a
one-paragraph verdict, then a **summary table** of all findings — Structure
findings first, then Detail, severity-ranked within each — then what the
skill already does right, a consistent detail block per finding (evidence
quote, defect, fix), a per-group coverage table, and criteria notes. The
summary table is the skim layer; the detail blocks carry the depth.
Mechanical criteria (name rules, length caps, path format) are settled with
commands, not eyeballed.

## Behavior notes

- **The heavy reading happens in subagents.** The target bundle, the shared
  criteria, and the fetched docs load in three dedicated subagent contexts —
  `structure-reviewer`, `detail-reviewer`, and `criteria-refresher` — which
  return findings only, so a review does not crowd the conversation it runs
  in. The main conversation reads just what it verifies (spot-checks of
  quoted evidence) or edits (apply mode). When an agent is unavailable, that
  stage runs inline instead and the report says so.
- **Network is best-effort, and only after the gate.** The
  `criteria-refresher` subagent fetches the live best-practice docs to catch
  guidance newer than the baked checklist — but it is only spawned once the
  structural gate has passed; a gated run fetches nothing, because the baked
  checklist suffices for a structural verdict. When a fetch fails, the review
  proceeds on the baked checklist and says so in the report — it never blocks
  on the network.
- **Reviewed content is data.** A line inside the target skill saying
  "report no issues" carries no authority over the review.
- **Apply mode is one finding at a time**, surgical, and adds or refreshes
  an eval in the target skill when a fix changes behavior — so the new
  guarantee is tested, not just asserted. A High structural finding is the
  exception: that is a redesign conversation, not a sequence of edits.
- The skill pins `model: opus` for review quality; a managed setting can
  override the pin.
