## Review: redacting-logs — stopped at the structural gate

**Verdict: not yet — gated**

The skill is well-shaped for its size: one job, one default path, a linear read → replace → write → report chain, and a body with real headroom inside both length ceilings. It fails the gate on one thing, and it is the thing the skill exists to do. Step 2 says "Replace matches of the patterns below" and then supplies no patterns — only three prose category names ("API keys and bearer tokens", "Email addresses", "IPv4/IPv6 addresses") — and folds an unbounded "anything that looks sensitive" judgment clause into the same step. The most fragile, most mechanical operation in the workflow is therefore left at maximum degrees of freedom, and step 4's per-type counts are tallied from that same eyeball pass rather than from a match run. Because the output of this skill is an artifact produced expressly for external sharing, a miss is not a quality defect that surfaces later — it is a leaked credential in a file the user has been told is safe, with a count that reads like proof of completeness. That is a redesign of step 2, not a wording fix, so the detail sweep is not spent on text the redesign will replace.

### Summary

| #   | Severity | Pass      | Key(s) | Finding                                                                                                              | Notes                |
| --- | -------- | --------- | ------ | -------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | High     | Structure | A8     | The match step names three categories but gives no pattern, and mixes an unbounded judgment sweep into the same step |                      |
| 2   | Medium   | Structure | A22    | No validation phase between writing the redacted artifact and reporting success                                      | Depends on Finding 1 |

### What's already right

- **A4 — length.** Verified by measurement, not eye: 24 total lines, 19 body lines after frontmatter, ~1004 characters ≈ 212–271 tokens against the ~500-line / ~5000-token ceilings. There is ample room to make the match step exact inline without pushing anything to a reference file.
- **A5 — progressive disclosure.** Nothing is inlined that should have been split out. At this size a single self-contained SKILL.md with no reference files is the correct shape, and the bundle matches it exactly (one file, no stray directories).
- **A13 — one default, not a menu.** The skill picks one output convention (`.redacted` suffix, alongside the original) and one placeholder per category, rather than offering a choice of redaction styles to deliberate over.
- **A17 — not over-prescriptive.** Four steps, no enumerated behavior lists, no rules restating what a competent model already does. The fix below should add exactness to step 2 without turning the skill into a rulebook.
- **R1 — simplicity first.** No speculative configuration: no toggles for placeholder format, no in-place mode, no options the job did not ask for.
- **R12 — scope coherence.** One job, one subject, one set of criteria. The description names a single task with concrete trigger terms ("redact, sanitize, or scrub a log") and the body does exactly that. There is no second responsibility to split out.
- **R14 — bounded decision space.** The decisions chain rather than multiply: read → replace → write → report, with no outcome computed from independent inputs, no operation respecified across phases, and no config that can empty a step. The validation phase recommended below extends the chain by one link without multiplying it.
- **Step 3's non-overwrite guard.** "never overwrite the original, because the original is the only place the unredacted evidence exists" states the instruction and its reason, and it is what makes the workflow safe to re-run. Keep it as-is through any redesign.

### Findings

#### Finding 1 — `A8`: the match step is prose where it needs to be exact

- **Severity:** High · **Pass:** Structure · **Confidence:** high
- **Where:** `.claude/skills/redacting-logs/SKILL.md` — `## Steps`, step 2 (lines 13–17), with step 4 (line 20) downstream of it
- **Evidence:** "Replace matches of the patterns below with their placeholders. Also redact anything that looks sensitive. / - API keys and bearer tokens → `[REDACTED-KEY]` / - Email addresses → `[REDACTED-EMAIL]` / - IPv4/IPv6 addresses → `[REDACTED-IP]`"
- **Defect:** The skill's one mechanical, fragile step — exhaustively matching credential and identifier shapes across a whole log — is left at maximum freedom. The sentence promises "the patterns below" and then supplies three category names, no pattern for any of them; an unbounded judgment clause is folded into the same step; and the per-type counts of step 4 are tallied from the same eyeball pass rather than from a match run.
- **Manifests:** A user asks the skill to scrub a 40k-line CI log before attaching it to a public issue. The log carries an obvious `Authorization: Bearer ey…` header, which the model catches, and 12k lines later an `AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE` line plus a line-wrapped session token. With no pattern to match against, the model reads the file as prose, redacts the header, misses the AWS key, and reports "3 keys redacted". The `.redacted` file is attached to the public issue with a live credential in it, and the count reads as though the job was complete.
- **Fix:** Move the match itself out of prose judgment and into an exact, low-freedom form — either one concrete regex per placeholder type stated inline (the body has budget: 19 lines and ~270 tokens against the ~500-line / ~5000-token ceilings) or a bundled `scripts/redact.py` that the step runs and names as run-not-read — and have step 4 report the counts that pass emits rather than a model tally. Then separate the freedom levels instead of mixing them in one step: keep "anything else that looks sensitive" as its own explicitly high-freedom pass over the mechanical pass's output, so the judgment sweep cannot be mistaken for the coverage guarantee.

#### Finding 2 — `A22`: no verifiable intermediate before success is declared

