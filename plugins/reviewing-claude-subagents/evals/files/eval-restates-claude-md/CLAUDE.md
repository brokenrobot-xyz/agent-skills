# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that was not requested.

## Surgical Changes

**Touch only what you must. Clean up only your own mess.**

- Do not "improve" adjacent code, comments, or formatting.
- Do not refactor things that are not broken.
- Match existing style, even where you would do it differently.
- When you notice unrelated dead code, mention it rather than deleting it.

## Commands

- `npm run build` — production build
- `npm run test` — the test suite
