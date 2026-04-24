# Release Log

> **What this file is:** Chronological record of ship-it releases with incidents and lessons learned (last 15 entries). Newest entries first.
>
> **Who reads this:** AI agents when the `ship-it` skill is activated — scan recent entries for recurring pitfalls before starting a new release.
> **Who writes this:** AI agents after each ship-it run via the Post-Release Audit protocol in `ship-it/SKILL.md`.
> **Last updated:** 2026-04-24 (REL-021: Élan 2.11.9, yilangao.com 1.3.9, ASCII Art Studio 0.6.11)

---

## REL-021 — Élan 2.11.9, yilangao.com 1.3.9, ASCII Art Studio 0.6.11 (2026-04-24)

**Scope:** 5 files across 2 dependency-ordered layer commits (L1 docs x4, L6 component update x1) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-5, 7-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.9: Textarea SCSS cleared. yilangao.com 1.3.9: docs only. ASCII Art Studio 0.6.11: manifest sync only.
**Previous release:** Élan 2.11.8, yilangao.com 1.3.8, ASCII Art Studio 0.6.10

**Incidents during release:** None. Clean pass through all phases.

**Build gate:** Playground ~29s, main site ~44s, ASCII tool ~18s. All passed first attempt.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready (58s build) within 4m of the `main` push.

**Layer classification notes:**
- L1: `docs/content-feedback-log.md` (CF-026 through CF-028, Chalk personalization), `docs/engineering-feedback-log.md` (ENG-205), `docs/engineering.md` (frequency map), `docs/port-registry.md` (PIDs + restart log).
- L6: `src/components/ui/Textarea/Textarea.module.scss` (file emptied — styles cleared).

---

## REL-020 — Élan 2.11.8, yilangao.com 1.3.8, ASCII Art Studio 0.6.10 (2026-04-23)

**Scope:** 2 files across 2 dependency-ordered layer commits (L0 config ×1, L8 frontend ×1) + 1 release commit + 1 dev-patch-bump commit. Layers 1-7, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.8: new `personalize` agent skill. yilangao.com 1.3.8: favicon added. ASCII Art Studio 0.6.10: manifest sync only.
**Previous release:** Élan 2.11.7, yilangao.com 1.3.7, ASCII Art Studio 0.6.9

**Incidents during release:**
- Git orphaned branch: local `dev` had no commits (orphaned from `origin/dev`). Required `git reset --soft origin/dev` to re-attach, then `git reset HEAD` to rebuild the index. Root cause: unknown (likely a prior interrupted operation). Not a recurring pitfall - one-time recovery.
- Phantom `M` files in `git status`: multiple files showed as modified with zero content diff (stat-cache mismatches). Did not affect commits. Known macOS behavior.
- 16 macOS duplicate files (`* 2.*` pattern) found and deleted in Phase 2.

**Build gate:** Playground ~42s, main site ~65s, ASCII tool ~39s. All passed first attempt.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready within 3m of the `main` push.

**Layer classification notes:**
- L0: `.cursor/skills/personalize/SKILL.md` (new agent skill for company visitor personalization pipeline).
- L8: `src/app/(frontend)/favicon.ico` (new static asset).

---

## REL-019 — Élan 2.11.7, yilangao.com 1.3.7, ASCII Art Studio 0.6.9 (2026-04-23)

**Scope:** 9 files across 2 dependency-ordered layer commits (L1 docs ×5, L7/L8 source ×4) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-6, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.7: CollaborationLoop accent neutralization (22 accent→neutral conversions per Lumen Scarcity Principle), step nav alignment fix, transport divider removal, callout padding reduction, stale image placeholder removal from Elan content. yilangao.com 1.3.7: same feature set. ASCII Art Studio 0.6.9: manifest sync only.
**Previous release:** Élan 2.11.6, yilangao.com 1.3.6, ASCII Art Studio 0.6.8

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~22s, main site ~31s, ASCII tool ~13s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready within 1m of the `main` push.

**Layer classification notes:**
- L1: Design feedback (FB-178/179 accent neutralization + step alignment, FB-087 callout padding), content feedback (CF-025 Cognition wording), design anti-patterns (AP-071 accent as highlight), design.md frequency map update, engineering feedback log update.
- L7/L8 combined: `CollaborationLoop.tsx` (step number removal), `collaboration-loop.module.scss` (22 accent→neutral, transport cleanup, step nav padding), `page.module.scss` (callout padding 4x/5x→3x), `update-elan/route.ts` (remove stale imagePlaceholders array).

