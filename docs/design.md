# Design System — Accumulated Knowledge

> **What this file is:** The hub file for the design knowledge base. Detailed section content lives in spoke files under `docs/design/`. This file contains the Section Index for routing, the Design Posture (read every time), Process Principles, and the Feedback Frequency Map.
>
> **Who reads this:** AI agents routed here by `AGENTS.md` Pre-Flight. Read the Section Index first, then open only the spoke file matching your task.
> **Who writes this:** AI agents after processing user feedback via the `design-iteration` skill.
> **Last updated:** 2026-04-03 (FB-072: Eyebrow adoption audit — ~44 instances migrated across 9 files)

---

## Section Index — Read This First

| § | Topic | File | Read when |
|---|-------|------|-----------|
| §0 | Design Posture | *(this file)* | Always for UI work |
| §1 | Spacing & Breathing Room | [`docs/design/spacing.md`](design/spacing.md) | Touching spacing, padding, gaps |
| §2 | Layout Integrity | [`docs/design/layout.md`](design/layout.md) | Changing layout, positioning |
| §3 | CSS Framework (Tailwind v4) | [`docs/design/css-framework.md`](design/css-framework.md) | Touching CSS config, layers |
| §4 | Navigation Design | [`docs/design/navigation.md`](design/navigation.md) | Modifying sidebar, nav, flyouts |
| §5 | Theming | [`docs/design/theming.md`](design/theming.md) | Touching colors, dark mode |
| §6 | Responsive Design | [`docs/design/responsive.md`](design/responsive.md) | Touching breakpoints, viewports |
| §8 | Corner Radius | [`docs/design/corner-radius.md`](design/corner-radius.md) | Adding or modifying border-radius |
| §9 | Color Philosophy | [`docs/design/color.md`](design/color.md) | Adopting palette colors, tokens |
| §10 | Interactive Controls | [`docs/design/interactive-controls.md`](design/interactive-controls.md) | Building controls, hit zones |
| §11 | Information Architecture | [`docs/design/information-architecture.md`](design/information-architecture.md) | Organizing categories, taxonomy |
| §12 | Overlay & Flyout | [`docs/design/navigation.md`](design/navigation.md) | Flyouts, portals, stacking |
| §13 | Content Navigation | [`docs/design/content-navigation.md`](design/content-navigation.md) | Adding ScrollSpy or nav aids |
| §14 | Playground Consistency | [`docs/design/playground-consistency.md`](design/playground-consistency.md) | Token page consistency |
| §15 | Portfolio Grid Layout | [`docs/design/homepage.md`](design/homepage.md) | Homepage grid, card density |
| §16 | Homepage IA | [`docs/design/homepage.md`](design/homepage.md) | Sidebar navigation, page structure |
| §17 | Accessibility | [`docs/design/accessibility.md`](design/accessibility.md) | Keyboard nav, ARIA, focus |
| §18 | Typography System | [`docs/design/typography.md`](design/typography.md) | Font roles, mixins, pairing |
| §19 | Admin UI Palette | [`docs/design/admin-ui.md`](design/admin-ui.md) | Admin vs public palette |
| §20 | Button Adoption | [`docs/design/admin-ui.md`](design/admin-ui.md) | When to use DS Button |
| §21 | Undocumented Patterns | [`docs/design/admin-ui.md`](design/admin-ui.md) | DS gap analysis |
| §22 | Button Sizing | [`docs/design/button-sizing.md`](design/button-sizing.md) | Icon/label proportionality |
| §7 | Process Principles | *(this file)* | Meta — how to diagnose |
| App. | Frequency Map | *(this file)* | Checking recurring patterns |

---

## 0. Design Posture

**Always approach design decisions as a staff-level UX designer building for B2B.** This means:

- **B2B density by default.** This is a professional tool, not a consumer marketing page. Content should feel dense and efficient — generous whitespace is wasted real estate. When in doubt, tighten.
- Prioritize spatial consistency, visual rhythm, and state transitions over raw aesthetics.
- Catch problems that junior designers miss: sub-pixel vertical shifts on toggle, inconsistent padding between component states, interaction choreography that feels off even when each frame looks fine.
- When two states of the same component (e.g., collapsed vs expanded) have different spacing, that's a bug — not a style choice. Users perceive it as broken.
- Default to the tighter, more constrained state as the canonical reference and match the looser state to it, not the other way around. Tight spacing is intentional; loose spacing is often accidental padding accumulation.
- **Corner radius: near-zero.** Round corners signal consumer/playful. B2B products use sharp to barely-rounded corners. See §8 for the full radius scale.

---

## How to Use This File

1. **Read the Section Index above** — match your task to a section, then open the linked spoke file and read only that file.
2. **If the user gives feedback**, activate the `design-iteration` skill — it will handle full doc reading.
3. **After resolving feedback**, update the relevant spoke file: strengthen existing principles or add new ones.
4. **Do NOT read all spoke files** unless the skill protocol requires it.

---

## 7. Process Principles

