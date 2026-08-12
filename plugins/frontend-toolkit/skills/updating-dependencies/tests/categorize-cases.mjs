#!/usr/bin/env node
// Test suite for the bundled categorizer (scripts/categorize.mjs). Fully self-contained: every case
// runs in its own synthetic repo under a temp dir with a stubbed `npm` on PATH, never against the
// host repository and never against the real registry, so the suite is hermetic and runs offline.
// Node only — the same runtime the script itself requires.
//
// The stub is written as both `npm` and `npm.cmd` so it resolves the way the real npm does on
// whichever platform runs the suite.
//
// Two properties carry most of the weight here. First, the categories: every bucket the workflow
// presents to the user comes from this script, and a 0.x bump reported as a patch is a breaking
// change presented as the safe option. Second, the refusals: every way of failing to compute the
// categories has to exit 2, because an empty list at exit 0 is indistinguishable from "everything is
// current" and would tell the user the tree is up to date when nothing was checked.

import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const skillDir = dirname(dirname(fileURLToPath(import.meta.url)));
const CATEGORIZE = join(skillDir, 'scripts', 'categorize.mjs');

const tmp = mkdtempSync(join(tmpdir(), 'categorize-tests-'));
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

// Each case gets its own workspace, so a stubbed npm, a manifest, and a working directory never leak
// between cases. `code` is npm's exit status: it exits 1 whenever anything is outdated, which is the
// ordinary case, so the tests use 1 wherever they hand over a populated table.
function run({ manifest, stdout = '', stderr = '', code = 0, noManifest = false }) {
    const ws = join(tmp, `case-${(caseId += 1)}`);
    const bin = join(ws, 'bin');
    mkdirSync(bin, { recursive: true });
    if (!noManifest) {
        writeFileSync(join(ws, 'package.json'), `${JSON.stringify(manifest ?? {}, null, 2)}\n`);
    }
    writeFileSync(join(bin, 'stdout.txt'), stdout);
    writeFileSync(join(bin, 'stderr.txt'), stderr);
    writeFileSync(join(bin, 'npm'), `#!/bin/sh\ncat "${bin}/stdout.txt"\ncat "${bin}/stderr.txt" >&2\nexit ${code}\n`);
    chmodSync(join(bin, 'npm'), 0o755);
    writeFileSync(
        join(bin, 'npm.cmd'),
        `@echo off\r\ntype "${bin}\\stdout.txt"\r\ntype "${bin}\\stderr.txt" 1>&2\r\nexit /b ${code}\r\n`
    );
    const res = spawnSync(process.execPath, [CATEGORIZE], {
        cwd: ws,
        env: { ...process.env, PATH: bin + delimiter + process.env.PATH },
        encoding: 'utf8'
    });
    return { status: res.status, stdout: res.stdout ?? '', stderr: res.stderr ?? '' };
}

// Asserts the run succeeded and emitted exactly these rows, in this order — the order matters
// because Step 3 presents the table as-is, and the riskiest bumps belong at the top.
function expectRows(label, fixture, expected) {
    const res = run(fixture);
    if (res.status !== 0) {
        return bad(label, `expected exit 0, got ${res.status}: ${res.stderr.trim()}`);
    }
    let rows;
    try {
        rows = JSON.parse(res.stdout).outdated;
    } catch {
        return bad(label, `stdout was not JSON: ${res.stdout.slice(0, 160)}`);
    }
    const actual = rows.map((r) => `${r.package} ${r.current}->${r.latest} ${r.category} ${r.depType} '${r.prefix}'`);
    if (actual.join(' | ') !== expected.join(' | ')) {
        return bad(label, `expected [${expected.join(' | ')}]\n     got      [${actual.join(' | ')}]`);
    }
    ok(label);
}

// Asserts the run refused with exit 2 and named the reason on stderr, rather than exiting 0 with a
// list the caller would read as the whole truth.
function expectRefusal(label, fixture, fragment) {
    const res = run(fixture);
    if (res.status !== 2) {
        return bad(label, `expected exit 2, got ${res.status} with stdout: ${res.stdout.trim().slice(0, 160)}`);
    }
    if (!res.stderr.includes(fragment)) {
        return bad(label, `expected stderr to name "${fragment}", got: ${res.stderr.trim()}`);
    }
    ok(label);
}