---

## REL-018 — Élan 2.11.6, yilangao.com 1.3.6, ASCII Art Studio 0.6.8 (2026-04-23)

**Scope:** 23 files across 3 dependency-ordered layer commits (L0 config ×4, L1 docs ×12, L8 frontend ×7) + 1 release commit + 1 dev-patch-bump commit. Layers 2-7, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.6: personalization badge on home page, Élan headline rewrite, fallback route rename (unknown → welcome), session re-auth fix. yilangao.com 1.3.6: same feature set. ASCII Art Studio 0.6.8: manifest sync only.
**Previous release:** Élan 2.11.5, yilangao.com 1.3.5, ASCII Art Studio 0.6.7

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~27s (including token sync prebuild), main site ~60s, ASCII tool ~15s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready within 4m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L0: Agent skills (`boot-up`, `password-gate`), `architecture.md`, `deployment.md` — all renaming `unknown` → `welcome`.
- L1: Content feedback (CFB-042 Élan headline rewrite), design feedback (FB-176/177 personalization badge + Lumen scarcity), engineering feedback (ENG-202/203 session identity), branding §9, portfolio coherence manifest, personal-voice T10 broadening.
- L8: `HomeClient.tsx` (personalization badge replaces dead essay badge), `page.module.scss` (renamed class), `page.tsx` (server-side personalization data fetch), `actions.ts` + `page.tsx` (session slug rename), `case-study-intro-headline.ts` (Élan headline), `proxy.ts` (fallback route rename).

---

## REL-017 — Élan 2.11.5, yilangao.com 1.3.5, ASCII Art Studio 0.6.7 (2026-04-23)

**Scope:** 9 files across 3 dependency-ordered layer commits (L1 docs ×2, L7 site components ×2, L8 frontend pages ×5) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-6, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.5: CollaborationLoop transport strip spacing (FB-175), SkillMap min-width overflow fix. yilangao.com 1.3.5: brand favicon SVG replaces default Vercel favicon.ico, explicit icons metadata in layout. ASCII Art Studio 0.6.7: manifest sync only.
**Previous release:** Élan 2.11.4, yilangao.com 1.3.4, ASCII Art Studio 0.6.6

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~33s (including token sync prebuild), main site ~41s, ASCII tool ~23s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment Ready within 3m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L1: `docs/design-feedback-log.md` (FB-175), `docs/engineering-feedback-log.md` (ENG-198).
- L7: `collaboration-loop.module.scss` (transport gaps widened to `1x`), `skill-map.module.scss` (`min-width: 120px` → `min-width: 0`).
- L8: `favicon.ico` ×2 (deleted), `icon.svg` ×2 (new brand SVG), `layout.tsx` (icons metadata).

---

## REL-016 — Élan 2.11.4, yilangao.com 1.3.4, ASCII Art Studio 0.6.6 (2026-04-23)

**Scope:** 14 files across 4 dependency-ordered layer commits (L1 docs ×5, L5 new lib ×1, L7 site components ×4, L8 frontend pages ×4) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-4, 6, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.4: link toolbar popover (FB-174/ENG-198), block toolbar positioning fix (FB-173), bidirectional Lexical-Payload link normalization (EAP-119/ENG-195–197), removed ClickableLinkPlugin. yilangao.com 1.3.4: resume URL update, Élan scope statement hyperlink. ASCII Art Studio 0.6.6: manifest sync only.
**Previous release:** Élan 2.11.3, yilangao.com 1.3.3, ASCII Art Studio 0.6.5

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~26s (including token sync prebuild), main site ~36s, ASCII tool ~12s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment queued within 1m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L1: `docs/design-feedback-log.md` (FB-173, FB-174), `docs/engineering-feedback-log.md` (ENG-195–198), `docs/engineering-anti-patterns.md` (EAP-119), `docs/engineering.md` (frequency map), `docs/port-registry.md` (PID update).
- L5: `src/lib/normalize-lexical-links.ts` (new file — bidirectional transforms between `@lexical/link` and Payload `LinkNode` shapes).
- L7: `LexicalToolbar.tsx` (link popover), `LexicalBlockEditor.tsx` (normalize/denormalize wiring, removed ClickableLinkPlugin), `inline-edit.module.scss` (block toolbar centering, link popover styles, cursor:text on editable links), `content-helpers.ts` (normalize/denormalize wiring for markdown conversion).
- L8: `layout.tsx` (resume URL), `seed/route.ts` (resume URL), `update-elan/route.ts` (scope statement hyperlink), `seed.ts` (resume URL).

