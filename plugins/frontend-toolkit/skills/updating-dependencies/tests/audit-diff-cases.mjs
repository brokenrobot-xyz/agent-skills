#!/usr/bin/env node
// Test suite for the bundled audit differ (scripts/audit-diff.mjs). Fully self-contained: every case
// runs in its own synthetic repo under a temp dir with a stubbed `npm` on PATH, never against the
// host repository and never against the real registry, so the suite is hermetic and runs offline.
// Node only — the same runtime the script itself requires.
//
// `git` is the real thing rather than a stub, because the script asks it three different questions
// and a synthetic repo answers all three faithfully for the cost of an `init` and one commit. The
// child's TMPDIR points inside the case workspace, so a run that takes the default baseline path
// still writes nothing outside the temp tree.
//
// Two properties carry most of the weight here. First, the attribution: `new` is the only list that
// counts against an update, so an advisory sorted into the wrong list either blames the update for
// the tree's pre-existing debt or hides a vulnerability the update introduced. Second, the refusals:
// every way of failing to attribute has to exit 2, because a diff that cannot trust its baseline and
// reports anyway hands the user a clean bill of health nobody checked.

import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = dirname(dirname(fileURLToPath(import.meta.url)));
const AUDIT_DIFF = join(skillDir, 'scripts', 'audit-diff.mjs');

const tmp = mkdtempSync(join(tmpdir(), 'audit-diff-tests-'));
process.on('exit', () => rmSync(tmp, { recursive: true, force: true }));

let pass = 0;
let fail = 0;
let caseId = 0;

function ok(label) {
    pass += 1;
    console.log(`ok   ${label}`);
}

function bad(label, detail) {
    fail += 1;
    console.log(`FAIL ${label}\n     ${detail}`);
}

// --- Fixtures ------------------------------------------------------------------------------------

// One `npm audit --json` report. Entries sharing a package name collapse into that package's `via`
// array, which is how npm reports a package carrying several advisories.
function auditReport(entries) {
    const vulnerabilities = {};
    for (const { package: pkg, id, severity = 'high', title = `Advisory ${id}`, via } of entries) {
        vulnerabilities[pkg] ??= {
            name: pkg,
            severity,
            via: [],
            effects: [],
            range: '*',
            nodes: [],
            fixAvailable: true
        };
        // A string in `via` is npm's way of saying "through this other package"; only the objects
        // carry an advisory. Both shapes appear in one report, so both are exercised here.
        vulnerabilities[pkg].via.push(
            via ?? { source: 1, name: pkg, title, url: `https://github.com/advisories/${id}`, severity, range: '*' }
        );
    }
    return `${JSON.stringify({ auditReportVersion: 2, vulnerabilities, metadata: {} })}\n`;
}

const baselineFile = (advisories, { head = 'deadbeefcafe1234', takenAt = new Date().toISOString() } = {}) =>
    `${JSON.stringify({ head, takenAt, advisories }, null, 4)}\n`;

const advisory = (id, pkg, severity = 'high') => ({ id, severity, title: `Advisory ${id}`, package: pkg });

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

