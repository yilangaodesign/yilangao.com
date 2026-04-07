# Port Registry (Live Ledger)

> **This file is the single source of truth for all localhost ports used by this
> project.** Agents MUST read this file before starting any server and MUST
> update it after every port change.

## Rules

- All services in this project use ports **4000–5000**. Ports outside this range are off-limits.
- Each service has a **default port**. Always use the default unless it is unavailable.
- If a default port is occupied, pick the next available port in range, start the service there, and update this ledger with `status: temporary` and a reason.
- When the temporary reason is resolved, move back to the default port and update the ledger.

## Agent Protocol

1. **Before starting any server:** Read this file to check the service's default port and current state.
2. **After starting a server:** Update the table — set `Current Port`, `Status` to `running`, record the `PID`, and append a Change Log entry.
3. **After stopping a server:** Update the table — set `Current Port` to `—`, `Status` to `stopped`, clear the `PID`, and append a Change Log entry.
4. **NEVER** start a server on a port outside 4000–5000.
5. **NEVER** kill processes on ports outside 4000–5000 unless explicitly asked.

## Active Services

| Service | Default Port | Current Port | Status | PID | Notes |
|---|---|---|---|---|---|
| Main site (`yilangao.com`) | 4000 | 4000 | running | 3264 | `npm run dev` (webpack mode) |
| Playground | 4001 | 4001 | running | 3280 | `npm run playground` |
| ASCII Art Studio | 4002 | 4002 | running | 3313 | `npm run ascii-tool` |

## Key Pages (on main site, no separate server)

| Page | URL | Notes |
|---|---|---|
| Login page (generic) | `http://localhost:4000/for/unknown?preview=true` | Dev-only `?preview=true` bypasses session redirect |
| Login page (themed) | `http://localhost:4000/for/{slug}?preview=true` | Replace `{slug}` with company slug from CMS |

## Change Log

| Timestamp (UTC) | Service | Action | Port | Reason |
|---|---|---|---|---|
| 2026-04-06 | All services | started | 4000–4002 | User boot up — nothing listening; main site, playground, ASCII Art Studio started; PIDs recorded |
| 2026-04-06 | Main site | restarted | 4000 | Session boot — stale server returning 500, killed + cleared .next + fresh start |
| 2026-04-04 20:11 | Main site | restarted | 4000 | Switched to webpack bundler — Turbopack 16.2.1 missing routes-manifest.json breaks dynamic routes (ENG-117) |
| 2026-04-04 20:06 | All services | restarted | 4000–4002 | Killed stale zombie servers (accepting TCP but not HTTP), cleared .next caches, fresh start — ENG-116 |
| 2026-04-04 20:03 | All services | already running | 4000–4002 | User boot up — TCP listeners on default ports; PIDs refreshed for playground + ASCII |
| 2026-04-04 05:18 | Main site | already running | 4000 | User boot portfolio — healthy on 4000 (PID refreshed in ledger) |
| 2026-04-03 03:01 | Playground | started | 4001 | User boot — port was not serving (ledger stale) |
| 2026-04-01 13:42 | Main site | started | 4000 | Session boot — nothing listening on 4000 |
| 2026-04-01 13:42 | Playground | started | 4001 | Session boot — nothing listening on 4001; ENG-077 token fix + restart |
| 2026-03-29 01:30 | Main site | started | 4000 | Fresh start after cleanup |
| 2026-03-29 16:48 | Main site | restarted | 4000 | Restarted with real Supabase DATABASE_URL (pooler) |
| 2026-03-29 21:25 | Main site | restarted | 4000 | Restarted to sync Payload schema (period field on teams) |
| 2026-03-29 22:00 | Main site | restarted | 4000 | Restarted to sync Payload schema (removed required on socialLinks.href) |
| 2026-03-29 22:30 | Main site | restarted | 4000 | Restarted to pick up transpilePackages in next.config.ts (ScrollSpy DS migration) |
| 2026-03-30 02:00 | Main site | restarted | 4000 | Restarted to pick up admin NavPages, collection groups, and ViewSiteLink rename |
| 2026-03-30 02:37 | Main site | restarted | 4000 | Cleared .next cache to fix Turbopack module resolution error on isAdminAuthenticated |
| 2026-03-30 05:15 | Main site | restarted | 4000 | Restarted for DAG rebuild + accessibility changes in elan-visuals |
| 2026-03-30 05:47 | Main site | restarted | 4000 | Restarted to pick up @payloadcms/storage-s3 plugin (Supabase Storage) |
| 2026-03-30 04:14 | ASCII Art Studio | started | 4002 | First boot after scaffold |
| 2026-03-30 09:15 | Main site | restarted | 4000 | Restarted to sync Payload schema (testimonial text: textarea → richText) |
| 2026-03-30 | Main site | restarted | 4000 | Cleared .next cache to fix stale HeroUploadZone hydration mismatch (ENG-067) |
| 2026-04-01 | ASCII Art Studio | started | 4002 | Session boot — port was free |
| 2026-04-01 | Playground | restarted | 4001 | Restarted to pick up ds-tokens.scss (design system CSS custom property import) |
| 2026-04-01 | Playground | restarted | 4001 | Restarted for inverse/always taxonomy fix (new tokens + SCSS changes) |
| 2026-04-01 | Playground | restarted | 4001 | Cleared .next + restarted — Turbopack HMR failed to push button page edit to browser (ENG-085) |
| 2026-04-01 | Playground | restarted | 4001 | Cleared .next + restarted — ThemeProvider hydration fix (ENG-086) |
| 2026-04-01 | Playground | restarted | 4001 | Cleared .next + restarted — stale HMR after adding md button size + updating Lg/Xl gaps/padding |
| 2026-04-03 | Playground | restarted | 4001 | Cleared .next + restarted — typography hierarchy + colors page IA/layout restructure |
| 2026-04-03 | Playground | restarted | 4001 | Cleared .next + restarted — Checkbox forceMount + transition fix |
| 2026-04-03 | Playground | restarted | 4001 | Cleared .next + restarted — Checkbox bypass Radix Indicator, icons direct in Root with opacity toggle |
| 2026-04-04 | Playground | restarted | 4001 | Cleared .next + restarted — logo dark mode fix (mask-image technique) |
