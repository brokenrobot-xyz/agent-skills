# Development environment

Node 22 per `.node-version`; `npm ci` provides the rest.

## Verify

```sh
node -v && npm -v   # 22.11.0 / ≥ 10.9.0
npm run lint && npm test && npm run build
```

## Troubleshooting

The symptoms below are the ✗ lines the `SessionStart` hook and the `checking-readiness` skill
emit; both run `.claude/hooks/lib/readiness-checks.sh`. Detection wording lives there and these
headings track it.

### ✗ git missing

Install with Homebrew: `brew install git`.

### ✗ node missing · ✗ node is … but .node-version pins …

Install fnm and run `fnm install && fnm use` from the checkout.

### ✗ npm not found

npm ships with Node; fixing the Node install fixes this too.

### ✗ dependencies: node_modules missing or stale · ✗ npm install failed

Run `npm ci` from the checkout, or start a session and let the hook install.

### ✗ docker missing

Hand-written, not generated: ask Priya for the VPN note before installing Docker Desktop — the
corporate proxy blocks the default download, and the note has the mirror URL. Keep this entry.

### ✗ dependencies: not checked · ✗ node_modules skipped · ✗ cannot enter … · ✗ … is missing

Cascades: fix the root-cause ✗ above and these clear on the next run. A missing library file means
the checkout is incomplete: re-clone it.
