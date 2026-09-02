# Session Readiness Toolkit — invariant catalog

**Status:** mined, not yet consumed. **Date:** 2026-09-02.
**Companion to:** [session-readiness-toolkit-design.md](session-readiness-toolkit-design.md), whose
first pre-build task this completes.
**Mined from:** `brokenrobot-xyz/website` at `15dd7ad` — `.claude/hooks/session-start.sh`,
`.claude/hooks/lib/dev-env-checks.sh`, the `checking-dev-env` skill and its evals, the two hook
test suites under `.claude/hooks/tests/`, `docs/development-environment.md` § Troubleshooting, and
`docs/tooling/code-intelligence.md`. Line references are to that commit.

This is the payload the design record says the authoring skill ships: the rules every generated
artifact must hold, in one place, so the skill body and the deferred reviewing skill read from the
same list. Each row is one rule. The ID is for cross-reference; **Why** is what breaks without it.
Rows marked *(record)* come from the design record rather than the website code — they are
corrections the record already made to what the website does today.

## Verdict

The catalog is not thin. Sixty-odd invariants in seven groups came out of the mining, and the
website's own comments and tests state most of them explicitly — they were scattered, not absent.
The idea holds. The mining also corrected the design record in eight places; those are collected in
[§ What the mining changed](#what-the-mining-changed).

## Platform facts the catalog rests on

Version-dependent, and re-verified at build time against the Hooks reference and guide linked from
the design record. None of these is an invariant; each is a fact several invariants assume.

| Fact | What rests on it |
| :--- | :--- |
| Hook stdout is consumed only after the process exits. | Single emission (S2). There is no streaming progress; stderr is the only live channel, and it is for `--debug` and manual runs. |
| On exit 0, stderr reaches neither the user nor the model. | The report travels on stdout (R1). |
| A JSON object on stdout carries `systemMessage` to the user and `hookSpecificOutput.additionalContext` to the model; non-JSON stdout reaches the model as context. | Two channels, one text (R2); the degraded emitter (S4). |
| For `SessionStart`, no exit code blocks the session; the hook exits 0 on every path regardless. | Never fail the session (S1). |
| `CLAUDE_PROJECT_DIR` is set by the harness for hook commands. | Locating the checkout (S5). |
| `SessionStart` matcher sources are `startup`, `resume`, `clear`, `compact`, `fork`; a fork runs concurrently with its parent. | Authority by source (A9). |
| The hook timeout defaults to 600 s. | The preparation budget (A7); the stamp rule (A4) guards against a timeout mid-install. |
| Hooks run in a non-interactive shell: functions and aliases from rc files do not exist, and `PATH` is whatever the harness inherited. | Probing on-disk artifacts (P7); pin comparison rather than trusting whatever `node` is on `PATH` (P6). |
| MCP servers are launched before `SessionStart` hooks complete. | Consumers of prepared state tolerate its absence (A11). |
| The Bash sandbox can deny unlinking specific files inside the checkout. | Non-destructive, in-place preparation (A5). |

## S — Session safety

What the hook owes the session it runs in.

| ID | Invariant | Why |
| :-- | :--- | :--- |
| S1 | The hook never fails the session. Every abnormal path — missing library, unenterable checkout, failed install, failed probe — adds a line to the report and exits 0. `set -u -o pipefail`, never `-e`. | An exit that errors the session turns a diagnostic into an outage, and the model loses the report exactly when it needs it. With `-e`, a failing probe aborts before the trap has anything to say. (`session-start.sh:15`, `:21–22`, `:58–59`, `:65–66`) |
| S2 | The report is emitted exactly once, on exit, from an `EXIT` trap. | Stdout is read only after exit, so early output is not progress, and two emissions are two JSON documents. Every failure-path test asserts the output is still one valid document. (`:29–44`; `session-start-cases.sh:191–217`) |
| S3 | The path from entry to the emitter has the fewest possible dependencies: pure-shell `dirname`, no coreutils before the library is loaded. | The report about a broken `PATH` is what the library produces; if reaching it needs `PATH` to work, that report is never written. (`:50–53`) |
| S4 | When the emitter's own dependency is missing, the report still goes out on the next-best channel, and says so. Without `jq` the JSON envelope is lost, plain text still reaches the model, and the report carries the `jq missing` line. | Degradation must be visible, never silent. (`:38–42`) |
| S5 | The checkout is located from `CLAUDE_PROJECT_DIR` with a `$PWD` fallback; an unenterable checkout is reported, not skipped in silence; a manual run from the repo root works with no harness variables. | The debug path and the self-check both run the hook by hand. (`:62–67`; `session-start-cases.sh:264–275`) |
| S6 | The entry point lives in an always-present runtime, separate from the repository's own language. *(record)* | A hook in the repo's language can never report that runtime as missing. The website does this by being bash in a Node repo. |

## R — The report

What the model reads. Consequence mapping is the product; these rows are its discipline.

| ID | Invariant | Why |
| :-- | :--- | :--- |
| R1 | Always emitted, on every path, listing successes and failures alike, in the order the steps ran. | The model needs to know exactly what is available, and a missing line is indistinguishable from a healthy one. (`session-start.sh:17–18`; test "a failed init is reported alongside the install that preceded it") |
| R2 | The user and the model receive the same text. | Two reports means the human and the model debug two different sessions. (`:20–21`; test "user and Claude get the same notes") |
| R3 | Every ✗ pairs the fact with its consequence — what the absence forbids or degrades — including non-fatal ones: `git missing — the lockfile stamp cannot be computed, so dependencies reinstall every session`. | The consequence is what stops the model attributing a tool failure to the code. (`dev-env-checks.sh:46–79`) |
| R4 | A consequence is scoped. Where the natural reading would over-scope, the line says what is unaffected: `docker missing — … day-to-day host development is unaffected`. | An over-scoped ✗ downgrades a working environment. (`:193`; test "scoped away from host development") |
| R5 | A failed or degraded preparation step names the substitute behavior: `NO usable index. Use the normal file-reading tools instead`; `verify anything codegraph returns against the files`. | The model needs to know what to do instead, not only what is broken. (`session-start.sh:114`, `:127`, `:137`) |
| R6 | Healthy items aggregate onto one ✓ line per area; every problem gets its own ✗ line. | The ✗ lines are keys (J1); the ✓ lines are context. (`dev-env-checks.sh:27–29`) |
| R7 | Every preparation step appears with its outcome — done, fresh, failed, or skipped with the cascade cause named. A report never implies work that never ran. | An absent line reads as success. Under the FOUND/DONE split (R9) a skipped step is neither observed nor acted on, and still needs its line under DONE. (`session-start.sh:71–72`, `:101`, `:119`; test "nothing is attempted without it") |
| R8 | Actions carry their cost and their trigger: `installed (npm install, 34s) — node_modules was missing or package-lock.json had moved`; `first run in this checkout`. | The model can judge whether a long install was expected, and the human sees what moved. (`:95`, `:112`, `:141–147`) |
| R9 | Findings and actions never interleave: FOUND, then DONE. Anything both observed and acted on appears once, under DONE. *(record)* | The website mixes them; a model reading `✓ tools: git 2.51` next to `✓ dependencies: installed` has to infer which described the checkout and which mutated it. |
| R10 | The ✗ wording is a contract, not prose. It is the join key (J1), so both consumers emit it verbatim and the invited path quotes it verbatim. | A paraphrased symptom matches no entry. (`dev-env-checks.sh:11–14`; `SKILL.md:48–50`) |
| R11 | Each ✗ carries a consumer-specific pointer to where the remedy lives: the hook points at the invited path, the invited path points at the doc entry. | The hook may not hold the remedy (J2) but must say where it is. (`dev-env-checks.sh:106–114`; `session-start.sh:74`) |
| R12 | Silent tool failures are surfaced by the hook. `sync -q` is silent even when it fails, so the hook checks and reports it. | A stale index is worse unannounced. (`session-start.sh:132–137`) |

## P — Probes

The detection layer, shared by both consumers.

| ID | Invariant | Why |
| :-- | :--- | :--- |
| P1 | One implementation, two consumers: the hook sources it and acts; the invited path executes it and only reads. | Two detection layers drift apart. (`dev-env-checks.sh:4–9`) |
| P2 | No fallback re-implementation. If the library is missing, the hook reports the checkout as incomplete and stops. | An inline fallback is exactly the drift the extraction removed. (`session-start.sh:46–49`) |
| P3 | The library has no side effects on load and never exits its host: functions and accumulator globals only, sourceable under `set -u -o pipefail`. Probes are pure — a predicate returns true or false, a state probe echoes one of an enumerated set — and reporting is the caller's. | A probe that prints or exits cannot be composed by two callers with different authority. (`dev-env-checks.sh:16–17`, `:118–124`, `:132–146`) |
| P4 | A probe is gated on its own dependencies, and the gate is visible: the hook reports `skipped (X missing)`, the invited path reports `not checked (X missing)`, both as ✗. | A probe run without its dependency answers wrongly; one that silently does not run answers nothing. (`:89`, `:232–258`) |
| P5 | Probe health, not existence: `status --json`, never `[ -d .codegraph ]`. | A directory only proves a directory existed. (`:126–131`; test "the probe, not the directory, decides what to run") |
| P6 | Version probes compare against the repository's committed pin, never a value restated in the probe. A pin that lives in several committed places is cross-checked, and drift between them is a ✗. | The pin is the source of truth; restating it is another copy to drift. Multi-location pins are a readiness sub-family — inside the checkout, not regenerable — that the inspect step should look for. (`:19–25`, `:52–65`, `:87–103`) |
| P7 | Probes look for on-disk artifacts, not shell state: a version manager that is a shell function is detected by its install directory, because `command -v` cannot see it from a hook. | Hooks run non-interactively. (`:162–169`) |
| P8 | Any answer the probe cannot parse maps to the conservative branch — unreadable, hence rebuild — never to healthy. | "No usable answer" must not be read as "fine". (`:130–131`, `:143–144`) |
| P9 | Probe only what changes a decision. The index tool's presence needs no probe because the real calls exercise it. | Every probe is paid every session. (`:87–88`) |
| P10 | The freshness input is the content hash of the declared input — `git hash-object` of the lockfile — not an mtime or existence test. A missing input means "not fresh". | A pull or branch switch moves the lockfile without touching the tree. When the input is missing, the real tool then reports the real problem rather than the probe guessing one. (`:116–124`; `session-start.sh:76–80`) |
| P11 | Same implementation, per-consumer selection. The automatic path runs the probes whose findings gate its own steps or that the session will feel; the invited path runs all of them. | The automatic path is paid every session; Claude Code integration and container probes only matter when a human asks. (`dev-env-checks.sh:148`, `:183`; `SKILL.md:48–49`) |
| P12 | Steps whose dependencies are independent do not cascade. A failed install does not block the index because the index tool is fetched by `npx`, deliberately not a devDependency. | One failure should cost one capability. The preparation tool must not depend on the state it prepares. (`dev-env-checks.sh:19–23`; test "a failed install does not block the index") |

## A — Preparation

Acting on what the probes found. Authority to act is the whole difference between this group and
the last.

| ID | Invariant | Why |
| :-- | :--- | :--- |
| A1 | Every preparation step sits behind a probe. Expensive work never runs unconditionally. | Install only when missing or stale; `npm install` is slow and must never run every session. (`session-start.sh:76–77`, `:85`; record's layering invariant) |
| A2 | Priority within preparation follows the lying/screaming asymmetry: a stale index lies, a missing tree screams. *(record)* | It sets priority within the category; it does not decide the category. |
| A3 | Preparation is scoped to between-session drift: the first-run build, plus whatever changed while no session was watching. In-session freshness belongs to whatever watches in-session. | The MCP server's file watcher syncs on save while a session is open; the hook's job is the catch-up. (`code-intelligence.md:83–89`) |
| A4 | The freshness stamp lives inside the regenerable state it describes, is written last, only on success, and describes the post-action input — re-hashed after the install, because the install may rewrite the lockfile. | An install that dies at the timeout can never leave a tree that looks complete. A stamp hashed before the action can describe a lockfile that no longer exists, and then reinstalls every session. (`session-start.sh:78–79`, `:91–94`; tests "a failed install leaves the previous stamp in place", "the next session retries the install") |
| A5 | Preparation is non-destructive and in-place: the operation that leaves the prior state usable on failure is preferred — `npm install` over `npm ci`. | The sandbox may deny the destructive path midway, and a half-removed tree is worse than a stale one. (`:81–83`; `session-start-cases.sh:185–189`) |
| A6 | A failed step leaves the previous state and stamp untouched, is reported with its consequence and substitute (R5), and is retried on the next start. | The next session gets a second chance and an honest report, not a stamp that says done. (`:97`; tests) |
| A7 | Preparation fits inside the hook timeout with margin, and the probes are cheap enough to pay every session. | A sync is ~0.2 s; an install is tens of seconds; the timeout is 600 s. (`settings.json:234`; `code-intelligence.md:84`) |
| A8 | When the probe's own dependency is missing, the action degrades to the cheapest option that fails loudly, not the expensive one that may be unnecessary: a blind incremental sync rather than a rebuild on a hunch — and the report says the probe was skipped. | Rebuilding every session on a hunch is a cost with no finding behind it. (`session-start.sh:120–128`) |
| A9 | Preparation fires only for `startup` and `resume`. `clear`, `compact`, and `fork` continue in a bootstrapped checkout, and a fork runs concurrently with its parent — an install under a live session races it. | (`:10–14`; `settings.json:229`; record) |
| A10 | Concurrent starts in the same checkout are an accepted race, and the reason is recorded: the index tool takes its own lock, and on a single-user machine the window is academic. A generated hook states which it delivers — idempotence across sequential sessions, or safety under concurrent ones. | The website delivers the former and accepts the latter. The design record's phrase "idempotence under concurrent sessions" overstates what exists. (`session-start.sh:12–14`) |
| A11 | Consumers of prepared state tolerate its absence during the hook's window. The MCP server starts before the index exists, answers "no index" rather than guessing, and picks the index up when the hook finishes. | This is an assumption about the repository's tooling, not a property of the hook. The inspect step verifies it for every preparation target. (`code-intelligence.md:98–101`) |
| A12 | Shared state held by another session degrades, never blocks. A nested worktree whose parent session holds the index database gets "no usable index" and continues; dependencies still install. | (`code-intelligence.md:103–111`) |

## J — The detect/remedy join

Detection is code; remediation is human-authored prose; they meet on a symptom key.

| ID | Invariant | Why |
| :-- | :--- | :--- |
| J1 | The join key is the ✗ line's prefix, and the troubleshooting doc's headings are those prefixes. | Mechanical matching, no interpretation. (`dev-env-checks.sh:11–14`; `development-environment.md:153–159`) |
| J2 | Remedies live in the doc. A probe may carry a one-line *copy* of the doc's fix for hook-only readers, kept in step, and may never carry an invented one. | A copy is checkable; an invention is a plausible, wrong, platform-specific command. (`dev-env-checks.sh:12–14`, `:84`) |
| J3 | Every ✗ line either consumer can emit resolves to an entry — probe symptoms and action outcomes alike — and the self-check asserts it (C4). | A ✗ with no entry invites the next model to invent a fix. The website today leaves six hook-only templates unkeyed; see § What the mining changed. |
| J4 | An entry is either a command or a pointer to a section that holds one. The invited path follows pointers to the command; a guide item that repeats the pointer has not answered the ✗ line. | (`SKILL.md:64–71`; `development-environment.md:165–168`) |
| J5 | No match means abstain: say no entry matches, reference the doc as a whole, invent nothing. | A command absent from the doc has not been tested against this checkout, and a wrong fix costs more than an unanswered ✗. (`SKILL.md:73–75`) |
| J6 | Cascade lines — `not checked`, `skipped`, `cannot enter` — resolve to one entry that says fix the root cause; they get no standalone fix. | Three ✗ lines from one missing `node` are one problem. (`development-environment.md:216–221`; eval 7) |
| J7 | Remedies are ordered dependency-first, root cause leading. | (`SKILL.md:77–78`) |
| J8 | A remedy item is a triple: the symptom verbatim, the fix command, and the re-verify command. Where the doc carries no re-verify, the scan itself is the re-verify. | (`SKILL.md:93–105`) |
| J9 | The guide is tailored: ✓ areas dropped, alternatives the scan disproved skipped — when `asdf` was detected, do not suggest `fnm`. | (`SKILL.md:79–80`) |

## I — The invited path

The on-demand skill. Same probes, narrower authority.

| ID | Invariant | Why |
| :-- | :--- | :--- |
| I1 | Readiness authority only: it diagnoses and guides, never installs, builds, or edits — and it gives the *reason*, not just the rule: a fix it performs mutates the machine outside the repo and hides the defect, so the next fresh checkout breaks the same way with no record of why. | (`SKILL.md:23–28`; eval 8 asserts the reason is stated) |
| I2 | Read-only is verifiable: the self-check records every command the audit executes and asserts only the health probe ran. Graded against executed commands, never transcript text — a correct guide quotes fix commands. | (`dev-env-checks-cases.sh:144`; `evals.json:24`, `:31`) |
| I3 | Absence is a finding, never a failure, and `not checked` is a finding, not a pass: any ✗, cascades included, flips the exit code. | Every tool it probes may legitimately be absent. (`SKILL.md:4`; `dev-env-checks.sh:218–258`) |
| I4 | Expensive verification lives here, gated behind readiness: it runs when the scan is all-✓ or when explicitly asked, never re-probes what the scan already probed, and its failures are reported separately from environment failures. | A build on a broken toolchain fails for the wrong reasons. (`SKILL.md:52–62`) |
| I5 | The report states its verdict — never "ready" from the scan alone when verification was skipped — the guide, and that nothing was changed. | (`SKILL.md:82–91`) |
| I6 | Under pressure to fix, it declines with the reason, still produces the guide, and still checks everything else. | A refusal with nothing else is a narrowed request. (eval 8) |

## C — The self-check

The design record chose one script over a case suite. The website has the fuller form; these are
the properties the one script must keep.

| ID | Invariant | Why |
| :-- | :--- | :--- |
| C1 | It runs the real hook against a throwaway checkout with stub executables ahead of the real ones on a fully controlled `PATH`, so the host's state never decides a case and the run is offline and instant. | (`session-start-cases.sh:2–9`; `dev-env-checks-cases.sh:5–10`, `:28–33`) |
| C2 | Stubs record every call to a marker file; the load-bearing assertions are on what was executed. | Transcript text quotes fix commands by design. (`evals.json:31`; both suites) |
| C3 | It asserts the output contract on every exit path: one valid JSON document when healthy, when work was performed, and when a step failed; the event tagged; user and model text identical. Stdout is asserted on; stderr is not. | (`session-start-cases.sh:139`, `:168–181`, `:191–217`) |
| C4 | It asserts the join: every ✗ prefix either consumer can emit resolves to a doc heading. *(record)* | Absent from the website, which is why J3 has holes there today. |
| C5 | Pins and versions are read from the source of truth, never hardcoded in the check. | A version bump must not turn every healthy case into a drift report. (`session-start-cases.sh:16–18`) |
| C6 | One script, not a case suite. *(record)* | The website's suites show what the one script must still cover: C3, I2, and C4. Anything beyond is a case suite. |

## What the mining changed

Where the sources disagreed with, or added to, the design record.

1. **Concurrency is weaker than stated** (A10). The record lists "idempotence under concurrent
   sessions"; the website delivers idempotence across sequential sessions, excludes `fork` by
   matcher, and accepts the concurrent-start race with a stated reason. The generated hook must say
   which it does.
2. **The join has holes on the automatic path** (J3). Every ✗ the library or the invited path emits
   resolves to a doc heading. Six templates only the hook emits do not: the missing-library line,
   `dependencies: skipped`, `codegraph: skipped`, `codegraph init|index failed`, and both
   `codegraph sync failed` variants. The record's self-check assertion (C4) would have caught this.
   J3 is stated to cover action outcomes as well as probe symptoms, widening the record's "every
   probe symptom key".
3. **Same implementation, different selection** (P11). "One truth, two consumers" reads as the same
   probes; in fact the hook runs the subset the session will feel, and the audit runs all of them.
   The selection rule is now explicit.
4. **Skipped steps need a line under DONE** (R7). The FOUND/DONE split leaves a skipped preparation
   step with no home — it was neither observed nor acted on. The website's "never implies work that
   never ran" rule says it still needs its line.
5. **Three platform facts the record did not list.** Hooks run non-interactively (P7); MCP servers
   start before the hook completes (A11); the sandbox constrains destructive operations inside the
   checkout (A5). The first two belong in the skill body next to the JSON shapes.
6. **The copy allowance** (J2). The record says the check may not invent a cure; the website lets a
   ✗ line carry a copy of the doc's cure inline. Recorded as copy-yes, invent-no, kept in step.
7. **Multi-location pin drift is a readiness sub-family** (P6). It fits the assignment rule —
   inside the checkout, not regenerable — but the inspect step has to look for it deliberately: a
   version pinned in a hook, an MCP config, and a script block is three places to drift.
8. **Consumer tolerance is a repository assumption** (A11). Whether the tools that read prepared
   state cope with its absence during the hook's window is a property of the repository, not of the
   artifacts. The inspect step verifies it per preparation target.

## Left out

Website-specific, and deliberately not invariants: the index tool's state machine and command
choice; the exact sandbox failure behind `npm install` over `npm ci`, kept only as A5's general
form; the invited path's delegation to a separate quality-gate skill, which is a per-repository
decision; the reply checklist in the skill body, which is a skill-authoring convention rather than a
readiness rule.
