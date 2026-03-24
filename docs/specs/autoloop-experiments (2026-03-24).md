# Autoloop Experiments — Self-Executing Experiment System

Date: 2026-03-24
Status: Shipped

## What This Means for Users

When Kavin approves an experiment, the agent just runs it — no second ask, no issue creation, no "should I proceed?" The agent validates it has the right tools, starts executing on cadence, and keeps iterating until it makes a terminal decision (kill or scale). Kavin sees tool readiness at approval time and gets inbox notifications on every decision.

## Problem

Agents were proposing experiments, getting approval, then creating follow-up issues asking for permission to execute. The approval WAS the permission. Additionally, agents could propose experiments requiring tools they didn't have or couldn't measure with, leading to approved experiments that couldn't actually run.

## Approach: Merged Protocol with Three Additions

Merged `autoresearch.md` into `experiments.md` as the single canonical protocol. Added three capabilities inspired by Karpathy's autoresearch system:

### 1. Required Tools with Three-Check Validation

Each experiment's `program.md` declares required tools with both execute AND measure capabilities. Each tool is validated against three sources:

- Agent's own `TOOLS.md` — "do I have this tool and know how to use it?"
- `shared/tools/registry.md` — "is the tool currently working?"
- `shared/tools/<tool>.md` — "does the tool doc describe how to measure results?"

Agents can propose with unchecked tools (`[ ]`). Kavin resolves tooling gaps. Experiment can't be approved until all tools are `[x]`.

### 2. Sacred Eval Harness

Every experiment defines an immutable measurement function — the equivalent of Karpathy's `evaluate_bpb`. For growth: UTM attribution queries. For ML: test suite. For ops: monitoring metrics. If you change the eval, you start a new experiment.

### 3. Never Stop + Auto-Execute

Approval = go. Agent picks up approved experiments on next heartbeat and begins execution. No stopping between cycles. The loop runs until a terminal decision.

## What Changed

### Protocol (Railway volume — `shared/protocols/`)
- `experiments.md` — merged version with all rules (was two overlapping files)
- `autoresearch.md` — now a redirect pointing to `experiments.md`

### Dashboard (this repo — `stuttgart-v2/`)
- `src/server.js` — parses `## Required Tools` from program.md, returns `required_tools` array
- `src/components/ApprovalDetail.jsx` — renders tool checklist, blocks approve when tools are missing
- Status derivation updated to include `pause` state

### program.md Format Changes
- Added `## Required Tools` section (between Proxy Metrics and Program)
- Added `### Eval Harness` subsection (replaces old Evaluation section)
- Removed `## Status` and `## Status Log` — status derived from results.tsv decisions only

## Key Decisions

| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Tool validation owner | Agent self-validates | Gateway validates | No platform code changes needed |
| Approval pickup | Heartbeat (existing cadence) | Gateway callback | Simpler, no new infrastructure |
| Protocol files | Merged into one | Keep two separate | 80% overlap was causing drift |
| Unchecked tools in proposals | Allowed | Hard-blocked | Kavin wants to see the full plan and decide what to unblock |
| Pause as decision value | Added | Agent just stops | Makes tool failures visible in dashboard |
| Eval harness immutability | Enforced (new rule) | Advisory | Changing eval mid-experiment invalidates data |

## Out of Scope (Deferred)

- ExperimentDetail page showing Required Tools (S — needs this spec first)
- Per-tool `## How to Execute` / `## How to Measure` sections in `shared/tools/*.md` (Kavin owns)
- Gateway-level tool validation (Option B — not needed while agent self-validation works)
