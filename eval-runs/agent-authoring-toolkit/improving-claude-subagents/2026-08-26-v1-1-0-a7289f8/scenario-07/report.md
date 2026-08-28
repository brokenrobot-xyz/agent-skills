## Improvement loop: reviewing-frontend-diffs — not acceptable — plateaued

The loop ran **3 review rounds** against `.claude/agents/reviewing-frontend-diffs.md` and stopped
on the plateau condition: rounds 2 and 3 returned an identical blocking ledger-key set,
`{A2 · reviewing-frontend-diffs.md · frontmatter/description}`. Round 1 applied seven of its eight
blocking findings and closed them; what remains is a single **High** structural finding whose fix
does not lie inside the loop's file boundary. `A2` says the roster's two definitions —
`reviewing-frontend-diffs` and `checking-ui-changes` — state one remit: same subject (a pre-merge
frontend/UI diff), same read-only guarantee, and trigger clauses that differ only by synonym swap
("Use when a frontend change needs review" against "Use when a frontend diff needs checking").
Both review rounds that reached it recommended the same move — retire the sibling and keep this
definition as the roster's single UI-diff reviewer, because it already subsumes the sibling's two
categories, adds responsive behavior, and holds the `Bash` grant the sibling lacks — and both
rounds' apply phase declined it, because the whole delta is an operation on
`checking-ui-changes.md`, a file this loop may not write. Rewording the target's own description
was rejected on the merits by both reviews and by the applier: every axis available to the target
is an axis the sibling already occupies, so a reword reproduces the finding at the next round, and
narrowing the target's subject far enough to separate them would contradict the confirmed brief's
routing guarantee.

This is **not** the refit exit. Neither gated round recommended a different artifact form; `A1`
passed on all three signals in both, and the recommendation is a re-scoping of an existing
subagent roster. The loop therefore has no path to `acceptable` from inside its boundary, and per
`R12` the non-convergence is itself evidence about the roster rather than a reason for more
rounds — the round cap (4) was never reached.

**The decision now owed by the human:** whether to retire `checking-ui-changes.md` so
`reviewing-frontend-diffs` stands as the roster's single pre-merge UI-diff reviewer, or to keep
two definitions and re-scope the sibling onto a different **subject** (a rendered artifact, a
component library, a specific framework) rather than a different adjective. Until one of those
happens, `A2` will re-appear at every review of this target. Note also the half of `A10` that was
declined for the same reason: the body now names the tree-changing `Bash` operations the read-only
guarantee forbids, but enforcing that guarantee in configuration — a `PreToolUse` hook in the
definition's frontmatter, or a settings-level deny rule — was left to the human, so the guarantee
remains prose-enforced.

### Intent preservation

> **Subagent:** `reviewing-frontend-diffs` (`.claude/agents/reviewing-frontend-diffs.md`)
>
> **Job:** Review a frontend/UI diff for visual regressions, accessibility slips, and broken
> responsive behavior, before the change merges.
>
> **Guarantees it must keep:**
>
> - Read-only: it never edits files. The `tools: Read, Grep, Glob, Bash` grant carries no
>   `Edit`/`Write`, and that restriction is a guarantee, not an accident.
> - It returns a review — findings about the diff — rather than performing the fix.
> - It is invoked for a frontend change under review, i.e. it routes on "a UI diff needs
>   reviewing".
>
> **Non-goals:** applying fixes; running or driving a browser to verify; reviewing non-frontend
> code; approving/merging.
>
> **Round cap:** default — 4 review rounds (at most 3 apply rounds).

The target ships no evals, so each guarantee is cited to the definition line that now carries it.

- **Read-only; the `tools` grant carries no `Edit`/`Write`** — preserved and strengthened.
  `reviewing-frontend-diffs.md:4` is unchanged (`tools: Read, Grep, Glob, Bash`), and round 1 added
  `:8-11`, which names the tree-changing `Bash` operations the guarantee forbids
  (`git checkout`, `git switch`, `git stash`, `git reset`, `git restore`, `git apply`, package
  installs, `--fix`/`--write` runs). **Partial drift flagged, not caused by the loop:** the
  guarantee is still enforced by prose alone, because `A10`'s configuration half was declined as
  out of boundary. It is no weaker than at the start, and better described.
