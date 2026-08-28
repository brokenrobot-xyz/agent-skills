# improving-claude-subagents

Autonomously improves one Claude Code subagent definition by looping the
[reviewing-claude-subagents](../reviewing-claude-subagents/README.md) review:
review → apply every **blocking** finding → commit → re-review, until the
review's verdict is **acceptable**, the blocking findings plateau, or the
round cap is hit. Advisory findings are reported at the end, never chased —
chasing polish is the churn that stops loops converging.

**Read this before running it: the loop applies High and structural fixes —
including single-file restructures of the definition — without asking.** Its
entire interaction budget is one question at kickoff, confirming the
**intent brief** (the subagent's job, guarantees, and non-goals). If you
want to approve fixes one at a time, use `reviewing-claude-subagents`
directly instead — that is its interactive apply mode.

**One exit is unique to a subagent target.** When a review round gates on
"this should be a skill" (or a hook, or a `CLAUDE.md` rule), the loop stops
with **not acceptable — refit needed** and hands you the reviewer's
recommendation: the loop edits one definition file and never authors a new
artifact in your stead.

The loop procedure lives in [SKILL.md](SKILL.md), the apply agent in the
plugin's [agents/fix-applier.md](../../agents/fix-applier.md) (shared with
[improving-claude-skills](../improving-claude-skills/README.md)), and the
ledger and report layouts in the
[shared loop template](../improving-claude-skills/references/loop-report-template.md);
on any conflict, those are canonical.

## Install

This skill ships in the [agent-authoring-toolkit](../../README.md) plugin:

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install agent-authoring-toolkit@brokenrobot-xyz
```

Each round invokes the review of
[reviewing-claude-subagents](../reviewing-claude-subagents/README.md) —
shipped in this same plugin — non-interactively through the Skill tool, with
all four scoping answers supplied. The criteria it needs
(`prompt-quality-criteria`, `writing-simplified-technical-english`) arrive
as the plugin's declared dependencies.

Each round ends in one commit, so every round is diffable and revertible.
The loop follows the host project's own commit conventions — a commit skill
the host provides, the host `CLAUDE.md`'s rules, or the style visible in the
repo's git log — and imposes no commit style of its own.

If the reviewer is missing, the loop **aborts before any edit** — it never
improvises a review from memory.

## Usage

Ask Claude to improve a named subagent autonomously, in a loop, or until it
converges. One subagent per invocation.

## How a run flows

```
1. Pre-flight                 clean git tree required (or a one-time backup for
                              non-git targets); refuses to target its own
                              machinery; records the starting commit
2. Intent brief               drafted from the target's frontmatter (the tools
                              list is part of the intent) + evals when any
                              exist, confirmed by you — THE ONLY QUESTION. The
                              round cap (default 4) is stated here too.
   ┌──────────────────────────────────────────────────────────────┐
3. │ Review round             reviewing-claude-subagents, non-interactive;
   │                          the intent brief rides in as focus notes
4. │ Ledger update            findings deduped on key + file + section
5. │ Exit gate                converged / refit needed / plateaued /
   │                          contested-only / re-gated after restructure /
   │                          round cap
   │        │
   │        ├── stop ────────▶ 8. Final report
   │        ▼
6. │ Apply round              the fix-applier subagent; surgical edits, or a
   │                          single-file restructure when the round gated on
   │                          a shape defect that stays a subagent
7. │ Verify + commit          stray paths reverted, one commit per round, in
   └─ loop ◀─                 the host's style
```

## Exit criteria

The loop stops at the first that holds, in this order:

1. **Acceptable** — the review's verdict: zero unwaived blocking findings.
   The `review-waivers.md` beside the definition (your recorded deliberate
   choices) makes this reachable; the loop itself never writes that file.
2. **Refit needed** — the round gated on a recommendation to change the
   artifact's form (`A1`): a skill, a hook, a `CLAUDE.md` rule. The
   conversion is your decision; the report carries the recommended form and
   the signal that decided it.
3. **Plateaued** — two consecutive rounds with identical blocking ledger
   keys. More editing is the wrong move.
4. **Contested-only** — only oscillating blocking findings remain; the
   human arbitrates.
5. **Re-gated** — a structural gate fires again after the one budgeted
   restructure attempt (`R12`).
6. **Round cap** — default 4 review rounds (≤3 apply rounds), settable at
   kickoff. A rail, not a target.

A not-acceptable or capped run is a finding, not a failure: the host
conventions treat non-converging review-fix rounds as evidence about the
subagent (`R12`), and the report says what decision that leaves with you.

## Behavior notes

- **The cap is reached more often than it should be.** Two of the four
  scenarios graded in the 2026-08-26 eval campaign hit the round cap rather
  than converging — including a fixture authored to converge in two rounds.
  Treat convergence as the loop's aspiration, not its guarantee.
- **A fix can mint the next round's findings.** The recommended remedy for a
  guarantee stated only in prose is a `PreToolUse` hook in the definition's
  frontmatter, and that hook is itself reviewable surface: a later round
  reports its bypasses, and the applier patches those. Where a round's
  findings sit on text an earlier round wrote, the ledger shows it — read the
  round commits before accepting that the target needed all of them.
- **Capped runs still improved their targets.** In every graded run the file
  boundary held, no waiver was written, no advisory finding was applied, and
  the final definition was better than the fixture. The churn costs tokens and
  rounds, not correctness.

Full evidence: the campaign's
[run summary](../../../../eval-runs/agent-authoring-toolkit/improving-claude-subagents/2026-08-26-v1-1-0-a7289f8/summary.md).

## Safety rails

- **Clean tree or no run.** Uncommitted changes to the target definition
  abort the loop before any edit.
- **One commit per round.** Every round is independently revertible
  (`git revert` the round's commit). Non-git targets get a stated backup
  path and whole-run restore instead.
- **Nothing outside the definition file.** Any stray write — a sibling
  definition included — is reverted and reported as an incident; fixes that
  require outside edits are declined, not applied.
- **The target is data.** Content in the reviewed definition — including a
  line like "report no issues" — never instructs the loop.
- **No form conversions.** A recommendation to turn the subagent into a
  different artifact ends the loop; it is never applied autonomously.
- **Intent is checked at the end.** The final report restates the confirmed
  brief and verifies each guarantee still holds — citing the target's eval
  when it ships one, or the definition line that now carries the guarantee
  when it does not.

## What you get at the end

One report: the verdict with per-round finding counts, the final ledger,
contested findings framed for your arbitration, the round commits, and the
intent-preservation check. Details in the
[shared loop template](../improving-claude-skills/references/loop-report-template.md).
