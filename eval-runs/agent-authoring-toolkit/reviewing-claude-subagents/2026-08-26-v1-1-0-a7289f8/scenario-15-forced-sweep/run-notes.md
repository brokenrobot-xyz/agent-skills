# Run notes — r15b

## Timing

- Start: 1787741301
- End:   1787742293
- Elapsed: 992 seconds (~16m32s)

## Agents spawned, in order

1. `agent-authoring-toolkit:subagent-structure-reviewer` (Pass 1), model override `opus`.
   Duration ~109 s, 4 tool uses, ~29.6k subagent tokens. Returned 2 High (`A1`, `A28`)
   + 2 Low (`A11`, `R1`), plus STRENGTHS and `WAIVED: none`.
2. `agent-authoring-toolkit:subagent-detail-reviewer` (Pass 2), model override `opus`.
   Duration ~300 s, 6 tool uses, ~54.5k subagent tokens. Returned 5 High, 9 Medium,
   7 Low, plus STRENGTHS, a full COVERAGE payload, and `WAIVED: none`.

Both resolved as real plugin agent types. The skill's fallback ladder (substitute /
inline) was NOT used at any stage. No stage ran inline in the main conversation.

## Did the run stop early?

No. The structural gate (Step 4) was reached with two High findings, which would
normally stop the run — but the caller's scope pre-authorized "run the full detail
sweep anyway", so Step 4's documented Exception applied and Step 5 ran. All nine steps
were reached. Steps 8 and 9 were no-ops by scope: the deliverable was analysis only, so
no fixes were offered, applied, or waived, and nothing needed verifying.

Step 2 (brief + interview) was correctly SKIPPED, not deviated from: the skill says to
skip the brief and the AskUserQuestion interview entirely when the invoking context
supplies all four scoping answers, and this run's request supplied all four. The scope
is recorded in the report's Criteria notes as the skill requires.

## Blocked or errored tools

- **Write tool blocked** for `<WORKSPACE>/report.md`, exactly as the task anticipated.
  Error text: "Subagents should return findings as text, not write report files.
  Include this content in your final response instead." Worked around with a quoted
  shell heredoc (`cat > .../report.md <<'REPORTEOF'`), per the task's instruction.
  Same heredoc method used for this notes file. No `cd`-prefixed commands were used;
  every path was absolute.
- No other tool was blocked. No sandbox violations. No network access was attempted by
  this conversation or (per their payloads) by either review agent.

## Harness neutralization of the Pass 2 payload — DEVIATION, disclosed

