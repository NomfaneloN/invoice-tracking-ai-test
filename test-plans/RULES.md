# Test Execution Rules

## Before Testing
1. **Read the full test plan** before touching the browser
2. **Check prereqs** — if login is needed, do it first
3. **Navigate to the target URL** and snapshot to confirm
4. **Do not guess** — if the UI doesn't match, stop and report

## During Testing

### Continuous Execution
- **NEVER stop executing for no reason.** Once a test run has started, execute every step to completion without pausing to summarize or ask for confirmation between steps. Keep going until the entire workflow is done or a genuine blocker is hit.

### Navigation
- Snapshot before every action to see current state
- Never assume a page has loaded — verify with a snapshot

### Filling Forms
- Snapshot after filling each field to confirm the value took
- For dropdowns: snapshot to see options, then select
- Clear existing field values before typing new ones

### Clicking / Submitting
- Snapshot before clicking to confirm the target is visible
- Snapshot after clicking to verify the outcome

## Assertions
- Mark each assertion: `[x]` for pass, `[!]` for fail
- Never skip assertions — every one must be evaluated

## On Failure
1. Screenshot the current state
2. Note the exact step that failed
3. Note expected vs actual
4. Continue to the next test case

## Step Execution — Zero Tolerance for Skipping
- Execute EVERY step in order, one at a time
- Never jump ahead to a final action before completing all preceding steps
- A test case with skipped steps is a FAIL, not a PASS

## Test Data

| Person | ID/Key | Use For |
|--------|--------|---------|
| Admin  | Admin  | Login, admin actions |

## During Testing — Track Metrics
- **Record the start time** (timestamp) at the beginning of each TC and the end time when it completes. Include these in the report.
- **Log UI/UX issues as you go.** Anything that looks wrong, confusing, slow, or inconsistent counts — even if the TC passes. Examples:
  - Layout/alignment problems
  - Misleading labels or missing labels
  - Slow page loads or spinner delays (note the approximate wait time)
  - Fields that are hard to find or confusing to use
  - Inconsistent button styles, colours, or placement
  - Accessibility issues (missing alt text, poor contrast, keyboard traps)
  - Data display bugs (e.g. "R 0" or "R undefined" during loading)
  - Mobile responsiveness issues (if applicable)
- **Note page load times** — if a page takes noticeably long (>3 seconds), record it.

## After Testing
1. Save report to `test-reports/[module]-YYYY-MM-DDTHH-MM.md`
2. Summarize: total pass/fail/skip, issues, recommendations
3. **Include the following sections in every report:**

### Required Report Sections

#### Run Metrics Table (top of report)
```
| Metric | Value |
|--------|-------|
| Total Duration | HH:MM:SS (from first login to final verification) |
| Test Cases Executed | X |
| Pass / Fail / Skip | X / X / X |
| UI/UX Issues Found | X |
| API Cost (est.) | $X.XX (based on ~tokens used, if available) |
```

#### Per-TC Timing
Each test case section must include:
```
**Started:** HH:MM:SS | **Completed:** HH:MM:SS | **Duration:** Xm Xs
```

#### UI/UX Issues Section (end of report, before Recommendations)
A dedicated section listing every UI/UX issue observed during the run:
```
## UI/UX Issues

| # | TC | Severity | Issue | Screenshot |
|---|-----|----------|-------|------------|
| 1 | TC-01 | Low | Mode badge shows "Live" but mode is actually "Latest" | — |
| 2 | TC-03 | Medium | Total Amount shows "R 0" during page load before resolving | — |
```
Severity levels: **Critical** (blocks user), **High** (wrong data shown), **Medium** (confusing/misleading), **Low** (cosmetic/minor)

#### Performance Observations Section
Note any pages or actions that were slow:
```
## Performance Observations

| TC | Action | Approx Load Time | Notes |
|----|--------|-----------------|-------|
| TC-01 | Form open after Create New | ~4s | Spinner visible |
```

## What NOT to Do
- Do NOT hardcode credentials in reports
- Do NOT create records unless the test requires it
- Do NOT skip steps within a test case
- Do NOT modify the test plan during execution
