# Prompt quality criteria

This file holds criteria groups `B`–`G`. A caller reads these criteria and scores its own prompt
against them. This file scores nothing and assigns no severity, for the reason
[Who scores](#who-scores) gives.

**last-synced:** 2026-10-09. When this date is stale, refresh the source URLs below. Then reconcile
any new guidance into this file. **The date records the last _reconciliation_, not the last
fetch** — do not advance it for a refresh whose findings were never folded in, because a date
meaning "we looked" reports freshness this file does not have. A maintainer makes both changes; a
caller reads this date to report how old these criteria are, and does not refresh them mid-review.

## Contents

- [Who scores](#who-scores)
- [Sources](#sources)
- [B. Model-specific prompting (conditional)](#b-model-specific-prompting-conditional)
- [C. General Claude prompting](#c-general-claude-prompting)
- [D. Reduce hallucinations](#d-reduce-hallucinations)
- [E. Increase output consistency](#e-increase-output-consistency)
- [F. Mitigate jailbreaks & prompt injection](#f-mitigate-jailbreaks--prompt-injection)
- [G. Reduce prompt leak](#g-reduce-prompt-leak)
- [Reviewed and not adopted](#reviewed-and-not-adopted)

## Who scores

**The caller scores the prompt.** These criteria read differently for each kind of prompt. `B4`
applies hardest to a prompt that finds, reviews, or audits. `C8`'s "broadly" depends on what the
prompt spans. `F4` gains a second dimension when the prompt's output reaches a parent session. A
scorer inside this file would need the caller to supply that context, and would then do the caller's
work with less information than the caller already holds. This file therefore supplies the criteria,
and the caller assigns each severity and writes each finding.

**"The prompt"** in every criterion below means the prompt under review: a skill's `SKILL.md` body, a
subagent definition's body, or any other Markdown that becomes instructions for Claude.

**Five criteria overlap a criterion this file does not hold.** `C2`, `C11`, `E2`, `F2`, and `F5` each name
the caller's criterion by description rather than by key, because the key differs for each caller.
Resolve each description against your own checklist.

Every item below is a pass criterion. Cite the criterion key in each finding — `B4`, `D1`, `F5`. The
keys are stable for every caller, so two callers' reports stay comparable. Some items carry their
evidence from a document outside their own group, and each of those items names its source inline,
so a refresh checks the page the item came from.

## Sources

| Key | Doc                                            | URL                                                                                                      |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| B   | Prompting Claude Opus 5.5                      | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5       |
| B   | Prompting Claude Sonnet 5.5                    | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5     |
| B   | Prompting Claude Haiku 5.5                     | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5      |
| B   | Prompting Claude Fable 5.1 (covers Mythos 5.1) | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1      |
| B   | Prompting Claude Sonnet 5                      | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5       |
| B   | Prompting Claude Opus 5                        | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5         |
| B   | Prompting Claude Opus 4.8                      | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8       |
| B   | Prompting Claude Fable 5 (covers Mythos 5 too) | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5        |
| C   | Claude prompting best practices                | https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices |
| D   | Reduce hallucinations                          | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations        |
| E   | Increase output consistency                    | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/increase-consistency         |
| F   | Mitigate jailbreaks                            | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks          |
| G   | Reduce prompt leak                             | https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-prompt-leak           |

## B. Model-specific prompting (conditional)

Apply the subset matching the prompt's pinned or likely model (per its `model:` frontmatter): the
shared items below, then that model's paragraph. A durable alias resolves to the current model in
its family — `opus` to Opus 5.5, `sonnet` to Sonnet 5.5, `haiku` to Haiku 5.5, `fable` to Fable 5.1
(as of **last-synced**); an absent pin means the session model. Each current model's doc says its
predecessor's patterns still hold, so a current model's subset also takes its predecessor's
paragraph wherever its own paragraph does not override it: Opus 5.5 takes Opus 5, Sonnet 5.5 takes
Sonnet 5, Fable 5.1 takes Fable 5. Haiku 5.5 has no predecessor paragraph. A full ID naming a
legacy model (`claude-sonnet-5`, `claude-opus-5`) takes only that legacy paragraph. Managed settings can override a
model pin, so a prompt that depends on quirks of exactly one model is fragile. (The caller reports
this alongside any group `B` finding.)

The model docs also carry API and harness advice — `max_tokens` sizing, `thinking.display`,
append-only history, turn-scoped reminders, tools for cropping images or messaging the user. This
group scores prompt text only, so that advice is out of scope here.

**Shared across current models:**

- **B1 — verbosity.** No forced ceremony (mandatory summaries, interim status) unless it is
  load-bearing; current models self-calibrate length. (See also the caller's over-prescription
  criterion.)
- **B2 — effort/thinking not over-scaffolded.** Do not hand-roll what adaptive thinking and the
  effort parameter already do. Effort, not prompt text, is the control for how much a current model
  thinks: Sonnet 5.5's and Haiku 5.5's docs report that asking the model to think less or answer
  directly does not reliably reduce its thinking, and Opus 5.5's doc recommends removing "think
  carefully before answering" lines from chat prompts. One documented exception: on Sonnet 5.5, a
  reasoning task that must answer in structured JSON benefits from "Think the problem through
  before you answer."
- **B3 — tool nudges.** If the prompt relies on tool use where the model reasons least — thinking
  off, Sonnet 5.5's `between_tools`, or `low` effort — it nudges explicitly, scoped to that case.
  Sonnet 5.5, Haiku 5.5, and Fable 5.1 all skip searches, tool calls, or checks more often at `low`
  effort. The reverse is also a finding: language that discourages tools ("only use tools when
  strictly necessary", "minimize tool calls") should be removed (Sonnet 5.5). On Opus 5.5 and Fable
  5.x thinking is always on, so only the `low`-effort case applies. (`C9` is the other half: no
  _blanket_ nudge.)
- **B4 — coverage before filtering.** A prompt that finds, reviews, or audits must not cap the
  _finding_ stage with "only report high-severity", "be conservative", or "don't nitpick". Current
  models follow such a bar literally — they investigate just as deeply, then drop findings below
  it, so measured recall falls while the underlying ability is unchanged. Ask for coverage at the
  finding stage and filter in a separate step. (Stated for Sonnet 5, Opus 5, and Opus 4.8; not
  restated, nor contradicted, by the 5.5 and 5.1 docs.)
- **B5 — progress-update scaffolding.** Two failures, opposite directions. A fixed cadence written
  into the prompt ("after every 3 tool calls, summarize progress") should be removed; and so should a
  line that suppresses narration ("hold all findings for the final response"), which Fable 5.1's and
  Sonnet 5.5's docs both name — Fable 5.1 writes _fewer_ updates than its predecessor by default. Say
  instead _when_ updates are wanted and what each should contain, with positive examples. A
  harness-injected reminder after a long silent stretch, capped at two or three, is harness advice
  the Opus 5.5 and Sonnet 5.5 docs endorse, not a prompt finding. **Carve-out:** a workflow
  checklist the prompt tells the model to copy into its reply and tick off is _not_ a `B5` finding —
  Anthropic's skill-authoring best-practices doc
  (`https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices`) endorses that
  pattern by name for complex multi-step workflows, and Opus 5.5's doc recommends keeping a task's
  parts in a checklist the model updates. `B5` governs narration cadence, not task tracking.
- **B6 — the turn ends when the work does.** A prompt for long or unattended agentic work names the
  stops it does not want — ending on an announced next step instead of taking it, asking permission
  for work already requested, stopping at a milestone to report — and the stops it does want: the
  user's input is genuinely needed, or a risky or destructive step needs confirmation. Opus 5.5,
  Sonnet 5.5 (at `low`/`medium` effort), Haiku 5.5 (long prompts at `low` effort), and Fable 5.1 all
  stop early without this, and each doc gives a prompt for it. Score `N/A` for a prompt that is
  human-in-the-loop by design, where checking in is the point.
- **B7 — unrequested additions are contained.** A prompt for open-ended building work says what to
  leave out: features, tests, docs, refactors, or fixes to nearby code the task did not ask for are
  mentioned at the end, not made. Sonnet 5.5 adds tests and docs unprompted at every effort level,
  Fable 5.1 extends behavior and commits extra tests, Haiku 5.5 adds refactors, and Opus 5 expands
  scope — each doc carries the same remedy. A prompt that asks for ideas or a plan says to stop there
  and not start building (Sonnet 5.5). This is the other side of `C8`: `C8` stops a prompt from being
  applied too narrowly, `B7` stops the work from growing past it.

**Opus 5.5:** existing Opus 5 prompts carry over, with these differences. Thinking cannot be
turned off, so the Opus 5 thinking-disabled advice below no longer applies — remove any rule telling
the model not to think, and any instruction to write reasoning out as a stand-in for thinking
(`C7`). It reports progress plainly but sometimes ends an unattended turn on an update — `B6`
applies with force, and the doc's addition names the four unwanted stops. On loosely specified work
across several sources (mail, documents, records) it acts quickly; a prompt that depends on context
the task does not name tells it to look across the sources first. In chat it can re-examine earlier
answers on each turn; telling it to treat earlier answers as settled cuts that, at the cost of
pointing out its own past mistakes less. For frontend output, a general "avoid a generic look"
swaps one default style for another — name the specific patterns to avoid. Explicit verification
steps behave as on Opus 5.

**Sonnet 5.5:** existing Sonnet 5 prompts carry over. Its effort levels are recalibrated, and
initiative tracks effort: at `low`/`medium` it can check in before a coding task is done (`B6`);
at `xhigh`/`max` it starts its own review and hardening rounds, including reviewer subagents — a
prompt run at those levels that wants only the task done says to stop when the checks pass and to
propose, not run, a deeper review. At `low` effort it sometimes reports code done without a check
that exercises it; a coding prompt states that a real test, type-check, or build is required, or
an explanation of why none could run. It sometimes answers from training knowledge where a search
would catch changed details — a prompt with a search tool says to check specifics that change
(what is allowed, required, or charged). Its lowest thinking setting is `between_tools`; with it,
remove any instruction not to think, which makes leaked internal tags more likely.

**Haiku 5.5:** the first Haiku with effort levels; `medium` is the default. Search triggering
depends on knowing the date: a prompt that gives it a search tool states the current date, and in
a long prompt or at `low` effort also says that changeable facts must be searched — but not as a
blanket "search every factual question" (`C9`). With thinking off and a JSON output format, it can
skip a needed tool call; the prompt says the JSON format applies to the final answer only (`B3`).
At `low`/`medium` effort it reports code changes done without a check — state the check (as for
Sonnet 5.5). As a chatbot, it holds its system prompt better when the prompt says its rules hold
when a user argues, pleads, cites an approved exception, or keeps asking (see also `F6`). Reasoning
text can leak into user-facing replies at `low` effort or with thinking off — a sign the route needs
adaptive thinking at `medium`, not more prompt text.

**Fable 5.1 (and Mythos 5.1, which shares this doc):** existing Fable 5 prompts carry over, with
these differences. It writes fewer progress updates — remove narration suppressors before adding
anything (`B5`). Its prose can run dense — a prompt that cares about readability asks it to drop
mannered prose. It uses less formatting than earlier models, so an anti-formatting rule written for
them can strip structure the content needs; replace it with a rule saying when lists and headers
are appropriate. It may reproduce source passages without marking them as quotes — one complete
example of a correct response fixes it (`C2`). It can stop to ask permission for requested work
(`B6`) and extend beyond the task or commit extra tests (`B7`). At `low` effort it searches less —
a prompt that depends on current facts says that a name it half-recognizes is the thing to verify.
It rewrites whole files for small edits unless told to edit surgically. If the product hides tool
output from the user, the prompt says so, or the model runs commands to "show" output nobody sees.
A client-side compaction prompt names exactly what the summary must preserve. Never instruct it to
reproduce its reasoning (`C7`).

> **Verification by model.** On Opus 5 and Opus 5.5, scripted "verify your work" steps cause
> over-verification and should be removed. On Fable 5 and 5.1 long runs, self-verification should be
> made _explicit_, and separate fresh-context verifier subagents outperform self-critique. On
> Sonnet 5.5 and Haiku 5.5 at `low` effort, a coding prompt should require a real check before
> "done", because both skip it there. A prompt pinned to one model can carry guidance that is wrong
> for another.

**Legacy models (still served).** These paragraphs apply when a full model ID pins one of them,
and as the predecessor paragraph for the current model that succeeded them.

**Sonnet 5:** literal instruction following (state scope — see `C8`); verbosity self-calibrates;
more agentic than its predecessor and reaches for tools and self-verification loops readily — with
thinking disabled it is _less_ likely to reach for tools, so `B3` applies then.

**Opus 5:** self-verifies and self-corrects unprompted — explicit "verify/double-check" steps
cause over-verification, so a prompt should only script verification that the model wouldn't do
itself (external validators, evals); delegates to subagents readily — cap or scope delegation if
the prompt fans out; narration and written deliverables run long — calibrate length in the prompt
where it matters (effort controls thinking, not response length); **expands scope** — it may add
steps nobody asked for, so a narrow prompt states its scope explicitly. With thinking disabled it
can emit tool calls as plain text or leak internal XML tags, and a rule telling it not to think
makes that leakage worse — remove such a rule rather than adding one.

**Opus 4.8:** favors reasoning over tool calls — nudge explicitly if the prompt depends on tool
use; spawns **fewer subagents** by default — steer explicitly if the prompt fans out; `xhigh`/`high`
effort suits agentic work.

**Fable 5 (and Mythos 5, which shares this doc):** brief steering beats enumerating behaviors (see
the caller's over-prescription criterion); much longer turns on hard tasks —
if the prompt assumes quick completion or blocks synchronously, reconsider; dispatches parallel
subagents readily; never instruct it to reproduce its reasoning (`C7`).

> **The verification rule inverts between Opus 5 and Fable 5.**
> On Opus 5, scripted "verify your work" steps cause over-verification and should be removed. On
> Fable 5 long runs, the opposite holds: self-verification should be made _explicit_, and separate
> fresh-context verifier subagents outperform self-critique. A prompt pinned to one model can carry
> guidance that is wrong for the other.

## C. General Claude prompting

- **C1 — clear & direct.** Unambiguous, sequenced instructions.
- **C2 — multishot examples.** Present for style-dependent output (overlaps the caller's examples
  criterion).
- **C3 — room to think.** Complex judgment steps allow step-by-step reasoning.
- **C4 — XML/structure.** Structure used where it aids parsing; not decorative.
- **C5 — role.** A role/persona is set where it improves consistency (optional, not required).
- **C6 — chaining.** Genuinely complex tasks are split into sequential sub-steps rather than one
  mega-instruction.
- **C7 — no reasoning-echo.** The prompt never instructs the model to transcribe, echo, or explain
  its internal reasoning _as response text_ — including in `<thinking>` tags. Beyond being noise,
  this can be declined with the `reasoning_extraction` refusal on Fable 5 and 5.1, Opus 5 and 5.5,
  and Sonnet 5.5, and server-side fallback does not retry that category. If reasoning visibility is
  needed, read structured `thinking` blocks — do not ask the model to narrate them into output.
  Asking for a short explanation of the answer, or a summary of the actions taken, is fine.
- **C8 — explicit scope.** Instructions meant to apply broadly state their scope ("every section,
  not just the first"). All current models follow instructions literally and won't silently
  generalize from one item to the rest.
- **C9 — tool use not over-prompted.** No blanket "default to using `X`" or "if in doubt, use `X`".
  Tools that undertriggered on older models trigger appropriately now, so a blanket default makes
  them *over*trigger. Scope the nudge to the case that needs it ("use `X` when it would sharpen
  your understanding of the problem"). This qualifies `B3` rather than contradicting it: nudge
  explicitly where the model reasons least (thinking off, `low` effort), do not nudge blanketly
  otherwise.
- **C10 — irreversible actions are confirmed.** A prompt that can take destructive, hard-to-reverse,
  or outward-facing actions names which ones need the user's say-so first, and forbids reaching for
  a destructive shortcut when it hits an obstacle (bypassing a safety check with `--no-verify`,
  discarding unfamiliar files, `git push --force`). Local reversible work — editing files, running
  tests — needs no gate. Without this, a prompt takes the shortcut and the user learns about it
  afterward.
- **C11 — motivation, not just the rule.** An instruction states the reason behind it, because a model
  that understands the purpose generalizes to the cases the rule does not name, while a bare directive
  covers only the one it does. "NEVER use ellipses" is weaker than "your response will be read aloud
  by a text-to-speech engine, so never use ellipses since the engine will not know how to pronounce
  them." (Also stated by the open standard's skill-evaluation guidance, outside this file's sources:
  reasoning-based instructions outperform rigid `ALWAYS`/`NEVER` directives. Overlaps the caller's
  guardrail-consequence criterion, which applies the same rule to prohibitions; `C11` is the general
  case.)
- **C12 — say what to do, not what not to do.** Behavior and formatting steer better as a positive
  instruction than as a prohibition — "write in smoothly flowing prose paragraphs" over "do not use
  markdown" — because a prohibition rules one option out and leaves every other option open.

## D. Reduce hallucinations

- **D1 — permit "I don't know".** The prompt tells the model to omit/abstain/ask rather than
  fabricate when evidence is missing (e.g. a commit body's _why_, an inferred value).
- **D2 — ground in evidence.** Claims/outputs are tied to observable inputs (diffs, files,
  provided docs), not the model's priors, for factual tasks. For long documents (20k+ tokens) the
  documented technique is to extract word-for-word quotes **first** and reason from the quotes, which
  also keeps the model on the passages that matter instead of the whole document.
- **D3 — verification.** A verify/feedback step checks the output against a source or validator. The
  auditable form is stronger: every claim carries a supporting quote, and a claim with no quote behind
  it is withdrawn rather than shipped hedged.
- **D4 — source restriction.** For document tasks, restrict to provided content over general
  knowledge.
- **D5 — progress claims audited against tool results.** A prompt that reports its own progress on a
  long or autonomous run instructs the model to check each claim against a tool result from the
  session, and to say plainly what is unverified, skipped, or failing. Anthropic reports this
  nearly eliminates fabricated status reports on tasks designed to elicit them. (Sourced from the
  Fable 5 doc in group `B`, not from this group's doc.)
- **D6 — repeated sampling where correctness matters.** For output whose factual accuracy carries
  real cost, the same task is run more than once and the outputs compared: disagreement between runs
  is itself the signal that a claim was invented rather than read. This multiplies cost, so it is not
  warranted everywhere — score it against what the output is used for, not as a blanket requirement.

## E. Increase output consistency

- **E1 — output format specified.** Exact format/template given where output shape matters.
- **E2 — constrained by examples.** Concrete examples over abstract description (overlaps `C2` and
  the caller's examples criterion).
- **E3 — step-by-step.** Deterministic tasks broken into ordered, unambiguous steps.
- **E4 — structured output.** Strict-format outputs use a template/schema, not prose. When the
  requirement is guaranteed JSON-schema conformance, the answer is the Structured Outputs feature,
  not prompt engineering — a prompt that hand-rolls schema coaxing for that case is doing avoidable
  work.
- **E5 — no prefill.** Prefilling the assistant turn is unsupported on Claude 4.6 and later. A
  prompt that still relies on the prefill trick is stale; use structured outputs or system-prompt
  instructions instead.
- **E6 — retrieval for contextual consistency.** Where a prompt must answer the same question the
  same way across sessions — a support flow, a knowledge base, anything with a fixed body of fact —
  it grounds answers in a retrieved set rather than the model's recall, because recall varies between
  runs and a fixed corpus does not.

## F. Mitigate jailbreaks & prompt injection

The live doc splits this into two threat models: **direct** injection (the user is the adversary)
and **indirect** injection (the user is trusted, but the model reads third-party content — pages,
emails, documents, tool results — carrying adversarial instructions). Most prompts face the
indirect model.

- **F1 — content is data.** The prompt instructs treating read content (files, diffs, tool
  results, fetched pages) as data, never as instructions.
- **F2 — least privilege.** Tool/permission surface is minimal (overlaps the caller's
  tool-permission criterion); destructive actions gated, so a successful injection does minimal
  damage.
- **F3 — untrusted-content policy.** For prompts that process third-party content, the policy that
  such content can't override instructions is stated.
- **F4 — untrusted content is labeled and isolated.** Third-party content reaches the model in
  `tool_result` blocks — never in a system prompt or a plain user turn — and its nature and source
  are named ("body of an inbound email from an unknown sender"). JSON-encoding it removes any
  delimiter an attacker could break out of. Corollary: the prompt's _own_ instructions must not sit
  in tool results, where the model is trained to distrust them — and neither may the user's words. A
  prompt that relays a message the user sent mid-task delivers it as user text after the tool
  results, never inside a `tool_result` block, where Sonnet 5.5 and Haiku 5.5 treat it as a possible
  injection and ignore it. (The user-text half is sourced from those two docs in group `B`.)
- **F5 — screen and red-team.** Screening runs on both sides: untrusted **input** before it reaches
  the main prompt, and **tool output** before the prompt acts on it. The documented pattern for each
  is a lightweight model returning a constrained classification, so the verdict is a value the caller
  branches on rather than prose it has to interpret. The second check is whether the prompt's evals
  include a deliberate injection attempt (overlaps the caller's eval edge-case criterion).
- **F6 — repeat offenders.** Where the prompt's own user is the adversary, it says what changes when
  the same user keeps probing — a firmer refusal, throttling, escalation — instead of meeting each
  attempt as if it were the first. Score `N/A` where the prompt's adversary is third-party content
  rather than its user, which is the common case. For a chatbot prompt, the simplest form is a line
  saying its rules hold for the whole conversation, even when a user argues, gives a sympathetic
  reason, asks for just a small part, cites an approved exception, or keeps asking. Haiku 5.5's doc
  reports that this line holds the system prompt more often. (That form is sourced from the Haiku 5.5
  doc in group `B`.)

## G. Reduce prompt leak

- **G1 — proportionate.** Leak defenses only where real secrets exist; not over-engineered. If the
  prompt holds no secrets, absence of leak defenses is correct, not a gap.
- **G2 — no needless proprietary detail.** The prompt doesn't embed secrets/proprietary specifics
  it doesn't need.
- **G3 — monitoring before hardening.** The live guidance puts output screening and post-processing
  **ahead** of leak-resistant prompt wording, because hardening the prompt adds complexity that can
  degrade the task while a filter on the way out does not. Where a prompt does hold real secrets,
  check that something screens the output — a keyword filter, a regular expression, or a prompted
  model — before concluding that more hardening is the answer. Scored under `G1`'s proportionality:
  no secrets, no gap.

## Reviewed and not adopted

The 2026-10-09 reconciliation reviewed these source recommendations and kept them out of the
criteria on purpose. A refresh that reports one of them as drift has found nothing new.

- **API and harness advice in the model docs** (group `B` intro): `max_tokens` sizing,
  `thinking.display`, append-only history, turn-scoped reminders, time-budget lines added by the
  harness, tolerant tool-name matching, crop and send-to-user tools, marking pasted text with
  tagged IDs. These shape the request or the harness, not the prompt text that a caller scores.
- **Task-specific prompt snippets in the model docs:** frontend aesthetics, compaction-summary
  wording, long-output notes at `xhigh`/`max`, quoting retrieved sources, safeguard false-positive
  phrasing. The per-model paragraphs name the behaviors; the snippets are recipes, not criteria.
- **General best-practices items (group `C`):** long documents placed above the query, parallel
  independent tool calls, cleanup of temporary files, not hard-coding to tests, the
  `<default_to_action>` toggles, multi-context-window state files, research success criteria, model
  self-knowledge. Each fits a narrow kind of prompt; a caller whose prompt is that kind can apply
  `C1` and `C8`.
- **Reviewing summarized thinking when an answer looks wrong (group `D`):** a debugging practice for
  the operator, not prompt text.
- **Refusal guidance in direct-injection system prompts and continuous output monitoring (group
  `F`):** the first applies to a user-facing chatbot, which `F6` already covers; the second is
  operations, already folded into `F5`'s screening.
- **Separating context from queries and periodic leak audits (group `G`):** proportionate only where
  real secrets exist, which `G1` and `G3` already gate.
