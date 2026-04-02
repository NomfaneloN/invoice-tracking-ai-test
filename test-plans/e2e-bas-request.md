# Test Plan: BAS Request for Payment

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
- Skip reading RULES.md or CLAUDE.md before starting

---

## Meta
| Field        | Value                                                                 |
|-------------|-----------------------------------------------------------------------|
| Module      | BAS Request for Payment                                               |
| URL         | https://pd-invtracking-adminportal-qa.azurewebsites.net/login        |
| Prereqs     | Login as Admin. Mode set to Latest.                                   |
| Last tested | 2026-04-02                                                            |
| Status      | 2 Pass / 1 Fail                                                       |

---

## Accounts Used
| Role  | Username | Password | Used In        |
|-------|----------|----------|----------------|
| Admin | Admin    | 123qwe   | TC-01 to TC-03 |

---

## Known Behaviors (observed during execution)
- **Supplier Name** uses an entity picker dialog, not a plain text field. Click the field or the `...` button to open a "Select Item" dialog, search for the supplier name, then double-click the result to select it.
- **Invoice Attachment is required.** Adding an invoice row requires an attachment — without one, the row is rejected with a "Create failed" tooltip. Click the upload button in the Invoice Attachment column before confirming the row.
- **Date Received auto-populates** with today's date. Clear it if a different date is needed.
- **Draft record created on form open.** The application creates and persists a Draft record (with a Ref No) the moment "Create New → BAS Request For Payment" is clicked, before any fields are filled. Closing without submitting leaves an orphaned Draft in the Drafts section.
- **Submit button is disabled** when required fields are empty. This is the primary validation mechanism — there are no field-level inline error messages.
- **Workflow steps may require additional fields.** The "Register and Upload Invoice" step requires a Branch Finance Admin to be selected before Submit is enabled.

---

## TC-01: Create and submit a new BAS Request for Payment
- **Type:** Happy path
- **Login:** Admin
- **URL:** https://pd-invtracking-adminportal-qa.azurewebsites.net/login
- **Steps:**
  1. Navigate to the login page
  2. Fill Username with `Admin` and Password with `123qwe`
  3. Click Login
  4. Verify login was successful (dashboard loads)
  5. Locate the mode switcher and change mode from Live to Latest
  6. Verify mode is now set to Latest
  7. Navigate to My Items
  8. Click "Create New" and select "BAS Request For Payment" from the dropdown
  9. Verify form opens (title: "Register and Upload Invoice:", status: Draft, Ref No assigned)
  10. Verify Date Received is auto-populated with today's date
  11. Fill Supplier Name: click the field or `...` button → search `Maake` in the entity picker dialog → double-click the result to select
  12. Verify Supplier Details panel populates with supplier info
  13. In the Invoices table, fill Invoice Date and Service Delivery Date
  14. Fill Invoice No
  15. Fill Invoice Amount
  16. Upload Invoice Attachment (required — click the upload button in the Invoice Attachment column and select a file)
  17. Click the plus-circle button to confirm the invoice row
  18. Verify the invoice row appears in the table and Total Amount updates
  19. Click Submit
  20. Verify redirect to My Items
  21. Verify the new record appears at the top of the list with status "Received"
  22. Open the record and verify all fields saved correctly
- **Input data:**
  | Field | Value | Type |
  |-------|-------|------|
  | Type | BAS Request for Payment | Dropdown (Create New menu) |
  | Supplier Name | Maake | Entity picker |
  | Invoice Date | 01/04/2026 | Date picker |
  | Service Delivery Date | 01/04/2026 | Date picker |
  | Invoice No | ITS-TEST-001 | Text |
  | Invoice Amount | 1000 | Number |
  | Invoice Attachment | Any local file (e.g. a .md or .pdf file) | File upload |
- **Expected result:** BAS Request for Payment is created, submitted, and visible in My Items with status "Received" and correct field values
- **Assertions:**
  - [ ] Login successful — dashboard visible
  - [ ] Mode switched to Latest
  - [ ] My Items page loads
  - [ ] New BAS Request form opens with Draft status and a Ref No assigned
  - [ ] Date Received auto-populated
  - [ ] Supplier Name selected and Supplier Details panel populated
  - [ ] Invoice row added with all fields filled
  - [ ] Invoice Attachment uploaded successfully
  - [ ] Total Amount reflects invoice amount
  - [ ] Form submits without errors
  - [ ] New record appears in My Items list with status "Received"
  - [ ] Record name shows "Invoice(s) - ITS-TEST-001 Supplier Name - Maake"

---

## TC-02: Verify BAS Request workflow action changes status
- **Type:** Happy path (workflow)
- **Login:** Admin
- **Prereq:** TC-01 must pass — use the record created there
- **Steps:**
  1. On My Items, locate the record created in TC-01 and click its search icon to open it
  2. Verify current status (should be "Received" / step: "Register and Upload Invoice")
  3. Snapshot to confirm current status and workflow action form
  4. On the workflow action page, locate the Branch Finance Admin field and select `System Administrator`
  5. Snapshot to confirm Branch Finance Admin is selected and Submit is now enabled
  6. Click Submit
  7. Confirm any dialog if prompted
  8. Navigate back to My Items
  9. Locate the record and snapshot to verify progress bar has advanced
- **Expected result:** The "Register and Upload Invoice" workflow step completes and the progress bar advances to the next step
- **Assertions:**
  - [ ] Workflow action page loads with step name visible ("Register and Upload Invoice")
  - [ ] Branch Finance Admin field is present and selectable
  - [ ] Submit becomes enabled after Branch Finance Admin is selected
  - [ ] Status/progress advances after Submit
  - [ ] No error messages shown
  - [ ] Progress bar tooltip confirms step completion with completion date

---

## TC-03: Attempt to submit BAS Request with missing required fields
- **Type:** Negative
- **Login:** Admin
- **Steps:**
  1. Navigate to My Items
  2. Click "Create New" and select "BAS Request For Payment" from the dropdown
  3. Verify the form opens
  4. Leave Supplier Name empty and add no invoices
  5. Observe the Submit button state and any validation messages on the form
  6. Attempt to click Submit
- **Expected result:** Validation prevents submission; the form remains open with an error or disabled Submit; no submitted record is created
- **Assertions:**
  - [ ] Form opens
  - [ ] Submit button is disabled when Supplier Name is empty and no invoices are added
  - [ ] Validation feedback is visible (e.g. warning message or highlighted required fields)
  - [ ] Clicking Submit does nothing — no navigation away from the form, no success toast
