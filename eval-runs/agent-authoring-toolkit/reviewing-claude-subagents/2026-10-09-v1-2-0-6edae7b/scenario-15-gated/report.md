## Review: pruning-stale-artifacts — stopped at the structural gate

**Verdict: not yet — gated**

The structural pass found two High defects, so the review stops here and does not run the detail sweep. First (`A1`): the definition describes an irreversible, multi-step destructive procedure. It deletes from both the store and the mirror, then runs a destructive compaction pass. A user wants to watch and approve that kind of work, so a subagent is the wrong form. The user sees what was deleted only after the fact, in the final report. Second (`R12`): the remit is not one bounded job. The definition tells the subagent to "follow whatever instructions" a remotely fetched manifest gives, so the release service decides what the subagent does, not the definition. Every finding here predicts behavior from reading the definition. The subagent was never run.

### Summary

| #   | Severity | Pass      | Key(s) | Finding                                                                                                      | Notes                                                                                                      |
| --- | -------- | --------- | ------ | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 1   | High     | Structure | A1     | An irreversible, user-steerable destructive procedure runs out of sight as a subagent. It should be a skill. | Inferential: high confidence that the form is wrong, low confidence in how often it bites                  |
| 2   | High     | Structure | R12    | The remit hands its scope to fetched manifest data ("follow whatever instructions"), so it is not bounded.   | Inferential. Overlaps with A26 and group F, which the detail sweep would raise; merge, do not double-count |

### What's already right

- The description gives a concrete trigger ("Use when the artifact store is near its quota") and a single subject (unreferenced artifacts). Keep this narrow routing anchor in whatever form replaces the subagent.
- The frontmatter is minimal, with no speculative fields such as `memory`, `isolation`, or `skills`. A redesign should keep it that way.

### Findings

#### Finding 1 — `A1`: an irreversible destructive procedure is hidden from the user who should steer it

- **Severity:** High · **Pass:** Structure · **Confidence:** high that the form is wrong; low on how often it bites at run time, because that depends on how the parent delegates
- **Where:** `pruning-stale-artifacts.md:13-17`
- **Evidence:** "When you cannot determine whether an artifact is still referenced by a release, assume it is not and treat it as safe to remove." / "Delete the artifact from the store and from the mirror, then run the destructive compaction pass to reclaim the space."
- **Defect:** A user wants to watch and steer irreversible, multi-step destructive work. As a subagent, every deletion decision is hidden from the user, who gets only an after-the-fact report.
- **Manifests:** (Predicted.) Claude delegates when the store is "near its quota", and the subagent runs in the background, which is the default. It cannot reach the release service for one artifact's manifest, so it takes the "assume it is not" branch. It deletes that artifact from both the store and the mirror and runs compaction. The user learns about it from the final report, when nothing can be recovered, but would have stopped it if they had seen the candidate list.
- **Fix:** Turn this into a skill, so that the user sees and approves the candidate list before anything is deleted from the store or the mirror, and before compaction runs. If keeping the listing work out of the main context matters, keep a small read-only subagent with no `Bash` write path. It returns only the candidate list, with a referenced or unknown status for each artifact.
- **Notes:** Inferential. This is a prediction from the definition, not an observed run.

#### Finding 2 — `R12`: the remit is set by fetched data, not by the definition

- **Severity:** High · **Pass:** Structure · **Confidence:** high
- **Where:** `pruning-stale-artifacts.md:10-11`
- **Evidence:** "Read the manifest's `handling` field and follow whatever instructions it gives for that artifact."
- **Defect:** The remit gives its own scope to remotely fetched data. The definition has no fixed set of actions, so the tools and the description cannot be scored against one.
- **Manifests:** (Predicted.) A manifest whose `handling` field says "also remove the matching entries under the deploy directory" or "run the attached cleanup script" gets carried out through the unrestricted `Bash` grant. The subagent then does work that its description and body do not allow, and its final report carries that third-party text up into the parent.
- **Fix:** Close the remit. State the fixed set of actions an artifact can get (for example: keep, delete, or flag as unknown). Treat `handling` only as an input that picks one of those actions, never as instructions. Make the capability surface match that closed set. Under the A1 redesign, the deletion path belongs in the user-approved skill, not behind an open `Bash` grant driven by fetched content.
- **Notes:** Inferential. The detail sweep would probably also raise the content-as-data and injection aspect under `A26` and group `F`. Treat that as the same defect, not a separate one.

