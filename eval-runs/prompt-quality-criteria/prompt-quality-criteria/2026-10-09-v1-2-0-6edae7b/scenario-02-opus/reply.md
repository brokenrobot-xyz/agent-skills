`generating-alt-text` pins `model: fable` in its frontmatter. As of the criteria's **last-synced** date (2026-10-09, so they're current), the `fable` alias resolves to **Fable 5.1**. That gives you this group B subset:

**1. Shared items. These apply to every current model:**

- **B1**: verbosity. No forced ceremony.
- **B2**: effort and thinking aren't over-scaffolded.
- **B3**: tool nudges. On Fable 5.x thinking is always on, so only the `low`-effort case applies.
- **B4**: coverage before filtering. It applies hardest to prompts that find, review or audit, so weigh it by what this skill actually does.
- **B5**: progress-update scaffolding.
- **B6**: the turn ends when the work does. Score it `N/A` only if the skill is human-in-the-loop by design.
- **B7**: unrequested additions are contained.

**2. The Fable 5.1 paragraph.** It covers:

- fewer progress updates, so remove narration suppressors (`B5`)
- dense prose
- less formatting than earlier models, so anti-formatting rules can backfire
- unmarked quoting of source passages (`C2`)
- stopping to ask permission for work already requested (`B6`)
- extending past the task (`B7`)
- searching less at `low` effort
- rewriting whole files unless told to edit surgically
- hidden tool output
- compaction prompts
- never instruct it to reproduce its reasoning (`C7`)

**3. The Fable 5 paragraph (its predecessor).** It applies wherever the 5.1 paragraph doesn't override it:

- brief steering beats listing behaviors
- much longer turns on hard tasks
- it readily dispatches parallel subagents
- never instruct it to reproduce its reasoning (`C7`)

**4. The verification-by-model note for Fable.** On long Fable runs, self-verification should be made _explicit_, and fresh-context verifier subagents beat self-critique. This is the opposite of the Opus rule.

**Excluded:** the Opus 5.5, Sonnet 5.5, Haiku 5.5, Sonnet 5, Opus 5 and Opus 4.8 paragraphs, plus the Opus half of the verification note.

One caveat to put next to any group B finding you write: managed settings can override a model pin. A prompt that depends on the quirks of exactly one model is therefore fragile.

Groups C–G apply in full whatever the model is. Severities are yours to assign. Cite the keys exactly as written (`B5`, `C7`, …) so your report lines up with other reviewers'.
