# Release Log

> **What this file is:** Chronological record of ship-it releases with incidents and lessons learned (last 15 entries). Newest entries first.
>
> **Who reads this:** AI agents when the `ship-it` skill is activated — scan recent entries for recurring pitfalls before starting a new release.
> **Who writes this:** AI agents after each ship-it run via the Post-Release Audit protocol in `ship-it/SKILL.md`.
> **Last updated:** 2026-04-03 (REL-004: Élan 2.4.0, ASCII Art Studio 0.4.0)

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
