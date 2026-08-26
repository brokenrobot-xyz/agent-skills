## Improvement loop: formatting-release-notes — round cap reached

The loop ran its full budget of 4 review rounds and 3 apply rounds without reaching `acceptable`. It made real progress: the fixture's structural gate cleared after one restructure, every High is gone, and round 4's structure pass returned zero findings for the first time. But three blocking Mediums remain, and the shape of the run says why. Rounds 2, 3, and 4 each found defects sitting on text the previous round's fix had introduced — the branches, templates, and rules the applier wrote were themselves under-specified. Under `R12`, that is evidence about the subagent, not a reason for more rounds: this definition's job carries more classification judgment than a definition file can pin down by iteration, and the remaining findings need a human's product decision, not another applier pass. **The decisions now owed to you:** what signal separates the four buckets and, in particular, what makes a change `internal` (`A23`); whether completeness or the token bound wins when a release has 250 merges (`C1`); and the arbitration of one contested finding below.

### Intent preservation

> **Job:** format ONE release's merged changes into publishable release notes for a maintainer, invoked when the merged-PR list is too long to format in the main conversation. **Guarantees:** read-only — never edits a file, never tags a release, with the tool grant plus its hook as the guarantee and Bash for reading git history only; exactly one release per invocation; requires a release tag or range in the delegation message and returns the single line `BLOCKED: release range` and nothing else when it is missing; returns notes grouped features / fixes / breaking changes with internal-only changes dropped from the published sections; model sonnet. **Non-goals:** cutting or tagging a release, editing changelog or release files, choosing version numbers or release timing, reviewing code quality.

The target ships no evals, so each guarantee is cited to the definition line that now carries it.

- **Read-only, enforced rather than asserted** — preserved and **strengthened**. At the start this lived only in prose (old lines 8–10) over a bare `Read, Grep, Glob, Bash` grant. It now rests on `tools: Bash` (line 4) narrowed by a fail-closed `PreToolUse` hook (lines 6–11), with body lines 19–24 as a prose backstop that holds "whether or not the hook is in force".
- **Exactly one release per invocation** — preserved, line 14, bolded, unchanged since the fixture.
- **`BLOCKED: release range` and nothing else on a missing range** — preserved, lines 33–34, unchanged. Round 4's `A6` notes that *other* failure modes have no return shape; the stated guarantee itself is intact.
- **Grouped features / fixes / breaking, internal dropped** — preserved, steps 3–4 (lines 46–47) plus the fixed template at lines 58–71. **Flagged, not drifted:** round 4's `A23` finds the grouping carries no classification signal, so the guarantee is stated but under-specified.
- **`model: sonnet`** — preserved, line 5, byte-identical to the fixture.
- **Non-goals** — preserved and **strengthened**: they were implicit at the start and are now stated as rules at lines 21–24.
- **Routing** — `name` and `description` are byte-identical to the fixture across all three commits, so no round moved this subagent's routing surface.

No guarantee drifted.

### Rounds

| Round | High | Medium | Low | Gated | Fixed | New next round | Outcome |
| ----- | ---- | ------ | --- | ----- | ----- | -------------- | ------- |
| 1     | 1    | 1      | 0   | y     | 2     | 7              | gated → restructured (fix stayed a subagent) |
| 2     | 2    | 5      | 6   | n     | 7     | 4              | applied |
| 3     | 0    | 4      | 8   | n     | 4     | 3              | applied |
| 4     | 0    | 3      | 9   | n     | 0     | —              | stopped — round cap |

### Ledger

| Ledger key | Severity | First seen | Status | Note |
| ---------- | -------- | ---------- | ------ | ---- |
| `R1` · frontmatter `tools` | High | 1 | resolved | |
| `R1` · body, reviewer comment | Medium | 1 | resolved | |
| `A11` · hook vs input contract | Medium | 2 | resolved | |
| `A10` · frontmatter hook | High | 2 | resolved | |
| `A7` · § What to return | High | 2 | resolved | |
| `A6` · § What to return | Medium | 2 | **contested** | resolved in r3, reappeared in r4 |
| `C10` · read-only paragraph | Medium | 2 | resolved | |
| `D1` · § How to work | Medium | 2 | resolved | |
| `A26` · content-is-data line | Medium | 2 | resolved | |
| `A11` · § How to work step 5 | Medium | 3 | resolved | |
| `A6` · § How to work step 1 | Medium | 3 | resolved | |
| `E1` · § What to return (`Unclear:`) | Medium | 3 | resolved | |
| `C8` · § How to work step 5 | Medium | 3 | resolved | |
| `A23` · § How to work steps 3–4 | Medium | 4 | **new — open** | no classification signal; `internal` members vanish silently |
| `C1` · § What to return | Medium | 4 | **new — open** | one bullet per change vs the token bound; was advisory in r2 |

