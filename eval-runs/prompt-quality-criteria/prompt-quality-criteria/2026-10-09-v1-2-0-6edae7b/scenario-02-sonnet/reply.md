I invoked prompt-quality-criteria and read its criteria file in full (last-synced 2026-10-09, so the criteria are current as of today). I also read generating-alt-text/SKILL.md for its `model:` pin.

**Pin:** `model: fable`. The alias resolves to Fable 5.1 as of last-synced. Fable 5.1 also takes its predecessor's Fable 5 paragraph wherever its own paragraph does not override it.

**Group B subset that applies**

1. The shared items, B1 to B7:
    - B1: verbosity
    - B2: effort and thinking not over-scaffolded
    - B3: tool nudges
    - B4: coverage before filtering
    - B5: progress-update scaffolding
    - B6: the turn ends when the work does
    - B7: unrequested additions are contained
2. The Fable 5.1 paragraph (also covers Mythos 5.1). It names these keys:
    - B5: it writes fewer updates by default, so remove narration suppressors.
    - B6: it can stop to ask permission for requested work.
    - B7: it can extend beyond the task.
    - C7: never instruct it to reproduce its reasoning.
    - C2: one complete example fixes unmarked quoting.
3. The Fable 5 paragraph (the predecessor). It adds three points:
    - Brief steering beats enumerating behaviors.
    - Much longer turns on hard tasks.
    - Never instruct it to reproduce its reasoning (C7).
4. The "Verification by model" note for Fable 5 and 5.1. Self-verification should be explicit on long runs.

**Excluded:** the Opus 5.5, Sonnet 5.5, Haiku 5.5, Opus 5, Opus 4.8 and Sonnet 5 paragraphs, because they do not match this pin. Groups C through G apply to every prompt.

**Caller-side notes for your scoring**

- B4 applies hardest to prompts that find, review or audit. This skill generates text, so judge whether it applies at all.
- B7 is for open-ended building work. Decide whether it fits a short alt-text task.
- The skill's reasoning line ("write out your reasoning step by step in the response") touches the Fable 5.1 and Fable 5 paragraphs, B2, and C7.
- Because a managed setting can override a model pin, report the pin's fragility alongside any group B finding.

I assigned no severities. Those are yours.
