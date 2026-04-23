# Changelog — Élan Design System

All notable changes to the Élan design system are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.11.3] — 2026-04-23

Patch release: Lexical cross-block navigation fix, elan-visuals style refinements, and homepage essay badge feature flag.

### Fixed

- **Inline edit**: `useBlockKeyboardNav` now blurs the active Lexical editor via `getNearestEditorFromDOMNode` + `queueMicrotask` before cross-block `focus()`, closing the remaining frozen-`Point` TypeError (ENG-194, same family as ENG-188/ENG-189).
- **Elan visuals**: `MaturityTimeline` toggle buttons bumped from `$portfolio-type-xs` to `$portfolio-type-sm` with larger padding for readability (FB-171). `CollaborationLoop` refactored; `SkillMap` dead styles removed.
- **yilangao.com**: Essay format badge on the homepage hidden behind `SHOW_ESSAY_FORMAT_BADGE_ON_HOME` flag (FB-172).

### Released with this checkpoint

- **yilangao.com** 1.3.3 — Lexical fix, elan-visuals refinements, essay badge flag
- **ASCII Art Studio** 0.6.5 — release sync only (no app code changes)

## [2.11.2] — 2026-04-22

Patch release: essay project pages use the same prose column cap as case studies. Élan and ASCII Art Studio manifests bumped in sync; no design-system component or playground code changes in this checkpoint.

### Changed

- **yilangao.com**: `.layoutEssay` / `.contentEssay` on `/work/[slug]` now cap at `$elan-container-content` (720px) instead of `$elan-container-narrow` (672px), matching the case-study `.content` measure. Documented as FB-170 in `docs/design-feedback-log.md`; `docs/content/case-study.md` §3.2 updated accordingly.

### Released with this checkpoint

- **yilangao.com** 1.3.2 — essay single-column width alignment
- **ASCII Art Studio** 0.6.4 — release sync only (no app code changes)

## [2.11.1] — 2026-04-22

Patch release: login page layout fix shipped alongside yilangao.com 1.3.1 and ASCII Art Studio 0.6.3.

### Fixed

- **yilangao.com**: Removed 80vw ultra-wide breakpoint (≥1800px) from `/for/[company]` login page `.inner` container — the fixed-element gap between the halftone portrait and login card grew without bound on 2K+ displays, breaking composition proportions. Inner now caps at 1120px on all viewports; the terra field grows instead, complementing the atmospheric quality of the halftone.

### Released with this checkpoint

- **yilangao.com** 1.3.1 — login page ultra-wide layout fix
- **ASCII Art Studio** 0.6.3 — release sync only (no app code changes)

## [2.10.0] — 2026-04-21

Minor release: three new DS primitives (AlertDialog, MediaMuteToggle, VideoEmbed), major inline-edit expansion with video embeds and destructive confirmations, and CMS schema additions for video and image-group migration shipped alongside yilangao.com 1.2.0 and ASCII Art Studio 0.6.1.

### Added

- **DS Components**: `AlertDialog` (Radix-based destructive confirmation), `MediaMuteToggle`, `VideoEmbed` with YouTube/Vimeo/Loom support
- **Inline edit**: `ConfirmDelete` (declarative component + `useConfirm()` hook), `ToastSurface`, `VideoEmbedInput`, `VideoSettings`, `ImageBlockAdminOverlay`, `useStructuralShortcuts`
- **Libs**: `parse-video-embed.ts`, `normalize-image-rows.ts`, `migrate-image-groups.ts`
- **Playground**: new pages for `alert-dialog`, `media-mute-toggle`, `video-embed`

### Changed

- **MediaRenderer, Navigation, ScrollSpy** (UI): updated SCSS modules and component internals
- **Inline edit**: expanded `useBlockManager`, restructured toolbars, overhauled inline-edit SCSS module

### Released with this checkpoint

