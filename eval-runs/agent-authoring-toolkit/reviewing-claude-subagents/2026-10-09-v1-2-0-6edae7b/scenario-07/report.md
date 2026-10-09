## Review: checking:accessibility — sound form, but the name does not load and the return is unbounded

**Verdict: not yet — 5 blocking**

The form is right. Noisy build, serve, and axe output stays inside the subagent, and the remit is bounded by `routes.json`. One defect stops the subagent from working at all: the `name` contains `:`, which Claude Code does not load for a project-scoped file, so the parent can never delegate to it. Behind that, the return contract has no bound or grouping, the build, serve, and axe inputs are left to guesswork, a route that cannot be scanned has no outcome category, and the local server has no stated lifecycle. Every finding below is inferential: this review read the definition and never ran the subagent.

### Fit-for-purpose

Pass 1 found that the subagent form holds (`A1` pass). The work is self-contained, produces verbose tool output the parent does not need, and ends in a summary. Nothing in the remit needs a human decision partway through. The scope holds no competing sibling, and no built-in agent (`Explore`, `Plan`, `general-purpose`) overlaps a remit that runs axe on a built site (`A2` pass). Every instruction can be done with the declared tools (`A11` pass). The task is bounded, so no separate stopping condition is needed (`A28` N/A). The only structural finding is advisory (`R1`, Low).

### Summary

| #   | Severity | Pass   | Key(s) | Finding                                                                                   | Notes                       |
| --- | -------- | ------ | ------ | ----------------------------------------------------------------------------------------- | --------------------------- |
| 1   | High     | Detail | A17    | `name: checking:accessibility` contains `:`, so the subagent never loads                  |                             |
| 2   | Medium   | Detail | A7     | The return reports every violation on every route with no bound, dedup, or grouping       |                             |
| 3   | Medium   | Detail | A9     | Build command, serve command/URL, axe invocation, and `routes.json` location are unstated | inferential, low confidence |
| 4   | Medium   | Detail | D1     | No "not scanned" outcome, so an unscanned route can read as covered                       | inferential, low confidence |
| 5   | Medium   | Detail | C1     | The local server has no background/stop lifecycle                                         | inferential, low confidence |

### What's already right

- The form fits: noisy build, serve, and axe output stays inside the subagent and only a structured result goes to the parent (A1).
- The remit is tight and bounded: coverage is a closed set the subagent can check (`routes.json`), so no separate stopping rule is needed (A28, C8).
- Line 13 asks for passed routes "so the reader can tell coverage from silence" — a return contract that lets the parent tell a clean run from a partial one, with the reason stated (C11, B4). Keep it in any later edit.
- The description gives a concrete trigger ("Use at the verification step of a UI change") in third person (A3, A4).
- The tool list has no `Edit`, `Write`, `Agent`, or `Skill`, and every granted tool is real and background-safe (A12, A13, A14).
- No forced ceremony, reasoning echo, progress cadence, or blanket tool nudges (B1, B2, B5, C7, C9).
- One job, one subject, one set of criteria (R12).

### Findings

#### Finding 1 — `A17`: the `name` contains a colon, so the subagent never loads

- **Severity:** High · **Pass:** Detail · **Confidence:** high
- **Where:** `checking-accessibility.md:2` (frontmatter `name`)
- **Evidence:** "name: checking:accessibility"
- **Defect:** Claude Code reserves `:` for plugin-scoped identifiers and does not load a `name` that contains it; a project-scoped file under `.claude/agents/` gets no plugin prefix, so the colon cannot act as a scope separator here.
- **Manifests:** When the parent reaches "the verification step of a UI change", no `checking:accessibility` is in the roster, so it never delegates the axe run. The user gets no error; the only trace is a debug-log line.
- **Fix:** Rename to `checking-accessibility` (which also matches the filename), and update any caller that names it explicitly.
- **Notes:** inferential — predicted from the documented load rule, not observed.

#### Finding 2 — `A7`: the return message is unbounded

- **Severity:** Medium · **Pass:** Detail · **Confidence:** high
- **Where:** `checking-accessibility.md:11`
- **Evidence:** "Report each violation with its rule ID, impact level, the offending selector, and the fix."
- **Defect:** The body says to report every violation on every route with no bound, deduplication, or grouping, so the return grows with routes × violations × nodes.
- **Manifests:** On a site with 30 routes sharing one header with a `color-contrast` violation, the subagent reports that violation 30 or more times, each with a selector and a fix, and the flood fills the parent's context — the context the delegation exists to save.
- **Fix:** Group violations by rule ID, list the affected routes and selectors once per rule, and cap or summarize node lists; or write the full axe JSON to a file and return its path plus a summary.
- **Notes:** inferential.

#### Finding 3 — `A9`: the inputs the task needs are not stated