---

## REL-015 — Élan 2.11.3, yilangao.com 1.3.3, ASCII Art Studio 0.6.5 (2026-04-23)

**Scope:** 10 files across 3 dependency-ordered layer commits (L1 docs ×4, L7 site components ×5, L8 frontend pages ×1) + 1 release commit + 1 dev-patch-bump commit. Layers 0, 2-6, 9-10 empty.
**Semver:** Patch for all three apps. Élan 2.11.3: Lexical cross-block focus fix (ENG-194), elan-visuals style refinements (FB-171 toggle sizing, CollaborationLoop refactor, SkillMap dead styles). yilangao.com 1.3.3: essay badge feature flag (FB-172). ASCII Art Studio 0.6.5: manifest sync only.
**Previous release:** Élan 2.11.2, yilangao.com 1.3.2, ASCII Art Studio 0.6.4

**Incidents during release:** None. Clean run — all three build gates passed on first attempt.

**Build gate:** Playground ~24s (including token sync prebuild), main site ~33s, ASCII tool ~13s.

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment queued within 1m of the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration.

**Layer classification notes:**
- L1: `docs/design-feedback-log.md` (FB-171, FB-172), `docs/engineering-feedback-log.md` (ENG-194), `docs/engineering-anti-patterns.md` (EAP update for Lexical focus), `docs/engineering.md` (§14.9.3 principle).
- L7: `CollaborationLoop.tsx` (refactor), `collaboration-loop.module.scss` (cleanup), `maturity-timeline.module.scss` (toggle sizing), `skill-map.module.scss` (dead style removal), `useBlockKeyboardNav.ts` (Lexical blur-before-focus fix).
- L8: `HomeClient.tsx` (essay badge feature flag).

---

## REL-014 — Élan 2.11.2, yilangao.com 1.3.2, ASCII Art Studio 0.6.4 (2026-04-22)

**Scope:** 3 files across 2 dependency-ordered layer commits (L1 docs, L8 frontend) + 1 release commit + 1 dev-patch-bump commit. The fast-forward merge to `main` also included pending commit `161f4e6` (REL-013 post-release audit: `docs/release-log.md`, `docs/design-feedback-log.md`) that had existed on `dev` but not yet on `main`. L2–L7, L9–L10 empty for this session’s authored work.
**Semver:** Patch for all three apps. yilangao.com: essay layout (`$elan-container-narrow` → `$elan-container-content`) per FB-170. Élan 2.11.2 and ASCII Art Studio 0.6.4 are manifest sync releases (no DS component or ascii-tool source edits in this checkpoint).
**Previous release:** Élan 2.11.1, yilangao.com 1.3.1, ASCII Art Studio 0.6.3

**Incidents during release:** None. `CHANGELOG.md` updated in the release commit (not left to an implicit follow-up).

**Build gate:** All three apps passed on first attempt (playground ~23s including token sync prebuild, main site ~34s, ASCII tool ~12s).

**Post-deploy verification:** `vercel ls --prod` (default linked project `yilangao-design-system`) showed latest production deployment `● Ready` in ~1m build time after the `main` push. Portfolio project (`yilangao-portfolio`) deploys from the same GitHub `main` integration; not queried via CLI because root `.vercel/project.json` targets the playground.

**Layer classification notes:**
- L1: `docs/content/case-study.md` (essay sidebar variant copy), `docs/design-feedback-log.md` (FB-170 entry).
- L8: `src/app/(frontend)/(site)/work/[slug]/page.module.scss` (`.layoutEssay` / `.contentEssay` max-width tokens).

---

## REL-013 — Élan 2.11.1, yilangao.com 1.3.1, ASCII Art Studio 0.6.3 (2026-04-22)

**Scope:** 1 file across 1 dependency-ordered layer commit (L8) + 1 release commit + 1 dev-patch-bump commit. All other layers empty.
**Semver:** Patch for all three apps. yilangao.com: SCSS-only fix to login page `.inner` container (removed 80vw ultra-wide breakpoint). Élan and ASCII Art Studio: release sync only, no app code changes.
**Previous release:** Élan 2.11.0, yilangao.com 1.3.0, ASCII Art Studio 0.6.2

