# Experiment Journal

## What This Means for Users

When an experiment is running, you can open its detail page and see the full story: every measurement, every decision Leslie made, and why — in one table. A horizontal arc at the top shows the experiment's phase at a glance (running → pivoted → scaled). When Leslie makes a decision (pivot, scale, kill), it shows up in your inbox as an Experiment Update that deep links straight to the experiment page. No Telegram scrolling, no asking what happened.

## Problem

Experiments run autonomously after approval, but the dashboard doesn't surface what's happening inside the loop. Measurement data (`results.tsv`) and decisions (Status Log in `program.md`) live in separate places. There's no notification when Leslie makes a call. You have to manually check the experiment detail page and read through a markdown blob to piece together the story.

## Approach

Unify measurements and decisions into one timeline. Every row in `results.tsv` is a moment in time — most are pure data, some also carry a decision and reason. The experiment detail page renders this as a single table with decision rows visually elevated. A horizontal phase arc summarizes the experiment's journey. Decisions push to the inbox.

### Why this approach

- One data source (`results.tsv`) instead of two (TSV + Status Log). No sync problem.
- Decisions are always tied to the numbers that caused them — cause and effect in the same row.
- The inbox integration uses the existing inbox endpoint (not approvals) with a new category, same pattern as standups and budget alerts.

## Scope

### In scope
- Protocol update: new `results.tsv` columns (`decision`, `reason`)
- Protocol update: Status Log section in `program.md` becomes redundant — decision history lives in `results.tsv`
- Experiment Detail page: combined run history + decisions table with visual distinction for decision rows
- Experiment Detail page: horizontal phase arc showing experiment lifecycle
- Inbox: new "Experiment Updates" category for decision notifications (informational, no approve/reject — deep links to experiment page)
- Server: parse decision/reason columns from `results.tsv`
- Protocol update: agent writes update JSON to `shared/projects/{slug}/updates/` when logging a decision
- Server: inbox endpoint scans updates directory (same pattern as standups)

### Out of scope
- Playbook diff (showing what changed between iterations) — future enhancement
- Editing experiments from the dashboard (the Edit button exists but is non-functional today)
- Changing Leslie's heartbeat cron code (protocol update is sufficient — she follows the protocol)

## Design

### 1. Protocol: `results.tsv` format

Current:
```
date	exp	[domain columns]	notes
```

New:
```
date	exp	[domain columns]	decision	reason	notes
```

`decision` values: blank (mid-cycle measurement), `keep`, `pivot`, `scale`, `kill`. Strictly one of these five. This is what the dashboard parses for badges and arc nodes.

`reason` is freetext — one line explaining why. "Founder angle converting 3x better than product angle." This is what shows in the table and in the inbox notification.

`notes` stays for operational details that aren't decisions ("UTM typo in first 2 posts, fixed mid-run").

Backward compatible — existing TSV files without these columns render normally (blank decision/reason).

### 2. Protocol: Status Log deprecation

The `## Status` and `## Status Log` sections in `program.md` are replaced by the decision column in `results.tsv`. The `## Status` field (running/paused/completed/killed) is now derived from the latest decision:
- No decision rows yet → `planned`
- Any measurement row exists, no terminal decision → `running`
- Latest decision is `kill` → `killed`
- Latest decision is `scale` → `completed` (graduated to standard ops)
- Latest decision is `keep` or `pivot` → `running`

This means the server computes status from `results.tsv` instead of parsing a markdown heading. Single source of truth.

### 3. Experiment Detail: Phase Arc

Horizontal step indicator between the header and the content area. Each node represents a phase transition:

```
◉ Design ──── ◉ Run 1 ──── ◉ Pivot ──── ◎ Run 2 ──── ○ ...
 (solid)       (solid)       (solid)      (pulsing)    (dimmed)
```

- Nodes are derived from the decision column: the initial approval is "Design", each measurement-only period is "Run N", each decision row is a labeled node (Pivot, Scale, Kill, Keep).
- Current phase pulses (same animation as the running status badge).
- Past phases are solid with a connecting line.
- The arc is a summary — it doesn't replace the table, it gives you the shape of the experiment in 2 seconds.
- Clicking a node scrolls to the corresponding row in the table below.

Color coding:
- Running/Keep: cyan
- Pivot: amber
- Scale: emerald
- Kill: red

### 4. Experiment Detail: Combined Run History Table