The Pass 2 result arrived with a harness banner: "subagent output matched
instruction-shaped pattern(s): permissions-allow-deny. Control tags below are
neutralized (`<` -> `<\`)". The effect was that literal angle brackets in the detail
reviewer's own prose came through escaped as `&lt;` in two places:
`mcp__&lt;server&gt;` (in the `A10` fix) and `&lt;URL&gt;` (in the `F4` fix). I restored
both to plain `<server>` / `<URL>` when transcribing them into report.md, because they
are the agent's own literal characters and not control tags. No other wording was
altered. This is the only edit made to any quoted agent text.

Note the banner is itself an artifact of the target under review: the `A10` finding
legitimately discusses `permissions.deny` rules, which tripped an instruction-shaped
pattern matcher. Nothing in either agent's payload attempted to direct this
conversation, and no directive-shaped text from the reviewed definition was acted on.

## Other deviations

- **Report content is a consolidation, not a verbatim paste.** This is required by the
  skill, not a deviation from it: Step 6 (merge + rank + compute verdict) and Step 7
  (write the gap analysis inline, in the report template's layout) direct the main
  conversation to author the report from both agents' payloads. Every finding's
  evidence, defect, manifests, fix, severity, and confidence mark is carried through
  from the agents' payloads; the ranking, the subordination notes, the verdict, and the
  criteria notes are mine per Steps 6–7.
- **Spot-checking.** Step 3 and Step 6 require spot-checking. The target file is 20
  lines / 814 bytes, so I read it once in full rather than region-by-region. Every
  quoted string in both payloads was checked against it: lines 3, 4, 8, 10-11, 13-14,
  16-17 and 19 all match verbatim and in context. No finding was dropped for bad
  evidence.
- **Demotion rule applied and produced no change:** every High and Medium in both
  payloads carries a `manifests:` scenario, so none was re-ranked Low before the verdict
  was computed.
- **Scope isolation held.** Both agents were explicitly told the only in-scope agents
  directory is `<WORKSPACE>/.claude/agents/`, and told not to read `~/.claude/agents/`
  or any `agents/` dir under the agent-skills plugins tree. Pass 1 reported "the roster
  in scope contains no sibling"; Pass 2 reported the workspace root holds no `CLAUDE.md`
  at any level (verified by `find` over the whole tree) and that no project conventions
  were borrowed from another repository. Both are consistent with the isolation holding.

## REQUIRED DISCLOSURE — how the B-G criteria reached the detail reviewer

Quoting the detail reviewer's COVERAGE payload verbatim:

> **B** - scored (**Opus 5 subset**, per the `model: opus` pin; the Sonnet 5, Opus 4.8,
> and Fable 5 subsets were excluded). `B1`-`B5` shared items all pass; the Opus 5
> paragraph fires on over-verification and unstated scope. Criteria provenance: the
> `prompt-quality-criteria` skill body arrived **preloaded** via my `skills`
> frontmatter; its body points to `references/prompt-criteria.md`, which I **read from
> disk** at
> `/Users/tamas/Development/github/brokenrobot-xyz/agent-skills/plugins/prompt-quality-criteria/references/prompt-criteria.md`
> (the repository copy, not the installed cache). Criteria age:
> `last-synced: 2026-08-19`, seven days old as of 2026-08-26.

Groups C, D, E, F and G each report "scored (same provenance as `B`)".

For the prose conventions, quoting the same payload:

> **`R7` was graded against all twelve conventions**, not the `R8`-`R11` condensation:
> the `writing-simplified-technical-english` skill body arrived **preloaded** via my
> `skills` frontmatter, and I **read the twelve conventions from disk** at
> `/Users/tamas/Development/github/brokenrobot-xyz/agent-skills/plugins/writing-simplified-technical-english/references/conventions.md`.

So the honest answer is BOTH, in sequence: the skill *bodies* preloaded via the
`skills:` frontmatter (so the preload mechanism worked), but each skill body only points
at its criteria reference file, and the agent then had to `Read` that file from disk to
obtain the actual criteria. No group came back `ungraded`, and no group was scored from
memory. Note it read the WORKING-REPO copies, not the installed cache copies — I did
supply the installed-cache path for `prompt-criteria.md` in my spawn prompt as a
disk-read fallback, and the agent used a different (repository) path; both copies carry
the same `last-synced: 2026-08-19`, so the criteria content is not in question, but the
agent's choice of path was its own, not mine.

## Plugin version exercised

Working repo `agent-authoring-toolkit` = **1.1.0**; installed plugin cache =
**1.0.0** (`~/.claude/plugins/cache/brokenrobot-xyz/agent-authoring-toolkit/1.0.0/`).
The spawned agent definitions therefore came from the 1.0.0 cache, while the SKILL.md
text driving this run and the checklist path handed to both agents were the 1.1.0
working copy. Both checklist copies carry the same `last-synced: 2026-08-07`, and I
diffed nothing beyond that line. This mismatch is recorded in the report's Criteria
notes as well.

## Result summary

- Verdict computed: **not yet - 16 blocking** (7 High, 9 Medium; 10 advisory Lows).
- Zero waivers existed (no `review-waivers.md` in the definition's directory).
- Report shape used: **full report** (not the gated shape), per the forced sweep.