- **yilangao.com** 1.2.0 — video embed block, image-group atomic migration, expanded inline-edit capabilities, new migration API routes
- **ASCII Art Studio** 0.6.1 — release sync only (no app code changes)

## [2.9.0] — 2026-04-17

Minor release: playground sidebar module, inline-edit refinements, and site-level polish shipped alongside ASCII Art Studio SegmentedControl and yilangao.com copy updates.

### Added

- **Playground**: new `sidebar.module.css` for dedicated sidebar styling
- **Hooks**: `useScrollRestoration` for back-navigation scroll preservation

### Changed

- **Inline edit**: Lexical block editor and toolbar refinements, updated inline-edit SCSS module
- **CursorThumbnail**: module styling updates, adjustments to `useCursorThumbnail` hook
- **Playground / ASCII tool**: dev servers pinned to webpack (`next dev --webpack`) for HMR stability
- **Documentation**: expanded content framework (case-study, narrative-arc, voice-style, visual-economy, reference-portfolios), design branding, engineering and content knowledge bases, and port registry

### Released with this checkpoint

- **ASCII Art Studio** 0.6.0 — new `SegmentedControl` primitive
- **yilangao.com** 1.1.1 — homepage, project case study (work/[slug]), and Etro seeding route refinements

## [2.7.0] — 2026-04-08

Minor release: case study intro typography (IBM Plex Serif, `heading-case-study-intro`), MediaRenderer SCSS module, expanded DropdownMenu, portfolio and project page updates, CMS collection and schema-push tooling, inline-edit refinements.

### Added

- **MediaRenderer**: dedicated SCSS module for layout and media chrome
- **Typography**: `heading-case-study-intro` mixin and serif token alignment with IBM Plex Serif
- **Schema**: `push-schema.ts` extensions for Payload alignment

### Changed

- **DropdownMenu**: expanded styles, APIs, and exports
- **Project / work pages**: `ProjectClient`, styles, and related server page wiring
- **Home / company gate**: layout, login, and marketing page updates
- **Inline edit**: `EditableText`, block manager, and token map updates
- **CMS**: `Companies` and `Projects` collection tweaks; `company-data` and Lexical helpers
- **Playground**: typography token documentation synced with main tokens
- **Documentation**: engineering feedback log archival, design/engineering notes, port registry

### Released with this checkpoint

- **ASCII Art Studio** 0.5.2 (dev/release sync; no functional app changes in this batch)

## [2.5.0] — 2026-04-06

Minor release: new Tooltip subsystem (InfoTooltip, TooltipProvider), block editor for inline editing, Etro case study API, expanded content framework.

### Added

- **InfoTooltip**: persistent informational tooltip component with configurable placement
- **TooltipProvider**: context provider for coordinated tooltip behavior
- **Content helpers**: `src/lib/content-helpers.ts` utility library for case study content processing
- **Block editor subsystem**: Lexical-based block editor for inline editing (BlockToolbar, LexicalBlockEditor, LexicalToolbar, ImageManager, ImageUploadZone, SectionManager, useBlockKeyboardNav, useBlockManager)
- **Etro API route**: new `update-etro` CMS update endpoint
- **Content framework**: case study authoring guide, project dossiers (Elan, Etro, Lacework, Meteor), voice/narrative/personal-voice docs, case study review checklist, portfolio coherence guide, technical framing guide
- **Agent skills**: case-study-authoring, plan-audit, plan-structure, stress-test
- **Color tokens**: expanded palette with new custom property mappings
- **YG logo**: added public SVG logo asset

### Changed

- **Button**: updated component API and SCSS module
- **TestimonialCard**: updated both UI and site-level component styles
- **Tooltip**: refactored core component with expanded SCSS module
- **Inline edit**: expanded TextFormatBar, EditableText, and token-map with block editing support
- **ProjectClient**: major expansion of case study rendering logic
- **HomeClient**: updated layout and component integration
- **Projects collection**: expanded CMS schema with new fields
- **Playground sidebar**: migrated from CSS to SCSS module
- **Playground tooltip page**: expanded with InfoTooltip demos
- **Playground colors page**: expanded token visualization