### 7.1 Diagnose Before You Patch

When spacing "isn't working," the root cause is usually architectural (wrong CSS layer, wrong theme directive, wrong layout model) — not insufficient padding values. Check the cascade, check the layout mode, check the build output before adding more utilities.

### 7.2 One Fix, One Concept

Each iteration should fix one conceptual problem. Don't scatter changes across 15 files to fix a spacing issue that has a single root cause (e.g., unlayered reset).

### 7.3 Check the Design.md First

Before writing UI code, read this file. If the user's feedback maps to an existing principle, apply the documented solution immediately.

### 7.4 Model All States Before Writing Any Code

Before implementing or modifying any interactive component, enumerate **every visual state** the component can be in and define the full class set for each. Write this out as a state table (even if just mental) before touching code. The table must answer, for each state: text color, icon color, font weight, resting background, and hover background.

**Why this exists:** Session 2026-04-01 required 5 rounds of feedback to reach a correct four-state model for sidebar navigation items (Default, Hover, Expanded, Active). Each round fixed one state while inadvertently breaking or neglecting another — because no complete state model was defined upfront. The root cause was incremental, state-by-state implementation instead of holistic state modeling.

**The protocol:**
1. List every state the component can be in (resting, hover, focus, active, expanded, disabled, loading, etc.).
2. For each state, define what visual properties change and what semantic message they communicate (interaction vs. location vs. status).
3. Verify that no two states share identical styling unless they are semantically equivalent.
4. Verify that the same semantic state uses identical styling across all instances of the component (no divergence between parent/child/sibling variants).
5. Only then write the conditional class logic.

**Anti-pattern:** Implementing active state for one nav item type, then copy-pasting a different treatment for another type, then patching hover as a separate concern. This produces frankenstate — a component where each state was designed in isolation and they don't form a coherent system. See AP-046.

### 7.5 Contained Components Get Container-Level Spacing

When a component's items live inside a bordered/elevated container (Menu, DropdownMenu, Select, Popover list), the container itself should provide inline padding to inset items from the edge — independent of item-level padding. Item-level padding follows the shared spatial scale (same as Button); container-level padding is a separate, additive concern.

**Why this exists:** The Menu component's item padding mirrors Button exactly (One GS reference model). But buttons are standalone elements while menu items sit inside a bordered panel. Without container inline padding, item text at small sizes sits uncomfortably close to the menu border — 6px at xs vs. Carbon/MUI/Ant's effective 16px+ inset. Adding 4px container padding creates a comfortable combined inset (10px at xs) without breaking spatial scale parity with Button.

**The rule:** Any component that renders a list of interactive items inside a visual container (border, shadow, or elevation) should set `padding-inline` on the container, not increase item padding beyond the shared spatial scale.

### 7.6 Playground Demos Must Show the Real Use Case

Every playground demo must use content that represents the component's most common real-world usage, not generic placeholders. High-fidelity demos create strong mental models — if the demo content doesn't match how the pattern is actually used, viewers will unconsciously associate the component with the wrong context.

**Why this exists:** A MenuHeader demo originally showed a "Select all" button — a plausible but uncommon use case. The canonical real-world pattern for a menu header is a search/filter input (VS Code command palette, Notion's page picker, Slack's channel switcher). A viewer seeing "Select all" would not immediately understand what MenuHeader is for, because their brain pattern-matches against the demo content rather than reading the API description.

**The rule:** Before writing a playground demo, ask: "What is the single most common real-world use case for this pattern?" Use that. If the component serves multiple use cases, lead with the most common one and add secondary demos below. Never use generic labels like "Header slot" or "Content here" — these signal that the author didn't think through the actual usage.

**Applies to:** All playground component pages (`playground/src/app/components/*/page.tsx`), marketing examples, and documentation screenshots.

### 7.7 Name by Semantic Intent, Not Visual Implementation

Every prop name, CSS class name, variant value, and token name must communicate **when and why** to use it — not **what CSS property** it changes. An AI agent (or a new team member) encountering a prop for the first time must be able to decide whether to use it from the name alone, in one reasoning step, without inspecting the source.

**The test:** Can an agent answer "should I use this prop?" from the name and the component context, without knowing the underlying CSS? If the name requires a second step ("What does `mono` do?" → "It sets monospace" → "Is monospace appropriate here?"), the name fails.

**Why this exists:** The Eyebrow component initially exposed a `mono` boolean prop. `mono` describes the implementation (switches to monospace font) but not the intent (labels a metric/statistic). An agent encountering `mono` has to reason through a two-step chain — "Is this a data context? → If yes, mono is appropriate." Renaming to `metric` collapses that to one step: "Am I placing this above a number/KPI? → Yes, use `metric`."

**The protocol:**
1. When adding a prop, CSS class, or token, ask: "Does this name tell the consumer *when* to use it, or only *what* it does?"
2. If it only describes the CSS effect (font, color, border-radius, opacity), rename it to describe the **use-case context** that triggers that effect.
3. The default value's intent should be self-evident from the component's primary use case. Only the non-default needs an explicit name.
4. When two contexts need different visual treatments, name the variants after the contexts, not the treatments.

