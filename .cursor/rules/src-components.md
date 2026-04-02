---
globs: src/components/**
---

# Design System Source — Playground Delivery Gate

Files in `src/components/` are imported by the playground via `@ds/*` aliases. Turbopack HMR does not reliably deliver these changes to the playground.

**If the playground server is running**, you MUST flush and restart it after editing any file in this directory — BEFORE responding to the user. See `AGENTS.md` Mid-Flight Verification Gate for the full protocol:

1. Kill: `lsof -ti :4001 | xargs kill -9`
2. Clear: `rm -rf playground/.next`
3. Restart: `npm run playground` (background)
4. Wait + verify via curl

This also applies when editing `src/styles/` files consumed by the playground.
