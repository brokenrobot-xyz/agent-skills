# Session Readiness Toolkit — design record

**Status:** built 2026-09-02 as `session-readiness-toolkit:authoring-readiness-checks`, then reviewed by `reviewing-claude-skills` over seven structure passes and three detail sweeps through 2026-09-03; every blocking finding was applied, the last sweep's six without a further verification pass. Amended 2026-09-02 after the pre-build tasks. **Date:** 2026-08-31.
**Derived from:** `brokenrobot-xyz/website` — `.claude/hooks/session-start.sh`,
`.claude/hooks/lib/dev-env-checks.sh`, and the `checking-dev-env` skill.

A design record, not a specification. It captures what was decided and why, so the build does not
re-litigate it. Every decision in the ledger was taken explicitly.

## Verdict

Generalize the website repository's session-start check, but ship an **authoring skill that writes
one per repository** rather than a working hook.

The website hook is roughly 80% brokenrobot.xyz by volume. Its codegraph pin-drift check, its global
`openspec` probe, and its devcontainer checks do not survive contact with another repository. What
survives is the shape: how a finding is worded, where a fix may come from, and who is permitted to
change anything.

Shipping the shape as a generator also removes the trust problem. A `SessionStart` hook is the most
privileged thing a plugin can carry — it runs automatically, before the user has typed anything, in
every repository where the plugin is enabled. Generated code lands in the consumer's own diff, gets
reviewed, and gets owned there.

## What carries the value

Detecting that `node` is absent is trivial. Telling the model **what the absence forbids** is the
product: it stops the model attributing a tool failure to the code and "fixing" something that was
never broken.

| Idea                         | Portable   | Notes                                                                                                                                                                                                                                                               |
| :--------------------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Consequence mapping**      | Fully      | Every line pairs a fact about the machine with what it breaks. `✗ jq missing` is noise; `✗ jq missing — the codegraph health probe cannot be parsed` changes what the model does next. A writing discipline more than a coding one.                                 |
| **Detect / remedy split**    | Fully      | Detection is mechanical and lives in code. Remediation is judgment and lives in human-authored prose. They join on a symptom key, and the check may not invent a cure — which is what stops a model emitting a plausible, wrong, platform-specific install command. |
| **One truth, two consumers** | As a shape | An automatic path that runs unbidden — fast, and never able to fail the session — and an invited path that runs when a human asks. Same detection, different authority to act.                                                                                      |
| **The probes themselves**    | No         | The bulk of the existing code and the least of the value. The generator writes these per repository; none of them ship.                                                                                                                                             |

## The model: two categories, separated by authority

The dividing line is what the artifact is permitted to do, not what the concern is about.

**Env readiness** — concerns the session must _know about_, where the artifact has **no authority to
change anything**. It observes and states the consequence. The human decides what to do.

**Session preparation** — concerns the session must _resolve_ before work begins, where the artifact
has **explicit authority to act**, and then reports what it did.

### The assignment rule

Assignment is determined, not negotiated. Scope decides, so the generator applies the rule without
interviewing about it.

```
outside the checkout        →  READINESS
                               global CLIs, language runtime, daemons, version managers

inside it, and regenerable  →  PREPARATION
                               dependency trees, indexes, generated code, warmed caches

inside it, not regenerable  →  READINESS
                               .env files, credentials, git identity

fetched by its own consumer →  NOT A CONCERN
on first use                   pinned container images, package-runner caches
```

Two facts sit behind the rule:

1. Resolving anything outside the checkout requires **judgment** — a version, a platform, a global
   install — and judgment cannot be delegated to a hook that runs before anyone is listening.
2. Resolving something inside it only rebuilds regenerable state, which is why acting there is safe.

The third line follows from the second: regenerability is what decides, and location is only its
usual proxy. Anything that cannot be rebuilt from what the checkout carries — wherever it lives —
is readiness.

The fourth line came out of the pilot (2026-09-02). A pinned container image or a package-runner
cache is regenerable and sits outside the checkout, but its consumer fetches it on first start, so
no artifact needs to act and none should. It is probed only when the first-start cost, or the
network that fetch needs, is worth a line.

