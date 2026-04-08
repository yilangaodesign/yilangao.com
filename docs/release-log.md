# Release Log

> **What this file is:** Chronological record of ship-it releases with incidents and lessons learned (last 15 entries). Newest entries first.
>
> **Who reads this:** AI agents when the `ship-it` skill is activated — scan recent entries for recurring pitfalls before starting a new release.
> **Who writes this:** AI agents after each ship-it run via the Post-Release Audit protocol in `ship-it/SKILL.md`.
> **Last updated:** 2026-04-08 (REL-008: Élan 2.7.0, ASCII Art Studio 0.5.2)

---

## REL-008 — Élan 2.7.0, ASCII Art Studio 0.5.2 (2026-04-08)

**Scope:** 46 files merged to `main` (39 working-tree changes plus release artifacts): 8 dependency-ordered layer commits, 1 release commit, 1 dev patch bump on `dev` after merge
**Semver:** Minor — `version:auto` promoted Élan 2.6.1 → 2.7.0 (new `MediaRenderer.module.scss` in a tracked component family); typography token/mixin expansion; DropdownMenu and portfolio/project surface updates
**Previous release:** Élan 2.6.0, ASCII Art Studio 0.5.1

**Incidents during release:**
- **Shell commit-message substitution:** `git commit -m "release: Élan $(node -p \"require('./elan.json')...\")"` failed in `bash` (bad escaping). **Resolution:** amended both the release commit and the post-merge dev-bump commit with literal version strings in the message.
- **Vercel post-deploy poll:** `vercel ls --prod` from repo root targets **yilangao-design-system** (playground) per `.vercel/project.json`; newest production deployment was **Queued** at poll time (~2m after push). **Resolution:** treat as in-flight; re-check dashboard if needed. Main site project (`yilangao-portfolio`) is not shown by default from this working directory.

**Build gate:** All three apps passed (`playground`, root main site, `ascii-tool`) on first attempt. Same non-blocking Sass `darken()` deprecation warnings in `ProjectEditModal.module.scss` as REL-007.

**Layer classification notes:**
- Phase 2 removed untracked macOS duplicate tree `src/styles 2/` (`* 2.*` junk); not merged.
- `npm run sync-tokens` run before ship commits; playground `prebuild` also runs sync-tokens — working tree stayed clean after builds.
- `MediaRenderer` new `.module.scss` grouped with `MediaRenderer.tsx` in one commit (REL-AP-003).
- `CHANGELOG.md` updated for 2.7.0; ASCII 0.5.2 noted as release sync without new app code in this batch.

---

## REL-007 — Élan 2.6.0, ASCII Art Studio 0.5.1 (2026-04-07)

**Scope:** 66 files across 10 layer commits + release commit + dev patch bump
**Semver:** Minor — new MediaRenderer component, 3 elan-visuals (CollaborationLoop, MaturityTimeline, SkillMap), halftone portrait login, new dependencies (d3-hierarchy, three, culori)
**Previous release:** Élan 2.5.0, ASCII Art Studio 0.5.0

**Incidents during release:** None. All 3 build gates passed on first attempt.

**Layer classification notes:**
- Phase 2 caught 6 tracked macOS duplicate files (e.g., `file 2.svg`, `renovate 2.json`) — these were pre-existing tracked junk, not from this session.
- `public/videos/portrait.mp4` (4.4MB) committed as a static asset for the halftone portrait effect. Acceptable size but worth monitoring if more videos are added.
- ASCII Art Studio released as 0.5.1 (patch) with no new changes — just the dev patch counter from REL-006.
- Layer 7 (site components) was the largest code addition: 6 new elan-visual files totaling ~2,400 lines.
- All new files passed the REL-AP-005 dead code check (imports verified for MediaRenderer, elan-visuals, HalftonePortrait, useInteractionVelocity).
- 2 Sass deprecation warnings in main site build (`darken()` in ProjectEditModal.module.scss) — non-blocking, tracked for future cleanup.

