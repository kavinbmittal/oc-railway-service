# Issue Cost Governance

## What This Means for Users

When an agent proposes an issue, you see what model tier it picked and what it estimates the task will cost — right in the approval card. You can approve as-is, or request revision to change the tier or budget. Once the task is running, if it hits 100% of its budget, the agent pauses and a budget approval appears in your inbox. If the task finishes within 60 seconds of hitting the cap, the approval auto-resolves and you never see it. After the task completes, the issue detail shows actual cost next to the original estimate.

## Problem

Agents propose issues, you approve them, and they run — with no visibility into cost before approval and no guardrails during execution. An agent burned $900 on a single task because nothing stopped it. There's no way to see what model an issue will run on before approving, no cost estimate, and no budget cap.

## Approach

Three layers of cost control, each addressing a different phase:

1. **Pre-approval visibility** — proposed issues must include model tier + cost estimate
2. **Runtime budget enforcement** — agent pauses at 100% of budget, sends approval
3. **Post-run cost attribution** — actual cost shown on completed issues

## In Scope

### Dashboard
- Model tier and cost estimate fields on proposed issues
- Tier and estimate visible in approval cards (editable via request revision)
- Warning badge on proposals missing an estimate
- Budget field on issues (set by agent at proposal time, editable by Kavin)
- Budget approval card type with Continue/Stop actions
- Actual cost displayed on issue detail after completion
- Estimated vs actual comparison on completed issues

### Agent Protocol (Railway — required for this feature to work)
- Agents must include `estimated_cost` and `complexity` in every issue proposal
- Lead agents track sub-agent token usage per issue (sum input + output tokens × model price)
- Lead agents write `actual_cost` to issue JSON when sub-agent session ends
- At each step boundary, agent checks spend against `budget` field
- If budget exceeded: agent pauses, writes `budget_status: "exceeded"`, creates budget approval JSON in `shared/projects/{slug}/approvals/pending/`
- On "Continue" approval: agent resumes, no further cap
- On "Stop" approval: agent wraps up, writes partial results, marks issue blocked
- Token-to-dollar conversion uses per-model pricing (Opus: $15/$75 per 1M in/out, Sonnet: $3/$15, Haiku: $0.80/$4)

## Out of Scope

- Default budgets per tier (agents estimate per-task)
- Live cost ticker on running issues (v2)
- Historical cost averages / system-calculated estimates (v2)
- Project-level budget rollup and auto-pausing (exists separately in budget management)
- Escalation-triggered budget approvals (v2 — tied to escalation feature)

## Design

### Proposed Issue Approval Card

The approval card for a proposed issue gains two new fields:

- **Model Tier** — the tier the agent selected (e.g. "Analyst"). Shown as a badge.
- **Estimated Cost** — dollar amount the agent estimates (e.g. "$8.50"). Shown next to the tier.

If either is missing, the dashboard shows a "No estimate" warning badge on the approval card. The agent protocol requires both fields — enforcement is at the protocol level, not the API, since agents write proposals as JSON files to the volume (no request/response cycle). The dashboard handles missing fields defensively.

When Kavin requests revision, feedback can include tier or budget changes: "Bump to Operator, cap at $5."

### Issue Schema Changes

New fields on the issue JSON:

- `estimated_cost` (number, required on proposals) — agent's cost estimate in dollars
- `budget` (number) — max spend for this issue in dollars. Defaults to `estimated_cost` at proposal time. Kavin can edit.
- `actual_cost` (number, null until complete) — real cost after task finishes
- `budget_status` (string: null | "warning" | "exceeded" | "approved") — tracks budget state

The existing `complexity` field (tier) is already on issues.

### Runtime Budget Enforcement

When an agent is executing an issue:

1. Agent tracks token usage against the issue's `budget` field
2. After each step completes, agent checks: am I at 100% of budget?
3. If yes, agent pauses before starting the next step (never mid-work)
4. Agent writes `budget_status: "exceeded"` to the issue JSON
5. Agent creates a budget approval in `shared/projects/{slug}/approvals/pending/`
6. The approval stays in Kavin's inbox until acted on

Step-boundary checking means the agent never stops mid-output. If it crosses 100% during the final step, the task finishes naturally — no approval needed.

The budget approval card shows:
- Issue title and project
- Budget vs actual spend so far
- "Continue" or "Stop" actions

"Continue" sets `budget_status: "approved"` and the agent resumes with no new cap (it already exceeded once — Kavin made the call).

"Stop" cancels the task. Agent wraps up, writes partial results, marks issue as blocked.

### Issue Detail — Cost Display

After completion, the issue detail card shows:

- **Estimated Cost** — what the agent predicted
- **Actual Cost** — what it actually cost
- **Delta** — over/under, shown in green (under) or red (over)

This is read-only. Shown below the existing Model Tier card.

### Approval Flow Summary

```
Agent proposes issue
  ├── Missing tier or estimate → warning badge on approval card
  └── Has tier + estimate → Approval card shows tier + cost
        ├── Approve → issue created with budget = estimated_cost
        ├── Request revision → agent revises tier/estimate
        └── Reject → issue not created

Issue running (step-boundary budget checks)
  └── After step completes, at 100% budget → agent pauses
        ├── Was final step → task finishes, no approval needed
        └── More steps remain → budget approval in inbox
              ├── Continue → agent resumes, no further cap
              └── Stop → agent wraps up, issue blocked
```

## Key Decisions

| Decision | Choice | Alternative Rejected | Why |
|----------|--------|---------------------|-----|
| Who estimates cost | Agent at proposal time | System calculates from tier defaults | Agent knows the task; tier defaults would be wrong half the time |
| Budget cap trigger | 100% at step boundary | 80% warning + 100% hard stop | Simpler, fewer inbox items. One trigger point. No mid-work interruption. |
| Budget check timing | After each step completes | 60-second grace timer | Eliminates race conditions. Agent never stops mid-output. Final step always completes. |
| Missing estimate handling | Warning badge, protocol enforcement | API rejects the proposal | Agents write JSON directly to volume — no request/response to reject. Protocol is the enforcement layer. |
| Post-exceed behavior | No new cap after "Continue" | Set a new budget | Kavin already made the judgment call; double-asking adds friction |
