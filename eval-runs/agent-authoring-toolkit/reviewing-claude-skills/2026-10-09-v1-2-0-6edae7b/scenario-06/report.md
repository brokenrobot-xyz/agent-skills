## Review: linting-frontmatter — sound shape, underspecified contract and thin evals

**Verdict: not yet — 9 blocking**

The structure holds. The skill is a four-step, one-job, read-only spine of about 200 tokens, with no branching that multiplies and no menus. Pass 1 found no High or Medium; its one finding (an unanchored `---` lookup) is advisory. The blocking findings are all detail findings. The contract leaves gaps that a model will fill by guessing: the line to report for a missing key, what to do when no key list is given, how to treat optional keys, how far the directory glob reaches, and what to do with frontmatter that does not parse, even though the description routes "site build broke" cases to this skill. The evals have no file fixtures and do not cover the empty-value, unknown-key, directory, and triggering behaviors. Each fix is surgical: one clause in a step, or one more eval scenario.

### Summary

| #   | Severity | Pass   | Key(s)  | Finding                                                                                   | Notes          |
| --- | -------- | ------ | ------- | ----------------------------------------------------------------------------------------- | -------------- |
| 1   | Medium   | Detail | C1, E1  | No line is defined for a missing key, so eval 1's file-and-line assertion grades unevenly |                |
| 2   | Medium   | Detail | R4, D1  | No instruction for a request without a key list; the model makes one up                   |                |
| 3   | Medium   | Detail | C1, A10 | One list serves as both required and allowed, so optional keys show up as false positives |                |
| 4   | Medium   | Detail | C8, H4  | Glob recursion and extensions are unspecified; zero matched files reports as "all pass"   |                |
| 5   | Medium   | Detail | C1      | Opening `---` is not anchored to line 1, so body horizontal rules read as frontmatter     | low confidence |
| 6   | Medium   | Detail | A3, D1  | Description routes build breaks here, but YAML parse errors are not handled               |                |
| 7   | Medium   | Detail | H1, H2  | Eval prompts describe files in prose and ship no `files` fixtures                         |                |
| 8   | Medium   | Detail | H3, H4  | No evals for empty values, unknown keys, or the directory branch                          |                |
| 9   | Medium   | Detail | H18     | No should-trigger / should-not-trigger evals for a model-invoked skill                    | low confidence |

### What's already right

- One-job, linear four-step spine with a single input and output per step; no multiplying decision space (R12, R14, A13, A17)
- Body of about 200 tokens; progressive disclosure is not needed and nothing can drift (A4, A5)
- The no-frontmatter case is a first-class result with its reason stated ("because a fabricated block hides the real defect"), and eval 2 tests it (C11, R10, D1)
- The all-clean result has a defined, checkable shape: say so and list the files checked (step 4, eval 3)
- Read-only, minimal `allowed-tools: Read Grep Glob` in the spec's space-separated form; no destructive step, so no plan-validate-execute is needed (A22, A16)
- `name` is valid, gerund-form, and matches the directory; the description is third person, states what and when, is 210 chars, and contains no XML (A1, A2, A3)
- Conditions come before commands; no over-prescription, no forced ceremony (B, R)
- Evals use the standard object form with `skill_name`, and their three scenarios each target a distinct branch (H1)

### Findings

#### Finding 1 — `C1`: no line defined for a missing key

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `SKILL.md:19-20` (Steps, step 3)
- **Evidence:** "report a missing required key, an empty value, and a key outside the list, each with file and line."
- **Defect:** A missing key has no line of its own, and the skill never says which line to report for one: the opening `---`, the closing `---`, or none.
- **Manifests:** On eval 1 (no `date` key), one run reports line 1, another the closing delimiter, a third writes "—". The assertion "Reports the missing key with its file and line" then grades the same behavior differently.
- **Fix:** Add one clause to step 3, for example "for a missing key, give the line of the block's opening `---`".

#### Finding 2 — `R4`: no rule for a missing key list

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `SKILL.md:9` and `SKILL.md:19` (intro, step 3)
- **Evidence:** "against the key list the user supplies" / "Compare the block's keys against the user's key list"
- **Defect:** The skill assumes the user always supplies a key list and gives no instruction for a request that names files but no keys.
- **Manifests:** The description's own trigger case ("lint the frontmatter in content/ — my site build broke") names no keys. The model makes up a list (Hugo defaults, or the keys most files share) and reports violations against it as if the user had defined them.
- **Fix:** Before step 3, add: "When the user supplies no key list, ask for one before you compare, because a guessed list reports violations the user never defined."

