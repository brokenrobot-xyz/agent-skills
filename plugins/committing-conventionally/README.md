# committing-conventionally

Authors [Conventional Commits](https://www.conventionalcommits.org/) and
enforces them. The plugin has two cooperating parts:

- A **skill** that fires when you ask Claude to commit: it stages one logical
  change, infers the type and scope from the project's commit vocabulary, and
  writes a conforming message.
- A **`PreToolUse` deny-hook** that validates the message of **every**
  `git commit` Claude runs — whether or not the skill was invoked. A
  non-conforming message is blocked before the commit happens, with a reason
  Claude can act on.

Both parts resolve the same vocabulary from the same file, so a commit the
skill writes passes the hook by construction.

This README documents the consumer's interface — installation, configuration,
and the hook's observable behavior. The authoring recipe itself lives in
[SKILL.md](SKILL.md); on any conflict, [SKILL.md](SKILL.md) and
[the hook script](scripts/deny-noncompliant-commit-message.mjs) are canonical.

## Requirements

- git
- Node.js — the hook is a zero-dependency Node script, so it behaves
  identically on macOS, Linux, and Windows. No npm install step.

## Install

```
/plugin marketplace add brokenrobot-xyz/agent-skills
/plugin install committing-conventionally@brokenrobot-xyz
```

Note that installing the plugin activates the deny-hook for every session in
which the plugin is enabled: from that point on, Claude cannot land a
non-conforming commit message anywhere you work, not just when the skill runs.

## Configuration

Create `.brokenrobot-xyz/commits.json` at the root of the repository where the
commits happen (the *consumer* repo — not this marketplace). Without the file,
the plugin behaves as vanilla Conventional Commits:

| Key | Default |
| --- | --- |
| `types` | `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore` |
| `scopes` | No allowlist — any short lowercase token (letters, digits, hyphens), or no scope at all |
| `attributionTrailers` | `"forbidden"` |

The full schema:

```json
{
  "types":  { "<type>": "what the type is for", "…": "…" },
  "scopes": { "<scope>": "the area of the codebase it covers", "…": "…" },
  "attributionTrailers": "forbidden"
}
```

The values of `types` and `scopes` are prose hints for the skill — it reads
them to pick the right type and scope for a change. The hook only checks the
keys.

> [!IMPORTANT]
> Resolution is **per-key replacement, not merge**. A key present in the file
> is the *complete* set for that key. If you add
> `"types": { "post": "a new article" }`, then `post` is the **only** allowed
> type — `feat`, `fix`, and the rest are gone until you list them too. An
> absent key (or an absent file) falls back to the default.

`attributionTrailers` accepts `"forbidden"` (the default) or `"allowed"`.
Under `forbidden`, any `Co-Authored-By:` trailer is denied — including the one
coding harnesses add by default. Under `allowed`, a trailer may pass, but the
skill still only writes one when you explicitly ask for it in that invocation.

### Examples

Permit attribution trailers, keep everything else vanilla:

```json
{ "attributionTrailers": "allowed" }
```

A custom vocabulary for a blog repo (note that the vanilla types you still
want must be restated):

```json
{
  "types": {
    "feat": "a new capability of the site",
    "fix": "a bug fix",
    "post": "a new article or an edit to one",
    "chore": "maintenance with no user-visible effect"
  },
  "scopes": {
    "rss": "the feed",
    "layout": "templates and components",
    "styles": "global styling"
  }
}
```

> [!WARNING]
> An unparseable config (invalid JSON, or a top-level value that is not an
> object) **denies every commit** until the file is fixed or removed — the
> hook fails closed rather than silently falling back to defaults you did not
> choose.

## What the hook enforces

For every `git commit` with a message on the command line (`-m`/`--message`,
`-F`/`--file`, or a heredoc), the hook denies:

- a subject not matching `<type>(<scope>): <description>` (scope and the
  breaking-change `!` are optional) or using a type outside the resolved set,
- a scope outside the allowlist, when the config defines one — a scopeless
  subject is always allowed,
- a subject ending with a period,
- a `Co-Authored-By:` trailer, unless `attributionTrailers` is `"allowed"`.

It deliberately lets through:

- merge, revert, reapply, `fixup!`, `squash!`, and `amend!` commits — git
  generates those subjects,
- `--dry-run` runs and anything that is not a `git commit`,
- commits with no message argument (an editor would open) and other inputs
  the hook cannot read — it fails open rather than guessing.

The "imperative, lowercase description" wording of Conventional Commits is an
authoring convention the skill follows; the hook checks the mechanical format
only.

## How commits get authored

When you ask Claude to commit, the skill stages explicit paths for **one
logical change per invocation**, picks the type and scope from the resolved
vocabulary, omits the scope rather than inventing one when no allowlisted
area fits, and adds a body only when the subject alone cannot carry the
*why*. See [SKILL.md](SKILL.md) for the full recipe.

## Development

Run the hook's test suite (synthetic fixtures, no network, never touches a
real repo):

```sh
node tests/commit-message-cases.mjs
```
