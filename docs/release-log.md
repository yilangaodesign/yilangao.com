# Release Log

> **What this file is:** Chronological record of ship-it releases with incidents and lessons learned (last 15 entries). Newest entries first.
>
> **Who reads this:** AI agents when the `ship-it` skill is activated — scan recent entries for recurring pitfalls before starting a new release.
> **Who writes this:** AI agents after each ship-it run via the Post-Release Audit protocol in `ship-it/SKILL.md`.
> **Last updated:** 2026-04-02 (REL-001: Élan 2.2.0, ASCII Art Studio 0.2.1)

---

## REL-001 — Élan 2.2.0, ASCII Art Studio 0.2.1 (2026-04-02)

**Scope:** 78 files across 10 layer commits + 2 build-gate fix commits + release/sync commits
**Semver:** Minor — new VerticalNav component, NavItem sub-components (NavItemChildren, NavItemTrigger), expanded design tokens (colors, motion, typography), Checkbox API expansion
**Previous release:** Élan 2.1.0, ASCII Art Studio 0.2.0

**Incidents during release:**

1. **Build gate failure #1 — wrong `SubsectionHeading` API** (→ REL-AP-002)
   Vertical-nav playground page passed `title` and `description` props to `SubsectionHeading`, which only accepts `children: string`. Fixed by replacing with `<SubsectionHeading>Subcomponents</SubsectionHeading>` and a separate `<p>` for the description.

2. **Build gate failure #2 — wrong `SourcePath` API** (→ REL-AP-002)
   Same page used `<SourcePath>path here</SourcePath>` (children) instead of `<SourcePath path="..." />`. Fixed by switching to the `path` prop.

3. **Branch switch blocked by uncommitted sync targets** (→ REL-AP-001)
   After `npm run version:release`, the auto-synced files (`playground/src/lib/elan.ts`, `ascii-tool/src/lib/version.ts`) were modified but not staged. `git checkout main` failed with "local changes would be overwritten." Fixed by committing sync targets before checkout.

**Layer classification notes:**
- NavItem files (new sub-components + modified parent) were grouped together in Layer 5 rather than splitting new files into Layer 5 and modified files into Layer 6. Component families should stay together. (→ REL-AP-003)
- Layer 3 (Dependencies) was a removal (tailwind-merge), not an addition. Template message adapted. (→ REL-AP-004)

**Outcome:** All 3 builds passed after fixes. Fast-forward merge to main. Vercel deploy status: Ready in ~2 minutes.

---
