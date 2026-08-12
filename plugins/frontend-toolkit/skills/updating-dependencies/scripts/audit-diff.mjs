// Snapshots and diffs npm audit advisories so a dependency update is judged only on the
// advisories it introduces, not on the whole tree's pre-existing baseline.
//
// Used by the updating-dependencies skill: `snapshot` runs before any package changes and records
// the advisories present at HEAD; `diff` runs after the approved bumps are applied and classifies
// the current advisories against that baseline. Only `new` advisories are the update's fault.
//
//   node <skill-dir>/scripts/audit-diff.mjs snapshot [baseline.json]
//   node <skill-dir>/scripts/audit-diff.mjs diff [baseline.json]
//
// `diff` prints { baseline, new, resolved, preExisting } as JSON and exits 1 when `new` is
// non-empty, 0 otherwise. All three lists carry the same advisory shape — id, severity, title,
// package — so a report can name the severity of a pre-existing or resolved advisory without a
// second `npm audit` call. The baseline defaults to a path in the OS temp dir keyed to the
// repository root, so the two invocations find each other from any directory inside the repo while
// concurrent runs in different worktrees stay isolated.
//
// Both modes audit the WHOLE tree, devDependencies included — deliberately wider than a
// production-only audit. An upgrade changes what runs at build time, so a build-time advisory the
// update pulls in is the update's fault and has to surface, even when the affected package never
// ships to the site.
//
// Exit 2 always means the run cannot attribute advisories at all: `npm audit` itself failed, or the
// baseline is missing, unreadable, malformed, or stale. Exit 2 never means "advisories found".
//
// `diff` echoes the baseline's provenance — the commit it was taken at and when — so a report can
// never present an earlier run's baseline as this run's.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const AUDIT_ARGS = ['audit', '--package-lock-only', '--json'];

// A dependency update runs to completion within one session. A baseline older than a day was left
// behind by an earlier run, and diffing against it would blame this update for that run's
// advisories, so `diff` refuses it rather than reporting a confident wrong attribution.
const MAX_BASELINE_AGE_MS = 24 * 60 * 60 * 1000;

function fail(message) {
    console.error(message);
    process.exit(2);
}

// The commit is provenance for the report rather than a precondition for the diff, so a repo with
// no git history still gets a usable baseline and records the missing commit instead of throwing.
function gitInfo() {
    const read = (args) => {
        try {
            return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        } catch {
            return null;
        }
    };
    return { head: read(['rev-parse', 'HEAD']), root: read(['rev-parse', '--show-toplevel']) };
}

const { head, root } = gitInfo();

// Key the baseline to the repository rather than to the working directory, so that `snapshot` and
// `diff` agree on one baseline file even when they run from different directories inside the repo.
const repoKey = createHash('sha256')
    .update(root ?? process.cwd())
    .digest('hex')
    .slice(0, 12);

const [mode, baselinePath = join(tmpdir(), `npm-audit-baseline-${repoKey}.json`)] = process.argv.slice(2);

function currentAdvisories() {
    let out;
    try {
        out = execFileSync('npm', AUDIT_ARGS, { encoding: 'utf8' });
    } catch (error) {
        // npm audit exits non-zero when advisories exist; the JSON is still on stdout.
        out = error.stdout;
        if (!out) {
            fail(`npm audit produced no output, so advisories cannot be attributed: ${error.message}`);
        }
    }
    let report;
    try {
        report = JSON.parse(out);
    } catch {
        fail(
            `npm audit did not return JSON, so advisories cannot be attributed. Its output began: ${out.slice(0, 200)}`
        );
    }
    // A failed audit — an absent lockfile, an unreachable registry — still prints JSON, but with an
    // `error` object and no `vulnerabilities` key. Reading that as an empty advisory set would
    // record a baseline of zero and make every later diff report a clean tree, so a missing
    // `vulnerabilities` key is a tooling failure rather than a clean result.
    if (typeof report?.vulnerabilities !== 'object' || report.vulnerabilities === null) {
        const detail =
            report?.error?.summary ?? report?.error?.detail ?? JSON.stringify(report?.error ?? report).slice(0, 200);
        fail(`npm audit failed, so advisories cannot be attributed: ${detail}`);
    }
    const advisories = new Map();
    for (const [pkg, vuln] of Object.entries(report.vulnerabilities)) {
        for (const via of vuln.via ?? []) {
            if (typeof via !== 'object' || !via.url) {
                continue;
            }
            const id = String(via.url).split('/').pop();
            advisories.set(id, { id, severity: via.severity, title: via.title, package: pkg });
        }
    }
    return advisories;
}

const byId = (a, b) => a.id.localeCompare(b.id);

if (mode === 'snapshot') {
    const advisories = [...currentAdvisories().values()].sort(byId);
    const baseline = { head, takenAt: new Date().toISOString(), advisories };
    writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 4)}\n`);
    console.log(
        `Baseline: ${advisories.length} advisories at ${head ? head.slice(0, 12) : 'no commit'} -> ${baselinePath}`
    );
} else if (mode === 'diff') {
    let baseline;
    try {
        baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
    } catch (error) {
        // Absent, unreadable, and unparseable all mean one thing to the caller: no usable baseline
        // exists, and the fix is to take one before any package changes.
        fail(`Baseline at ${baselinePath} could not be read (${error.message}) — run \`snapshot\` first (Step 1).`);
    }
    const takenAtMs = Date.parse(baseline?.takenAt ?? '');
    if (!Array.isArray(baseline?.advisories) || !Number.isFinite(takenAtMs)) {
        fail(`Baseline at ${baselinePath} is not in the current format — run \`snapshot\` again (Step 1).`);
    }
    const ageMs = Date.now() - takenAtMs;
    if (ageMs > MAX_BASELINE_AGE_MS) {
        const ageHours = Math.round(ageMs / (60 * 60 * 1000));
        fail(
            `Baseline at ${baselinePath} was taken ${ageHours}h ago (${baseline.takenAt}) and belongs to an earlier run — run \`snapshot\` again (Step 1).`
        );
    }
    const baselineIds = new Set(baseline.advisories.map((advisory) => advisory.id));
    const current = currentAdvisories();
    const added = [...current.values()].filter((advisory) => !baselineIds.has(advisory.id)).sort(byId);
    const resolved = baseline.advisories.filter((advisory) => !current.has(advisory.id)).sort(byId);
    const preExisting = [...current.values()].filter((advisory) => baselineIds.has(advisory.id)).sort(byId);
    const provenance = { head: baseline.head, takenAt: baseline.takenAt };
    console.log(JSON.stringify({ baseline: provenance, new: added, resolved, preExisting }, null, 4));
    process.exit(added.length > 0 ? 1 : 0);
} else {
    console.error('Usage: node audit-diff.mjs <snapshot|diff> [baseline.json]');
    process.exit(2);
}