const table = (entries) => JSON.stringify(entries);

// --- The buckets, and the order the table is presented in ----------------------------------------

expectRows(
    'full table: major first, then minor, then patch, alphabetical within each',
    {
        manifest: {
            dependencies: { astro: '7.1.3', tiny: '^0.4.1', keep: '~2.3.0' },
            devDependencies: { prettier: '3.9.6', eslint: '8.57.0' }
        },
        code: 1,
        stdout: table({
            prettier: { current: '3.9.6', latest: '3.9.7' },
            eslint: { current: '8.57.0', latest: '9.42.0' },
            astro: { current: '7.1.3', latest: '7.4.0' },
            tiny: { current: '0.4.1', latest: '0.4.2' },
            keep: { current: '2.3.0', latest: '2.3.4' }
        })
    },
    [
        "eslint 8.57.0->9.42.0 major devDependencies ''",
        "astro 7.1.3->7.4.0 minor dependencies ''",
        "tiny 0.4.1->0.4.2 minor dependencies '^'",
        "keep 2.3.0->2.3.4 patch dependencies '~'",
        "prettier 3.9.6->3.9.7 patch devDependencies ''"
    ]
);

expectRows(
    'patch: only the patch digit moves',
    {
        manifest: { dependencies: { a: '1.2.3' } },
        code: 1,
        stdout: table({ a: { current: '1.2.3', latest: '1.2.9' } })
    },
    ["a 1.2.3->1.2.9 patch dependencies ''"]
);

expectRows(
    'minor: the minor digit moves',
    {
        manifest: { dependencies: { a: '1.2.3' } },
        code: 1,
        stdout: table({ a: { current: '1.2.3', latest: '1.5.0' } })
    },
    ["a 1.2.3->1.5.0 minor dependencies ''"]
);

expectRows(
    'major: the major digit moves',
    {
        manifest: { dependencies: { a: '1.2.3' } },
        code: 1,
        stdout: table({ a: { current: '1.2.3', latest: '2.0.0' } })
    },
    ["a 1.2.3->2.0.0 major dependencies ''"]
);

// The rule that earns the script: npm's own semver would call this a patch.
expectRows(
    '0.x floor: a moving patch digit is reported as minor, never as a safe patch',
    {
        manifest: { dependencies: { a: '0.4.1' } },
        code: 1,
        stdout: table({ a: { current: '0.4.1', latest: '0.4.2' } })
    },
    ["a 0.4.1->0.4.2 minor dependencies ''"]
);

expectRows(
    '0.x floor: a moving minor digit is still minor',
    {
        manifest: { dependencies: { a: '0.4.1' } },
        code: 1,
        stdout: table({ a: { current: '0.4.1', latest: '0.9.0' } })
    },
    ["a 0.4.1->0.9.0 minor dependencies ''"]
);

expectRows(
    '0.x leaving zero is a major, not a minor',
    {
        manifest: { dependencies: { a: '0.4.1' } },
        code: 1,
        stdout: table({ a: { current: '0.4.1', latest: '1.0.0' } })
    },
    ["a 0.4.1->1.0.0 major dependencies ''"]
);

expectRows(
    'prerelease tails do not change the bucket',
    {
        manifest: { dependencies: { a: '1.2.3-beta.1' } },
        code: 1,
        stdout: table({ a: { current: '1.2.3-beta.1', latest: '1.2.4' } })
    },
    ["a 1.2.3-beta.1->1.2.4 patch dependencies ''"]
);

// --- Which packages appear at all ----------------------------------------------------------------

expectRows(
    'transitive packages are dropped — no package.json entry can bump them directly',
    {
        manifest: { dependencies: { direct: '1.0.0' } },
        code: 1,
        stdout: table({
            direct: { current: '1.0.0', latest: '1.0.1' },
            'deep-transitive': { current: '2.0.0', latest: '3.0.0' }
        })
    },
    ["direct 1.0.0->1.0.1 patch dependencies ''"]
);

