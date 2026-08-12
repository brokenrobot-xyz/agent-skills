// Buckets the repo's outdated direct dependencies into patch / minor / major so the update workflow
// presents a computed table rather than deriving semver categories by eye.
//
// Used by the updating-dependencies skill in Step 3:
//
//   node <skill-dir>/scripts/categorize.mjs
//
// Prints { outdated: [...] } as JSON, one entry per outdated direct dependency, each carrying the
// package, its current and latest versions, its category, its dependency block, and the version
// prefix its package.json entry uses. The prefix travels with the row because Step 6 writes the new
// version behind that same prefix, so the run never has to re-read package.json to find it.
//
// Only direct dependencies appear. `npm outdated` also reports transitive packages, which no
// package.json entry can bump directly, so listing them would offer the user a choice the workflow
// cannot act on.
//
// A 0.x package's bump is never reported as a patch: 0.x releases may break on any digit, so the
// floor for a package whose current major is 0 is `minor`.
//
// Exit 2 always means the categories cannot be computed at all: `npm outdated` failed, package.json
// is unreadable, an outdated package is not installed, or a version does not parse. Exit 2 never
// means "nothing to update" — everything current is `{ "outdated": [] }` with exit 0.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function fail(message) {
    console.error(message);
    process.exit(2);
}

// Leading `^`, `~`, or nothing. A range npm cannot express as a prefix plus a version — `>=1.2.0`,
// `1.x`, a git or file URL — is not a version this workflow knows how to rewrite, so it is refused
// rather than flattened into a pin that would silently narrow what the entry accepts.
function prefixOf(spec, pkg) {
    const match = /^([\^~]?)(\d+\.\d+\.\d+.*)$/.exec(spec);
    if (!match) {
        fail(`${pkg} is declared as "${spec}", which is not a plain version or a ^/~ range — update it by hand.`);
    }
    return match[1];
}

function parse(version, pkg) {
    // The prerelease tail is deliberately ignored for bucketing: a change confined to it still moves
    // one of the three numbers, or it is not a bump this workflow reports.
    const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
    if (!match) {
        fail(`${pkg} reports the version "${version}", which does not parse as semver — categorize it by hand.`);
    }
    return match.slice(1, 4).map(Number);
}

function categorize(current, latest, pkg) {
    const [curMajor, curMinor] = parse(current, pkg);
    const [latMajor, latMinor] = parse(latest, pkg);
    if (curMajor !== latMajor) {
        return 'major';
    }
    // 0.x: the minor digit carries breaking changes, and so does the patch digit, so nothing below a
    // major bump may be presented as the safe category.
    if (curMinor !== latMinor || curMajor === 0) {
        return 'minor';
    }
    return 'patch';
}

let manifest;
try {
    manifest = JSON.parse(readFileSync('package.json', 'utf8'));
} catch (error) {
    fail(`package.json could not be read from ${process.cwd()} (${error.message}) — run this from the repo root.`);
}

const blocks = {
    dependencies: manifest.dependencies ?? {},
    devDependencies: manifest.devDependencies ?? {}
};

let out;
try {
    out = execFileSync('npm', ['outdated', '--json'], { encoding: 'utf8' });
} catch (error) {
    // `npm outdated` exits 1 whenever anything is outdated, which is the expected case here; the JSON
    // is still on stdout. A non-zero exit with nothing on stdout is npm itself failing — an
    // unreachable registry, an absent lockfile — and reporting that as an empty list would tell the
    // user everything is current when nothing was checked. Reaching this catch at all is what
    // separates the two: nothing outdated exits 0, and never lands here.
    out = error.stdout;
    if (!out || out.trim() === '') {
        fail(`npm outdated failed, so categories cannot be computed: ${error.stderr?.trim() || error.message}`);
    }
}

let report;
try {
    report = out.trim() === '' ? {} : JSON.parse(out);
} catch {
    fail(`npm outdated did not return JSON, so categories cannot be computed. Its output began: ${out.slice(0, 200)}`);
}

const outdated = [];
for (const [pkg, entry] of Object.entries(report)) {
    const depType =
        blocks.dependencies[pkg] !== undefined
            ? 'dependencies'
            : blocks.devDependencies[pkg] !== undefined
              ? 'devDependencies'
              : null;
    if (depType === null) {
        continue;
    }
    // An outdated package with no installed version cannot be compared against latest. The workflow
    // requires an installed tree, so this is a precondition failure rather than a row to guess at.
    if (!entry.current) {
        fail(`${pkg} is outdated but not installed, so its category cannot be computed — run \`npm install\` first.`);
    }
    if (!entry.latest) {
        fail(`${pkg} has no \`latest\` version from the registry, so its category cannot be computed.`);
    }
    outdated.push({
        package: pkg,
        current: entry.current,
        latest: entry.latest,
        category: categorize(entry.current, entry.latest, pkg),
        depType,
        prefix: prefixOf(blocks[depType][pkg], pkg)
    });
}

const rank = { major: 0, minor: 1, patch: 2 };
outdated.sort((a, b) => rank[a.category] - rank[b.category] || a.package.localeCompare(b.package));

console.log(JSON.stringify({ outdated }, null, 4));
