# edra-challenge

Standalone Next.js app — design challenge submission for Edra.

## Challenge Brief & Design Docs

See [`../docs/edra/`](../docs/edra/) for the challenge brief, design specs, and all Edra-specific reference materials.

## Dev

```bash
# From monorepo root:
npm run edra-challenge

# Or from this directory:
npm run dev
```

Runs on **http://localhost:4003**.

## Design System Access

This app imports from the Élan Design System via path aliases:

| Alias | Resolves to |
|-------|------------|
| `@ds/*` | `../src/components/ui/*` |
| `@site/*` | `../src/components/*` |
| `@lib/*` | `../src/lib/*` |
| `@hooks/*` | `../src/hooks/*` |

Example:
```tsx
import { FadeIn } from "@ds/FadeIn";
import { Button } from "@ds/Button";
```
