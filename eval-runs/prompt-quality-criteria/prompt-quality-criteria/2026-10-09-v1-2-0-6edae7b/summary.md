# Eval run — prompt-quality-criteria — 2026-10-09

- **Repo HEAD tested:** `6edae7b` (branch `chore/claude-5-5-models`, clean tree)
- **Plugin:** prompt-quality-criteria 1.2.0, loaded from the working copy with `--plugin-dir`;
  the installed 1.1.1 copy was disabled. Criteria `last-synced: 2026-10-09`.
- **Model:** runners on `opus` → claude-opus-5-5 and `sonnet` → claude-sonnet-5-5 (the skill
  pins no model). Graders on `fable` → Fable 5.1 (H10).
- **Runner:** one clean-context subagent per arm, the fixture copied into an empty scratch
  directory at its scenario-relative path, verbatim prompt; the reply saved as `reply.md`.
- **Purpose:** first campaign after group B was rebuilt for the Claude 5.5 generation — the
  current-model paragraphs, predecessor inheritance, and B6/B7.

## Scope and deliberate deviations

- **Subset: 1 of 5 scenarios** — 2, the conditional group B — in both model arms its `models`
  key names. **2 runs.** The other four test the supply-don't-score contract, which this branch
  did not change.
- **Baseline (without-skill) arm deferred**, so H13 assertion hygiene stays unmeasured.
- The user's email address is redacted to `<user-email>` in transcripts.
- **Artifacts are prettier-formatted** per the repo's format check (whitespace and Markdown
  syntax only). The `.jsonl` transcripts, which the check does not cover, hold the verbatim output.

## Results

| id  | scenario                 | model  | group B selected                                                           | assertions | tokens | duration |
| --- | ------------------------ | ------ | -------------------------------------------------------------------------- | ---------- | ------ | -------- |
| 2   | eval-group-b-conditional | opus   | `fable` → Fable 5.1 + inherited Fable 5 + B1–B7; others excluded — correct | 8/8        | 47,815 | 32 s     |
| 2   | eval-group-b-conditional | sonnet | the same — correct                                                         | 8/8        | 49,968 | 33 s     |

**Aggregate: 16/16 PASS.** Runner tokens: 97,783. Grader tokens: 125,060. Per-assertion
evidence is in each arm's `grading.json`.

- Both arms resolved the `fable` alias through the file's `last-synced` note, applied the shared
  B1–B7, the Fable 5.1 paragraph, the inherited Fable 5 paragraph "wherever the 5.1 paragraph
  doesn't override it", and the Fable half of the verification callout, and excluded the Opus 5.5,
  Sonnet 5.5, Haiku 5.5, Opus 5, Opus 4.8, and Sonnet 5 paragraphs.
- Both surfaced the C7 reasoning-echo rule against the fixture's planted instruction, noted that a
  managed setting can override the pin, and assigned no severity.
- Grader notes, no grade effect: the opus arm abbreviates B1–B7 to titles; the sonnet arm summarizes
  the inherited Fable 5 paragraph as three points where the file has four (parallel-subagent
  dispatch dropped).

## Machine checks

Every key cited in both replies (B1–B7, C2, C7) resolves to a defined criterion in
`references/prompt-criteria.md`. The fixture is byte-identical before and after both runs
(`machine-checks.txt`).

## Incidents

- **No `reasoning_extraction` refusal** in either arm, although the fixture plants the same kind
  of reasoning-echo instruction that got the reviewing-claude-skills scenario 7 refused twice on
  the same date. Naming C7 against the line did not trip the classifier; that campaign's detail
  sweep, which analyses and quotes the instruction, did.
- **Harness.** The sonnet runner's Bash heredoc write was denied; it used the Write tool. No grade
  affected.
