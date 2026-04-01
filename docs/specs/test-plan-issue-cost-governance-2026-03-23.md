# Test Plan — Issue Cost Governance

## Unit Tests

### ApprovalCard — cost fields
- Proposed issue with `estimated_cost` and `complexity` renders tier badge and cost
- Proposed issue missing `estimated_cost` renders "No estimate" warning badge
- Budget approval type renders budget vs actual, Continue/Stop buttons
- Regular (non-budget) approvals render unchanged

### IssueDetail — cost card
- Issue with `estimated_cost` + `actual_cost` renders both with delta
- Delta positive (over budget) renders red
- Delta negative (under budget) renders green
- Issue with only `estimated_cost` (still running) renders estimate only, no delta
- Issue with no cost fields renders no cost card

### CreateIssue / EditIssue — budget field
- Budget field present and editable
- Budget defaults to empty (agent sets it via proposal)
- Budget accepts decimal dollar values
- Budget field persists on save

### API — estimated_cost validation
- Proposed issue without `estimated_cost` returns error with message
- Proposed issue without `complexity` returns error with message
- Proposed issue with both fields succeeds
- Non-proposed issues (created directly) don't require estimated_cost

## Integration Tests

### Approval flow with cost visibility
- Agent writes proposal JSON with estimated_cost + complexity to volume
- Dashboard loads approval, shows tier badge and cost
- Approve sets budget = estimated_cost on the created issue
- Request revision with "lower the budget" feedback reaches agent

### Budget approval flow
- Issue JSON with `budget_status: "exceeded"` + matching budget approval in pending/
- Dashboard renders budget approval card with correct spend numbers
- "Continue" resolves approval, sets budget_status to "approved"
- "Stop" resolves approval, sets issue status to "blocked"

## Manual Checks

- Verify approval card layout with tier badge + cost doesn't break on narrow screens
- Verify cost card on issue detail aligns with existing Model Tier card styling
- Verify budget approval card is visually distinct from regular approvals (different type badge)

## Regression Risk

- Existing approval cards must render unchanged when cost fields are absent
- Existing issue detail must not break when cost fields are null
- CreateIssue/EditIssue existing fields must not shift layout when budget field is added
- Approvals page grouping logic must handle budget approval type without breaking sort/group