### What makes preparation worth having

A missing dependency tree _screams_: the first command fails unmistakably. A stale index _lies_: it
answers confidently and out of date, and the model gets no signal at all. That asymmetry, not
convenience, is why preparation exists.

It sets priority within a category. It does not decide the category.

### The layering invariant

> Every preparation step has a readiness probe behind it. Not every readiness probe has a
> preparation step.

The two are layered, never parallel. A preparation step with no probe is acting blind. A report
showing work with no finding to justify it is the same defect seen from the other end.

### Authority by source

`SessionStart` fires for `startup`, `resume`, `clear`, `compact`, and `fork` (verified against the
current docs, 2026-08-31). Authority follows the source, not just the category:

- `startup` and `resume` get both authorities — the cases with real bootstrapping to do.
- `fork` and `clear` get neither: both continue in a checkout that is already bootstrapped, and a
  forked session runs **concurrently with its parent** — preparation firing there races a live
  install.
- `compact`, if matched at all, is report-only: re-injecting findings into a rebuilt context is
  defensible; re-running preparation under a live session is not.

## The report: findings and actions never interleave

This is the separation that matters most at the point of use. The current website report mixes them
— `✓ tools: git 2.51…` sits in the same list as `✓ dependencies: installed`. One describes the
checkout as it was found; the other describes a mutation the hook just made. A model reading that
has to infer which is which.

```
FOUND
  ✓ tools        node 22.11.0 (=.node-version), git 2.51.0, jq
  ✗ openspec     missing — the /opsx commands fail at their first CLI call
                 fix: docs/development-environment.md § Troubleshooting

DONE
  ✓ node_modules installed (34s) — the lockfile had moved
  ✓ codegraph    index built — first run in this checkout
```

Anything both observed and acted on appears once, under `DONE`. Findings carry their consequence;
actions carry what they cost and what they now enable.

Two states the pilot found are carried by wording, not new glyphs (decided 2026-09-02). A concern
the session's own sandbox hides from every subprocess — a credential denied to hook and probe
alike — is a `✗ … not checked — hidden by design` line that names the in-session check that does
work. A fact with no pin to judge against — the git identity commits will carry — rides on a `✓`
line, stated, the way the tools line states versions. The contract stays two glyphs, which keeps
the self-check and the join simple.

## What the skill writes into a repository

| Artifact             | Purpose                                                                                                                                                                                                                                                                                                                               |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Probe implementation | The detection layer, shared by both consumers so it cannot drift apart.                                                                                                                                                                                                                                                               |
| `SessionStart` hook  | The automatic consumer. Exercises both authorities: reports findings, performs preparation.                                                                                                                                                                                                                                           |
| On-demand skill      | The invited consumer, for when a human asks. Readiness authority only — it diagnoses and guides, never fixes.                                                                                                                                                                                                                         |
| Troubleshooting doc  | Where every remedy lives, keyed by symptom. Without it the remedy half has nowhere to sit, and the next model to read a `✗` line will invent a fix.                                                                                                                                                                                   |
| Self-check script    | One script that exercises the produced hook end to end and reports whether it holds to contract. Not a case suite. It also asserts the detect/remedy join: every probe symptom key resolves to a troubleshooting entry, so a probe added without its remedy fails loudly instead of shipping a `✗` line that invites an invented fix. |

The on-demand skill's narrower authority is the categories expressed as permissions — the same model,
enforced rather than described.

It also carries the one probe class the probe implementation cannot: checks only a model inside the
session can make — whether the working-copy plugins are loaded, whether an MCP server is connected
and authenticated. Those live in the skill's body, not in the shared probes, and they are what turns
the hook's `not checked — hidden by design` line into a real answer.

## How a run goes

1. **Inspect.** Read the repository — manifests, lockfiles, version pins, MCP config, scripts, CI —
   and detect its concerns. Language-agnostic: the manifest and lockfile family identify the
   ecosystem, and probing follows from that.
2. **Confirm.** Present the draft, already sorted by the rule, for correction and approval. Catches
   what the detection missed and what the user does not want checked.
