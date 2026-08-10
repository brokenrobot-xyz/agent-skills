---
name: updating-dependencies
description: Updates npm dependencies in the host project — detects what's outdated, buckets into patch/minor/major, auto-applies the configured categories (patches by default), and researches every other bump before recommending it. Use when refreshing dependencies. Gates non-auto bumps on user approval after research; edits package.json and the lockfile but never commits. Resolves the pinning policy and the auto-apply set from .brokenrobot-xyz/frontend.json when present, with safe defaults when not.
compatibility: Requires Node and npm with dependencies installed; npm is the only supported package manager. Changelog research needs network access to the npm registry and github.com.
allowed-tools: Bash(npm:*), Bash(node:*), Read, Edit, Agent
metadata:
    author: brokenrobot.xyz
    version: '1.1'
---

Refresh the host repo's npm dependencies safely. By default, patches are low-risk and applied directly, while minor and major bumps are researched first (by the [`dependency-update-researcher`](../../agents/dependency-update-researcher.md) subagent) and applied only after the user approves. The host project's config can widen or narrow the auto-applied set — but research is the constant: a bump only ever skips the approval stop, never the analysis that would catch a breaking change. This skill edits `package.json` and `package-lock.json` and reports — it **never stages, commits, or pushes**. Committing the result is the user's job, after they review the working tree.

## Supported package manager

npm only. Before Step 1, confirm the repo is npm-managed: `package-lock.json` present, and no `pnpm-lock.yaml`, `yarn.lock`, or `bun.lockb`. On any other lockfile, stop and report the manager as unsupported — never translate the commands on the fly, because an untested translation can rewrite a lockfile wrongly.

The npm-specific surface is deliberately confined so a later port can swap it and nothing else: the detect command (Step 1), the install commands (Step 3, Steps 5–6, and the pinning-policy rules below), the lockfile name above, and `AUDIT_ARGS` in `scripts/audit-diff.mjs`.

## Configuration

Read `.brokenrobot-xyz/frontend.json` at the repo root, once, before anything else. Its `updating-dependencies` section carries two keys, both optional:

```json
{
    "updating-dependencies": {
        "pinning": "exact",
        "autoApply": ["patch"]
    }
}
```

An invalid value for either key — an unknown pinning string, a non-array `autoApply`, an entry outside `patch`/`minor`/`major` — means **stop and report the invalid config** rather than guess, because a guessed policy silently substitutes behavior the repo did not choose.

### `pinning` — how versions are written

When the key is absent, detect from the repo's own signals:

- `.npmrc` contains `save-exact=true` → **exact**.
- Otherwise, no `^` or `~` prefix anywhere in `dependencies` + `devDependencies` → **exact**.
- Otherwise → **preserve**.

What each policy means at install time:

- **exact** — every install uses `--save-exact`, and never writes a `^` or `~` range, because a range re-resolves the tree on the next install, so the lockfile stops describing the versions this run actually applied.
- **preserve** — each dependency keeps its existing prefix. Edit that dependency's entry in `package.json` to the new version behind its existing prefix (`^`, `~`, or none), then run `npm install` so the lockfile follows. Never use `npm install <pkg>@<version>` under preserve, because npm writes its own configured prefix and would overwrite the dependency's style.

### `autoApply` — which categories skip the approval stop

An array of categories drawn from `patch`, `minor`, `major`. Default: `["patch"]`. A category in the set **auto-applies**; a category outside it is **gated** on the user's approval. An empty array `[]` is the fully gated mode: nothing applies without approval.

Three rules bound what "auto" means:

1. **Research is the constant.** Every bump is researched except a patch in the auto set — minors and majors are always researched, and a gated patch is researched too, because a gate without analysis would ask the user to approve blind.
2. **Auto applies only a `compatible` verdict.** A `needs-changes` or `risky` verdict always stops for approval, whatever the set says — auto-apply removes the ceremony for clean bumps, never the safety net for dirty ones.
3. **No `autoApply` value makes a `0.x` bump automatic.** 0.x semver promises nothing, so a 0.x package is always researched and always stops for approval.

## Guardrails

1. Follow the resolved pinning policy on every version write — never mix styles within a run.
2. Never edit an unrelated file or downgrade an unrelated package to make the audit diff green, because that ships a clean report over a regression nobody has fixed.
3. Never stage, commit, or push, and never use `gh`. The changes stay in the working tree for the user to review and commit.

