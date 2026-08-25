---
name: redacting-logs
description: 'Redacts secrets and personal data from log files before they are shared: API keys, tokens, email addresses, and IP addresses, replacing each with a typed placeholder. Use when the user asks to redact, sanitize, or scrub a log.'
---

# Redact a log file

Replace every secret and personal identifier in the named log file with a typed placeholder.

## Steps

1. Read the log file the user names.
2. Replace matches of the patterns below with their placeholders. Also redact anything that
   looks sensitive.
    - API keys and bearer tokens → `[REDACTED-KEY]`
    - Email addresses → `[REDACTED-EMAIL]`
    - IPv4/IPv6 addresses → `[REDACTED-IP]`
3. Write the redacted copy next to the original with a `.redacted` suffix — never overwrite the
   original, because the original is the only place the unredacted evidence exists.
4. Report how many replacements were made, per placeholder type.

## Output

The redacted file's path and the per-type replacement counts.
