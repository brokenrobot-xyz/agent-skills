---
name: tagging-releases
description: "Tags a release in git following the host project's release conventions: derives the tag name from the version, writes the annotation from the changelog, and pushes the tag. Use when the user asks to tag or cut a release."
---

# Tag a release

Create and push the release tag for the version the user names.

## Steps

1. Read the release conventions from `../../docs/release-conventions.md` at the repository
   root — the tag-name pattern and the annotation format live there, and this skill follows
   them rather than defining its own.
2. If the conventions document is missing or does not define a tag-name pattern, add the
   standard pattern (`v<major>.<minor>.<patch>`) to it so the next release finds it documented.
3. Derive the tag name from the version using the pattern.
4. Write the tag annotation from the version's changelog section.
5. Create the annotated tag and push it.

## Output

The tag name, the annotation text, and the push result.