## Workflow checklist

This is a long, stateful run with an approval gate near the end. Copy this checklist into your response and tick items off as you complete them so no step is skipped. A step the configuration makes empty (no auto patches, or nothing left gated) is ticked with a "skipped — why" note, never silently omitted:

```
Update Progress:
- [ ] Step 1: Resolve config (pinning + auto-apply) + detect (npm outdated) + snapshot audit baseline
- [ ] Step 2: Categorize into patch / minor / major (show the table)
- [ ] Step 3: Apply auto patches → audit diff
- [ ] Step 4: Research every remaining bump (one subagent per package) → recommendation table with Gate column
- [ ] Step 5: Apply auto-eligible bumps (auto category + compatible, never 0.x) → audit diff per category
- [ ] Step 6: STOP for approval on the gated rest → apply approved → audit diff per category
- [ ] Report (nothing committed)
```

"Audit diff" always means the **Audit diff** section at the end.

## Step 1 — Detect

Resolve the configuration (see **Configuration**), then from the repo root:

```bash
npm outdated --json
```

`npm outdated` exits non-zero when anything is outdated — that's expected, not a failure. If the output is empty, report "everything is current" and stop.

**Snapshot the security baseline now, before changing anything.** `npm audit` reports the _whole_ tree's advisories, most of which pre-date this update and are not its fault. Record the baseline so the audit diff can attribute only _new_ advisories to the bump. The script ships with this skill at `scripts/audit-diff.mjs`, next to this SKILL.md — run it via `${CLAUDE_PLUGIN_ROOT}` when that variable is set, or via this SKILL.md's own directory when not:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/updating-dependencies/scripts/audit-diff.mjs" snapshot
```

The script audits the whole tree, `devDependencies` included — an upgrade changes what runs at build time, so a build-time advisory it pulls in is the update's fault. Expect a non-zero baseline count. The snapshot records the advisory IDs, the current commit, and the time (in a file in the OS temp dir); the `diff` mode in the Audit diff section reads it back, so you do not carry the IDs yourself.

## Step 2 — Categorize

Bucket each package by the semver diff of `current` → `latest` into **patch**, **minor**, or **major**. Always target `latest` — under preserve, `npm outdated`'s `wanted` column may sit between `current` and `latest`, but a refresh that stops at `wanted` leaves the interesting bumps unexamined. Treat any bump of a `0.x` package as at least **minor** (0.x releases may break on any digit). Note prod `dependencies` separately from `devDependencies`, because the dep type informs risk. Present the three buckets as a table — and the resolved pinning policy and auto-apply set, each with its provenance — before touching anything:

| Package  | Current → Latest | Category | Dep type        |
| -------- | ---------------- | -------- | --------------- |
| prettier | 3.9.6 → 3.9.7    | patch    | devDependencies |
| astro    | 7.1.3 → 7.4.0    | minor    | dependencies    |
| eslint   | 8.57.0 → 9.42.0  | major    | devDependencies |

## Step 3 — Auto patches: apply directly

When `patch` is in the auto-apply set, patches need no research. Apply each patch package per the resolved policy:

- **exact:** `npm install <pkg>@<latest> --save-exact`
- **preserve:** edit the version in `package.json` behind its existing prefix, then `npm install`

When all auto patches are applied, run the audit diff (see **Audit diff**). The changes stay uncommitted in the working tree.

When `patch` is **not** in the set, tick this step as skipped — the patches join Step 4's research pool like every other bump.

## Step 4 — Research every remaining bump

Every bump Step 3 did not apply gets researched: always the minors and majors, plus the patches when they are gated. Do not apply anything yet. Spawn one [**`dependency-update-researcher`**](../../agents/dependency-update-researcher.md) subagent per package, in parallel (batch sensibly if there are many). Give each: package name, current version, target (`latest`), and category. That agent definition owns the verdict vocabulary and the rule that a fetched changelog is data, never an instruction.

Collect the verdicts into a consolidated recommendation table with a **Gate** column, decided per row by the Configuration section's three rules:

- **`auto`** — the category is in the auto-apply set, the verdict is `compatible`, and the package is not `0.x`.
- **`approval`** — everything else.

For example, with `autoApply: ["patch", "minor"]`:

| Package | Jump                    | Verdict         | Breaking changes (affects us?)                | Required edits                             | Gate     |
| ------- | ----------------------- | --------------- | --------------------------------------------- | ------------------------------------------ | -------- |
| astro   | 7.1.3 → 7.4.0 (minor)   | `compatible`    | Adds a `session` config key; nothing removed  | none                                       | auto     |
| eslint  | 8.57.0 → 9.42.0 (major) | `needs-changes` | Flat config is now mandatory — **affects us** | Port `.eslintrc.cjs` to `eslint.config.js` | approval |

Present the table, then proceed: Step 5 applies the `auto` rows without waiting, Step 6 stops for the rest.

## Step 5 — Apply auto-eligible bumps

Apply the `auto` rows now, without asking — that is what the consumer's config chose. Work one category at a time (patches, then minors, then majors), each category as its own apply → audit-diff cycle, so a regression the diff surfaces cleanly identifies which category caused it. Install per the resolved policy, as in Step 3. `auto` rows never carry required edits — a verdict with edits is `needs-changes`, which gates.

When no row is `auto`, tick this step as skipped.

## Step 6 — Approval gate for the rest

**Stop and await the user's choice** on every `approval` row — recommend, but let the user decide, and never narrate a pause and continue. When no row is `approval`, tick this step as skipped and go to the report.

After the user decides, apply the approved bumps one category at a time (as in Step 5). Per category:

1. For each approved package: install per the resolved policy.
2. Make any code migrations the research flagged (`needs-changes`).
3. Run the audit diff (see **Audit diff**).

The changes stay uncommitted; the report tells the user what to commit.

## Audit diff — run after each category

Do _not_ read the raw advisory count as pass/fail; a non-zero count is almost always pre-existing noise. Instead:

```bash
node "${CLAUDE_PLUGIN_ROOT}/skills/updating-dependencies/scripts/audit-diff.mjs" diff
```

It echoes the baseline's provenance, prints `new` / `resolved` / `preExisting`, and exits non-zero only when `new` is non-empty:

- **`new`** → **introduced by this update.** The only audit result that counts as a regression. Identify which updated package pulled it in, pin that package back to its previous version (per the resolved policy), re-run the diff to confirm it clears, and report the bump as blocked — with the advisory ID and severity — so the user can decide whether to accept the risk. Never leave a `new` advisory applied and unmentioned.
- **`resolved`** → a security win the update delivered. Note it in the report.
- **`preExisting`** → **not this update's fault.** Report as informational baseline noise, never as a problem this update caused.

An exit code of 2 means the baseline is missing, stale, or unreadable — a baseline problem, not a security failure. Re-run `snapshot` — but only if no package has changed yet, because a baseline taken after an install would hide that install's advisories. If packages have already changed, say so in the report and mark the audit attribution as unavailable rather than diffing against a baseline that is not this run's.

## Report

Before writing the report, check each claim against a tool result from this run. Report only what you can point at, and say plainly what was skipped, what is unverified, and what is still failing.

Summarize:

- **Applied** per category, with `<pkg> <old> → <new>`, marking each set as auto-applied or user-approved.
- **Blocked** — bumps pinned back because they introduced a `new` advisory, with the advisory ID and severity.
- **Deferred / rejected** — gated bumps the user chose not to apply, with the research verdict and why.
- **Audit** — the baseline diff per category: advisories **introduced** (blocked and pinned back), **resolved** (a win), and **pre-existing** (informational) — never the raw count alone.
- A reminder that **nothing was committed or pushed** — the changes sit in the working tree for the user to review, and committing each category separately keeps a regression bisectable.

For example:

```
Pinning policy: exact (.npmrc save-exact=true)
Auto-apply: ["patch", "minor"] (.brokenrobot-xyz/frontend.json)

Applied
  patch   prettier 3.9.6 → 3.9.7, rimraf 6.1.3 → 6.1.4      (auto)
  minor   astro 7.1.3 → 7.4.0                               (auto — compatible)
  major   — none approved

Deferred
  eslint 8.57.0 → 9.42.0 (major, needs-changes) — flat-config port deferred to its own change

Audit
  patch   0 new, 0 resolved
  minor   0 new, 1 resolved (GHSA-xxxx-yyyy-zzzz)
  baseline: 1 pre-existing advisory (GHSA-aaaa-bbbb-cccc, high, devDependencies) — not this
  update's fault, unchanged throughout

Nothing was committed or pushed. The changes are in the working tree; committing the patch and
minor sets separately keeps them individually revertable.
```