### Documentation

- 33 doc files updated/added covering content, design, and engineering feedback logs, anti-patterns, and specialized guides
- Magic words trigger reference added

## [2.4.1] — 2026-04-03

Patch release: accent dark-half chroma optimization, rich text paragraph break fix, debug logging cleanup.

### Fixed

- **Accent tokens**: optimized chroma values for steps 70–100 to improve perceptual uniformity (max/min distance ratio 1.48x → 1.33x)
- **Inline edit**: rich text paragraph breaks now preserved across save cycles via `htmlContent` prop (ENG-105)
- **Inline edit**: removed 6 debug `fetch()` logging blocks left from investigation session

### Documentation

- FB-097: accent scale dark-half uniformity analysis and resolution
- ENG-105: paragraph breaks lost in inline edit after save
- EAP-065: new anti-pattern — `EditableText isRichText` without `htmlContent` prop

## [2.4.0] — 2026-04-03

Minor release: new site-level components, SCSS module migration for playground, expanded color tokens, and UI component refinements.

### Added

- **Site components**: Footer, Navigation, Marquee, TestimonialCard, ThemeProvider, ThemeToggle, ViewSiteLink
- **Animation utilities**: ArrowReveal, ExpandCollapse, FadeIn, MountEntrance, StaggerChildren
- **ScrollSpy** (site-level): full-featured scroll spy wrapper with SCSS module
- **Utility library**: `src/lib/utils.ts` with shared helpers
- **Color tokens**: expanded palette in `_colors.scss`
- **Playground SCSS modules**: component-preview, scroll-spy, token-grid, and colors page modules

### Changed

- **Button**: updated SCSS module styles
- **Checkbox**: updated SCSS module and component API
- **ScrollSpy (UI)**: expanded SCSS module and component logic
- **TokenGrid**: updated elan-visuals and inline-edit token map
- **Playground**: migrated shared components to SCSS modules, updated all token pages (breakpoints, colors, elevation, motion, spacing, typography)
- **ASCII Art Studio**: synced globals.css with token updates

### Documentation

- Updated design feedback log, engineering feedback log, content feedback log
- Expanded design anti-patterns and engineering anti-patterns
- Updated color design doc and content navigation doc
- Updated playground skill guardrails
- Updated port registry

## [2.3.0] — 2026-04-03

Minor release: new UI components, company password gate, expanded design tokens, ASCII Art Studio engines, and playground pages.

### Added

- **Eyebrow component**: typographic label for section headers and metadata
- **Menu component**: dropdown navigation with SCSS module styling
- **TextRow component**: key-value display row for structured content
- **Company password gate**: CMS collection, admin dashboard, seed script, and `/for/[company]` route updates
- **Color tokens**: expanded palette and updated custom properties
- **ASCII Art Studio**: dot-grid engine, image-filter engine, expanded control panel and preset gallery
- **Playground pages**: Eyebrow, Menu, TextRow component pages; updated Input, Kbd, Button, and color token pages
- **Boot-up skill**: new agent skill for dev server management

### Changed

- **Input component**: major SCSS and API expansion (+650 SCSS lines, +150 TSX lines)
- **DropdownMenu**: updated styles and component logic
- **Kbd component**: expanded styles and API
- **NavItem**: updated SCSS module
- **Admin navigation**: refactored NavPages, updated DashboardPages, added CompanyDashboard
- **Elan-visuals**: updated ComponentShowcase, InteractionShowcase, TokenGrid styles
- **Frontend pages**: updated HomeClient, motion page, project pages; consolidated CMS admin groups to "Content"
- **Playground**: refactored sidebar, tokens lib, updated existing component pages
- **ASCII Art Studio**: refactored use-ascii-renderer hook, updated halftone and word-fill engines
- **Sync pipeline**: expanded sync-tokens script
- **Agent guardrails**: updated password gate skill, AGENTS.md configuration
- **Documentation**: expanded design/engineering feedback logs, anti-patterns, architecture, and design docs

