---
name: syncing-translations
description: Synchronizes the host project's locale files against the source-of-truth English catalog — buckets entries into identical, fuzzy, and missing, auto-applies the configured categories, and gates the rest on user approval. Use when locale files drift behind the English catalog or translations need syncing.
allowed-tools: Read Edit Bash(node:*)
---

Sync every locale file under `locales/` against `locales/en.json`. By default, identical entries
are copied directly, while fuzzy and missing entries are reviewed first and applied only after
the user approves. The config can widen or narrow the auto-sync set — but widening it removes the
approval gate, never the review behind it: every fuzzy and every missing entry is reviewed
whatever the config says, and only an auto-applied identical entry skips the scoring. Never edit
`locales/en.json`.

## Configuration

Read `.i18n-sync.json` at the repo root, once, before anything else. Its `autoSync` key is an
array drawn from `identical`, `fuzzy`, `missing`. Default: `["identical"]`. A category in the
auto-sync set **auto-applies**; a category outside the set is **gated** on the user's approval.
An empty array `[]` is the fully gated mode: nothing applies without approval. An invalid value —
a non-array, an entry outside the three categories — means stop and report the invalid config
rather than guess, because a guessed policy silently substitutes behavior the repo did not
choose.

Three rules bound what "auto" means. Later steps cite these rules by number rather than
restating them:

1. **Review is the constant.** Every entry is scored except an identical entry in the auto-sync
   set — fuzzy and missing entries are always scored, and a gated identical entry is scored too,
   because a gate without scoring would ask the user to approve blind.
2. **Of the scored entries, auto applies only a match score above 0.9.** A lower score always
   stops for approval, whatever the auto-sync set says — auto-sync removes the ceremony for clean
   entries, never the safety net for doubtful ones.
3. **No `autoSync` value makes a plural-form entry automatic.** Plural rules vary by locale, so a
   plural entry is always scored and always stops for approval.

## Steps

1. **Bucket.** Compare each locale file against `locales/en.json` and bucket every entry as
   **identical** (same key, same source text), **fuzzy** (same key, changed source text), or
   **missing** (key absent from the locale). Present the three buckets as a table before touching
   anything, alongside the resolved auto-sync set and its provenance.
2. **Auto identical entries.** When `identical` is in the auto-sync set, copy those entries
   directly and re-run the comparison, because a copy that lands wrongly must surface now rather
   than in the report. When `identical` is not in the set, tick this step as skipped — the
   identical entries join step 3's scoring pool like every other entry.
3. **Score the remaining entries.** Compute a match score for every entry step 2 did not apply,
   and decide the **Action** column per entry by the three rules in **Configuration**: `auto`
   when the entry passes all three rules (its category is in the auto-sync set, its score is
   above 0.9, and it is not a plural form), `approval` for every other entry.
4. **Apply the auto rows.** Apply them without asking — that is what the config chose — one
   bucket at a time, re-running the comparison after each bucket, so a regression cleanly
   identifies which bucket caused it.
5. **Approval gate.** Stop and await the user's choice on every `approval` row, because an entry
   applied without approval is a translation the user never reviewed. After the user decides,
   apply the approved entries one bucket at a time, as in step 4, then re-run it to confirm the
   drift has cleared.
6. **Report.** Summarize what was applied (auto versus approved) per bucket, what was deferred,
   and every step the config emptied, ticked with a "skipped — why" note rather than silently
   omitted. The changes stay uncommitted, because the user reviews the working tree before
   committing.
