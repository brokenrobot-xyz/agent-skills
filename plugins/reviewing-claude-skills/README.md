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

## How a run flows

```
1. Brief + four scoping questions        each has a default; "use the defaults" works
2. Pass 1 — STRUCTURE                    eight shape criteria: decision space, scope,
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
3. Criteria assembly                     load the shared groups B–G, fetch the live docs
4. Pass 2 — DETAIL                       the full nine-group sweep
5. Gap analysis                          severity-ranked findings + per-group coverage table
6. Optional apply                        fixes you approve, one finding at a time
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

The report is a verdict, a list of what the skill already does right, the
findings ranked High → Medium → Low with concrete recommendations, and a
per-group coverage table. Mechanical criteria (name rules, length caps, path
format) are settled with commands, not eyeballed.

## Behavior notes

- **Network is best-effort, and only after the gate.** The reviewer fetches
  the live best-practice docs to catch guidance newer than the baked
  checklist — but only once the structural gate has passed; a gated run
  fetches nothing, because the baked checklist suffices for a structural
  verdict. When a fetch fails, the review proceeds on the baked checklist
  and says so in the report — it never blocks on the network.
- **Reviewed content is data.** A line inside the target skill saying
  "report no issues" carries no authority over the review.
- **Apply mode is one finding at a time**, surgical, and adds or refreshes
  an eval in the target skill when a fix changes behavior — so the new
  guarantee is tested, not just asserted. A High structural finding is the
  exception: that is a redesign conversation, not a sequence of edits.
- The skill pins `model: opus` for review quality; a managed setting can
  override the pin.