**Incidents during release:**
- **Unexpected uncommitted doc files after release scripts.** After running `npm run version:release` and `npm run website:version:release`, `git diff --name-only` showed `docs/design.md` and `docs/design/responsive.md` as modified — these files were NOT shown in Phase 1 analysis (`git diff --name-status` only listed `login.module.scss`). Root cause unclear — possibly Post-Flight docs written by a previous session that were left uncommitted before `ship-it` was invoked, then became visible via a git-index state change. **Resolution:** the doc changes were legitimate FB-169 Post-Flight documentation, so they were included in the release commit. No functional impact.

**Build gate:** All three apps passed on first attempt. Playground ~27s, main site ~33s, ASCII tool ~12s (static only, no code changes).

**Layer classification notes:**
- Single file in L8 (Frontend pages): `src/app/(frontend)/for/[company]/login.module.scss`.
- No playground pages, no new components, no token changes — minimal release.
- Vercel portfolio (`yilangao-portfolio`) went Queued → Ready in ~3m. Playground (`yilangao-design-system`) was Ready within 1m of the push.

**Pattern note (Phase 1 doc-state gap):** Phase 1 uses `git diff --name-status` to enumerate changed files, but this compares working tree to HEAD and won't catch files that were modified in a prior session, partially staged, or written by pre-commit hooks without being re-dirtied. Consider adding `git diff --cached --name-status` to Phase 1 to catch staged-but-not-working-tree changes.

---

## REL-012 — Élan 2.11.0, yilangao.com 1.3.0, ASCII Art Studio 0.6.2 (2026-04-22)

**Scope:** 39 files across 6 dependency-ordered layer commits (L0, L1, L5, L6, L7, L8) + 1 release commit + 1 dev-patch-bump commit. L2 Tokens, L3 Deps, L4 Deletions, L9 Playground, L10 ASCII tool src were all empty.
**Semver:** Minor for Élan (2.10.0 → 2.11.0: new Essay component family — EssayHeader, EssayMeta — and read-time utility). Minor for yilangao.com (1.2.0 → 1.3.0: essay components on project pages, elan-visuals updates, inline-edit improvements, company session changes, push-schema updates). Patch for ASCII Art Studio (0.6.1 → 0.6.2: release sync only, no app code changes).
**Previous release:** Élan 2.10.0, yilangao.com 1.2.0, ASCII Art Studio 0.6.1

**Incidents during release:**
- **website-version.ts sync target left uncommitted.** `npm run website:version:release` auto-synced `src/lib/website-version.ts` but this file was not included in the release commit's `git add` command (it is not listed in the checkpoint skill's Registered Apps table). `git checkout main` refused with "local changes would be overwritten." **Resolution:** amended the release commit to include `src/lib/website-version.ts`, force-pushed dev, then proceeded. This is a REL-AP-001 variant — the existing pitfall covers manifest JSON + `playground/src/lib/elan.ts` + `ascii-tool/src/lib/version.ts`, but the website also has a TypeScript sync target at `src/lib/website-version.ts` that is not documented. Filing as pattern note below.

**Build gate:** All three apps passed on first attempt. Playground ~29s, main site ~32s, ASCII tool ~34s (fast — no code changes).

**Layer classification notes:**
- L5 absorbed all 5 new files: `src/components/essay/EssayHeader.tsx`, `EssayHeader.module.scss`, `EssayMeta.tsx`, `EssayMeta.module.scss`, and `src/lib/read-time.ts`.
- REL-AP-005 clean — verified `read-time.ts` imported by `page.tsx`; `EssayHeader`/`EssayMeta` imported by `ProjectClient.tsx`.
- No L9 playground pages — no new playground commits required.
- Vercel playground (`yilangao-design-system`) went Queued → Ready in ~4m, matching pattern from previous releases.

**Pattern note (website sync target):** `src/lib/website-version.ts` is the TypeScript sync target for `website.json`, analogous to `playground/src/lib/elan.ts` for `elan.json`. The checkpoint skill's release commit `git add` command and REL-AP-001 guidance do not currently include it. After 2 releases involving website changes, this will need to be promoted to the checkpoint skill and REL-AP-001 fix.

