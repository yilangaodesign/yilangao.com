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
| Main site (`yilangao.com`) | 4000 | 4000 | running | 36219 | `npm run dev` |
| Playground | 4001 | 4001 | running | 42675 | `npm run playground` |

## Change Log

| Timestamp (UTC) | Service | Action | Port | Reason |
|---|---|---|---|---|
| 2026-03-29 01:30 | Main site | started | 4000 | Fresh start after cleanup |