// Each case gets its own workspace holding a real single-commit repo, so a stubbed npm, a manifest,
// a baseline, and a git state never leak between cases. `dirty` edits package.json after the commit,
// which is the state the snapshot guard turns on.
function workspace({ repo = true, dirty = false, baseline, baselineName = 'baseline.json' } = {}) {
    const ws = join(tmp, `case-${(caseId += 1)}`);
    mkdirSync(join(ws, 'bin'), { recursive: true });
    mkdirSync(join(ws, 'tmp'), { recursive: true });
    writeFileSync(join(ws, 'package.json'), `${JSON.stringify({ name: 'fixture', version: '1.0.0' }, null, 2)}\n`);
    writeFileSync(
        join(ws, 'package-lock.json'),
        `${JSON.stringify({ name: 'fixture', lockfileVersion: 3 }, null, 2)}\n`
    );
    if (repo) {
        const git = (...args) => execFileSync('git', args, { cwd: ws, stdio: 'ignore' });
        git('init', '-q', '--initial-branch=main');
        git('add', '.');
        // Inline identity and no signing, so the suite does not depend on — or trip over — whatever
        // the host machine has configured globally.
        git(
            '-c',
            'user.email=t@example.com',
            '-c',
            'user.name=T',
            '-c',
            'commit.gpgsign=false',
            'commit',
            '-qm',
            'init'
        );
    }
    if (dirty) {
        writeFileSync(join(ws, 'package.json'), `${JSON.stringify({ name: 'fixture', version: '1.0.1' }, null, 2)}\n`);
    }
    if (baseline !== undefined) {
        writeFileSync(join(ws, baselineName), baseline);
    }
    return ws;
}

// `code` is npm's exit status: `npm audit` exits non-zero whenever the tree carries advisories,
// which is the ordinary case, so most fixtures below hand over their report at exit 1.
function run(ws, args, { stdout = '', stderr = '', code = 0, repo = true } = {}) {
    const bin = join(ws, 'bin');
    writeFileSync(join(bin, 'stdout.txt'), stdout);
    writeFileSync(join(bin, 'stderr.txt'), stderr);
    writeFileSync(join(bin, 'npm'), `#!/bin/sh\ncat "${bin}/stdout.txt"\ncat "${bin}/stderr.txt" >&2\nexit ${code}\n`);
    chmodSync(join(bin, 'npm'), 0o755);
    writeFileSync(
        join(bin, 'npm.cmd'),
        `@echo off\r\ntype "${bin}\\stdout.txt"\r\ntype "${bin}\\stderr.txt" 1>&2\r\nexit /b ${code}\r\n`
    );
    const env = { ...process.env, PATH: bin + delimiter + process.env.PATH, TMPDIR: join(ws, 'tmp') };
    env.TEMP = env.TMPDIR;
    env.TMP = env.TMPDIR;
    // Keep git from discovering a repository above the temp tree when a case is meant to run outside
    // one — otherwise the answer depends on where the OS put the temp directory.
    if (!repo) env.GIT_CEILING_DIRECTORIES = tmp;
    const res = spawnSync(process.execPath, [AUDIT_DIFF, ...args], { cwd: ws, env, encoding: 'utf8' });
    return { status: res.status, stdout: res.stdout ?? '', stderr: res.stderr ?? '', ws };
}

// --- Assertions ----------------------------------------------------------------------------------

const ids = (list) => list.map((entry) => entry.id).join(',');

// The cases below that read into a payload do it inside this wrapper, so a shape the script was not
// supposed to produce reports a failure instead of throwing. A suite that dies mid-run prints no
// summary at all, and a truncated log reads like a pass to anyone skimming it.
function guard(label, body) {
    try {
        body();
    } catch (error) {
        bad(label, `threw instead of reporting a failure: ${error.message}`);
    }
}

// Asserts the diff attributed every advisory to the right list and exited 1 exactly when `new` is
// non-empty — the exit code is what a caller reads before the JSON.
function expectDiff(label, fixture, expected) {
    const ws = workspace({ ...fixture, baseline: fixture.baseline });
    const res = run(ws, ['diff', join(ws, 'baseline.json')], fixture.audit);
    const wanted = expected.new.length > 0 ? 1 : 0;
    if (res.status !== wanted) {
        return bad(label, `expected exit ${wanted}, got ${res.status}: ${res.stderr.trim().slice(0, 200)}`);
    }
    let out;
    try {
        out = JSON.parse(res.stdout);
    } catch {
        return bad(label, `stdout was not JSON: ${res.stdout.slice(0, 160)}`);
    }
    for (const key of ['new', 'resolved', 'preExisting']) {
        if (ids(out[key]) !== expected[key].join(',')) {
            return bad(label, `${key}: expected [${expected[key].join(',')}], got [${ids(out[key])}]`);
        }
    }
    ok(label);
}

