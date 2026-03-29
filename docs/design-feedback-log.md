# Design Feedback Log

> **What this file is:** Chronological record of every design feedback session. Each entry captures the raw user instruction, the parsed UX intent, and what was done. Newest entries first.
>
> **Who reads this:** AI agents at session start (scan recent entries for context), and during feedback processing (check for recurring patterns).
> **Who writes this:** AI agents after each feedback cycle via the `design-iteration` skill.
> **Last updated:** 2026-03-29

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

## Entry Template

```markdown
#### FB-NNN: "[First 10 words of user message]"

**UX Intent:** [Why this matters from a design perspective]

**Root Cause:** [Technical reason it happened]

**Resolution:** [What was done to fix it]

**Pattern extracted → `design.md` §N.N: [Section reference]**
```