### Removed

- **ViewSiteLink**: removed admin component (replaced by updated NavPages)

---

## ASCII Art Studio [0.3.0] — 2026-04-03

### Added

- **Dot-grid engine**: new rendering mode for dot-matrix style output
- **Image-filter engine**: pre-processing filters for input images
- **Expanded preset gallery**: more presets and improved UI

### Changed

- **Control panel**: major UI expansion with new rendering options
- **ASCII map engine**: updated character mapping
- **Renderer hook**: refactored core rendering pipeline

---

## [2.1.0] — 2026-04-02

Minor release: new components, expanded token system, legacy cleanup, and playground improvements.

### Added

- **BadgeOverlay component**: compact notification counter and status dot indicator for avatars, icons, and buttons
- **ButtonSelect component**: single-select toggle group with appearance × emphasis two-axis styling, built on Radix ToggleGroup — replaces SegmentedControl
- **Design tokens**: borders, opacity, and custom properties files; expanded color, elevation, motion, and typography tokens
- **Breakpoints utility**: shared `BREAKPOINTS` constants (`src/lib/breakpoints.ts`)
- **Content strategy guides**: 13 docs under `docs/content/` (case-study, homepage, seniority-signals, visual-economy, etc.)
- **Feedback log archives**: design and engineering feedback log archives with synthesis summaries
- **Playground pages**: BadgeOverlay, ButtonSelect component pages; sidebar module CSS; ds-tokens SCSS

### Changed

- **Badge API**: `BadgeVariant` renamed to `BadgeAppearance` + `BadgeEmphasis` (two-axis model)
- **30+ UI component SCSS modules**: migrated to expanded token system with CSS custom properties
- **Frontend pages**: migrated from `@yilangaodesign/design-system` package imports to local `@/components/ui/` paths
- **Playground infrastructure**: refactored sidebar, shell, theme-provider; simplified globals.css
- **globals.scss**: migrated from design-system package SCSS imports to local tokens + CSS custom properties
- **NavItem**: expanded with additional variants (+45 lines)
- **Inline-edit system**: updated EditableText, API, and styles
- **Agent guardrails**: renumbered (11-22), added playground HMR verification, lucide-react barrel import ban, feedback log cap

### Removed

- **SegmentedControl**: removed from design system, playground, and ASCII Art Studio (replaced by ButtonSelect)
- **12 legacy component wrappers**: ArrowReveal, ExpandCollapse, FadeIn, Footer, Marquee, MountEntrance, Navigation, ScrollSpy, StaggerChildren, TestimonialCard, ThemeProvider, ThemeToggle — all migrated to `src/components/ui/` in 2.0.0

### Fixed

- **Lexical rendering**: multi-paragraph support with proper line breaks
- **Frontend layout**: added `data-theme="light"` to root html element

---

## ASCII Art Studio [0.2.0] — 2026-04-02

### Changed

- Replaced SegmentedControl with ButtonSelect in control-panel and toolbar

---

## [2.0.0] — 2026-04-01

Major release with 19 new design system components, playground architecture overhaul, and expanded documentation.

### Added

- **19 new design system components**: ArrowReveal, CommandMenu, DescriptionList, ExpandCollapse, FadeIn, Footer, InlineCode, Kbd, Marquee, MountEntrance, NavItem, Navigation, ScrollSpy, Sheet, StaggerChildren, Table, TestimonialCard, ThemeProvider, ThemeToggle
- **Shared hooks**: `useMediaQuery`, `useMounted`, `useSafeTriangle`
- **Shared utilities**: `src/lib/utils.ts`
- **7 new playground component pages**: command-menu, description-list, inline-code, kbd, nav-item, sheet, table
- **Playground inline-edit system**: EditButton, inline-edit provider and components
- **Playground motion utilities**: shared motion token helpers
- **6 new cursor skills**: checkpoint, cms-parity, content-iteration, cross-app-parity, orchestrator, playground
- **Expanded documentation**: hub-and-spoke engineering docs, design topic files, doc audit log

