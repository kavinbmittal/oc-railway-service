# OpenClaw Railway Runtime

This is the deployable runtime inside the `kbm-oc-workspace` monorepo. It packages the OpenClaw gateway, setup flow, wrapper API, plugins, and Mission Control into one Railway image.

Agent workspaces, protocols, memory, and project data do not live here. They remain at the monorepo root and on the existing `/data/.openclaw` Railway volume.

## Local development

From the repository root:

```bash
./scripts/oc setup
./scripts/oc check
./scripts/oc dashboard
```

The dashboard uses the Conductor-assigned port when available. The full wrapper expects production-like OpenClaw state and should be exercised through its tests or an isolated state directory, never against the live volume from a local workspace.

## Production deployment

Railway is configured with:

- Root directory: `/platform/railway`
- Config file: `/platform/railway/railway.toml`
- Watch path: `/platform/railway/**`
- Health check: `/setup/healthz`
- Persistent volume: `/data`

Merging a change in this directory triggers a Railway build. A successful deploy requires both the wrapper and the real OpenClaw gateway to become ready.

## Runtime model

```text
Railway starts wrapper on $PORT
  -> wrapper reads /data/.openclaw/openclaw.json
  -> wrapper starts the pinned OpenClaw npm runtime on 127.0.0.1:18789
  -> /setup/healthz turns healthy only when the gateway is reachable
  -> wrapper serves Mission Control at /mc/ and proxies gateway traffic
```

The current runtime pin and maintenance procedure are documented in `docs/technical/openclaw-runtime.md`. Repository ownership and cross-system release order are documented in `../../docs/technical/repository-layout.md`.
