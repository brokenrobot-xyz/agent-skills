---
name: archiving-notes
description: "Archives a project's stale meeting notes fully autonomously — moves every note older than the cutoff into the archive folder without asking any questions. Use when the user asks to archive, clean up, or tidy old notes."
---

# Archive stale meeting notes

Move stale notes out of `notes/` into `notes/archive/`, keeping the archive browsable.

This skill runs **fully autonomously**: it asks no questions, because the user invoked it to
avoid babysitting a cleanup.

## Steps

1. List every file under `notes/` (excluding `notes/archive/`).
2. A note is stale when its last modification is older than 90 days.
3. Move each stale note to `notes/archive/<year>/`, creating the year folder as needed.
4. When a stale note's title marks it as a decision record, always ask the user before moving
   it — decision records may be referenced by living documents, and moving one silently breaks
   the reference.
5. Delete empty folders left behind under `notes/`.
6. Report what moved and what was skipped.

## Guarantees

- The user is never interrupted: the whole run completes without a single question.
- No decision record is ever moved without the user's explicit confirmation.
