# OpenClaw Runtime

The Railway service runs a wrapper web server and a baked OpenClaw gateway from the Docker image.

Current runtime pin: `OPENCLAW_NPM_VERSION=2026.7.1`.

Current runtime entrypoint: `OPENCLAW_ENTRY=/opt/openclaw-npm/lib/node_modules/openclaw/dist/entry.js`, installed from the released npm package. There is no source-built fallback: the v2026.7.1 source workspace enforces a minimum release age for new dependencies and can reject a same-day stable release even when its npm runtime is valid.

The build and runtime stages use `node:24.15.0-bookworm`, the minimum supported Node 24 release for OpenClaw v2026.7.1.

Runtime order:

```text
Railway starts wrapper on $PORT
  -> wrapper reads /data/.openclaw/openclaw.json
  -> wrapper compares gateway auth tokens and writes only stale values
  -> wrapper starts the pinned OpenClaw npm gateway on 127.0.0.1:18789
  -> wrapper blocks proxied traffic while startup migrations run
  -> Railway health turns green only after the gateway port is reachable
  -> wrapper proxies /, /openclaw, and WebSocket traffic to the gateway
```

Gateway startup is allowed up to 240 seconds because OpenClaw may migrate durable SQLite state before opening its listener. During that window HTTP proxy requests return 503 and WebSocket upgrades are rejected, preventing a reconnecting browser from starting a second gateway against the same state. A configured `/setup/healthz` also returns 503 until the gateway is reachable.

For migrations that cannot finish inside Railway's deployment health window, set `OPENCLAW_MAINTENANCE=1`. The wrapper stays healthy but does not launch or proxy to the gateway, allowing one operator-run `openclaw doctor --fix --non-interactive` process to own the mounted state. Remove the variable and redeploy after the migration completes.

The `/data` volume can contain user-installed CLI packages, but production gateway behavior comes from the baked image default entrypoint. A volume-level `openclaw update` is not enough to upgrade the running gateway; bump the Docker image runtime package and redeploy.
