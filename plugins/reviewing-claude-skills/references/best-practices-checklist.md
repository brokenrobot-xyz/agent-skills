# Reviewing-claude-skills checklist

The baked half of the reviewer's hybrid criteria. `SKILL.md` Step 2 tries to refresh the
source docs live (WebFetch the URLs below); when the network is unavailable it falls back to
this file and notes the staleness in the report.

**Groups `B`–`G` are not in this file.** They are artifact-independent prompting criteria shared
with the subagent reviewer, so they live in the `prompt-quality-criteria` skill, which `SKILL.md`
Step 2 invokes and Step 4 scores against. Their keys are unchanged, and a finding cites `B4` or
`F1` exactly as before.

**last-synced:** 2026-07-29 — re-fetch the URLs and reconcile any new guidance when this is stale.
The shared criteria carry their own `last-synced` date for the docs behind groups `B`–`G`.

## Contents

- [Sources](#sources)
- [A. Agent Skills authoring](#a-agent-skills-authoring)
- **B–G** — supplied by the `prompt-quality-criteria` skill, not by this file
- [H. Success criteria & evaluations](#h-success-criteria--evaluations)
- [R. Craft and project conventions](#r-craft-and-project-conventions)

## Sources

| Key | Doc                                                     | URL                                                                              |
| --- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A   | **Agent Skills specification** (the open standard)      | https://agentskills.io/specification                                             |
| A   | Agent & skill best practices                            | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |
| B–G | Supplied by the `prompt-quality-criteria` skill         | (that skill's `references/prompt-criteria.md` carries the source rows)           |
| H   | Define success criteria & build evaluations             | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests              |
| H   | **Evaluating skill output quality** (the open standard) | https://agentskills.io/skill-creation/evaluating-skills                          |

**Precedence — the open standard is the base.** The Agent Skills specification defines what a
valid skill _is_; a conflict with it is a finding. Anthropic's and Claude Code's docs _extend_ the
standard with platform guidance and extra frontmatter. Those extensions are permitted and often
useful, but they never override the spec, and a skill that leans on one is not portable to other
agents. Where a client **relaxes** a spec requirement, the spec's stricter form holds — Claude Code
lists `name` as optional and defaults it to the directory name, but `A1` still requires it. Where a
client adds a rule the spec does not have, that rule **narrows** the spec and is safe to apply — the
ban on `anthropic`/`claude` in a name is Anthropic-platform-only, so cite it as a platform note
rather than a spec violation.

Each item below is a pass criterion. Cite the criterion key (e.g. `A3`, `H10`) in findings. A few
items carry their evidence from a doc outside their own group; each of those names its source
inline, so a re-sync checks the page the item actually came from.

## A. Agent Skills authoring

- **A1 — name.** Required. 1–64 characters, lowercase letters, digits, and hyphens only; must not
  start or end with a hyphen, must not contain consecutive hyphens (`--`), and **must match the
  parent directory name** — a mismatch means other agents resolve the skill under a different name
  than it declares. No XML. Gerund preferred; noun phrase acceptable. _Platform note:_ Anthropic
  reserves `anthropic` and `claude` in names, which the open standard does not — report that as a
  Claude Code constraint, not a spec violation.
- **A2 — description POV.** Third person ("Reviews…", not "Review…" or "I/you"). It is injected
  into the system prompt; mixed POV hurts discovery.
- **A3 — description content.** Required and non-empty. States both _what_ the skill does and
  _when_ to use it, with concrete trigger terms. 1–1024 chars. Not vague ("helps with X").
- **A4 — length.** SKILL.md body under ~500 lines **and** under ~5000 tokens; overflow pushed to
  reference files. The two bounds are independent — dense prose can clear the line count and still
  blow the token budget, which is what actually competes with conversation context.
- **A5 — progressive disclosure.** SKILL.md is an overview that references detail files; it does
  not inline everything.
- **A6 — references one level deep.** All reference files link directly from SKILL.md, not from
  each other (nested refs get partially read).
- **A7 — reference TOC.** Reference files >100 lines start with a table of contents.
- **A8 — degrees of freedom.** Specificity matches task fragility: mechanical/fragile steps are
  scripted or exact (low freedom); judgment steps left open (high freedom). Deterministic lookups
  are not left as vague prose.
- **A9 — examples.** Concrete input→output examples where output quality depends on style/shape.
- **A10 — consistent terminology.** One term per concept throughout.
- **A11 — no time-sensitive info.** No "before August 2025…"; use a versioned/"old patterns"
  framing instead, because a dated instruction goes quietly wrong rather than failing loudly. (A
  dated `last-synced` metadata line is acceptable.)
- **A12 — forward-slash paths.** No Windows backslashes, because backslash paths error on Unix
  systems.
- **A13 — one default, not a menu.** Do not offer many interchangeable options; give a default with
  an escape hatch, because a menu makes the model deliberate where it should act.
- **A14 — scripts solve, don't defer.** Bundled scripts handle their own errors; no unexplained
  "voodoo constants"; dependencies listed.
- **A15 — MCP tools fully qualified.** `Server:tool_name`. Without the server prefix the model may
  fail to locate the tool, especially with several MCP servers connected.
- **A16 — allowed-tools least privilege and form.** Only the tools the skill needs. The spec
  defines the value as a **space-separated string**; Claude Code also accepts a comma-separated
  string or a YAML list. A comma-separated or list value is a **Low** — it works here but is not
  the form the standard defines, so it may not port to another agent. Carve-out: when a value
  itself contains spaces (`Bash(git add *)`), space separation is ambiguous — prefer commas or a
  list there and say why, rather than splitting the value.
- **A17 — not over-prescriptive.** The skill doesn't enumerate behaviors a brief instruction
  would cover. Over-specification degrades newer models (Fable 5's docs are explicit that skills
  built for older models are "often too prescriptive" and can lower output quality) and violates
  `R1`. Prefer short steering + intent over exhaustive rule lists. Corroborated by the open
  standard's iteration guidance: when pass rates plateau while rules keep accumulating, the skill is
  over-constrained, and removing instructions is the move to try.
- **A18 — optional spec frontmatter used correctly.** `license` is a license name or the name of a
  bundled license file, kept short. `compatibility` is 1–500 chars and present **only** when the
  skill has real environment requirements (a required CLI, network access, an intended product) —
  most skills need none, and an empty-calorie `compatibility` line costs startup context for
  nothing. `metadata` is a flat map of string keys to string values, with names distinctive enough
  to avoid colliding with another author's keys.
- **A19 — directory layout.** Bundled files sit under the standard directories — `scripts/` for
  executable code, `references/` for documentation, `assets/` for templates and static resources —
  and are addressed by paths relative to the skill root. A reviewer looking for a skill's script in
  `scripts/` should find it there.
- **A20 — spec core vs. client extensions.** The spec's frontmatter is `name`, `description`,
  `license`, `compatibility`, `metadata`, and `allowed-tools`. Anything else — `model`, `effort`,
  `context`, `agent`, `background`, `hooks`, `paths`, `shell`, `disable-model-invocation`,
  `user-invocable`, `disallowed-tools`, `argument-hint`, `arguments` — is a Claude Code extension:
  permitted, but it does not carry to other agents. Flag one only when it is load-bearing and its
  purpose is undocumented, so a reader can tell deliberate use from a copied line. Do not flag a
  skill merely for using an extension.

## H. Success criteria & evaluations

- **H1 — evals exist, in the standard's format.** ≥3 scenarios, stored as `evals/evals.json` in
  the skill directory. Each entry carries `id`, `prompt` (a realistic user message, not a
  paraphrase of the skill's own steps), `expected_output` (a human-readable description of
  success), optional `files`, and `assertions`. This checklist extends that schema with three keys
  the standard omits but `H3`/`H6`/`H7` require: `targets` (the step or branch under test), `baseline`
  (what a run without the skill misses), and `models`. A prose `evals.md` is a finding — it holds
  the same information but no runner can consume it. The standard suggests starting at 2–3 and
  expanding once the first run shows what "good" looks like, so a brand-new skill at 2 is early
  rather than failing; a settled skill still at 2 is a finding.
- **H2 — measurable/specific.** Expected behaviors are concrete and checkable, not vague.
- **H3 — distinct decision points.** Each scenario targets a different step/branch so a failure
  localizes the regression.
- **H4 — edge cases.** Covers empty/absent input, boundary/omission cases, adversarial input.
- **H5 — grading split.** Distinguishes machine-checkable checks (scripts, hooks, greps) from
  judgment-graded ones; automates where possible.
- **H6 — baseline-first.** Evals note running without the skill to establish the before/after.
- **H7 — model coverage.** Scenarios name the model(s) the skill is expected to pass on
  (its pinned model at minimum).
- **H8 — evals precede the prose, assertions follow the first run.** The documented order is: find
  the gaps by running the task without a skill, write three scenarios against those gaps, measure
  the baseline, then write the minimum instructions that pass. A skill whose evals were clearly
  written after the fact is at risk of documenting imagined problems rather than real ones. The
  order _within_ a scenario is the reverse of what that implies: `prompt` and `expected_output`
  come first, and `assertions` are added **after** the first run shows what the output actually
  looks like. Assertions invented before any run tend to be brittle or unverifiable, so do not
  fault a scenario set for reaching its assertions on the second pass.
- **H9 — criteria are SMART.** Specific, measurable, achievable, relevant. "Handles edge cases
  well" fails; a stated pass condition on a named input passes. Volume of cheap automated checks
  beats a handful of hand-graded ones (`H5`).
- **H10 — grader independence.** Where an LLM grades, it should not be the same instance that
  produced the output. Self-grading in the same run is not evidence. For comparing two versions of
  a skill, prefer a blind comparison — the judge scores both outputs without being told which
  version produced which.
- **H11 — clean-context runs.** Each eval run starts from a fresh context — a subagent, or a
  separate session — with no state left over from a previous run or from developing the skill. A
  run that inherits the authoring conversation is testing the conversation, not the `SKILL.md`.
- **H12 — cost recorded against benefit.** Runs capture token count and duration alongside the
  pass rate, and the skill's value is read as the _delta_ against the baseline. Without the cost
  side, a skill that triples token usage for a two-point gain looks identical to one that is both
  better and cheaper.
- **H13 — assertion hygiene.** Assertions that pass in both the with-skill and without-skill runs
  are removed or replaced: the model already handles them, so they inflate the with-skill pass rate
  without measuring anything the skill contributes. Assertions that fail in both are investigated —
  the assertion is broken, the case is too hard, or it checks the wrong thing. The assertions worth
  keeping are the ones that pass with the skill and fail without it.
- **H14 — evidence-based PASS.** Grading records PASS or FAIL with evidence quoting or referencing
  the actual output, and gives no benefit of the doubt: a section titled "Summary" holding one
  vague sentence fails an assertion asking for a summary. An opinion without a quotation is not a
  grade.

## R. Craft and project conventions

Sources: this checklist itself for `R1`–`R4` and `R7`–`R11`, which are portable craft criteria;
the **host project's own convention documents** for `R5` and `R6`, which are project-scoped.
Before scoring the project-scoped items, read the host project's `CLAUDE.md` and the convention
documents it links. Where the project defines no convention for a project-scoped item, score the
item `N/A` — never invent a house rule the project does not have. A project's conventions may also
narrow any other item in this group; when one does, cite the project's document alongside the key.

- **R1 — simplicity first.** No speculative features/abstractions/config beyond what the skill's
  job requires.
- **R2 — surgical.** The skill's own _apply_ edits touch only what a finding requires.
- **R3 — single source of truth / no drift.** The skill references its authoritative sources
  rather than restating their rules; any restated rule is sourced and kept in sync. Unsourced
  restated rules are a drift finding.
- **R4 — ask when uncertain.** The skill surfaces ambiguity/tradeoffs rather than guessing
  silently.
- **R5 — commit hygiene.** If the skill authors commits, it conforms to the host project's commit
  conventions. `N/A` when the skill authors no commits or the project defines no commit
  convention.
- **R6 — naming convention.** Skill names follow the host project's skill-naming convention where
  one exists — a project rule that narrows `A1`'s "gerund preferred" to mandatory is the common
  case. Skills the project's tooling vendors under generated names are exempt when the project
  says so. `N/A` when the project defines no naming convention.
- **R7 — prose conventions.** Skill _body_ prose (`SKILL.md` body, the prose fields of
  `evals/evals.json` or a legacy `evals.md`, `references/`) follows the twelve conventions the
  `writing-simplified-technical-english` skill carries. Invoke that skill in check mode to grade all twelve;
  when it is not installed, judge holistically against `R8`–`R11` below and report that the other
  seven went ungraded. Two scope limits: the `name`/`description` frontmatter is **not** covered
  (that is `A1`/`A2`/`A3` — never reword a `description` for prose style, it drives discovery), and
  the conventions have **no sentence-length rule** — do not invent one, because the longest sentences
  are the guardrails that bind a condition to an action and splitting one breaks that binding.
- **R8 — named actor.** Instructions use the active voice. Flag passive constructions where the
  actor is ambiguous ("is rejected" — by the skill, the model, or a hook?). Passive is fine where
  the agent genuinely doesn't matter.
- **R9 — notes vs. instructions.** Notes, blockquotes, and parentheticals carry information only.
  A normative rule hiding in an aside is a finding: it belongs in a numbered step.
- **R10 — guardrail consequences.** Every prohibition states its risk or result, so the model can
  weigh it against a conflicting instruction. A bare "never do X" is a finding.
- **R11 — closed sets & explicit referents.** No `etc.`/"and so on" terminating a list the model
  must act on (it invites invented members) — state the membership test instead. No bare `this` /
  `it` / `they` where two antecedents are plausible, because a pronoun with two plausible
  antecedents is a coin flip.
