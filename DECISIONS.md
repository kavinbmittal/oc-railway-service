# DECISIONS.md

Running log of every hardcoded constant, threshold, limit, and assumption baked into the codebase.

| Date | Area | Decision | Value / Details | Rationale | Review trigger |
|------|------|----------|-----------------|-----------|----------------|
| 2026-06-14 | OpenClaw release pin | Build the Railway image from a released OpenClaw tag instead of upstream `main`. | `OPENCLAW_GIT_REF=v2026.6.6` | Keeps production builds reproducible while picking up the latest stable OpenClaw runtime. | Review on every stable OpenClaw release or if Railway build/runtime schema drifts from the volume-installed CLI. |
| 2026-06-14 | OpenClaw npm runtime entrypoint | Run the wrapper through the released npm package instead of the source-built fallback. | `OPENCLAW_ENTRY=/opt/openclaw-npm/lib/node_modules/openclaw/dist/entry.js` with `openclaw@2026.6.6` installed under `/opt/openclaw-npm`. | The upstream source tag builds but reports stale runtime metadata; the npm package is the validated `2026.6.6` runtime used in production. | Review when upstream source tags and npm package metadata converge, or when bumping OpenClaw again. |
