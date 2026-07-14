# TODO

## 2026-07-14-openclaw-2026-7-1
- [x] Pin the OpenClaw npm runtime to v2026.7.1
- [x] Remove the unused source build after its release-age policy blocked the hosted build
- [x] Serialize startup migrations and gate Railway readiness on the gateway
- [x] Rebuild Mission Control with the current runtime label
- [x] Update runtime, feature, release, and decision documentation
- [ ] Verify the full Railway image build
- [ ] Verify production gateway, channels, tasks, sessions, crons, and Mission Control

## 2026-03-24-edit-strategy

### Backend (server.js)
- [x] POST `/mc/api/projects/:slug/strategy/preview` — compute impact of proposed theme changes
- [x] POST `/mc/api/projects/:slug/strategy` — apply strategy revision with crash-safe write order

### Frontend API (api.js)
- [x] `previewStrategyChanges(slug, themes)` — call preview endpoint
- [x] `applyStrategyChanges(slug, payload)` — call apply endpoint

### Frontend — EditStrategyModal component
- [x] Step 1: Strategy editor — mission/NSM read-only, themes editable (title, description, caps, metrics)
- [x] Add/remove metrics (min 1, max 3), add theme, retire theme
- [x] Step 2: Impact review — affected issues/experiments with keep/discard checkboxes
- [x] Confirm flow — calls apply endpoint, shows toast, closes modal

### Integration — ProjectDetail
- [x] "Edit Strategy" button on Overview tab header (indigo outline)
- [x] Wire modal open/close, refresh themes after save
- [x] Toast notification on success

### Build
- [x] Build dist

## 2026-03-22-unified-approvals
- [x] Backend: `GET /mc/api/approvals` includes proposed issues with `_source: "issue"` and `type` field
- [x] Backend: `GET /mc/api/approvals/:id` resolves proposed issue IDs
- [x] Frontend: ApprovalCard renders proposed issues with type badge, branched approve/reject
- [x] Frontend: ApprovalDetail renders proposed issue detail view
- [x] Frontend: Approvals.jsx groups items by project
- [x] Frontend: ProjectDetail.jsx approvals tab uses unified endpoint (includes proposed issues)
- [x] Frontend: Issues.jsx drops proposed banner
- [x] Frontend: Sidebar badge counts from unified endpoint
- [x] Build dist and commit

## 2026-03-22-strategy-tree

### Phase 1: UI
- [x] CreateProject: add NSM field between Mission and Lead
- [x] ProjectDetail: Strategy tab with NSM, themes, proxy metrics
- [x] ApprovalCard/Detail: Theme type badge (teal), structured theme detail view
- [x] Issue/experiment proposals: theme tag + proxy metrics display
- [x] CreateIssue: theme selector dropdown + proxy metric checkboxes
- [x] Build dist

### Phase 2: Backend wiring
- [x] Backend: scan themes/ dir in GET /mc/api/approvals
- [x] Backend: resolve theme IDs in GET /mc/api/approvals/:id
- [x] Backend: GET /mc/api/themes?project= endpoint
- [x] Backend: theme approve/reject/revise handlers (via frontend resolveTheme)
- [x] Backend: issue validation — enforced via protocol + UI
- [x] Backend: parse NSM from PROJECT.md in project summary
- [x] Wire frontend to real endpoints
- [x] Write protocols/projects.md agent instructions

### Deferred
- [ ] Proxy metric visualization — progress bars, summing contributions vs targets on Strategy tab — effort M
- [x] Port lia-ship-ready to themes — deleted (project completed)
- [x] Proxy metric targets on themes + contribution values on issues/experiments

## 2026-03-22-nsm-proxy-upgrade

### Protocol updates (Railway SSH)
- [x] Update projects.md — 7 changes (milestones → themes, strategy tree section, experiment format, etc.)
- [x] Update experiments.md — add theme/proxy_metrics to program.md template
- [x] Update claude-code.md — milestones → themes reference
- [x] Update all 10 AGENTS.md files — approval tip line ("what"/"why" → "title")
- [x] No existing experiment gates to port (clean slate)

### Dashboard
- [x] ApprovalDetail: render experiment hypothesis, program, theme, proxy metric targets
- [x] Fallback: old experiments with `why` field still render
- [x] Server: resolve theme/metric names on experiment gates
- [x] Build dist

## 2026-03-23-agent-model-routing

### Phase 1: Backend
- [x] API: GET/PUT `/mc/api/model-routing` — read/write `shared/model-routing.json`
- [x] API: Issue POST/PATCH accept `model_override`, `thinking_override`, `complexity`, `escalation_count`

### Phase 2: Routing Config page
- [x] New `ModelRouting.jsx` page — tier definitions, agent assignments, research phase mapping
- [x] Add route in App.jsx + sidebar nav item

### Phase 3: Issue forms
- [x] CreateIssue: add complexity, model override, thinking override dropdowns
- [x] EditIssue: add same fields + read-only escalation count
- [x] IssueDetail: display model/complexity info
- [x] API client: add `getModelRouting`, `updateModelRouting` functions

### Phase 4: Agent detail + costs
- [x] AgentDetail: tier badge next to agent name
- [~] Costs: model tier breakdown — blocked, depends on agents logging `model` field in cost entries (v2)

### Phase 5: Build + verify
- [x] Build dist

## v2: Agent Model Routing

- [ ] Escalation logic — agents increment `escalation_count` on issue JSON, retry at next tier up (simple→complex→lead→coordinator). Requires agent protocol update. — effort M
- [ ] Agent protocol update — teach agents to read `shared/model-routing.json` and issue model/thinking fields at spawn time. Separate OpenClaw workspace deliverable. — effort M
- [ ] Experiment-level model override — override model for an entire research loop, not just per-issue. — effort S
- [ ] Escalation pattern insights — surface patterns like "26% of Leslie's research tasks escalate from Haiku". Depends on escalation data existing first. — effort L

