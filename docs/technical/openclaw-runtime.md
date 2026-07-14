# OpenClaw Runtime

The Railway service runs a wrapper web server and a baked OpenClaw gateway from the Docker image.

Current source fallback pin: `OPENCLAW_GIT_REF=v2026.7.1`.

Current runtime entrypoint: `OPENCLAW_ENTRY=/opt/openclaw-npm/lib/node_modules/openclaw/dist/entry.js`, installed from `openclaw@2026.7.1`.

The build and runtime stages use `node:24.15.0-bookworm`, the minimum supported Node 24 release for OpenClaw v2026.7.1.

Runtime order:

```text
Railway starts wrapper on $PORT
  -> wrapper reads /data/.openclaw/openclaw.json
  -> wrapper syncs gateway auth tokens
  -> wrapper starts the baked OpenClaw gateway on 127.0.0.1:18789
  -> wrapper proxies /, /openclaw, and WebSocket traffic to the gateway
```

The `/data` volume can contain user-installed CLI packages, but production gateway behavior comes from the baked image default entrypoint. A volume-level `openclaw update` is not enough to upgrade the running gateway; bump the Docker image runtime package and redeploy.
