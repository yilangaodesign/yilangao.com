# Design Anti-Patterns

> **What this file is:** A catalog of mistakes that caused user frustration, documented so they are never repeated. Each anti-pattern includes the trigger, why it's wrong, and the correct alternative.
>
> **Who reads this:** AI agents before making UI changes — scan for relevant anti-patterns.
> **Who writes this:** AI agents when a feedback cycle reveals a new anti-pattern.
> **Last updated:** 2026-03-29

---

## AP-001: Unlayered CSS Reset with Tailwind v4

**Trigger:** `* { margin: 0; padding: 0; }` placed outside any `@layer`.

**Why it's wrong:** Tailwind v4 generates utilities inside `@layer utilities`. In the CSS cascade, unlayered styles always beat layered styles. This silently zeroes out every spacing utility — `p-8`, `m-4`, `gap-3` all produce zero visible effect. The classes are present in the DOM, DevTools shows them, but they have no visual impact.

**Correct alternative:**
```css
@layer base {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}
```

**Frustration caused:** 3 rounds of escalating user anger. The assistant kept adding more padding classes instead of diagnosing the cascade override.

---

## AP-002: @theme inline for Themeable Values

**Trigger:** Using `@theme inline { --color-background: #fff; }` in Tailwind v4.

**Why it's wrong:** `inline` hardcodes literal color values into utility classes at build time. `bg-background` compiles to `background-color: #ffffff` instead of `background-color: var(--color-background)`. This means `.dark` class CSS variable overrides have zero effect — dark mode is completely broken.

**Correct alternative:** Use `@theme` (without `inline`). This emits `var()` references that respond to runtime class changes.

**Frustration caused:** 2 rounds — user saw white backgrounds in dark mode, sidebar not changing theme.

---

## AP-003: Inline Styles as Workarounds

**Trigger:** Using `style={{ padding: 40 }}` or `style={{ width: someVar }}` when Tailwind classes aren't working.

**Why it's wrong:** Inline styles bypass the design token system. They can't be themed, can't respond to breakpoints, can't be audited, and signal that the framework integration is broken. Using them is treating symptoms instead of diagnosing the root cause.

**Correct alternative:** Fix the root cause (usually a cascade issue). For dynamic values, use Tailwind arbitrary value classes (`w-[200px]`) or CSS custom properties.

---

## AP-004: Fixed Sidebar with padding-left Offset

**Trigger:** Using `position: fixed` on a sidebar and adding `pl-60` or `padding-left` to the content wrapper to prevent overlap.

**Why it's wrong:** The fixed sidebar is removed from document flow. The padding approach is fragile — it depends on the exact sidebar width, breaks when the sidebar is collapsible (dynamic width), and fails if Tailwind can't generate classes from dynamically constructed strings.

**Correct alternative:** Flexbox layout with the sidebar still `fixed`, but an **in-flow spacer div** (same dynamic width class, `hidden lg:block`) that reserves space in the flex flow. Content uses `flex-1 min-w-0`.

---

## AP-005: Centering with w-N mx-auto Inside Padded Containers

**Trigger:** Using `w-10 mx-auto` on an element inside a container that also has horizontal padding.

**Why it's wrong:** `margin: auto` distributes remaining space. If the container is only 40px wide and has `px-1.5` (3px each side), the available width is 34px. A `w-10` (40px) element overflows — `mx-auto` has no space to distribute. The element appears left-aligned.

**Correct alternative:** Make the element full-width and use `justify-center` (flex) to center its children. The icon centers naturally regardless of container math.

---

## AP-006: Truncated Dividers in Compact Layouts

**Trigger:** Using `w-4 mx-auto` on a horizontal divider in a collapsed sidebar.

**Why it's wrong:** A divider that doesn't span its container looks like a rendering artifact, not an intentional design element. Users interpret it as broken.

**Correct alternative:** Plain `border-t` with no width constraint — let it stretch to fill the container.

---

## AP-007: Excessive Content Padding for B2B Interfaces

**Trigger:** Using `p-8` (32px) or larger as base content padding in a tool/dashboard UI.

**Why it's wrong:** 32–40px content gutters are appropriate for consumer landing pages where whitespace conveys luxury. In B2B tools, they waste screen real estate and make the interface feel empty rather than efficient. Designers working in data-dense environments expect tight, purposeful spacing.

**Correct alternative:** Use `px-4 py-4` (16px) as the base, scaling to `px-5 py-5` (20px) at `lg`. This is dense enough for professional use without feeling cramped. See `design.md` §1.1.

**Note:** This supersedes earlier guidance that mandated 32px minimum. That was appropriate before the B2B design posture was established.

---

## AP-008: Treating Symptoms Instead of Diagnosing Root Causes

**Trigger:** User says "there's no spacing." Response: add more `p-*` classes to more elements. User says "still no spacing." Response: add even bigger values.

**Why it's wrong:** If multiple correct Tailwind classes produce no visible effect, the problem is architectural — a cascade override, a build issue, or a framework misconfiguration. Adding more of the same classes will never fix a systemic override.

**Correct alternative:** When spacing classes don't render, immediately check:
1. CSS cascade layers — is there an unlayered reset?
2. Build output — are the utilities being generated?
3. DevTools computed styles — what's actually being applied?
4. Theme directive — is `@theme inline` preventing variable resolution?

---

## AP-009: Inconsistent Spacing Between Toggle States

**Trigger:** A collapsible component (sidebar, accordion, drawer) uses different vertical or horizontal spacing values in its collapsed vs expanded states — e.g., `h-7` tabs when collapsed but `h-8` when expanded, or `mt-4` section gaps when collapsed but `mt-5` when expanded.

**Why it's wrong:** When the user toggles between states, the differing box models cause child elements to visibly shift position. Even with a smooth width transition, the vertical jump is jarring — tabs appear to bounce up or down. Users perceive this as a layout bug rather than a design choice. The root issue is that the two states were styled independently rather than derived from a single canonical spacing model.

**Correct alternative:** Adopt **collapsed-first spacing** — use the collapsed state's values as the canonical reference for all shared vertical dimensions (tab height, section gap, separator height, container vertical padding). The expanded state changes only the horizontal axis (width, padding, label visibility). Shared vertical elements must use a fixed-height wrapper so the same box model is rendered regardless of internal content (e.g., a `h-5` wrapper that contains either a `border-t` or a section label).

**Frustration caused:** User explicitly noted tabs jumping up and down on toggle, and requested the collapsed view as the authoritative spacing reference.

---

## AP-010: Consumer-Grade Corner Radius in B2B

**Trigger:** Using `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), or `rounded-2xl` (16px) on any element in a B2B product.

**Why it's wrong:** Large corner radii communicate friendliness and approachability — the visual language of consumer apps (iOS, social media, SaaS marketing pages). In a professional tool, they look out of place, softening edges that should feel precise and utilitarian. The larger the radius, the more it signals "casual" rather than "serious."

**Correct alternative:** Default to `rounded-sm` (2px) for everything. Use `rounded-none` (0px) for tables and full-bleed containers. Reserve `rounded-full` strictly for progress bars, pills, and avatars. Never exceed 4px (`rounded`) and even that should be rare. See `design.md` §8 for the full scale.

**Frustration caused:** User explicitly stated corner radius is "a little too much" and wants 0px to a few pixels as the standard range.

---

## Entry Template

```markdown
## AP-NNN: [Short Name]

**Trigger:** [What action or code pattern triggers this]

**Why it's wrong:** [The technical and UX reason]

**Correct alternative:** [What to do instead]

**Frustration caused:** [Optional — how many rounds of user frustration this created]
```
