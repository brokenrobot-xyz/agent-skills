# The five artifacts, and the plan file

What each file the skill writes must contain. The invariant IDs are rows in `invariants.md`, which
Step 4 reads before writing. This file states only what the catalog does not: each file's
default path, its structure, and the checks that bind it. It restates no rule, so every rule has
one place to change.

## Contents

- [1. The probe library](#1-the-probe-library)
- [2. The `SessionStart` hook](#2-the-sessionstart-hook)
- [3. The on-demand skill](#3-the-on-demand-skill)
- [4. The troubleshooting doc](#4-the-troubleshooting-doc)
- [5. The self-check](#5-the-self-check)
- [6. The plan file](#6-the-plan-file)

## 1. The probe library

Default path: `.claude/hooks/lib/readiness-checks.sh`, under the interpreter Step 3 settled — the same
one as the hook that sources it.

Structure:

- One function per area, each filling a gate variable the callers test before a later step.
- Two entry modes in one file. Sourced, it defines and returns. Executed directly, it runs every
  probe read-only, prints the report, and exits non-zero on any ✗.
- One report function that takes the consumer's pointer suffix as an argument.
- Every ✗ line the kit can emit is written here, once.

Holds: P3, P4, P5, P6, P7, P8, P13, R3, R4, R10, R11, I3.

## 2. The `SessionStart` hook

Default path: `.claude/hooks/session-start.sh`, run by the interpreter the Step 3 default or
override names.

Structure:

- A report accumulator, one emitter on an `EXIT` trap, and the checkout resolved from
  `CLAUDE_PROJECT_DIR` and then `$PWD`.
- The library sourced from its path next to the hook.
- A readiness section that only routes the library's lines into FOUND.
- A preparation section where each step is guarded by its probe and reports under DONE as done,
  fresh, failed, or skipped.
- A header comment stating which the hook delivers — idempotence across sequential sessions, or
  safety under concurrent starts — and why.

Holds: S1, S2, S3, S4, S5, P2, A1, A4, A5, A6, A8, A9, A10, R1, R2, R5, R7, R8, R9, R12.

Wiring. Step 4 merges this entry into the `SessionStart` array of the existing `hooks` object in
`.claude/settings.json`, creating the object and the array only when they are absent, and never
replacing the file:

```json
{
    "matcher": "startup|resume",
    "hooks": [
        {
            "type": "command",
            "command": "sh \"${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.sh\"",
            "timeout": 600
        }
    ]
}
```

When the user took the interpreter override, the `sh` in `command` follows it.

## 3. The on-demand skill

Default path: `.claude/skills/<name>/SKILL.md`, named by the host repository's skill-naming
convention, or in gerund form when it has none. `checking-readiness` is the default name.

Structure:

- A `description` that names its triggers — a readiness or dev-environment check, "is my machine
  set up", the ✗ lines the hook reports — because the description is what makes the host's
  sessions select it.
- A first step that runs the library in executed mode and quotes its lines verbatim.
- The session-only checks from the skill's Step 1, in the body, for the model to make.
- A guide built from the troubleshooting doc, then the report.

Holds: I1, I3, I4, I5, I6, J4, J5, J6, J7, J8, J9, P15, R10.

## 4. The troubleshooting doc

Default path: `docs/development-environment.md`, § Troubleshooting, or a dedicated file when the
repository has no such document.

Structure:

- A line stating that detection wording lives in the library and these headings track it.
- One `### ✗ <prefix>` heading per symptom family. Alternatives are joined with a spaced middle dot, as in the entry below, and a
  parameter inside a prefix is written as `…`, which the join reads as any run of characters.
- One entry per heading, generated from the plan file: the user's command verbatim, or a pointer
  to the section of the same document that holds one, or the statement that no verified remedy
  exists.
- One cascade entry, and a § Verify with the re-verify command per area.

Holds: J1, J2, J3, J4, J5, J6, J8, R10.

An entry, as generated from a plan whose docker remedy was `open -a Docker` and whose re-verify
command was `docker info`:

```markdown
### ✗ docker daemon not running · ✗ docker missing

Start Docker Desktop: `open -a Docker`, then wait for the whale. Re-verify with `docker info`.
Only the github MCP server needs it; local work is unaffected.
```

## 5. The self-check

Default path: `.claude/hooks/tests/readiness-self-check.sh`, under the same interpreter as the hook,
or the repository's test convention when the user chose the repository's language. The report
names the command that runs it.

Structure — one script, with these assertions:

- The hook, run against a throwaway directory with stub executables ahead of the real ones on a
  fully controlled `PATH`, exits 0 and prints one document on each of the healthy path, the
  work-performed path, the failed-action path, the missing-library path, and the unenterable-checkout
  path. Where the document is JSON, the event tag is present and the user and model texts are
  identical. Stdout is asserted on; stderr is not.
- The join. Collect every ✗ line the library and the hook can emit, from one stubbed run per ✗
  branch the library holds: each missing tool, the runtime that mismatches its pin, a drifted
  multi-location pin, each failed action, the missing library, and the unenterable checkout. Read
  every `### ✗` heading of the troubleshooting doc, split each on the spaced middle dot, and read
  each `…` as any run of characters. The assertion passes only when, for every collected line, some
  heading matches it as a prefix. This is the exact form; adapt only the language.
- Executed mode records nothing mutating: the stubs write every call to a marker file, and only
  read-only probes appear in it.
- Every pin the library compares against is read from the source file, never from a copy in the
  check.

Holds: C1, C2, C3, C4, C5, C6, I2.

## 6. The plan file

Not part of the kit: opened when the user confirms at Step 2, filled in Step 3, consumed in Steps 4
and 5, deleted once Step 5 passes. Its path is derived, never chosen, so every step re-derives it
instead of recalling it: `$TMPDIR/readiness-plan-<checkout basename>.json`, with `$TMPDIR` falling
back to `/tmp`. On a re-run the seed is the inverse of Step 4's reads: every field Step 4 takes
from the plan is read from the existing kit before the user's answers apply. One JSON object:

```json
{
    "interpreter": "sh",
    "concerns": [
        {
            "prefix": "✗ docker daemon not running",
            "category": "readiness",
            "consumer": "hook",
            "consequence": "the github MCP server cannot start",
            "scope": "local work is unaffected",
            "sessionOnly": false,
            "status": "grown",
            "remedy": "open -a Docker",
            "reverify": "docker info",
            "section": null
        },
        {
            "prefix": "✗ github token",
            "category": "readiness",
            "consumer": "hook",
            "consequence": "GitHub reads fail",
            "scope": "GitHub only",
            "sessionOnly": false,
            "status": "grown",
            "remedy": null,
            "reverify": null,
            "section": null,
            "noFix": true
        },
        {
            "prefix": "✗ node missing",
            "category": "readiness",
            "consumer": "hook",
            "consequence": "dependencies cannot be installed",
            "scope": "everything",
            "sessionOnly": false,
            "status": "kept",
            "entry": "Install fnm and run `fnm install && fnm use` from the checkout. Re-verify with `node -v`."
        }
    ],
    "preparation": [
        {
            "state": "node_modules",
            "command": "npm install",
            "guardedBy": "✗ dependencies: node_modules missing or stale"
        }
    ]
}
```

- `interpreter` is the Step 3 answer — `sh` by default — and governs the hook, the library, and
  the self-check. Step 4 reads it from here, never from the transcript. On a re-run it is seeded
  from the existing settings entry's command, and changes only when the user states an override.
- Every ✗ line the kit can emit is a concern record — probe symptoms, action outcomes such as a
  failed install, and the cascade family alike — so Step 3 has a record to write into. The first
  six fields of a concern are the confirmed draft: `prefix` exactly as the library emits
  it; `consumer` as `hook` or `on-demand`, decided by P11 — always `hook` for a concern a
  preparation record names in `guardedBy`, always `on-demand` for a session-only check, and the
  user's choice at Step 2 only for a readiness concern with a script probe; the consequence and
  scope as the user confirmed them. Step 4 writes the probe's wording and placement from these six fields.
- `status` is what the user's answer at the confirm stop means for Step 4, one table: `grown` —
  interview it, for a concern with no entry — new, or an existing symptom the doc never keyed — or
  for an existing entry the user rejected, whose held entry is dropped; `kept` — write the entry back as held; `realigned` — write the entry back as held under
  the new heading, the held heading kept in `from` so its removal is a field read; `lost` — remove it from the probes and the doc. A first run has only grown
  records.
- A grown record carries `remedy`, `reverify`, and `section`: exact command strings, never prose,
  or a section of the troubleshooting doc that holds the command. The no-fix marker is positive:
  `noFix: true` with the three fields null. A grown record whose remedy keys are absent is unasked,
  never a no-fix.
- A kept or realigned record carries `entry` instead: the troubleshooting entry's prose exactly as
  held, which Step 4 writes back unchanged, under the kept heading or the new one.
- A preparation record names the concern whose probe guards it in `guardedBy`, so the link is a
  field rather than an inference. On a re-run, preparation records are seeded from the existing
  hook, one per step it runs, before the user's answers apply.
- Step 5's comparison is equality on these fields over every record that is not lost — remedy
  fields for grown records, `entry` for kept and realigned ones — the same exactness the join
  assertion has.
