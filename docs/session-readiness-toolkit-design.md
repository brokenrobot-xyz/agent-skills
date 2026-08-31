# Session Readiness Toolkit — design record

**Status:** design agreed, not built. **Date:** 2026-08-31.
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

| Idea | Portable | Notes |
| :--- | :--- | :--- |
| **Consequence mapping** | Fully | Every line pairs a fact about the machine with what it breaks. `✗ jq missing` is noise; `✗ jq missing — the codegraph health probe cannot be parsed` changes what the model does next. A writing discipline more than a coding one. |
| **Detect / remedy split** | Fully | Detection is mechanical and lives in code. Remediation is judgment and lives in human-authored prose. They join on a symptom key, and the check may not invent a cure — which is what stops a model emitting a plausible, wrong, platform-specific install command. |
| **One truth, two consumers** | As a shape | An automatic path that runs unbidden — fast, and never able to fail the session — and an invited path that runs when a human asks. Same detection, different authority to act. |
| **The probes themselves** | No | The bulk of the existing code and the least of the value. The generator writes these per repository; none of them ship. |

## The model: two categories, separated by authority

The dividing line is what the artifact is permitted to do, not what the concern is about.

**Env readiness** — concerns the session must *know about*, where the artifact has **no authority to
change anything**. It observes and states the consequence. The human decides what to do.

**Session preparation** — concerns the session must *resolve* before work begins, where the artifact
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
```

Two facts sit behind the rule:

1. Resolving anything outside the checkout requires **judgment** — a version, a platform, a global
   install — and judgment cannot be delegated to a hook that runs before anyone is listening.
2. Resolving something inside it only rebuilds regenerable state, which is why acting there is safe.

The third line follows from the second: regenerability is what decides, and location is only its
usual proxy. Anything that cannot be rebuilt from what the checkout carries — wherever it lives —
is readiness.

### What makes preparation worth having

A missing dependency tree *screams*: the first command fails unmistakably. A stale index *lies*: it
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

## What the skill writes into a repository

| Artifact | Purpose |
| :--- | :--- |
| Probe implementation | The detection layer, shared by both consumers so it cannot drift apart. |
| `SessionStart` hook | The automatic consumer. Exercises both authorities: reports findings, performs preparation. |
| On-demand skill | The invited consumer, for when a human asks. Readiness authority only — it diagnoses and guides, never fixes. |
| Troubleshooting doc | Where every remedy lives, keyed by symptom. Without it the remedy half has nowhere to sit, and the next model to read a `✗` line will invent a fix. |
| Self-check script | One script that exercises the produced hook end to end and reports whether it holds to contract. Not a case suite. It also asserts the detect/remedy join: every probe symptom key resolves to a troubleshooting entry, so a probe added without its remedy fails loudly instead of shipping a `✗` line that invites an invented fix. |

The on-demand skill's narrower authority is the categories expressed as permissions — the same model,
enforced rather than described.

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

| Question | Decision | Consequence |
| :--- | :--- | :--- |
| Shareable unit | Authoring skill | Ships the pattern; generated code is owned by the consumer. |
| Audience | Own repositories and marketplace consumers | Trust matters, which is what settles the unit above. |
| Category assignment | Fixed rule, scope decides | No per-item interview; placement is checkable mechanically. |
| First build | Both categories together | The categories only prove themselves when both exist. |
| Discovery | Inspect, then confirm | Evidence-based and short; catches forgotten concerns. |
| Remedies | Interview for every fix | Nothing unverified ships. Accepted cost: a long interaction. |
| Output | All four artifacts, plus a self-check | Mirrors what the website repository has today. |
| Re-runs | Update in place | Generated code is ordinary repo code: re-analyzed from scratch, no provenance tracking. Accepted cost: fresh analysis cannot tell deliberate choices from drift, so re-runs re-ask. |
| Implementation language | User's and repo's preference | The skill ships the know-how; bash, Node, Rust — whatever the repository already speaks. One taught exception: the hook's entry point is recommended in an always-present runtime (POSIX sh), because a hook in the repo's language can never report that runtime as missing — the interview lets the user override with eyes open. |
| Ecosystems | Language-agnostic | Widest reach; more detection to keep correct. |
| Verification | One self-check | Cheaper than a case suite, catches the big failures. |

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

Both are bounded and both de-risk the build; neither is started yet.

- **Enumerate the invariant catalog.** The skill's payload is "the invariants the artifacts must
  hold", and that list exists nowhere — it is scattered across the website hook's comments and this
  record. Mine `session-start.sh`, `lib/dev-env-checks.sh`, and `checking-dev-env` for the full
  set: single report emission on every exit path, the freshness stamp living inside the regenerable
  state it describes, never failing the session, degraded modes when a probe's own dependency is
  missing, idempotence under concurrent sessions, probes cheap enough to pay every session while
  expensive verification stays on the invited path. If the catalog comes out thin, the idea is
  thinner than this record assumes — better learned before the skill is written.
- **Pilot the inspect step on `agent-skills`.** The whole pattern generalizes from one repository.
  Dry-running discovery against a repository of a different shape — plugins and evals rather than a
  Node app — stress-tests the categories before the skill hardens, and produces the real generated
  output the deferred reviewing skill is waiting on.

## Deferred

- **Packaging and naming.** One plugin, or two plus a shared contract skill. Names must be checked
  against [skill-conventions.md](skill-conventions.md) — gerund form for a skill that does something,
  and the split test (`D15`) decides whether the contract becomes its own skill.
- **The reviewing skill.** Sequenced after the author, once the contract has been proven by real
  generated output rather than designed against one example.
- **Orientation facts.** Branch divergence, in-flight specs, unfinished work — a genuinely different
  category from readiness, set aside rather than dismissed.
- **Hook triggers.** `compact` is confirmed available as a `SessionStart` source (verified
  2026-08-31; see References). What remains open is only whether re-reporting after a compaction
  earns its context cost.

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
