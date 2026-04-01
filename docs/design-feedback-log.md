# Design Feedback Log

> **What this file is:** Chronological record of every design feedback session. Each entry captures the raw user instruction, the parsed UX intent, and what was done. Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during feedback processing (check for recurring patterns).
> **Who writes this:** AI agents after each feedback cycle via the `design-iteration` skill.
> **Last updated:** 2026-03-30 (FB-069: Button sizing redesign — One GS alignment, icon = line-height, padding-derived height)
>
> **For agent skills:** Read only the first 30 lines of this file (most recent entries) for pattern detection. The full file is a historical audit trail — do not read it in its entirety during normal work.

---

## Session: 2026-03-30 — Button Component Sizing Redesign

#### FB-069: "Vertical spacing too big, icons don't scale with label size"

**UX Intent:** The button's internal proportions feel wrong — vertical padding is visually excessive and icons appear tiny/disconnected from the label at larger sizes. The user wants buttons where (a) vertical padding is noticeably tighter than horizontal, producing a wider pill shape, and (b) icons scale proportionally with the label text as button size increases, so all button content forms a cohesive visual unit.

**Root Cause:** Three structural problems in the sizing model:

1. **Bounding-box icon model.** The `.iconWrap` used internal padding that ate the wrapper size, producing effective icons of 8/10/10/12px — far smaller than the label text. The sm and lg sizes produced the same 10px icon despite an 18px font-size difference. The padding was doing double duty: sizing the icon AND creating icon-to-label spacing.

2. **Fixed `height` constraint.** The button used `height` (not `min-height`), making the declared `py` values irrelevant — with small content (12-16px fonts at 1.1 line-height) in large containers (48-56px), the visual vertical space was determined by `(height - content) / 2`, not by `py`. Reducing `py` would have no visible effect.

3. **Disconnected icon-only path.** When `iconOnly` is true, children went through `.label` (no size constraints) instead of `.iconWrap`, rendering at the Lucide default 24×24 regardless of button size — 2-3x larger than the same icon in icon-plus-label mode.

**Resolution:** Redesigned the sizing system following the Goldman Sachs One GS button component reference (extracted from Figma via MCP):

1. **Icon = label line-height.** Icon wrapper dimensions now match the label's computed line-height per size (16/18/20/24px). No internal padding on icon wrappers — direct sizing.
2. **Gap-based spacing.** Replaced `gap: 0` + bounding-box padding with flex `gap` per size (4/6/10/12px). Icon sizing and icon-to-label spacing are now independent concerns.
3. **Padding-derived height.** Replaced `height` with `min-height`. Button height = `py + line-height + py`. Vertical padding is now the actual visual control.
4. **Font size bump.** Increased font sizes — sm: 12→14px, lg: 14→16px, xl: 16→18px — so content fills more of the button and icons are proportionally larger.
5. **Unified icon-only path.** When `iconOnly` is true, children are now routed through `.iconWrap` instead of `.label`, receiving the same size-constrained treatment.

**Pattern extracted → `design.md` §22: Button Sizing Principles — 5 principles for proportional button construction (icon = line-height, gap-based spacing, padding-derived height, py < px, unified icon path).**

---

## Session: 2026-03-30 — TokenGrid Interactive Token Builder

#### FB-068: "The interactivity is just confusing because you cannot select a color picker"

**UX Intent:** The user's mental model is color-first: pick a concrete color, then see which semantic tokens use it. The previous design forced users to work in the opposite direction — picking abstract dimensions (property, role, emphasis) independently, with no link to actual colors. Separate tabs for Extended Palette and Neutral were redundant because they showed colors without connecting them to the token naming system. The user wants a single integrated builder where choosing a color drives the rest of the interaction.

**Root Cause:** The TokenGrid had a disconnect between the color palettes (displayed in separate tabs) and the token naming system (displayed in the Token Architecture tab). Users could see swatches OR compose tokens, but not both simultaneously. The Role dimension was presented as a manual selection when it should be automatically derived from the color family (Accent → brand, Red → negative, etc.). This created cognitive overhead: users had to know the mapping between color families and semantic roles, which is exactly what the system should teach them.

**Resolution:**
1. Collapsed 4 tabs (Token Architecture / Lumen / Extended / Neutral) → 2 tabs (Token Builder / Lumen Accent).
2. Built a color picker dropdown trigger inline in the formula bar — replaces the static "color" prefix.
3. Dropdown panel (rendered via `createPortal` to bypass overflow clipping) shows all 6 color families with grouped swatch rows and role annotations.
4. Selecting a swatch auto-fills the Role dimension and cascading-filters Property and Emphasis pills to only valid combinations (derived from `_colors.scss` actual token definitions).
5. Invalid dimension pills are visually disabled (30% opacity, `cursor: not-allowed`).
6. Contextual hint text guides users through the selection flow ("Pick a color swatch to auto-fill the role" → "Now choose a property" → "Pick an emphasis level to complete the token").
7. Composed token preview includes a swatch preview of the selected hex color.

**Cross-category note:** Also documented as CFB-020 (content — tab consolidation rationale, dropdown as information filter).

**Pattern extracted → `design.md` §10: Color-first interaction — when demonstrating a mapping between concrete values (colors) and abstract semantics (roles), let the user start with the concrete and derive the abstract automatically.**

---

## Session: 2026-03-30 — Token Architecture Interactive Affordances & IA

#### FB-067: "Can there be some interactiveness here? Currently, the color doesn't really show options"

**UX Intent:** Interactive-looking elements that aren't interactive create a false affordance — the visual treatment signals "I'm clickable" but the behavior says "I'm static." This violates Norman's principle of perceived affordance: the appearance of an element must match its function. The accent-highlighted "color" prefix and pill-shaped dimension values both used visual treatments (colored background, pill shape) that universally signal interactivity in UI, but were static spans. Users see pills and expect to click them.

Additionally, the information architecture within the tab was inverted: rationale ("Why semantic naming") appeared before the architecture itself (the formula). The user's principle is clear: show the result/outcome first, then explain the reasoning. This maps to CAP-006 (Burying the Lede) applied at the component level.

**Root Cause:** The Token Architecture tab was authored as a narrative: motivation → structure → examples. This follows the writer's logic (build up to the conclusion) rather than the reader's need (show me the answer, then explain why). The "color" prefix used `namingPartPrefix` with accent styling (blue bg, semibold) while the other formula parts used `namingPart` with neutral styling — this differential treatment implied "color" was in an active/selected state rather than being a static prefix. The dimension pills used span elements styled like interactive tags but with no click handler.

**Resolution:**
1. **Reordered tabs**: Token Architecture is now the first/default tab (was second after Lumen Accent). The skeleton comes before the examples.
2. **Reordered content within tab**: Architecture (formula + dimensions) first, rationale second. Sub-headers "Naming Formula" and "Why Semantic Naming" provide clear wayfinding.
3. **Made pills interactive**: Dimension values are now `<button>` elements. Clicking a pill selects it — the formula bar updates live to show the composed token name. Selecting all three dimensions shows the full composed token with human-readable interpretation.
4. **Fixed "color" prefix**: Changed from accent-highlighted `namingPartPrefix` to muted `namingPartStatic` — plain text, no background, no blue. It reads as a constant, not an active state.
5. **Replaced static examples**: Removed the 4 hardcoded example tokens. The interactive formula IS the example — users compose their own token name by clicking pills.
6. **Updated section blurb**: CMS seed now contextualizes color as the example domain ("Using color as the example domain: a token naming convention where...").

**Cross-category note:** Also documented as CFB-019 (content) — information hierarchy inversion and section blurb missing domain context.

**Pattern extracted → AP-040: False affordances on static elements. Also reinforces `design.md` §14 (playground consistency) and `content.md` §3 (inverted pyramid / outcome-first structure).**

---

## Session: 2026-03-30 — Playground Swatch Focus Ring Clipping

#### FB-066: "The border is kind of chopped up on the top for the brand key brand color"

**UX Intent:** Every interactive element must visually complete its focus/selection indicator without clipping. A chopped border signals a rendering bug and erodes trust in the design system's own tooling. If the playground — the design system's showcase — can't render clean focus states, it undermines the system's credibility.

**Root Cause:** The `ColorSwatch` button component had zero padding (`w-12` with a flush `h-12 w-12` child). When the user clicks a swatch, the browser draws a focus ring (outline) around the button that extends 2–3px outside the element boundary. In the tight `flex flex-wrap gap-1.5` (6px gap) container, this ring was visually clipped at the top by adjacent content or parent edges. The element was designed for its resting state only — no space was reserved for its interactive state.

**Resolution:**
1. Added `p-0.5` (2px padding) to the `ColorSwatch` button, giving the focus ring a buffer zone to render cleanly.
2. Adjusted width to `w-[52px]` (48px swatch + 4px padding) to maintain layout alignment.
3. Suppressed browser default focus ring (`outline-none`) and replaced with `focus-visible:ring-2 focus-visible:ring-ring` — a Tailwind-managed ring using box-shadow, which is immune to overflow clipping.
4. Added `rounded-sm` to the button so the ring follows the swatch shape.

**Pattern extracted → AP-039: Interactive Elements Without Focus Ring Clearance. Also reinforces `design.md` §14.1 (one visual treatment) — the swatch's interactive state is part of its visual treatment, not an afterthought.**

---

## Session: 2026-03-30 — Breakpoint System Audit & Unification Plan

#### FB-064: "Look at the breakpoints for the design system — audit existing and compare OneGS/Carbon"

**UX Intent:** The design system needs a breakpoint scale built for enterprise B2B SaaS — supporting screens from small phones through ultrawide desktop monitors, with the ability to vary information density at any viewport size. The current breakpoints were inherited from IBM Carbon without adaptation, and two of three apps (Playground, ASCII Tool) silently use different Tailwind defaults. The user wants a deliberate, audited decision on what to adopt, adapt, or reject from Carbon and OneGS, with explicit consideration for large/ultra-large screens and compact-on-big-screen scenarios.

**Root Cause:** The main site's SCSS breakpoints (320/672/1056/1312/1584) are Carbon's exact values — adopted wholesale without evaluating enterprise-specific needs. The Playground and ASCII Tool use Tailwind v4 defaults (640/768/1024/1280/1536) because `globals.css` never overrides `--breakpoint-*`. This creates three separate breakpoint systems in one repo: Carbon (SCSS), Tailwind defaults (Playground/ASCII), and ad-hoc hardcoded values (AdminBar 640px, experiments 768px, typography comments 768/1200). The container tokens (`$portfolio-container-sm` = 672px) also collide with breakpoint names (`$portfolio-bp-sm` = 320px), using the same `sm` label for different values.

**Analysis performed:**
- Full codebase audit: 5 SCSS token breakpoints, Tailwind defaults in 2 apps, hardcoded media queries in 3+ files, typography comment referencing a third scale
- IBM Carbon: 320/672/1056/1312/1584 — 5 tiers, 4→8→16 column doubling, 8px mini-unit, 3 gutter modes, grid influencer pattern. Max at 1584px.
- OneGS (from Figma): 375/768/1024/1440/1920 — 5 tiers, device-oriented naming (Mobile/Tablet/Desktop/XL Desktop/XL+ Desktop). No column system or density modes.
- Tailwind v4: 640/768/1024/1280/1536 — general-purpose web, no enterprise consideration.

**Decision framework (adopt / partially adapt / reject):**

From Carbon — **Fully adopt:** 8px mini-unit, column doubling (4→8→16), three gutter modes (wide/narrow/condensed), grid influencer pattern. **Partially adapt:** breakpoint values (keep 672/1056, replace 320→375, 1584→1920, add 1440 and 2560). **Reject:** 320px mobile (obsolete), 1584px max (too low for enterprise), `max` naming (implies ceiling).

From OneGS — **Fully adopt:** 375px mobile baseline, 1920px as first-class tier. **Partially adapt:** 1440px as explicit tier. **Reject:** device-oriented naming, absence of column system, absence of density modes.

From Tailwind — **Partially adapt:** as implementation mechanism (`@theme` overrides). **Reject:** default values and philosophy.

**Proposed unified scale:**

| Tier | Token | Value | Columns | Rationale |
|------|-------|-------|---------|-----------|
| xs | `$elan-bp-xs` | 375px | 4 | Modern smallest phone. Replaces Carbon 320px. |
| sm | `$elan-bp-sm` | 672px | 8 | Large phone landscape / small tablet. From Carbon. |
| md | `$elan-bp-md` | 1056px | 16 | Standard laptop. From Carbon. |
| lg | `$elan-bp-lg` | 1440px | 16 | Common laptop/external display. From OneGS. New. |
| xl | `$elan-bp-xl` | 1920px | 16+ | Full HD monitor. From OneGS. Replaces Carbon max. |
| 2xl | `$elan-bp-2xl` | 2560px | 16+ | QHD/ultrawide. New tier for enterprise. |

**Status:** PLANNED — awaiting user confirmation before implementation.

**Cross-category note:** Also documented as ENG-070 (engineering) — cross-app breakpoint drift and Tailwind override implementation.

**Pattern extracted → `design.md` §6: Comprehensive responsive breakpoint system — 6-tier scale, column logic, density modes, grid influencers, cross-app unification plan.**

---

## Session: 2026-03-30 — Typography System Revamp

#### FB-063: "Reference OneGS typography and IBM Carbon — audit and revamp typography setup"

**UX Intent:** The typography system had only 9 semantic mixins and no support for enterprise-density compact interfaces, body weight variants, responsive headings, quotes, captions, stats, or utility text categories. A B2B enterprise SaaS product needs dense typography with small minimums (8px per OneGS), explicit font role assignments, and enough semantic variety to avoid raw token usage in components.

**Root Cause:** Typography was under-specified — the system had tokens (scale, weights, leading, tracking) but insufficient semantic mixins mapping those tokens to design intent. No formal rules existed for when to use serif, mono, or pixel fonts, leading to ad-hoc serif usage in non-quote contexts (contact page headings, experiments page headings).

**Resolution:**
- Expanded token foundation: added 2xs (8px), 7xl (72px), 8xl (96px) sizes; thin/extralight weights; compact line-height (1.15)
- Expanded from 9 to 28 semantic mixins across 9 categories: Heading (4), Subtitle (6), Body (9), Quote (3), Caption (2), Label (1), Utility (2), Code (3), Stat (3)
- Added 6 responsive fluid variants using `clamp()` for headings and stats
- Renamed `mono-data` → `code-base`; restricted mono to code-only per Carbon
- Formalized Georgia serif to quotes-only (more selective than OneGS)
- Documented font role assignments, pairing rules, enterprise compact guidelines
- Updated playground tokens.ts with categories/mixin data + typography preview page
- Identified migration candidates for incremental Phase 6 cleanup

**Pattern extracted → `design.md` §18: Full typography system documentation including font role table, 28-mixin catalogue, pairing rules, enterprise compact guidelines, and migration candidates.**

---

## Session: 2026-03-30 — Spacing Token Audit (Agent Parseability)

#### FB-062: "This modal's height has the same exact issue — viewport adjustment"

**UX Intent:** Every modal must provide enough vertical space for content to breathe. A squeezed modal with no min-height collapses to its content size, making it unusable when content is minimal (e.g., a cover image placeholder + two short inputs). This is the same feedback as FB-043 and FB-045 — the user explicitly said "the same kind of UX feedback I gave you before."

**Root Cause:** Third violation of AP-027 (Flex Containers Without Minimum Dimension Constraints). The `ProjectEditModal` was created without carrying over the dimension constraints from the established `EditableArray` panel template. The pattern documentation exists but was not consulted during creation.

**Resolution:** Added `min-height: min(520px, 70vh)`, `min-width: 320px`, `max-height: 88vh` to the modal. Increased internal padding and gap for breathing room. All values now align with the established modal sizing pattern.

**Cross-category note:** Also documented as ENG-068 (engineering). Third violation of AP-027 — escalation note added to the anti-pattern.

**Pattern extracted -> design.md: New modals MUST be created from the established dimension template: `min-height: min(420-520px, 65-70vh)`, `max-height: 88vh`, `min-width: 320px`, `width: min(Npx, 90-92vw)`. The exact min-height should scale with content complexity (simple forms ~420px, rich content ~520px).**

---

#### FB-061: "Hover upload blocks navigation; edit button should open modal instead of dashboard"

**UX Intent:** Admin editing must not degrade the visitor experience. The hover-to-upload overlay blocked navigation to case study detail pages — a core visitor action. The Edit button opening the Payload dashboard in a new tab forced a context switch. The user wants a single modal that consolidates image management and text editing without leaving the page.

**Root Cause:** The HeroUploadZone was designed as a full-surface overlay that appeared on hover, which conflicts with the card's primary affordance (a navigable link). Admin actions occupied the same interaction surface as visitor navigation, creating a mutually exclusive interaction: you could either upload or navigate, never both. The EditButton was a convenience shortcut that didn't respect the inline editing philosophy already established elsewhere in the site.

**Resolution:** Removed the hover overlay entirely. Replaced the Edit button with an inline edit button that opens a `ProjectEditModal` — a centered dialog with cover image preview/upload/browse, text fields for title and category, and footer actions (dashboard link + save). The modal uses `createPortal` to render above the page, follows the same design language as `EditableArray` panels (same shadows, radii, colors), and supports keyboard dismissal (Escape).

**Cross-category note:** Also documented as ENG-066 (engineering) — component architecture and data flow changes.

**Pattern extracted -> Admin edit affordances on navigable elements must be additive, not exclusive. They must: (1) never occupy the same interaction surface as the primary action, (2) use modals or panels that layer above the page, not overlays that replace the page, (3) consolidate related edits (image + text) into a single modal rather than scattered tools.**

---

#### FB-060: Spacing token system audit — 5 consistency fixes for agent parseability

**UX Intent:** The three-tier spacing system (implemented in FB-055) had inconsistencies that degraded agent parseability. Agents need unambiguous tier rules: Tier 1 = clean grid, Tier 2 = layout intent, Tier 3 = component internals. Mixing tiers or leaking oddball values into the wrong tier forces agents to learn exceptions instead of rules.