// Asserts the run refused with exit 2 and named the reason on stderr, rather than reporting an
// attribution it could not stand behind.
function expectRefusal(label, args, fixture, fragment) {
    const ws = workspace(fixture);
    const res = run(ws, typeof args === 'function' ? args(ws) : args, { ...fixture.audit, repo: fixture.repo });
    if (res.status !== 2) {
        return bad(label, `expected exit 2, got ${res.status} with stdout: ${res.stdout.trim().slice(0, 200)}`);
    }
    if (!res.stderr.includes(fragment)) {
        return bad(label, `expected stderr to name "${fragment}", got: ${res.stderr.trim().slice(0, 200)}`);
    }
    ok(label);
}

// --- Attribution: which list an advisory lands in ------------------------------------------------

expectDiff(
    'an advisory absent from the baseline is new — the only list that counts against the update',
    {
        baseline: baselineFile([advisory('GHSA-aaaa-aaaa-aaaa', 'astro')]),
        audit: {
            code: 1,
            stdout: auditReport([
                { package: 'astro', id: 'GHSA-aaaa-aaaa-aaaa' },
                { package: 'rollup', id: 'GHSA-dddd-eeee-ffff' }
            ])
        }
    },
    { new: ['GHSA-dddd-eeee-ffff'], resolved: [], preExisting: ['GHSA-aaaa-aaaa-aaaa'] }
);

expectDiff(
    'an advisory the update cleared is resolved, and clears the exit code with it',
    {
        baseline: baselineFile([advisory('GHSA-aaaa-aaaa-aaaa', 'astro'), advisory('GHSA-bbbb-bbbb-bbbb', 'vite')]),
        audit: { code: 1, stdout: auditReport([{ package: 'astro', id: 'GHSA-aaaa-aaaa-aaaa' }]) }
    },
    { new: [], resolved: ['GHSA-bbbb-bbbb-bbbb'], preExisting: ['GHSA-aaaa-aaaa-aaaa'] }
);

expectDiff(
    'an advisory in both the baseline and the tree is pre-existing, never the update’s fault',
    {
        baseline: baselineFile([advisory('GHSA-aaaa-aaaa-aaaa', 'esbuild')]),
        audit: { code: 1, stdout: auditReport([{ package: 'esbuild', id: 'GHSA-aaaa-aaaa-aaaa' }]) }
    },
    { new: [], resolved: [], preExisting: ['GHSA-aaaa-aaaa-aaaa'] }
);

expectDiff(
    'a clean tree against a clean baseline is three empty lists at exit 0',
    { baseline: baselineFile([]), audit: { code: 0, stdout: auditReport([]) } },
    { new: [], resolved: [], preExisting: [] }
);

expectDiff(
    'a tree that went from advisories to none reports them all resolved',
    {
        baseline: baselineFile([advisory('GHSA-aaaa-aaaa-aaaa', 'astro'), advisory('GHSA-bbbb-bbbb-bbbb', 'vite')]),
        audit: { code: 0, stdout: auditReport([]) }
    },
    { new: [], resolved: ['GHSA-aaaa-aaaa-aaaa', 'GHSA-bbbb-bbbb-bbbb'], preExisting: [] }
);

expectDiff(
    'every list is sorted by advisory id, so a report reads the same on every run',
    {
        baseline: baselineFile([]),
        audit: {
            code: 1,
            stdout: auditReport([
                { package: 'zlib-pkg', id: 'GHSA-zzzz-zzzz-zzzz' },
                { package: 'a-pkg', id: 'GHSA-aaaa-aaaa-aaaa' },
                { package: 'm-pkg', id: 'GHSA-mmmm-mmmm-mmmm' }
            ])
        }
    },
    { new: ['GHSA-aaaa-aaaa-aaaa', 'GHSA-mmmm-mmmm-mmmm', 'GHSA-zzzz-zzzz-zzzz'], resolved: [], preExisting: [] }
);

