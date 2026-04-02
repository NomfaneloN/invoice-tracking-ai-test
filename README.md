# ITS Shesha3 — E2E Test Suite

Automated end-to-end testing for the **ITS Invoice Tracking System (Shesha3)** — a government payment workflow application built on the [Shesha](https://docs.shesha.io/) framework.

## What This Is

This project contains **markdown-driven test plans** that are executed by Claude via MCP browser tools. There are no Playwright scripts, Cypress tests, or any other test framework code. Claude reads each test plan and drives the browser directly — snapshot, click, fill, assert — step by step.

## Application Under Test

| Field | Value |
|-------|-------|
| App | ITS Shesha3 (SA Government Invoice Tracking) |
| URL | https://pd-invtracking-adminportal-qa.azurewebsites.net |
| Environment | QA |

## Workflows Covered

### BAS Request for Payment — Full E2E Workflow

The primary test plan covers the complete BAS (Basic Accounting System) payment lifecycle from invoice registration through to filing:

| Step | Action | User |
|------|--------|------|
| TC-01 | Register and Upload Invoice | Thulilem (Finance) |
| TC-02 | Assign Branch Finance Admin to Assign Certifier | Thulilem (Finance) |
| TC-03a | Assign Responsible Person to Certify Invoice | TaniaSmith (Business) |
| TC-03b | Certify Invoice | TaniaSmith (Business) |
| TC-04 | ~~Assign Responsible Person to Verify~~ | *(Obsolete — removed from workflow)* |
| TC-05 | Prepare Voucher | TaniaSmith (Business) |
| TC-06 | Verify Voucher | Thulilem (Finance) |
| TC-07 | Authorise Invoice Voucher | Thulilem (Finance) |
| TC-08 | BAS Report Import (upload via admin portal) | admin |
| TC-09 | Payment Stub Import (upload via admin portal) | admin |
| TC-10 | Capture Filing | Gwenb (Internal Control) |
| TC-11 | Manage Supplier Related Queries (exception) | TaniaSmith |
| TC-12 | Review Rejected Invoice (exception) | Thulilem |

### Admin Import Steps

Two workflow steps are completed via admin portal imports rather than the standard workflow UI:

- **BAS Report Import** (TC-08): After invoice authorisation, the BAS Payment Register Excel must be prepared with matching record data (blue-background columns) and uploaded via `Admin > BAS Report > BAS Report Import`.
- **Payment Stub Import** (TC-09): The payment stub text file must be updated with the correct SOURCE DOC NUMBER and PAYMENT NUMBER, then uploaded via `Admin > Payment Stubs Import > Import Payment Stub`.

Both imports are verified by checking the **History tab** — Payments Authorised / Payments Confirmed must equal the number of data rows (typically 1).

## Project Structure

```
.
|-- CLAUDE.md                    # Project config for Claude — how to run tests
|-- README.md                    # This file
|-- PROJECT-TEMPLATE 1.md        # Template reference
|-- test-plans/
|   |-- RULES.md                 # Execution rules governing every test run
|   |-- TEMPLATE.md              # Test plan template
|   |-- e2e-bas-full-workflow.md # BAS full workflow (primary test plan)
|   |-- e2e-bas-request.md       # BAS request creation (subset)
|   |-- e2e-logis-full-workflow.md # LOGIS workflow test plan
|-- test-reports/
|   |-- bas-full-workflow-*.md   # Test execution reports with timestamps
|   |-- bas-request-*.md         # BAS request test reports
|-- BAS Payment Register for 17 MARCH 2026 2 2.xlsx  # BAS import template
|-- training STUB (1).txt        # Payment stub import template
```

## How to Run Tests

> **Prerequisites:** Claude Code with MCP browser tools (Playwright).

1. Open the project directory in Claude Code
2. Ask Claude to run a test plan, e.g.:
   ```
   run test-plans/e2e-bas-full-workflow.md
   ```
3. Claude will:
   - Read `CLAUDE.md` and `RULES.md` first
   - Read the test plan fully before touching the browser
   - Execute each test case using MCP browser tools
   - Generate a report in `test-reports/`

### Key Execution Rules

- **Never stop executing** — once a test run starts, execute every step to completion without pausing
- **Never guess** — always snapshot the browser before acting
- **Never skip steps** — every step must be executed in order
- **Every assertion** must be explicitly checked and marked pass/fail
- On failure: screenshot, note what happened, continue to next test case
- Reports are saved to `test-reports/[module]-YYYY-MM-DDTHH-MM.md`

## Test Accounts

| Role | Username | Used In |
|------|----------|---------|
| Finance Unit | Thulilem | TC-01, TC-02, TC-06, TC-07, TC-12 |
| Business Unit | TaniaSmith | TC-03, TC-05, TC-11 |
| Internal Control | Gwenb | TC-10, TC-11 |
| Admin | admin | TC-08, TC-09 |

All accounts use the same password (see `CLAUDE.md`).

## Import Templates

### BAS Payment Register Excel

The Excel template has a header row (row 9) and data row (row 10). **Blue-background columns** must be updated before each import:

| Column | What to Update |
|--------|---------------|
| INV RECDTE | Date Received from TC-01 |
| SOURCE DOC NUMBER | Invoice No (must match system exactly) |
| CAPTURE DATE | Date record was captured |
| AUTH DATE | Date record was authorised |
| INV DATE | Invoice Date |
| AMOUNT | Invoice Amount |
| SOURCE DOC TYPE | Always `SUNDRY` |

Columns that stay unchanged: FUNC NO, CAPTURE ID, AUTHORISE ID, ENT NUMBER, MICR NO, DISB NO, PAYMTD, REGION.

### Payment Stub Text File

A fixed-width text file. Update these fields while maintaining exact column alignment:

| Field | What to Update |
|-------|---------------|
| SOURCE DOC NUMBER | Invoice No from TC-01 |
| PAYMENT NUMBER | Payment number (keep existing if unchanged) |

## Latest Test Results

**Last run:** 2026-04-02 (PAY4732/2026)

| Result | Count |
|--------|-------|
| Pass | 10 |
| Fail | 0 |
| Skip | 1 (TC-04 obsolete) |
| Not Run | 2 (exception paths) |

Full reports available in `test-reports/`.

## What NOT to Do

- Do **NOT** generate Playwright, Cypress, Selenium, or any test framework code
- Do **NOT** write `.spec.ts`, `.test.js`, or any script files
- Do **NOT** hardcode credentials in reports
- Do **NOT** skip reading `RULES.md` or `CLAUDE.md` before starting a test run
