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
| Main site (`yilangao.com`) | 4000 | 4000 | running | 87471 | `npm run dev` (webpack mode) |
| Playground | 4001 | 4001 | running | 35776 | `npm run playground` (`--webpack`; see ENG-150) |
| ASCII Art Studio | 4002 | 4002 | running | 35777 | `npm run ascii-tool` (`--webpack`; see ENG-150) |

## Key Pages (on main site, no separate server)

| Page | URL | Notes |
|---|---|---|
| Login page (generic) | `http://localhost:4000/for/welcome?preview=true` | Dev-only `?preview=true` bypasses session redirect |
| Login page (themed) | `http://localhost:4000/for/{slug}?preview=true` | Replace `{slug}` with company slug from CMS |

## Change Log

| Timestamp (UTC) | Service | Action | Port | Reason |
|---|---|---|---|---|
| 2026-04-24 17:05 | Main site | restarted | 4000 | User boot up — ports were down; started all three apps. Main site returned HTTP 500 (webpack ENOENT manifests/chunks); `rm -rf .next` alone did not fix. `rm -rf node_modules .next` + `npm install`, fresh `npm run dev`. Verified `curl -L` on `/` and `/for/welcome?preview=true` → 200. Playground and ASCII were already healthy from same session (left running). LISTEN PID 4000: 43332 (4001: 35776, 4002: 35777). |
| 2026-04-24 14:56 | Main site, Playground, ASCII Art Studio | restarted | 4000–4002 | User boot up — 4000/4001 accepted TCP but `curl` timed out (zombie `next-server`); 4002 later hung the same way. SIGKILL listeners on 4000/4001/4002; `rm -rf` `.next`, `playground/.next`, `ascii-tool/.next`; fresh `npm run dev`, `npm run playground`, `npm run ascii-tool`. Verified `-L` on `/` → 200, `/for/welcome?preview=true` → 200, playground `/` → 200, ASCII `/` → 200. LISTEN PIDs: 92481 (4000), 92517 (4001), 94130 (4002). |
| 2026-04-23 15:04 | Main site, ASCII Art Studio | restarted | 4000, 4002 | User boot up — HTTP 500 on main site (followed `/` after redirect) and login preview; HTTP 500 then hung first-byte on ASCII `/` after stale listeners. Identified `next-server` PIDs on 4000/4002, SIGKILL, `rm -rf` root `.next` and `ascii-tool/.next`, fresh `npm run dev` and ASCII `next dev --port 4002 --webpack`. Playground on 4001 already HTTP 200 (left running). Verified HTTP 200 on `/` (redirect chain), `/for/unknown?preview=true`, playground `/`, ASCII `/` (first `/` can block until initial webpack compile completes after Ready). LISTEN PIDs: 34506 (4000), 64704 (4001), 37096 (4002). |
| 2026-04-21 14:20 | Playground | restarted | 4001 | User boot up — playground zombie (PID 81689 accepting TCP but no HTTP response); killed all stale `next dev --port 4001` processes; `rm -rf node_modules && npm install` resolved silent hang during Next.js init; fresh `npm run playground` healthy (HTTP 200). Main site (4000) and ASCII Art Studio (4002) already healthy. |
| 2026-04-20 20:55 | All services | restarted | 4000–4002 | `ERR_EMPTY_RESPONSE` on `/for/test?preview=true` — traced to missing `routes-manifest.json` (ENG-117/EAP-069 recurrence). Webpack accepted connections but returned 0 bytes; ENOENT visible in dev log. Clearing `.next` alone did not fix — `rm -rf node_modules && npm install` resolved it (ENG-134 pattern). Post-reinstall: first request 26s (cold compile + Payload schema pull), repeat requests ~300–500ms, `routes-manifest.json` confirmed present. |
| 2026-04-20 20:37 | Main site | restarted | 4000 | User boot up — prior main-site server stuck at 0.1% CPU on `Compiling /work[slug] ...` for 9+ min after aborted curl probes; SIGKILL + `rm -rf .next` + fresh `npm run dev`. First `/for/[company]` compile took ~3min (webpack dev); subsequent requests ~30s (DB-heavy Payload query). |
| 2026-04-20 20:24 | Playground, ASCII Art Studio | restarted | 4001, 4002 | Collateral kill from a too-broad `pkill next-server` pattern; fresh `npm run playground` / `npm run ascii-tool`; both healthy (HTTP 200 in ~120ms). |
| 2026-04-20 14:05 | Main site, Playground, ASCII Art Studio | started | 4000–4002 | User boot up — ports were free; cleared `.next` for all three apps; fresh `npm run dev` / `npm run playground` / `npm run ascii-tool`; LISTEN PIDs from `lsof` (63380, 63445, 63446). Main site terminal showed `○ Compiling proxy ...` after Ready; verify in browser if first HTTP is slow. |
| 2026-04-17 15:49 | Main site | restarted | 4000 | User-visible old homepage (ENG-151) — deleted shadowing `src/app/(frontend)/{page,HomeClient}.tsx` (v1), cleared `.next`, fresh `npm run dev`; new canonical homepage served from `(frontend)/(site)/page.tsx` |
| 2026-04-17 15:07 | Playground, ASCII Art Studio | restarted | 4001, 4002 | User boot up — prior listeners unhealthy (Turbopack BMI2 panic / hung HTTP); dev scripts aligned with `--webpack`; fresh `npm run playground` / `npm run ascii-tool`; PIDs from `lsof` |
| 2026-04-14 00:11 | Main site, Playground, ASCII Art Studio | started | 4000–4002 | User boot up — nothing listening on 4000–4002; fresh `npm run dev` / `npm run playground` / `npm run ascii-tool`; PIDs from `lsof` |
| 2026-04-11 20:57 | Main site, Playground, ASCII Art Studio | restarted | 4000–4002 | User boot up — listeners on 4000–4002 accepted TCP but HTTP timed out (zombie node); SIGKILL + fresh `npm run dev` / `npm run playground` / `npm run ascii-tool` |
| 2026-04-09 20:35 | Main site | restarted | 4000 | User kill + reboot login page — SIGKILL prior node listener, cleared `.next`, fresh `npm run dev` |
| 2026-04-08 22:06 | Main site | restarted | 4000 | Restarted to pick up next.config.ts images.remotePatterns for next/image optimization |
| 2026-04-08 21:35 | Main site, Playground | started | 4000, 4001 | User boot up — main site had listener on 4000 but HTTP timed out (stuck node 49260); SIGKILL + `npm run dev`; playground was down; `npm run playground`; ASCII already healthy on 4002 |
| 2026-04-08 | All services | restarted | 4000–4002 | Stale server hanging on Payload schema push prompt (company_name column drift); killed all, dropped stale column, cleared .next, fresh start |
| 2026-04-07 | All services | started | 4000–4002 | User boot up — ports not responding; main site, playground, ASCII Art Studio started; PIDs recorded |
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
