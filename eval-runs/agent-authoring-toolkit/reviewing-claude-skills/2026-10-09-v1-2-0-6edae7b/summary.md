# Eval run — reviewing-claude-skills — 2026-10-09

- **Repo HEAD tested:** `6edae7b` (branch `chore/claude-5-5-models`, clean tree)
- **Plugin:** agent-authoring-toolkit 1.2.0 (deps: prompt-quality-criteria 1.2.0,
  writing-simplified-technical-english 1.0.0), loaded from the working copy with `--plugin-dir`.
  The installed 1.1.x copies were disabled. Every runner transcript shows the skill loaded from
  `plugins/agent-authoring-toolkit/skills/reviewing-claude-skills`, and the reports cite keys that
  exist only in this commit's criteria (B6, B7, H18, A25–A28). Criteria `last-synced: 2026-10-09`.
- **Model:** runners on `opus` → claude-opus-5-5 (the skill pins `claude-opus-5-5`). Graders on
  `fable` → Fable 5.1, never the model under test (H10).
- **Runner:** one clean-context subagent per scenario, fixtures copied into a scratch
  workspace's `.claude/skills/`, verbatim prompt. Machine checks from the repo root
  (`machine-checks.txt`).
- **Purpose:** first campaign after moving the toolkit to the Claude 5.5 generation and
  reconciling the criteria. Does the branch regress anything, and do the reviewers hold on
  Opus 5.5?

## Scope and deliberate deviations

- **Subset: 6 of 27 scenarios** — 6, 7, 8, 16, 18, 19 — chosen for what the branch changed:
  6 clean-skill regression risk from the new criteria; 7 the C7 rewording; 8 the Sonnet 5.5
  group-B subset; 16 B3 at low effort; 18 the A20 wording; 19 shared criteria with the Opus 5.5
  inheritance. Scenario 19 ran twice (below). **8 runs.**
- **Baseline (without-skill) arm deferred** again, so H13 assertion hygiene stays unmeasured.
- **Scope replies were supplied by the operator as a simulated user.** This skill has no
  non-interactive rail: with no scope it briefs and waits (Step 2). The first runs of 6 and 7
  stopped there correctly. Both were resumed, and later runs started, with the reply
  `use the defaults` — the answer the skill itself offers.
- **Scenario 19 has a forced-sweep arm.** The default scope stops at the structural gate, which
  makes the scenario's B–G assertions unreachable. `scenario-19-gated` ran as written;
  `scenario-19-forced-sweep` used the reply "Use the defaults, except: run the full detail sweep
  regardless, even if the structure pass finds a High" (the skill's documented escape).
- **Nested reviewer transcripts are committed** under each scenario's `nested/` — the gap the
  2026-08-26 campaign recorded. Assertions about subagent behavior were graded from them.
- **The user's email address is redacted** to `<user-email>` in transcripts (Claude Code's
  injected context; not evidence for any grade).
- **Artifacts are prettier-formatted** per the repo's format check (whitespace and Markdown
  syntax only). The `.jsonl` transcripts, which the check does not cover, hold the verbatim output.

## Results

| id  | scenario                             | verdict produced                              | assertions                   | blocking (genuine / inflated) | tokens       | duration   |
| --- | ------------------------------------ | --------------------------------------------- | ---------------------------- | ----------------------------- | ------------ | ---------- |
| 6   | eval-clean-skill-no-padding          | not yet — 9 blocking (expected: acceptable)   | 9/10                         | 7 / 2                         | 107,831      | 275 s      |
| 7   | eval-reasoning-echo                  | **no report — refused twice** (see Incidents) | —                            | —                             | 43,738 + n/a | 43 s + n/a |
| 8   | eval-model-subset                    | not yet — 5 blocking                          | 11/12                        | 5 / 0                         | 60,743       | 302 s      |
| 16  | eval-blanket-tool-default            | not yet — 5 blocking                          | 10/11                        | 4 / **1 (branch)**            | 68,060       | 239 s      |
| 18  | eval-precedence-extensions-vs-spec   | not yet — 6 blocking                          | 10/11                        | 4 / **2 (branch)**            | 63,755       | 236 s      |
| 19  | eval-shared-criteria-invoked (gated) | not yet — gated                               | 8/8 reachable, 6 unreachable | 3 / 0                         | 51,470       | 105 s      |
| 19  | ⤷ forced-sweep arm                   | not yet — 13 blocking                         | 14/14                        | 13 / 0                        | 75,886       | 481 s      |