expectDiff(
    'a string entry in `via` is a path to another package, not an advisory, and is skipped',
    {
        baseline: baselineFile([]),
        audit: {
            code: 1,
            stdout: auditReport([
                { package: 'vite', via: 'rollup' },
                { package: 'rollup', id: 'GHSA-dddd-eeee-ffff' }
            ])
        }
    },
    { new: ['GHSA-dddd-eeee-ffff'], resolved: [], preExisting: [] }
);

// The other half of the same guard. An entry with no `url` carries no advisory id, so admitting it
// would put an `undefined` id into `new` and fail an update over an advisory that does not exist.
expectDiff(
    'an object in `via` with no advisory url is skipped too',
    {
        baseline: baselineFile([]),
        audit: {
            code: 1,
            stdout: auditReport([
                { package: 'vite', via: { name: 'vite', dependency: 'rollup', range: '*' } },
                { package: 'rollup', id: 'GHSA-dddd-eeee-ffff' }
            ])
        }
    },
    { new: ['GHSA-dddd-eeee-ffff'], resolved: [], preExisting: [] }
);

expectDiff(
    'several advisories on one package all surface — a package is not one row',
    {
        baseline: baselineFile([]),
        audit: {
            code: 1,
            stdout: auditReport([
                { package: 'vite', id: 'GHSA-aaaa-aaaa-aaaa' },
                { package: 'vite', id: 'GHSA-bbbb-bbbb-bbbb' }
            ])
        }
    },
    { new: ['GHSA-aaaa-aaaa-aaaa', 'GHSA-bbbb-bbbb-bbbb'], resolved: [], preExisting: [] }
);

// npm audit exits non-zero whenever the tree carries advisories. Reading that as a failure would
// make the ordinary case unattributable, so the script has to take the JSON off the failed call.
expectDiff(
    'npm exiting non-zero because advisories exist is the ordinary case, not a tooling failure',
    {
        baseline: baselineFile([]),
        audit: { code: 1, stdout: auditReport([{ package: 'rollup', id: 'GHSA-dddd-eeee-ffff' }]) }
    },
    { new: ['GHSA-dddd-eeee-ffff'], resolved: [], preExisting: [] }
);

// The same advisory reaching through two packages is one advisory. Counting it twice would inflate
// `new` and blame the update for a second regression that does not exist.
{
    const label = 'one advisory reached through two packages is counted once';
    guard(label, () => {
        const ws = workspace({ baseline: baselineFile([]) });
        const res = run(ws, ['diff', join(ws, 'baseline.json')], {
            code: 1,
            stdout: auditReport([
                { package: 'vite', id: 'GHSA-dddd-eeee-ffff' },
                { package: 'rollup', id: 'GHSA-dddd-eeee-ffff' }
            ])
        });
        const out = JSON.parse(res.stdout);
        out.new.length === 1 && out.new[0]?.id === 'GHSA-dddd-eeee-ffff'
            ? ok(label)
            : bad(label, `expected a single GHSA-dddd-eeee-ffff, got [${ids(out.new)}]`);
    });
}

// --- What each list carries ----------------------------------------------------------------------

// The report names the severity and the package of a pre-existing or resolved advisory, and the
// skill is told to take those details from here rather than from a second `npm audit`.
{
    const label = 'each advisory carries id, severity, title, and the package it reaches through';
    guard(label, () => {
        const ws = workspace({ baseline: baselineFile([]) });
        const res = run(ws, ['diff', join(ws, 'baseline.json')], {
            code: 1,
            stdout: auditReport([{ package: 'rollup', id: 'GHSA-dddd-eeee-ffff', severity: 'moderate' }])
        });
        const entry = JSON.parse(res.stdout).new[0] ?? {};
        const actual = `${entry.id} ${entry.severity} ${entry.title} ${entry.package}`;
        const expected = 'GHSA-dddd-eeee-ffff moderate Advisory GHSA-dddd-eeee-ffff rollup';
        actual === expected ? ok(label) : bad(label, `expected "${expected}", got "${actual}"`);
    });
}

