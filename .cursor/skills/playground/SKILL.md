---
name: playground
description: >-
  Architecture rules for playground component pages. Covers import paths
  (@ds/* vs @site/*), composition rules, MUST/MUST NOT guidelines, and
  validation checklists. Mandatory reading before touching any file under
  playground/src/app/components/.
---

# Skill: Playground Component Page

## When to Activate

Activate this skill when creating, modifying, or auditing any file under `playground/src/app/components/`, `playground/src/components/`, or `playground/src/app/layout.tsx`.

## Intent Classification (Central Guardrail)

**Before editing any playground file, you MUST classify the task per `AGENTS.md` Engineering guardrail #18.** This is a central, non-bypassable guardrail — it applies regardless of which skill or route activated the task.

| Category | Where to edit | Examples |
|---|---|---|
| **Component visual** (how the component looks/behaves) | `src/components/ui/` or `src/components/` — NEVER a playground page | "the button padding looks wrong," "the hover state is off" |
| **Documentation / page structure** (how the component is presented/documented) | `playground/src/app/components/*/page.tsx` — this is legitimate | "add a new section," "update the props table," "the code example is wrong," new parity page |
| **Shell** (playground-wide concerns) | `playground/src/components/` or `playground/src/app/layout.tsx` | "rearrange the sidebar," "change how previews render" |
| **Ambiguous** | Ask the user first | "fix this," "update the playground" |

**Why this exists:** The playground auto-updates when you change the design system source, because it imports the real component via `@ds/*`. Editing a playground page to fix a visual issue creates a desync — the playground looks right but the design system is still wrong.

### Exception Protocol (Rare Overrides)

If the user **explicitly** asks you to bypass the Intent Gate for a specific edit:

1. **Acknowledge** — state which guardrail is being overridden and for which file
2. **Document** — before making any edit, note in your response: the file being edited, what category the Intent Gate would normally assign (e.g., "Component visual → should go to src/"), and the user's reason for overriding
3. **Scope** — limit the override to the specific edit requested. Do not generalize it to other files or future edits in the same session.
4. **Proceed** — make the edit
5. **Note** — this exception does NOT set a precedent. The next playground edit resumes normal Intent Gate classification.

## Architecture

The playground is a **documentation surface** for the design system. Every component page is a **thin harness** — it imports and renders the real production component, wraps it in layout/documentation primitives, and provides a props table. It never re-implements the component.

### How `@ds/*` Works

```
playground/tsconfig.json  →  "@ds/*": ["../src/components/ui/*"]
playground/next.config.ts →  turbopack.root = monorepo root (so Turbopack processes src/ files)
                           →  sassOptions.loadPaths includes src/styles/ (so SCSS @use resolves)
```

- `@ds/Button` resolves to `src/components/ui/Button/` (the production component)
- SCSS Module classes are scoped/hashed — they coexist with Tailwind without conflicts
- Changes to `src/components/ui/*` propagate automatically to the playground (no sync step)

### Import Decision Tree

```
Is the component in src/components/ui/?
  YES → import from @ds/<Name>         (e.g., import { Button } from "@ds/Button")
  NO  → Is it in src/components/?
          YES → import from @site/<Name>  (e.g., import ScrollSpy from "@site/ScrollSpy")
          NO  → Create the component in src/ FIRST, then build the playground page
```

**Path aliases in `playground/tsconfig.json`:**
- `@ds/*` → `../src/components/ui/*` (design system components)
- `@site/*` → `../src/components/*` (all main-site components including non-ui)
- `@/*` → `./src/*` (playground's own code)

**Bridge files for `@/` resolution:** Components imported via `@site/*` may internally use
`@/lib/...` or `@/components/...`. Since `@/` resolves to `playground/src/` in the playground
context, bridge/stub files must exist for each dependency:
- `playground/src/lib/motion.ts` — re-exports motion constants for ScrollSpy
- `playground/src/components/inline-edit/` — stubs for CMS inline-edit (TestimonialCard)
- `playground/src/components/EditButton.tsx` — stub for admin EditButton

## Styling Policy

The playground documentation infrastructure uses **SCSS modules with Élan DS tokens** — never Tailwind utility classes. This ensures the playground dogfoods the same design system it documents, and token changes propagate automatically.

### Mandatory for new doc infrastructure

All new playground shell/doc components MUST use:

- **SCSS modules** (co-located `*.module.scss`) for all styling
- **`var(--portfolio-*)` CSS custom properties** for colors, typography, spacing, borders, elevation, motion, z-index
- **`@include` mixins** from `src/styles/mixins/` for typography (`body-sm`, `code-sm`, `label`, `heading-3`, etc.), interactive states (`button-reset`, `transition-fast`, `focus-ring`), and layout (`flex-center`)
- **`$elan-mq-*` breakpoint variables** from `src/styles/tokens/_breakpoints.scss` for responsive media queries

**Tailwind is NOT permitted** for new doc infrastructure code (`token-grid.tsx`, `component-preview.tsx`, `scroll-spy.tsx`, token/component page files).

### Acceptable inline styles

Dynamic values from data are the one acceptable use of inline `style={{}}`:

```tsx
<div style={{ backgroundColor: tokenColor }}>  {/* ✅ data-driven */}
```

Static visual properties must always go in the SCSS module — never `style={{}}`.

### Gradual migration plan

The following files still use Tailwind and will be migrated incrementally in future phases:

- `playground/src/components/shell.tsx`
- `playground/src/components/sidebar.tsx`
- Individual component page files (`playground/src/app/components/*/page.tsx`)

The `@theme` block in `playground/src/app/globals.css` remains as a bridge for these existing Tailwind pages. It will be removed when the full playground migration is complete.

### SCSS module conventions

```
playground/src/components/
  token-grid.tsx              (React component)
  token-grid.module.scss      (styles via DS tokens)
  component-preview.tsx
  component-preview.module.scss
  scroll-spy.tsx
  scroll-spy.module.scss

playground/src/app/tokens/colors/
  page.tsx
  colors.module.scss
```

Import pattern: `import s from "./component-name.module.scss"`, then use `className={s.className}`.

SCSS modules `@use` DS sources via the `sassOptions.loadPaths` in `playground/next.config.ts`:

```scss
@use 'mixins/typography' as *;
@use 'mixins/interactive' as *;
@use 'tokens/breakpoints' as *;
```

## Page Typography Hierarchy

Every playground page (both token pages and component pages) must use a consistent heading system. These shared components live in `playground/src/components/token-grid.tsx` and are styled via `token-grid.module.scss` using DS tokens.

| Level | Component | HTML tag | DS tokens used | Usage |
|-------|-----------|----------|----------------|-------|
| Page hero | `SectionHeading` | `h2` | `type-2xl`, `weight-bold`, `tracking-tight` | One per page. Title + optional description. |
| Major section | `SectionTitle` | `h3` | `type-lg`, `weight-semibold`, `tracking-tight` | Content sections within a page. Sentence/title case. |
| Subsection | `SubsectionTitle` (via `SubSection` wrapper) | `h4` | `type-sm`, `weight-medium`, `text-secondary`, `tracking-wider`, uppercase | Eyebrow-style subsection labels. Always uppercase. |
| Section intro | `SectionDescription` | `p` | `@include body-sm` | Description text after any heading. Always `type-sm`, never `type-xs`. |
| Zone divider | `ZoneDivider` | `div` | `border-subtle`, `spacer-8x` / `spacer-6x` / `spacer-4x` | Separates major IA zones. Optional label. |

### Rules

- **One `SectionHeading` (h2) per page.** It is the page title in the content area.
- **Shell `h1` is the sticky header.** Do not try to make it match the hero.
- **`h3` is reserved for `SectionTitle` and `ComponentPreview` titles.** Do not use `h3` for eyebrow labels.
- **All section descriptions use `type-sm`.** Never `type-xs` for intro paragraphs. `type-xs` is for captions, sublabels, and metadata only.
- **No inline `style={{}}` for text colors.** Use DS token classes from SCSS modules.
- **Component pages** use `ComponentPreview` (which has its own `h3` inside a Card) for demos, and `SubsectionHeading` for sections like "Props".

## Token Page Template

Every foundational styles page (`playground/src/app/tokens/*/page.tsx`) must follow this standard IA structure:

```
SectionHeading (h2): Page Title + description

