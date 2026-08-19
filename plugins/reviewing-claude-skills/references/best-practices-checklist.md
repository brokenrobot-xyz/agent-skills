# Reviewing-claude-skills checklist

The criteria the reviewer scores against. A review fetches nothing: both passes score from this
file alone and the report states how old it is. Bringing it back in line with the source docs (the
URLs below) is maintenance, done by the `criteria-refresher` agent outside any review — see the
README's § Maintaining the criteria.

**Groups `B`–`G` are not in this file.** They are artifact-independent prompting criteria shared
with the subagent reviewer, so they live in the `prompt-quality-criteria` skill, which the
`detail-reviewer` agent preloads via its `skills` frontmatter (the inline fallback invokes it
through the Skill tool). Their keys are unchanged, and a finding cites `B4` or `F1` exactly as
before.

**last-synced:** 2026-08-19 — re-fetch the URLs and reconcile any new guidance when this is stale.
The shared criteria carry their own `last-synced` date for the docs behind groups `B`–`G`.

**This date records the last _reconciliation_, not the last fetch.** Do not advance it for a
refresh whose findings were never folded into the criteria below. A date that means "we looked"
rather than "we reconciled" reports freshness this file does not have, which is worse than an
obviously old date: it removes the reader's only reason to check.

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

**Which pass scores what.** A criterion marked _(structure pass)_ belongs to Pass 1, which judges
the workflow's shape and gates the review; every unmarked criterion belongs to Pass 2's detail
sweep. **These marks are the only list.** Neither pass carries its own copy of the set and neither
hardcodes its size — a set restated in a second place drifts from this one, which is the defect
`R3` exists to catch. To move a criterion between passes, add or remove its mark here and nothing
else.

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
- **A4 — length.** _(structure pass)_ SKILL.md body under ~500 lines **and** under ~5000 tokens; overflow pushed to
  reference files. The two bounds are independent — dense prose can clear the line count and still
  blow the token budget, which is what actually competes with conversation context.
- **A5 — progressive disclosure.** _(structure pass)_ SKILL.md is an overview that references detail files; it does
  not inline everything.
- **A6 — references one level deep.** All reference files link directly from SKILL.md, not from
  each other (nested refs get partially read).
- **A7 — reference TOC.** Reference files >100 lines start with a table of contents.
- **A8 — degrees of freedom.** _(structure pass)_ Specificity matches task fragility: mechanical/fragile steps are
  scripted or exact (low freedom); judgment steps left open (high freedom). Deterministic lookups
  are not left as vague prose.
- **A9 — examples.** Concrete input→output examples where output quality depends on style/shape.
- **A10 — consistent terminology.** One term per concept throughout.
- **A11 — no time-sensitive info.** No "before August 2025…"; use a versioned/"old patterns"
  framing instead, because a dated instruction goes quietly wrong rather than failing loudly. (A
  dated `last-synced` metadata line is acceptable.)
- **A12 — forward-slash paths.** No Windows backslashes, because backslash paths error on Unix
  systems.
- **A13 — one default, not a menu.** _(structure pass)_ Do not offer many interchangeable options; give a default with
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
  list there and say why, rather than splitting the value. The spec marks the whole field
  **Experimental** and warns that support for it "may vary between agent implementations", so a skill
  leaning on `allowed-tools` for safety rather than convenience depends on a field another agent may
  ignore outright — say so alongside any finding about its form.
- **A17 — not over-prescriptive.** _(structure pass)_ The skill doesn't enumerate behaviors a brief instruction
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
- **A21 — feedback loops on quality-critical work.** Where output quality can be checked, the skill
  loops: run the validator, fix what it reports, run it again, and proceed only once it passes. The
  validator may be a script or a reference document the skill reads and compares against — the loop
  is the criterion, not the tooling. A skill that checks once and continues regardless of the verdict
  has a check, not a loop, and the errors it catches arrive too late to act on.
