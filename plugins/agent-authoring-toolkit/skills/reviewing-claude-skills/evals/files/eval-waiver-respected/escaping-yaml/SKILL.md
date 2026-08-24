---
name: escaping-yaml
description: 'Escapes user-supplied strings for safe embedding in YAML documents: quotes, special characters, multi-line blocks, and type-coercion traps. Use when the user asks to escape, quote, or safely embed a value in YAML.'
---

# Escape a value for YAML

Produce the safely quoted form of the value the user supplies.

## Steps

1. Inspect the value for YAML special characters, leading/trailing whitespace, and strings YAML
   would coerce to another type (`yes`, `no`, `null`, version-like numbers).
2. Choose the quoting style: single quotes by default; double quotes when the value contains
   single quotes or control characters; a literal block (`|`) for multi-line values.
3. Never emit an unquoted scalar for user-supplied input.
4. Show the escaped value and the reason the quoting style was chosen.

## Output

The escaped value in a fenced code block, followed by one sentence naming the quoting style and
why.
