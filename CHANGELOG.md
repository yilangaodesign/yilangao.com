# Changelog — Élan Design System

All notable changes to the Élan design system are documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
