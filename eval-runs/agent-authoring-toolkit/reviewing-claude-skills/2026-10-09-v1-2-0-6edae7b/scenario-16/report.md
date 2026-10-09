## Review: mapping-redirects — sound shape, but it validates after it writes and has no evals

**Verdict: not yet — 5 blocking**

mapping-redirects is short (about 160 tokens) and does one job. It uses one default (301) instead of a menu, and it stops for the user when it finds a loop. The structure pass found no High, so the full sweep ran. The main structural gap is the order of the steps. Step 1 writes the redirect entries, and the chain and loop checks and the in-page link enumeration run only after that, although step 4's own text says it runs "before you edit the table". The detail sweep found four more blocking gaps. The description promises to handle deleted URLs, but the skill gives no rule for them. Step 4 enumerates in-page links but never rewrites them. A prompt line tries to set effort. The bundle has no evals.

### Summary

| #   | Severity | Pass      | Key(s) | Finding                                                                                            | Notes          |
| --- | -------- | --------- | ------ | -------------------------------------------------------------------------------------------------- | -------------- |
| 1   | Medium   | Structure | A22    | Chain/loop checks and the Grep enumeration run after step 1 has written the table                  |                |
| 2   | Medium   | Detail    | D1, R4 | Description promises deleted-URL handling; step 1 requires a new path and has no no-successor rule |                |
| 3   | Medium   | Detail    | C1, C8 | Step 4 enumerates in-page links but never says to rewrite them; "content files" undefined          |                |
| 4   | Medium   | Detail    | B2, B3 | "This step runs at low effort" tries to set effort in prose, on the step that must be exhaustive   | low confidence |
| 5   | Medium   | Detail    | H1     | No evals; no scenario exercises the chain, loop, or link guarantees                                |                |

### What's already right

- The body is about 160 tokens (20 lines, 14-line body), far under the length limits, and needs no reference files. (A4, A5)
- No menu of options and no config knobs: every entry gets one default, status 301. (A13, R1)
- Four short steps, each with a reason that changes behavior ("each hop costs the visitor a round trip", "a loop makes both URLs unreachable"). (A17, C11)
- One job (maintaining the redirect map) and a linear decision chain, with no multiplying inputs. (R12, R14)
- When it finds a loop, the skill stops and asks the user instead of guessing. Keep this when you reorder the steps. (R4, C10)
- The name and description are valid: 17-char gerund name that matches the directory, a 159-char third-person description that states both what the skill does and when to use it. (A1, A3)
- `allowed-tools: Read Edit Grep` is minimal and uses the spec's space-separated form. (A16, F2)
- The step 4 Grep nudge is scoped. No forced ceremony and no narration cadence. (B3, B1, B5)

### Findings

#### Finding 1 — `A22`: the checks that should gate the table edit run after it

- **Severity:** Medium · **Pass:** Structure · **Confidence:** high
- **Where:** `SKILL.md:14, 17, 18–20` (§ Steps, steps 1, 3, 4)
- **Evidence:** "1. Add one entry per moved URL: old path to new path, status 301." … "3. Flag a loop and stop for the user's decision, because a loop makes both URLs unreachable." … "4. This step runs at low effort: use `Grep` to enumerate every occurrence of the old path across the content files before you edit the table"
- **Defect:** Step 1 writes entries, step 3 detects loops only after they are written, and step 4's enumeration must happen "before you edit the table", which step 1 already did. The skill writes first and validates second, where it should plan, validate, then write.
- **Manifests:** The table already holds `/b -> /a`, and the user reports that `/a` moved to `/b`. Step 1 writes `/a -> /b`, so the table now holds a loop. Step 3 flags it and stops for the user, which leaves the broken entry in the table. If that state is committed or deployed, both URLs are unreachable.
- **Fix:** Reorder into plan-validate-execute. Build the proposed entries and run the Grep enumeration first. Then check the proposed entries against the existing table: collapse chains, and on a loop stop for the user before you write anything. Edit the table only after that.

#### Finding 2 — `D1` (with `R4`): deleted URLs promised, but there is no rule for them

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `SKILL.md:3` (description) vs. `SKILL.md:14` (step 1)
- **Evidence:** "adds entries for renamed or deleted URLs" / "Add one entry per moved URL: old path to new path, status 301."
- **Defect:** The description says the skill handles deleted URLs, but the only entry shape needs a new path, and nothing tells the model what to do when a page has no successor.
- **Manifests:** A 404 report names a deleted page `/pricing-2023`. The model makes up a target (the homepage or a nearby page) and writes a 301 to it. The result is a soft-404 redirect the user never approved.
- **Fix:** Add one clause to step 1: "When a deleted URL has no successor page, ask the user for the target rather than choosing one."

