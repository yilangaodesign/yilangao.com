# Branding Reference — yilangao.com

> Spoke file for `docs/design.md`. Return to the [hub](../design.md) for the Section Index.
>
> **What this file is:** The canonical branding identity reference for the portfolio website (yilangao.com). Every agent working on the main site MUST read this before generating UI, components, or page layouts.
>
> **Scope:** Main site only (`src/app/(frontend)/(site)/`). Does NOT apply to the Playground, ASCII Art Studio, or admin UI.
>
> **Last updated:** 2026-04-10 (initial creation)

---

## 1. Zero Corner Radius

The portfolio website uses **zero border-radius on all elements**. This is a core branding decision, not a component-level detail.

### 1.1 The Rule

| Element | Border-radius | Notes |
|---------|--------------|-------|
| Cards, containers, sections | `0` | No rounding whatsoever |
| Buttons | `0` | Already default (`shape="default"` = 0px) |
| Inputs, textareas, selects | `0` | Override any DS default that adds radius |
| Images, media | `0` | No rounded corners on thumbnails or media |
| Badges | `0` | Use `shape="squared"` — see §1.2 |
| Tooltips, popovers | `0` | Strip any inherited radius |
| Modals, dialogs | `0` | Full sharp corners |
| Code blocks | `0` | No rounding |
| Nav items, links | `0` | No rounding on hover/active states |

### 1.2 Badge Component

The Badge component defaults to `shape="pill"` (fully rounded). **On the portfolio website, always use `shape="squared"`** and ensure the squared variant renders at `0` radius, not `rounded-sm`.

If the Badge `squared` shape currently maps to `var(--portfolio-radius-sm)` (2px), override it to `0` for the portfolio context.

### 1.3 Exceptions

Corner radius is permitted ONLY for elements where the shape is structurally meaningful and removing it would break recognition:

- **Avatars** — circular shape is part of the "avatar" affordance
- **Progress bars** — pill shape communicates fill semantics
- **Toggle switches** — rounded track/thumb is the standard toggle affordance
- **Spinners/loaders** — circular by nature

Everything else: **zero radius, no exceptions**.

### 1.4 Why

Sharp edges communicate precision, intentionality, and a modernist design sensibility. The zero-radius identity distinguishes the portfolio from the soft, rounded aesthetic common in consumer and template-based sites. It signals that every pixel is deliberate.

---

## 2. Enforcement Checklist

When creating or modifying any element on the portfolio website:

1. **Check:** Does this element have border-radius > 0?
2. **Check:** Is it in the exceptions list (§1.3)?
3. **If not excepted:** Set border-radius to 0.
4. **If using Badge:** Pass `shape="squared"` explicitly.
5. **If using Button:** Default `shape="default"` is already correct (0px).
6. **If using a third-party or inherited component:** Override its radius to 0 in the consuming SCSS module.

---

## 3. Future Additions

This file will grow as new branding decisions are established. Potential future sections:

- Color palette overrides specific to the portfolio
- Typography hierarchy for the portfolio
- Motion/animation identity
- Photography and media treatment
- Grid and layout identity

Each section follows the same pattern: state the rule, list exceptions, explain the rationale.
