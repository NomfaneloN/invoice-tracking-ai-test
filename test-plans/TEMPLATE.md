# Test Plan: [Feature Name]

## How To Run This Test Plan

> **This is NOT a Playwright test.** Do not generate Playwright scripts, test files, or any automated test code.

**Before executing:**
1. Read `CLAUDE.md` (project root) — understand how this project works
2. Read `test-plans/RULES.md` — execution rules that govern every test run
3. Read this test plan fully before touching the browser

**Execution method:** Claude drives the browser directly using MCP browser tools (`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill_form`, etc.). Each step is executed manually through the browser — snapshot before acting, click/fill using element refs from the snapshot, snapshot after to verify.

**Do NOT:**
- Generate Playwright, Cypress, Selenium, or any other test framework code
- Write `.spec.ts`, `.test.js`, or any script files
- Use `browser_evaluate` for UI interaction — only `browser_snapshot` + MCP actions
- Skip reading RULES.md or CLAUDE.md before starting

---

## Meta
| Field        | Value                          |
|-------------|--------------------------------|
| Module      | [Feature or user journey]       |
| URL         | [Base URL]                      |
| Prereqs     | [Login required? Data needed?]  |
| Last tested | YYYY-MM-DD                      |
| Status      | Not yet tested                  |

---

## Accounts Used
| Role | Username | Password | Used In |
|------|----------|----------|---------|
| Admin | Admin | [env var] | TC-01, TC-02 |

---

## TC-01: [Happy path description]
- **Type:** Happy path
- **Login:** Admin
- **URL:** [starting page]
- **Steps:**
  1. Navigate to [page]
  2. Click [button]
  3. Fill [field] with [value]
  4. Click [submit]
- **Input data:**
  | Field | Value | Type |
  |-------|-------|------|
  | Name  | Test  | Text |
- **Expected result:** [What should happen]
- **Assertions:**
  - [ ] [Thing to verify]
  - [ ] [Another thing]

---

## TC-02: [Negative test description]
- **Type:** Negative
- **Steps:**
  1. Leave [required field] empty
  2. Click submit
- **Expected result:** Validation error shown
- **Assertions:**
  - [ ] Error message visible
  - [ ] Record NOT created

---

## TC-03: [Edge case description]
- **Type:** Edge case
- **Steps:**
  1. [Unusual action]
- **Expected result:** [Expected behavior]
- **Assertions:**
  - [ ] [Verification]
