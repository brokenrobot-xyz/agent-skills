#!/usr/bin/env node
// Test suite for the frontmatter checker (scripts/check-frontmatter.mjs). Fully self-contained:
// every case is an in-memory string, never a file on disk and never the host repository, so the
// suite is hermetic and runs offline. Node only — the same runtime the checker requires.
//
// The property under test is that the checker actually rejects. A guard against a silent failure
// is itself prone to one: a checker that returns ok for everything reports the same "clean" as a
// checker that works, and nothing downstream would notice. Every malformation below therefore
// asserts a rejection, and the accepted cases exist to prove the checker is not simply refusing
// everything.

import { checkFrontmatter } from '../check-frontmatter.mjs';

let pass = 0;
let fail = 0;

function ok(label) {
    pass += 1;
    console.log(`ok   ${label}`);
}

function bad(label, detail) {
    fail += 1;
    console.log(`FAIL ${label}\n     ${detail}`);
}

function expectAccepted(label, text) {
    const result = checkFrontmatter(text);
    if (result.ok) ok(label);
    else bad(label, `expected acceptance, got: ${result.reason}`);
}

function expectRejected(label, text, expectedSubstring) {
    const result = checkFrontmatter(text);
    if (result.ok) {
        bad(label, 'expected a rejection, but the checker accepted it');
        return;
    }
    if (!result.reason.includes(expectedSubstring)) {
        bad(label, `rejected for the wrong reason: ${result.reason}`);
        return;
    }
    ok(label);
}

const fm = (body) => `---\n${body}\n---\n\n# Body\n`;

expectAccepted('a minimal valid mapping', fm('name: counting-words\ndescription: Counts words.'));

expectAccepted(
    'a description carrying a colon, correctly quoted',
    fm('name: a\ndescription: "Reviews a skill in two passes. Structure first: the shape."')
);

expectAccepted('a nested sequence under a key', fm('name: a\ndescription: b\nskills:\n  - one\n  - two'));

expectAccepted(
    'an em-dash and apostrophes in an unquoted scalar',
    fm("name: a\ndescription: Revises the host project's prose — carefully.")
);

// The recurring defect. An unquoted plain scalar cannot carry ": "; the parser reads it as a
// nested mapping and drops the whole block, which is what silently stripped detail-reviewer's
// tools and skills preload.
expectRejected(
    'an unquoted description containing a colon-space is rejected',
    fm('name: a\ndescription: Reviews a skill in two passes. Structure first: the shape.'),
    'does not parse'
);

expectRejected(
    'an unquoted colon-space in any field, not just description, is rejected',
    fm('name: a\ndescription: b\ncompatibility: Runs offline: no network needed.'),
    'does not parse'
);

expectRejected(
    'a file with no frontmatter block is rejected',
    '# Just a heading\n\nProse.\n',
    'no --- frontmatter block'
);

expectRejected(
    'an unterminated frontmatter block is rejected',
    '---\nname: a\ndescription: b\n\n# Body\n',
    'no --- frontmatter block'
);

expectRejected('an unclosed quote is rejected', fm('name: a\ndescription: "unterminated'), 'does not parse');

expectRejected('a tab-indented sequence is rejected', fm('name: a\nskills:\n\t- one'), 'does not parse');

// These parse without throwing but yield something the harness cannot read fields off, so a
// checker that only caught exceptions would pass them through.
expectRejected(
    'frontmatter that parses to a bare string is rejected',
    fm('just a sentence with no key'),
    'not a mapping'
);

expectRejected('frontmatter that parses to a list is rejected', fm('- one\n- two'), 'not a mapping');

expectRejected('an empty frontmatter block is rejected', '---\n\n---\n\n# Body\n', 'not a mapping');

console.log(`\n${pass} passed, ${fail} failed`);
process.exitCode = fail === 0 ? 0 : 1;
