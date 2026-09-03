#!/bin/sh
# Session bootstrap: report the toolchain, install dependencies when the lockfile moved.
# Matched to startup|resume only; a fork runs beside its parent and must not install under it.
# Delivers idempotence across sequential sessions; two concurrent starts are an accepted race.
set -u
report=""
add() { report="${report}${report:+\n}$1"; }
emit() {
    if command -v jq >/dev/null 2>&1; then
        printf "%b" "$report" | jq -Rs '{systemMessage: ., hookSpecificOutput: {hookEventName: "SessionStart", additionalContext: .}}'
    else printf "%b\n" "$report"; fi
}
trap emit EXIT
here=${0%/*}; [ "$here" = "$0" ] && here=.
lib="$here/lib/readiness-checks.sh"
[ -f "$lib" ] || { add "✗ $lib is missing — this checkout is incomplete; nothing was bootstrapped"; exit 0; }
. "$lib"
cd "${CLAUDE_PROJECT_DIR:-$PWD}" || { add "✗ cannot enter ${CLAUDE_PROJECT_DIR:-$PWD} — nothing was bootstrapped"; exit 0; }

add "FOUND"
readiness_check_tools
# Captured, not piped: a pipe would run the loop in a subshell and lose every line added there.
found=$(readiness_tool_report "(run the checking-readiness skill for a fix guide)" | sed 's/^/  /')
[ -z "$found" ] || add "$found"
add ""; add "DONE"
if [ "$have_node" = true ] && [ "$have_npm" = true ]; then
    if readiness_deps_fresh; then add "  ✓ node_modules fresh — the lockfile has not moved since the last install"
    else
        t0=$(date +%s)
        if npm install >&2; then git hash-object package-lock.json >node_modules/.readiness-stamp; add "  ✓ node_modules installed (npm install, $(( $(date +%s) - t0 ))s) — the tree was missing or the lockfile had moved"
        else add "  ✗ npm install failed — dependencies are NOT installed; builds, tests and lint will fail until it succeeds"; fi
    fi
else add "  ✗ node_modules skipped (node or npm missing) — nothing is installed"; fi