3. **Interview for remedies.** Ask the user for every fix, one concern at a time, batching related
   ones. Nothing unverified ships. This is the long pole — roughly ten questions on a repository the
   size of the website.
4. **Generate, or update in place.** The first run writes all five artifacts. A later run reads what
   is there — whoever wrote it — and works out what has drifted and what the repository has newly
   grown. Anything hand-added or modified goes back to the user as a question rather than being
   silently rewritten. Same confirm step as run one, applied to existing output.

These four are genuinely ordered — each consumes the previous one's output — which is why they are
numbered and the categories are not.

## Decisions taken

| Question                | Decision                                                                                           | Consequence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| :---------------------- | :------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shareable unit          | Authoring skill                                                                                    | Ships the pattern; generated code is owned by the consumer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Audience                | Own repositories and marketplace consumers                                                         | Trust matters, which is what settles the unit above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Category assignment     | Fixed rule, scope decides                                                                          | No per-item interview; placement is checkable mechanically.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| First build             | Both categories together                                                                           | The categories only prove themselves when both exist.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Discovery               | Inspect, then confirm                                                                              | Evidence-based and short; catches forgotten concerns.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Remedies                | Interview for every fix                                                                            | Nothing unverified ships. Accepted cost: a long interaction.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Output                  | All four artifacts, plus a self-check                                                              | Mirrors what the website repository has today.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Re-runs                 | Update in place                                                                                    | Generated code is ordinary repo code: re-analyzed from scratch, no provenance tracking. Accepted cost: fresh analysis cannot tell deliberate choices from drift, so re-runs re-ask. Built as: a re-run seeds its plan from the existing doc, asks at the confirm stop about every entry it did not derive, and interviews only the ✗ prefixes with no entry (2026-09-02).                                                                                                                                                                                  |
| Implementation language | User's and repo's preference                                                                       | The skill ships the know-how; bash, Node, Rust — whatever the repository already speaks. One taught exception: the hook's entry point is recommended in an always-present runtime (POSIX sh), because a hook in the repo's language can never report that runtime as missing — the interview lets the user override with eyes open. Built as: one interpreter for the hook, the library it sources, and the self-check — POSIX sh by default, the repository's language on the user's override; the on-demand skill and the doc are Markdown (2026-09-02). |
| Ecosystems              | Language-agnostic                                                                                  | Widest reach; more detection to keep correct.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Verification            | One self-check                                                                                     | Cheaper than a case suite, catches the big failures.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Self-healing state      | Not a concern                                                                                      | Pinned container images and package-runner caches fetched by their own consumer on first use get no step; at most a first-start-cost note. (pilot, 2026-09-02)                                                                                                                                                                                                                                                                                                                                                                                             |
| Extra report states     | Wording inside ✓/✗                                                                                 | Unobservable-by-design is a ✗ `not checked — hidden by design` naming the in-session check; unjudged facts ride on ✓ lines. No third glyph. (2026-09-02)                                                                                                                                                                                                                                                                                                                                                                                                   |
| Model-observed checks   | Invited path only, in the skill body                                                               | The probe implementation stays script-only; session properties are checked by the model. (pilot, 2026-09-02)                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Packaging and naming    | One suite plugin, `session-readiness-toolkit`; the authoring skill is `authoring-readiness-checks` | Matches the repository’s other suites and scopes as `session-readiness-toolkit:authoring-readiness-checks`. The invariant catalog ships as that skill’s `references/` file. The future reviewer is `reviewing-readiness-checks`; `D15` extracts `session-readiness-criteria` only when that grader exists, because a split ahead of a grader pays the conventions’ split costs for nothing. (2026-09-02)                                                                                                                                                   |

## Risks

- **The skill is large.** Update-in-place, five artifacts, and a per-fix interview together make
  this substantially bigger than the hook it generalizes. Kept in check by what the skill ships:
  the knowledge and know-how — why heavy readiness checking and preparation matter, and the
  invariants the artifacts must hold — not per-ecosystem detection recipes or code templates. The
  model's training carries ecosystem and language specifics. What it does not reliably carry is
  the Claude Code platform contract — hook JSON output shapes, matcher sources, stdout being
  consumed only after exit — so those few version-dependent facts belong in the skill body.