---

## REL-011 — Élan 2.10.0, yilangao.com 1.2.0, ASCII Art Studio 0.6.1 (2026-04-21)

**Scope:** ~88 working-tree files across 8 dependency-ordered layer commits, 1 release commit, 2 follow-up commits (1 build-fix, 1 concurrent footer feature), 1 dev patch bump on `dev` after merge (105 files shown in fast-forward diff including release artifacts).
**Semver:** Minor for Élan (2.9.1 → 2.10.0: 3 new DS primitives — `AlertDialog`, `MediaMuteToggle`, `VideoEmbed`). Minor for yilangao.com (1.1.2 → 1.2.0: video embed block, image-group atomic migration, major inline-edit feature expansion — `ConfirmDelete`, `ToastSurface`, `VideoEmbedInput`, `VideoSettings`, `ImageBlockAdminOverlay`). Patch for ASCII Art Studio (0.6.0 → 0.6.1: release sync only, no app code changes).
**Previous release:** Élan 2.9.0, yilangao.com 1.1.1, ASCII Art Studio 0.6.0

**Incidents during release:**
- **Corrupt `playground/node_modules` on first build attempt.** Playground build failed with `ERR_INVALID_PACKAGE_CONFIG` for `next/dist/compiled/text-table/package.json` (file was missing from the compiled bundle — the directory contained only `LICENSE`). Root cause: partial/interrupted install from a prior session. **Resolution:** `rm -rf playground/node_modules playground/.next && npm install` in playground. Rebuild succeeded on retry. Filing as **REL-AP-008** below — this is a new pitfall worth capturing: corrupted node_modules from interrupted installs are not caught by the ship-it Phase 2 clean (which only scans for macOS duplicates and debug logs, not node_modules integrity).
- **Main site TypeScript error in atomic image block.** `ProjectClient.tsx` line 857 passed `img.url` (typed `string | undefined`) to `MediaRenderer`'s required `src: string` prop. TS did not narrow through the `hasMedia = Boolean(img.url)` guard. **Resolution:** added non-null assertion (`src={img.url!}`) in a separate `fix:` commit atop the release commit. Build passed on retry. Same pattern as REL-009 fix #3 (use-cursor-thumbnail non-null after guard) — TypeScript strict mode doesn't narrow through intermediate boolean variables.
- **Concurrent IDE edits landed mid-release.** After the release commit was created, `git status` showed 5 additional modified files (`(site)/layout.tsx`, `api/seed/route.ts`, `scripts/seed.ts`, `docs/engineering-feedback-log.md`, `docs/port-registry.md`) with coherent, isolated footer social-link updates (adding Élan DS / Resume / LinkedIn defaults with URL fallback resolution). These were clearly concurrent user edits, not agent side-effects. **Resolution:** committed as a separate `feat:` commit after the build-fix, then re-ran the main site build gate before merge. Rolled into the same release window. No new pitfall — documenting the pattern: the build gate must re-run when any file changes after the release commit, including concurrent edits.
- **ASCII tool build hung when output was piped through `tail -20`.** First ascii-tool build attempt backgrounded with no output because `tail -20` buffers until EOF. **Resolution:** killed the hung pipe, re-ran with output redirected to a log file (`> /tmp/ascii-build.log 2>&1`), then tailed the log. Build completed in ~7.4min (TypeScript-dominated). No functional failure — documenting as a shell-pipe caveat for long-running builds.
- **Vercel post-deploy poll:** playground (`yilangao-design-system`) deployment was **Queued** ~1m after push, matching REL-008/009/010 pattern. Main site (`yilangao-portfolio`) project is not visible from repo root `vercel ls --prod` per REL-008.

**Build gate:** All three apps passed after the corrupt-node_modules reinstall and the MediaRenderer fix. Main site build ran twice (before and after the concurrent-edit commit) — both passed. Playground ~47s, main site ~46-58s, ASCII tool ~7.9min (dominated by TypeScript).

