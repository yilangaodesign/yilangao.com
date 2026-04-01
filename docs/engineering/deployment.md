# §13 — Deployment Verification

> **Read when:** deploying, checking Vercel status, diagnosing build failures

## Vercel Project Mapping

| App | Vercel Project | Root Directory | Production Branch |
|-----|---------------|----------------|-------------------|
| Playground | `yilangao-design-system` | `playground` | `main` |

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
