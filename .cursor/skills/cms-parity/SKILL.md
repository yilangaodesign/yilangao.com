---
name: cms-parity
description: >-
  CMS-Frontend data parity checklist. Ensures Payload schema, data fetch,
  frontend types, and inline edit fields stay in sync. Use after adding,
  removing, or renaming any CMS field or frontend data field.
---
# Skill: CMS-Frontend Parity

## When to Activate

- After adding a field to a Payload global or collection schema
- After adding a field to a frontend TypeScript type or inline edit fields
- After modifying a `page.tsx` data fetch
- After renaming or changing a field's type
- After removing a field
- After creating a new component that renders CMS data

---

## The Four-Layer Contract

CMS data flows through four layers that form a single contract. All layers must be modified atomically when a field changes.

1. **Schema** — `src/globals/*.ts` or `src/collections/*.ts` (what the Payload admin panel shows)
2. **Data fetch** — `src/app/(frontend)/*/page.tsx` (server component that fetches from CMS and passes to client — MUST include `id`)
3. **UI** — `src/app/(frontend)/*Client.tsx` (TypeScript types, inline edit `*_FIELDS` definitions, rendering)
4. **Inline edit** — Every CMS text field wrapped in `EditableText` when admin, with `EditButton` for full admin access

---

## Parity Checklist

| What you did | What you MUST also do |
|---|---|
| Added a field to a Payload global/collection schema | 1. Add to the `page.tsx` data fetch mapping (incl. `id` and fallbacks). 2. Add to the `*Client.tsx` TypeScript type. 3. Add to the inline edit `*_FIELDS` array. 4. Render in the component. 5. Wrap with `EditableText` when admin. 6. **Restart the dev server.** |
| Added a field to a frontend type or inline edit fields | 1. Add to the Payload schema (`src/globals/` or `src/collections/`). 2. Add to the `page.tsx` data fetch mapping. 3. **Restart the dev server.** |
| Modified the `page.tsx` data fetch | 1. Verify the Payload schema has the field. 2. Verify the client type and inline edit fields match. |
| Renamed or changed a field's type | Update **all four layers** atomically. |
| Removed a field | Remove from all four layers. |
| Created a new component rendering CMS data | 1. Accept `id` and `isAdmin` props. 2. Wrap text fields in `EditableText` when admin. 3. Add `EditButton`. 4. Pass `id` from server fetch. 5. Pass `isAdmin` from parent. |

---

## Inline Edit Wiring (New Components)

When creating any component that renders CMS data:

1. **Accept `id` and `isAdmin` in props** — the server component must pass the document ID.
2. **Make it a client component** (`"use client"`) if it uses `EditableText`.
3. **Wrap every text field** with `EditableText` when `isAdmin && id`:
   - `fieldId`: `{collection}:{id}:{fieldName}`
   - `target`: `{ type: 'collection', slug: '{collection}', id }`
   - `fieldPath`: exact Payload field name
4. **Add `EditButton`** for full admin panel access.
5. **Fall back to plain elements** when not admin.

---

## Verification

After any field change:
```bash
curl -s http://localhost:4000/api/globals/<slug> | python3 -m json.tool
```
Confirm every field in the JSON response matches the frontend TypeScript type.

---

## Critical Rules

1. **Schema changes require a server restart.** Payload pushes schema to the database only on startup.
2. **Inline edit `*_FIELDS` must mirror the schema exactly.**
3. **Fallback data in `page.tsx` must include all fields.**
4. **Never filter on newly-added fields** that have no data yet — see EAP-030.

---

## File Map

| File | Purpose | Read When | Write When |
|------|---------|-----------|------------|
| `src/globals/*.ts` | Payload global schemas | When adding fields | When adding fields |
| `src/collections/*.ts` | Payload collection schemas | When adding fields | When adding fields |
| `src/app/(frontend)/*/page.tsx` | Server data fetch | When verifying parity | When adding field mappings |
| `src/app/(frontend)/*Client.tsx` | Client types + render | When verifying parity | When adding fields |