#### Finding 3 — `C1`: one list for both required and allowed keys

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `SKILL.md:19-20`; description (line 3)
- **Evidence:** "report a missing required key, an empty value, and a key outside the list" / "against a required-key list — reports ... unknown keys"
- **Defect:** One list does two jobs, the required set and the allowed set, so an optional-but-allowed key cannot be expressed.
- **Manifests:** The user says "title and date are required" on a Hugo site where posts also carry `draft` and `tags`. Every post gets `draft` and `tags` reported as unknown keys. If the user lists all four, posts without `draft` get it reported as missing.
- **Fix:** In step 3, let the user's list split into required and allowed keys. When only one list is given, treat it as required and say that unknown-key reports assume no optional keys.

#### Finding 4 — `C8`: directory search scope undefined; empty match reads as a pass

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `SKILL.md:14-15` and `SKILL.md:21-22` (steps 1 and 4)
- **Evidence:** "When the user names a directory, list its Markdown files with `Glob`" / "When every file passes, say so and list the files checked."
- **Defect:** Step 1 does not say whether the search is recursive or which extensions count (`.md`, `.mdx`, `.markdown`). No step handles a search that matches nothing.
- **Manifests:** The user names `content/` and the posts sit in `content/posts/*.md`. A `content/*.md` glob matches nothing, and step 4 reports "every file passes" over an empty list while the build is still broken.
- **Fix:** Say "recursively (`**/*.md`)" in step 1, and add: "When no file matches, report that no files were found rather than a pass."

#### Finding 5 — `C1`: frontmatter delimiter not anchored to line 1

- **Severity:** Medium · **Pass:** Detail · **Confidence:** low
- **Where:** `SKILL.md:16-17` (step 2)
- **Evidence:** "the block between the opening `---` and the next `---`"
- **Defect:** "Opening `---`" is not tied to the file's first line, so a pair of Markdown horizontal rules in the body reads as a frontmatter block.
- **Manifests:** A file starts with "# Title" and uses `---` rules between sections. Step 2 reads the text between the first two rules as frontmatter and reports body text as unknown keys, instead of the no-block report that step 2 itself guarantees.
- **Fix:** Write "the block that opens with `---` on the file's first line". Optionally say whether TOML `+++` frontmatter is reported or excluded.
- **Notes:** Pass 1 raised the same defect as `A8` (Low, low confidence); merged here.

#### Finding 6 — `A3`: build-breaking parse errors are routed here but not handled

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** description (line 3); `SKILL.md` steps 2-3
- **Evidence:** "Use when frontmatter errors break a site build"
- **Defect:** The description routes build-breaking frontmatter errors to this skill, but the body only checks keys and has no instruction for a block that does not parse as YAML.
- **Manifests:** A post's frontmatter holds `title: Foo: Bar` (an unquoted colon), which breaks the Hugo build. The model reads `title` as present and non-empty and reports that every file passes, so the user's build error goes undiagnosed.
- **Fix:** Keep the description. Add to step 2: "When the block does not parse as YAML, report the parse error with its line instead of comparing keys."

#### Finding 7 — `H1`: eval prompts have no file fixtures

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `evals/evals.json`, ids 1-3
- **Evidence:** "prompt": "Check this file against the keys title, date, tags: a post whose frontmatter carries title and tags but no date."
- **Defect:** The prompts describe the fixture files in prose and supply no `files` entries, so no real file exists for the file-and-line assertions to check against.
- **Manifests:** A runner sends eval 1. The model either asks which file is meant or invents a file and a line number, and the grader passes "with its file and line" on invented output.
- **Fix:** Add a `files` fixture to each scenario, and rewrite each prompt as a realistic user message that names that file.