**Aggregate: 62 PASS, 4 FAIL, 6 UNREACHABLE over 7 graded runs. Blocking findings: 36 genuine,
5 inflated, 0 fabricated; 3 of the 5 inflated rest on a criterion this branch added or changed.**
Runner tokens: 471,483 (scenario 7's retry reported none). Grader tokens: 600,739. Per-assertion PASS/FAIL with quoted evidence is in each scenario's
`grading.json`.

FAILs, one line each with the grader's evidence:

- **6 / a1** — "**Verdict: not yet — 9 blocking**". The fixture is no longer clean against the
  current criteria (H18, added on this branch, found a genuine gap); 2 Mediums inflated.
- **8 / a3** — the managed-settings caveat is absent from the report (`grep -i managed` empty);
  the detail payload carried "Managed settings can override the pin." and consolidation dropped
  it. Step 7 makes the note conditional on group-B findings; the eval asserts it unconditionally.
- **16 / a2** — Finding 4 (B2/B3, Medium) flags the scoped nudge "This step runs at low effort:
  use `Grep` to enumerate every occurrence" — the line the scenario requires be left standing.
- **18 / a3** — no portability consequence stated; the A20 packaging-rejection sentence this
  branch added went unused.

## What the branch changed, as measured

- **Validated.** Group B resolves the 5.5 aliases and inherits the predecessor paragraph:
  scenario 8 (`claude-sonnet-5-5` → B1–B7 + Sonnet 5.5 + Sonnet 5, nothing else) and the
  scenario 19 forced sweep (`opus` → Opus 5.5 + Opus 5; "Verify your work, then double-check"
  scored under the Opus 5/5.5 over-verification callout). H18 found a real gap (6). A27 and A16
  produced genuine findings in the forced sweep.
- **Regression (scenario 16).** The B2 rewrite ("asking the model to think less … does not
  reliably reduce its thinking") was applied to the fixture's _descriptive_ "runs at low effort",
  which this branch introduced when Sonnet 5.5 dropped disabled thinking. The fix also cites a
  per-step `effort` setting that skills do not have.
- **Overreach.** A28 (new) stretched "instructions have to stand on their own" into a
  `$ARGUMENTS` requirement (18); the A16 rewrite's "grants permission without prompting" framing
  carried a low-confidence inflated Medium (18); B7 (new) fired at Low on a skill that builds
  nothing (6).

## Machine checks

Every criterion key cited in all six reports resolves to a defined criterion in the skill's
checklist or `prompt-criteria.md`. Every scratch fixture is byte-identical before and after its
run (`machine-checks.txt`).

## Incidents

- **Scenario 7: `reasoning_extraction` refusal, reproducible (2/2).** The resumed run and a fresh
  retry both terminated with `API Error: Opus 5's safeguards flagged this message … Details:
[reasoning_extraction]`. In the retry, Pass 1 completed ("No High → continue to Pass 2"); the
  refusals hit in Pass 2, where C7 scores the fixture's reasoning-echo instruction, and then on the
  runner's request once that result reached it. Each request ran on claude-opus-5-5 and was
  retried on the claude-opus-5 fallback, which also declined. Request IDs:
  `req_011Cfs9dftaXLZpt58byV4mD`, `req_011Cfs9tjTopZcC7i8SwBn3L`,
  `req_011Cfs9uLumLZzraKzmQU9oh`. Not a regression and not flaky: on the 5.5-generation models
  the reviewer can be refused on exactly the skills C7 exists to catch. The prompt-quality-criteria
  campaign of the same date named C7 against a reasoning-echo fixture without a refusal, so the
  trigger is the detail sweep analysing and quoting the instruction. Follow-up, not an eval edit.
- **Version and criteria-age reporting describe the installed copy, not the running one.** Step 1
  reads `~/.claude/plugins/installed_plugins.json` to tell the user which version runs; under
  `--plugin-dir` that file describes the disabled 1.1.0 install. Runners repeated "installed 1.1.0",
  and reports printed the 1.1.1 cache's `last-synced: 2026-08-19` beside the 2026-10-09 copy in use.
  The reviews themselves scored against the running copy. Follow-up.
- **Runner error.** The first scenario-6 runner claimed the installed 1.1.0 skill ran; the
  transcript's `Base directory for this skill` is the working copy. Corrected in its run notes.
- **Report assembly.** Scenario 19's forced sweep merged a structure A8 finding with a detail
  F1/F3 finding (both payloads asked for it; disclosed); no grade changed. Its group-B advisory
  cites a bare group letter because the "Verification by model" callout has no key.
- **Harness.** The Write tool refused `report.md` inside several runners ("Subagents should return
  findings as text…"); runners used shell heredocs. No grade affected.

## Follow-ups

1. Scope B2 to instructions that try to change how much the model thinks, and say in B3 that a
   nudge scoped to a low-effort or thinking-off step is the correct pattern; re-run 16.
2. Tighten A28 (forked skills only; no argument-handling requirement), A16's wording, and B7's
   scope (prompts that build); re-run 6 and 18.
3. Reasoning-echo handling: have the detail reviewer cite C7 without reproducing the instruction
   at length; re-run 7.
4. Report the running copy's version and criteria age, not `installed_plugins.json`'s.
5. Give the verification callout a key (B8). Name the forced-sweep arm in scenario 19's record.
   Refresh scenario 6's fixture against the current criteria. Settle the managed-settings
   caveat: Step 7 or the eval.