// Provenance comes off the baseline file, never off the current HEAD. A diff that recomputed it
// could present an earlier run's baseline as this run's.
{
    const label = 'the diff echoes the baseline’s own commit and timestamp, not the current HEAD';
    guard(label, () => {
        const takenAt = hoursAgo(2);
        const ws = workspace({ baseline: baselineFile([], { head: 'deadbeefcafe1234', takenAt }) });
        const res = run(ws, ['diff', join(ws, 'baseline.json')], { code: 0, stdout: auditReport([]) });
        const { baseline } = JSON.parse(res.stdout);
        baseline.head === 'deadbeefcafe1234' && baseline.takenAt === takenAt
            ? ok(label)
            : bad(label, `expected deadbeefcafe1234/${takenAt}, got ${baseline.head}/${baseline.takenAt}`);
    });
}

// --- Refusals: an attribution the run cannot stand behind exits 2 --------------------------------

expectRefusal(
    'a missing baseline is a refusal — the fix is to snapshot before any package changes',
    (ws) => ['diff', join(ws, 'nonexistent.json')],
    {},
    'could not be read'
);

expectRefusal('an unreadable baseline is a refusal', (ws) => ['diff', join(ws, 'bin')], {}, 'could not be read');

expectRefusal(
    'a baseline that is not JSON is a refusal',
    (ws) => ['diff', join(ws, 'baseline.json')],
    { baseline: 'this is not JSON at all\n' },
    'could not be read'
);

// The pre-plugin shape. It parses, so only a shape check catches it.
expectRefusal(
    'a bare-array baseline is a refusal, not an empty advisory set',
    (ws) => ['diff', join(ws, 'baseline.json')],
    { baseline: '["GHSA-aaaa-aaaa-aaaa"]\n' },
    'not in the current format'
);

// The superseded ids-only shape: right envelope, no `advisories` array.
expectRefusal(
    'an ids-only baseline is a refusal',
    (ws) => ['diff', join(ws, 'baseline.json')],
    { baseline: `${JSON.stringify({ head: 'deadbeef', takenAt: hoursAgo(1), ids: [] })}\n` },
    'not in the current format'
);

expectRefusal(
    'a baseline with no timestamp is a refusal — its age cannot be judged',
    (ws) => ['diff', join(ws, 'baseline.json')],
    { baseline: `${JSON.stringify({ head: 'deadbeef', advisories: [] })}\n` },
    'not in the current format'
);

expectRefusal(
    'a baseline with an unparseable timestamp is a refusal',
    (ws) => ['diff', join(ws, 'baseline.json')],
    { baseline: `${JSON.stringify({ head: 'deadbeef', takenAt: 'sometime yesterday', advisories: [] })}\n` },
    'not in the current format'
);

// A baseline left behind by an earlier run would blame this update for that run's advisories.
expectRefusal(
    'a baseline older than a day belongs to an earlier run and is refused',
    (ws) => ['diff', join(ws, 'baseline.json')],
    { baseline: baselineFile([], { takenAt: hoursAgo(30) }) },
    'belongs to an earlier run'
);

expectRefusal(
    'npm audit failing outright is a refusal, never a clean tree',
    (ws) => ['diff', join(ws, 'baseline.json')],
    {
        baseline: baselineFile([]),
        audit: { code: 1, stdout: `${JSON.stringify({ error: { summary: 'ENOTFOUND registry.npmjs.org' } })}\n` }
    },
    'npm audit failed'
);