#### Finding 8 — `H3`: stated guarantees without an eval

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `evals/evals.json` (whole set) against `SKILL.md:19-20` and `SKILL.md:14-15`
- **Evidence:** "report a missing required key, an empty value, and a key outside the list"; "When the user names a directory, list its Markdown files with `Glob`"
- **Defect:** Empty-value reporting, unknown-key reporting, and the directory/Glob branch with one table across files have no eval.
- **Manifests:** A later edit drops the unknown-key check or breaks directory expansion, and all three evals still pass.
- **Fix:** Add three scenarios (empty value, unknown key, a directory holding several files), each with `targets` naming the step it tests.

#### Finding 9 — `H18`: no triggering evals

- **Severity:** Medium · **Pass:** Detail · **Confidence:** low
- **Where:** `evals/evals.json` (whole set)
- **Evidence:** all three prompts open "Check ... against the keys ..."
- **Defect:** The skill is model-invoked, but no eval checks whether it triggers on prompts that should load it, or stays quiet on prompts that should not.
- **Manifests:** A later description edit stops the skill from triggering on "my Hugo build fails on a frontmatter error", and every output eval still passes.
- **Fix:** Add should-trigger and should-not-trigger prompts, for example a build failure versus a request to edit frontmatter.

### Advisory

Listed once; advisory findings never gate the verdict.

- `E1` · SKILL.md:21 (step 4) — the table's columns are undefined; name them (e.g. `File | Line | Violation | Key`) or show one example row
- `A16` · SKILL.md:4 — `Grep` is pre-approved but no step names it; drop it or name it in step 2 (likely deliberate)
- `B7` · SKILL.md (body) — nothing says to leave files unedited; add "Report only; do not fix the files." (likely deliberate: every verb is "report")
- `F1` · SKILL.md (body); evals — file contents are not declared as data, and no eval includes an injection attempt
- `C1` · SKILL.md:20 — "empty value" is undefined across `title:`, `""`, `[]`, `~`; nested keys not addressed
- `H6`/`H7` · evals/evals.json — no `baseline` or `models` keys; with no pin, name the supported model families
- `H5` · evals/evals.json — every assertion is LLM-graded prose; add string-match checks for the key name and file path
- `H15` · evals/evals.json — all three prompts share one phrasing and register; make one casual
- `H13` · evals/evals.json id 2 — the absent-block assertion may also pass without the skill; confirm against a baseline
- `R7` (conv. 9) · SKILL.md:9, 18-20 — "violation" vs "defect", and the key list named three ways; use one term each
- `R7` (conv. 12) · SKILL.md:20 — "each with file and line" drops the article used on line 10 ("with its file and line")
- `R7` (conv. 2) · SKILL.md:21-22 — "say so and list the files checked" is two instructions in one sentence (likely deliberate)

### Coverage

| Group | Status | Findings                         |
| ----- | ------ | -------------------------------- |
| A     | Gap    | 6                                |
| B     | Pass   | — (advisory only)                |
| C     | Gap    | 1, 3, 4, 5                       |
| D     | Gap    | 2, 6 (paired)                    |
| E     | Pass   | — (paired with 1; advisory only) |
| F     | Pass   | — (advisory only)                |
| G     | Pass   | — (N/A in substance: no secrets) |
| H     | Gap    | 7, 8, 9                          |
| R     | Gap    | 2                                |

Structure-pass criteria (A4, A5, A8, A13, A17, A22, R1, R12, R14): no High or Medium; A8 Low merged into Finding 5.

### Criteria notes

- Criteria last synced: 2026-10-09 (0 days ago); shared B–G: 2026-10-09 (0 days ago)
- Waived: 0 (no `review-waivers.md` in the bundle)
- Groups B–G and the R7 conventions were scored by reading the criteria from disk (`scored (read from disk)`), per the detail reviewer's COVERAGE. No group is ungraded. No stage ran inline or under the substitution fallback.
- R5 and R6 are N/A: the host project has no CLAUDE.md or convention document.
- H8, H10-H12, H14, H16, H17 were not assessable: the bundle has no run or grading artifacts.
- Scope: the user answered "use the defaults": analysis only, all groups equal, surgical changes, stop at a High structural gate.
- Group B produced a finding (B7). The skill has no `model:` pin, so the session model (Opus 5.5) applied. Managed settings can override a model pin, so the skill should not depend on quirks of exactly one model.
- Spot-checked Findings 1-3 (the top three ranked; there were no Highs) against SKILL.md lines 3, 9, and 19-20: all quotes are real and in context. No finding was dropped.