- **No reviewer yet.** Generated artifacts drift from the contract the moment they are generated. The
  author/reviewer pairing used elsewhere in this repository is the answer, but it is deliberately out
  of the first build.

## Pre-build tasks

Both are bounded and both de-risk the build. Both are done.

- **Enumerate the invariant catalog.** Done 2026-09-02:
  [references/invariants.md](../plugins/session-readiness-toolkit/skills/authoring-readiness-checks/references/invariants.md). The skill's payload is "the
  invariants the artifacts must hold", and that list existed nowhere — it was scattered across the
  website hook's comments and this record. Mining `session-start.sh`, `lib/dev-env-checks.sh`, and
  `checking-dev-env` produced sixty-odd invariants in seven groups, so the idea is not thinner than
  this record assumes. The mining also corrected this record in eight places; § Catalog notes below lists them, and
  this record is not restated to match — the catalog wins where they differ.
- **Pilot the inspect step on `agent-skills`.** Inspect done 2026-09-02:
  [session-readiness-pilot-agent-skills.md](session-readiness-pilot-agent-skills.md). The whole
  pattern generalizes from one repository. Dry-running discovery against a repository of a
  different shape — plugins and evals rather than a Node app — stress-tests the categories before
  the skill hardens. The categories held; the pilot's § Where the categories strained lists the
  three amendments they needed, now folded into this record — the assignment rule's fourth line,
  the report's two wording-carried states, and the on-demand skill's model-observed checks — and
  its draft was confirmed 2026-09-02.

## Deferred

- **Criteria extraction.** Packaging and naming were decided 2026-09-02 (see the ledger). What
  stays deferred is the `D15` split: `session-readiness-criteria` is created when the reviewing
  skill arrives and must grade against the catalog, not before.
- **The reviewing skill.** Sequenced after the author, once the contract has been proven by real
  generated output rather than designed against one example.
- **Orientation facts.** Branch divergence, in-flight specs, unfinished work — a genuinely different
  category from readiness, set aside rather than dismissed.
- **Hook triggers.** `compact` is confirmed available as a `SessionStart` source (verified
  2026-08-31; see References). What remains open is only whether re-reporting after a compaction
  earns its context cost.

## Catalog notes

Moved here from the invariant catalog when it became the skill's shipped reference, so the
reference carries only the contract.

### What the mining changed

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
6. **The copy allowance** (J2). The record says the check may not invent a fix; the website lets a
   ✗ line carry a copy of the doc's fix inline. Recorded as copy-yes, invent-no, kept in step.
7. **Multi-location pin drift is a readiness sub-family** (P6). It fits the assignment rule —
   inside the checkout, not regenerable — but the inspect step has to look for it deliberately: a
   version pinned in a hook, an MCP config, and a script block is three places to drift.
8. **Consumer tolerance is a repository assumption** (A11). Whether the tools that read prepared
   state cope with its absence during the hook's window is a property of the repository, not of the
   artifacts. The inspect step verifies it per preparation target.

### Left out

Website-specific, and deliberately not invariants: the index tool's state machine and command
choice; the exact sandbox failure behind `npm install` over `npm ci`, kept only as A5's general
form; the invited path's delegation to a separate quality-gate skill, which is a per-repository
decision; the reply checklist in the skill body, which is a skill-authoring convention rather than a
readiness rule.

## References

Where the platform-contract facts in this record came from, and where the build re-verifies them —
they are version-dependent, and the links, not this record, track the current CLI.

- [Hooks reference](https://code.claude.com/docs/en/hooks) — the contract itself: `SessionStart`
  matcher sources (`startup`/`resume`/`clear`/`compact`/`fork`), exit-code semantics (exit 2 does
  not block a session start), JSON output shapes (`systemMessage`, `additionalContext`), the
  600-second default timeout.
- [Hooks guide](https://code.claude.com/docs/en/hooks-guide) — worked `SessionStart` examples,
  including context re-injection after compaction.
- [Skills](https://code.claude.com/docs/en/skills) — authoring rules for the on-demand skill and
  for the authoring skill itself.
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference) — feeds the deferred
  packaging decision.
