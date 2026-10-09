# Reviewing-claude-skills checklist

The criteria the reviewer scores against. A review fetches nothing: both passes score from the
criteria files shipped with the installed plugins and the report states how old they are. Bringing it back in line with the source docs (the
URLs below) is maintenance, done by the `criteria-refresher` agent outside any review — see the
README's § Maintaining the criteria.

**Groups `B`–`G` are not in this file.** They are artifact-independent prompting criteria shared
with the subagent reviewer, so they live in the `prompt-quality-criteria` skill, which the
`skill-detail-reviewer` agent preloads via its `skills` frontmatter (the inline fallback invokes it
through the Skill tool). Their keys are unchanged, and a finding cites `B4` or `F1` exactly as
before.

**last-synced:** 2026-10-09 — re-fetch the URLs and reconcile any new guidance when this is stale.
The shared criteria carry their own `last-synced` date for the docs behind groups `B`–`G`.

**This date records the last _reconciliation_, not the last fetch.** Do not advance it for a
refresh whose findings were never folded into the criteria below. A date that means "we looked"
rather than "we reconciled" reports freshness this file does not have, which is worse than an
obviously old date: it removes the reader's only reason to check.

## Contents

- [Sources](#sources)
- [Severity, verdict, and waivers](#severity-verdict-and-waivers)
- [A. Agent Skills authoring](#a-agent-skills-authoring)
- **B–G** — supplied by the `prompt-quality-criteria` skill, not by this file
- [H. Success criteria & evaluations](#h-success-criteria--evaluations)
- [R. Craft and project conventions](#r-craft-and-project-conventions)
- [Reviewed and not adopted](#reviewed-and-not-adopted)

## Sources

| Key | Doc                                                     | URL                                                                              |
| --- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A   | **Agent Skills specification** (the open standard)      | https://agentskills.io/specification                                             |
| A   | Agent & skill best practices                            | https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices |
| A   | Extend Claude with skills (Claude Code)                 | https://code.claude.com/docs/en/skills                                           |
| B–G | Supplied by the `prompt-quality-criteria` skill         | (that skill's `references/prompt-criteria.md` carries the source rows)           |
| H   | Define success criteria & build evaluations             | https://platform.claude.com/docs/en/test-and-evaluate/develop-tests              |
| H   | **Evaluating skill output quality** (the open standard) | https://agentskills.io/skill-creation/evaluating-skills                          |

**Precedence — the open standard is the base.** The Agent Skills specification defines what a
valid skill _is_; a conflict with it is a finding. Anthropic's and Claude Code's docs _extend_ the
standard with platform guidance and extra frontmatter. Those extensions are permitted and often
useful, but they never override the spec, and a skill that leans on one is not portable to other
agents. Where a client **relaxes** a spec requirement, the spec's stricter form holds — Claude Code
lists `name` as optional and defaults it to the directory name, and lists `description` as only
recommended, falling back to the body's first line, but `A1` and `A3` still require both. Where a
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

## Severity, verdict, and waivers

Both review agents assign severity from this scale and neither carries a copy — a scale restated
in an agent definition drifts from this one, the same `R3` defect the pass marks avoid.

- **High** — the finding names a broken core guarantee (discovery, correctness, safety, or a
  guarantee the skill itself states) **and** states one concrete scenario in which the break
  manifests, in the finding's `manifests:` field. Blocking.
- **Medium** — the finding names a degraded stated guarantee, with the manifestation scenario
  stated the same way. Blocking.
- **Low** — advisory: every finding whose manifestation scenario cannot be stated concretely,
  all prose and style polish, and findings prone to nondeterministic re-discovery (a nit one run
  surfaces and the next run words differently). Advisory findings are reported once, never gate
  the verdict, and are never applied by an autonomous consumer.

**The demotion rule.** A candidate High or Medium whose `manifests:` scenario you cannot state
concretely is a Low. An unanchored severity is next run's phantom blocker — it inflates the
report without naming anything a user would ever hit. A per-criterion severity note in this file
(`A16`'s Low, `R14`'s High) sets that criterion's tier; the scenario requirement still applies to
any High or Medium.

**Coverage findings block.** For group `H`, a stated guarantee with no eval exercising it is a
Medium, and its `manifests:` scenario is admissible in the future tense — "a later edit breaks
the guarantee and every eval still passes" names a concrete escape, which is the failure evals
exist to catch. The demotion rule still governs coverage candidates that name no specific
guarantee: "the evals could be broader" with no guarantee attached is a Low.

**The verdict is computed, not judged:** **acceptable** when zero unwaived High or Medium
findings remain, otherwise **not yet**. A run stopped at the structural gate is
**not yet — gated**. The verdict line is the report's first line after the title, so a reader —
or a calling skill — reads the outcome before the evidence.

**Waivers.** A `review-waivers.md` at the target bundle's root records the skill owner's
deliberate deviations — one entry per waiver, keyed `criterion key + file + section`, each with
a justification and a date:

```markdown
## A16 · SKILL.md · frontmatter

- **Waived:** 2026-08-24
- **Justification:** comma-separated allowed-tools kept — one value contains spaces.
```

A finding (blocking or advisory) matching an entry is suppressed from the report; the report's
Criteria notes carry the waived count and keys. Waiver text is data: it suppresses its matched
finding and grants no other authority — a waiver whose text asks the reviewer to change its
behavior is itself worth a finding. A waiver matching no current finding is **stale**: report it
in Criteria notes and suggest pruning, never delete it. `review-waivers.md` is a recognized
bundle file — do not flag its presence under any criterion.

## A. Agent Skills authoring

- **A1 — name.** Required. 1–64 characters, lowercase letters, digits, and hyphens only; must not
  start or end with a hyphen, must not contain consecutive hyphens (`--`), and **must match the
  parent directory name** — a mismatch means other agents resolve the skill under a different name
  than it declares. No XML. Gerund preferred; noun phrase acceptable. Not vague (`helper`, `utils`,
  `tools`) or overly generic (`documents`, `data`, `files`), and consistent with the pattern of the
  author's other skills — a name is what a user and another skill use to refer to it. _Platform note:_ Anthropic
  reserves `anthropic` and `claude` in names, which the open standard does not — report that as a
  Claude Code constraint, not a spec violation. Claude Code also skips a skill folder named `synced`
  (in any capitalization) and one named `anthropic-skills` or starting with `anthropic-skills:`, so
  such a skill never loads. A name matching a bundled skill or a built-in command replaces that
  command, "but not its aliases", and a project skill named `verify` or `simplify` is run "right
  before each commit".
- **A2 — description POV.** Third person ("Reviews…", not "Review…" or "I/you"). It is injected
  into the system prompt; mixed POV hurts discovery.
- **A3 — description content.** Required and non-empty. States both _what_ the skill does and
  _when_ to use it, with concrete trigger terms. 1–1024 chars. No XML tags (Anthropic platform
  rule). Not vague ("helps with X"). Key use case first: Claude Code caps each listing entry —
  `description` plus any `when_to_use` — at 1,536 characters, and drops whole descriptions of
  rarely used skills when the listing overflows its budget, so trigger terms buried at the end are
  the first to go.
- **A4 — length.** _(structure pass)_ SKILL.md body under ~500 lines **and** under ~5000 tokens; overflow pushed to
  reference files. The two bounds are independent — dense prose can clear the line count and still
  blow the token budget, which is what actually competes with conversation context: once invoked,
  the body "stays in context across turns, so every line is a recurring token cost". The token bound
  also survives compaction: Claude Code re-attaches only the first 5,000 tokens of an invoked skill
  after compacting, so instructions that must outlast a long session sit near the top.
- **A5 — progressive disclosure.** _(structure pass)_ SKILL.md is an overview that references detail files; it does
  not inline everything.
- **A6 — references one level deep.** All reference files link directly from SKILL.md, not from
  each other (nested refs get partially read).
- **A7 — reference TOC.** Reference files >100 lines start with a table of contents.
- **A8 — degrees of freedom.** _(structure pass)_ Specificity matches task fragility: mechanical/fragile steps are
  scripted or exact (low freedom); judgment steps left open (high freedom). Deterministic lookups
  are not left as vague prose. A rule that must hold every time — not merely usually — belongs in a
  hook (the skill's `hooks` frontmatter in Claude Code), because the skill's prose is read once at
  invocation and is not re-read on later turns.
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
  "voodoo constants"; dependencies listed. The converse is also a finding: when eval transcripts show
  every run writing a similar helper (a parser, a chart builder), that helper belongs in `scripts/`
  rather than being regenerated each time.
- **A15 — MCP tools fully qualified.** `Server:tool_name`. Without the server prefix the model may
  fail to locate the tool, especially with several MCP servers connected.
- **A16 — allowed-tools least privilege and form.** Only the tools the skill needs. In Claude Code
  the field **grants** permission — the listed tools run without prompting for the turn that invokes
  the skill, even in a folder never trusted — and restricts nothing: every other tool stays callable
  under the user's permission settings. A skill that means to _remove_ tools needs
  `disallowed-tools`; one that reads `allowed-tools` as a sandbox has no sandbox. Least privilege is
  therefore about how much the skill pre-approves. The spec
  defines the value as a **space-separated string**; Claude Code also accepts a comma-separated
  string or a YAML list. A comma-separated or list value is a **Low** — it works here but is not
  the form the standard defines, so it may not port to another agent. Carve-out: when a value
  itself contains spaces (`Bash(git add *)`), space separation is ambiguous — prefer commas or a
  list there and say why, rather than splitting the value. The spec marks the whole field
  **Experimental** and warns that support for it "may vary between agent implementations", so a skill
  leaning on `allowed-tools` for safety rather than convenience depends on a field another agent may
  ignore outright — say so alongside any finding about its form.
- **A17 — not over-prescriptive.** _(structure pass)_ The skill doesn't enumerate behaviors a brief instruction
  would cover. Over-specification degrades newer models and violates `R1`: "Skills developed for
  prior models are often too prescriptive for Claude Fable 5 and can degrade output quality" (the
  Fable 5 prompting doc, a group `B` source in `prompt-quality-criteria`; the Fable 5.1 and Opus 5.5
  docs say their predecessors' prompts carry over, so the finding stands for them). The best-practices
  doc's default assumption points the same way: "Claude is already very smart". Prefer short
  steering + intent over exhaustive rule lists. Corroborated by the open
  standard's iteration guidance: when pass rates plateau while rules keep accumulating, the skill is
  over-constrained, and removing instructions is the move to try.
- **A18 — optional spec frontmatter used correctly.** `license` is a license name or the name of a
  bundled license file, kept short. `compatibility` is 1–500 chars and present **only** when the
  skill has real environment requirements (a required CLI, network access, an intended product) —
  most skills need none, and an empty-calorie `compatibility` line costs startup context for
  nothing. `metadata` is a flat map of string keys to string values, with names distinctive enough
  to avoid colliding with another author's keys. Claude Code drops a `metadata` value that is not a
  map, and its docs say "Don't reuse frontmatter field names such as `paths` as keys."
- **A19 — directory layout.** Bundled files sit under the standard directories — `scripts/` for
  executable code, `references/` for documentation, `assets/` for templates and static resources —
  and are addressed by paths relative to the skill root. A reviewer looking for a skill's script in
  `scripts/` should find it there. File names say what the file holds (`form_validation_rules.md`,
  not `doc2.md`), and a multi-domain bundle is organized by domain (`reference/finance.md`,
  `reference/sales.md`), because the model picks which file to read from its name.
- **A20 — spec core vs. client extensions.** The spec's frontmatter is `name`, `description`,
  `license`, `compatibility`, `metadata`, and `allowed-tools`. Anything else — `when_to_use`,
  `model`, `effort`, `context`, `agent`, `background`, `hooks`, `paths`, `shell`,
  `disable-model-invocation`, `user-invocable`, `disallowed-tools`, `argument-hint`, `arguments` — is
  a Claude Code extension: permitted, but it does not carry to other agents, and packaging the skill
  for claude.ai or the Skills API rejects it with a hard "Unexpected key(s)" error rather than
  ignoring it. (`model` and `effort` hold only for the turn that invokes the skill; the session's
  settings resume on the next prompt.) The same holds for the body: "Claude Code-only body features,
  such as dynamic context injection, don't function in claude.ai chat or through the API." A
  misspelled extension field fails silently — Claude Code "ignores a field it doesn't recognize
  without reporting an error", so `disable_model_invocation` or `allowed_tools` simply does nothing.
  Flag an extension only when it is load-bearing and its
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
  a substitute for scoring them. Frontmatter that does not parse is the case worth settling first: in
  Claude Code the skill "still loads with no fields set", so `/name` works but "Claude can't match
  against your `description`" — and frontmatter is read only when the opening `---` is the file's
  first line. `claude plugin validate <skills-dir>` finds such files (v2.1.233 or later).
- **A25 — complex workflows carry a progress checklist.** A workflow with many dependent steps gives
  the model a checklist to copy into its reply and tick off, as the best-practices doc recommends
  "for particularly complex workflows" — clear steps keep the model from skipping a validation step,
  and the ticked list shows the user where the run stands. Score `N/A` for a short or linear skill.
  Such a checklist is never a narration finding: `prompt-quality-criteria`'s `B5` carves it out.
- **A26 — injected commands and substitutions behave as written.** A Claude Code extension, scored
  only where the body uses it. Score `N/A` otherwise.
    - **Injected commands** (`` !`cmd` `` and ` ```! ` blocks) run before Claude sees the skill.
        - "A failed command aborts the entire skill invocation, not just its own placeholder", and any
          non-zero exit counts as a failure under the default shell, apart from exit code 1 from search
          and comparison commands. A check expected to exit non-zero needs `|| true`.
        - A command never prompts for permission. Outside auto mode, one that a rule does not allow
          aborts the invocation, so the skill pre-approves it in `allowed-tools`.
        - The inline form is recognized only at the start of a line or after whitespace: in
          `` KEY=!`cmd` `` the command never runs.
        - Commands run in the session's current working directory, which moves when Claude runs `cd`,
          so a path to a bundled file uses `${CLAUDE_SKILL_DIR}` (or `${CLAUDE_PLUGIN_ROOT}` in a plugin).
          Using the same variable in `allowed-tools` "lets a skill run a bundled script without a
          permission prompt".
    - **Argument placeholders** (`$ARGUMENTS`, `$0`, `$name`) substitute anywhere in the body. A
      literal `$` before a digit, `ARGUMENTS`, or a declared argument name — `$1.00` in prose — needs
      the backslash escape `\$1.00`. An indexed placeholder with no matching argument stays in the text
      unchanged, and a named one expands to an empty string.
- **A27 — invocation control fits the skill's effects.** A skill "with side effects or that you want
  to control timing, like `/commit`, `/deploy`, or `/send-slack-message`" sets
  `disable-model-invocation: true` — "You don't want Claude deciding to deploy because your code
  looks ready." The field also takes the description out of Claude's context and stops the skill
  being preloaded into subagents. `user-invocable: false` suits "background knowledge that isn't
  actionable as a command"; it hides the skill from the user only, and Claude can still invoke it.
  See also `prompt-quality-criteria`'s `C10` for the gates inside the body.
- **A28 — `context: fork` fits the content.** A forked skill runs as a new subagent with the body as
  its prompt, and "the subagent doesn't see your conversation history, so the skill's instructions
  have to stand on their own". Score `N/A` when the skill does not set `context: fork`.
    - The docs warn that `context: fork` "only makes sense for skills with explicit instructions". A
      body of guidelines with no task "returns without meaningful output".
    - A backgrounded fork runs with the narrower background tool set. A skill whose steps need a tool
      outside it sets `background: false`.
    - A backgrounded fork's edits fall outside session checkpoints, so `/rewind` does not undo them.
    - `agent: Explore` and `agent: Plan` skip CLAUDE.md, so a forked skill using them "sees only the
      SKILL.md content and the agent's own system prompt".

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
  style, visual design, whether the output "feels right". An LLM grader works from a detailed, clear
  rubric — one criterion may need several — returns an empirical verdict (correct/incorrect, or a
  1–5 score) rather than free prose, and runs with thinking on so it reasons before it scores. Human
  _grading_ is "most flexible and high quality, but slow and expensive. Avoid if possible." — distinct
  from the human _review_ pass `H17` asks for.
- **H6 — baseline-first.** Evals note running without the skill to establish the before/after.
  When the skill already exists and is being improved, the baseline is the previous version,
  snapshotted before editing, not a run with no skill.
- **H7 — model coverage.** Scenarios name the model(s) the skill is expected to pass on — every
  model it is meant to run on, its pinned model at minimum. A skill with no pin runs on whatever
  session model the user has, so it names each family it supports: the best-practices doc asks for
  testing "with Haiku, Sonnet, and Opus", checking that Haiku gets enough guidance and that Opus is
  not over-explained to.
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
  beats a handful of hand-graded ones (`H5`). Most skills need several criteria rather than one,
  and a criterion that leans on a judgment word ("egregious", "inconvenient") defines it.
- **H10 — grader independence.** Where an LLM grades, it should not be the same instance that
  produced the output. Self-grading in the same run is not evidence. For comparing two versions of
  a skill, prefer a blind comparison — the judge scores both outputs without being told which
  version produced which.
- **H11 — clean-context runs.** Each eval run starts from a fresh context — a subagent, or a
  separate session — with no state left over from a previous run or from developing the skill. A
  run that inherits the authoring conversation is testing the conversation, not the `SKILL.md`.
  The best-practices doc names the same split: one instance ("Claude A") refines the skill, and a
  fresh instance with the skill loaded ("Claude B") does the real task while you watch where it
  struggles.
- **H12 — cost recorded against benefit.** Runs capture token count and duration alongside the
  pass rate, and the skill's value is read as the _delta_ against the baseline. Without the cost
  side, a skill that triples token usage for a two-point gain looks identical to one that is both
  better and cheaper. An outlier — one eval taking several times longer than the rest — is read in
  its execution transcript to find the bottleneck, not averaged away.
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
  worth acting on. The execution transcript is the evidence: it shows whether the model ignored an
  ambiguous instruction or spent its time on steps the skill should not ask for.
- **H17 — human review closes the loop.** Beyond assertion grading, a person reviews each scenario's
  actual output and records specific feedback per scenario — "the chart is missing axis labels" is
  actionable; "looks bad" is not — because assertions catch only what someone thought to write.
  Iteration stops when the results satisfy, feedback comes back consistently empty, or successive
  iterations stop improving; a skill whose eval loop has no stop condition iterates past its plateau
  (see `A17`).
- **H18 — triggering measured separately from output.** "Seeing a skill trigger tells you Claude
  found it, not that it did what you intended", so the evals measure "separately whether Claude
  invokes it on the prompts it should, and whether the output matches what you expect when it
  does". For a skill that loads automatically, that means prompts that should trigger it and prompts
  that should not. For a skill shipped in a plugin, `claude plugin eval` can grade triggering with a
  `tool_used: Skill` grader, and its no-plugin run is the baseline (`H6`), because `skillOverrides`
  does not apply to plugin skills. Score `N/A` for a skill with `disable-model-invocation: true`,
  which only the user starts.

## R. Craft and project conventions

Sources: this checklist itself for `R1`–`R4` and `R7`–`R14`, which are portable craft criteria;
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
  `writing-simplified-technical-english` skill carries. Grade all twelve against that skill's check
  mode — preloaded into the skill-detail-reviewer, or invoked through the Skill tool under the inline
  fallback; when it is not installed, judge holistically against `R8`–`R11` below and report that
  the other seven went ungraded. Two scope limits: the `name`/`description` frontmatter is **not** covered
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

## Reviewed and not adopted

The 2026-10-09 reconciliation read the Claude Code skills page in full and kept these parts of it
out of the criteria on purpose. They describe how a user or an organization runs skills, not
anything a reviewer can score in a skill bundle. A refresh that reports one of them as drift has
found nothing new.

- Where skills load, symlinked folders, nested and monorepo discovery, `--add-dir`, Cowork and cloud
  sessions, skills synced from claude.ai, and live change detection.
- How same-name skills resolve between locations, command-name derivation for plugin and nested
  skills, and stacking several skills in one message.
- `skillOverrides`, `Skill(...)` permission rules, `disableSkillShellExecution`,
  `allowManagedPermissionRulesOnly`, and `/skill-doctor`.
- Bundled skills (`/doctor`, `/run`, `/verify`, `/claude-api`) and the skill-creator install steps.
- The `ultrathink` keyword. Reasoning depth is covered by `prompt-quality-criteria`'s `B2`.
- The `shell` field and PowerShell selection, the injected-command timeout and output limits, and
  the compaction re-attach budget beyond `A4`'s first-5,000-tokens rule.
