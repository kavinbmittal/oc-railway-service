# CLAUDE.md — OpenClaw Railway Runtime
Follows the repository rules in `../../CLAUDE.md` and the global guidelines in `~/.claude/CLAUDE.md`.

## Purpose

This directory contains the deployable Railway service: the pinned OpenClaw runtime, wrapper server, setup flow, plugins, and Mission Control.

It never owns agent workspaces or durable project data. Those live at the repository root and on the `/data/.openclaw` production volume.

## Components

| Area | Location | Production path |
|---|---|---|
| Wrapper and Mission Control API | `src/` | Baked into the Railway image |
| Mission Control frontend | `dashboard/` | Built to `dashboard/dist` and baked into the image |
| OpenClaw runtime and plugins | `Dockerfile`, `plugins/` | Baked into the Railway image |
| Deployment configuration | `railway.toml` | Read by Railway from `/platform/railway/railway.toml` |
| Durable agent state | `/data/.openclaw` | Existing Railway volume; never copied into this directory |

## Required workflow

Run `../../scripts/oc check` before opening a PR. Changes here deploy only after merge to `main`, and Railway must be configured with root directory `/platform/railway` and watch path `/platform/railway/**`.

For changes that also alter agent configuration, deploy and verify backward-compatible runtime support before syncing the agent files.

Never copy dashboard assets to Railway over SSH. Never add `shared/`, `agents/`, or `workspace*/` fixtures here; test fixtures belong under `test/fixtures/`.

## Design

Read `DESIGN.md` before visual changes. Mission Control is a Vite + React SPA served by the wrapper at `/mc/`; it is separate from OpenClaw's built-in control UI.
