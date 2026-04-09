# CLAUDE.md — Mission Control (Cuzco)
Follows the global guidelines in `~/.claude/CLAUDE.md`.

## Project Overview
Mission Control is an ops dashboard for managing AI agent teams. It tracks projects, budgets, approvals, agent activity, costs, and organizational structure. Single operator (Kavin), desktop-first, dark mode only.

## Architecture

Mission Control is **separate from the OpenClaw gateway's built-in control UI.** They are two different apps:

- **Gateway control UI:** Built into the gateway at `/openclaw/dist/control-ui/`. Admin panel for the OpenClaw platform. Not ours.
- **Mission Control:** Vite + React SPA in `dashboard/`. Served by `src/server.js` at `/mc/`.

### How it deploys

The dashboard is **baked into the Docker image**. No manual SSH copying.

1. `dashboard/` contains the Vite + React source
2. `Dockerfile` copies `dashboard/dist` into the image
3. `src/server.js` serves it via `express.static(DASHBOARD_DIR)` at `/mc/`
4. Railway auto-deploys from this GitHub repo on every push to main

**DASHBOARD_DIR** (server.js line 1436): resolves to `../dashboard/dist` relative to server.js (inside Docker), falls back to `STATE_DIR/dashboard/dist` (Railway volume).

**NEVER copy dist files to Railway via SSH.** Push to main → Railway rebuilds → dashboard deploys automatically.

### What lives where

| Component | Location | Deploys via |
|-----------|----------|-------------|
| Dashboard frontend | `dashboard/dist` in Docker image | Push to main → Railway auto-deploy |
| API endpoints | `src/server.js` in Docker image | Push to main → Railway auto-deploy |
| Agent data (projects, issues, standups) | `/data/.openclaw/` Railway volume | Agents write directly; `oc-sync` for protocol updates |
| Agent protocols | `/data/.openclaw/shared/protocols/` | `oc-sync` (pulls from `kbm-oc-workspace` repo) |

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In review mode, flag any code that doesn't match DESIGN.md.
