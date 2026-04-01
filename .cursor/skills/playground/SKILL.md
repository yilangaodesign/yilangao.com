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

## Reference Implementation

**`playground/src/app/components/button/page.tsx`** is the gold-standard template.

Key patterns to follow:

```tsx
// 1. Import harness primitives from playground's own components
import { Shell } from "@/components/shell";
import { SectionHeading } from "@/components/token-grid";
import { ComponentPreview, PropsTable } from "@/components/component-preview";
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
3. **Provide a `code` prop** on every `ComponentPreview` showing the import path and usage
4. **Include a source path footer** at the bottom (e.g., `src/components/ui/Button/Button.tsx`)
5. **Use `@ds/Button`** for any trigger/action buttons in the demo (e.g., dialog triggers, toast triggers)
6. **Add a sidebar entry** in `playground/src/components/sidebar.tsx` in the appropriate category

### MUST NOT

1. **Never declare component markup** — no `<button>`, `<input>`, `<div>` styled to look like a component when the real component exists
2. **Never use raw `<button>` for demo triggers** — import `Button` from `@ds/Button`
3. **Never use SVG for text, labels, or component UI** — SVG is only for icons (Lucide), logos, and decorative illustrations
4. **Never use inline `style={{}}`** — use Tailwind classes or CSS custom properties
5. **Never use Tailwind's default palette** (`emerald-600`, `red-500`) as component colors — use token CSS custom properties from `globals.css`
6. **Never re-implement component logic** (state machines, event handlers, Radix primitive wrappers) — import the production version that already has this
7. **Never use arbitrary Tailwind values with raw pixels** (`w-[48px]`, `h-[200px]`) or raw hex (`bg-[#161616]`, `text-[#525252]`) when a design token CSS custom property exists in `playground/src/app/globals.css`. Use `var(--token-name)` references instead.

### Acceptable Harness Code

The following are expected in a demo page and are NOT violations:

- Layout `div`s with Tailwind for arranging demos (flex, grid, spacing)
- Demo state hooks (`useState`, `useEffect`) for controlling component props interactively
- Data arrays (e.g., `const SIZES: ButtonSize[] = [...]`) for iterating over variants
- Lucide icons as slot content for icon props
- `<table>`, `<thead>`, `<tbody>` for comparison matrices
- Custom label text (`<span>`, `<p>`) for annotations and descriptions
- `cn()` utility for conditional Tailwind class composition on layout elements

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
- [ ] No arbitrary hex values in Tailwind classes (search for `#` in className props)
- [ ] No arbitrary pixel values when a token CSS var exists (search for `[Npx]` patterns)
- [ ] All colors use `var(--...)` references or Tailwind token classes, not default palette or raw hex
- [ ] All spacing uses token vars or standard Tailwind spacing, not arbitrary `[Npx]` when tokens cover the value

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

After building or modifying a playground page, run the Cross-App Parity Checklist from `AGENTS.md`. Key checks:

1. If you created a new component in `src/components/ui/` to support this page, verify it works in the main site too
2. If you modified a component to fix a playground issue, verify the main site still renders correctly
3. Update `archive/registry.json` if this is a new component

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `playground/src/app/components/button/page.tsx` | Reference implementation | Before building any new page | Documentation / page structure changes only (props table, code examples, section text) — never for component visual changes |
| `playground/src/components/sidebar.tsx` | Sidebar navigation categories | When adding a page | When adding a page |
| `playground/src/components/shell.tsx` | Page shell wrapper | When understanding harness structure | Rarely |
| `playground/src/components/component-preview.tsx` | Preview + code tab wrapper | When understanding harness structure | Rarely |
| `archive/registry.json` | Component registry | When adding a new component | When adding a new component |
| `playground/tsconfig.json` | `@ds/*` alias definition | When debugging imports | When adding new aliases |
| `playground/next.config.ts` | Turbopack root + SCSS paths | When debugging build issues | When changing build config |
