---
name: doc-audit
description: >-
  Periodic health check for the agent knowledge base. Runs static checks
  (stale references, missing files, formatting) and semantic analysis
  (contradictions, redundancies). Suggested every 7 days or when docs
  feel inconsistent.
---

# Skill: Doc Self-Audit

Periodic health check for the agent knowledge base. Combines static analysis with AI-powered semantic review to keep docs organized, deduplicated, and discoverable.

## When to Activate

- User says "audit my docs", "check doc health", or similar
- AGENTS.md pre-flight suggests it (7+ days since last audit)
- After a session that added significant new content to any doc file

## Step 1: Run Static Analysis

Run the static audit script and capture the output:

```bash
npm run audit-docs
```

Read the full report. The script checks:
- **Server health** — reads `docs/port-registry.md` and verifies every service marked "running" actually responds on its port (both main site and playground must be live)
- **File size** — docs over 300 lines are harder for agents to process
- **Heading hierarchy** — skipped heading levels hurt navigation
- **Section index accuracy** — index entries that don't match actual headings
- **Broken cross-references** — dead links between docs
- **Orphan detection** — docs not referenced from any entry point
- **Duplicate content** — identical paragraph blocks across files
- **Stale markers** — TODO, FIXME, TBD, HACK, XXX counts

Triage the static findings:
- **ERROR** = fix now (broken references, stale section indexes)
- **WARN** = assess and fix if straightforward (file size, duplicates, orphans)
- **INFO** = note for awareness (stale markers)

## Step 2: AI-Powered Semantic Analysis

After reviewing the static report, read every doc file listed below and perform these checks that require reasoning:

**Files to read:**

Hub docs:
- `AGENTS.md`
- `docs/design.md`
- `docs/engineering.md`
- `docs/content.md`
- `docs/architecture.md`
- `docs/port-registry.md`

Spoke directories (scan all files in each):
- `docs/design/*.md`
- `docs/engineering/*.md` (if exists)
- `docs/content/*.md`

Anti-pattern catalogs:
- `docs/design-anti-patterns.md`
- `docs/engineering-anti-patterns.md`
- `docs/content-anti-patterns.md`

Active feedback logs (30 entries each):
- `docs/design-feedback-log.md`
- `docs/engineering-feedback-log.md`
- `docs/content-feedback-log.md`

Synthesis files (distilled lessons from archived entries):
- `docs/design-feedback-synthesis.md`
- `docs/engineering-feedback-synthesis.md`

Archive files (cold storage — only read during deep audits):
- `docs/design-feedback-log-archive.md`
- `docs/engineering-feedback-log-archive.md`

All skills:
- `.cursor/skills/design-iteration/SKILL.md`
- `.cursor/skills/engineering-iteration/SKILL.md`
- `.cursor/skills/content-iteration/SKILL.md`
- `.cursor/skills/playground/SKILL.md`
- `.cursor/skills/orchestrator/SKILL.md`
- `.cursor/skills/checkpoint/SKILL.md`
- `.cursor/skills/cross-app-parity/SKILL.md`
- `.cursor/skills/cms-parity/SKILL.md`
- `.cursor/skills/doc-audit/SKILL.md` (this file — check for self-referential consistency)

### Check A: Semantic Duplicates

Look for the **same concept** explained in different words across files. This is different from the static duplicate check (which catches identical text). Examples:
- A rule in `AGENTS.md` that is also stated differently in `docs/engineering.md`
- An anti-pattern described in both `design-anti-patterns.md` and `design.md`
- A process step duplicated between a skill file and a doc file

For each semantic duplicate found, recommend which file should be the **single source of truth** and which should reference it instead.

### Check B: Discoverability

For each piece of information, ask: "If an agent needed this, would it find it?" Specifically:
- Is information placed in the file where an agent routed by `AGENTS.md` Pre-Flight would look?
- Are there rules or principles buried in the wrong doc? (e.g., an engineering rule in `design.md`, a design principle in `architecture.md`)
- Are there important patterns only mentioned deep in a feedback log but not yet promoted to the corresponding principles doc (`design.md` or `engineering.md`)?

### Check C: Coherence

Look for contradictions between files:
- Does `AGENTS.md` say one thing while a skill file says another?
- Do anti-patterns conflict with principles in the main docs?
- Are there outdated references to removed features or archived experiments?

### Check D: Information Density

Assess whether sections are appropriately sized for agent consumption:
- **Too verbose** — walls of text that bury the actionable instruction. Recommend condensing.
- **Too terse** — critical rules with no context or examples. Recommend expanding.
- **Appendix bloat** — frequency maps or logs that have grown so large they slow down file reads. Recommend archiving old entries.
- **Feedback log cap** — active logs should not exceed 30 entries. If they do, archive the oldest to the corresponding archive file and update the synthesis file.

### Check E: Structural Consistency

Verify that parallel docs follow the same patterns:
- Do `design.md`, `engineering.md`, and `content.md` use the same Section Index format?
- Do all three feedback logs use the same entry template?
- Do all three iteration skills follow the same step structure?
- Do all three anti-pattern catalogs include a category index?
- Do hub files correctly link to their spoke files?
- Do synthesis files accurately reflect the themes in the archived entries?

## Step 3: Fix What You Can

For findings that are straightforward to fix:
1. Fix broken cross-references (update links)
2. Fix section index mismatches (align index entries to actual headings)
3. Add orphaned docs to the appropriate reference in `AGENTS.md`

For findings that need user input:
1. Present a summary of recommended changes
2. Wait for user approval before reorganizing content or merging duplicate sections

## Step 4: Log the Audit

Append findings to `docs/doc-audit-log.md` using this format:

```markdown
## Audit — YYYY-MM-DD

**Static findings:** N error(s), N warning(s), N info(s)

### Fixes Applied
- [List of changes made]

### Recommendations (Pending User Review)
- [List of suggested changes that need approval]

### Semantic Findings
- [Duplicates, discoverability issues, coherence problems found]
```

If `docs/doc-audit-log.md` doesn't exist yet, create it with:

```markdown
# Doc Audit Log

Append-only log of periodic doc self-audits. Newest entries first.

---
```

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `scripts/audit-docs.mjs` | Static analysis script | Never (just run it) | When adding new checks |
| `docs/doc-audit-log.md` | Audit history | Session start (check last audit date) | After every audit |
| `AGENTS.md` | Entry point, routing table | During orphan/discoverability analysis | When fixing orphans |
| `docs/design.md` | Design principles hub | During semantic analysis | When promoting patterns |
| `docs/engineering.md` | Engineering principles hub | During semantic analysis | When promoting patterns |
| `docs/content.md` | Content strategy hub | During semantic analysis | When promoting patterns |
| `docs/design/*.md` | Design spoke files | During semantic analysis | When updating spoke content |
| `docs/content/*.md` | Content spoke files | During semantic analysis | When updating spoke content |
| `docs/design-feedback-synthesis.md` | Distilled lessons from archived design entries | During deep audits | When archiving new entries |
| `docs/engineering-feedback-synthesis.md` | Distilled lessons from archived engineering entries | During deep audits | When archiving new entries |
| `docs/design-feedback-log-archive.md` | Cold storage: raw archived design entries | During deep audits only | When archiving new entries |
| `docs/engineering-feedback-log-archive.md` | Cold storage: raw archived engineering entries | During deep audits only | When archiving new entries |