**Layer classification notes:**
- 8 commits across 7 populated layers (L0 Config, L1 Docs, L3 Deps, L5 New primitives + libs + registry, L6 UI updates, L7 Site components, L8 Frontend pages + CMS, L9 Playground). L2 Tokens, L4 Deletions, L10 ASCII tool src were all empty.
- L5 consolidated 3 new DS components, 3 new `src/lib/*.ts` utility files, and the updated `archive/registry.json` into one commit per Phase 1 rules.
- REL-AP-005 clean this time — no stray `src/lib/utils.ts`. All 3 new `src/lib/` files (`migrate-image-groups.ts`, `normalize-image-rows.ts`, `parse-video-embed.ts`) verified as imported and dependency-resolved.
- REL-AP-002 clean — new playground pages for `alert-dialog`, `media-mute-toggle`, `video-embed` all use correct component-preview APIs: `<SubsectionHeading>children</SubsectionHeading>`, `<SourcePath path="..." />`, `<PropsTable props={[...]} />`. Grep-verified before commit.
- REL-AP-003 clean — the 3 new UI component directories were all-new (no mixed new/modified files in the same directory).
- `.mcp.json` (untracked local config) added to `.gitignore` in L0 alongside the Next.js image hostname config. No change to the `.gitignore` posture for dev artifacts.

### REL-AP-008: Corrupt `node_modules` from interrupted prior install

**Occurrences:** 1 (REL-011)

**Trigger:** Playground build fails with
`ERR_INVALID_PACKAGE_CONFIG /playground/node_modules/next/dist/compiled/<sub>/package.json`.
The referenced `package.json` is missing — the directory exists but contains only `LICENSE`. Cause: a prior `npm install` (possibly from a different session or killed mid-flight) left `node_modules` in a partial/corrupt state.

**Failure:** Build gate halts immediately before TypeScript. No recovery from within the build — the install must be repaired.

**Fix:** `rm -rf playground/node_modules playground/.next && npm install` in the playground directory. Rebuild succeeds.

**Preventative check (to add to Phase 2 Clean in a future ship-it revision):** If any `node_modules/next/dist/compiled/*/` directory is missing its `package.json`, reinstall before proceeding. A lightweight version: if a previous session killed an `npm install` mid-flight, reinstall proactively. Keep as a documented pitfall for now; promote to procedure if it occurs again.

---

## REL-010 — Élan 2.9.0, yilangao.com 1.1.1, ASCII Art Studio 0.6.0 (2026-04-17)

**Scope:** 38 working-tree files across 7 dependency-ordered layer commits, 1 release commit, 1 dev patch bump on `dev` after merge (48 files shown in fast-forward diff including release artifacts)
**Semver:** Minor for Élan (2.8.1 → 2.9.0: new playground `sidebar.module.css`, `useScrollRestoration` hook, inline-edit and CursorThumbnail refinements). Patch for yilangao.com (1.1.0 → 1.1.1: homepage, project case study, and Etro seeding route refinements). Minor for ASCII Art Studio (0.5.4 → 0.6.0: new `SegmentedControl` primitive + dev script change).
**Previous release:** Élan 2.8.0, yilangao.com 1.1.0, ASCII Art Studio 0.5.3

**Incidents during release:**
- **REL-AP-005 triggered for the third time.** Untracked `src/lib/utils.ts` (shadcn `cn` + `tailwind-merge`) was present again as dead code with no imports and no `tailwind-merge` in `package.json`. **Resolution:** deleted in Phase 2 clean before staging. This is now the 3rd occurrence (REL-004, REL-005 context, REL-010) — **escalation criterion met, see Escalation Check below.**
- **Phase 2 macOS duplicate load was heavy.** 13 `* 2.*` junk files + a full `src/styles 2/` directory tree were untracked in the working tree from prior macOS Finder or iCloud sync duplication. All deleted in Phase 2 clean with no functional impact.
- **Vercel post-deploy poll:** playground (`yilangao-design-system`) deployment was **Queued** ~1m after push, matching REL-008/REL-009 pattern. Main site (`yilangao-portfolio`) project is not visible from repo root `vercel ls --prod` per REL-008 — `.vercel/project.json` links to playground.

**Build gate:** All three apps passed on first attempt. Playground build ~500s, main site build ~1234s (dominated by TypeScript), ASCII tool build ~210s. Same non-blocking Sass `darken()` deprecation warnings in `ProjectEditModal.module.scss` as REL-007/008/009.

