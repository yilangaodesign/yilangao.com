# Port Management

> Spoke file for `docs/engineering.md`. Return to the [hub](../engineering.md) for the Section Index.

**Severity: Critical** — Port conflicts waste time and can kill running services.

## 2.1 Port Assignments

All dev servers use ports in the **4000–5000** range. The canonical ledger is `docs/port-registry.md`.

| Service | Default Port |
|---------|-------------|
| Main site (yilangao.com) | 4000 |
| Playground (design system) | 4001 |

## 2.2 Protocol

1. **Before starting a server:** Read `docs/port-registry.md`. Check if the port is already in use.
2. **Never `kill -9` a port** without first checking what process owns it and whether it's needed.
3. **Never use ports below 4000** — they may belong to other projects on the machine.
4. **After starting/stopping:** Update the port registry ledger.

## 2.3 When Ports Conflict

If the default port is occupied:
1. Check what's running: `lsof -i :4001 -P -n`
2. If it's a stale process, kill it and restart on the default port.
3. If it's a legitimate process, pick the next free port in 4000–5000.
4. Log the temporary port in the registry with a reason.
