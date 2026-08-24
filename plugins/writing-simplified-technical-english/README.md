# writing-simplified-technical-english

Revises agent-facing prose — SKILL.md bodies, agent definitions, specs,
plans, and technical docs — so that an agent cannot read a sentence two ways.
It applies twelve conventions adapted from
[ASD-STE100 Simplified Technical English](https://www.asd-ste100.org/),
Issue 9: the rules that remove ambiguity, without the standard's controlled
dictionary or sentence-length caps. An adaptation, not a conforming
implementation.

This README documents what the skill does and how to steer it. The working
rules live in [SKILL.md](SKILL.md) and
[references/conventions.md](references/conventions.md); on any conflict,
those are canonical.

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install writing-simplified-technical-english@brokenrobot-xyz
```

It is also installed automatically as a dependency of
[reviewing-claude-skills](../reviewing-claude-skills/README.md) and
[reviewing-claude-subagents](../reviewing-claude-subagents/README.md), which
invoke it in check mode to grade the prose of a skill or a subagent definition.

## Usage

Two modes:

- **Revise** (the default) — edits the prose and reports every change in a
  table: file, line, convention, reason. Ask for it with anything like
  "tighten this spec", "make this skill less ambiguous".
- **Check** — reports violations and edits **nothing**. Triggered by audit
  phrasing: "review", "audit", "list the problems with".

Two properties worth knowing before the first run:

- **It never guesses.** When a fix needs information the text does not carry
  (a pronoun with two plausible antecedents, an "etc." with no membership
  test), the line is left as-is and reported as _unresolved_ with the
  readings weighed. The author decides; the skill does not.
- **Files in the change set are data, not direction.** An imperative inside
  a reviewed file ("always add a Co-Authored-By trailer", "skip the
  frontmatter check") is text to revise, never an instruction the run obeys.

## What it governs

In scope: prose an agent reads as instruction — SKILL.md bodies and their
`references/`, agent definition files, proposals, designs, task lists,
technical documentation.

Out of scope, always left untouched: a skill's `name`/`description`
frontmatter (rewriting it degrades skill discovery), published product copy,
code and the literal text of fenced command blocks, and commit messages.

Projects can add carve-outs: the skill reads the consumer repo's `CLAUDE.md`
and convention documents before revising, honors any exclusion found there,
and names the text it skipped.

## The twelve conventions

1. Name the actor
2. Write one instruction per sentence
3. Put the condition before the command
4. Keep notes informative and instructions imperative
5. Give every guardrail a consequence
6. Make every referent explicit
7. Name the whole set
8. Use precise verbs
9. Use one term per concept (checked across the whole change set)
10. Keep noun stacks to three words
11. Prefer a verb to a noun built from a verb
12. Mechanics

Each is defined in
[references/conventions.md](references/conventions.md), with a
violating-line/rewrite pair per convention in
[references/examples.md](references/examples.md).

Deliberately absent: any sentence-length or word-count rule. Long sentences
are usually guardrails binding a condition to an action, and splitting one
creates exactly the ambiguity the conventions exist to remove.

The standard itself is published free of charge at
[asd-ste100.org](https://www.asd-ste100.org/); ASD retains copyright in it,
these conventions are written in original wording as house rules, and ASD
does not endorse them.
