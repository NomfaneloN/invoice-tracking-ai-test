# CLAUDE.md – Invoice Tracking AI Test

This project uses markdown files to define and execute tests.
No scripts — Claude drives the browser directly from test plan definitions using MCP browser tools.

> **IMPORTANT:** This is NOT a Playwright/Cypress/Selenium project. Do NOT generate test scripts or .spec.ts/.test.js files.
> Claude reads markdown test plans and executes them by driving the browser directly via MCP tools (browser_snapshot, browser_click, browser_fill_form, etc.).

## App Under Test

| Field | Value |
|-------|-------|
| App | ITS Shesha3 |
| URL | https://pd-invtracking-adminportal-qa.azurewebsites.net/login |
| Environment | QA |

## Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | Admin | 123qwe |

## How It Works
1. Test plans live in `test-plans/` as `.md` files
2. Claude reads a test plan, opens the browser, and executes each test case using MCP browser tools
3. Results are saved to `test-reports/[scenario]-[date].md`

## Running Tests
When asked to run a test plan:
1. Read `CLAUDE.md` (this file) first
2. Read `test-plans/RULES.md` — execution rules that govern every test run
3. Read the target test plan fully before touching the browser
4. Execute each test case using MCP browser tools (snapshot, click, fill, assert)
5. Generate a report in `test-reports/`

## Key Rules
- **NEVER stop executing for no reason.** Once a test run has started, execute every step to completion without pausing to summarize or ask for confirmation between steps. Keep going until the entire workflow is done or a genuine blocker is hit.
- Never guess — always snapshot the browser before acting
- Never hardcode credentials in reports
- On failure: screenshot, note what happened, continue to next test case
- Every assertion must be explicitly checked and marked pass/fail
- Reuse existing test data — don't create new records unless required
- NEVER generate Playwright, Cypress, Selenium, or any test framework code

## Report Requirements
Every test report MUST include:
- **Run Metrics Table** at the top: total duration, pass/fail/skip counts, UI/UX issue count, estimated API cost
- **Per-TC timing**: start time, end time, duration for each test case
- **UI/UX Issues section**: every visual, layout, labelling, or usability problem observed — even on passing TCs. Rate severity (Critical/High/Medium/Low)
- **Performance Observations**: any page loads >3s, slow transitions, spinner delays
- See `test-plans/RULES.md` for full report format specification