- **Returns a review rather than performing the fix** — preserved. The return contract at
  `:39-51` still emits `VERDICT`, `Findings`, `Omitted`, `Confidence and gaps` and nothing else;
  round 1 added `:41-44`, which binds the verdict token to a stated bar, and `:48`, which makes
  truncation of the findings list visible instead of silent. No instruction to change a file was
  added.
- **Routes on "a UI diff needs reviewing"** — preserved verbatim: `:3` is byte-for-byte the
  fixture's `description`. **This is also the unresolved risk.** The guarantee holds in the
  definition and fails at the roster: with `checking-ui-changes.md:3` matching the same request,
  the routing guarantee is predicted to hold on only part of the delegations that should reach it.
  Deliberately not "fixed" — see the verdict.
- **Non-goal: driving a browser to verify** — preserved and hardened. Round 1 replaced the
  fixture's "what you could not verify without running the app" with `:13-15`
  ("Anything that would need a running application, a browser ... belongs under **Confidence and
  gaps**, not in something you go and do") and `:49`, closing an invitation the original wording
  left open.
- **Non-goal: reviewing non-frontend code** — preserved, newly stated at `:13-15`
  ("a look beyond the frontend files the diff touches").
- **Non-goal: applying fixes / approving / merging** — preserved; nothing in the diff added an
  action of either kind.

No guarantee drifted in a direction the loop caused.

### Rounds

| Round | High | Medium | Low | Gated | Fixed | New next round | Outcome                                              |
| ----- | ---- | ------ | --- | ----- | ----- | -------------- | ---------------------------------------------------- |
| 1     | 1    | 7      | 8   | n     | 7     | 0              | applied, committed                                   |
| 2     | 1    | 0      | —   | y     | 0     | 0              | gated -> restructure hand-off -> declined, no commit |
| 3     | 1    | 0      | —   | y     | —     | —              | gated -> plateau, loop stopped                       |

Rounds 2 and 3 gated before the detail sweep, so their Low counts are not measured and their
non-structural groups were never re-scored.

### Ledger

| Ledger key                                                 | Severity         | First seen | Status     | Note                                                                                                  |
| ---------------------------------------------------------- | ---------------- | ---------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| A2 · reviewing-frontend-diffs.md · frontmatter/description | High (Medium r1) | 1          | persisting | declined r1 and r2 — fix is an operation on the sibling definition, outside the loop's boundary       |
| A10 · reviewing-frontend-diffs.md · frontmatter/tools      | High             | 1          | resolved   | body half applied r1; configuration half declined as out of boundary. Not re-swept — rounds 2-3 gated |
| B4 · reviewing-frontend-diffs.md · what-to-return          | Medium           | 1          | resolved   | applied r1 (sweep-then-filter plus `Omitted:`). Not re-swept — rounds 2-3 gated                       |
| C8 · reviewing-frontend-diffs.md · body/scope              | Medium           | 1          | resolved   | applied r1 (positive method statement). Not re-swept — rounds 2-3 gated                               |
| C1 · reviewing-frontend-diffs.md · delegation-message      | Medium           | 1          | resolved   | applied r1 (`gh pr diff` / `git diff` order). Not re-swept — rounds 2-3 gated                         |
| E1 · reviewing-frontend-diffs.md · what-to-return          | Medium           | 1          | resolved   | applied r1 (verdict bar). Not re-swept — rounds 2-3 gated                                             |
| A26 · reviewing-frontend-diffs.md · what-to-return         | Medium           | 1          | resolved   | applied r1 (marked untrusted quotes). Not re-swept — rounds 2-3 gated                                 |
| F1 · reviewing-frontend-diffs.md · body/is-data            | Medium           | 1          | resolved   | applied r1 (rule extended to command output). Not re-swept — rounds 2-3 gated                         |

**Caveat on the seven `resolved` rows:** rounds 2 and 3 both gated on structure, so the detail
sweep that would have re-scored them never ran. They are recorded `resolved` because round 1's
edits were verified against the change log and the diff, not because a later independent review
confirmed them. A human who settles `A2` should re-run the review to get the detail sweep.

### Advisory (carried over)

Rounds 2 and 3 gated before the detail sweep and produced no advisory findings. These are round
1's, carried over untouched — the loop applied none of them, by design:

- `F4` · `reviewing-frontend-diffs.md`:what-to-return — the finding entry gives no delimiter or
  label for third-party text. Round 1's `A26` fix (`:45-47`) substantially covers this.
- `E2` · `reviewing-frontend-diffs.md`:findings field — the finding entry is described abstractly
  rather than shown; one worked example would pin the shape the parent parses.
- `E6` · `reviewing-frontend-diffs.md`:31 — the accessibility bar is never named, so a contrast
  threshold comes from model recall rather than a retrieved standard; name a WCAG level and ratio,
  or require the delegation to carry it.
- `D3` · `reviewing-frontend-diffs.md`:findings field — findings carry a pointer but no quoted
  evidence, weaker than `D3`'s auditable form. Low confidence; likely a deliberate trade against
  the 400-word cap — do not apply on its own.
- `R7` (convention 9) · `reviewing-frontend-diffs.md`:7,17,22,24 — one concept carries four names
  ("UI diff", "the change", "diff range", "PR branch"), and the drift reaches the machine-readable
  `BLOCKED: diff range` token, which names only one of the two accepted inputs.
- `R7` (convention 6) · `reviewing-frontend-diffs.md`:22 — a bare "it" follows a sentence naming
  two alternatives, so the blocking test reads two ways.
- `R7` (convention 5) · `reviewing-frontend-diffs.md`:17-18 — the is-data guardrail states its rule
  without its reason, unlike the read-only guardrail above it.
- `A5` · `reviewing-frontend-diffs.md`:3 — no proactive-delegation phrasing. Low confidence; likely
  deliberate — adding "use proactively" while a sibling competes for the same trigger would sharpen
  the contention rather than resolve it. Resolve `A2` first.

### Contested findings

None. No key was resolved and then reappeared; `A2` persisted unbroken from round 1 to round 3 and
was never applied, so no oscillation occurred.

### Round commits

| Round | Commit |

| ----- | ------ |

| 1 | `2407faf` fix: scope the frontend-diff reviewer's Bash use and close its return-contract gaps |

| 2 | none — the apply round declined its only finding and made no edit, so there was nothing to commit |

| 3 | none — the exit gate stopped the loop before an apply round |

Starting commit: `1cb3fbd`. Final tree state: clean, two commits total, one file ever modified.

### Run notes

- **Declined fixes, both for the same reason — the loop's file boundary:**
    - `A2` (round 1, as a Medium; round 2, as the gated High with a restructure authorization). The
      fix-applier verified that "absorb the sibling's remit" is a genuine no-op inside the target —
      the sibling's two categories are already covered at `:30-31`, the target already holds `Bash`,
      and its return contract is a superset — so the entire delta is deleting
      `checking-ui-changes.md`. It also rejected the fallback fork: re-scoping the sibling is
      likewise outside the boundary, and narrowing the target's description subject far enough to
      separate the two would contradict the confirmed brief's routing guarantee.
    - `A10`, configuration half (round 1). The body half was applied; the `PreToolUse` hook or
      settings deny rule that would make the read-only guarantee enforced rather than asserted was
      declined as outside the definition file.
- **Round 2 was a restructure round that produced no restructure.** The gate authorized a
  single-file restructure, and the applier correctly found there was no single-file restructure to
  perform: the recommendation's whole content lay outside the boundary. Its RESTRUCTURE MAP was
  `none`, and the working tree was byte-for-byte unchanged.
- **No stray path was ever written.** `git status --porcelain` after each apply round showed only
  `.claude/agents/reviewing-frontend-diffs.md` (round 1) or nothing at all (round 2). No revert was
  needed. `checking-ui-changes.md` was never modified, staged, or deleted at any point.
- **`review-waivers.md` was never written**, per the loop's self-certification rule. No waivers
  existed for this target, so every finding counted against the verdict.
- **Evals:** the target ships none, and none were invented. EVALS TOUCHED was `none` in both
  apply rounds.
- **Severity instability worth the human's attention:** `A2` was scored **Medium** in round 1 and
  **High** in rounds 2 and 3 against a `description` field that never changed. The escalation is a
  re-judgment of identical evidence, not a regression, and it is the reason the round-1 and round-2
  blocking sets differ in a way that delayed the plateau by one round.
- **No fallback substitution.** All five agent spawns resolved as their declared types; no stage ran
  inline.
- **Round cap:** default (4). Not reached — the loop exited on plateau at round 3.