**Findings and Resolution:**
1. **Primitive scale polluted with utility-only values** — Removed 0.75x, 0.875x, 1.25x, 1.625x from Tier 1. These exist solely for component sizing (button vertical padding) and don't belong in the global 8px grid. Tier 3 utility tokens now own their pixel values directly.
2. **Layout mixins inconsistently mixed Tier 1 and Tier 2** — `container` and `container-narrow` used primitive tokens (`$portfolio-spacer-2x`, `$portfolio-spacer-4x`, `$portfolio-spacer-6x`) for layout-level padding. Migrated to `spacer-layout-compact`, `spacer-layout-spacious`, `spacer-layout-x-spacious`. Rule is now unambiguous: layout mixins always use Tier 2 tokens.
3. **`design.md` utility table incomplete** — Only 6 of 10 tokens were documented. Updated to show all 10.
4. **Utility tokens back-referenced nonexistent primitives** — Removed the circular dependency. Utility tokens now own oddball values as literal px values.
5. **Unused `sass:map` import** — Removed dead code.

**Pattern extracted → `design.md` §1.2: Updated Tier 1 table to show clean progression without oddball fractions. Added note about tier boundary rule.**

**Cross-category note:** Also documented as ENG-064 (engineering).

---

## Session: 2026-03-30 — Media Upload Affordances

#### FB-059: "Link modals don't let me upload files; tiles don't let me upload images"

**UX Intent:** Two distinct upload affordance gaps: (1) Inline edit link modals forced users to type URLs even when the target was an uploaded file (like a resume). The natural flow is "pick/upload the file and let the system handle the URL." (2) Homepage project tiles had no way to set or change cover images — the admin had to use the Payload panel, find the project, upload there, and refresh. The natural flow is hover → drop/click → done.

**Root Cause:** (1) `FieldDefinition` only supported plain input types; no media integration. (2) Cover images were hardcoded to a static map, not CMS-driven, and `ProjectCard` had no upload affordance.

**Resolution:** (1) Added `media-url` field type: URL input + upload button side by side. Upload → auto-fills URL. Applied to social link `href` and project external link `href`. (2) Added `HeroUploadZone` as an admin-only hover overlay on project tiles: semi-transparent overlay with upload icon + "Upload cover" label; accepts drag-and-drop and click-to-browse; shows spinner during upload; stops event propagation so the parent `<Link>` doesn't navigate. Wired homepage to CMS `heroImage` (removed hardcoded map).

**Cross-category note:** Also documented as ENG-062/063 (engineering) and CFB-018 (content).

**Pattern extracted -> `design.md` §10: Upload affordances must be contextual — place them where the user sees the content they want to change, not in a separate admin panel. For image areas, hover overlays with drag-and-drop are the expected pattern. For URL fields that could be files, a companion upload button is the expected pattern.**

---

## Session: 2026-03-30 — Élan Case Study TokenGrid & Section Restructuring

#### FB-058: "Upload screen is not intuitive — no field explanations, no validation"

**UX Intent:** Form fields without descriptions, labels using technical jargon, and no validation feedback violate basic form UX principles. Users need to understand what each field does before they can fill it in correctly. Errors must be specific and contextual, not generic toasts.

**Root Cause:** The Media upload collection used Payload's default field presentation — bare `type: 'text'` fields with no `label` overrides, no `admin.description` helper text, and no `admin.placeholder` examples. The upload filename is set by the browser file picker and Payload's upload handler, with no collection-level explanation that filenames may be sanitized for compatibility. The S3 upload error produced a generic "Something went wrong" toast instead of explaining what was invalid.

**Resolution:** (1) Added human-readable labels: "Alt" → "Description (Alt Text)", "Caption" → "Caption (optional)". (2) Added `admin.description` helper text to all fields explaining purpose in plain language. (3) Added `admin.placeholder` with concrete examples. (4) Added collection-level `admin.description` explaining the upload process and automatic filename cleanup. (5) The underlying S3 error was already resolved by ENG-060 (filename sanitization hook).

**Cross-category note:** Also documented as ENG-060/ENG-061 (engineering — filename sanitization + validation) and CFB-017 (content — field microcopy).

**Pattern extracted → `design.md` §17 (new): CMS admin forms must include field-level descriptions and examples. Technical field names (alt, slug, href) must have human-readable labels with explanations. Generic error toasts are never acceptable — validation must be field-level and specific.**

---

#### FB-057: "Token examples don't follow convention — $portfolio is meaningless — need Lumen accent tab with brand story"

**UX Intent:** The TokenGrid component serves a dual role: it's an interactive showcase in the Élan case study AND it demonstrates the design system's token architecture. Three visual/structural issues:
1. Token examples used `$portfolio-text-neutral-bold` — a SCSS variable prefix unrelated to the described `color.property.role.emphasis` formula. The disconnect undermines the naming convention it's supposed to demonstrate.
2. The "Lumen Accent" tab existed but was purely a color swatch row with no brand story. The user wants the rationale — what Lumen is, why this hue, why the hybrid scaling — in its own dedicated tab.
3. The "Token Architecture" tab lacked rationale. It showed the formula and dimensions but not the design decision (evaluating IBM, Goldman Sachs, Material Design approaches; choosing semantic naming for agent processability).

**Root Cause:** The TokenGrid was built to demonstrate the naming system structurally (formula + dimensions + examples) but omitted the design reasoning — which is the actual signal a hiring manager or fellow designer would evaluate. Token examples were given an arbitrary `$portfolio-` prefix from initial scaffolding rather than following the convention they described. This is the same WHAT-without-WHY pattern identified in CFB-014.

**Resolution:**
1. Reorganized tabs: "Lumen Accent" (brand story + hybrid scaling legend), "Token Architecture" (naming formula + rationale + IBM/GS comparison + agent benefit), "Extended Palette", "Neutral"
2. Fixed token examples to use dot notation matching the formula: `color.text.neutral.bold` instead of `$portfolio-text-neutral-bold`
3. Added rationale text explaining why semantic naming was chosen and how it benefits AI agents

**Cross-category note:** Also documented as CFB-014 (content — broader case study restructuring).

**Pattern extracted → `design.md` §14: Interactive visuals that demonstrate a design system convention must use examples that follow that convention — scaffolding prefixes or placeholder naming break the demonstration.**

---

## Session: 2026-03-30 — TokenGrid Color Section Relevance

#### FB-056: "Spacing and radius tab is irrelevant — section is about color, tabs should be color schemes"

**UX Intent:** The TokenGrid component lives in the "Lumen — A Custom Color Identity" section of the Élan case study. Every tab within that interactive visual must be relevant to the section's topic (color). The Spacing and Radius tabs show non-color design tokens — they belong to a spacing or layout section, not a color identity section. Additionally, the token naming convention (`property.role.emphasis`) that defines the color architecture was missing entirely — this was previously part of the section content and its absence left a gap in the design system narrative.

**Root Cause:** When the TokenGrid was originally built, it was conceived as a general-purpose token showcase rather than being scoped to the section it lives in. The component included all token categories (color, spacing, radius) even though the parent section is specifically about color identity. The token naming convention — the `color.property.role.emphasis` formula that's a key design decision — was never added to the interactive component, only existing in the playground and docs.

**Resolution:**
1. **Removed** Spacing and Radius tabs — irrelevant to a color identity section.
2. **Added** "Extended Palette" tab showing Red, Green, Yellow, and Teal color families sourced from @carbon/colors v11 — these are real color schemes that exist in the design system and are relevant to the section.
3. **Added** "Token Architecture" tab explaining the `color.property.role.emphasis` naming convention with the formula visualization, dimension pills (property, role, emphasis), and concrete examples with color swatches.
4. Updated SCSS: replaced spacing/radius styles with extended palette grid and token architecture styles.

**Cross-category note:** Also documented as CFB-013 (content) — the section's interactive visual must match the section topic, and the token naming convention is a key content element for communicating design system craft.

**Pattern extracted → `design.md` §14: Interactive visuals in case studies must be scoped to the section topic — a general-purpose component that shows everything dilutes the narrative signal.**

---

## Session: 2026-03-30 — Admin Overlay vs Component Content Separation

#### FB-055: "You're forcing an admin view inline edit button on, treating it as the same element as the actual component"

**UX Intent:** Admin controls (edit, delete) are a separate concern from component content. They must be layered on top as an overlay, never inserted into the document flow where they displace real content. The LinkedIn button was pushed to `position: absolute` at the card's top-right corner to make room for admin buttons in the attribution row — violating Fitts' law (the button should be near the name/role it relates to, not in an arbitrary corner). Admin mode should never alter the spatial layout that a visitor would see.

