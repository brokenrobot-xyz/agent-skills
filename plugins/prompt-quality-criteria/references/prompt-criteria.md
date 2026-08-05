# Prompt quality criteria

Criteria groups `B`–`G` for grading a Markdown prompt that steers Claude. A reviewer invokes this
skill, reads these criteria, and scores its own artifact against them. This file grades nothing and
assigns no severity — see [Who scores](#who-scores).

**last-synced:** 2026-07-29 — re-fetch the URLs below and reconcile any new guidance when this is
stale.

## Contents

- [Who scores](#who-scores)
- [Sources](#sources)
- [B. Model-specific prompting (conditional)](#b-model-specific-prompting-conditional)
- [C. General Claude prompting](#c-general-claude-prompting)
- [D. Reduce hallucinations](#d-reduce-hallucinations)
- [E. Increase output consistency](#e-increase-output-consistency)
- [F. Mitigate jailbreaks & prompt injection](#f-mitigate-jailbreaks--prompt-injection)
- [G. Reduce prompt leak](#g-reduce-prompt-leak)

## Who scores

**The caller scores.** These criteria read differently per artifact — `B4` bites hardest on a
review-shaped artifact, `C8`'s "broadly" depends on what the artifact spans, and `F4` gains a second
dimension when the artifact's output flows into a parent session. A grader here would need the
caller to hand over that context, and would then be doing the caller's job with less information
than the caller already has. So this file supplies criteria; the caller assigns severity and writes
the finding.

**"The prompt"** in every criterion below means the artifact under review: a skill's `SKILL.md` body,
a subagent definition's body, or any Markdown that becomes instructions for Claude.

**Cross-references to criteria this file does not hold.** A few criteria overlap one the caller
keeps — skill-authoring conformance, eval coverage, and the like. Those name the caller's criterion
by description rather than by key, because the key differs per caller. Resolve each against your own
checklist.

Each item below is a pass criterion. Cite the criterion key (e.g. `B4`, `D1`) in findings; the keys
are stable across every caller, so two reviewers' reports stay comparable. A few items carry their
evidence from a doc outside their own group; each of those names its source inline, so a re-sync
checks the page the item actually came from.

## Sources

| Key | Doc                                            | URL                                                                                                      |
| --- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
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

Apply the subset matching the prompt's pinned or likely model (per its `model:` frontmatter). All
four current model-prompting docs share the items below; per-model specifics follow. If the pin
is a durable alias (`opus`, `sonnet`) or absent, treat the currently-released model in that family
as the target. Managed settings can override a model pin, so a prompt that depends on quirks of
exactly one model is fragile. (The caller reports this alongside any group `B` finding.)

**Shared across current models:**

- **B1 — verbosity.** No forced ceremony (mandatory summaries, interim status) unless it is
  load-bearing; current models self-calibrate length. (See also the caller's over-prescription
  criterion.)
- **B2 — effort/thinking not over-scaffolded.** Do not hand-roll what adaptive thinking and the
  effort parameter already do.
- **B3 — tool nudges.** If the prompt relies on tool use with thinking off, it nudges explicitly.
- **B4 — coverage before filtering.** A prompt that finds, reviews, or audits must not cap the
  _finding_ stage with "only report high-severity", "be conservative", or "don't nitpick". Current
  models follow such a bar literally — they investigate just as deeply, then drop findings below
  it, so measured recall falls while the underlying ability is unchanged. Ask for coverage at the
  finding stage and filter in a separate step. (Stated for Sonnet 5, Opus 5, and Opus 4.8.)
- **B5 — progress-update scaffolding.** Current models narrate agentic work well unprompted.
  Scaffolding that forces interim status ("after every 3 tool calls, summarize progress") should be
  removed; describe the cadence and shape wanted instead, with positive examples. **Carve-out:** a
  workflow checklist the prompt tells the model to copy into its reply and tick off is _not_ a `B5`
  finding — Anthropic's skill-authoring best-practices doc
  (`https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices`) endorses that
  pattern by name for complex multi-step workflows. `B5` governs narration cadence, not task
  tracking.

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
  its internal reasoning _as response text_. Beyond being noise, this trips the
  `reasoning_extraction` refusal on Fable 5 (and elevated fallbacks). If reasoning visibility is
  needed, read structured `thinking` blocks — do not ask the model to narrate them into output.
  (Sourced from the Fable 5 doc in group `B`, not from this group's doc.)
- **C8 — explicit scope.** Instructions meant to apply broadly state their scope ("every section,
  not just the first"). All current models follow instructions literally and won't silently
  generalize from one item to the rest.
- **C9 — tool use not over-prompted.** No blanket "default to using `X`" or "if in doubt, use `X`".
  Tools that undertriggered on older models trigger appropriately now, so a blanket default makes
  them *over*trigger. Scope the nudge to the case that needs it ("use `X` when it would sharpen
  your understanding of the problem"). This qualifies `B3` rather than contradicting it: nudge
  explicitly when thinking is off, do not nudge blanketly otherwise.
- **C10 — irreversible actions are confirmed.** A prompt that can take destructive, hard-to-reverse,
  or outward-facing actions names which ones need the user's say-so first, and forbids reaching for
  a destructive shortcut when it hits an obstacle (bypassing a safety check with `--no-verify`,
  discarding unfamiliar files, `git push --force`). Local reversible work — editing files, running
  tests — needs no gate. Without this, a prompt takes the shortcut and the user learns about it
  afterward.

## D. Reduce hallucinations

- **D1 — permit "I don't know".** The prompt tells the model to omit/abstain/ask rather than
  fabricate when evidence is missing (e.g. a commit body's _why_, an inferred value).
- **D2 — ground in evidence.** Claims/outputs are tied to observable inputs (diffs, files,
  provided docs), not the model's priors, for factual tasks.
- **D3 — verification.** A verify/feedback step checks the output against a source or validator.
- **D4 — source restriction.** For document tasks, restrict to provided content over general
  knowledge.
- **D5 — progress claims audited against tool results.** A prompt that reports its own progress on a
  long or autonomous run instructs the model to check each claim against a tool result from the
  session, and to say plainly what is unverified, skipped, or failing. Anthropic reports this
  nearly eliminates fabricated status reports on tasks designed to elicit them. (Sourced from the
  Fable 5 doc in group `B`, not from this group's doc.)

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
  in tool results, where the model is trained to distrust them.
- **F5 — screen and red-team.** For a prompt that acts on tool output, the checks are whether
  suspicious output is screened before it is acted on, and whether the prompt's evals include a
  deliberate injection attempt (overlaps the caller's eval edge-case criterion).

## G. Reduce prompt leak

- **G1 — proportionate.** Leak defenses only where real secrets exist; not over-engineered. If the
  prompt holds no secrets, absence of leak defenses is correct, not a gap.
- **G2 — no needless proprietary detail.** The prompt doesn't embed secrets/proprietary specifics
  it doesn't need.