- **A22 — verifiable intermediate outputs.** _(structure pass)_ For batch, destructive, or otherwise high-stakes
  operations, the skill writes its plan to a structured file, validates that file, and only then
  executes it — the documented "plan-validate-execute" pattern. The plan is machine-checkable before
  anything is touched, and the model can iterate on it without disturbing the originals. Validation
  messages name the specific problem and the available alternatives ("field `signature_date` not
  found. Available fields: …"), because an error a reader cannot act on ends the loop `A21` opens.
- **A23 — execution intent stated.** For every bundled script the skill names, it says whether the
  script is to be **run** ("run `analyze_form.py` to extract the fields") or **read** ("see
  `analyze_form.py` for the extraction algorithm"). The two cost different things — executing spends
  only the script's output, reading spends the whole file — so a reference carrying neither verb
  leaves a context-budget decision to the model.
- **A24 — validates under the reference implementation.** The open standard ships a validator
  (`skills-ref validate ./my-skill`) that checks frontmatter and naming mechanically. A skill that
  fails it fails the spec, so treat a clean run as the floor for `A1`, `A18`, and `A20` rather than as
  a substitute for scoring them.

## H. Success criteria & evaluations

- **H1 — evals exist, in the standard's format.** ≥3 scenarios, stored as `evals/evals.json` in
  the skill directory. The file is an object carrying a top-level `skill_name` alongside its `evals`
  array — a bare array is a finding, because a runner keyed on `skill_name` cannot tell which skill
  the file belongs to. Each entry carries `id`, `prompt` (a realistic user message, not a
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
  judgment-graded ones; automates where possible. The documented methods, cheapest first: exact match
  after normalizing whitespace and case, string match, multiple choice, code-graded assertions, and
  LLM-graded ones — the last as a binary classification, a Likert scale, or an ordinal scale, picked
  to fit what is being judged. Reserve judgment grading for what resists a mechanical check: writing
  style, visual design, whether the output "feels right".
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
- **H15 — prompt variation.** The scenario prompts differ in phrasing, level of detail, and
  formality — one casual ("hey can you clean up this csv"), one precise ("parse the CSV at
  `data/input.csv`, drop rows where column B is null"). A set written in a single voice tests a
  single phrasing, and phrasing is exactly what varies between real users, so a uniform set overstates
  how reliably the skill is discovered and followed.
- **H16 — inconsistency diagnosed, not averaged.** Where the same scenario passes on some runs and
  fails on others, the set says which of the two causes is in play: an eval flaky under sampling, or
  instructions ambiguous enough that the model reads them differently each run. Only the second is a
  skill defect, and its fix belongs in `SKILL.md`, so recording the mean alone hides the one finding
  worth acting on.

## R. Craft and project conventions

Sources: this checklist itself for `R1`–`R4` and `R7`–`R11`, which are portable craft criteria;
the **host project's own convention documents** for `R5` and `R6`, which are project-scoped.
Before scoring the project-scoped items, read the host project's `CLAUDE.md` and the convention
documents it links. Where the project defines no convention for a project-scoped item, score the
item `N/A` — never invent a house rule the project does not have. A project's conventions may also
narrow any other item in this group; when one does, cite the project's document alongside the key.

- **R1 — simplicity first.** _(structure pass)_ No speculative features/abstractions/config beyond what the skill's
  job requires.
- **R2 — surgical.** The skill's own _apply_ edits touch only what a finding requires.
- **R3 — single source of truth / no drift.** The skill references its authoritative sources
  rather than restating their rules; any restated rule is sourced and kept in sync. Unsourced
  restated rules are a drift finding. This also covers the manifest-versus-procedure cross-check:
  every skill an invoking step names is declared as a dependency in the caller's
  `.claude-plugin/plugin.json`, and every declared dependency is invoked by some step. The overlap
  is deliberate, because the two sides carry different information about the same edge — the
  manifest says what gets installed and the step says what it is for — so a disagreement is
  detectable. A declared dependency nothing invokes is dead weight; an invoked skill nothing
  declares fails on a clean install.
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
- **R12 — scope coherence.** _(structure pass)_ The skill does one job. Apply the split test: the same subject and the
  same criteria producing a different output is **one skill with two modes**, not two skills; a
  different subject or different criteria is a second skill; and criteria a consumer must score with
  itself are extracted into their own skill regardless of the first two. Modes are not a reason to
  split. Two responsibilities in one skill make its `description` vague, and a vague description is
  what stops the right skill being selected. **Splitting has a permanent cost** — every skill's
  `name` and `description` load at startup in every session, used or not, a sibling with an adjacent
  description competes for the same prompts, and the half doing the work gains a dependency that can
  fail — so recommending a split for tidiness alone is a finding in the other direction. When the
  motivation is only that a body of criteria is bulky, `references/` and progressive disclosure
  already solve that without a second skill.
- **R13 — invocation completeness.** Every step that invokes another skill states four things, and
  it states them **in the step itself** rather than in a separate dependencies section, which would
  restate the step and then drift from it: **the plugin-scoped name** in `plugin:skill` form, doubled
  where a plugin's name matches its skill's name, because an unscoped name is not guaranteed to
  resolve when several plugins are installed; **the mode**, where the invoked skill has more than
  one, because the wrong mode returns the wrong kind of result; **what the step consumes** from the
  result and where that goes, because a step that invokes a skill without saying what it does with
  the answer leaves the model to guess and the guess varies by run; and **what the step does when the
  skill is unavailable, and what is lost**, because dependency resolution is not guaranteed on every
  host and a silent degradation reads to the user as a clean result rather than an ungraded one.
- **R14 — bounded decision space.** _(structure pass)_ The workflow's decisions chain; they do not multiply. Signals
  that the state space has outgrown the prose describing it: an outcome computed from three or
  more independent inputs (a config value × a verdict × a category × an override); the same
  operation specified in more than one phase with different semantics per phase; a shared rule set
  cited by number from several sections, so a fix in one section goes stale in another; steps a
  configuration can empty, each needing "skipped because" bookkeeping. One signal alone may be a
  deliberate design; two or more compounding is a High, and the recommendation is structural —
  collapse the phases, move a computed decision to the user, hardcode a knob — never a wording
  fix, because rewording one corner of a multiplicative space produces the next review's finding
  in another corner. Review churn is itself evidence: when the target's history shows repeated
  review-fix rounds that fail to converge, cite this criterion alongside `A17`'s plateau rule.