**Layer classification notes:**
- 7 commits across 6 populated layers (L0 Config, L1 Docs, L3 Scripts, L5 New primitives, L7 Site components, L8 Frontend pages, L9 Playground). L2 Tokens, L4 Deletions, L6 `src/components/ui/` updates, L10 ASCII tool src were all empty.
- L3 captured a script-only change (`dev: next dev --webpack`) for both playground and ascii-tool — not a dependency add/remove. Template adapted via REL-AP-004 flexibility.
- New `ascii-tool/src/components/ui/segmented-control.tsx` is not yet wired into any ASCII tool page but its imports (`cn` from `@/lib/utils`, `tailwind-merge`, `clsx`) all resolve — passed REL-AP-005 dead code check because dependencies exist. Distinction: REL-AP-005 blocks commits only when imports fail to resolve, not when the component is simply unused.
- `src/hooks/use-scroll-restoration.ts` (new) was classified into L5 (new lib). The matching consumer change (`HomeClient.tsx` importing it) went into L8 — intermediate build state is fine because L5 commits the new file before L8 imports it.

**Escalation check (REL-AP-005, 3rd occurrence):**
REL-AP-005 (dead `src/lib/utils.ts` with missing `tailwind-merge` dependency) has now triggered 3 times. This is a **procedure gap** — the file keeps being regenerated (likely by automated scaffolding tools or editor templates that assume a shadcn/ui setup that this repo does not have). Promotion action: this gap should be addressed by adding a pre-Phase-1 check in the ship-it skill that explicitly looks for `src/lib/utils.ts` (and the twin `src/lib/utils 2.ts`) as a known-to-regenerate artifact, or by adding `src/lib/utils.ts` and `src/lib/utils 2.ts` to `.gitignore` so the file cannot be accidentally committed. Leaving as documented pitfall for now; propose `.gitignore` entry in the next content/engineering iteration session.

---

## REL-009 — Élan 2.8.0, yilangao.com 1.1.0, ASCII Art Studio 0.5.3 (2026-04-11)

**Scope:** 112 files merged to `main` via fast-forward: 11 dependency-ordered layer commits, 1 build-fix commit, 1 release commit, 1 dev patch bump on `dev` after merge
**Semver:** Minor for Élan (2.7.0 → 2.8.0: new CursorThumbnail, SiteFooter components + UI updates). Minor for yilangao.com (1.0.0 → 1.1.0: (site) route group migration, new page utilities). Patch for ASCII Art Studio (0.5.2 → 0.5.3: release sync, no new app code).
**Previous release:** Élan 2.7.0, ASCII Art Studio 0.5.2

**Incidents during release:**
- **Build gate: 3 TypeScript errors.** (1) Archived `archive/homepage-v1/` was not excluded from `tsconfig.json`, causing stale type errors from old `SiteFooter` props. **Resolution:** Added `archive` to tsconfig `exclude` array. (2) New `(site)/work/[slug]/page.tsx` used `slug` property not in `FALLBACK_PROJECT` type. **Resolution:** Added `slug` to fallback object. (3) `use-cursor-thumbnail.ts` had `clearTimeout(leaveTimerRef.current)` where TypeScript couldn't narrow past the null check through a ref. **Resolution:** Added non-null assertion `!` after the guard.
- **Website version:auto false positive.** `version:auto` detected page renames (`(frontend)/about → (frontend)/(site)/about`) as URL breaking changes and recommended Major (1.0.0 → 2.0.0). Route groups don't affect URLs in Next.js. **Resolution:** Manually corrected to Minor (1.1.0). This is a gap in the auto-analyzer's understanding of Next.js route groups.
- **Vercel post-deploy poll:** `vercel ls --prod` from repo root shows playground (Queued at poll time). Main site project not visible from repo root CLI context per REL-008.

**Build gate:** All three apps passed after fix commit. Same non-blocking Sass `darken()` deprecation warnings as REL-007/008.

**Layer classification notes:**
- 11 commits across 8 populated layers (L0 Config, L1 Docs, L2 Tokens, L3 Deps, L5 New Components, L6 UI Updates, L7 Site Components, L8 Frontend Pages split into 3 commits, L9 Playground).
- L8 split into route group migration (51 files), API routes + password gate (9 files), and homepage v1 archive (3 files) to keep commits focused.
- Git detected most `(site)` moves as renames — clean history.
- New lib files verified against REL-AP-005 (all imported by new pages, no third-party dep issues).
- No macOS duplicates or debug logs found in Phase 2 clean.

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

> **Archived entries:** REL-001 through REL-006 moved to `docs/release-log-archive.md` (2026-04-24, cap enforcement).
