## Review: mapping-redirects — sound shape, but it writes before it validates and leaves its edge cases unspecified

**Verdict: not yet — 6 blocking**

The skill is small (14 body lines) and does one job. Its decisions run in a sequence instead of
multiplying, so the structure passed the gate with no High finding. Two structural Mediums still
lead the list. First, the workflow writes to the live redirect table (steps 1–2) before the loop
check (step 3) and before the link enumeration (step 4) that says it must come "before you edit
the table". Second, the skill never names the table it maintains. The detail sweep found four more
Mediums. Step 2's chain check has no scope, so it misses chains that a new entry creates through
an existing entry. The "deleted URLs" and "404 report" triggers in the description have no
procedure for a page with no successor. Step 4 lists the links it promises to fix but never
changes them. And the bundle has no evals. All six fixes are surgical. A plan → validate →
execute reorder, as Finding 1 suggests, resolves Findings 1 and 5 together.

### Summary

| #   | Severity | Pass      | Key(s)  | Finding                                                                                                  | Notes                                |
| --- | -------- | --------- | ------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 1   | Medium   | Structure | A22     | The table is edited (steps 1–2) before the loop check (step 3), so a loop can be left live in production |                                      |
| 2   | Medium   | Structure | A8      | The redirect table's location and format are left to "If in doubt, use the Grep tool"                    | low confidence; Advisory C1 overlaps |
| 3   | Medium   | Detail    | C8      | The chain check never says to check existing entries that target the moved path                          |                                      |
| 4   | Medium   | Detail    | D1 / R4 | The description promises to handle deleted URLs and 404s, but step 1 requires a new path                 |                                      |
| 5   | Medium   | Detail    | C1 / E3 | Step 4 comes after the table edits it must precede, and it only lists links, never fixes them            | Advisory A8 (Structure) overlaps     |
| 6   | Medium   | Detail    | H1      | No `evals/evals.json`; no stated guarantee is tested                                                     |                                      |

### What's already right

- The body is 14 lines and about 160 tokens, far under the length bounds. Progressive disclosure is correctly unnecessary at this size (A4, A5).
- Every step has one default, for example status 301, with no menu of options (A13).
- The steps are short, each with one reason and no speculative config or knobs (A17, R1).
- One job: keep the redirect map correct for moved URLs. Listing in-page links is the same subject (R12).
- The decisions chain (add, then chain check, then loop check) instead of multiplying (R14).
- The loop case hands the decision to the user with its consequence: "stop for the user's decision, because a loop makes both URLs unreachable". Keep this when reordering (C10, R4, R10).
- Steps 2–4 each carry a reason that changes behavior, e.g. "because each hop costs the visitor a round trip" (C11).
- The frontmatter is valid. The `name` is a gerund that matches the directory. The description is third person, 161 chars, and states what the skill does and then concrete triggers. `allowed-tools` is minimal and space-separated (A1, A3, A16).
- Step 4 scopes its tool nudge to a step that states its effort level, the B3 pattern, so the B2 carve-out applies (B2, B3).
- Nothing is restated from an external source (R3). There are no secrets, so the absence of leak defenses is correct (G1). No time-sensitive phrasing (A11).

### Findings

#### Finding 1 — `A22`: the table is edited before the plan is validated

- **Severity:** Medium · **Pass:** Structure · **Confidence:** high
- **Where:** `.claude/skills/mapping-redirects/SKILL.md:14–17` (Steps 1–3)
- **Evidence:** "1. Add one entry per moved URL: old path to new path, status 301." … "3. Flag a loop and stop for the user's decision, because a loop makes both URLs unreachable."
- **Defect:** The skill writes entries (step 1) and rewrites existing ones (step 2) in the production redirect table, then checks for loops (step 3). It never validates a plan before it changes the table.
- **Manifests:** The table holds `/b → /a`, and the user reports that `/a` moved to `/b`. Step 1 writes `/a → /b 301`. Step 3 then finds the loop and stops for the user, leaving a live loop in the table that makes both URLs unreachable. That is the harm the step itself names.
- **Fix:** Reorder as plan → validate → execute. Build every proposed entry, plus step 4's in-page link rewrites, as a structured plan. Resolve the plan against the existing table: collapse chains, detect loops, and stop for the user on a loop. Write to the table only after the plan passes.