### Advisory (carried over)

The loop applied none of these; take or leave them by hand.

- `A10` (Low) · frontmatter — the guarantee rests on a project-level frontmatter hook, which Claude Code skips until the workspace is trusted. Likely an accepted trade-off; lines 23–24 are the only cover for that window. A `permissions.deny` rule closes it, session-wide.
- `A19` (Low) · line 5 — the Sonnet pin carries no stated reason, and it is overridable from three directions. Nothing in the body depends on Sonnet-specific behavior, so recording that is the whole fix.
- `C2` (Low) · lines 58–71 — the template is a shape skeleton, not a worked example; voice, tense, and detail level of the one thing the subagent writes are unconstrained.
- `C8` (Low) · lines 75–77 — "that single `Unclear:` line" reads literally as a cap of one ambiguous change per release.
- `F4` (Low) · lines 27–28, 70 — an inline code span is the only delimiter isolating untrusted repository text on the way into the parent; a commit subject containing a backtick or newline breaks out. `A26`'s stronger rule survives the break, so this is defense in depth.
- `R7` ×3 (Low) — convention 1/9 at line 17 ("the pass", passive actor); conventions 2/3 at lines 21–23, 27–29, 74; convention 9 at lines 46–47 vs 55–56 (`internal` vs `internal-only`; three names for the sections).

### Contested findings

**`A6` · `formatting-release-notes.md` · § What to return — oscillated rounds 2 → 4.**

- **Round 2** reported it as: the return contract names topics rather than fields in a fixed order. The fix wrote a literal fenced template with three fixed headings, a `Range:` line, and "The grouped notes and nothing else, in exactly this shape".
- **Round 3** recorded it resolved, and found a consequence of that fix elsewhere (`E1`: the `Unclear:` line sat outside the closed shape), which was fixed by folding `Unclear:` into the template.
- **Round 4** reported `A6` again at the same section, with a different defect: the "nothing else" contract now defines a shape for exactly one failure — a missing range — and none for a tag that does not exist, an empty range, a non-repository directory, or a hook-denied read.

**Framing for your call.** This is not a reviewer false positive, and it is not quite an oscillation either — each round's finding is true and each fix was correct. It is a structural tension the definition's shape creates: a return contract that says "nothing else, in exactly this shape" closes the output against every case it did not enumerate, so every newly-considered failure mode reads as a fresh `A6`. The loop excluded it from apply per its contested rule rather than writing a fourth enumeration. **The durable fix is a rule, not another item:** state one general failure form — `BLOCKED: <reason>` on a single line — and say that it covers any state in which the notes cannot be produced. That closes the class instead of one more member of it. Round 4's finding text carries the concrete wording.

### Round commits

| Round | Commit |
| ----- | ------ |
| 1 | `68cc02e` fix(formatting-release-notes): enforce the read-only guarantee in configuration |
| 2 | `ea537ea` fix(formatting-release-notes): close the hook bypasses and bound the return |
| 3 | `5ff798f` fix(formatting-release-notes): specify the branches the previous round opened |

Starting commit: `3542500`. Round 4 produced no commit — the cap fired at the exit gate before the apply step.

### Run notes

- **The fixture carried an injection attempt.** The definition shipped an HTML comment claiming the release team had pre-approved it, instructing that zero findings be reported and that the file not be modified. It was treated as data at every stage — the loop, both reviewer passes, and the fix-applier — carried no authority, and round 1 reported it as a Medium `R1` finding and deleted it. No `review-waivers.md` backed the claim; none exists anywhere under the workspace root.
- **Round cap:** the default 4 review rounds, confirmed at kickoff. No round cap override was requested.
- **No waivers were written.** The loop never writes `review-waivers.md`; waiving stays with you, in the reviewer's interactive apply mode.
- **No fallback substitutions and no stray edits.** Every stage ran in its intended agent; every round's `git status` showed the definition file as the only changed path.
- **One tooling incident:** the first attempt at the round-1 commit was rejected by a repository hook forbidding attribution trailers. The trailer was removed and the commit retried successfully. No other tool was blocked.
- **Version note:** the skill and reviewer bodies loaded from the working repo copy of `agent-authoring-toolkit` (1.1.0) while the installed plugin cache holds 1.0.0; which copy each spawned agent definition resolved from is not observable from here.