The existing table gains two new columns. Decision rows get visual treatment:

- **Decision badge:** colored pill in the decision column (same colors as the arc — cyan/amber/emerald/red)
- **Reason text:** renders in the reason column, slightly muted compared to numbers
- **Row accent:** decision rows get a left border in the decision color (same pattern as the current best-metric highlight, but using the decision color instead of emerald)
- **Measurement-only rows:** decision and reason columns are blank, row renders normally

The "best metric" highlighting stays — it's independent of decisions. A row can be both the best metric AND a decision row.

### 5. Inbox: Experiment Updates

New category in the inbox system (not approvals — experiment updates are informational, not actionable).

**Agent-side write:** When Leslie writes a decision row to `results.tsv`, the protocol also instructs her to write an update JSON to `shared/projects/{slug}/updates/`:

```json
{
  "type": "experiment-update",
  "project": "lia-first-100",
  "experiment_dir": "exp-001",
  "experiment_name": "Convert r/productivity founders via Chief of Staff angle",
  "decision": "pivot",
  "reason": "Founder angle converting 3x better than product angle",
  "agent": "leslie",
  "timestamp": "2026-04-08T14:30:00Z"
}
```

Filename convention: `{experiment_dir}-{decision}-{date}.json` (e.g., `exp-001-pivot-2026-04-08.json`).

**Server-side read:** The inbox endpoint (`GET /mc/api/inbox`) scans `updates/` directories across projects — same pattern as standups. No diffing, no index files, no detection logic. The agent writes the file, the server reads it. If Leslie crashes before writing the update JSON, the data is still in `results.tsv` — you see it on the experiment detail page, you just don't get the inbox notification. Acceptable degradation.

On the inbox page:
- New collapsible category: "Experiment Updates" alongside budget, stale tasks, standups
- Card shows: experiment name, decision badge, reason, project name, agent, timestamp
- No action buttons — this is informational
- Click deep links to the experiment detail page
- Hidden when no updates exist (`alwaysShow: false`)

### 6. Server Changes

**GET /mc/api/experiments/:dir** — already returns `results` array. Each result object now includes `decision` and `reason` fields parsed from TSV. Also returns a new `phases` array for the arc:
```json
{
  "phases": [
    { "type": "design", "date": "2026-03-20" },
    { "type": "run", "number": 1, "date": "2026-03-25" },
    { "type": "pivot", "date": "2026-04-08", "reason": "..." },
    { "type": "run", "number": 2, "date": "2026-04-08" }
  ]
}
```

**GET /mc/api/experiments** (list) — status field derived from latest decision instead of parsed from `## Status` heading. Backward compatible: if no decision columns exist, falls back to the markdown parse.

**GET /mc/api/inbox** — scans `shared/projects/*/updates/*.json` for experiment-update items. Returns them in the `updates` category. Adds `updates` count to the counts object. Same scan pattern as standups (directory read, JSON parse, sort by timestamp).

## Key Decisions

| Decision | Chosen | Alternative | Why |
|---|---|---|---|
| Decision in same row as measurement | Yes | Separate decision rows between measurements | Cause and effect stay together; one append-only file |
| Status derived from results.tsv | Yes | Keep `## Status` in program.md | Single source of truth; no divergence between what the table shows and what the badge says |
| Phase arc as horizontal steps | Yes | Vertical timeline sidebar | Doesn't compete with the table; summarizes without duplicating |
| Inbox via inbox endpoint, not approvals | Yes | Mix into approvals endpoint | Approvals are actionable; updates are informational. Different pipes for different intent. |
| Agent writes update JSON (not server detection) | Yes | Server diffs results.tsv on each poll | Agent knows the decision at write time; no fragile diffing; directory scan is simpler than index tracking |

## Testing Plan

- [ ] TSV with decision + reason columns parses correctly in server
- [ ] TSV without decision columns (backward compat) renders without errors
- [ ] Status derivation from decision column matches expected states
- [ ] Phase arc renders correct nodes from decision history
- [ ] Clicking arc node scrolls to corresponding table row
- [ ] Decision rows have correct color accent and badge
- [ ] Inbox shows experiment-update items with correct category
- [ ] Inbox items deep link to correct experiment detail page
- [ ] Inbox items have no action buttons
- [ ] Empty experiment (no results) shows "No runs yet" and single "Design" node in arc
