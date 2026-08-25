# Eval run records

Version-controlled evidence for eval campaigns against this repo's skills and agents. Each
run answers, from `git log` alone: which guarantee was tested, at which version, and what
the evidence was.

## Layout

```
eval-runs/
  <plugin>/                        # e.g. agent-authoring-toolkit
    <skill-name|agent-name>/       # e.g. reviewing-claude-skills
      <YYYY-MM-DD>-<version>-<short-sha>/   # one immutable directory per run; version =
                                            # the plugin version tested, dots as hyphens
                                            # (v1-0-0); sha = repo HEAD tested. The sha is
                                            # authoritative — plugin versions span many
                                            # commits, and a squash merge replaces branch
                                            # shas, so tag the tested commit if the branch
                                            # will be deleted after merging.
        summary.md                 # the human-readable record (fields below)
        timing.json                # tokens + duration per scenario
        machine-checks.txt         # output of the suite's machine-checkable grading scripts
        scenario-<id>/             # one directory per scenario run
          transcript.jsonl         # session + subagent transcripts
          report.md                # the output the run produced (review report, loop report)
          grading.json             # the independent grader's PASS/FAIL with evidence quotes
```

Run directories are append-only: a new run gets a new directory, and an existing one is
never edited, so the history stays diff-quiet and every record keeps meaning what it meant
when it was committed. Loop-skill runs additionally keep the scratch workspace's
`git log -p` output (`workspace-log.txt`), because the round-by-round commits are the
loop's evidence. The scratch workspaces themselves are not committed — they are
reconstructable from the skill's `evals/files/` fixtures.

## summary.md required fields

- Date, repo HEAD SHA tested, plugin name + version, model, runner.
- Scope and deliberate deviations (e.g. subset only, baseline arm skipped) — a skipped
  scenario or arm is listed as deferred, never left silent.
- Per-scenario table: id, name, PASS/FAIL per assertion with a quoted-evidence line — an
  opinion without a quotation is not a grade.
- Tokens and duration per scenario, so the skill's value reads as a delta, not a vibe.
- Machine-check results.
- Incidents: a scenario that flips between runs is diagnosed (flaky eval vs ambiguous
  instructions), not averaged.

## Grading rules

- Each scenario runs in a clean context with fixtures staged into a scratch workspace, per
  the suite's own `how_to_run`.
- Grading is done by a separate fresh instance, never the session that produced the output.
- Assertions that pass identically with and without the skill are flagged for removal once
  the baseline arm has been run.