**Root Cause:** The admin edit + delete buttons were placed as flex children inside the `.attribution` row (in-flow), displacing the LinkedIn button. To compensate, the LinkedIn button was given `position: absolute; top; right` on the card — moving it far from its semantic context (the person's name/role). This is an example of admin controls contaminating the component's document flow.

**Resolution:**
1. **Admin controls → absolute overlay:** Moved edit + delete buttons into a `.adminOverlay` div with `position: absolute; top; right; opacity: 0; pointer-events: none`. On `.card:hover`, the overlay fades in with `opacity: 1; pointer-events: auto` and forces child buttons visible (specificity override on `button { opacity: 1; transform: scale(1) }`).
2. **LinkedIn button → back in attribution row:** Removed `position: absolute` from LinkedIn button. It now sits in-flow within the `.attribution` flex row, directly adjacent to the name/role meta — satisfying Fitts' law (the action is near the content it relates to).
3. **Same pattern applied to project cards:** `.cardAdminActions` on project hero images also converted to the overlay pattern (opacity + pointer-events toggled on `.projectHero:hover`).

**Pattern extracted → `design-anti-patterns.md` AP-034: Admin controls in component document flow.**
**Cross-category note:** Also related to ENG-051 (engineering) — the collection CRUD feature that introduced these buttons.

---

## Session: 2026-03-30 — TestimonialCard Component (Homepage Waterfall)

**Chat:** Current session
**Scope:** `src/components/TestimonialCard.tsx`, `src/components/TestimonialCard.module.scss`, `src/app/(frontend)/HomeClient.tsx`, `src/app/(frontend)/page.tsx`

#### FB-055: "This DAG is drawn horribly — hard to navigate — consider infinite canvas"

**UX Intent:** The Feedback Architecture diagram in the Élan case study was unreadable: 12 nodes crammed into a 380px container with 9px text, percentage-based absolute positioning causing overlap, and no way to explore a complex multi-tier graph. The user requested a draggable canvas approach. Simultaneously, the user identified that zero accessibility standards existed for interactive components.

**Design Decisions:**
- Replaced absolute-positioned SVG+div diagram with a pannable 880×620px canvas inside an overflow-hidden viewport — drag-to-explore interaction pattern consistent with the ScrollSpy dead zone implementation already in the codebase.
- 6-tier vertical layout with 200px-wide nodes at 12px mono font (up from 9px), 32px horizontal gaps, clear visual differentiation per tier (accent tints for input/process/skill, neutral for steps, green for docs, accent border for escalation).
- Zoom controls (+/- buttons + pinch-to-zoom) in top-right corner, plus reset button.
- Click-to-select nodes with description appearing in a detail bar below the canvas (replacing hover tooltip which was invisible on touch).
- Established §17 Interactive Component Accessibility in `design.md` — keyboard navigation (arrow keys for tabs, pan), ARIA tab pattern (`role="tablist/tab"`, `aria-selected`, `aria-controls`), focus indicators (`2px solid accent-60`), `prefers-reduced-motion: reduce`, and pointer-only interaction equivalents.
- Applied ARIA tab pattern to all 4 Élan visual components (TokenGrid, ComponentShowcase, EscalationTimeline, InteractionShowcase) — a total of 18 tab buttons across the 4 tab bars.

**Cross-category note:** Also documented as ENG-052 (engineering) — CSS module purity constraint and `prefers-reduced-motion` scoping.

**Pattern extracted → `design.md` §17: Interactive Component Accessibility — new section covering keyboard, ARIA, focus, motion sensitivity, and pointer-only equivalents.**

---

#### FB-054: "Build a testimonial card to mix in with the waterfall gallery"

**UX Intent:** The homepage masonry grid is currently all project cards — a uniform tile type. Interleaving testimonial cards breaks the visual monotony, adds social proof at the browsing layer (before the visitor commits to reading a case study), and creates height variation that enhances the waterfall stagger effect described in §15.3.

**Design Decisions:**
- Geist Pixel Square for the decorative quotation mark — creates a distinctive typographic accent that ties the card to the design system's pixel font family without competing with body text.
- Initials-based avatar fallback — avoids empty states when no photo is uploaded.
- LinkedIn icon as the only action — keeps the card's purpose focused (social proof) without turning it into a contact widget.
- Surface-secondary background with border — visually distinct from project cards (which use surface-tertiary image placeholders) while sharing the same B2B-tight density.
- No hover state or link behavior — testimonial cards are read-only social proof, not navigable.

**Cross-category note:** Also documented as ENG-048 (engineering) for CMS schema and data flow changes.

**Pattern extracted → `design.md` §15: Added heterogeneous tile types to masonry grid for visual rhythm.**

---

## Session: 2026-03-30 — ScrollSpy Label Left-Alignment

**Chat:** Current session
**Scope:** `src/components/ScrollSpy.module.scss`, `src/app/(frontend)/work/[slug]/ProjectClient.tsx`, `src/app/(frontend)/about/AboutClient.tsx`

#### FB-053: "IT IS STILL NOT FIXED!!!! This text is not fixed. It's still aligned to the center."

**UX Intent:** ScrollSpy section labels that appear on hover must be vertically centered with their corresponding tick marks — the visual midline of each label text must sit at the exact same Y-coordinate as the center of its tick bar. Labels that are "a few pixels down" break the spatial mapping between text and notch. A secondary issue: labels must sit close to the ticks with only a small gap, not be pushed far away.

**Root Cause (two compounding issues):**
1. **Vertical misalignment (primary):** The label used `top: 50%; transform: translateY(-50%)` for vertical centering. However, Framer Motion animates the `x` property via inline `transform`, which *overrides* the CSS `transform: translateY(-50%)`. The result: `top: 50%` places the label's **top edge** at the tick center, and the label extends downward from there — producing a consistent ~6px downward shift. This is the "few pixels down" the user observed.
2. **Horizontal gap (self-inflicted):** The initial fix (min-width: 16rem) pushed labels far from the ticks, creating a huge horizontal gap. The original right-anchored positioning (content-width + `right: calc(100% + spacing)`) was correct for horizontal proximity.
3. **Import path:** Case study pages imported ScrollSpy from the npm package, not the local component. Fixed in the same pass.

**Resolution:**
1. Replaced `top: 50%; transform: translateY(-50%)` with `top: 0; height: $portfolio-spacing-05; display: flex; align-items: center`. This uses the same height as the notch and flex centering, which doesn't rely on `transform` at all — so Framer Motion's `x` animation can't interfere with vertical positioning.
2. Removed `min-width: 16rem; text-align: left` (caused the horizontal gap). Labels are content-width again, tight to the ticks.
3. Synced local ScrollSpy styles with the design system package version.
4. Switched `ProjectClient.tsx` and `AboutClient.tsx` imports to `@/components/ScrollSpy`.

**Escalation note:** This is the 4th centering/alignment complaint (FB-030, FB-033, FB-050, FB-053). The frequency map in `design.md` Appendix already lists "Centering / Symmetry" at 3 — updating to 4.

**Pattern extracted → `design.md` §10.5: Never use CSS `transform` for vertical centering on elements animated by Framer Motion — FM overrides CSS `transform` with its own inline transform for `x`/`y`/`scale`/`rotate` properties. Use `top: 0; height: <parent-height>; display: flex; align-items: center` instead.**

---

## Session: 2026-03-30 — Playground Sidebar Header Spacing

**Chat:** Current session
**Scope:** `playground/src/components/sidebar.tsx`

#### FB-052: "Navigation bar header spacing is asymmetric with collapse button distance inconsistent between states"

**UX Intent:** The sidebar header used `px-4` (16px) horizontal padding while the rest of the sidebar (nav area, search, archive) used `px-1.5` (6px). This created visible misalignment between the logo/collapse button and the nav items below. Additionally, the collapse button's distance from the sidebar's right border was 16px in expanded mode but ~14px in collapsed mode — the inconsistency makes the expand/collapse transition feel unstable.

**Root Cause:** The header container was styled independently from the rest of the sidebar. Expanded state used `px-4` while collapsed used `px-1.5`, and the collapse button (`w-8 h-8`) was larger than the expand button (`h-7` with `pl-[7px]`), creating mismatched proportions between states.

**Resolution:**
1. Unified header container padding to `px-1.5` (matching nav area, search, and archive containers)
2. Added `px-2` to the logo link, placing the É logo box at 14px from sidebar left — aligned with nav item icons (6px container + 8px link padding = 14px)
3. Changed collapse button from `w-8 h-8` to `w-7 h-7` (matching expand button's `h-7`) with icon from `w-4 h-4` to `w-3.5 h-3.5` (matching expand button's icon size)
4. Added `mr-2` to collapse button, placing its right edge at 14px from sidebar right — matching the collapsed expand button's 14px right distance (41px - 6px - 21px = 14px)

**Spacing verification (all elements now at 14px from sidebar edges):**
- Expanded logo: 6px + 8px = 14px from left ✓
- Expanded collapse button: 6px + 8px = 14px from right ✓
- Collapsed expand button: 41px - 6px - 21px = 14px from right ✓
- Nav items: 6px + 8px = 14px from edges ✓
- Archive: 6px + 8px = 14px from edges ✓

**Pattern extracted → `design.md` §4.1: Sidebar header must use the same container padding (`px-1.5`) as nav/archive/search sections, with internal element padding (`px-2`, `mr-2`) providing the 14px edge distance.**

---

## Session: 2026-03-29 — Case Study Detail Page Visual Refinements

**Chat:** Current session
**Scope:** `src/app/(frontend)/work/[slug]/ProjectClient.tsx`, `src/app/(frontend)/work/[slug]/page.module.scss`

#### FB-051: "Collaborators are all stacked into one line; description text too small"

**UX Intent:** Three distinct issues on the case study detail page, all related to scannability and information hierarchy in the sidebar and intro blurb:
1. Collaborators (Product Management, Engineering, Customer Success) render on a single line rather than as distinct entries — the reader can't parse them as separate stakeholder groups.
2. The description/scope statement text (the first blurb after the hero) lacks enough visual presence to capture attention as the most important paragraph on the page.
3. Duration showed a ship date ("Shipped August 2022") which is redundant with the description and doesn't communicate project length.

**Root Cause:**
1. The `EditableArray` component wraps all rendered items inside a single `<div>` that has no column layout. The parent `.metaGroup` uses `flex-direction: column`, but the wrapper div absorbs the spans and renders them inline.
2. `.descriptionText` used `$portfolio-type-base` (16px) and `$portfolio-weight-regular` (400) — the same visual weight as body text, failing to differentiate the scope statement as a higher-priority content element.
3. Content issue: "Shipped August 2022" duplicates information already in the description text. Duration should communicate project length.

**Resolution:**
1. Created `.collaboratorList` CSS class with `display: flex; flex-direction: column; gap: $portfolio-spacing-02`. Applied via `className` on `EditableArray` and as a wrapper `<div>` in the non-admin path. Each collaborator now renders on its own line.
2. Upgraded `.descriptionText` to `$portfolio-type-lg` (18px) and `$portfolio-weight-medium` (500), changed color to `$portfolio-text-primary`. This gives the scope statement a distinct "intro paragraph" presence without being as heavy as section headings.
3. Changed Lacework duration to "~3 months". Updated CMS field description to guide future entries toward project length rather than ship dates.

**Cross-category note:** Also documented as CF-010 (content) and ENG-041 (engineering). The collaborator rendering is an engineering/component issue; the duration and description typography are content strategy issues.

**Pattern extracted → `design.md` §17 (case study detail): The scope statement (first blurb) must have visually distinct typography — larger and medium-weight — to function as the hiring manager's primary engagement hook after the hero image.**

---

## Session: 2026-03-29 — Admin Edit View UX Batch

**Chat:** Current session
**Scope:** `src/app/(frontend)/HomeClient.tsx`, `src/app/(frontend)/page.module.scss`, `src/components/admin/ViewSiteLink.tsx`, `src/payload.config.ts`

#### FB-049: "no easy way for me to enter the visual edit view"

**UX Intent:** The user needs a clear, discoverable path from the Payload CMS admin dashboard to the visual editing experience on the live site. Currently, the only way is to manually navigate to the public URL after logging in.

**Root Cause:** No link existed from the Payload admin UI to the public site. The `AdminBar` component only appears when already on the public site — a chicken-and-egg problem for discovery.

**Resolution:** Created `ViewSiteLink` component (`src/components/admin/ViewSiteLink.tsx`) and registered it as an `afterNavLinks` component in `payload.config.ts`. This adds a "Visual Editor" link with an external-link icon at the bottom of the Payload admin sidebar nav, pointing to the public site root. Also updated the SiteConfig global description to mention the Visual Editor link.

**Pattern extracted -> `design.md`: CMS admin should always provide a one-click path to the visual editing experience.**

**Cross-category note:** Also documented as ENG-039 (engineering) — CMS tab organization.

#### FB-048: "it's a link and will bring users outside elsewhere, not showing the redirect icon"

**UX Intent:** External links should consistently show the ↗ (northeast arrow) icon to signal they will navigate away from the site. The Links section had this icon but the Experience section (formerly Teams) did not.

**Root Cause:** The team items rendered `<a>` tags without the arrow icon, while the sidebar Links section consistently included `<span className={styles.arrow}>&#8599;</span>`.

**Resolution:** Added the `<span className={styles.arrow}>&#8599;</span>` to experience item `<a>` tags when the company has a URL. This matches the established pattern in the Links section.

**Pattern extracted -> `design.md`: All external links must include the ↗ icon — no exceptions. This is a consistency invariant.**

#### FB-047: "footer too tall, editing function is broken, why is it so tall"

**UX Intent:** The footer was disproportionately tall for its content (5 items in a column layout with generous padding, totaling 300px+). The duplicate links in the footer were not editable (plain `<a>` tags), and the version/date metadata was not user-facing content. The user questioned the footer's existence given sidebar already has the links.

**Root Cause:** Footer contained redundant elements (links already in sidebar, metadata like version/date) and used `$portfolio-spacing-09` (48px) padding with column layout.

**Resolution:** Compacted the footer to a single horizontal row containing only the CTA text and email — the two unique footer elements. Removed duplicate links, version, and last-updated date. Reduced padding from 48px to 24px (`$portfolio-spacing-06`). Changed layout to `flex-direction: row; justify-content: space-between`. Total footer height reduced from ~300px to ~60px.

**Pattern extracted -> `design.md`: Footer should contain only content that isn't already visible elsewhere on the page. Duplicate navigation is a UX anti-pattern.**

**Cross-category note:** Also documented as ENG-037 (engineering) — email save bug in the footer.

---

## Session: 2026-03-29 — ScrollSpy Upstream Migration & Alignment Fix

**Chat:** Current session
**Scope:** Design system (`@yilangaodesign/design-system/components/ScrollSpy`), portfolio consumers (`ProjectClient.tsx`, `AboutClient.tsx`, `next.config.ts`)

#### FB-050: "ScrollSpy notches too close, text not aligned with notches — fix upstream"

**UX Intent:** ScrollSpy labels must be legible at a glance and precisely aligned with their corresponding tick marks. Tight spacing causes labels to feel cramped; misaligned labels break the visual mapping between text and notch. User established the principle: all component fixes must flow upstream through the design system, not be patched at the portfolio level.

**Root Cause (three issues):**
1. **Spacing**: `.track` gap was `$portfolio-spacing-03` (8px). With short tick marks (2px tall) the gap felt tight relative to label text heights.
2. **Alignment fragility**: `.notch` had no explicit height — it collapsed to the tick button's 2px height. The label used `top: 50%; transform: translateY(-50%)` for centering, but 50% of 2px = 1px — a single-pixel reference too fragile for reliable alignment. Browser variation in button minimum height (from inherited line-height via `font: inherit` in `button-reset`) shifted the notch height by 1-2px, causing labels to drift from their ticks.
3. **Architecture**: ScrollSpy was a portfolio-level component (`src/components/ScrollSpy.tsx`), not in the design system. Fixes applied locally would not propagate to other consumers.

**Resolution:**
1. **Promoted ScrollSpy to the design system** — created `components/ScrollSpy.tsx` and `components/ScrollSpy.module.scss` in `@yilangaodesign/design-system`. Updated `package.json` exports to include `./components/ScrollSpy`. Added `components` to the `files` array.
2. **Fixed alignment**: Gave `.notch` explicit `height: $portfolio-spacing-05` (16px) so `top: 50%` resolves to 8px — a meaningful centering reference. Added `line-height: 0; min-height: 0` to `.tick` to eliminate browser-imposed button sizing.
3. **Adjusted rhythm**: Changed `.track` gap to `$portfolio-spacing-01` (2px) since the 16px notch height now provides visual rhythm. Kept `width: 28px` on `.notch` for stable horizontal label anchoring.
4. **Portfolio migration**: Added `transpilePackages: ["@yilangaodesign/design-system"]` to `next.config.ts`. Updated `ProjectClient.tsx` and `AboutClient.tsx` imports to `@yilangaodesign/design-system/components/ScrollSpy`.

**Pattern extracted → `design.md`: Absolutely-positioned labels need a container with meaningful height (not sub-5px) for `top: 50%` to produce reliable alignment. All component fixes must be applied upstream in the design system — portfolio-level patches are only for site-specific customizations explicitly requested.**

**Cross-category note:** Also documented as ENG-040 (engineering) — infrastructure change to `next.config.ts` and design system package exports.

---

## Session: 2026-03-29 — Array Edit Modal Height

**Chat:** Current session
**Scope:** `src/components/inline-edit/inline-edit.module.scss` (`.arrayPanel`)

#### FB-045: "extend the modal height a little — max viewport share is too short"

**UX Intent:** The inline array editor (e.g. Edit Teams) should show more rows before the inner scroll kicks in. The previous `80vh` cap felt slightly cramped relative to typical laptop viewports.

**Resolution:** Raised `.arrayPanel` `max-height` from `80vh` to `88vh` and nudged `min-height` from `min(400px, 60vh)` to `min(420px, 65vh)` so short viewports still get a slightly taller default panel.

---

## Session: 2026-03-29 — Required Field Indicators and Inline Validation

**Chat:** Current session
**Scope:** `src/components/inline-edit/EditableArray.tsx`, `src/components/inline-edit/inline-edit.module.scss`

#### FB-044: "this input field doesn't show that it's a mandatory input field"

**UX Intent:** Required fields must be visually distinguishable from optional fields before the user interacts with them. When validation fails, error feedback must appear at the point of failure (the specific field), not at a distant location (the server response bar). The save button should become disabled to prevent futile attempts.

**Resolution:**
1. **Red asterisk:** Required fields show a red `*` after the label text (`.requiredMark` class).
2. **Inline validation errors:** After the user's first save attempt, empty required fields get a red border (`.arrayFieldInputError`) and a text message directly under the input: `"{Label} is required"` (`.fieldError` class).
3. **Deferred validation:** Errors only appear after the first save click (`showValidation` state), not on panel open. This avoids premature nagging when the user is still filling things in.
4. **Disabled save:** "Save & Close" is disabled when validation is showing and errors exist, with a footer message: "Fill in all required fields before saving."
5. **Auto-recovery:** As soon as the user fills in the required field, the error disappears in real-time (validation is computed from `localItems`).

**Pattern extracted → `design-anti-patterns.md` AP-028: form fields without required indicators or client-side validation**

**Cross-category note:** Also documented as ENG-035 (engineering — schema relaxation) and CF-008 (content — validation copy).

---

## Session: 2026-03-29 — Panel Minimum Dimensions

**Chat:** Current session
**Scope:** `src/components/inline-edit/inline-edit.module.scss`

#### FB-043: "you should always have a minimum height and minimum width consideration with all the responsiveness considered"

**UX Principle:** Every modal, panel, or dialog must have minimum dimension constraints to guarantee usability regardless of content. A panel that collapses to near-zero height when empty or lightly loaded is unusable. Responsiveness means setting both a minimum (usability floor) and maximum (viewport ceiling) using `min()` for the lower bound and `max-height`/`max-width` for the upper.

**Resolution:** Added `min-height: min(400px, 60vh)` and `min-width: 320px` to the array panel. The `min()` function ensures the floor respects small viewports while providing a usable default on standard screens.

**Pattern extracted → `design-anti-patterns.md` AP-027: flex containers without minimum dimension constraints**

**Cross-category note:** Also documented as ENG-034 (engineering — regression from flex refactor).

---

## Session: 2026-03-29 — Error Banner Visibility for Critical Actions

**Chat:** Current session
**Scope:** `src/components/inline-edit/InlineEditBar.tsx`, `src/components/inline-edit/inline-edit.module.scss`

#### FB-042: "this banner should have an error state... it's too subtle for something that's critical"

**UX Intent:** When a save fails, the user's work is at risk of being lost. The error state must be unmissable. A small red text label next to the buttons is insufficient — the entire bar should visually transform to signal danger, using color, contrast, and hierarchy to communicate urgency.

**Root Cause:** The error was displayed as a small `font-size: 12px` red text crammed into the actions area, competing with the Discard and Save buttons for attention. On the dark gray bar, the red text was low-contrast and easy to miss. The bar's visual state didn't change at all on error — same background, same layout.

**Resolution:**
1. **Full-bar error state:** Added `.editBarErrorState` class that changes the entire bar background to deep red (`#991b1b`) with matching border.
2. **Error replaces the count:** In error state, the "N unsaved changes" text is replaced by the error message with a warning icon — one primary message, not two competing statuses.
3. **High-contrast buttons:** Discard button adapts to the red background (lighter border/text). Save button becomes a white "Retry" button with dark red text — maximum contrast against the red bar.
4. **Smooth transition:** Background color transitions over 200ms for a non-jarring state change.

**Pattern extracted → `design-anti-patterns.md` AP-026: low-contrast error states for critical actions**

**Cross-category note:** Also documented as ENG-033 (engineering — error parsing) and CF-007 (content — technical jargon).

---

## Session: 2026-03-29 — Panel Critical Actions and Drag Reorder

**Chat:** Current session
**Scope:** `src/components/inline-edit/EditableArray.tsx`, `src/components/inline-edit/inline-edit.module.scss`

#### FB-041a: "the CTA for Save and Close or Add Item is not always visible to me"

**UX Intent:** For high-stakes actions like Save (where not saving means losing the user's work), the action button must ALWAYS be visible. Scrolling it off-screen violates the principle that critical actions belong on a persistent navigation layer, not in the content flow.

**Root Cause:** The panel used `overflow-y: auto` on the entire `.arrayPanel` container, meaning header, body, AND footer all scrolled as one unit. With enough items, the footer (containing "Save & Close" and "Add item") scrolled below the fold.

**Resolution:** Restructured the panel to a flex column layout: header (`flex-shrink: 0`) → body (`flex: 1; overflow-y: auto`) → footer (`flex-shrink: 0`). Only the item list scrolls. Header and footer are always pinned.

**Pattern extracted → `design-anti-patterns.md` AP-024: critical action buttons in scrollable content flow**

#### FB-041b: "why are you forcing users to have multiple clicks... when things can be dragged"

**UX Intent:** Reordering a list by clicking up/down arrows is high-friction: N-1 clicks to move an item from position N to position 1. Drag-and-drop is the expected interaction for reordering — it's direct manipulation with immediate spatial feedback. During drag, items should collapse so the user doesn't have to scroll past expanded content to find the drop target.

**Resolution:**
1. Replaced up/down arrow buttons with a 6-dot drag handle (grip pattern) on the left of each item.
2. Implemented native HTML5 drag-and-drop: `draggable` on handle, `onDragStart`/`onDragOver`/`onDrop`/`onDragEnd` for reorder logic using splice.
3. During drag, all items collapse to a single-line summary (index + first field value). Fields and delete buttons are hidden via the `.panelDragging` parent class. This shortens the list dramatically, making drop targeting easy.
4. Drop target indicated by a blue top-border line (`box-shadow: 0 -2px 0 0 $accent`). Dragged item shown at 30% opacity.

**Pattern extracted → `design-anti-patterns.md` AP-025: arrow buttons for list reorder when drag is possible**

**Cross-category note:** Also documented as ENG-032 (engineering) for the implementation specifics.

---

## Session: 2026-03-29 — Inline Edit Panel: Missing Labels and Field Affordances

**Chat:** [Inline CMS experience](0c0a7972-7ad5-4928-a1fd-0c61746d4816) (originally documented as ENG-029 engineering-only; retroactively capturing the design dimension)
**Scope:** `src/components/inline-edit/EditableArray.tsx`, `src/components/inline-edit/inline-edit.module.scss`

#### FB-040: "It's really unclear about what the second field is"

**UX Intent:** When editing structured data in a panel (like a Teams list with Company, Period, and Website fields), every input must communicate what it is and what format it expects. The user should never have to guess. A URL field should look like a URL field. A text field should have a label above it, not just a placeholder that disappears.

**What was missed (design dimension):**
This feedback was originally processed only through the engineering track (ENG-029), which focused on schema changes and data wiring. But the core complaint was a **UX design failure**: the array panel violated fundamental form design principles:
1. **No persistent labels** — Inputs relied solely on placeholder text. Once you type, you lose all context about what the field is for. This violates the "labels above inputs" pattern that's been standard since at least Material Design / GOV.UK Design System.
2. **No field type differentiation** — A URL field looked identical to a text field. No `type="url"` affordance, no protocol prefix hint, no visual distinction. The user typed "2023-2024" into a URL field because nothing said "this is for a web address."
3. **No inline help text** — Complex fields (like period: "What format? '2023-Present'? 'Q1 2024'?") had no description or example below the input.

**Resolution:**
1. Added persistent `<label>` elements above every input, styled as small uppercase headers.
2. Updated field type from generic `text` to `url` where appropriate, so browsers provide URL-specific affordances.
3. Reordered fields by cognitive priority: Company (identity) → Period (temporal context) → Website (supplementary).

**Pattern extracted → `design-anti-patterns.md` AP-023: form inputs without persistent labels**

**Cross-category note:** This feedback also had engineering (ENG-029: schema missing period field) and content dimensions (form labels as UX microcopy). See the feedback routing update in `AGENTS.md` for the new multi-track classification process.

---

## Session: 2026-03-29 — Block SVGs Breaking Inline Link Flow

**Chat:** Current session
**Scope:** `src/app/(frontend)/work/[slug]/page.module.scss`, `src/app/globals.scss`

#### FB-039: "Why is there such a weird, super bad layout for the text here?"

**UX Intent:** A description paragraph with inline links should read as flowing prose. When each link and its icon break onto separate lines, the paragraph becomes a vertical list — destroying readability and making the page look broken rather than designed.

**Root Cause:** The global CSS reset in `globals.scss` includes `svg { display: block; max-width: 100%; }` (a common modern reset pattern). This forces ALL `<svg>` elements to block-level display, including the tiny 8×8px external-link arrow icons inside inline `<a>` tags in the description paragraph. Block SVGs break text flow — each icon occupies its own line, fragmenting the paragraph.

**Resolution:**
1. Added `display: inline` to `.externalIcon` in `page.module.scss` to override the global `svg { display: block }` reset. The icon now flows naturally within the text.
2. Added `white-space: nowrap` to `.inlineLink` to prevent the arrow icon from wrapping away from its link text at line break points.

**Pattern extracted → `design-anti-patterns.md` AP-021: global svg display:block breaking inline icons**

---

## Session: 2026-03-29 — Sidebar Scrollbar & Spacing Asymmetry

**Chat:** Current session
**Scope:** `src/app/(frontend)/page.module.scss`

#### FB-038: "Why is there a scroll bar on the left-hand side? Left and right spacing is not even"

**UX Intent:** A scrollbar that appears when content fits is visual noise — it signals to the user that there's hidden content when there isn't. It undermines trust in the layout. The asymmetric spacing is a consequence: the scrollbar gutter (~15px) eats into the sidebar's 300px width, making the effective content area ~285px, which creates a visible gap between sidebar content and the main grid that doesn't match the left page margin.

**Root Cause:** The sidebar had `overflow-y: auto` and `max-height: calc(100vh - 24px - 48px)`. This was a defensive pattern for cases where sidebar content exceeds the viewport height. But the sidebar content (identity + about + teams + links) fits cleanly on desktop viewports. The `overflow-y: auto` was showing a scrollbar gutter that served no purpose, and the `max-height` constraint was unnecessarily capping a sidebar that didn't need capping.

**Resolution:** Removed `max-height` and `overflow-y: auto` from the sidebar. The sidebar is `position: sticky` with `align-self: flex-start` — it takes the natural height of its content and sticks to the top. No scrollbar, no gutter, no asymmetry. The full 300px width is now available for sidebar content.

**Pattern extracted → `design-anti-patterns.md` AP-020: unnecessary overflow-y on fit-content containers**

---

## Session: 2026-03-29 — Homepage Spacing Density Pass

**Chat:** Current session
**Scope:** `src/app/(frontend)/page.module.scss`

#### FB-037: "Too much spacing in between for an enterprise-type product"

**UX Intent:** The previous spacing pass (FB-036) converted the grid to masonry but left all gap/padding values at consumer-level sizes. The user reiterated the §0 Design Posture: this is B2B, and every pixel of whitespace must justify its existence. "Not dense enough" means the grid gutter, layout margins, sidebar section gaps, and footer spacing were all one tier too generous.

**Root Cause:** The initial masonry conversion reused existing spacing tokens (16px gaps, 32px layout padding, 48px sidebar section gaps) without auditing them against the B2B density mandate. Each value was defensible in isolation but collectively produced a layout that felt airy rather than efficient.

**Resolution:** Systematic one-tier tightening across the entire page:
- Layout top/bottom padding: 32px → 24px (`spacing-07` → `spacing-06`)
- Layout side padding (desktop): 48px → 32px (`spacing-09` → `spacing-07`)
- Sidebar-to-content gap: 40px → 32px (`spacing-08` → `spacing-07`)
- Sidebar sections gap: 48px → 32px (`spacing-09` → `spacing-07`)
- Section label margin-bottom: 16px → 12px (`spacing-05` → `spacing-04`)
- Column gap: 16px → 12px (`spacing-05` → `spacing-04`)
- Card margin-bottom: 16px → 12px (`spacing-05` → `spacing-04`)
- Footer margin-top: 96px → 48px (`layout-06` → `spacing-09`)
- Sidebar sticky top and max-height calc updated to match

**Pattern extracted → `design.md` §15.4 and §15.5 reinforced: tighter is correct for B2B**

---

## Session: 2026-03-29 — Homepage Masonry Grid for Scannability

**Chat:** Current session
**Scope:** `src/app/(frontend)/page.module.scss`, `src/app/(frontend)/HomeClient.tsx`

#### FB-036: "Case studies space is taking up a lot of space, not great for quick scanning"

**UX Intent:** The homepage's primary job is to let a visitor quickly assess the *breadth* of work — how many companies, what industries, what types of projects. The existing layout optimized for individual project showcase (large hero cards, full-width featured items) at the expense of scanability. The user explicitly referenced Pinterest as a density benchmark: multiple tiles visible simultaneously so the eye can jump between them without committing to sequential scrolling. The blank space at the top (96px padding) compounded the problem by pushing the first project card below the fold on many viewports.

**Root Cause:** Three compounding layout decisions made the grid too sparse for a portfolio overview:
1. **96px top padding** (`$portfolio-layout-06`) — created a void above content, pushing the first card well below the viewport top
2. **Featured cards spanning 2 columns** at 2:1 aspect ratio — each featured card consumed the full grid width, forcing sequential scanning
3. **CSS Grid with fixed row flow** — all cards sat in a rigid row-based grid, wasting vertical space between cards of different heights instead of packing them efficiently

**Resolution:**
1. Reduced layout top padding from `$portfolio-layout-06` (96px) to `$portfolio-spacing-07` (32px) — content starts earlier, less dead space
2. Updated sidebar sticky top and max-height calc to match the new 32px padding
3. Reduced sidebar-to-content gap from `$portfolio-spacing-10` (64px) to `$portfolio-spacing-08` (40px)
4. Narrowed sidebar from 340px to 300px — gives more room to the project grid
5. Converted project grid from CSS Grid to **CSS columns masonry**: `column-count: 1` (mobile), `2` (md), `3` (lg) — cards flow top-to-bottom then left-to-right, packing efficiently like a waterfall
6. Removed `grid-column: span 2` on featured items — all cards occupy 1 column width
7. Differentiated featured (4:3 aspect ratio) from regular (3:2) for natural height variation in the masonry flow
8. Compacted card info padding from `$portfolio-spacing-04 $portfolio-spacing-02` (12px 4px) to `$portfolio-spacing-03 $portfolio-spacing-01` (8px 2px)

**Pattern extracted → `design.md` §15: Portfolio Grid Layout (new section)**

**Anti-pattern extracted → `design-anti-patterns.md` AP-019: Hero-Scale Cards in Portfolio Overview**

---

## Session: 2026-03-29 — Square Icon Tabs in Collapsed Sidebar

**Chat:** Current session
**Scope:** `playground/src/components/sidebar.tsx`

#### FB-035: "Each collapsed nav tab is not a square — keep the height, make it wider"

**UX Intent:** Collapsed nav icons should live inside a perfect square hit zone, not a rectangle. The user wants visual symmetry — each tab should be as wide as it is tall.

**Root Cause:** The sidebar was 40px wide. After 1px border-r and 6px padding each side (`px-1.5`), items had 27px of width but 28px of height (`h-7`) — 1px off from square.

**Resolution:** Widened the collapsed sidebar from 40px to 41px. Inner width = 40px, minus 12px padding = 28px item width = `h-7`. Each tab is now a 28×28 square. Also updated the search flyout (`left-[41px]`) and category sliver positioning (`left-[41px]`).

**Bonus:** With 28px item width and `pl-[7px]`, the 14px-wide icon center lands at exactly 14px = 28/2. The previously "near-centered" icon (0.5px offset) is now **exactly centered** (0px offset).

**Pattern extracted → `design.md` §4.2 updated with square-tab geometry.**

---

## Session: 2026-03-29 — Search-to-Nav Spacing & Category Naming

**Chat:** Current session
**Scope:** `playground/src/components/sidebar.tsx`

#### FB-034: "Spacing between search and nav is too much; divider not centered; 'Foundational' collides with 'Foundations'"

**UX Intent:** Three related sidebar polish issues: (1) excessive gap between search and the first nav section, especially visible in collapsed view; (2) the divider line positioned closer to the items below than the search above (2:1 ratio instead of 1:1); (3) naming collision between the "Foundations" section header and the "Foundational" component category.

**Root Cause:**
1. Three additive padding sources between search and nav: `pb-1` on search container (4px) + `pt-1` on scrollable nav (4px) + `mt-1` on section divider (4px) = 12px above the `h-6` divider wrapper. The divider line sat at 24px from search (12px padding + 12px half of h-6) vs 12px from first item — a 2:1 ratio.
2. The "Foundational" category name shares the "found-" root with the "Foundations" section header. Users read both labels in the same visual column and perceive them as related/redundant.

**Resolution:**
1. Removed `pb-1` from both search containers (collapsed and expanded)
2. Removed `pt-1` from the scrollable nav area
3. Removed `mt-1` from section dividers — the `h-6` wrapper IS the entire gap, per §1.4
4. Divider line now sits at 12px from search bottom and 12px from first item — perfectly centered
5. Renamed "Foundational" category to "Base" (id changed from `foundational` to `base`)

**Pattern extracted → `design.md` §11: naming collision avoidance principle**

---

## Session: 2026-03-29 — Collapsed Icon Centering

**Chat:** Current session
**Scope:** `playground/src/components/sidebar.tsx`

#### FB-033: "Navigation bar items are not centrally aligned — skewed towards the right"

**UX Intent:** In a narrow 40px collapsed sidebar, even a 1.5px offset from center is perceptible. Multiple icons stacked vertically amplify the asymmetry. The user expects icons to appear centered in the collapsed column.

**Root Cause:** `pl-2` (8px left padding) places the icon center at 21px from the sidebar left edge. The sidebar's inner width is 39px (40px minus 1px `border-r`), so the true center is 19.5px. The icon was 1.5px right of center. The 1px border-right was not accounted for in the original centering math.

**Resolution:** Changed all collapsed-mode left padding from `pl-2` (8px) to `pl-[7px]` (7px) across all five instances: search button, header expand button, category buttons (direct links and flyout triggers), and Archive link. The icon center is now at 20px — 0.5px from true center — imperceptible. The transition shift between collapsed (13px) and expanded (14px) is only 1px over 200ms.

**Pattern extracted → `design.md` §4.2: updated with `pl-[7px]` rule and border-width accounting**

---

## Session: 2026-03-29 — Navigation IA: Foundations Section + Overview Identity

**Chat:** Current session
**Scope:** `playground/src/components/sidebar.tsx`, `playground/src/app/page.tsx`

#### FB-032: "Put Overview and Styles together under a section — add branding to Overview page"

**UX Intent:** The sidebar navigation lacked a conceptual tier for the system's identity layer. Overview (what is this system?) and Styles (what are its visual atoms?) are both "foundation-level" artifacts — they describe what the system IS, not what it BUILDS. Grouping them under a shared "Foundations" section header establishes a clear hierarchy: Foundations → Components → Archive. The Overview page itself was generic ("Design System / Tokens, components, and patterns") and needed to become the system's front door — introducing Élan by name, explaining its purpose, methodology, and intended use.

**Root Cause:** Overview was a standalone link outside the category system, and the Styles category had its own section header ("Styles"). There was no conceptual grouping that said "these two things belong together." The Overview page content was auto-generated summary text with no authorial voice.

**Resolution:**
1. Added `href` optional field to `NavCategory` type for direct-link items (no flyout)
2. Moved Overview into `componentCategories` as a direct-link entry: `{ id: "overview", href: "/", section: "Foundations" }`
3. Changed Styles section from `"Styles"` to `"Foundations"`
4. Updated `CategoriesSection` rendering to handle `href` categories as `<Link>` (not flyout trigger)
5. Updated `getCategoryForPath` to check `cat.href` in addition to `cat.links`
6. Updated search index to include direct-link categories
7. Removed standalone Overview link from scrollable nav
8. Rewrote Overview page: Élan version header, "A personal design system by Yilan Gao" hero, two info cards (Intended Use, How It's Built), then style page navigation cards with a "Styles" sub-header

**Pattern extracted → `design.md` §11: direct-link categories extend the NavCategory model for items that navigate directly without a flyout**

---

## Session: 2026-03-29 — Sidebar Collapse Anchoring & Hover Sliver

**Chat:** Current session
**Scope:** `playground/src/components/sidebar.tsx`

### Design Reflection — What the User Was Actually Designing

This session surfaced two interaction-level issues that share a common principle: **navigation should feel spatially anchored and effortlessly responsive to the user's intent.**

1. **Left-anchored collapse** — When collapsing the sidebar, icons shifted from left-aligned to center-aligned positions. The user perceives this as the nav "moving to the middle and then to the right." The correct mental model is a sidebar anchored to the left edge: it extends rightward when expanding and retracts from the right when collapsing. The icons should be at a fixed horizontal position in both states.

2. **Hover-to-reveal sliver** — The category sliver (secondary menu) required a click to open. The user finds this "very inconvenient" — a pattern that requires deliberate targeting and clicking for what should be a fluid exploration action. Hover-to-reveal treats the sidebar as a progressive disclosure surface: the user's cursor position expresses intent, and the interface responds without requiring a commitment (click).

**The meta-principle:** A navigation system should minimize the effort required to explore. Clicking to open a sub-menu, then clicking to close it, creates a transactional feel. Hovering to reveal and leaving to dismiss creates a conversational feel — the user and the interface are in a continuous dialogue about what's being explored. The sidebar becomes a lens the user moves around, not a series of doors they must open and close.

### Feedback → Intent → Resolution

---

#### FB-030: "When collapsing, everything moves to the middle — should be left-aligned"

**UX Intent:** The navigation sidebar should be anchored to the left edge. During the collapse transition, icons should stay at the same horizontal position. The sidebar width shrinks from the right; the left edge is invariant. Centering icons in collapsed mode creates horizontal shift during the transition that users perceive as unstable layout.

**Root Cause:** In collapsed mode, all nav links used `justify-center w-7 mx-auto` — centering icons in a 28px square within the 28px container. In expanded mode, links used `px-2` — left-aligning icons at 14px from sidebar edge. The icon position shifted from ~14px (expanded) to ~13px (collapsed, centered) during the transition.

**Resolution:**
1. Replaced `justify-center w-7 mx-auto` with `pl-2` on all collapsed nav links (Overview, categories, Archive)
2. Changed collapsed header from `justify-center` to `px-1.5` (left-aligned)
3. Changed collapsed search button from centered (`justify-center w-7 h-7 mx-auto`) to left-aligned (`pl-2 h-7`)
4. Icons now sit at 14px from sidebar left edge in both states — zero horizontal shift during transition

**Pattern extracted → `design.md` §4: updated §4.2 with left-anchoring principle**

---

#### FB-031: "Side panel should slide out on hover, not require clicking"

**UX Intent:** Navigation exploration should be fluid and effortless. Requiring a click to open the category sliver creates unnecessary interaction friction for what is essentially a "peek at what's inside" action. Hover-to-reveal treats the user's cursor position as a statement of interest; leaving the area is a statement of disinterest. No commitment (click) required.

**Root Cause:** The CategorySliver component was wired to `onClick` handlers on category buttons. Opening required a click; closing required clicking the backdrop or the close button. Both interactions demand targeting precision and deliberate action.

**Resolution:**
1. Added `onMouseEnter` to category buttons that opens the sliver on hover (desktop only; mobile retains tap)
2. Replaced the backdrop overlay + close button with a timer-based hover zone: `onMouseLeave` on sidebar/sliver starts a 200ms close timer; `onMouseEnter` on either cancels it
3. Added slide animation to CategorySliver: `translate-x-0` (visible) ↔ `-translate-x-full` (hidden) with `transition-transform duration-200 ease-out` — sliver slides out from behind the sidebar and slides back
4. Non-category elements (header, Overview, search, Archive) close the sliver on hover — prevents stale sliver when user moves to non-category areas
5. Added `displayedCategory` state to keep sliver content during exit animation
6. Sliver resets on sidebar collapse/expand (state coherence per §12.3)

**Pattern extracted → `design.md` §4: updated §4.1 with hover-to-reveal interaction model**

---

### Session Meta-Analysis

**Recurring theme:** Both issues relate to spatial stability and interaction fluidity — the same family of concerns from FB-013 (collapse spacing) and FB-020/021/022/023 (search flyout session). The sidebar is the most-interacted-with element in the playground, and users are acutely sensitive to any friction or instability in it.

**Key learning — Hover zones need timer handoff:** When two adjacent elements (sidebar and sliver) share a hover zone, the mouse must be able to cross the boundary between them without triggering a close. A 200ms timer on `mouseLeave` with a `cancelClose` on `mouseEnter` handles this seamlessly. The timer also serves as a grace period for quick mouse passes.

**Key learning — Non-category elements must reset sliver:** The `mouseEnter`/`mouseLeave` pattern on the aside element alone is insufficient because moving between elements inside the aside (from a category to the Overview link) doesn't trigger `mouseLeave` on the aside. Explicit close handlers on non-category elements are needed.

---

## Session: 2026-03-29 — Footer Height Alignment

**Chat:** Current session
**Scope:** `playground/src/components/shell.tsx`, `playground/src/components/sidebar.tsx`

#### FB-029: "The footer height and the navigation tab archive section height are not aligned"

**UX Intent:** Horizontal bands that span the full page width (sidebar + content) must share the same height. The top row already does this (sidebar header `h-12`, page header `h-12`). The bottom row was inconsistent — the sidebar archive section was ~44px (implicit from `py-2` + `h-7` link) while the page footer was ~40px (implicit from `py-3` + text). A 4px mismatch at the bottom edge creates a visible seam that undermines the otherwise aligned grid. The principle: if adjacent panels share a horizontal boundary, the boundary must be at the same Y coordinate.

**Root Cause:** Both bottom sections used implicit height derived from padding + content instead of an explicit shared value. The top row avoided this problem because both headers used explicit `h-12`.

**Resolution:**
1. Gave both the sidebar archive section and the page footer an explicit `h-11` (44px) with `flex items-center` for vertical centering.
2. Removed `py-2` / `py-3` padding that was creating the implicit (mismatched) heights.

**Pattern extracted -> `design.md` §2: Layout Integrity — horizontal bands across adjacent panels must use explicit shared heights, not implicit padding-derived heights.**

---

## Session: 2026-03-29 — Version Display Consolidation

**Chat:** Current session
**Scope:** `playground/src/components/sidebar.tsx`, `playground/src/components/shell.tsx`

#### FB-028: "I don't think you should add the version controlling navigation bar"

**UX Intent:** Version metadata belongs at the page level, not in persistent navigation. The sidebar had "Élan 1.0.0" while the page footer had "Local Dev · Design System last updated 2026-03-29" — two competing sources of the same information. Conflicting metadata erodes trust and creates visual noise in the nav, which should be reserved for navigation only.

**Root Cause:** The Élan versioning implementation placed version info in the sidebar (persistent, always-visible) while a pre-existing footnote in the Shell component already showed version-adjacent metadata. The two were never consolidated.

**Resolution:**
1. Removed the version label from the sidebar bottom section.
2. Updated the Shell footer to use `elan.json` data instead of a hardcoded date constant, consolidating version + last-updated into a single page-level footnote.
3. The footnote now reads: "Élan 1.0.0 · Last updated 2026-03-29" (with dev version and release-ahead indicator when running locally).

**Pattern extracted -> `design.md` §14: Playground Consistency Principles — version metadata belongs in page-level footnotes, not navigation chrome.**

---

## Session: 2026-03-29 — Color Page UI Audit & Playground Footnote

**Chat:** [Color page UI audit — swatch sizes, legacy removal, footnote](current-session)
**Scope:** `playground/src/app/tokens/colors/page.tsx`, `playground/src/components/token-grid.tsx`, `playground/src/components/shell.tsx`
**Duration:** 1 feedback exchange (3 issues raised)

### Design Reflection — What the User Was Actually Designing

This session surfaced three issues that share a common root principle: **the playground is a product, and its audience is designers and developers who need to consume token information efficiently.** Every UI element must justify its presence through user value, not system completeness.

1. **Inconsistent swatch sizes** — Three different heights (80px, 56px, 40px) across the same page for the same conceptual element (a color swatch). This isn't a feature; it's visual inconsistency that makes the page look unpolished. The user correctly identified this as the first thing that feels wrong.

2. **Legacy "was:" labels** — Showing previous token names (`was: surface-primary`) is system-centric thinking. It answers "what was this called before?" — a question only the maintainer cares about. The audience (designers, developers) needs to know what a token is called *now*. Historical names are noise that dilutes the signal.

3. **Version/last-updated footnote** — Rather than removing version info entirely, the user reframed it as a useful piece of metadata: "when was this design system last released?" This is audience-centric — it tells consumers how fresh the documentation is. The localhost vs. production distinction acknowledges that the same UI serves two contexts with different trust models.

**The meta-principle:** Every piece of information in a design system playground must pass a user-centric filter: "Does the audience need to see this?" If the answer is "only the maintainer needs this," it doesn't belong in the UI. Put it in docs, git history, or changelogs — not in the product surface.

### Feedback → Intent → Resolution

---

#### FB-025: "Why are all the colors using different sizes?"

**UX Intent:** Visual consistency is foundational to a design system's credibility. If the playground — the system's own documentation — can't maintain consistent sizing for its most basic element (a color swatch), it undermines trust in the system's rigor. Every swatch on the page represents the same conceptual object (a color sample) and should have the same visual weight.

**Root Cause:** Three independent sizing decisions drifted apart:
1. `ColorSwatch` component had a `large` prop (`h-20` vs `h-14`) used for accent/neutral scales
2. `EmphasisSwatch` used `h-14` for semantic tokens
3. Interaction section used a completely different card layout with `w-10 h-10` inline swatches

**Resolution:** Removed the `large` prop from `ColorSwatch`, standardizing all swatches to `h-14`. Refactored the interaction section to use the same `ColorSwatch` component instead of a custom card layout. All color swatches on the page now share one visual pattern at one size.

**Pattern extracted → `design.md` §14: Playground Consistency Principles (new)**

---

#### FB-026: "I don't need what it was before; that is just noise"

**UX Intent:** Design system documentation should be user-centric, not maintainer-centric. Legacy token names answer a question only the system author cares about ("what was this called before the refactor?"). The audience — designers and developers consuming the tokens — only needs the current, canonical name and value. Historical information belongs in changelogs and git history, not in the product surface.

**Root Cause:** The `EmphasisSwatch` component had a `showLegacy` prop that displayed `was: {old-token-name}` beneath each swatch. This was useful during the migration from flat naming to property·role·emphasis naming, but was never removed after the migration completed.

**Resolution:** Removed `showLegacy` prop from `EmphasisSwatch` and `RoleRow`. Removed all `showLegacy` prop passes in `PropertySection`. The legacy mapping still exists in `tokens.ts` data for programmatic use but is no longer rendered in the UI.

---

#### FB-027: "There could be a version in footnotes — when was this last released?"

**UX Intent:** Consumers of a design system need to know how current the documentation is. A "last updated" footnote is a trust signal — it tells the audience "this was reviewed recently" or "this might be stale." The localhost vs. production distinction is important: on localhost, the developer needs to know they're looking at a local build (not the published version); on production, the audience just needs the release date.

**Root Cause:** No version or timestamp metadata was displayed anywhere in the playground UI.

**Resolution:** Added `DesignSystemFootnote` component to `Shell`. On localhost, it displays "Local Dev · Design System last updated YYYY-MM-DD". On production, it displays "Design System last updated YYYY-MM-DD". The date is a constant (`DS_LAST_UPDATED`) that should be updated when the design system is released. The footer uses `text-[11px]` mono at 60% opacity — clearly subordinate to page content.

---

### Session Meta-Analysis

**Key learning — User-centric vs. system-centric information:** The "was:" labels and inconsistent sizing both stem from the same root issue: the playground was partially built from the maintainer's perspective (showing migration artifacts, using different sizes for different data sources) rather than the consumer's perspective (showing the current system, consistently). This is a recurring risk in design system documentation — the people building it have different information needs than the people using it.

**Key learning — Visual consistency as a swatch primitive:** A color swatch is the most basic visual element in a color token page. If it doesn't have consistent sizing, nothing else on the page will feel intentional. The `large` prop was a convenience that created visual fragmentation.

---

## Session: 2026-03-29 — ScrollSpy for Long Playground Pages

**Chat:** [ScrollSpy for pages with significant overflow](current-session)
**Scope:** `playground/src/app/tokens/{colors,motion,typography}/page.tsx`, `playground/src/components/scroll-spy.tsx`, `playground/src/components/token-grid.tsx`
**Duration:** 1 feedback exchange (proactive design request, not a complaint fix)

### Design Reflection — What the User Was Actually Designing

This request appeared to be about adding a UI component to pages. It was not. The user was establishing a **content navigation policy** — a design-system-level rule about when secondary navigation aids are warranted and when they create unnecessary complexity.

The critical phrase was: *"Only if the scroll is significant, and you need to find how significant it is to justify a ScrollSpy, because adding ScrollSpy unnecessarily can create lots of work, so let's not do that."* This is a cost-benefit framework: the user is saying that every UI element has a maintenance cost, a cognitive cost, and an implementation cost, and those costs must be justified by proportional user benefit. A ScrollSpy on a 1.5-viewport-height page is visual noise — it adds interaction surface that doesn't pay for itself. A ScrollSpy on a 5-viewport-height page with 8 named sections is essential wayfinding.

**The design principle being articulated:** Navigation aids follow a threshold model, not a blanket policy. The threshold has two dimensions — **content depth** (how many viewport heights) and **section count** (how many distinct, named regions). Both must be high enough to justify the aid. A page can be long but monotonic (a single grid of 200 color swatches) — that doesn't need a ScrollSpy because there's nothing to navigate *between*. A page can have many sections but be short — that doesn't need a ScrollSpy because the user can already see most sections. The sweet spot is pages that are both deep AND structured.

**The audit discipline:** The user explicitly asked me to *evaluate* which pages qualify rather than giving me a list. This is a design maturity signal — the user expects the agent to apply judgment, not just follow instructions. The evaluation required reading every page, estimating rendered height (not just line count — a 150-line page with data-driven grids can render 5 viewport heights), and assessing section structure. This is design auditing, not implementation.

**What was decided:**
- **Colors** (8 sections, 4-5+ viewport heights): accent, neutral, extended palette with many color families, and 5 semantic categories. The extended palette alone renders hundreds of swatches.
- **Motion** (6 sections, 5+ viewport heights): easing curves with SVG visualizations, duration demos, choreography preset cards, 11 interactive mixin demos in a 3-column grid, globals, z-index.
- **Typography** (5 sections, 3+ viewport heights): type scale with rendered samples, font stack cards with sample text, weights, line heights with paragraph demos, letter spacing.

**What was excluded and why:** All 15 component pages were excluded despite some having 4 preview sections. A `ComponentPreview` in default (preview) mode renders at ~280px height. Four of these plus a props table total ~1500-1800px — roughly 1.7-2 viewport heights. That's moderate scrolling, not "a lot." The user explicitly drew the line at "a lot," which maps to 3+ viewport heights with 5+ named sections.

### Feedback → Intent → Resolution

---

#### FB-024: "For all pages with significant vertical overflow, add ScrollSpy — only if it's a lot of scrolling"

**UX Intent:** Establish a content navigation policy: secondary navigation aids (ScrollSpy) should only be added when the cost-benefit analysis is positive. The costs are: implementation effort, maintenance burden, additional interaction surface for the user to learn, and visual noise on shorter pages. The benefit is: wayfinding in deeply structured, long pages where the user loses their place. The user wants the agent to develop judgment about where this threshold falls, not apply a blanket rule.

**Root Cause:** Not a bug — a proactive design enhancement. The three token pages (colors, motion, typography) had accumulated enough content sections and rendered depth to cross the threshold where users would meaningfully benefit from a right-rail navigation aid.

**Resolution:**
1. Created `playground/src/components/scroll-spy.tsx` — Tailwind-based equivalent of the main site's `src/components/ScrollSpy.tsx`, preserving all interaction behaviors: IntersectionObserver tracking, pointer capture drag, dead zone click/drag discrimination (from AP-012 lesson), closest-element mapping (from AP-011 lesson)
2. Added `id` prop to `SubSection` component in `token-grid.tsx` with `scroll-mt-16` to offset for the sticky header
3. Added ScrollSpy with section ids to colors (8 notches), motion (6 notches), typography (5 notches)
4. ScrollSpy labels use abbreviated versions of section titles for tooltip brevity: "Choreography" instead of "Choreography Presets (TS)"

**Pattern extracted → `design.md` §13: Content Navigation Policy (new section)**

---

### Session Meta-Analysis

**Key learning — ScrollSpy threshold model:** ScrollSpy is warranted when a page meets BOTH conditions: (a) 3+ viewport heights of rendered content, and (b) 5+ distinct named sections that a user might want to jump between. Pages that are long but monotonic, or structured but short, do not benefit.

**Key learning — Label brevity:** ScrollSpy tooltip labels must be shorter than section headings. The heading "Interactive Mixins (SCSS)" becomes the label "Mixins". The user is already on the page and knows the context — the label only needs to differentiate sections from each other, not introduce them.

**Key learning — `scroll-mt` for sticky headers:** Any `scrollIntoView({ block: "start" })` or anchor navigation requires `scroll-mt-{N}` on the target element to prevent the section heading from scrolling under the sticky header bar.

**Process failure in this session:** The agent did not activate the design-iteration skill before beginning work, did not read `docs/design.md` or `docs/design-anti-patterns.md` pre-flight, and initially completed the task without writing this reflection. This was caught by the user. See meta-analysis below.

---

## Session: 2026-03-29 — Sidebar Information Architecture & Search Redesign

**Chat:** [Sidebar IA taxonomy and search redesign](e4c4b12f-63d8-4e02-acd3-706ddef7b37d)
**Scope:** `playground/src/components/sidebar.tsx` — Navigation taxonomy, search interaction, flyout architecture
**Duration:** 9 feedback exchanges

### Design Reflection — What the User Was Actually Designing

This session appeared to be about renaming a tab and reorganizing a list. It was not. Across nine exchanges, the user was articulating a coherent design systems philosophy through specific, concrete decisions. Every prompt carried a deeper intent:

**1. "Rename UI Primitives to Foundational" → Taxonomy is architecture, not labeling.**
The user rejected "UI Primitives" not because the name was wrong, but because the *concept* was wrong. "Primitives" is implementation jargon — it describes what a component *is* (a building block). "Foundational" describes what the component *does for the designer* (it forms the base you build on). This is the difference between taxonomy-as-inventory and taxonomy-as-wayfinding. The user was pushing the design system from a developer's mental model (component types) to a designer's mental model (design tasks). Every subsequent categorization decision — Toast moving to Feedback, Select moving to Forms — followed this same principle: categorize by the job the designer is trying to accomplish, not by the component's technical ancestry.

**2. "I significantly disagree with how some of them are here" → Design system credibility requires opinion.**
A design system that dumps 15 components into "UI Primitives" is a system that hasn't been curated. It's a directory listing, not a design opinion. The user's frustration wasn't just about findability — it was about the system's authority. If the component library can't decide where a Toast belongs, why would a consumer trust its spacing tokens? The reorganization into 9 task-oriented categories (Foundational, Forms & Controls, Feedback & Overlay, Navigation & Menus, Data Display, Layout & Shell, Content & Media, Entrance & Reveal, Interaction) was an act of editorial curation that makes the system feel *authored*, not auto-generated.

**3. "There should still be dividers" → Hierarchy needs explicit visual scaffolding.**
When the initial reorganization flattened everything into a single list of categories, the user immediately asked for the TOKENS/COMPONENTS section dividers back. This isn't nostalgia for the old layout — it's recognition that two distinct *types* of artifacts (tokens vs. components) need a visual signal that they belong to different conceptual tiers. The dividers act as a typographic device: they declare "what follows is a different kind of thing." Without them, the user has to infer the boundary from context, which adds cognitive overhead in exactly the place where navigation should be effortless.

**4. "Within the sliver there could be a section header" → Progressive disclosure must preserve context.**
Category flyouts (slivers) that present a flat list of 8+ links lose the user. Adding optional `group` sub-headers inside the flyout gives structure without adding depth. This is the Goldilocks principle applied to progressive disclosure: one level (flat list) is too shallow for large categories, three levels (nested accordions) is too deep for a sidebar, but two levels (category → grouped links) is exactly right.

**5. "Instead of the form expanding, it kind of just has a floating menu" → Interaction responses belong near the trigger.**
The user rejected both a centered modal and an in-place expansion for search. The centered modal violated Fitts's Law — the mouse travels from the sidebar edge to the viewport center, a long movement for a frequent action. The in-place expansion was better but consumed sidebar real estate and disrupted spatial memory (other nav items shift). The floating adjacent panel was the synthesis: it appears immediately next to the trigger (minimal mouse travel), doesn't displace existing navigation (spatial stability), and disappears when not needed (no persistent cost). This is the same principle as right-click context menus and tooltip popovers — the response should appear where the user's attention already is.

**6. "When I click to expand, that search modal doesn't disappear" → State must be coherent across mode transitions.**
The flyout persisting into expanded mode as a visual duplicate revealed a systems-level concern: the sidebar has two display modes (collapsed/expanded), and every piece of transient state (open menus, search queries, active flyouts) must either transfer gracefully between modes or reset. The user wasn't just reporting a rendering bug — they were asserting that modal state and layout state must be coupled. When the layout changes, the modals must re-evaluate whether they still make sense in the new context.

**7. "It's a different size" / "not aligned horizontally" → Visual identity must survive spatial transformation.**
When the same affordance (search input) appears in two spatial contexts (inline in expanded sidebar, flyout adjacent to collapsed sidebar), it must look like the same control. Different font sizes, different heights, different border treatments — these signal "two different things" rather than "one thing in two places." The user was enforcing identity consistency: the search input is a single design artifact; its spatial position changes, but its visual form does not.

**Meta-pattern across the whole session:** The user is designing at the systems level. Every individual piece of feedback was a specific instance of a general principle: *a design system must be internally coherent, editorially opinionated, and spatially stable*. The taxonomy work was about coherence (every component has exactly one logical home). The search redesign was about spatial stability (interactions don't displace content, mode transitions don't create visual duplicates). The insistence on matching sizes and alignment was about editorial opinion (the system has a specific visual voice that doesn't change based on context).

This session's deepest lesson: **the navigation IS the design system's first impression.** If the sidebar — the literal table of contents — is disorganized, inconsistent between states, or spatially unstable, it undermines every component documented inside it. The user was fixing the frame, not the painting.

### Feedback → Intent → Resolution

---

#### FB-019: "Change UI Primitives to Foundational; rearrange components — Toast to feedback, forms and controls, data grid, menu"

**UX Intent:** Component taxonomy should reflect design tasks (what the user is trying to accomplish), not implementation types (what the component technically is). A catch-all "UI Primitives" category with 15 items signals a system that hasn't been curated. Each category should answer the question "what kind of design problem am I solving?" — Foundational (base building blocks), Forms & Controls (data input), Feedback & Overlay (system responses), etc.

**Root Cause:** The original taxonomy was auto-organized by technical similarity (all "basic" components in one bucket) rather than by usage context. No editorial pass had been done to challenge placements.

**Resolution:**
1. Renamed "UI Primitives" to "Foundational" and reduced it to true base elements (Button, Card, Badge, Divider, Avatar, Tag)
2. Created 9 task-oriented categories: Foundational, Forms & Controls, Feedback & Overlay, Navigation & Menus, Data Display, Layout & Shell, Content & Media, Entrance & Reveal, Interaction
3. Redistributed all components based on the design job they serve (Toast → Feedback, Select/Input → Forms, DataGrid → Data Display, etc.)
4. Converted flat token links into a collapsible "Tokens" category, consistent with component categories

**Pattern extracted → `design.md` §11: Information Architecture**

---

#### FB-020: "Instead of the form expanding, have an extension as a floating menu or modal"

**UX Intent:** Search interaction responses should appear adjacent to the trigger (Fitts's Law) without displacing existing navigation (spatial stability). A centered modal requires long mouse travel; an inline expansion shifts nav items. A floating panel next to the sidebar synthesizes proximity with stability.

**Root Cause:** The original search expanded inline, consuming sidebar space and pushing navigation items down — violating spatial memory.

**Resolution:**
1. Replaced inline search expansion with `SidebarSearch` component
2. Collapsed mode: floating flyout panel rendered via `createPortal` to `document.body`, positioned adjacent to sidebar at `left-[40px]`
3. Expanded mode: inline dropdown below a trigger button, within the sidebar column
4. Global `Cmd+K` shortcut wired to both modes

**Pattern extracted → `design.md` §4.4: Search Interaction, §11.3: Interaction Proximity**

---

#### FB-021: "The floating modal is not center-aligned with the search tab; not the same size"

**UX Intent:** When the same affordance (search input) appears in two spatial contexts, it must be visually identical. Different sizes signal "two different controls" rather than "one control in two positions." Visual identity must survive spatial transformation.

**Root Cause:** The collapsed flyout input used `h-9`, `text-[13px]` while the expanded inline input used `h-7`, `text-[12px]`. The flyout was at `left-[44px]` (4px gap from sidebar edge) instead of flush.

**Resolution:**
1. Unified input styling: both modes use `h-7`, `text-[12px]`, `pl-6 pr-2`, `bg-sidebar-muted/50 rounded-sm border border-accent/50`
2. Flyout positioned at `left-[40px]` (flush with sidebar right edge), `w-[200px]` (matches expanded sidebar width)
3. Search icon size unified to `w-3 h-3` in both contexts

**Pattern extracted → `design.md` §12.2: Visual Identity Across Spatial Contexts**

---

#### FB-022: "When I expand the sidebar, the search modal doesn't disappear — becomes duplicate"

**UX Intent:** Transient UI state (open flyouts, search queries) must be coherent with layout state. When the sidebar mode changes, all mode-dependent transient state must either transfer or reset. A flyout that persists into expanded mode creates a visual duplicate — the user sees two search bars, which is disorienting and signals broken state management.

**Root Cause:** The `SidebarSearch` component's `open` state was not coupled to the `collapsed` prop. Expanding the sidebar changed the rendered UI but didn't reset the flyout.

**Resolution:** Added a `useEffect` in `SidebarSearch` that watches the `collapsed` prop and resets `open` to `false` and `query` to `""` on any change. Mode transitions now always start from a clean state.

**Pattern extracted → `design.md` §12.3: State Coherence Across Mode Transitions**

---

#### FB-023: "It's trapped in the navigation bar; I can't see anything; same as screenshot"

**UX Intent:** A flyout that is visually trapped inside its parent container defeats the purpose of a flyout. The user couldn't see the search results, couldn't interact with the sidebar, and couldn't dismiss the overlay — a complete interaction dead-end.

**Root Cause:** The sidebar `<aside>` element had Tailwind transition classes that applied CSS `transform` (e.g., `translate-x-0`). In CSS, any `transform` property — even an identity transform — creates a new stacking context and a containing block. `position: fixed` elements inside a transformed ancestor are positioned relative to that ancestor, not the viewport. Combined with `overflow-hidden` on the sidebar, the flyout was clipped to the sidebar's bounds.

**Resolution:** Rendered the collapsed flyout via `createPortal(…, document.body)`. This escapes the sidebar's DOM hierarchy entirely, making the flyout truly viewport-fixed. A separate `flyoutRef` was added for click-away detection spanning both the trigger button and the portal content.

**Pattern extracted → `design.md` §12.1: Portal Escape for Stacking Contexts**

**Anti-pattern extracted → `design-anti-patterns.md` AP-013: Fixed Positioning Inside Transformed Containers, AP-014: Centered Modals for Contextual Actions**

---

### Session Meta-Analysis

**Recurring theme:** 5 of 9 messages were about the search flyout — its positioning, sizing, state management, and stacking context behavior. The search control is a microcosm of the session's larger concern: **a design system's navigation must be spatially stable, visually consistent, and state-coherent.** Each search bug was a different manifestation of the same principle violation.

**Escalation pattern:** The user's feedback escalated when a fix addressed the symptom but not the principle. Fixing the flyout's visual appearance without fixing the stacking context left the interaction broken (FB-023 after FB-021). This confirms §7.1: diagnose architecturally before patching visually.

**Design maturity signal:** The user consistently operated at the systems level — never asking "make this pixel bigger" but always asking "why doesn't this behave like it should?" The gap between what was built and what was expected reveals where the system's internal logic breaks down. Every fix in this session was a logic fix, not a cosmetic fix.

---

## Session: 2026-03-29 — ScrollSpy Interaction Design

**Chat:** [ScrollSpy playground interaction fixes](current-session)
**Scope:** `playground/src/app/components/scroll-spy/page.tsx` — ScrollSpy demo component
**Duration:** 4 feedback exchanges

### Feedback → Intent → Resolution

---

#### FB-017: "ScrollSpy spacing should be slightly wider; drag sensitivity too low; active tick width change squeezes content"

**UX Intent:** Three related interaction design issues that compound into a broken feel:
1. **Spacing (Fitts's Law):** Interactive tick elements spaced at 8px create tiny pointer targets. The user must move with surgical precision to hit a specific notch — the opposite of how a scrub control should feel. Generous spacing increases target zones and makes the control feel responsive.
2. **Gesture discrimination:** A control that supports both click-to-navigate and drag-to-scrub must distinguish between the two intents. When every pointer-down immediately enters drag mode, taps are impossible — the user can only drag, never click. The dead zone pattern (defer drag until movement exceeds a threshold) is the standard solution.
3. **Layout stability:** When the active tick widens (16px → 28px), the track column's intrinsic width changes, pushing the adjacent content panel. This is the same class of bug as AP-009 (toggle state spacing inconsistency) applied to width instead of height: state transitions must not alter layout geometry.

**Root Cause:**
1. Track `gap-2` (8px) was too tight for comfortable pointer interaction
2. `onPointerDown` immediately entered drag mode with `e.preventDefault()`, suppressing `click` events and making tap-to-navigate impossible
3. Track column had no fixed width — relied on intrinsic sizing from child ticks, which varies with active state
4. `indexFromPointer` used linear interpolation across the full track height (including padding), causing pointer zones to misalign with actual tick positions

**Resolution:**
1. Increased tick spacing to `gap-4` (16px) with `py-1` per notch for larger hit areas
2. Added pointer dead zone pattern: `onPointerDown` records start position, `onPointerMove` only enters drag mode after 3px of movement, `endInteraction` detects click (no drag activated) and smooth-scrolls to target
3. Added `w-10` fixed width to track column so tick width changes don't affect layout
4. Replaced linear interpolation with closest-element detection: `indexFromPointer` queries all `[data-notch-index]` elements and returns the one whose center is nearest to the cursor

**Pattern extracted → `design.md` §10: Interactive Control Design (new section)**

**Anti-pattern extracted → `design-anti-patterns.md` AP-011: Linear Interpolation for Pointer-to-Element Mapping**

---

#### FB-018: "The drag sensitivity and distance are still too long; click is not working"

**UX Intent:** The first fix improved spacing and added click/drag discrimination, but the pointer-to-index mapping was still broken. Clicking a specific tick mapped to the wrong section because the linear interpolation didn't account for padding and centering. This is a precision issue: the user clicks exactly on a tick and expects to go to that section — any mismatch feels random and broken.

**Root Cause:** `indexFromPointer` still used `(clientY - trackTop) / trackHeight * (count - 1)`. With `py-6 justify-center`, ticks were centered in the track, so the top ~25% of the track mapped to index 0, and clicking tick 0 (which was at ~30% from top) returned index 1.

**Resolution:** Replaced the linear formula with a closest-element query. Each notch div has a `data-notch-index` attribute. `indexFromPointer` iterates all notches, computes distance from cursor to each center, and returns the closest. This is always correct regardless of padding, gaps, or centering.

**Pattern extracted → `design.md` §10.3: Pointer-to-Index Mapping**

---

## Session: 2026-03-29 — Color Palette Expansion (Carbon-Influenced)

**Chat:** [Carbon color comparison and palette expansion](current-session)
**Scope:** `src/styles/tokens/_colors.scss`, `docs/design.md` §9
**Duration:** 1 feedback exchange

### Feedback → Intent → Resolution

---

#### FB-016: "I want a comprehensive, accessible color palette influenced by IBM Carbon"

**UX Intent:** The existing color system was functional but minimal — only neutral grays, a brand accent, and two support colors. A comprehensive palette ensures that when future use cases arise (data visualization, status indicators, tags, notifications, syntax highlighting), there are pre-vetted, accessible colors ready. The user explicitly wants the palette to be a toolkit ("just because I have that color doesn't mean I have to use it") while keeping the current UI neutral-dominant.

**Root Cause:** Not a bug — a deliberate expansion. The existing palette already matched Carbon's gray family exactly. The gap was in chromatic color families (blue, red, green, yellow, orange, teal, cyan, purple, magenta) and several semantic token categories (warning, info, caution, helper text, error text, focus, highlight, disabled border).

**Resolution:**
1. Added 9 chromatic color families (90 new color values) from `@carbon/colors` v11, using exact IBM hex values
2. Expanded semantic tokens: added `text-helper`, `text-error`, `text-on-color`, `border-disabled`, `support-warning`, `support-info`, `support-caution-minor`, `support-caution-major`, `focus`, `focus-inset`, `highlight`
3. Rewired existing `support-error` and `support-success` to use the new palette variables for consistency
4. Documented complete color philosophy in `design.md` §9 — palette-as-toolkit principle, neutral-dominant UI posture, brand accent vs Carbon primary, semantic token mapping with rationale, accessibility contrast reference, and catalog of unused-but-available colors

**Pattern extracted → `design.md` §9: Color Philosophy (new section)**

---

## Session: 2026-03-29 — Sidebar Toggle Spacing Consistency

**Chat:** [Sidebar collapse spacing fix](current-session)
**Scope:** `playground/src/components/sidebar.tsx` — Collapsible sidebar nav
**Duration:** 1 feedback exchange

### Feedback → Intent → Resolution

---

#### FB-013: "Collapse view and expanded view have different spacing. Tabs jump up and down."

**UX Intent:** When a component has two states connected by a toggle, the transition must feel seamless. If tabs shift vertically during the transition, it reads as a layout bug — the user loses their spatial anchor. A staff-level UX designer catches this; it's a detail that separates polished products from prototypes. The collapsed state represents the most intentional spacing (every pixel matters in 40px), so it should be the canonical reference.

**Root Cause:** Five independent spacing differences between collapsed and expanded states:
1. Container horizontal padding: `px-1.5` (6px) vs `px-3` (12px)
2. Tab height: `h-7` (28px) vs `h-8` (32px)
3. Section gap: `mt-4` (16px) vs `mt-5` (20px)
4. Section separator: divider with `mt-2 mb-2` (~17px) vs header with `h-7` (28px)
5. Tab horizontal padding: `w-7 justify-center` vs `pl-5 pr-2` (deep indent)

These differences compounded, causing tabs to visibly jump 15–20px when toggling.

**Resolution:**
- Unified container padding to `px-1.5` for both states
- Unified tab height to `h-7` for both states
- Unified section gap to `mt-4` for both states
- Created a fixed `h-5` (20px) separator wrapper that holds either a border-t (collapsed) or section label (expanded) — same box height in both states
- Expanded tab padding simplified to `gap-2 px-2` (flush with overview link)

**Pattern extracted → `design.md` §0: Design Posture, §1.4: Sidebar Internal Spacing (Collapsed-First), §4.1: Collapsible Sidebar**

**Anti-pattern extracted → `design-anti-patterns.md` AP-009: Inconsistent Spacing Between Toggle States**

---

#### FB-014: "Way too much spacing above Overview tab. Section gaps too much. Collapsed divider not centered."

**UX Intent:** Every pixel of vertical space in a sidebar competes with content. Excessive top padding wastes the most premium screen position. Section gaps that are too generous make a short list of nav items feel spread thin. And a divider that isn't visually centered between two sections reads as a misaligned element rather than a separator.

**Root Cause:** Three additive spacing sources:
1. `py-4` (16px) top padding on scrollable area — too much above the first tab
2. `mt-4` (16px) on NavSection + `h-5` (20px) separator = 36px total section gap — excessive
3. The divider sat after the `mt-4` margin, placing it 16px from the previous section's last tab but 20px from the next section's first tab — not centered

**Resolution:**
- Reduced top padding: `py-4` → `pt-2 pb-4` (8px top, 16px bottom)
- Eliminated separate margin: removed `mt-4` from NavSection
- Made separator the entire gap: `h-6` (24px) with `items-center` — the `border-t` sits at exactly 12px from each adjacent tab (centered)
- Total section gap: 36px → 24px (33% reduction)

**Pattern extracted → `design.md` §1.4: updated separator values and centering rule**

---

#### FB-015: "Way too much spacing between content and sidebar/top nav. Corner radius too much."

**UX Intent:** As a B2B-focused designer, density and precision matter. Large content gutters feel like a consumer marketing page, not a professional tool. Similarly, large corner radii (6–8px) signal "friendly consumer app" — incongruent with B2B utility. The designer wants the product to feel like a staff-level tool: sharp, dense, intentional.

**Root Cause:**
1. Content padding: `px-8 py-8 lg:px-10 lg:py-10` (32–40px) was inherited from earlier "generous spacing" guidance that assumed consumer-grade breathing room
2. Header padding: `px-8 lg:px-10` matched the same over-generous scale
3. Corner radius: `rounded-md` (6px) and `rounded-lg` (8px) used throughout all components and pages — consumer-grade values

**Resolution:**
1. Shell content padding: `px-8 py-8 lg:px-10 lg:py-10` → `px-4 py-4 lg:px-5 lg:py-5` (16–20px)
2. Shell header padding: `px-8 lg:px-10` → `px-4 lg:px-5` (16–20px)
3. Corner radius audit across entire playground (15 files):
   - All `rounded-lg` (8px) → `rounded-sm` (2px)
   - All `rounded-md` (6px) → `rounded-sm` (2px)
   - All `rounded` (4px) → `rounded-sm` (2px)
   - `rounded-full` kept only for progress bars (structural shape)
4. Updated §0 (Design Posture) with explicit B2B density mandate
5. Updated §1.1 — superseded "32px minimum" with B2B-appropriate "16–20px"
6. Added §8 (Corner Radius) with full scale, rules, and rationale

**Pattern extracted → `design.md` §0, §1.1, §8**

**Anti-pattern extracted → `design-anti-patterns.md` AP-010: Consumer-Grade Corner Radius in B2B, AP-007 updated**

---

## Session: 2026-03-28 — Playground Design System Overhaul

**Chat:** [Playground DS iteration](413b7815-7c79-4fcb-99b4-6005240d77a3)
**Scope:** `playground/` — Design System documentation site (Next.js + Tailwind v4)
**Duration:** ~18 feedback exchanges

### Feedback → Intent → Resolution

---

#### FB-001: "The responsiveness is so shitty. Look at all the things being truncated."

**UX Intent:** A layout that clips content signals a lack of care. If the design system's own documentation can't display properly, it undermines trust in the system itself.

**Root Cause:** Fixed sidebar width (`w-60` / 240px) + rigid `max-w-4xl` content constraint. No responsive breakpoints.

**Resolution:** Changed content wrappers from `max-w-4xl` to `max-w-5xl`. Added `overflow-x-auto` to tables/grids. Made sidebar responsive (hidden on mobile, overlay on tap).

**Pattern extracted → `design.md` §6: Responsive Design**

---

#### FB-002: "The navigation bar is blocking all the views."

**UX Intent:** Content is the primary artifact. Navigation is a tool to reach content — it should never compete with or obstruct it.

**Root Cause:** `position: fixed` sidebar removed from document flow. No space reservation in the content area.

**Resolution (attempt 1):** Added `lg:pl-60` to content wrapper. Failed — Tailwind couldn't generate classes from dynamic string values.

**Resolution (attempt 2 — final):** Flex layout with in-flow spacer `div` that dynamically matches sidebar width. Content uses `flex-1 min-w-0`.

**Pattern extracted → `design.md` §2: Layout Integrity**

---

#### FB-003: "I want the navigation bar to be collapsible to icon-only."

**UX Intent:** The user should control how much screen real estate the nav consumes. A designer working in a design system doc will toggle between reference (sidebar open) and focused reading (sidebar collapsed).

**Resolution:** Added `SidebarContext` with `collapsed` state. Expanded = 200px with labels. Collapsed = 40px with square icon buttons. Toggle is a `PanelLeftClose`/`PanelLeftOpen` button in the sidebar header.

**Pattern extracted → `design.md` §4.1: Collapsible Sidebar**

---

#### FB-004: "The spacing in the navigation bar sucks."

**UX Intent:** Tight spacing communicates cheapness. A design system must embody the spatial rhythm it documents. If the nav has cramped padding, the system contradicts itself.

**Resolution:** Applied IBM Carbon spacing scale. Nav links: `h-8`, `pl-5 pr-2`. Section gaps: `mt-5`. Header: `px-4 h-12`. Container: `px-3 py-4`.

**Pattern extracted → `design.md` §1.2–1.4: Carbon Spacing Scale, Sidebar Internal Spacing**

---

#### FB-005: "The collapsed icons are not centered. Equal distance left and right."

**UX Intent:** Asymmetric spacing in a compact UI looks broken. In icon-only mode, the eye expects perfect centering — any pixel offset is immediately noticeable.

**Root Cause (attempt 1):** Used `w-10 mx-auto` — fragile because container padding consumed width before `margin: auto` could distribute.

**Root Cause (attempt 2 — final):** Removed fixed width from link, used `justify-center` on full-width flex item. Icon centers naturally regardless of container padding.

**Pattern extracted → `design.md` §4.2: Collapsed State — Symmetry & Centering**

---

#### FB-006: "There's no padding between the content and the sidebar border."

**UX Intent:** Content starting at the exact pixel where the sidebar ends feels like a rendering bug. The boundary between navigation and content needs a visible gutter.

**Resolution:** Set main content to `px-8 py-8 lg:px-10 lg:py-10` (32–40px). Header to `px-8 lg:px-10`.

**Note:** These classes were correct but weren't rendering — see FB-009 for the root cause.

**Pattern extracted → `design.md` §1.1: Minimum Spacing Guarantees**

---

#### FB-007: "Dark mode — why is there a white background? Why isn't the nav changing?"

**UX Intent:** A broken dark mode signals that theming was an afterthought. If the system can't reliably switch themes, designers won't trust it for production work.

**Root Cause:** `@theme inline` in Tailwind v4 hardcodes literal values into utility classes at build time. `.dark` CSS variable overrides are ignored because the utilities don't reference variables.

**Resolution:** Changed `@theme inline` to `@theme`. Now utilities emit `var(--color-*)` references. `.dark` overrides work.

**Pattern extracted → `design.md` §3.2: @theme vs @theme inline, §5: Theming**

---

#### FB-008: "Section headers (TOKENS, COMPONENTS) are too big, too dark. Hard to distinguish from tabs."

**UX Intent:** In a nav sidebar, section headers are organizational labels — they should recede visually so the interactive links stand out. Typography must create clear hierarchy even at small scales.

**Resolution:** Section headers: `text-[9px]`, `font-medium`, `tracking-[0.12em]`, `uppercase`, `text-sidebar-muted-foreground/50`. Nav links indented `pl-5` under them.

**Pattern extracted → `design.md` §4.3: Visual Hierarchy in Expanded Sidebar**

---

#### FB-009: "There's no spacing! Where's all the margin and padding?!" (×3 messages)

**UX Intent:** When the same problem is reported 3 times with escalating frustration, the fix was never reaching the user. The issue wasn't insufficient values — it was an architectural defect silently nullifying all values.

**Root Cause:** `* { margin: 0; padding: 0; }` was **unlayered CSS**. Tailwind v4 puts utilities in `@layer utilities`. CSS cascade: unlayered always beats layered. Every `p-*`, `m-*`, `gap-*` utility was being overridden to zero.

**Resolution:** Wrapped the reset in `@layer base`. Base layer < utilities layer in the cascade, so resets provide defaults but utilities correctly override.

**This was the most critical bug.** It caused 3 rounds of user frustration because the correct classes were present but invisible.

**Pattern extracted → `design.md` §3.1: Layer Cascade — The #1 Architectural Rule**

---

#### FB-010: "Never use inline; always use token."

**UX Intent:** Inline styles bypass the design token system. They can't be themed, can't be audited, can't respond to breakpoints. A design system that uses inline styles is not a system — it's ad-hoc styling with extra steps.

**Resolution:** Replaced all `style={{ width }}` in sidebar with Tailwind arbitrary value classes (`w-[200px]`, `w-[40px]`). Stored as constants.

**Pattern extracted → `design.md` §3.3: Token-First, Never Inline**

---

#### FB-011: "Collapsed sidebar too wide. Square proportion, 4-8px padding."

**UX Intent:** A collapsed sidebar should be minimal. It exists to provide icon shortcuts, not to consume 56px of screen width for a 14px icon.

**Resolution:** Collapsed width: 40px. Icon buttons: `w-7 h-7` (28px). Container: `px-1.5` (6px each side). 6 + 28 + 6 = 40px.

**Pattern extracted → `design.md` §4.2: Collapsed State — Symmetry & Centering**

---

#### FB-012: "Section divider cut off in the middle."

**UX Intent:** A divider that doesn't span its container looks like a rendering artifact. Dividers exist to separate — they must visually reach both edges.

**Resolution:** Removed `w-4 mx-auto` from collapsed divider. Now it's a plain `border-t` that stretches to fill the sidebar width.

**Pattern extracted → `design.md` §4.2 (divider sub-point)**

---

### Session Meta-Analysis

**Recurring theme:** 8 of 18 messages were about spacing. The root cause wasn't inadequate spacing values — it was a CSS cascade architecture bug (`@layer base` missing). This confirms `design.md` §7.1: "Diagnose before you patch."

**Escalation pattern:** User frustration escalated from constructive ("add padding") to profanity ("what the fuck") when the same category of problem persisted across multiple exchanges. This signals that the AI was treating symptoms (adding more padding classes) instead of diagnosing the root cause (unlayered reset overriding everything).

**Key learning:** When Tailwind classes appear correct but produce no visual effect, check the CSS cascade layers first. The problem is almost never "not enough padding" — it's "something is overriding the padding."

---

#### FB-020: "Reshape color token structure referencing One GS design system"

**UX Intent:** The flat semantic token naming (`text-primary`, `surface-inverse`, `border-subtle`) was ad-hoc — each category used different naming conventions with no predictable pattern. A staff UX designer should be able to look at any token name and immediately know what element it applies to, what its semantic role is, and how prominent it is.

**Root Cause:** The original naming was inherited from Carbon's flat token model, which works for Carbon because it has a massive docs site explaining each token. For a smaller design system, the naming itself needs to be self-documenting.

**Resolution:** Adopted a structured three-part naming formula inspired by Goldman Sachs One GS: `$portfolio-{property}-{role}-{emphasis}`. Added `icon` and `action` as new properties. Introduced emphasis ladder (bold/regular/subtle/minimal) to replace ad-hoc names (primary/secondary/helper/placeholder). All old names preserved as legacy aliases. Updated sync-tokens.mjs, playground display, and design.md §9.

**Pattern extracted → `design.md` §9.5: Token Architecture: Property · Role · Emphasis**

---

#### FB-021: "Map accent/brand color to match Lumen from IBM Carbon project"

**UX Intent:** The brand accent scale should be a single, intentionally designed ramp shared across projects. The Cadence project's "Lumen" scale was designed with perceptual uniformity (no hue jump at step 50) and serves as the canonical brand blue-violet.

**Root Cause:** The original accent was an ad-hoc ramp with a visible hue discontinuity between steps 40 and 50 (desaturated blue-gray → warm indigo). The Lumen scale was designed later with corrected interpolation.

**Resolution:** Replaced all 10 accent steps with the Lumen scale values (key: #3336FF at step 60). Updated playground theme variables (#6B5CE7 → #7182FD, #8C8CFF → #8DA3FC, #f0f0ff → #F0F5FD). Ran sync-tokens. Resolves the §9.10 open issue "Accent scale perceptual jump at step 50."

**Pattern extracted → `design.md` §9.3: Brand Accent: Lumen Blue-Violet**

---

#### FB-022: "Check accessibility — accent color for text is too light"

**UX Intent:** Meaningful text in the playground (prop types, token values, active navigation labels) must be readable by all users. Using a decorative/light accent step for text fails users with low vision.

**Root Cause:** `--color-accent` was set to accent-50 (#7182FD) which achieves only 3.33:1 contrast on white — below the 4.5:1 WCAG AA requirement for normal text. This was an aesthetic choice that prioritized a softer accent tone over accessibility.

**Resolution:** Changed light-mode `--color-accent` and `--color-ring` from accent-50 (#7182FD) to accent-60 (#3336FF), which achieves 6.75:1 on white. Dark mode accent-40 (#8DA3FC) at 7.56:1 on #161616 was already compliant — no change needed. Added §9.8 "Accent Color Accessibility Policy" to design.md codifying the rule: any accent step used as foreground text must achieve 4.5:1 against its background.

**Pattern extracted → `design.md` §9.8: Accent Color Accessibility Policy**

---

#### FB-044: "Mobile experience squeezes everything, unnecessary tabs, follow Joseph's denser layout"

**UX Intent:** The homepage sidebar stacked vertically on mobile with 32px gaps between each section, pushing the project grid far below the fold. Teams and Links sat in separate blocks instead of side-by-side, wasting vertical space. Navigation was inconsistent — the homepage had no way to reach About or Experiments, while case study pages had a nav bar that included Reading and Contact (pages the user agreed were unnecessary). The user wanted Joseph Zhang's compact, information-dense pattern.

**Root Cause:** (1) Sidebar sections used a uniform `spacing-07` (32px) gap on all breakpoints, with no mobile-specific tightening. (2) Teams and Links rendered as stacked sections instead of a 2-column grid. (3) The Navigation component included 4 links (About, Reading, Experiments, Contact) but the homepage had no Navigation at all — it relied on a Links section that only contained Reading + social media. This created orphaned pages (About, Experiments) unreachable from the homepage.

**Resolution:**
- Added `.teamsAndLinks` 2-column grid wrapper — Teams and Links now sit side-by-side at all breakpoints.
- Reduced `.sidebarInner` gap from `spacing-07` to `spacing-05` on mobile (desktop unchanged).
- Reduced `.layout` padding from `spacing-06/05` to `spacing-05/04` on mobile.
- Tightened `.identity` gap from `spacing-02` to `spacing-01` on mobile.
- Reduced `.sectionLabel` margin from `spacing-04` to `spacing-03` on mobile.
- Trimmed Navigation component from 4 links to 2: About + Experiments (removed Reading, Contact).
- Updated homepage sidebar Links from [Reading, LinkedIn, Instagram, Twitter] to [About, Experiments, LinkedIn, Instagram, Twitter] — now serves as navigation to interior pages.
- Updated Experiments and Contact page custom navs to match trimmed link set.
- Updated seed data and fallback constants to reflect new link structure.

**Pattern extracted → `design.md` §16: Homepage Information Architecture**

---

#### FB-045: "Area for mouse maneuvering is too narrow, causes very bad experience"

**UX Intent:** When navigating from a sidebar category to a hover-to-reveal sliver panel, the diagonal mouse path crosses adjacent category buttons. Each crossing switches the sliver to a different category, making it impossible to reach the intended submenu item. This is the classic "whack-a-mole" menu problem that Amazon solved with path prediction in their mega-dropdown menus.

**Root Cause:** The `handleCategoryHover` function immediately called `setOpenCategory(catId)` on every `onMouseEnter`, with no awareness of cursor trajectory. A user moving diagonally toward an open sliver would trigger 2–4 unwanted category switches in rapid succession.

**Resolution:**
- Created `useSafeTriangle` hook at `playground/src/hooks/use-safe-triangle.ts` implementing Amazon's slope-based path prediction algorithm.
- The hook tracks the last 4 mouse positions via a document-level `mousemove` listener.
- When a category switch would occur while a sliver is already open, the hook computes slopes from the current and previous cursor positions to the far corners of the sliver.
- If the slopes are diverging (cursor heading toward sliver), the switch is deferred by 100ms and re-checked.
- If the cursor is not heading toward the sliver, the switch fires immediately — no perceptible delay for intentional navigation.
- Converted `CategorySliver` to `forwardRef` to enable bounding rect calculation.
- Added `cancelPending` calls on pathname change, sidebar collapse, and escape key.

**Pattern extracted → `design.md` §4.7: Safe Triangle (Submenu Aim)** | `design-anti-patterns.md` AP-022

---

#### FB-046: "Case study navigation is confusing — top nav doesn't exist, inconsistency with homepage"

**UX Intent:** The case study detail pages used a top navigation bar (`Navigation` component) that doesn't match the homepage's sidebar-based navigation model. The homepage uses a split-view layout (left sidebar with identity/metadata, right content area), but case study pages used a traditional full-width layout with a hero splash image. This created a jarring navigation inconsistency when moving between the homepage and a case study — the user's navigation mental model broke on every transition. The user wanted the case study pages to mirror the homepage's split-view structure, with metadata on the left and content on the right, and the only navigation being a "back" link and prev/next case study at the bottom.

**Root Cause:** The case study layout was designed independently of the homepage, using a different layout paradigm (full-width hero + centered container) instead of adopting the established split-view pattern. The `Navigation` component was included but served no useful purpose since the homepage doesn't use it either — it was architectural debt from an earlier design iteration.

**Resolution:**
- Removed `Navigation`, `ScrollSpy`, and `Footer` from `ProjectClient.tsx` — these were borrowed from a traditional page template and didn't fit the case study context.
- Restructured `ProjectClient.tsx` into a two-column split-view layout matching the homepage's proportions: 300px sticky left sidebar + flex-1 right content area.
- Left sidebar contains: "All Projects" back link (with arrow icon), project title + category, hero metric (if present), and all metadata (role, collaborators, duration, tools, external links).
- Right content area contains: project description, content sections with images, and a new prev/next case study navigation at the bottom.
- Updated `page.tsx` to fetch adjacent projects (prev/next) from the CMS using the `order` field, via two parallel Payload queries with `less_than` and `greater_than` filters.
- Rewrote `page.module.scss` to use the same layout tokens as the homepage (`$portfolio-container-lg`, `$portfolio-mq-lg` breakpoint for row direction, `$portfolio-spacing-07` gap).
- Meta labels now use uppercase small-caps style (matching the homepage's section labels) for visual consistency.
- Removed the full-width hero splash image — content sections still contain images within the scrollable right column.

**Pattern extracted → `design.md` §16: Homepage Information Architecture** (extends to case study pages — shared split-view layout paradigm)

---

#### FB-047: "Missing hero design screen — case studies should begin with strong visuals"

**UX Intent:** Case studies must lead with outcome visuals, not text. This is a time-to-value practice: the visitor's first impression should be the finished product, not a description of it. A portfolio case study that begins with text requires the visitor to read before they understand what was built. A case study that begins with a hero screenshot lets the visitor evaluate the quality of the work in under 2 seconds — before any text is read. The ScrollSpy was also still needed for section navigation in the right content column.

**Root Cause:** The previous iteration removed the hero image along with the full-width splash when converting to the split-view layout. The intent was to remove the splash, but the baby went with the bathwater — the outcome visual was lost entirely. ScrollSpy was also removed despite still being needed for navigating long content.

**Resolution:**
- Added a hero image placeholder at the top of the right content column, before the description. Uses 16:9 aspect ratio — a standard product screenshot ratio that shows enough of the interface for immediate quality assessment.
- Re-added `ScrollSpy` import and rendering in `ProjectClient.tsx`, with section data derived from the same `slugify(heading)` IDs used on content sections.
- The hero is the very first thing visible in the right column, establishing time-to-value: the visitor sees the end result before reading any context.

**Cross-category note:** Also documented as CFB-010 (content) — the "lead with outcome visuals" principle applies to content strategy as much as visual design.

**Pattern extracted → `content.md` §3.2: Recommended Anatomy** (reinforces hero-first structure) | `design.md` new principle: Time-to-Value Hero

---

#### FB-048: "ScrollSpy overlaps content, notch labels misaligned, content needs centering"

**UX Intent:** Three interrelated layout issues on the case study split-view: (1) The ScrollSpy notch ticks rendered on top of content because the right content column had no clearance margin for the viewport-fixed ScrollSpy rail. At `lg` (1056px), the content edge and the notch ticks overlapped by 12px. (2) The right content column had no max-width, so on wide screens it stretched to 900px+, creating an uncomfortably wide text block and pushing content toward the ScrollSpy zone. (3) The ScrollSpy label text was visually misaligned with its corresponding tick mark because the `.notch` container was only ~2px tall (the tick's height), making `top: 50%` resolve to ~1px — a sub-pixel reference that caused rounding errors.

**Root Cause:** (1) The `.layout` used symmetric padding (32px both sides) at `lg`, leaving only 32px between content edge and viewport edge — less than the 44px the ScrollSpy occupies. (2) `.content` was `flex: 1` with no max-width. (3) `.notch` had no explicit height; its computed height was determined solely by the 2px-tall `.tick` button, making `top: 50%` unreliable for centering the absolutely-positioned label.

**Resolution:**
- **Layout padding:** Added asymmetric right padding at `lg`+ — `padding-right: 64px` (spacing-10) instead of 32px. This guarantees a 20px clear buffer between content and the ScrollSpy notch zone at the `lg` breakpoint.
- **Content max-width:** Added `max-width: 720px` to `.content`. At `lg` (628px available), the max-width doesn't constrain. At `xl`+ (884px available), it caps the column and creates ~140px of right-side breathing room. Added `margin-left: 24px` at `xl`+ for left-biased centering — content stays close to the sidebar while extra space flows right.
- **Notch alignment:** Set `.notch` to `height: 16px`, giving `top: 50%` a reliable 8px midpoint. Added `line-height: 1` to `.label` to eliminate descender-caused visual offset. The tick centers within the 16px notch via `align-items: center`.

**Pattern extracted → `design.md` §13: Content Navigation Policy** (ScrollSpy must have guaranteed viewport clearance; content columns must account for fixed overlay elements)

---

#### FB-050: "ScrollSpy navigation should bring to page location with breathing room"

**UX Intent:** Scroll-to navigation should preserve spatial context. When a user clicks a ScrollSpy notch, the target section should not slam against the top edge of the viewport. A small offset provides a "landing zone" — the user sees a sliver of the previous section's content (or its divider), maintaining their mental map of where they are on the page. Without it, the jump feels like teleportation: the user arrives at a heading with zero visual context of what came before. This is the scroll navigation equivalent of showing approach context in wayfinding — you don't teleport to a room, you walk through a doorway.

**Root Cause:** The main site case study sections (`.contentSection`) and about page sections (`.section`) had zero `scroll-margin-top`. `scrollIntoView({ block: "start" })` scrolled the section heading flush to the viewport's top pixel. The playground sections had `scroll-mt-16` (64px) which only cleared the sticky header with no additional breathing room.

**Resolution:**
- **Main site case study:** Added `scroll-margin-top: $portfolio-layout-04` (48px) to `.contentSection` in `page.module.scss`. This shows the section divider and a sliver of the preceding section when navigating.
- **Main site about page:** Added `scroll-margin-top: $portfolio-layout-04` (48px) to `.section` in `page.module.scss`.
- **Playground token pages:** Increased from `scroll-mt-16` to `scroll-mt-24` (96px = 64px header + 32px breathing room) on all section containers in `token-grid.tsx` and `tokens/colors/page.tsx`.

**Pattern extracted → `design.md` §13.3: Scroll Offset — Context-Preserving Navigation** (rewritten from "Sticky Headers" to broader principle)

---

#### FB-049: "For the ScrollSpy component, active notch color should match label"

**UX Intent:** Visual state consistency — when an interactive control has two visual channels (a tick bar and a text label), both channels must reflect the same state. An active notch with a bold dark bar but a medium-gray label creates a disconnect: the bar says "you are here" but the label says "I'm the same as everything else." The user reads the label color as a hierarchy signal. When all labels look identical regardless of which notch is active, the component fails to communicate state through its text layer. This is a gestalt principle: paired visual elements must share visual properties to be perceived as a unit.

**Root Cause:** The `.label` class used a static `color: $portfolio-text-secondary` (neutral-70) regardless of the notch's active/inactive state. Meanwhile, the `.tick` had three distinct states: active (`$portfolio-text-primary`, neutral-100), hovered-inactive (`$portfolio-text-placeholder`, neutral-40), and default-inactive (`$portfolio-border-subtle`, neutral-20). The label color sat between the active and inactive tick colors, matching neither. No `font-weight` differentiation existed either — all labels rendered at the default 400 weight.

**Resolution:**
- **Propagated state to container:** Added `data-active` attribute to the `.notch` div in `ScrollSpy.tsx`, enabling CSS descendant selectors.
- **Active label pairing:** `.notch[data-active] .label` now uses `color: $portfolio-text-primary` (same as active tick) + `font-weight: 500` (medium, slightly bolder than the 400 default).
- **Inactive label pairing:** Default `.label` color changed from `$portfolio-text-secondary` to `$portfolio-text-placeholder` (neutral-40), matching the hovered-inactive tick color. Labels only appear on hover/drag, so they always coexist with the hovered tick state.
- **Transition:** Added `color` transition to `.label` for smooth state changes during drag.
- **Playground parity:** Updated `playground/src/components/scroll-spy.tsx` with equivalent Tailwind classes: active `text-foreground font-medium`, inactive `text-muted-foreground/60`.

**Pattern extracted → `design.md` §10: Interactive Control Design** (new §10.6: Paired Visual Channels Must Share State)

---

#### FB-050: "Admin bar blocks navigation, bad practice to overlay page content"

**UX Intent:** Fixed-position toolbars that overlay page content violate the principle of non-destructive augmentation. An admin bar exists to help the admin interact with the page — if it covers navigation buttons or other interactive elements, it directly undermines the task it's supposed to support. The admin bar should be additive (pushing content down to make room for itself) not subtractive (hiding content behind itself). This is the same principle as AP-004 (fixed sidebar with padding offset), extended to top/bottom bars.

**Root Cause:** `AdminBar` used `position: fixed; top: 0` with `z-index: 9999`. `InlineEditBar` used `position: fixed; bottom: 0` with `z-index: 10001`. Both were out of document flow, requiring every page to manually compensate with `paddingTop: 44` — a fragile pattern that also violated AP-003 (inline styles as workarounds).

**Resolution:** Changed both bars from `position: fixed` to `position: sticky` at their respective edges (`top: 0` and `bottom: 0`). Sticky positioning keeps elements in the document flow — the admin bar naturally pushes content down by its height, and the edit bar naturally occupies space at the bottom. No manual padding offsets needed. Removed all `paddingTop: 44` inline styles and the `data-admin` SCSS rule from 6 client pages.

**Cross-category note:** Also documented as ENG-021 (engineering) — inline style hacks and fragile coupling between overlay and page padding.

**Pattern extracted → `design-anti-patterns.md`: AP-033 — Fixed toolbars that overlay page content instead of using sticky in-flow positioning.**

---

#### FB-051: ASCII Art Tool — Design System Expansion (7 new components)

**UX Intent:** The ASCII tool required UI primitives that didn't exist in the Élan design system: ColorPicker, Slider, ScrubInput, Dropzone, ProgressBar, SegmentedControl, CodeBlock. Rather than building one-off custom components, each was built as a proper DS component with SCSS source in `src/components/ui/`, a Tailwind playground demo page, and sidebar entry. Nine existing components (Textarea, Select, Checkbox, Toggle, Toast, Tooltip, DropdownMenu, Avatar, Divider) also lacked playground pages — those were created simultaneously.

**Root Cause:** Design system coverage gap — the original DS focused on Tier 1-3 primitives for the portfolio site. The ASCII tool is the first consumer that exercises form-heavy interaction patterns (scrub, drag, color picking), feedback patterns (progress), and data display patterns (code blocks).

**Resolution:** 7 new SCSS-based components in `src/components/ui/`, 7 corresponding playground pages, 9 missing playground pages for existing components, all sidebar entries added. Barrel exports updated in `src/components/ui/index.ts`. The ASCII tool carries Tailwind copies in `ascii-tool/src/components/ui/` following the playground sharing pattern.

**Cross-category note:** Also documented as ENG-016 (engineering) — app scaffold and infrastructure.

**Pattern extracted → `design.md` §1.6: When a new consumer exposes DS coverage gaps, build proper DS components first (SCSS source + playground page + sidebar entry), then consume them. Never build one-off components inside a consumer.**

---

#### FB-052: Masonry grid — thumbnails cropped, tiles all same height, testimonial ordering

**UX Intent:** Portfolio masonry grid should reflect the designer's identity through intentional ordering (product work first, illustration work last) and respect each project's thumbnail proportions rather than forcing uniform aspect ratios. Mohammed A.'s testimonial — from a high-credibility source (Apple Siri founding team) — should be immediately visible at position "first row, third column."

**Root Cause:** Three compounding issues: (1) `.projectHero` forced `aspect-ratio: 3/2` (and `4/3` for featured), combined with `object-fit: cover` on `.projectCoverImg`, which cropped images to uniform heights. (2) CSS `column-count` fills items top-to-bottom per column, making "row N, column M" positioning unintuitive — the user expected left-to-right row ordering. (3) The `interleaveGrid` function distributed testimonials at regular intervals without regard to which testimonial landed where, and CMS `order` fields hadn't been optimized for visual hierarchy.

**Resolution:** (1) Removed fixed `aspect-ratio` from `.projectHero` and `.projectCardFeatured`; moved `aspect-ratio: 3/2` to `.projectImage` (gradient placeholder only). Changed `.projectCoverImg` to `width: 100%; height: auto; display: block`. (2) Replaced CSS `column-count` masonry with JS round-robin column distribution — items are distributed `index % columnCount` into flex columns within a CSS Grid shell, giving left-to-right row ordering. Responsive column count via `useState` + `useEffect`. (3) Changed `interleaveGrid` to place the first testimonial at index 2 (3rd position → column 3, row 1 in 3-column layout). (4) Reordered CMS data: Mohammed A. testimonial to order 1, Published Illustrations from order 3 to 12 (unfeatured).

**Cross-category note:** Also documented as ENG-018 (engineering) — layout architecture change from CSS column-count to JS-distributed masonry.

**Pattern extracted → `design.md` §1: For masonry grids that need intuitive ordering, use JS round-robin column distribution rather than CSS column-count. CSS columns fill top-to-bottom, making "row, column" positioning impossible to reason about.**

---

#### FB-053: Drag-and-drop tile reordering for homepage masonry grid (admin)

**UX Intent:** The portfolio owner needs direct manipulation to curate homepage tile order — drag-and-drop is the expected interaction pattern for spatial reordering. The algorithmic interleave didn't allow fine-grained placement control.

**Root Cause:** No visual reordering affordance existed. Tile ordering was determined by CMS `order` fields plus the `interleaveGrid` algorithm, requiring manual API PATCH calls to change positions.

**Resolution:** Added a "Reorder tiles" mode in admin view. Clicking the button switches from masonry to a flat CSS grid with drag handles (6-dot grip icon). Uses `@dnd-kit` with `rectSortingStrategy` for grid-aware sorting. Drag overlay shows a slightly transparent card clone. Save/cancel bar pins to the top with clear actions. The reorder bar uses subdued `surface-secondary` background to differentiate from normal content. Drag handle appears `top-left` with `grab/grabbing` cursors and `opacity: 0.6 → 1` on hover.

**Cross-category note:** Also documented as ENG-019 (engineering) — gridOrder JSON field architecture.

**Pattern extracted → `design.md` §1: For grid reordering, use a flat CSS grid during reorder mode rather than trying to implement DnD within masonry columns. The flat grid makes visual ordering unambiguous (left-to-right, top-to-bottom) and avoids the complexity of cross-container drag-and-drop.**

---

#### FB-054: "I cannot drag things still" — drag handle affordance failure

**UX Intent:** The user expected to grab any part of a tile and drag it. A 28×28px grip icon in the corner is not a sufficient drag affordance — especially when the rest of the tile looks and behaves like a clickable link. The mismatch between "this looks draggable" (dashed outline on hover) and "only this tiny corner is actually draggable" violates the principle of least surprise.

**Root Cause:** Two compounding failures: (1) Engineering — DnD listeners on a child element competed with a parent `<Link>` for pointer events. (2) Design — the drag target area (handle only) was far smaller than the perceived drag target (the whole tile). The dashed outline suggested the entire tile was interactive, but only a 28×28px button actually responded to drag.

**Resolution:** Made the entire tile the drag target. The handle icon remains as a visual hint (communicates "this is draggable") but is no longer the only interactive area. Added `cursor: grab` / `cursor: grabbing` on the whole tile, `pointer-events: none` on inner content to prevent link interference, and always-visible dashed outlines in reorder mode.

**Cross-category note:** Also documented as ENG-020 (engineering) — pointer event conflict between DnD listeners and `<Link>`.

**Pattern extracted → `design.md` §1: For drag-and-drop in grids, the drag target must be the entire tile, not a small handle icon. The handle serves as a visual indicator ("this is draggable") but the hit area for initiating drag must cover the full tile surface. When tiles contain clickable content (links, buttons), disable those interactions during reorder mode rather than trying to layer a drag handle on top of them.**

---

#### FB-055: Spacing token migration from numeric-indexed to multiplier-based naming (One GS reference)

**UX Intent:** The spacing token system's naming convention directly impacts how AI agents (the primary consumers of token names) select and verify tokens during implementation. Opaque numeric indices (`spacing-06` = 24px) require memorization or lookup tables; multiplier-based names (`spacer-3x` = 3 x 8 = 24px) are self-documenting. A three-tier architecture (primitive / layout-semantic / utility) enables agents to reason about intent at the layout tier ("is this section standard or spacious?") and verify values at the primitive/utility tier through arithmetic.

**Root Cause:** The original token naming followed IBM Carbon's indexed convention (`spacing-01` through `spacing-13`), which is well-structured but optimized for human designers using a Figma token panel, not for AI agents reading SCSS source code. The scale also had gaps (no 20px, 56px, 72px values) that forced magic numbers. Layout tokens (`layout-01..07`) carried no semantic density information.

**Resolution:** Full migration to One GS multiplier-based naming:
- **Primitives:** `$portfolio-spacer-Nx` (base unit 8px, from `spacer-0-125x` to `spacer-20x`)
- **Layout semantics:** `$portfolio-spacer-layout-{x-compact|compact|standard|spacious|x-spacious|xx-spacious|xxx-spacious|xxxx-spacious}` with Functional density defaults
- **Utility:** `$portfolio-spacer-utility-Nx` for component-level spacing (buttons, inputs)
- Legacy aliases preserved for backward compatibility

Agent readability analysis determined: (1) Multiplier names win for primitives and utility (value derivable from name), (2) Semantic names win for layout (intent derivable from name), (3) Indexed names lose on both axes. Reference: One GS Figma file `HGHBk3MfZ5zK5g3EobImPM` node `1:66394`.

**Cross-category note:** Also documented as ENG-060 (engineering) — token file restructure, SCSS map architecture, sync pipeline.

**Pattern extracted → `design.md` §1.2: Spacing tokens must use a three-tier architecture (primitive / layout-semantic / utility) with multiplier-based naming for primitives and utility, and descriptive density names for layout. The naming convention is optimized for AI agent comprehension — an agent must be able to derive the pixel value from a primitive token name via arithmetic, and infer layout intent from a layout token name without consulting a lookup table.**

---

## Entry Template

```markdown
#### FB-056: "Doing all this on the button — map to spacing tokens"

**UX Intent:** Every component dimension must trace back to the design system's token grid. Hardcoded pixel values that sit between tokens create "token drift" — the design system says one thing, the component says another. Inspecting the button in DevTools should show `var(--spacer-utility-2x)`, not `16px`, so the relationship to the 8px base unit is immediately visible.

**Root Cause:** Button dimensions were adjusted for visual feedback (shrinking heights/padding) without constraining to token stops. The spacing token system existed in SCSS but wasn't surfaced as CSS custom properties in the playground.

**Resolution:**
1. Exposed full Tier 1 primitive and Tier 3 utility spacer tokens as CSS custom properties in `playground/src/app/globals.css`.
2. Snapped all button dimensions to the nearest token value (heights back to primitive grid: 24/32/48/56; padding to utility grid).
3. Added two new utility tokens (`utility-1.75x`, `utility-2.25x`) for button icon sizes.
4. Replaced all hardcoded pixel classes with `var()` token references.
5. Updated SIZE_META annotations to show token names alongside pixel values.

**Cross-category note:** Also documented as ENG-061 (engineering) — token system integration and sync pipeline.

**Pattern extracted → Component spacing must be token-referenced, not pixel-hardcoded. When a design adjustment lands between token stops, either snap to the nearest token or propose a new Tier 3 utility token — never leave an orphan pixel value. The `var()` reference is the proof of compliance; any spacing class using `[Npx]` instead of `[var(--spacer-*)]` is a token alignment violation.**

---

#### FB-057: "Color swatches — interactive inconsistency, circular shapes, inconsistent sizing"

**UX Intent:** Every swatch in the color token page should behave identically — hover reveals a copy affordance, click copies the value. Swatches should be uniform square shapes across all sections (semantic tokens, interaction states, palette reference) so the page reads as a single cohesive system, not a patchwork of different components.

**Root Cause:** The semantic token sections (Surface, Text, Icon, Border, Action) used a separate `EmphasisSwatch` component — a plain `<div>` with no interactivity. Only the Palette Reference and Interaction sections used `ColorSwatch` (which has hover overlay + click-to-copy). Additionally, all swatches used `h-14` (fixed 56px height) while width varied by grid column count, creating inconsistent aspect ratios: wide rectangles in 2-col grids, near-squares in 10-col grids.

**Resolution:**
1. Removed `EmphasisSwatch` entirely — all sections now use the shared `ColorSwatch` component with hover/copy interaction.
2. Changed `ColorSwatch` from `h-14` (fixed height) to `aspect-square` — swatches are now perfectly square regardless of grid width.
3. Added `w-full` to the `ColorSwatch` button to fill grid cells consistently.
4. Normalized gap values across all grid sections to a uniform `gap-2`.

**Pattern extracted → `design.md` §14: Playground token pages must use a single shared swatch component with uniform interaction behavior and consistent aspect ratios. Never create a second "display-only" variant of an interactive component — the inconsistency confuses users who discovered the copy feature in one section and expect it everywhere.**

---

#### FB-058: "B2B compact — color swatches are massive, inconsistent sizes across sections"

**UX Intent:** A B2B design system playground must respect the density posture (§0). Color swatches are reference documentation, not hero visuals — they should be compact enough that an entire palette scale fits on one row without dominating the viewport. Every swatch must be identical in size regardless of which section it appears in; size inconsistency signals a broken system.

**Root Cause:** FB-057's fix used `aspect-square` + `w-full` on swatches inside CSS Grid containers. Since each section had different column counts (6-col semantic = ~145px squares, 10-col palette = ~95px, 12-col neutral = ~78px), the swatch size was entirely grid-dependent. The fix traded one inconsistency (aspect ratio) for another (size), and all sizes were far too large for B2B density.

**Resolution:**
1. Decoupled swatch size from grid layout: `ColorSwatch` now has fixed `w-12 h-12` (48px × 48px) — a size consistent with B2B design system references (Carbon, Polaris).
2. Replaced all variable-column CSS Grids with `flex flex-wrap gap-1.5` — items flow at their intrinsic 48px width, wrapping naturally. No grid math determines size.
3. Reduced label text from `text-xs` / `text-[11px]` to `text-[10px]` / `text-[9px]` to match the compact swatch footprint.
4. Reduced copy icon sizes from `w-4`/`w-3.5` to `w-3.5`/`w-3` for proportion.

**Pattern extracted → `design.md` §14.1: Swatch size must be intrinsic (fixed `w-12 h-12`), never grid-derived. Use `flex flex-wrap` containers so item count and container width cannot influence swatch dimensions. This is the only way to guarantee cross-section size parity.**

---

#### FB-065: "Do a thorough DS compliance audit on the portfolio"

**UX Intent:** Ensure every surface of the portfolio site uses the design system's tokens, mixins, and components consistently — brand integrity, visual rhythm, and maintainability.

**Root Cause:** The DS was built incrementally. Older pages (contact, experiments) pre-date the token/mixin system. Admin components use a parallel Tailwind palette. Typography mixins exist but most pages duplicate raw properties. Container widths use arbitrary magic numbers instead of `$elan-container-*` tokens.

**Resolution (9 phases):**
1. Fixed brand color drift: replaced all `#6c63ff`/`#5a52e0` with `$portfolio-accent-60`/`-70` across 4 files.
2. Rewrote contact page SCSS to use DS tokens, typography mixins, semantic colors.
3. Fixed experiments page: replaced `#fff` with `$portfolio-text-always-light-bold`, serif headings with `heading-display-fluid`, hardcoded breakpoints with `$elan-bp-sm` expressions, tags with `$portfolio-type-xs`.
4. Adopted typography mixins (`@include body-sm`, `body-sm-medium`, `caption`, `code-sm`, `label`, `stat-sm`, `subtitle-1`, etc.) across homepage, about, reading, work/[slug] — replacing 50+ raw font declarations.
5. Created `$elan-container-content: 720px` token for prose content; replaced all `720px`, `960px`, `600px` widths with container tokens.
6. Documented Button adoption policy (§20) — when to use DS Button vs raw `<button>`.
7. Replaced hardcoded breakpoints, spacing values, box-shadows, border-radii, and transitions with DS tokens across all SCSS.
8. Fixed ThemeToggle: moved inline styles to SCSS module.
9. Documented admin palette split (§19), created `$portfolio-radius-xs: 2px` token, documented undocumented patterns (§21): gradient hero, masonry grid, dark surface alpha system, pill nav.

**Patterns extracted → `design.md` §19 (Admin UI Palette), §20 (Button Adoption), §21 (Undocumented Patterns/DS Gaps)**

---

#### FB-067: "Playground experiments not reflected in production — comprehensive parity alignment"

**UX Intent:** The design system must be consistent between the playground (documentation surface) and production (live surface). Drift between the two means the playground can't be trusted as documentation, and production doesn't benefit from design experiments.

**Root Cause:** Bidirectional sync was not documented or enforced. The Cross-App Parity Checklist was one-directional (production → playground). Three experiments — Button two-axis model, three-tier spacing tokens, semantic typography mixins — were conducted in the playground but never propagated back to production.

**Resolution:**
1. Production Button rebuilt with two-axis model (appearance × emphasis, 4 sizes, type=button default, bounding-box icon spacing).
2. 31 SCSS files migrated from legacy `spacing-NN` / `layout-NN` to new three-tier `spacer-*` names.
3. 20 instances of `font-size: 11px` resolved to `$portfolio-type-xs` (12px).
4. Typography semantic mixin adoption in Dropzone and page SCSS files.
5. Slider filled track, Toast variants, Checkbox indeterminate added to production.
6. Playground shell cleaned up (magic px, hardcoded hex, misleading content).
7. Shadow and radius token violations fixed.
8. Bidirectional parity added to `AGENTS.md` Cross-App Parity Checklist and §14.4 added to `design.md`.

**Cross-category note:** Also documented as ENG-073 (engineering) and EAP-030 (anti-pattern).

**Pattern extracted → `design.md` §14.4: Production Sync Obligation — playground experiments must be propagated to production in the same session.**

---

#### FB-NNN: "[First 10 words of user message]"

**UX Intent:** [Why this matters from a design perspective]

**Root Cause:** [Technical reason it happened]

**Resolution:** [What was done to fix it]

**Pattern extracted → `design.md` §N.N: [Section reference]**
```
