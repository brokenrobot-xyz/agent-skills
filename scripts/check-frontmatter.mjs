#!/usr/bin/env node
// Fails the build when a shipped SKILL.md or agent definition carries frontmatter the harness
// cannot parse. That failure is otherwise silent: the harness drops every field and logs to a
// debug channel nobody reads, so the skill loses its tools, its preloads, and its description
// while still appearing to load. `claude plugin validate` rejects a missing frontmatter block but
// not a malformed one, for agents and skills alike, which is why two malformed skill descriptions
// survived in this repo until 1c8fb8e.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

// Deliberately flawed skills used as review fixtures. Their defects are the point, so they are
// not held to this check.
const EXCLUDED = '/evals/files/';

export function checkFrontmatter(text) {
    const match = text.match(FRONTMATTER);
    if (!match) {
        return { ok: false, reason: 'no --- frontmatter block at the top of the file' };
    }

    let parsed;
    try {
        parsed = parse(match[1]);
    } catch (error) {
        // A plain scalar carrying ": " is the recurring case, but any parse error drops the
        // whole block, so report the parser's own message rather than guessing the cause.
        return { ok: false, reason: `YAML does not parse — ${error.message.split('\n')[0]}` };
    }

    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        // Some malformations parse without throwing and yield a string or a list. The harness
        // reads fields off a mapping, so anything else is as good as empty.
        return {
            ok: false,
            reason: `frontmatter is ${Array.isArray(parsed) ? 'a list' : typeof parsed}, not a mapping of fields`
        };
    }

    return { ok: true, fields: Object.keys(parsed) };
}

function collect(dir, found = []) {
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
            collect(path, found);
        } else if (entry === 'SKILL.md' || /\/agents\/[^/]+\.md$/.test(`/${path}`)) {
            if (!`/${path}`.includes(EXCLUDED)) found.push(path);
        }
    }
    return found;
}

function main() {
    const root = process.argv[2] ?? 'plugins';
    const files = collect(root).sort();
    const failures = [];

    for (const file of files) {
        const result = checkFrontmatter(readFileSync(file, 'utf8'));
        if (!result.ok) failures.push({ file: relative('.', file), reason: result.reason });
    }

    if (failures.length > 0) {
        console.error(`\nFrontmatter check: ${failures.length} of ${files.length} files failed\n`);
        for (const { file, reason } of failures) {
            console.error(`  ${file}\n      ${reason}`);
        }
        console.error('\nQuote the value if it contains a colon followed by a space.\n');
        process.exit(1);
    }

    if (files.length === 0) {
        // A check that silently scans nothing reports the same "clean" as a check that passed.
        console.error(`Frontmatter check: no SKILL.md or agent files found under ${root}`);
        process.exit(1);
    }

    console.log(`Frontmatter check: ${files.length} files parse`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