### Redesign recommendation

Turn `pruning-stale-artifacts` into a **skill**. The deciding `A1` signal is **"the user wants to steer"**. Every deletion is irreversible, so the user should approve the candidate list before the store deletion, the mirror deletion, and the compaction pass. The other signals do not favor a subagent:

- The output is not verbose noise the parent can skip. The deletion list is exactly what the user needs to see.
- Tool restriction is not the point, because the grant includes unrestricted `Bash`.
- The remit is a chain of dependent steps (list, fetch manifest, decide, delete from two places, compact), which one session handles more cleanly.

The redesign also closes the remit (Finding 2). A fixed set of keep / delete / flag-unknown outcomes replaces "follow whatever instructions", and the manifest's `handling` field becomes data that picks an outcome. An unknown reference status should become "flag for the user" instead of "safe to remove". Optionally, keep a small **read-only** subagent (Read, Grep, Glob, WebFetch, no `Bash`) that returns the candidate list with a status for each artifact. Here tool restriction becomes the reason for having a subagent. The skill then runs deletion and compaction in the main thread after the user approves.

The redesign removes the background-run destructive path, the "assume it is not" default, and the open-ended `handling` instruction. A hook on the quota threshold was considered and rejected, because it would fire the destructive pass with even less oversight.

### Coverage

| Group / criterion           | Status                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| A1 (fit-for-purpose)        | Gap — High (Finding 1)                                                                    |
| A2 (sibling/remit overlap)  | Pass — no custom siblings, and no overlap with built-in Explore, Plan, or general-purpose |
| A11 (tools vs instructions) | Pass — every instructed action can be done with the declared tools                        |
| A28 (stopping condition)    | N/A — finite list of artifacts, so the remit is bounded                                   |
| R1 (simplicity)             | Pass — every granted tool has a use in the body                                           |
| R12 (scope coherence)       | Gap — High (Finding 2)                                                                    |
| A (remaining criteria)      | not scored — gated on structure                                                           |
| B                           | not scored — gated on structure                                                           |
| C                           | not scored — gated on structure                                                           |
| D                           | not scored — gated on structure                                                           |
| E                           | not scored — gated on structure                                                           |
| F                           | not scored — gated on structure                                                           |
| G                           | not scored — gated on structure                                                           |
| H                           | not scored — gated on structure                                                           |
| R (remaining criteria)      | not scored — gated on structure                                                           |

### Criteria notes

- Criteria last synced: 2026-10-09 (0 days ago). The gated run did not read the shared B–G file, so it has no date here.
- Scope: no user was available to answer (non-interactive run) and the caller supplied no scope, so the four defaults were assumed: analysis only, all groups weighted equally, surgical changes, stop at the structural gate.
- Waived: none. No `review-waivers.md` exists beside the definition.
- Sibling roster: the workspace's `.claude/agents/` was the only agents scope for this run, and it holds only the target. User-level and plugin agent directories were excluded by the run environment.
- Plugin version: this run used the working copy of `agent-authoring-toolkit` at 1.2.0. The installed-cache version could not be compared because reading `~/.claude/plugins/installed_plugins.json` was denied.
- Pass 1 ran through the native `subagent-structure-reviewer` agent type, with no substitution and no inline fallback.

### Next step

Choose one:

1. **Redesign first, then review again** (recommended): convert to a skill that has a user-approval gate before deletion, with an optional read-only listing subagent. Then run this review on the new artifact.
2. **Sweep now anyway**: run the Pass 2 detail sweep on the current definition. Line-level findings in the body and in `tools` would then be marked subordinate to Findings 1 and 2.