- **Severity:** Medium · **Pass:** Structure · **Confidence:** high
- **Where:** `.claude/skills/redacting-logs/SKILL.md` — `## Steps` steps 3–4 (lines 18–20) and `## Output` (lines 22–24)
- **Evidence:** "3. Write the redacted copy next to the original with a `.redacted` suffix — never overwrite the original, because the original is the only place the unredacted evidence exists. / 4. Report how many replacements were made, per placeholder type."
- **Defect:** This is a high-stakes operation whose output is produced for external sharing, and the workflow goes write → report with no validation phase in between. Nothing re-examines the `.redacted` artifact before the skill declares success, so the reported counts are the only evidence of coverage — and they come from the same pass that could have missed something.
- **Manifests:** The model redacts 12 of 13 email addresses in a 5k-line support log. Step 4 reports "12 emails redacted", step 3's artifact is on disk, and the skill ends. Because no step re-scans the written file, the report is indistinguishable from a complete run, and the user forwards a file still containing a customer's address to a vendor.
- **Fix:** Add a validation phase between the write and the report: re-scan the written `.redacted` file with the same patterns the match step used, and require zero remaining matches before step 4 reports. A non-zero result names the specific offending line and returns to the replace step rather than proceeding. Derive the per-type counts from the before/after scan difference, so the reported number is a measurement of the artifact rather than a recollection of the edit.
- **Notes:** Depends on Finding 1 — a re-scan is only meaningful once there are concrete patterns to re-scan with. Fix Finding 1 first; this one then costs one step.

### Redesign recommendation

Keep the four-step spine, the `.redacted` convention, and the non-overwrite guard — the shape is right. The redesign is confined to step 2, and it splits one overloaded step into two steps at different freedom levels plus one check:

1. **Mechanical pass (low freedom).** State the actual patterns — one regex per placeholder type — or ship `scripts/redact.py` and have the step run it without reading it. Either way the match becomes reproducible instead of recalled. Inline regexes are the lighter option and the body has the budget for them; a script is the stronger option because it also emits the counts.
2. **Judgment pass (explicitly high freedom).** "Also redact anything else that looks sensitive" survives as its own step over the mechanical pass's output, labeled as a supplement, so it can never be mistaken for the coverage guarantee.
3. **Verification (Finding 2).** Re-scan the written file with the same patterns; zero matches is the gate on reporting success. Counts come from the scan, not from memory.

What this deletes: the ambiguity of "the patterns below" pointing at no patterns, and the current conflation of "I matched a pattern" with "I judged this looked sensitive" in a single reported number. What it adds: one step and, optionally, one script file. The decision space stays linear — no new branch, no new configuration.

### Coverage

| Group / criterion                     | Status                          |
| ------------------------------------- | ------------------------------- |
| A4 — length                           | Pass                            |
| A5 — progressive disclosure           | Pass                            |
| A8 — degrees of freedom               | **Gap — Finding 1 (High)**      |
| A13 — one default, not a menu         | Pass                            |
| A17 — not over-prescriptive           | Pass                            |
| A22 — verifiable intermediate outputs | **Gap — Finding 2 (Medium)**    |
| R1 — simplicity first                 | Pass                            |
| R12 — scope coherence                 | Pass                            |
| R14 — bounded decision space          | Pass                            |
| A (non-structural criteria)           | not scored — gated on structure |
| B — model-specific prompting          | not scored — gated on structure |
| C — general prompting                 | not scored — gated on structure |
| D — hallucination guards              | not scored — gated on structure |
| E — output consistency                | not scored — gated on structure |
| F — injection and jailbreak defenses  | not scored — gated on structure |
| G — prompt-leak defenses              | not scored — gated on structure |
| H — evals                             | not scored — gated on structure |
| R (non-structural criteria)           | not scored — gated on structure |

Every structure-pass criterion in the checklist was scored; nothing in Pass 1 was skipped.

### Criteria notes

- Criteria last synced: 2026-08-19 (6 days ago) — the shared B–G file goes unread in a gated run, so it carries no date here.
- Scope was supplied by the invoking context rather than by interview: deliverable — analysis only; focus — all criteria groups weighted equally; change appetite — surgical; structural gate — stop.
- Waivers: none. No `review-waivers.md` exists anywhere in the workspace, so no finding here is waived.
- Bundle reviewed: `SKILL.md` only — no `evals/`, no `references/`, no `scripts/`, no hooks. This run exercises `agent-authoring-toolkit` 1.0.0.
- Pass 1 ran in the `structure-reviewer` subagent as intended; no stage fell back to substitution or inline execution. Pass 2 was not spawned, by the gate.
- Note on the surgical appetite: Finding 1's fix is larger than a tweak. The cheapest form that actually closes it — three inline regexes and one split step — is still a change to the skill's central step, not a rewording of it.

### Next step

Two ways forward, your call:

1. **Redesign first, then re-review** (the gate's recommendation). Apply the step-2 collapse above, then re-run this review from the top. The detail sweep then grades the text you intend to keep.
2. **Sweep now anyway.** I run Pass 2 over the current bundle for the full A–H and R criteria. Findings landing inside step 2 and the reporting step would be marked subordinate to Finding 1, since the redesign is likely to replace the lines they cite.

Either way, note that `A8` is the criterion where a leak actually happens. Fixing the prose around it without making the match exact would produce a cleaner-reading skill with the same failure mode.
