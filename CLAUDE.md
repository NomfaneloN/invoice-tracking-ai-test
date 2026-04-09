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

## Allure Report

Generate locally: `npm run allure:report` (installs dependencies, builds HTML, opens browser)  
Trigger on CI: GitHub Actions → **Allure Report** → Run workflow (manual only)  
Published at: https://nomfanelon.github.io/invoice-tracking-ai-test/

### How `scripts/generate-allure-results.js` works
- Parses every `test-reports/*.md` → writes `allure-results/*.json`
- **One result per TC-ID across all reports** — deduplicates so each TC appears once
- **Latest run wins**: files are sorted by the date embedded in the filename (`YYYY-MM-DDThh-mm`), newest first. The first non-skipped result for each TC-ID is kept.
- Skipped and unknown TCs are excluded entirely
- `[!]` assertions = observations/notes on a passing test; they appear as step annotations but do NOT fail the TC
- `RunType` tag (`local` / `ci`) is added to every result and shown in the Environment widget

### Rules when modifying `generate-allure-results.js`
- **Always sort by embedded date, not alphabetically.** Alphabetical order is wrong: `bas-full-workflow-2026-04-02` sorts after `bas-2026-04-09` (because `f` > `2`), causing an older result to overwrite a newer one.
- TC-level status comes from `**Result:**`, then `**Status:**`, then the last `**BOLD**` value in the TC's summary table row (supports any number of columns), then `[x]` assertion count as fallback. Never infer failure from `[!]` count alone.
- `**Status: SKIP — BLOCKER**` → skipped (SKIP is checked before BLOCK).