#### Finding 2 — `A8`: the redirect table is never named

- **Severity:** Medium · **Pass:** Structure · **Confidence:** low
- **Where:** `.claude/skills/mapping-redirects/SKILL.md:10, 14` (intro, step 1)
- **Evidence:** "Keep the redirect table correct when pages move. If in doubt, use the Grep tool."
- **Defect:** For this project-scoped skill, the table's location and format are fixed facts. The skill leaves them to a vague search instead of naming the file.
- **Manifests:** The repo holds two redirect sources, for example a Netlify `_redirects` file and an nginx `rewrite` block. The model greps, picks the wrong file, and adds the 301s to a table that production does not serve. The 404 report stays unresolved.
- **Fix:** Hardcode the table's path and entry format in the skill, and delete the "if in doubt" fallback.
- **Notes:** The Detail pass raised the same gap as a Low (`C1`, Advisory), together with the missing entry format.

#### Finding 3 — `C8`: the chain check has no scope

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `.claude/skills/mapping-redirects/SKILL.md:15–16` (step 2)
- **Evidence:** "Flag a chain — an entry whose target is itself redirected — and collapse it to the final target"
- **Defect:** The step never says which entries to check. A new `old → new` entry creates a chain through every existing entry whose target is `old`, but the step can be read as "check the entry I just added".
- **Manifests:** The table holds `/a → /b`, and `/b` moves to `/c`. Step 1 adds `/b → /c`. Step 2 checks the new entry, whose target `/c` has no redirect, so the check passes. The `/a → /b → /c` chain ships, even though the description promises the skill "flags chains".
- **Fix:** Name the scope. For example: "check every entry in the table, including existing entries whose target is the path you just moved".

#### Finding 4 — `D1` / `R4`: deleted URLs have no procedure

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `.claude/skills/mapping-redirects/SKILL.md:3` (description) with `:14` (step 1)
- **Evidence:** "adds entries for renamed or deleted URLs … Use when … a 404 report comes in" / "Add one entry per moved URL: old path to new path, status 301."
- **Defect:** The description promises to handle deleted URLs and 404 reports, but the only procedure needs a new path. No step says what to do when there is none: abstain, ask the user, or use a different status.
- **Manifests:** A 404 report names `/pricing-2023`, a page deleted with no successor. Step 1 needs a new path, so the model makes one up (the homepage or the nearest parent) and adds a 301. That creates a soft-404 redirect the user never approved.
- **Fix:** Add one sentence to step 1: "When a URL has no successor page, stop and ask the user for the target or the status code; never pick one yourself."

#### Finding 5 — `C1` / `E3`: step 4 is out of order and never fixes the links

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `.claude/skills/mapping-redirects/SKILL.md:18–20` (step 4)
- **Evidence:** "use `Grep` to enumerate every occurrence of the old path across the content files before you edit the table, so no in-page link keeps pointing at the old URL."
- **Defect:** Step 4 must run "before you edit the table", but step 1 already edits it, so the numbered order contradicts the step. The step also only lists the occurrences: no instruction updates them, so nothing carries out its stated guarantee.
- **Manifests:** The model follows the numbered order and edits the table in step 1. At step 4 it greps and finds 12 in-page links to the old path. It lists them and finishes. All 12 still point at the old URL and pay a redirect hop, which is the result the step says it prevents.
- **Fix:** Move the enumeration before step 1, or into Finding 1's plan phase. Say what happens to each occurrence: update it to the new path, or report it to the user. Name which files are "the content files", for example a directory or glob.
- **Notes:** The Structure pass raised the same gap as a Low (`A8`, Advisory).

#### Finding 6 — `H1`: the bundle has no evals

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** bundle root (contains only `SKILL.md`)
- **Evidence:** No `evals/evals.json` exists. A `find` of the bundle returns only `.claude/skills/mapping-redirects/SKILL.md`.
- **Defect:** None of the skill's guarantees is tested: one 301 entry per moved URL, chains collapsed, a stop on loops, and in-page links enumerated.
- **Manifests:** A later edit drops the loop stop in step 3. Nothing catches it, so the skill silently starts resolving loops itself, and both URLs become unreachable with no eval to fail.
- **Fix:** Add `evals/evals.json` with a top-level `skill_name` and at least 3 scenarios. Cover: a simple move; an existing entry that becomes a chain (`/a → /b`, then `/b` moves); a loop; and a deleted URL with no successor. Each scenario names `targets`, `baseline`, and `models: [claude-sonnet-5-5]`. H2–H18 cannot be graded until evals exist and are folded into this finding.

