<!-- graph metadata for docs knowledge graph (see docs/knowledge-graph.md) -->
---
type: spoke
id: engineering-deployment
topics:
  - engineering
  - release
derivedFrom:
  - engineering.md
---

# §13 — Deployment Verification

> **Read when:** deploying, checking Vercel status, diagnosing build failures, configuring domains

## Vercel Project Mapping

| App | Vercel Project | Root Directory | Production Branch | Production URL |
|-----|---------------|----------------|-------------------|----------------|
| Main site | `yilangao-portfolio` | `.` | `main` | `new.yilangao.com` (interim) → `yilangao.com` (final) |
| Playground | `yilangao-design-system` | `playground` | `main` | — |

**Note:** `.vercel/project.json` at repo root links to the Playground project, not the main site.

## Domain & DNS Configuration

| Record | Type | Name | Target | Proxy | Purpose |
|--------|------|------|--------|-------|---------|
| Main site (interim) | CNAME | `new` | `cname.vercel-dns.com` | DNS-only (grey cloud) | Routes `new.yilangao.com` to Vercel |
| Root (current) | A | `@` | Cloudflare IPs | Proxied (orange cloud) | 301 redirect to Figma prototype |

**DNS provider:** Cloudflare (nameservers: `curt.ns.cloudflare.com`, `emerie.ns.cloudflare.com`)

The `new` subdomain CNAME MUST be grey cloud (DNS-only) so Vercel can provision and
manage its own SSL certificate. If the orange cloud is enabled, Cloudflare's proxy
intercepts TLS and blocks Vercel's ACME challenge.

**Future cutover:** When ready to replace the Figma prototype, delete the Cloudflare
redirect rule on the root domain, point `@` to Vercel (`cname.vercel-dns.com` or
A record `76.76.21.21`), and add `yilangao.com` as a domain in the Vercel project.

## Environment Variables (Main Site)

| Variable | Source | Notes |
|----------|--------|-------|
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection string | Pooler URI recommended |
| `PAYLOAD_SECRET` | Random secret string | Must match across deploys |
| `NEXT_PUBLIC_SITE_URL` | `https://new.yilangao.com` | Update to `https://yilangao.com` on cutover |
| `NEXT_PUBLIC_PAYLOAD_URL` | `https://new.yilangao.com` | Update to `https://yilangao.com` on cutover |
| `S3_ACCESS_KEY_ID` | Supabase Dashboard → Settings → Storage → S3 Connection | |
| `S3_SECRET_ACCESS_KEY` | Supabase Dashboard → Settings → Storage → S3 Connection | |
| `S3_BUCKET` | Supabase Dashboard → Settings → Storage → S3 Connection | |
| `S3_ENDPOINT` | Supabase Dashboard → Settings → Storage → S3 Connection | |
| `S3_REGION` | Supabase Dashboard → Settings → Storage → S3 Connection | |
| `SESSION_SECRET` | Random hex string (`openssl rand -hex 32`) | Signs the password gate session cookie. Falls back to `PAYLOAD_SECRET` if not set, but a separate secret is recommended. |
| `SITE_PASSWORD` | Chosen password string | Fallback password for `/for/welcome` (generic login with no company branding). Defaults to `glad you are here` if not set. Password comparison is normalized (case-insensitive, separator-agnostic, contraction-expanded) - see `company-session.ts`. |

Do NOT set `PAYLOAD_ADMIN_EMAIL` or `PAYLOAD_ADMIN_PASSWORD` in production — those
enable auto-login and are for local development only.

**Password gate note:** `src/proxy.ts` must be present for the password gate to function.
If removed, all pages become publicly accessible. See `docs/architecture.md` §4.1.

**Shared infrastructure:** Production and dev share the same Supabase database and
S3 storage bucket. CMS edits and media uploads in either environment are visible in both.

## CLI Tools Available

Both `gh` (GitHub CLI) and `vercel` (Vercel CLI) are authenticated locally.

### Check deployment status

```bash
vercel ls --prod                    # List recent production deployments
vercel inspect <deploy-url>         # Get deployment details (status, error, timing)
```

### Read build logs (when deployment fails)

```bash
TOKEN=$(python3 -c "import json; print(json.load(open('$HOME/Library/Application Support/com.vercel.cli/auth.json'))['token'])")
DEPLOY_ID="dpl_XXXX"  # from vercel inspect or vercel ls

curl -s -H "Authorization: Bearer $TOKEN" \
  "https://api.vercel.com/v2/deployments/$DEPLOY_ID/events?direction=backward&limit=200&builds=1" \
  | python3 -c "
import json, sys
for event in reversed(json.load(sys.stdin)):
    text = event.get('payload',{}).get('text','') if isinstance(event.get('payload'), dict) else ''
    if text.strip(): print(text.rstrip())
"
```

### Trigger a redeploy

```bash
# Simplest: push to main triggers auto-deploy
git push origin main

# Manual redeploy via API (uses latest main commit):
TOKEN=... PROJECT_ID=...
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments" \
  -d '{"name":"yilangao-design-system","target":"production","gitSource":{"type":"github","ref":"main","repoId":1170063978,"org":"yilangaodesign","repo":"yilangao.com"}}'
```

### Check GitHub deployment status

```bash
gh api repos/yilangaodesign/yilangao.com/deployments --jq '.[0:3] | .[] | {environment, ref, created_at, description}'
```

## Vercel Install Command

The playground project uses a custom install command because `@ds/*` imports reference
files in `../src/` that depend on packages from the root `package.json`. Turbopack
resolves modules relative to each file's location, so `node_modules/` must exist at
the repo root for out-of-tree source files.

```
installCommand: "npm install && cd .. && npm install --omit=dev"
```

This is configured via the Vercel project settings API, not in `vercel.json`.

## Common Build Failure Patterns

| Pattern | Cause | Fix |
|---------|-------|-----|
| `Module not found: Can't resolve 'X'` in `src/components/ui/` | Package X is imported by a design system component but missing from `playground/package.json` | Add the package to `playground/package.json` |
| TypeScript errors in `src/` files | Type mismatch between component props and HTML attribute types | Fix the type in the source component |
| `prebuild` script fails | `sync-tokens.mjs` can't find SCSS source files | Check `src/styles/tokens/` exists and has valid SCSS |

## Build Gate (Checkpoint Prerequisite)

Before every merge to `main`, run all builds locally:

```bash
npm run build --prefix playground   # Playground (Vercel-deployed)
npm run build                       # Main site
npm run build --prefix ascii-tool   # ASCII Art Studio
```

This is step 3 of the Checkpoint Procedure in `.cursor/skills/checkpoint/SKILL.md`.
If any build fails, do NOT merge to main.