---

## REL-006 — Élan 2.5.0, ASCII Art Studio 0.5.0 (2026-04-06)

**Scope:** 104 files across 9 layer commits + release commit + 2 build-gate fix commits + dev patch bump
**Semver:** Minor — new Tooltip subsystem (InfoTooltip, TooltipProvider), block editor for inline editing, Etro API route, expanded content framework
**Previous release:** Élan 2.4.1, ASCII Art Studio 0.4.1

**Incidents during release:**

1. **Build gate failure #1 — type predicate on destructured binding** (TypeScript error)
   `ProjectClient.tsx` used `.filter(({ block }): block is ...` which TypeScript rejects — type predicates cannot reference destructured elements. Fixed by rewriting as `.filter((item): item is ...`.

2. **Build gate failure #2 — wrong pretext API** (TypeScript error)
   `TestimonialCard.tsx` called `pretext.layoutNextLineRange()` and `pretext.materializeLineRange()`, which don't exist on the main export (`layout.d.ts`). The correct API is `pretext.layoutNextLine()` which returns a `LayoutLine` with `.text` directly. Fixed by consolidating to `layoutNextLine`.

3. **REL-AP-005 triggered — dead `src/lib/utils.ts`** (caught in Phase 1)
   Same file from REL-004 was re-created — imports `tailwind-merge` (not installed), not imported by anything. Caught during Phase 1 classification per the pitfall check. Deleted before committing.

**Layer classification notes:**
- Largest release to date: 104 files across 9 layers (no empty layers except 4 and 10).
- Layer 1 (Docs) had 33 files — the content framework expansion (14 new doc files).
- Layer 5 applied REL-AP-003 (component family rule) for Tooltip directory.
- Layer 7 (Site components) had 18 files — the block editor subsystem is the largest single feature.
- 8 macOS duplicate junk files cleaned in Phase 2 (same `* 2.*` pattern as REL-004).

**Outcome:** All 3 builds passed after 2 fix commits. Fast-forward merge to main. Playground deployed Ready in 53s. Main site responding 200 at `https://new.yilangao.com`.

---

## REL-005 — Élan 2.4.1, ASCII Art Studio 0.4.1 (2026-04-03)

**Scope:** 15 files across 5 layer commits + release commit
**Semver:** Patch — accent token chroma optimization, rich text paragraph break fix, debug logging cleanup
**Previous release:** Élan 2.4.0, ASCII Art Studio 0.4.0

**Incidents during release:**

1. **ASCII tool build ENOTEMPTY** (transient, not a pitfall)
   `rm -rf ascii-tool/.next` and retry resolved it. Stale `.next/server` directory from a previous build couldn't be cleaned by Next.js.

**Layer classification notes:**
- No new files, no deletions — all 15 files were modifications (M).
- Clean 5-layer split: docs (5), tokens (1), site components (3), frontend pages (4), playground (2).
- No ambiguous classifications this release.

**Outcome:** All 3 builds passed (ASCII tool on second attempt after cache clear). Fast-forward merge to main. Playground deployed Ready in 53s. Main site responding 200 at `https://new.yilangao.com`.

---

## REL-004 — Élan 2.4.0, ASCII Art Studio 0.4.0 (2026-04-03)

**Scope:** 55 files across 7 layer commits + release commit + 1 fix commit
**Semver:** Minor — new site-level components (Footer, Navigation, Marquee, animations, theme), expanded color tokens, playground SCSS module migration
**Previous release:** Élan 2.3.0, ASCII Art Studio 0.3.0

**Incidents during release:**

1. **Build gate caught missing dependency** (new pitfall → REL-AP-005)
   `src/lib/utils.ts` (standard shadcn `cn` utility) imported `tailwind-merge` which was not installed. The file was also not imported by any other file (dead code). Removed the file; main site build passed on retry.