**Examples:**

| Bad (implementation) | Good (intent) | Why |
|---------------------|---------------|-----|
| `mono` | `metric` | "Labels a statistic" vs. "uses monospace font" |
| `rounded` | `pill` | "Tag/badge shape" vs. "adds border-radius" |
| `gray` | `muted` | "De-emphasized content" vs. "applies gray color" |
| `bold` (weight) | `emphasis="bold"` | Paired with semantic axis name |
| `small` | `compact` | "Dense layout context" vs. "makes it smaller" |

**Anti-pattern:** Naming a variant after its CSS property — `.font-mono`, `.bg-gray`, `.rounded-full` — then expecting consumers to map backward from the property to the appropriate usage context. The naming should map forward: from context to treatment.

**Applies to:** All component props, SCSS module class names, CSS custom property names, design token names, and variant type values across the design system.

---

## Appendix: Feedback Frequency Map

| Pattern | Times Raised | Priority |
|---------|-------------|----------|
| Spacing / Padding / Breathing Room | 15 | Critical |
| State transition consistency (toggle jump / layout shift / mode coherence) | 8 | Critical |
| Component state modeling (define all states before coding) | 1 | Critical |
| Layout integrity (no overlapping, cross-panel alignment) | 5 | Critical |
| Interactive control design (hit zones, gestures, mapping, color-first builders) | 4 | High |
| Dark mode / Theming | 3 | High |
| Overlay / flyout positioning (stacking contexts, portals) | 3 | High |
| Visual hierarchy in navigation | 3 | High |
| Information architecture / taxonomy / naming / tab consolidation | 8 | Critical — FB-091: Eyebrow component built. FB-072: Migrated ~44 hand-rolled label instances across 9 files to `<Eyebrow>`, removing `@include label`/`label-sm` mixins from all public pages and elan-visuals. |
| Visual identity across spatial contexts (size/alignment consistency) | 6 | Critical — FB-074: Menu lg/xl gap and px-padding scaled too aggressively; gap capped at 1.25x for dense list rows. |
| Centering / Symmetry | 4 | Critical |
| Token-first, no inline styles | 2 | High |
| CSS framework architecture (global resets breaking inline elements) | 3 | High |
| Collapsibility / Compact modes | 2 | Medium |
| Interaction proximity (response near trigger) | 1 | High |
| Interaction friction (click vs. hover for exploration) | 1 | High |
| Corner radius too large | 1 | High |
| Color philosophy / palette governance | 1 | High |
| Content navigation policy (ScrollSpy threshold, scroll offset) | 2 | High |
| Portfolio grid density / scannability | 1 | High |
| Homepage IA / nav consistency / mobile density | 1 | High |
| User-centric information filtering (audience vs. maintainer data) | 1 | High |
| Playground swatch interaction/shape/size consistency | 3 | High |
| CMS inline edit panel UX (actions, drag, errors, dimensions, validation) | 6 | Critical |
| CMS admin form UX (field labels, descriptions, validation feedback) | 1 | High |
| Upload affordances (contextual upload where content is displayed) | 1 | High |
| Admin controls displacing component content (overlay separation) | 1 | High |
| Interactive visual scoping (content must match section topic) | 1 | High |
| False affordances (static elements styled as interactive) | 1 | High |
| Responsive breakpoints / cross-app parity | 1 | High |
| DS compliance (token adoption, mixin usage, brand color) | 1 | High |
| Undocumented patterns (gradient bg, masonry, dark surface alpha) | 1 | Medium |
| Button component sizing (icon/label proportionality, vertical padding) | 1 | High |
| NavItem sizing (padding, gap, trailing icon parity, touch tier) | 1 | High |
| WCAG contrast for functional elements in dark mode | 6 | Critical — FB-075: Added `neutral-max` token (#000/#FFF) for hover-state contrast boost. Hover must never decrease text-to-background contrast. |
| Demo content fidelity (use real use cases, not generic placeholders) | 1 | High |
| Visual language collision (same treatment for different semantics in same context) | 1 | High |
| Spacing must account for visual overflow, not box-model edges | 1 | High |
| Semantic intent naming (props/tokens named by context, not CSS effect) | 1 | Critical — FB-071: Eyebrow `mono` renamed to `metric`. Establishes guardrail Design #8 and Process Principle §7.7. |
| Slot semantic separation (distinct roles for affix vs icon vs generic content) | 1 | High — FB-073: Input `trailing` slot added. `suffix` was conflating value affixes with generic content like Kbd. |

---

## Entry Template (for future updates)

```markdown
## N. [Category Name]

### N.1 [Principle Name]

**Source:** Session YYYY-MM-DD, feedback message "[first 10 words...]"
**Problem:** [What went wrong]
**Root cause:** [Why it went wrong]
**Rule:** [The principle to follow going forward]
**Implementation:** [Specific code pattern or token to use]
```
