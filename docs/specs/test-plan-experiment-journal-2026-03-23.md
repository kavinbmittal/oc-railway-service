# Test Plan: Experiment Journal

## Server — results.tsv parsing

- [ ] TSV with `decision` + `reason` columns: both values parsed and returned in results array
- [ ] TSV without `decision`/`reason` columns (old format): renders without errors, decision/reason are null/undefined
- [ ] TSV with decision column but blank values on most rows: blank rows return empty string, not null
- [ ] TSV with tab characters inside `reason` freetext: verify correct column splitting (reason should not contain tabs — protocol enforces single line)
- [ ] Empty results.tsv (header only): returns empty results array, status derived as "planned"

## Server — status derivation

- [ ] No results rows → status: "planned"
- [ ] Results rows exist, no decision values → status: "running"
- [ ] Latest decision is "keep" → status: "running"
- [ ] Latest decision is "pivot" → status: "running"
- [ ] Latest decision is "scale" → status: "completed"
- [ ] Latest decision is "kill" → status: "killed"
- [ ] Fallback: if no decision columns exist and `## Status` heading present in program.md → parse from markdown (backward compat)

## Server — phases array

- [ ] Experiment with no results: phases = `[{ type: "design", date: created }]`
- [ ] Experiment with 3 measurement rows, no decisions: phases = `[design, run 1]`
- [ ] Experiment with measurement → pivot → measurement: phases = `[design, run 1, pivot, run 2]`
- [ ] Experiment with measurement → kill: phases = `[design, run 1, kill]`
- [ ] Multiple decisions: each creates a new phase node, run numbers increment correctly

## Server — inbox updates scan

- [ ] `updates/` directory exists with JSON files → returned as `type: "experiment-update"` items in inbox
- [ ] `updates/` directory doesn't exist → no crash, updates count = 0
- [ ] Update JSON with all fields (project, experiment_dir, experiment_name, decision, reason, agent, timestamp) → all fields returned
- [ ] Inbox counts object includes `updates` key
- [ ] Updates sorted by timestamp descending (newest first)

## Frontend — Experiment Detail: Phase Arc

- [ ] Empty experiment (no results): single "Design" node, dimmed
- [ ] Running experiment (measurements, no decision): "Design" solid → "Run 1" pulsing
- [ ] Experiment with pivot: "Design" → "Run 1" → "Pivot" (amber) → "Run 2" (pulsing)
- [ ] Experiment with kill: last node is red "Kill", no pulsing
- [ ] Experiment with scale: last node is emerald "Scale", no pulsing
- [ ] Clicking a phase node scrolls table to corresponding row
- [ ] Arc responsive on smaller screens (horizontal scroll if many nodes)

## Frontend — Experiment Detail: Combined Table

- [ ] Decision column renders colored badge (keep=cyan, pivot=amber, scale=emerald, kill=red)
- [ ] Reason column renders in muted text
- [ ] Measurement-only rows: decision and reason columns are empty, no badge
- [ ] Decision rows get left border accent in decision color
- [ ] Best metric highlighting still works independently of decision styling
- [ ] Row that is both best metric AND has a decision: both styles applied (decision color border, emerald metric highlight)
- [ ] Old TSV format (no decision/reason columns): table renders without those columns, no empty columns shown

## Frontend — Inbox: Experiment Updates

- [ ] New "Experiment Updates" category appears in inbox
- [ ] Category shows experiment name, decision badge, reason, project, agent, timestamp
- [ ] No approve/reject buttons on experiment update items
- [ ] Clicking an update deep links to experiment detail page (correct project + experiment dir)
- [ ] Empty state: category hidden when no updates exist (alwaysShow: false)
- [ ] Badge count in sidebar includes update count

## Protocol — Railway SSH

- [ ] `experiments.md` updated: results.tsv format includes decision + reason columns
- [ ] `experiments.md` updated: Status Log section marked as deprecated, status derived from results.tsv
- [ ] `experiments.md` updated: protocol instructs agent to write update JSON on decision
- [ ] `autoresearch.md` updated: same changes as experiments.md
- [ ] Update JSON format documented in protocol with example

## Regression

- [ ] Existing experiments with old-format results.tsv still render on list and detail pages
- [ ] Experiment cards on project page still show status, run count, best metric
- [ ] Existing inbox categories (approvals, budget, stale tasks, standups) unaffected
- [ ] Sidebar badge count still correct for non-update categories
- [ ] Approval flow for new experiments (`experiment-start` gate) still works