expectRefusal(
    'npm audit failing reports npm’s own reason',
    (ws) => ['diff', join(ws, 'baseline.json')],
    {
        baseline: baselineFile([]),
        audit: { code: 1, stdout: `${JSON.stringify({ error: { summary: 'ENOTFOUND registry.npmjs.org' } })}\n` }
    },
    'ENOTFOUND'
);

expectRefusal(
    'npm audit returning non-JSON is a refusal',
    (ws) => ['diff', join(ws, 'baseline.json')],
    { baseline: baselineFile([]), audit: { code: 0, stdout: 'npm is doing something else entirely\n' } },
    'did not return JSON'
);

expectRefusal(
    'npm audit producing no output at all is a refusal',
    (ws) => ['diff', join(ws, 'baseline.json')],
    { baseline: baselineFile([]), audit: { code: 1, stdout: '' } },
    'produced no output'
);

expectRefusal('an unknown mode is a usage error', ['sniff'], {}, 'Usage:');

expectRefusal('no mode at all is a usage error', [], {}, 'Usage:');

// --- The age bound is a bound, not a ban ---------------------------------------------------------

expectDiff(
    'a baseline from earlier in the same run is accepted — the bound refuses yesterday, not an hour ago',
    {
        baseline: baselineFile([advisory('GHSA-aaaa-aaaa-aaaa', 'astro')], { takenAt: hoursAgo(23) }),
        audit: { code: 1, stdout: auditReport([{ package: 'astro', id: 'GHSA-aaaa-aaaa-aaaa' }]) }
    },
    { new: [], resolved: [], preExisting: ['GHSA-aaaa-aaaa-aaaa'] }
);

// --- Snapshot ------------------------------------------------------------------------------------

{
    const label = 'snapshot records the advisories, the commit, and the time';
    guard(label, () => {
        const ws = workspace();
        const res = run(ws, ['snapshot', join(ws, 'baseline.json')], {
            code: 1,
            stdout: auditReport([{ package: 'esbuild', id: 'GHSA-aaaa-aaaa-aaaa', severity: 'high' }])
        });
        if (res.status !== 0) {
            return bad(label, `expected exit 0, got ${res.status}: ${res.stderr.trim().slice(0, 200)}`);
        }
        const written = JSON.parse(readFileSync(join(ws, 'baseline.json'), 'utf8'));
        const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ws, encoding: 'utf8' }).trim();
        const shaped =
            written.head === head &&
            Number.isFinite(Date.parse(written.takenAt)) &&
            ids(written.advisories) === 'GHSA-aaaa-aaaa-aaaa' &&
            written.advisories[0]?.package === 'esbuild';
        shaped ? ok(label) : bad(label, `unexpected baseline: ${JSON.stringify(written)}`);
    });
}

{
    const label = 'snapshot reports the count it recorded, so a zero baseline is visible on sight';
    const ws = workspace();
    const res = run(ws, ['snapshot', join(ws, 'baseline.json')], {
        code: 1,
        stdout: auditReport([
            { package: 'esbuild', id: 'GHSA-aaaa-aaaa-aaaa' },
            { package: 'rollup', id: 'GHSA-bbbb-bbbb-bbbb' }
        ])
    });
    res.stdout.includes('Baseline: 2 advisories')
        ? ok(label)
        : bad(label, `expected "Baseline: 2 advisories", got: ${res.stdout.trim()}`);
}

// The guard that keeps an install's own advisories out of the baseline. A baseline taken after an
// install already contains them, so every later diff would report them as pre-existing.
expectRefusal(
    're-snapshotting over a live baseline after the manifest changed is refused',
    (ws) => ['snapshot', join(ws, 'baseline.json')],
    { dirty: true, baseline: baselineFile([], { takenAt: hoursAgo(1) }), audit: { code: 0, stdout: auditReport([]) } },
    'has changed since the baseline'
);

