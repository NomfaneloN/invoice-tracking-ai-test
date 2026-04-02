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

## After Testing
1. Save report to `test-reports/[module]-YYYY-MM-DDTHH-MM.md`
2. Summarize: total pass/fail/skip, issues, recommendations

## What NOT to Do
- Do NOT hardcode credentials in reports
- Do NOT create records unless the test requires it
- Do NOT skip steps within a test case
- Do NOT modify the test plan during execution