### Changed

- **Playground architecture**: migrated from local component re-implementations to `@ds/*` imports from production source — playground pages are now thin harnesses, not parallel implementations
- **Badge, Button, Card**: refined APIs, updated SCSS modules
- **Color tokens**: updated `_colors.scss` with new semantic tokens (`$portfolio-text-tertiary`, `$portfolio-overlay-black-40`)
- **Frontend pages**: HomeClient, AboutClient, ReadingClient, ProjectClient, motion page updated for new component APIs
- **Playground shell**: sidebar, archive components, component-preview, theme-toggle all updated
- **ESLint config**: updated rules
- **Agent knowledge base**: AGENTS.md rewritten with orchestration, multi-category classification, and refined guardrails

### Removed

- **Playground local component copies**: `playground/src/components/ui/Card/` and `playground/src/components/ui/Input/` deleted in favor of `@ds/*` design system imports (BREAKING)
- **Deprecated ThemeToggle SCSS module**: `src/components/ThemeToggle.module.scss` removed, replaced by `ui/ThemeToggle/` module

### Fixed

- **Version mismatch**: dev version was 1.1.0 (minor) when scope warranted major bump — corrected to 2.0.0

---

## [1.0.0] — 2026-03-29

Initial versioned release. Establishes the full design system, CMS infrastructure, portfolio site, and tooling baseline.

### Added

- **Color tokens**: Full Carbon-influenced palette (gray, blue, teal, green, red, orange, purple, cyan, magenta, yellow) with 13-step scales, plus semantic tokens for text, background, border, interactive, and support roles
- **Typography tokens**: Geist Sans / Geist Mono font stacks, 8-step type scale (12–48 px), 5 weight levels, 5 leading values, 5 tracking values
- **Spacing tokens**: 13-step component spacing scale (2–128 px), 7-step layout spacing scale (16–128 px), 4 container widths
- **Motion tokens**: 4 durations (fast/moderate/slow/slower), 4 easing curves (standard/entrance/exit/expressive), 6-step z-index scale
- **Elevation tokens**: 6-step shadow scale (none–overlay), 7-step radius scale (none–full)
- **Breakpoint tokens**: 5 breakpoints (sm–2xl) with media query helpers and reduced-motion query
- **Mixins**: Interactive (focus-ring, hover-lift, press-scale, reduced-motion), layout (container, stack, grid, sidebar), typography (body, heading, caption, label, mono-data)
- **Components**: FadeIn, StaggerChildren, MountEntrance, ExpandCollapse, ArrowReveal, Marquee, ScrollSpy, AdminBar, EditButton, RefreshRouteOnSave
- **CMS collections**: Experiments, Testimonials (Payload CMS)
- **Portfolio pages**: Home, About, Work/[slug], Contact, Reading, Experiments — all with client-side components
- **Admin tooling**: AdminBar overlay, EditButton shortcut, admin-auth library, API seed route
- **Playground**: Token preview pages (colors, typography, spacing, motion, elevation, breakpoints), component preview pages (ScrollSpy, ThemeToggle), sidebar navigation, theme switching, Élan version footer
- **Token sync pipeline**: `npm run sync-tokens` regenerates playground TypeScript data from SCSS source of truth
- **Versioning infrastructure**: `elan.json` manifest, version bump/release scripts, CHANGELOG
- **Documentation framework**: design.md, engineering.md, content.md with anti-pattern catalogs, feedback logs, and port registry
- **Cursor skills**: design-iteration, engineering-iteration, doc-audit workflows
- **Two-branch model**: dev (working) + main (stable checkpoints) with version-gated merges