## 2026-03-23-experiment-journal

### Server
- [x] Status derivation from results.tsv decision column (backward compat with ## Status fallback)
- [x] Phases array generation from decision history
- [x] Inbox endpoint: scan updates/ directories for experiment-update items
- [x] Inbox counts: add `updates` to counts object

### Frontend
- [x] ExperimentDetail: phase arc component (horizontal steps, color-coded, click-to-scroll)
- [x] ExperimentDetail: decision + reason columns in run history table with badges and row accents
- [x] Inbox: "Experiment Updates" category with decision badge, reason, deep link
- [x] Sidebar: add updates count to inbox badge

### Protocol (Railway SSH)
- [x] experiments.md + autoresearch.md: add decision/reason columns to results.tsv format
- [x] experiments.md + autoresearch.md: deprecate Status Log, add update JSON write instruction

### Build dist
- [x] Build and commit

## 2026-03-23-autoloop-experiments

### Server
- [x] `parseExperimentMeta()`: extract `## Required Tools` section into `required_tools` array
- [x] `deriveStatusFromResults()`: add `pause` decision → `paused` status
- [x] `buildPhases()`: add `pause` as a phase node
- [x] Inbox: `pause` decision badge color (orange)
- [x] Approval detail enrichment: attach `required_tools` to experiment gate responses

### Frontend — ApprovalDetail
- [x] Render Required Tools card with green/red checklist
- [x] Block Approve button when any tool is unchecked

### Frontend — ExperimentDetail
- [x] `paused` status badge with orange pulsing dot

### Build
- [x] Build dist

### Protocol (Railway API)
- [x] Update `experiments.md`: auto-execute rule, Required Tools format, pause decision, re-validate per action
- [x] Update `autoresearch.md`: same changes
- [x] Merge autoresearch.md into experiments.md — single canonical protocol with eval harness, never-stop rule, three-check tool validation
- [x] autoresearch.md replaced with redirect to experiments.md

### Deferred
- [ ] ExperimentDetail page: show Required Tools section (not just approval view) — effort S
- [ ] Per-tool `## How to Execute` / `## How to Measure` sections in `shared/tools/*.md` — Kavin owns

## 2026-03-23-issue-cost-governance

### Dashboard Build
- [x] ApprovalCard: show tier badge on proposed issues
- Remaining moved to v2

## v2: Issue Cost Governance (dashboard)
- [ ] ApprovalCard: estimated cost display + "No estimate" warning if missing — effort S
- [ ] ApprovalCard: budget approval type — budget vs actual, Continue/Stop actions — effort M
- [ ] IssueDetail: cost card — estimated, actual, delta (green/red) — effort S
- [ ] API: accept + persist estimated_cost, budget, actual_cost, budget_status on issues — effort M

## v2: Coder Agent Integration

- [ ] Agent protocol: when issue complexity is `claude-code`, lead agent sends `exec` tool call to Coder agent with `claude -p '...'` and project `workdir` — effort M
- [ ] Lead agent writes Coder agent output as comment on issue after completion — effort S
- [ ] Lead agent updates issue status based on Coder agent result (done or blocked) — effort S
- [ ] Add `workdir` field to project create/edit (local path for Claude Code execution) — effort S

## v2: Agent Protocol — Cost Governance + Model Routing (bundle)

- [ ] Teach agents to include `estimated_cost` + `complexity` in all issue proposals — effort S
- [ ] Teach agents to track token spend per issue and check budget at step boundaries — effort M
- [ ] Teach agents to read `shared/model-routing.json` and use model/thinking fields at spawn time — effort M
- [ ] Teach agents to write `budget_status` + budget approval JSON when cap is hit — effort S

## 2026-03-26-blocked-on-operator

### Backend
- [x] Add `blocked_on_operator` scan to inbox issues loop
- [x] Add `blocked` to counts object + sidebar badge

### Frontend
- [x] Project grouping across all three Briefing sections
- [x] Blocker row rendering with inline reason
- [x] Build dist

### Follow-up (separate oc-sync)
- [ ] Protocol update: teach agents to set/clear blocker fields

## 2026-03-26-dashboard-briefing

### Backend
- [x] Add `overdue_issue` item type to `/mc/api/inbox` (issues scan loop)
- [x] Add `paused_experiment` item type to `/mc/api/inbox` (new scan loop)
- [x] Add `overdue` and `paused` to counts object

### Frontend
- [x] Create `Briefing.jsx` — three priority-ordered sections with visual hierarchy
- [x] Update `App.jsx` — swap route, keep `#/inbox` as alias
- [x] Update `Sidebar.jsx` — rename to "Briefing", badge = S1+S2 only
- [x] Update `Overview.jsx` — banner navigates to "briefing"
- [x] Delete `Inbox.jsx`
- [x] Build dist

## v2: One-tap model switch from Telegram

When a model fallback alert fires, include an inline "Switch" button that rewrites `agents.defaults.model.primary` in `openclaw.json` via an HMAC-secured `/ops/model-switch` endpoint. Also add an "Undo" button to the confirmation message so switching back is one more tap.

Deferred because it writes to `openclaw.json` on the live volume — needs careful testing for race conditions and a rollback mechanism before shipping.

## 2026-04-01-clean-decisions-queue

- [ ] Backend: inbox endpoint — skip `revision_requested` items from Decisions Waiting
- [ ] Backend: inbox endpoint — skip malformed approvals (no `gate` + no `what`)
- [ ] Backend: approvals endpoint — skip malformed approvals (no `gate` + no `what`)
- [ ] Frontend: rebuild dist
- [ ] Verify: confirm both filters work correctly
