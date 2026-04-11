# Corner Radius (B2B Sharp)

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.

**Severity: High** — Excessive rounding undermines the professional, tool-like aesthetic expected in B2B products.

### 8.1 Radius Scale

| Class | Value | Use |
|-------|-------|-----|
| `rounded-none` | 0px | Tables, full-bleed containers, dividers |
| `rounded-sm` | 2px | **Default for everything** — buttons, cards, inputs, nav links, badges, code blocks, interactive elements |
| `rounded` | 4px | Rarely — only when a slightly softer edge is intentional (e.g., modal dialogs) |
| `rounded-full` | 9999px | **Only** for progress bars, pills, and avatars where the shape is structural |

### 8.2 Rules

- **Never use `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), or `rounded-2xl` (16px).** These are consumer-grade radii that look out of place in a B2B tool.
- The default for any new element is `rounded-sm` (2px). If you're unsure, use `rounded-sm`.
- `rounded-full` is reserved for elements whose identity depends on being circular or pill-shaped.
- When in doubt, prefer sharper. A 0px corner is always acceptable; an 8px corner rarely is.
- **Button `shape` prop:** The `Button` component defaults to `shape="default"` (0px radius). Use `shape="soft"` to opt into the `rounded-sm` (2px) radius when the context calls for a gentler appearance.

### 8.3 Portfolio Website Override

**The portfolio website (yilangao.com) uses zero border-radius on all elements.** The radius scale above applies to the design system generally (playground, other apps), but the main site strips all corner radius as a branding decision. See [`docs/design/branding.md`](branding.md) §1 for the full rule, exceptions, and enforcement checklist.

When working on the portfolio site: ignore the `rounded-sm` default above and use `0` for everything except structural exceptions (avatars, progress bars, toggle switches).

### 8.4 Rationale

B2B products communicate precision, density, and utility. Large corner radii signal friendliness and approachability — appropriate for consumer apps but incongruent with professional tools. The 0–2px range keeps edges crisp while avoiding the harshness of perfectly square corners. The portfolio takes this further with a full zero-radius identity — see branding rationale in §1.4 of the branding reference.
