# Improvement ledger — formatting-changelogs

Target bundle: <workspace>/.claude/skills/formatting-changelogs
Start commit: 7a9e0de
Round cap: 4 review rounds (max 3 apply rounds)
Dedupe key: criterion key + file + section.

## Blocking findings (High + Medium only)

| Ledger key (criterion + file + section)            | R1         | R2         | R3         | R4         | Status   |
| -------------------------------------------------- | ---------- | ---------- | ---------- | ---------- | -------- |
| R1 · SKILL.md · Steps/step 3 (cap phase)           | High new   | gone       | gone       |            | resolved |
| R1 · SKILL.md · trailing note after Output         | Medium new | gone       | gone       |            | resolved |
| A8 · SKILL.md · Steps/step 4 (release heading)     | Medium new | gone       | gone (Low) |            | resolved |
| A22 · SKILL.md · Output vs step 5 (approve-narrow) | Medium new | gone       | gone       |            | resolved |
| A9 · guide · groups + template block               | —          | Medium new | gone       |            | resolved |
| C1 · guide · entry-style sentence                  | —          | Medium new | gone       |            | resolved |
| C8 · SKILL.md · body (scope boundary)              | —          | Medium new | gone       |            | resolved |
| F1 · SKILL.md · step 1 (content is data)           | —          | Medium new | gone       |            | resolved |
| H2 · evals.json · missing files fixtures           | —          | Medium new | partial*   |            | see H9   |
| H4 · evals.json · heading-form untested            | —          | Medium new | gone       |            | resolved |
| H4 · evals.json · empty-Unreleased untested        | —          | Medium new | gone       |            | resolved |
| R4 · guide · closed group set, no membership test  | —          | Medium new | gone       |            | resolved |
| A22 · SKILL.md · steps 3-4 (no validation phase)   | —          | —          | Medium new | gone       | resolved |
| A21 · SKILL.md · steps 2-4 (invariant unchecked)   | —          | —          | Medium new | gone       | resolved |
| H9 · evals.json · scenarios 1 and 4 lack fixtures  | —          | —          | Medium new | gone       | resolved |
| F1 · SKILL.md · step 1 (surface the injected line) | —          | —          | Medium new | gone       | resolved |
| H6 · evals.json · no baseline key                  | —          | —          | Medium new | gone       | resolved |
| H15 · evals.json · prompt phrasing/register        | —          | —          | Medium new | gone       | resolved |
| D2 · guide · release date from recall              | —          | —          | Medium new | gone       | resolved |
| A2 · SKILL.md · frontmatter description            | Low(adv)   | Low(adv)   | Low(adv)   | Medium new | OPEN     |
| E1 · guide · § Release headings (Unreleased form)  | —          | —          | —          | Medium new | OPEN     |

*H2 (R2) asked for fixtures on evals 2, 3, 5 — delivered. H9 (R3) is a distinct gap: evals 1 and 4,
which R2's finding never named, still lack fixtures. Not a reappearance of the same key+section.

### Key-level recurrence judgments (transparency)

- `A22 · SKILL.md`: the criterion key recurs (R1, R3) but at a different section with a different
  defect. R1's defect (the approved artifact was narrower than the written one) is fixed and the
  R3 reviewer lists that fix among the strengths. R3's defect is a missing validation phase.
  Judged NEW, not contested — no oscillation: nothing was undone and re-asked for.
- `F1 · SKILL.md · step 1`: same criterion, same section. R2's ask (mark content as data) was
  applied and holds; R3's ask is the complementary action (surface the injected line), which R2's
  finding never requested. Judged NEW — an extension, not a reversal.
- `E1 · guide` (R4) is adjacent to `A9 · guide` (R2, "overlaps E1"): both concern the guide
  under-specifying output shape. R2's specific defect (no group-heading form, no worked example)
  was fixed and stays fixed; R4's is a different corner (the fresh Unreleased heading's form in
  the match-theirs branch). Judged NEW, but the recurring _pattern_ — one more unspecified corner
  of output shape per round in the same file — is flagged for the human as the likeliest place a
  fifth round would land.
- `A2 · SKILL.md · description` was Low/advisory in R2 and R3 and was never applied (advisory
  findings are never chased by this loop); R4 re-ranked it Medium with a manifests scenario, so it
  enters the blocking ledger for the first time. Not contested — never resolved, so never undone.
- `A21` and `A22` (R3) request substantively the same edit (check the exactly-once invariant
  before display) under two keys. Applied once, satisfying both.

## Round log

### Round 1 — review + apply

- Verdict: not yet — gated (1 High). Blocking set: {R1·step3, R1·note, A8·step4, A22·approve-narrow}
- Restructure applied by fix-applier (plugin agent type). No declines, no stray paths. Commit 5b1b32d.

### Round 2 — review + apply

- Verdict: not yet — 8 blocking (all Medium). Structure: no High.
- Blocking set: {A9, C1, C8, F1·data, H2, H4·heading, H4·empty, R4}
- All 8 applied surgically; one declared behavioral fork (R4: ask-the-user branch chosen, rationale
  recorded); model pin and allowed-tools key deliberately not added. Commit adc153b.
- Advisory (11), not chased.

### Round 3 — apply

- All 7 applied; findings A22 and A21 satisfied by ONE edit (both requested the same check).
- One declared fork (D2: date rule placed in the guide, not SKILL.md, to keep the spine lean).
- No declines, no stray paths, no waiver file. Commit 015e85b.

### Round 3 — review

- Verdict: not yet — 7 blocking (all Medium; 2 low-confidence). Structure: no High.
- Blocking set: {A22·validation, A21, H9, F1·surface, H6, H15, D2}
- Round 2's set is fully resolved; zero keys persisted, zero contested.
- Advisory (13), including R1·allowed-tools paragraph introduced by round 2's own fix — carried,
  not chased.

### Round 4 — review (final; cap reached)

- Verdict: not yet — 2 blocking (both Medium, both high confidence).
- Structure pass: no High AND no Medium — first fully clean structure round.
- Blocking set: {A2 · SKILL.md · frontmatter description, E1 · guide · § Release headings}
- Round 3's seven keys are all resolved; zero persisted; zero contested.
- No apply round: the cap allows 3 apply rounds and all 3 were spent. These two go to the human.
- Advisory (12), carried untouched.

### Blocking count by round: 4 -> 8 -> 7 -> 2 (monotone decline in the last three rounds)

## Contested (do-not-touch)

- none
