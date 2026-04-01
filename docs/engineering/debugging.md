# Debugging Methodology

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

## 4.1 Diagnose Before You Patch

When something "doesn't work," the root cause is usually one of:
1. **Data sync issue** — the UI reads from a different source than what was modified.
2. **Process issue** — the server isn't running, crashed, or is on a different port.
3. **Build issue** — the change isn't being picked up by the bundler.
4. **Architecture issue** — the system design makes the failure possible.

Check in this order. Don't skip to "add more code" before verifying the fundamentals.

## 4.2 Incident Response

When a user reports something broken:
1. **Reproduce first** — curl the URL, check the terminal, read error output.
2. **Check the obvious** — is the server running? Is it the right port? Did the file save?
3. **Check data flow** — trace from source file → build → server → browser.
4. **Fix and verify** — make the fix, verify on localhost, document in the engineering feedback log.