#### Finding 3 — `C1` (with `C8`): step 4 enumerates links but never rewrites them

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `SKILL.md:18–20` (step 4)
- **Evidence:** "use `Grep` to enumerate every occurrence of the old path across the content files before you edit the table, so no in-page link keeps pointing at the old URL."
- **Defect:** The step only tells the model to enumerate the occurrences. No step says to rewrite the links, yet the stated guarantee depends on that rewrite. "The content files" is never defined (which directories, which extensions).
- **Manifests:** Sonnet 5.5 follows instructions literally. It lists 14 Grep hits, adds the table entry, and finishes, and all 14 links still point at the old URL. Separately, a Grep scoped to `*.md` misses links in `.mdx` or template files.
- **Fix:** Add the action and the scope, for example "…then update each hit to the new path, across `<content dirs/globs>`."

#### Finding 4 — `B2` (with `B3`): prose tries to set effort, on the step that must be exhaustive

- **Severity:** Medium · **Pass:** Detail · **Confidence:** low
- **Where:** `SKILL.md:18` (step 4)
- **Evidence:** "This step runs at low effort: use `Grep` to enumerate every occurrence"
- **Defect:** Effort is an API parameter, so prompt text cannot set it. The line also tells the model to treat the one step that needs exhaustive coverage ("every occurrence") as a cheap step.
- **Manifests:** The model reads "low effort" as permission to be cursory. It greps one exact path form and skips variants such as a trailing slash, an absolute URL, or a relative link, so some in-page links survive.
- **Fix:** Delete "This step runs at low effort:". If this step really must run at low effort, set that through the `effort` field. Keep the scoped `Grep` nudge.
- **Notes:** low confidence (reviewer-flagged)

#### Finding 5 — `H1`: no evals

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** bundle root (no `evals/` directory; the bundle holds only `SKILL.md`)
- **Evidence:** the bundle holds only SKILL.md (verified with `find`)
- **Defect:** No eval exercises the skill's stated guarantees: chain collapse, stopping on a loop, and leaving no in-page link pointing at an old URL.
- **Manifests:** A later edit drops "stop for the user's decision" from step 3. The skill then rewrites loops silently, and no eval catches the change.
- **Fix:** Add `evals/evals.json` with `skill_name` and at least three scenarios (a chain, a loop, a deleted URL with no successor), with `targets`, `baseline`, and `models: ["claude-sonnet-5-5"]`. H2–H18 cannot be scored until evals exist.

### Advisory

Listed once; advisory findings never gate the verdict.

- `A8` · SKILL.md:10, § Steps — the redirect map's path and format are never named; hardcode them, and if chain/loop detection proves error-prone in evals, move it to a bundled `scripts/` checker (low confidence)
- `C9` · SKILL.md:10 — "If in doubt, use the Grep tool." is a blanket tool nudge that invites over-triggering; delete it (step 4 already carries the scoped one)
- `A21` · SKILL.md:15–17 — nothing re-checks for new chains or loops after editing; add "re-run the chain and loop checks until none remain" (low confidence)
- `A9` · SKILL.md:14 — no example entry; show one example row once the format is named (fold into A8) (low confidence)
- `A10` · SKILL.md:3 vs. 10, 19 — one artifact, two names: "map" in the description, "table" in the body; use "map" in the body
- `R7` · SKILL.md:10, 15–17, 20 — two instructions in one sentence (steps 2, 3), ambiguous "it" (step 2), phrasal verb "pointing at", "the Grep tool" vs. "`Grep`"; likely acceptable as written (low confidence)
- `F1` · SKILL.md (whole body) — the skill reads 404 reports and content files but never says their contents are data, not instructions; optional one-line guard (low confidence)

### Coverage

| Group | Status | Findings                            |
| ----- | ------ | ----------------------------------- |
| A     | Gap    | 1; advisory A8, A21, A9, A10        |
| B     | Gap    | 4                                   |
| C     | Gap    | 3; advisory C9                      |
| D     | Gap    | 2                                   |
| E     | Pass   | —                                   |
| F     | Pass   | advisory F1 (F6 N/A)                |
| G     | Pass   | — (N/A in substance: no secrets)    |
| H     | Gap    | 5 (H2–H18 unscorable without evals) |
| R     | Pass   | advisory R7 (R2, R5, R6, R13 N/A)   |

### Criteria notes

- Criteria last synced: 2026-10-09 (0 days ago); shared B–G: 2026-10-09 (0 days ago), from the working-repo copy at `plugins/prompt-quality-criteria/references/prompt-criteria.md`. The installed cache copy (`prompt-quality-criteria` 1.1.1) reads 2026-08-19 (51 days ago). This run exercised agent-authoring-toolkit 1.2.0 from the working repo, and the installed cache holds 1.1.0.
- R6 is N/A: the host project has no CLAUDE.md and no convention documents.
- Spot-checks: Findings 1–3 (the top three ranked; there were no Highs) were checked against SKILL.md, and the quotes match their lines. No finding was dropped.
- Group B produced a finding. Managed settings can override the `model: claude-sonnet-5-5` pin, so the skill should not depend on the quirks of exactly one model.