### Advisory

Listed once; advisory findings never gate the verdict.

- `A8` (Structure) · SKILL.md:18–20 step 4 — "before you edit the table" contradicts its position after steps 1–2, and the step lists links without rewriting them. Choose one: feed the occurrences into the plan as rewrite items, or drop the guarantee and report them to the user. (Overlaps Finding 5.)
- `C9` · SKILL.md:10 intro — "If in doubt, use the Grep tool." is the blanket nudge C9 names word for word. On Sonnet 5.5 it makes Grep fire too often, and it is redundant with step 4's scoped nudge. Delete it.
- `A21` / `D3` · SKILL.md:12–20 Steps — nothing re-scans the table for chains or loops that the edits themselves created. Add a re-scan that repeats steps 2–3 until clean. (low confidence)
- `C1` · SKILL.md:10, 14 — the table's path and format are never named. The model may write an entry in a format the table does not use. (low confidence; overlaps Finding 2)
- `A9` · SKILL.md:14 step 1 — there is no example entry in the table's real format. (low confidence; possibly deliberate if the format varies by project)
- `A10` · SKILL.md:3 vs :10 — the description says "redirect map" and the body says "redirect table". (low confidence; likely harmless)
- `A20` / `C1` · SKILL.md:4, :18 — step 4 says "This step runs at low effort", but no `effort:` field is set, and nothing records why the `model:` pin is there. Add `effort: low`, or reword step 4 as "when this step runs at low effort". (low confidence; possibly deliberate)
- `F1` · SKILL.md whole body — 404 reports and content files may carry third-party text, and nothing says to treat it as data. Optional one clause. (low confidence)
- `R7` (convention 2) · SKILL.md:15–17 — "Flag X … and collapse/stop" puts two instructions in one sentence. Split into "Flag X. Then Y." (low confidence; possibly deliberate)
- `R7` (convention 3) · SKILL.md:18–19 — the timing condition comes after the command. Prefer "Before you edit the table, use `Grep` to …". (low confidence)
- `R7` (convention 8) · SKILL.md:19–20 — "pointing at" is a phrasal verb. Prefer "references the old URL". (low confidence)

### Coverage

| Group | Status | Findings                                                             |
| ----- | ------ | -------------------------------------------------------------------- |
| A     | Gap    | 1, 2 (structure); advisory A8, A9, A10, A20, A21                     |
| B     | Pass   | —                                                                    |
| C     | Gap    | 3, 5; advisory C1, C9                                                |
| D     | Gap    | 4; advisory D3                                                       |
| E     | Gap    | 5                                                                    |
| F     | Pass   | advisory F1                                                          |
| G     | Pass   | —                                                                    |
| H     | Gap    | 6 (H2–H18 ungradable without evals)                                  |
| R     | Gap    | 4; advisory R7 ×3 (R5, R6 N/A: no host CLAUDE.md or convention docs) |

### Criteria notes

- Criteria last synced: 2026-10-09 (1 day ago); shared B–G: 2026-10-09 (1 day ago)
- Waived: 0 (the bundle has no `review-waivers.md`)
- The skill-detail-reviewer reported groups B–G as `scored (read from disk)`, from the working-repo copy at `plugins/prompt-quality-criteria/references/prompt-criteria.md`. It did not report a skills preload. R7 was graded from the working-repo `writing-simplified-technical-english/references/conventions.md`, in check mode.
- Plugin version exercised: the working repo's `agent-authoring-toolkit` is 1.2.0, but `installed_plugins.json` records 1.1.0. This skill's instructions loaded from the working-repo path. The installed `prompt-quality-criteria` cache (1.1.1) is synced 2026-08-19, older than the working copy the sweep read.
- No stage ran inline, and no agent type needed a substitution.