SectionTitle (h3): Token Architecture        ← MANDATORY first section
  Explains the naming formula, tiers, or convention for this token category.

SectionTitle (h3): [Content Section 1]
SectionTitle (h3): [Content Section 2]
...

ZoneDivider (if page has raw primitives / reference material)

SectionTitle (h3): [Reference Section]
  SubsectionTitle (h4): [Sub-sections]
```

### Rules

- **Token Architecture is always the first `SectionTitle`** (h3) on every styles page. It explains how this page's tokens are named and structured — the naming formula.
- It belongs to the application/semantic zone, not at a global level above all content. It answers "how are these tokens named?" not "what is the design system?".
- **ZoneDivider** only appears when there's a conceptual split between semantic/application tokens and raw primitives (e.g., colors page: semantic tokens above, palette reference below).
- **ScrollSpy** is mandatory per the policy below (4+ sections threshold). The `token-architecture` id should be the first entry in the `scrollSpySections` array.

### Gold-standard reference

The **colors page** (`playground/src/app/tokens/colors/page.tsx`) is the canonical example of this template, with Token Architecture as the first SectionTitle, property sections, a ZoneDivider, and a Palette Reference zone.

## ScrollSpy Usage Policy

`ScrollSpy` provides a fixed right-rail section navigator on large screens. It is imported from `@/components/scroll-spy` (which in turn imports the production component via `@site/ScrollSpy`).

### When to include ScrollSpy

A page SHOULD include ScrollSpy when it meets **any** of these criteria:

- The page has **4+ major sections** (`SectionTitle`-level headings)
- The page content exceeds **~3 viewport heights** (~2400px) of rendered content
- The page has a **two-zone IA** (e.g., semantic tokens + palette reference) where the user needs to orient between zones

A page SHOULD NOT include ScrollSpy when:

- The page has 3 or fewer sections (the content is short enough to scan)
- The page is a single-component demo with only Preview + Props (most component pages)

### ScrollSpy sections array

The `sections` prop accepts an array of `{ id, label, group? }` objects. For pages with grouped sections (e.g., semantic tokens zone vs. reference zone), use the `group` field to insert a visual divider in the nav before that section:

```tsx
const sections = [
  { id: "architecture", label: "Architecture", group: "Tokens" },
  { id: "surface", label: "Surface" },
  // ...
  { id: "palette-reference", label: "Palette Reference", group: "Reference" },
];
```

### Scroll target IDs

Every section that appears in ScrollSpy MUST have a matching `id` attribute on its container element plus `scroll-mt-24` for sticky-header offset. `SectionTitle` accepts an `id` prop that handles both.

## Reference Implementation

**`playground/src/app/components/button/page.tsx`** is the gold-standard template.

Key patterns to follow:

```tsx
// 1. Import harness primitives from playground's own components
import { Shell } from "@/components/shell";
import { SectionHeading, SectionTitle, SectionDescription, SubSection } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
// ScrollSpy — include on pages with 4+ sections or 3+ viewport heights of content
import ScrollSpy from "@/components/scroll-spy";

