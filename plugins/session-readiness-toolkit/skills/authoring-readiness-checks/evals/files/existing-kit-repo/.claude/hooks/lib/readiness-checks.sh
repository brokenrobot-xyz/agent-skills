#!/bin/sh
# Shared readiness probes. Sourced by session-start.sh (which acts) and run directly by the
# checking-readiness skill (which only reads). Symptom wording lives here; remedies live in
# docs/development-environment.md, keyed on the ✗ prefixes below.
have_node=false; have_npm=false; ok=""; problems=""
tool_ok() { ok="${ok}${ok:+, }$1"; }
tool_bad() { problems="${problems}${problems:+\n}✗ $1"; }

readiness_check_tools() {
    if command -v git >/dev/null 2>&1; then tool_ok "git $(git --version | cut -d" " -f3)"; else tool_bad "git missing — the lockfile stamp cannot be computed, so dependencies reinstall every session"; fi
    pin=$(cat .node-version 2>/dev/null)
    if command -v node >/dev/null 2>&1; then
        have_node=true; ver=$(node --version); ver=${ver#v}
        if [ "$ver" = "$pin" ]; then tool_ok "node $ver (=.node-version)"; else tool_bad "node is $ver but .node-version pins ${pin:-unknown} — installs and builds may misbehave"; fi
    else tool_bad "node missing — dependencies cannot be installed; builds, tests and lint cannot run"; fi
    if command -v npm >/dev/null 2>&1; then have_npm=true; tool_ok "npm $(npm --version)"; else tool_bad "npm missing — dependencies cannot be installed"; fi
    # Added after the doc was last touched: this symptom has no troubleshooting entry yet.
    if command -v jq >/dev/null 2>&1; then tool_ok "jq"; else tool_bad "jq missing — the session report degrades to plain text"; fi
}

readiness_tool_report() { # $1 = pointer suffix for ✗ lines
    [ -z "$ok" ] || printf "✓ tools: %s\n" "$ok"
    [ -z "$problems" ] || printf "%b\n" "$problems" | sed "s|\$| $1|"
}

readiness_deps_fresh() {
    hash=$(git hash-object package-lock.json 2>/dev/null)
    [ -n "$hash" ] && [ "$(cat node_modules/.readiness-stamp 2>/dev/null)" = "$hash" ]
}

if [ "${0##*/}" = "readiness-checks.sh" ]; then
    cd "${CLAUDE_PROJECT_DIR:-$PWD}" || { echo "✗ cannot enter ${CLAUDE_PROJECT_DIR:-$PWD} — nothing was checked"; exit 1; }
    rc=0; readiness_check_tools; readiness_tool_report ""; [ -z "$problems" ] || rc=1
    if [ "$have_node" = true ] && [ "$have_npm" = true ]; then
        if readiness_deps_fresh; then echo "✓ dependencies: fresh"; else echo "✗ dependencies: node_modules missing or stale — builds, tests and lint will misbehave"; rc=1; fi
    else echo "✗ dependencies: not checked (node or npm missing)"; rc=1; fi
    exit $rc
fi