// The three neighbours of that guard: each is missing one of its two conditions, and each must be
// allowed, or a legitimate first snapshot would be blocked.
{
    const cases = [
        {
            label: 'a live baseline over a clean manifest re-snapshots freely — nothing has been installed yet',
            fixture: { dirty: false, baseline: baselineFile([], { takenAt: hoursAgo(1) }) }
        },
        {
            label: 'a dirty manifest with no baseline still snapshots — the user edited before the run started',
            fixture: { dirty: true }
        },
        {
            label: 'a dirty manifest with a stale baseline still snapshots — that baseline is an earlier run’s',
            fixture: { dirty: true, baseline: baselineFile([], { takenAt: hoursAgo(30) }) }
        }
    ];
    for (const { label, fixture } of cases) {
        const ws = workspace(fixture);
        const res = run(ws, ['snapshot', join(ws, 'baseline.json')], { code: 0, stdout: auditReport([]) });
        res.status === 0
            ? ok(label)
            : bad(label, `expected exit 0, got ${res.status}: ${res.stderr.trim().slice(0, 200)}`);
    }
}

expectRefusal(
    'npm audit failing during snapshot writes no baseline — a zero baseline would clear every later diff',
    (ws) => ['snapshot', join(ws, 'baseline.json')],
    { audit: { code: 1, stdout: `${JSON.stringify({ error: { summary: 'ENOLOCK no lockfile' } })}\n` } },
    'npm audit failed'
);

// Provenance is for the report, not a precondition, so a tree with no git history still gets a
// usable baseline instead of an exception.
{
    const label = 'outside a git repository the baseline still records, with no commit';
    guard(label, () => {
        const ws = workspace({ repo: false });
        const res = run(ws, ['snapshot', join(ws, 'baseline.json')], { code: 0, stdout: auditReport([]), repo: false });
        if (res.status !== 0) {
            return bad(label, `expected exit 0, got ${res.status}: ${res.stderr.trim().slice(0, 200)}`);
        }
        const written = JSON.parse(readFileSync(join(ws, 'baseline.json'), 'utf8'));
        written.head === null && res.stdout.includes('no commit')
            ? ok(label)
            : bad(label, `expected a null head and "no commit", got ${JSON.stringify(written.head)}`);
    });
}

// --- Round trip on the default path --------------------------------------------------------------

// The two invocations run from the repo root here, but the baseline path is keyed to the repository
// rather than the working directory precisely so they still meet when they are not.
{
    const label = 'snapshot and diff find each other on the default baseline path, from different directories';
    guard(label, () => {
        const ws = workspace();
        mkdirSync(join(ws, 'packages', 'web'), { recursive: true });
        const report = auditReport([{ package: 'esbuild', id: 'GHSA-aaaa-aaaa-aaaa' }]);
        const snapped = run(ws, ['snapshot'], { code: 1, stdout: report });
        if (snapped.status !== 0) {
            return bad(label, `snapshot failed: ${snapped.stderr.trim().slice(0, 200)}`);
        }
        // Re-run the diff from a subdirectory: same repository, different cwd.
        const bin = join(ws, 'bin');
        const env = { ...process.env, PATH: bin + delimiter + process.env.PATH, TMPDIR: join(ws, 'tmp') };
        env.TEMP = env.TMPDIR;
        env.TMP = env.TMPDIR;
        const res = spawnSync(process.execPath, [AUDIT_DIFF, 'diff'], {
            cwd: join(ws, 'packages', 'web'),
            env,
            encoding: 'utf8'
        });
        if (res.status !== 0) {
            return bad(label, `diff did not find the baseline: ${(res.stderr ?? '').trim().slice(0, 200)}`);
        }
        const out = JSON.parse(res.stdout);
        ids(out.preExisting) === 'GHSA-aaaa-aaaa-aaaa' && out.new.length === 0
            ? ok(label)
            : bad(label, `expected the snapshotted advisory as pre-existing, got ${JSON.stringify(out)}`);
    });
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail === 0 ? 0 : 1;
