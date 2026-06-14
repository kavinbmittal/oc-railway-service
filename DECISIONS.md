# DECISIONS.md

Running log of every hardcoded constant, threshold, limit, and assumption baked into the codebase.

| Date | Area | Decision | Value / Details | Rationale | Review trigger |
|------|------|----------|-----------------|-----------|----------------|
| 2026-06-14 | OpenClaw release pin | Build the Railway image from a released OpenClaw tag instead of upstream `main`. | `OPENCLAW_GIT_REF=v2026.6.6` | Keeps production builds reproducible while picking up the latest stable OpenClaw runtime. | Review on every stable OpenClaw release or if Railway build/runtime schema drifts from the volume-installed CLI. |
