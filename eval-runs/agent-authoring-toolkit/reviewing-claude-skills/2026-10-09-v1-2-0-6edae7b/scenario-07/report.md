Review progress:

- [x] 1. Locate the target bundle
- [ ] 2. Brief the user, then interview to scope <- stopped here, awaiting scope answers
- [ ] 3. Pass 1 — spawn the skill-structure-reviewer
- [ ] 4. Gate — stop on a High structural finding, else continue
- [ ] 5. Pass 2 — spawn the skill-detail-reviewer
- [ ] 6. Consolidate — spot-check, merge, rank
- [ ] 7. Write the gap analysis
- [ ] 8. Offer interactive apply
- [ ] 9. Verify

Target bundle: `.claude/skills/triaging-bug-reports/` (contains only `SKILL.md`; no evals, references, scripts, or hooks). Frontmatter: no `model:` pin (group `B` is conditional on it). This run exercises the agent-authoring-toolkit working copy, version 1.2.0 (the installed cache entry for another project is 1.1.0).

I'll review **triaging-bug-reports** in two passes: first the structure — is the workflow's shape
sound? — then, if the structure holds, the full detail sweep. Each pass runs in its own
subagent that reads the bundle and the criteria in its own context, so this conversation
stays lean; I read only what I verify or edit.

**Pass 1 — Structure** (cheap, offline): decision space, scope coherence, simplicity,
length and progressive disclosure, degrees of freedom, defaults vs menus,
over-prescription, verifiable intermediates ahead of destructive steps. If any of
these fails **High**, I stop there and give you a
structural verdict with a redesign recommendation — detail findings against a
structure that's about to change are wasted work. (You can tell me to run the full
sweep regardless.)

**Pass 2 — Detail** (the full sweep): criteria groups A–H and R — skill authoring,
prompting, hallucination/consistency/injection/leak defenses, evals, and the host
project's conventions.

**What you'll get:** a computed verdict — **acceptable** (zero unwaived blocking
findings) or **not yet** — then either the structural verdict with a redesign
recommendation, or a gap analysis: blocking findings (High/Medium, each with the
concrete scenario where it bites), advisory notes that never gate the verdict, and
a per-group coverage table. Your recorded waivers are honored. Then, if you want,
I fix or waive findings with you, one at a time.

**Effort:** the structural pass is a couple of turns; the full sweep is a handful more.
The whole review runs offline against the criteria shipped with this plugin, and the
report tells you how old they are.

Before I start, four scoping questions (say "use the defaults" to accept all of them):

1. **Deliverable** — just the gap analysis, or also apply the fixes you approve afterward? _(default: analysis only)_
2. **Focus** — weight all groups equally, or care most about some (e.g. discovery, evals, security)? _(default: all equal)_
3. **Change appetite** — surgical tweaks only, or open to bigger restructuring? _(default: surgical)_
4. **Structural gate** — if the structure fails High, stop with the structural verdict, or run the full detail sweep anyway? _(default: stop)_