- **Severity:** Medium · **Pass:** Detail · **Confidence:** low
- **Where:** `checking-accessibility.md:9`
- **Evidence:** "Build the site, serve it locally, and run axe against every route listed in `routes.json`."
- **Defect:** The body names no build command, serve command and port, axe invocation, or `routes.json` location, and does not require the delegation message to carry them, so every run guesses.
- **Manifests:** In a repo whose build is `pnpm build:prod` and whose `routes.json` sits under `config/`, the subagent guesses `npm run build` and searches for the file; different runs scan different builds or fail, and the parent gets inconsistent coverage.
- **Fix:** Add one line naming these inputs — state them for the project, or require the delegation message to supply them.
- **Notes:** inferential, low confidence.

#### Finding 4 — `D1`: no outcome for a route that could not be scanned

- **Severity:** Medium · **Pass:** Detail · **Confidence:** low
- **Where:** `checking-accessibility.md:13`
- **Evidence:** "Report the routes that passed as well, so the reader can tell coverage from silence."
- **Defect:** The body allows only "violations" or "passed" per route; a 404, timeout, build or serve failure, missing `routes.json`, or missing axe has no outcome, which breaks the coverage-from-silence promise.
- **Manifests:** A route that times out produces neither violations nor a pass; the subagent drops it or lists it as passed, and the parent reads an unscanned route as covered.
- **Fix:** Add a third category, "not scanned" with the reason, and state that a build, serve, or `routes.json` failure stops the run and is reported instead of results.
- **Notes:** inferential, low confidence.

#### Finding 5 — `C1`: the local server has no lifecycle

- **Severity:** Medium · **Pass:** Detail · **Confidence:** low
- **Where:** `checking-accessibility.md:9`
- **Evidence:** "serve it locally"
- **Defect:** The body starts a long-running server but says nothing about running it in the background or stopping it before returning.
- **Manifests:** The subagent runs the serve command in the foreground and the Bash call blocks until timeout; or it backgrounds the server and leaves it bound to the port, so the next run's serve step fails with EADDRINUSE.
- **Fix:** One sentence: start the server in the background, wait until it is ready, scan, then kill it before reporting.
- **Notes:** inferential, low confidence.

### Advisory

Listed once; advisory findings never gate the verdict.

- `R1` · checking-accessibility.md:frontmatter `tools` — `Grep` and `Glob` are granted but no instruction uses them; cut to `Read, Bash` or add the discovery step they serve (low confidence; read-only grants, so clarity not safety).
- `A26` · checking-accessibility.md:body — no line says to treat build output, axe output, and page content (which can hold CMS/user text) as data, never instructions (low confidence).
- `D2` · checking-accessibility.md:11 — "the fix" has no stated source; base it on axe's `failureSummary`/`helpUrl` and label any model-proposed fix (low confidence).
- `B7` · checking-accessibility.md:11 — asks for fixes without saying to report rather than apply them, while bare `Bash` can write files; possibly deliberate (low confidence).
- `A6` (with `E1`) · checking-accessibility.md:11–13 — fields named but no fixed order, grouping, or template, so report shape can vary between runs.
- `R7` · checking-accessibility.md:9 — one sentence carries three sequential instructions (convention 2); split into numbered steps, which also gives Finding 5's lifecycle line a home.

### Coverage

| Group | Status | Findings                          |
| ----- | ------ | --------------------------------- |
| A     | Gap    | 1, 2, 3; advisory A26, A6         |
| B     | Pass   | advisory B7                       |
| C     | Gap    | 5                                 |
| D     | Gap    | 4; advisory D2                    |
| E     | Pass   | advisory (E1 with A6)             |
| F     | Pass   | advisory (A26 extends F4); F6 N/A |
| G     | Pass   | —                                 |
| H     | N/A    | ships no evals                    |
| R     | Pass   | advisory R1, R7; R5, R6 N/A       |

### Criteria notes

- Criteria last synced: checklist 2026-10-09 (0 days ago); shared B–G: 2026-08-19 (51 days ago) in the installed `prompt-quality-criteria` plugin (1.1.1). The detail reviewer read the B–G criteria from the working-repo copy at `plugins/prompt-quality-criteria/references/prompt-criteria.md`, last-synced 2026-10-09 (0 days ago), so the criteria actually scored are the newer file.
- Group B subset applied: Opus 5.5 (taking in the Opus 5 paragraph) — the target has no `model:` pin and inherits the session model, claude-opus-5-5. Because group B produced a finding (B7), note that the model is overridable (`A19` lists how), so the subagent should not depend on the quirks of exactly one model.
- Groups B–G and the R7 conventions were reported by the detail reviewer as preloaded and then read from disk (`scored (read from disk)`); no group is ungraded. No stage ran inline or under substitution.
- R5 and R6 are N/A: the host workspace has no `CLAUDE.md` and no convention documents. A18 is N/A: the target is project-scoped, not plugin-shipped.
- Scope: non-interactive run, no caller-supplied scope — the four defaults were assumed (analysis only; all groups equal; surgical; stop at a High structural gate).
- Plugin version: working copy of `agent-authoring-toolkit` is 1.2.0 (this skill ran from the working copy); `installed_plugins.json` lists 1.1.0, so the spawned reviewer agent types may have resolved from the installed 1.1.0 cache.
- Spot-checks: Finding 1 (High) and Findings 2–4 (top ranked) were confirmed against the file; Finding 1 was also confirmed against the checklist's A17 text. No finding was dropped.
