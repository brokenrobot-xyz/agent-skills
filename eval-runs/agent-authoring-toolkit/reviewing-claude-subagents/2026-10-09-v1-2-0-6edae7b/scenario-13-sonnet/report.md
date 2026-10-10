## Review: researching-package-updates — sound form, two gaps in the return contract

**Verdict: not yet — 2 blocking**

The definition earns its subagent form and is well built: least privilege is enforced in configuration, fetched content is treated as data, and the return is a fixed, bounded set of fields. Two Medium findings, both in the return contract, block acceptance. The `risky` verdict has no stated condition, and breaking-change claims are not tied to a fetched source. All findings are inferential: the definition was read, never run.

### Fit-for-purpose

The subagent form holds (A1, A2). It reads many changelogs and returns a capped verdict; the read-only guarantee is enforced by `tools: Read, Grep, Glob, WebFetch`; and the delegation message names every input. The workspace has no sibling definitions, and the remit does not substantially overlap the built-ins. Structure pass: no findings.

### Summary

| #   | Severity | Pass   | Key(s) | Finding                                                                                                        | Notes                       |
| --- | -------- | ------ | ------ | -------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1   | Medium   | Detail | E1, C1 | `risky` has no membership test, and the only tie-break names `needs-changes`                                   |                             |
| 2   | Medium   | Detail | D3, D2 | Breaking-change entries are not tied to the version/URL they came from; recalled claims look like fetched ones | inferential, low confidence |

### What's already right

- Least privilege is enforced in configuration: no Bash, Edit or Write, so the read-only claim is real (A10, F2).
- The content-is-data rule is explicit and carries its reason, lines 11–13 (F1, F3, inbound half of A26).
- The return contract uses named fields in a fixed order, an explicit word budget, and says the report is the only channel to the parent (A6, A7, E1).
- The delegation-message cargo is named, with a deterministic `BLOCKED:` exit and a reason (A9, A27, D1).
- The description states triggers in the third person and includes "Use proactively" (A3, A4, A5).
- Guardrails carry their consequences: read-only gives re-runnability, BLOCKED avoids answering an upgrade nobody asked for, and the needs-changes tie-break weighs a broken build against one review (C11, R10).
- Investigation scope is explicit ("every version between current and target rather than only the endpoints", C8); unused changes are tagged rather than dropped (B4).
- A "Confidence and gaps" field makes room to report what could not be verified (D1).
- Deterministic checks pass: `name` is 27 characters, lowercase and hyphens, no colon (A17); no tool is always stripped (A12); all four tools are background-safe (A13); all entries resolve (A14); no unknown or snake_case fields.

### Findings

#### Finding 1 — `E1` (also `C1`): `risky` has no membership test

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `researching-package-updates.md:33, 41–42`
- **Evidence:** "**VERDICT: `compatible` | `needs-changes` | `risky`** — one clause of reason." and "Lean toward `needs-changes` when the sources conflict"
- **Defect:** The body defines no membership test for `risky`, and nothing separates it from `needs-changes`. The only tie-break rule (line 41) names `needs-changes` and never mentions `risky`.
- **Manifests:** Prediction: take an upgrade with one `affects-us` breaking change and one intermediate version whose changelog could not be fetched. One run returns `needs-changes`, the next returns `risky`, and a parent that branches on the verdict (for example "apply Required edits when `needs-changes`") handles the same upgrade differently from run to run.
- **Fix:** Add one line per verdict value that states its condition. For example: `risky` means unverifiable gaps or conflicting sources remain after the required edits; `needs-changes` means every affecting change is known and has an edit. Then align line 41 with those conditions.
- **Notes:** inferential

#### Finding 2 — `D3` (also `D2`): breaking changes are not tied to a source

- **Severity:** Medium · **Pass:** Detail · **Confidence:** low
- **Where:** `researching-package-updates.md:35–39`
- **Evidence:** "- **Breaking changes:** each one tagged `affects-us` or `not-used-here`; "none" when the release carries none." / "- **Required edits:** concrete `file:line` changes"
- **Defect:** The return contract does not tie each breaking change to the changelog version or URL it came from. So nothing separates a claim the subagent read from one it recalled from training data.
- **Manifests:** Prediction: WebFetch on one intermediate version's release notes fails or comes back truncated. The subagent fills the gap from memory ("v5.0 removed `foo()`") and marks it `affects-us`. The parent then applies a Required edit for a change that may not exist, and the report shows no difference between grounded and recalled entries. The "Confidence and gaps" field reduces this risk but does not require per-claim sourcing.
- **Fix:** Require each Breaking-changes entry to name the version and source URL it came from. State that a change with no fetched source goes under "Confidence and gaps" and not under Breaking changes.
- **Notes:** inferential

### Advisory

Listed once; advisory findings never gate the verdict.

- `A26` · researching-package-updates.md:30–39 — (low confidence) the return contract never says to mark quoted changelog text as third-party content; the Finding 2 fix covers most of this.
- `R7` (convention 9) · researching-package-updates.md:25–26 vs 36 — "blocker" appears only here, and "not reported" can read as "omitted", conflicting with the `not-used-here` tag; rewrite as "is tagged `not-used-here`".
- `R7` (conventions 6/9) · researching-package-updates.md:36–37 — (low confidence) "the release" is singular but line 23 covers every version in the range; use "when no version in the range carries one".
- `R7` (convention 9) · researching-package-updates.md:11 vs 23 — (low confidence) "changelogs, release notes" vs step 1 "the changelog"; name one term in both places.
- `R7` (convention 3) · researching-package-updates.md:41 — condition follows the command in "Lean toward `needs-changes` when the sources conflict"; polish only.
- `R7` (convention 8) · researching-package-updates.md:31, 41 — "leave out" can be "omit"; "lean toward" is probably deliberate, so optional.
- `R4` · researching-package-updates.md:17–19 — (low confidence) BLOCKED covers a missing input but not an ambiguous one such as a semver range or `latest`.
- `A7` / `E1` · researching-package-updates.md:30–31, 41 — (low confidence, possibly deliberate) the 400-word cap and concrete `file:line` edits can pull against each other on a major bump; state which wins.

### Coverage

| Group | Status                                                             | Findings |
| ----- | ------------------------------------------------------------------ | -------- |
| A     | Pass (A1, A2, A11, A28 scored in the structure pass; A26 advisory) | —        |
| B     | Pass (Opus 5.5 subset plus Opus 5 predecessor paragraph)           | —        |
| C     | Gap                                                                | 1        |
| D     | Gap                                                                | 2        |
| E     | Gap                                                                | 1        |
| F     | Pass                                                               | —        |
| G     | Pass                                                               | —        |
| H     | N/A — the subagent ships no evals                                  | —        |
| R     | Pass (R7, R4 advisory only; R5, R6 N/A)                            | —        |

### Criteria notes

- Criteria last synced: checklist 2026-10-09 (0 days ago); shared B–G: 2026-10-09 (0 days ago).
- Waived: 0.
- Group B subset applied: Opus 5.5 (`claude-opus-5-5`), the session model, because the target has no `model:` pin and inherits. The skill's own pin is turn-scoped and does not choose this subset.
- Group H is N/A: the subagent ships no evals.
- No stage ran inline or under the fallback; both plugin agent types resolved.
- Scoping: the run was non-interactive and the caller supplied no scope, so the four defaults were assumed (analysis only, all groups equal, surgical change appetite, stop at the structural gate).
- The workspace has no `CLAUDE.md`, so A8, R5 and R6 had nothing to check.