// 2. Import the REAL component from the design system — never re-implement it
import { Button } from "@ds/Button";
import type { ButtonAppearance, ButtonEmphasis, ButtonSize } from "@ds/Button";

// 3. Page is a thin harness: layout + state + documentation
export default function ButtonPage() {
  return (
    <Shell title="Button">
      <ScrollSpy sections={scrollSpySections} />
      <SectionHeading title="Button" description="..." />

      {/* Each demo section wraps the REAL component in ComponentPreview */}
      <ComponentPreview title="..." description="..." code={`<Button>Click</Button>`}>
        <Button>Click</Button>  {/* ← the real @ds/Button, not a re-implementation */}
      </ComponentPreview>

      {/* Props table documents the component API */}
      <PropsTable props={[...]} />

      {/* Footer shows the source file path */}
      <div className="text-xs font-mono text-muted-foreground ...">
        src/components/ui/Button/Button.tsx
      </div>
    </Shell>
  );
}
```

## Pre-Build Checklist (New Pages)

Before writing any code for a new playground component page:

- [ ] Verify the component exists in `src/components/ui/` or `src/components/`
- [ ] If it doesn't exist, create it there first — never build a playground page for a component that only exists in the page itself
- [ ] Identify the component's exported members (component, types, sub-components)
- [ ] Check `playground/src/components/sidebar.tsx` to see which category the component belongs in

## Composition Rules

### MUST DO

1. **Import the production component** via `@ds/*` or direct path — the page renders the real component
2. **Use harness primitives** for structure: `Shell`, `SectionHeading`, `ComponentPreview`, `PropsTable`, `ScrollSpy`
3. **Use the standard typography hierarchy** for all headings and descriptions. Import `SectionTitle`, `SubSection`, `SectionDescription` from `@/components/token-grid`. Do not create ad-hoc heading elements. See "Page Typography Hierarchy" above.
4. **Provide a `code` prop** on every `ComponentPreview` showing the import path and usage
5. **Include a source path footer** at the bottom (e.g., `src/components/ui/Button/Button.tsx`)
6. **Use `@ds/Button`** for any trigger/action buttons in the demo (e.g., dialog triggers, toast triggers)
7. **Add a sidebar entry** in `playground/src/components/sidebar.tsx` in the appropriate category
8. **Every foundational styles page** (`playground/src/app/tokens/*/page.tsx`) must include a Token Architecture section as its first `SectionTitle` (h3). See "Token Page Template" above.

### MUST NOT

1. **Never declare component markup** — no `<button>`, `<input>`, `<div>` styled to look like a component when the real component exists
2. **Never use raw `<button>` for demo triggers** — import `Button` from `@ds/Button`
3. **Never use SVG for text, labels, or component UI** — SVG is only for icons (Lucide), logos, and decorative illustrations
4. **Never use inline `style={{}}`** for static visual properties — use SCSS module classes with DS tokens. Dynamic data-driven values (e.g., `style={{ backgroundColor: tokenColor }}`) are the one exception.
5. **Never use Tailwind's default palette** (`emerald-600`, `red-500`) as component colors — use `var(--portfolio-*)` token custom properties
6. **Never use Tailwind utility classes in doc infrastructure files** (`token-grid.tsx`, `component-preview.tsx`, `scroll-spy.tsx`, token page files) — use SCSS modules with DS tokens. See "Styling Policy" above.
6. **Never re-implement component logic** (state machines, event handlers, Radix primitive wrappers) — import the production version that already has this
7. **Never use arbitrary Tailwind values with raw pixels** (`w-[48px]`, `h-[200px]`) or raw hex (`bg-[#161616]`, `text-[#525252]`) when a design token CSS custom property exists in `playground/src/app/globals.css`. Use `var(--token-name)` references instead.
8. **Never use `h3` for eyebrow-style labels** — use `SubSection` (`h4`). `h3` is reserved for `SectionTitle` and `ComponentPreview` titles.
9. **Never use `text-xs` for section intro paragraphs** — use `SectionDescription` (`text-sm`). `text-xs` is for metadata, sublabels, and captions only.

### Acceptable Harness Code

The following are expected in a demo page and are NOT violations:

- Layout `div`s with SCSS module classes (or Tailwind in not-yet-migrated pages) for arranging demos
- Demo state hooks (`useState`, `useEffect`) for controlling component props interactively
- Data arrays (e.g., `const SIZES: ButtonSize[] = [...]`) for iterating over variants
- Lucide icons as slot content for icon props
- `<table>`, `<thead>`, `<tbody>` for comparison matrices
- Custom label text (`<span>`, `<p>`) for annotations and descriptions
- `cn()` utility for conditional class composition on layout elements (not-yet-migrated pages only)

### Allowlisted Exceptions

These specific patterns are explicitly permitted despite normally being violations:

- **`expand-collapse/page.tsx` raw `<button>` trigger:** The expand/collapse demo uses a custom trigger button with a rotating chevron SVG. This trigger has `style={{ transform: ... }}` for dynamic rotation and doesn't map cleanly to the `@ds/Button` API. The broader problem of rebuilding all playground triggers with the design system is a separate future task.

## Validation Checklist (After Building)

- [ ] Page renders at `http://localhost:4001/components/<slug>` without errors
- [ ] Every `ComponentPreview` has a `code` prop with the import statement
- [ ] Source path footer is present at the bottom
- [ ] No component re-implementations in the page (search for Radix imports, styled `<button>`, etc.)
- [ ] Sidebar entry exists in `playground/src/components/sidebar.tsx`
- [ ] Registry entry exists in `archive/registry.json` (for new components)
- [ ] No arbitrary hex values in className props (search for `#` in className strings)
- [ ] No arbitrary pixel values when a token CSS var exists (search for `[Npx]` patterns)
- [ ] All colors use `var(--portfolio-*)` token references, not raw hex or default palette colors
- [ ] All spacing uses `var(--portfolio-spacer-*)` tokens, not arbitrary pixel values when tokens cover the value
- [ ] Doc infrastructure files use SCSS modules — no Tailwind utility classes in `token-grid.tsx`, `component-preview.tsx`, `scroll-spy.tsx`, or token page files

## Evaluation Gate (Mandatory Post-Implementation Check)

**Run this AFTER finishing any component-related task, BEFORE reporting done.** This catches misplaced or wrongly-stacked code that passed the Intent Gate.

```
AFTER you finish writing code:

1. PLACEMENT CHECK — Is the code in the right place?
   - Did you add new component logic, styling, or visual behavior to a
     playground page instead of the design system source?
   - YES → MOVE: migrate the implementation to the correct src/ location
   - NO  → proceed to step 2

2. STACK CHECK — Does the code use the same tech stack as the production component?
   - Read the production component to see what it uses:
     • Button, Dialog, Tabs → SCSS modules + Radix primitives
     • FadeIn, MountEntrance, ArrowReveal, ExpandCollapse → Framer Motion
     • Marquee → Pure CSS animation
     • Navigation, Footer, ThemeToggle → Plain React + SCSS modules
   - If the new code uses a different stack (e.g., Tailwind instead of SCSS)
   → REBUILD: rewrite using the production stack, matching the visual result

3. QUALITY CHECK — Does the rebuilt code visually match what was intended?
   - Compare production-stack version against the original
   - If NO match AND attempt count < 3 → loop back to step 2
   - If NO match AND attempt count >= 3 → STOP and ask the user to review
     (show what was built vs. what it should look like)

4. CLEANUP — Delete any wrong code
   - Remove re-implementations from the playground page
   - Ensure the playground page only imports from @ds/* or @site/*

5. FINAL CHECK — Run steps 1-4 again from the top
   - If anything still fails → loop (counts toward the 3-attempt cap)
   - If everything passes → done
```

## Post-Build

### Mandatory Flush-and-Restart (EAP-042 — no exceptions)

After ANY edit to a playground file or a `src/` file consumed by the playground, you MUST flush and restart before reporting the task as done. Turbopack HMR is fundamentally unreliable for the playground — it fails more often than it succeeds. This is NOT a fallback step; it is the default.

1. **Kill** the playground server: `lsof -ti :4001 | xargs kill -9`
2. **Delete** the Turbopack cache: `rm -rf playground/.next`
3. **Restart** the server: `npm run playground` (background it)
4. **Wait** for HTTP 200: poll `curl -s -o /dev/null -w "%{http_code}" http://localhost:4001/components/<slug>` until 200
5. **Verify** the specific change is in the response: `curl -s http://localhost:4001/components/<slug> | grep '<distinctive string from your edit>'`
6. **Only then** report the task as done.

Do NOT skip any step. Do NOT rely on HMR. Do NOT tell the user to "hard refresh" as the primary strategy. This protocol exists because the previous "try HMR first" approach failed 6+ times.

### Cross-App Parity

After building or modifying a playground page, run the Cross-App Parity Checklist from `AGENTS.md`. Key checks:

1. If you created a new component in `src/components/ui/` to support this page, verify it works in the main site too
2. If you modified a component to fix a playground issue, verify the main site still renders correctly
3. Update `archive/registry.json` if this is a new component

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `playground/src/app/components/button/page.tsx` | Reference implementation | Before building any new page | Documentation / page structure changes only (props table, code examples, section text) — never for component visual changes |
| `playground/src/components/sidebar.tsx` | Sidebar navigation categories | When adding a page | When adding a page |
| `playground/src/components/token-grid.tsx` | Doc primitives: `SectionHeading`, `SectionTitle`, `SectionDescription`, `SubSection`, `SubsectionTitle`, `ZoneDivider`, `TokenRow`, `ColorSwatch` | Before building any new page | When adding new doc-level primitives |
| `playground/src/components/shell.tsx` | Page shell wrapper | When understanding harness structure | Rarely |
| `playground/src/components/component-preview.tsx` | Preview + code tab wrapper, `SubsectionHeading`, `PropsTable` | When understanding harness structure | Rarely |
| `archive/registry.json` | Component registry | When adding a new component | When adding a new component |
| `playground/tsconfig.json` | `@ds/*` alias definition | When debugging imports | When adding new aliases |
| `playground/next.config.ts` | Turbopack root + SCSS paths | When debugging build issues | When changing build config |
