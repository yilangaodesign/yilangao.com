---
name: boot-up
description: >-
  Boots one or more dev servers from the App Registry (main site, playground,
  ASCII Art Studio). Checks what's already running, starts what's missing,
  waits for HTTP 200, and updates the port registry. Use when the user says
  "boot up", "start servers", "spin up", "fire up", or asks to see a specific
  app on localhost.
---
# Skill: Boot Up

## When to Activate

- User says **"boot up"**, "start servers", "spin up", "fire up"
- User says they "can't see" or "can't access" an app on localhost
- User asks to open / view a specific app locally

## Scope Selection

| User says | Scope |
|-----------|-------|
| "boot up" (no qualifier) | All 3 apps + login page |
| "boot up the playground" / "boot up the design system" | Playground only |
| "boot up the site" / "boot up the main site" | Main site only |
| "boot up ascii" / "boot up the ascii tool" | ASCII Art Studio only |
| "boot up the login page" / "I need to see the login page" | Main site + login page confirmation |
| "I can't see X on localhost" | Infer the app from context |

## App Registry (quick reference)

| App | Port | Script | Health URL |
|-----|------|--------|------------|
| Main site | 4000 | `npm run dev` | `http://127.0.0.1:4000/` |
| Playground | 4001 | `npm run playground` | `http://127.0.0.1:4001/` |
| ASCII Art Studio | 4002 | `npm run ascii-tool` | `http://127.0.0.1:4002/` |

## Key Pages (non-server, part of main site)

| Page | URL | Notes |
|------|-----|-------|
| Login page (generic) | `http://localhost:4000/for/unknown?preview=true` | `?preview=true` bypasses session redirect in dev — without it, authenticated users get redirected to `/` |
| Login page (company-themed) | `http://localhost:4000/for/{slug}?preview=true` | Replace `{slug}` with any company slug from the Companies collection |

The login page is a route on the main site, not a separate server. It requires the
main site to be running on port 4000. The `?preview=true` query param is a dev-only
bypass (`NODE_ENV === "development"`) added in `src/app/(frontend)/for/[company]/page.tsx`
so the page can be viewed even when the user already has a valid session cookie.

Source of truth: AGENTS.md → App Registry. If a new app appears there, add it
to this table.

## Procedure

For **each app in scope**, run these steps. Independent apps can be checked
and started in parallel.

### Step 1 — Probe

Check if the app is actually responding (the port registry may be stale):

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:<PORT>/ 2>/dev/null
```

- **HTTP 200** → App is healthy. Skip to Step 4 (update registry if PID changed).
- **Any other result** → Proceed to Step 2.

### Step 2 — Clear port conflict (if needed)

```bash
lsof -i :<PORT> 2>/dev/null
```

If something unexpected is occupying the port, identify it and ask the user
before killing it. Never kill unknown processes silently.

### Step 3 — Start

```bash
npm run <script>
```

Run with `block_until_ms: 0` (background immediately).

Then poll for readiness — up to 30 seconds:

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:<PORT>/
```

If the server doesn't respond within 30 s, read the terminal output for errors
and report them to the user.

### Step 4 — Update port registry

1. Get the listening PID:
   ```bash
   lsof -i :<PORT> -sTCP:LISTEN
   ```
2. Update `docs/port-registry.md`:
   - Set `Current Port`, `Status` → `running`, `PID` → new PID
   - Append a Change Log entry with UTC timestamp, action (`started` or
     `already running`), and reason

### Step 5 — Report

Tell the user which apps are now running and give clickable localhost URLs.
If any app failed to start, explain why.

**Always include the login page URL** when the main site is in scope:
- Generic: `http://localhost:4000/for/unknown?preview=true`
- Company-themed: `http://localhost:4000/for/{slug}?preview=true`

The login page doesn't need its own startup — it's a route on the main site.
But agents must always confirm it's accessible (HTTP 200 on the preview URL)
and include the URL in the report so the user can reach it without asking.

## Error Recovery

| Failure | Action |
|---------|--------|
| Port occupied by unknown process | Show `lsof` output, ask user |
| Server crashes on start | Read terminal output, diagnose, report |
| HTTP 200 never arrives | Read terminal for compilation errors; common cause is missing `.env` or stale `.next` cache — try `rm -rf <app>/.next` and restart |
| Port registry is missing | Create the file with the standard template from `docs/port-registry.md` |
