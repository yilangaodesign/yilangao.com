# Localhost Verification

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Severity: Critical** — Failing to verify on localhost was the root cause of the playground drift incident (ENG-001).

## 1.1 Before Any Work

- Verify the relevant dev server is running and responding.
- Never assume a dev server is still running from a previous session — check the terminal or `lsof`.
- If the server is down, start it before making code changes.

## 1.2 After Any Change

- After modifying tokens, components, or pages: verify the page loads on localhost.
- After modifying data files: verify the data renders in the UI.
- After modifying build config: verify the build completes and the server restarts.

## 1.3 Verification Commands

```bash
# Check if a port is responding
curl -sI http://localhost:4000 | head -1

# Check all running Node.js servers
lsof -i -P -n | grep LISTEN | grep node

# Check specific port
lsof -i :4000 -P -n | grep LISTEN
```