2. **Git push timeout** (transient, not a pitfall)
   First two `git push` attempts failed with `mmap failed: Operation timed out`. Fixed by increasing `http.postBuffer` and `pack.windowMemory` git config. Third attempt succeeded.

**Layer classification notes:**
- `src/lib/utils.ts` was classified as Layer 5 (new lib) and grouped with Layer 7 (site components). It turned out to be dead code — future classification should verify imports for new utility files before including them.
- All 17 macOS duplicate junk files (`* 2.*` pattern + `src/styles 2/` directory) cleaned in Phase 2.

**Outcome:** All 3 builds passed after fix commit. Fast-forward merge to main. Playground deployed Ready in 55s. Main site responding 200 at `https://new.yilangao.com`.

---

## REL-003 — Élan 2.3.0, ASCII Art Studio 0.3.0 (2026-04-03)

**Scope:** 92 files across 12 layer commits + release commit
**Semver:** Minor — new UI components (Eyebrow, Menu, TextRow), company password gate feature, new ASCII engines (dot-grid, image-filters), expanded Input/DropdownMenu/Kbd components
**Previous release:** Élan 2.2.0, ASCII Art Studio 0.2.1

**Incidents during release:**

1. **Branch switch blocked by uncommitted sync target** (→ REL-AP-001, occurrence #2)
   Playground build's `prebuild` step ran `sync-tokens.mjs`, which regenerated `playground/src/lib/tokens.ts` with 2 new lines. This file wasn't staged in the release commit. `git checkout main` failed. Fixed by amending the release commit to include the sync output.

**Layer classification notes:**
- Company password gate files (9 files spanning collections, lib, scripts, admin components, and frontend pages) were grouped as a single feature commit (Layer 7a) rather than splitting across Layers 5/7/8 — cohesive feature commits are easier to review.
- CMS collection admin group changes (Books, Experiments, Projects, Testimonials all changing `group` to "Content") were grouped with frontend pages in Layer 8 since they're trivial label changes.

**Outcome:** All 3 builds passed on first attempt. Fast-forward merge to main. Playground deployed Ready in 55s. Main site responding 200 at `https://new.yilangao.com`.

---

## REL-002 — Main site deployed to new.yilangao.com (2026-04-02)

**Scope:** First production deployment of the portfolio site. Documentation updates (4 files) + build fixes (5 files).
**Vercel project:** `yilangao-portfolio` (root dir `.`, production branch `main`)
**Domain:** `new.yilangao.com` (Cloudflare CNAME → `cname.vercel-dns.com`, grey cloud / DNS-only)

**Incidents during deployment:**

1. **Build failure #1 — Payload `importMap.js` gitignored** (→ ENG-096, EAP-060)
   Payload auto-generates `importMap.js` during local dev. The file was in `.gitignore`, so it never reached GitHub. Vercel build failed with `Module not found: Can't resolve '../importMap'` in three Payload admin files. Fixed by removing from `.gitignore` and committing the generated file.

2. **Build failure #2 — `resend` not in `package.json`** (→ ENG-096)
   The contact route used `await import("resend")` with a runtime guard and `@ts-expect-error`. Turbopack resolves all imports at build time regardless of runtime conditions. Fixed by adding `resend` to `package.json` and removing the `@ts-expect-error`.

**Documentation updates shipped with deployment:**
- `docs/architecture.md` §4: production deployment table, domain/DNS architecture, source code security, staged migration rationale, build boundaries
- `docs/engineering/deployment.md`: main site Vercel mapping, DNS config, env vars
- `docs/engineering/multi-app-architecture.md`: Section 9.6 production build boundaries
- `AGENTS.md`: App Registry with production URLs, Vercel project names, hosting columns

**Outcome:** Build succeeded after fix commit. Production deployment Ready in ~2 minutes. Domain verified, SSL provisioned by Vercel. Site accessible at `https://new.yilangao.com`.

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