expectRows(
    'dependencies and devDependencies are told apart',
    {
        manifest: { dependencies: { prod: '1.0.0' }, devDependencies: { dev: '1.0.0' } },
        code: 1,
        stdout: table({ prod: { current: '1.0.0', latest: '1.0.1' }, dev: { current: '1.0.0', latest: '1.0.1' } })
    },
    ["dev 1.0.0->1.0.1 patch devDependencies ''", "prod 1.0.0->1.0.1 patch dependencies ''"]
);

expectRows(
    'each prefix travels with its row, so Step 6 writes behind it without re-reading package.json',
    {
        manifest: { dependencies: { caret: '^1.0.0', tilde: '~1.0.0', pinned: '1.0.0' } },
        code: 1,
        stdout: table({
            caret: { current: '1.0.0', latest: '1.0.1' },
            tilde: { current: '1.0.0', latest: '1.0.1' },
            pinned: { current: '1.0.0', latest: '1.0.1' }
        })
    },
    [
        "caret 1.0.0->1.0.1 patch dependencies '^'",
        "pinned 1.0.0->1.0.1 patch dependencies ''",
        "tilde 1.0.0->1.0.1 patch dependencies '~'"
    ]
);

expectRows(
    'a manifest with neither dependency block is not a crash',
    { manifest: { name: 'x' }, code: 0, stdout: '' },
    []
);

// --- Everything current: an empty list, at exit 0 ------------------------------------------------

expectRows('everything current: npm exits 0 with no output', { manifest: { dependencies: { a: '1.0.0' } } }, []);

expectRows(
    'everything current: npm exits 0 with an empty object',
    { manifest: { dependencies: { a: '1.0.0' } }, stdout: '{}\n' },
    []
);

// --- Refusals: every failure to compute the categories exits 2 -----------------------------------

// The regression this case exists for: npm failing outright once produced exit 0 and an empty list,
// which the workflow would have reported to the user as "everything is current".
expectRefusal(
    'npm failing outright is a refusal, never an empty list',
    { manifest: { dependencies: { a: '1.0.0' } }, code: 1, stderr: 'npm ERR! code ENOTFOUND\n' },
    'npm outdated failed'
);

expectRefusal(
    'npm failing reports npm’s own stderr as the reason',
    { manifest: { dependencies: { a: '1.0.0' } }, code: 1, stderr: 'npm ERR! code ENOTFOUND\n' },
    'ENOTFOUND'
);

expectRefusal(
    'non-JSON output is a refusal',
    { manifest: { dependencies: { a: '1.0.0' } }, code: 1, stdout: 'npm is doing something else entirely\n' },
    'did not return JSON'
);

expectRefusal(
    'an unreadable package.json is a refusal',
    { noManifest: true, code: 0 },
    'package.json could not be read'
);

expectRefusal(
    'an outdated package that is not installed is a refusal, not a guessed row',
    { manifest: { dependencies: { a: '1.0.0' } }, code: 1, stdout: table({ a: { latest: '2.0.0' } }) },
    'not installed'
);

expectRefusal(
    'a package the registry gave no latest for is a refusal',
    { manifest: { dependencies: { a: '1.0.0' } }, code: 1, stdout: table({ a: { current: '1.0.0' } }) },
    'no `latest` version'
);

expectRefusal(
    'a range the workflow cannot rewrite is a refusal, not a silent narrowing to a pin',
    {
        manifest: { dependencies: { a: '>=1.0.0' } },
        code: 1,
        stdout: table({ a: { current: '1.0.0', latest: '1.0.1' } })
    },
    'not a plain version or a ^/~ range'
);

expectRefusal(
    'a git dependency is a refusal',
    {
        manifest: { dependencies: { a: 'github:someone/a#v1.0.0' } },
        code: 1,
        stdout: table({ a: { current: '1.0.0', latest: '1.0.1' } })
    },
    'not a plain version or a ^/~ range'
);

expectRefusal(
    'a version that does not parse as semver is a refusal',
    {
        manifest: { dependencies: { a: '1.0.0' } },
        code: 1,
        stdout: table({ a: { current: '1.0.0', latest: 'latest' } })
    },
    'does not parse as semver'
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail === 0 ? 0 : 1;
