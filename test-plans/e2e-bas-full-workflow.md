# Test Plan: BAS Request for Payment — Full E2E Workflow

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
| Module      | BAS Request for Payment — Full Workflow                               |
| URL         | https://pd-invtracking-adminportal-qa.azurewebsites.net/login        |
| Prereqs     | Mode set to Latest before running any test.                           |
| Last tested | Not yet tested                                                        |
| Status      | Not yet tested                                                        |

---

## Accounts Used
| Role             | Username                          | Password | Used In                                          |
|------------------|-----------------------------------|----------|--------------------------------------------------|
| Finance Unit     | Thulilem                          | 123qwe   | TC-01, TC-02, TC-04, TC-05, TC-07, TC-08, TC-09, TC-11 |
| Business Unit    | TaniaSmith                        | 123qwe   | TC-03, TC-06, TC-12                              |
| Internal Control | Gwenb                             | 123qwe   | TC-06, TC-10, TC-12                              |
| Supplier         | Thulile.Matekanya@boxfusion.io    | 123qwe   | Reference only                                   |

---

## Known Behaviors (observed during execution)
- **Supplier Name** uses an entity picker dialog, not a plain text field. Click the field or the `...` button to open a "Select Item" dialog, search for the supplier name, then double-click the result to select it.
- **Invoice Attachment is required.** Adding an invoice row requires an attachment — without one, the row is rejected. Click the upload button in the Invoice Attachment column before confirming the row.
- **Date Received auto-populates** with today's date. Clear it if a different date is needed.
- **Draft record created on form open.** The application creates and persists a Draft record (with a Ref No) the moment "Create New → BAS Request For Payment" is clicked, before any fields are filled. Closing without submitting leaves an orphaned Draft in the Drafts section.
- **Submit button is disabled** when required fields are empty. This is the primary validation mechanism — there are no field-level inline error messages.
- **Workflow steps may require selecting an assignee** before Submit is enabled. Always snapshot the workflow action page and check for required fields before clicking Submit.

---

## TC-01: Register and Upload Invoice
- **Type:** Happy path
- **Login:** Thulilem (Finance Unit)
- **URL:** https://pd-invtracking-adminportal-qa.azurewebsites.net/login
- **Steps:**
  1. Navigate to the login page
  2. Fill Username with `Thulilem` and Password with `123qwe`
  3. Click Login
  4. Verify login was successful (dashboard loads)
  5. Locate the mode switcher and confirm mode is set to Latest (set it if not already)
  6. Navigate to My Items
  7. Click "Create New" and select "BAS Request For Payment" from the dropdown
  8. Verify form opens (title: "Register and Upload Invoice:", status: Draft, Ref No assigned)
  9. Verify Date Received is auto-populated with today's date
  10. Fill Supplier Name: click the field or `...` button → search `Maake` in the entity picker dialog → double-click the result to select
  11. Verify Supplier Details panel populates with supplier info
  12. Fill Description
  13. In the Invoices table, fill Invoice Date and Service Delivery Date
  14. Fill Invoice No with `ITS-E2E-001`
  15. Fill Invoice Amount with `2500`
  16. Upload Invoice Attachment (required — click the upload button in the Invoice Attachment column and select any local file)
  17. Click the plus-circle button to confirm the invoice row
  18. Verify the invoice row appears in the table and Total Amount updates
  19. Click Submit
  20. Verify redirect to My Items
  21. Verify the new record appears at the top of the list with status "Received"
  22. Note the Ref No for use in subsequent TCs
- **Input data:**
  | Field                  | Value               | Type                          |
  |------------------------|---------------------|-------------------------------|
  | Supplier Name          | Maake               | Entity picker                 |
  | Description            | E2E BAS test run    | Text                          |
  | Invoice Date           | Today's date        | Date picker                   |
  | Service Delivery Date  | Today's date        | Date picker                   |
  | Invoice No             | ITS-E2E-001         | Text                          |
  | Invoice Amount         | 2500                | Number                        |
  | Invoice Attachment     | Any local file      | File upload                   |
- **Expected result:** BAS Request for Payment is created, submitted, and visible in My Items with status "Received" and a Ref No assigned
- **Assertions:**
  - [ ] Login successful — dashboard visible
  - [ ] Mode is set to Latest
  - [ ] My Items page loads
  - [ ] New BAS Request form opens with Draft status and a Ref No assigned
  - [ ] Date Received auto-populated with today's date
  - [ ] Supplier Name selected and Supplier Details panel populated
  - [ ] Description filled
  - [ ] Invoice row added with Invoice No ITS-E2E-001, Invoice Amount 2500
  - [ ] Invoice Attachment uploaded successfully
  - [ ] Total Amount reflects 2500
  - [ ] Form submits without errors
  - [ ] New record appears in My Items with status "Received"

---

## TC-02: Assign Responsible Person to Certify Invoice
- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-01 must pass — use the record created there
- **Steps:**
  1. Navigate to the login page and log in as `Thulilem` (if not already logged in)
  2. Navigate to My Items
  3. Locate the record created in TC-01 and open it
  4. Snapshot to confirm current workflow step is "Assign Person to Certify Invoice"
  5. On the workflow action page, locate the responsible person assignment field
  6. Select `TaniaSmith` as the responsible person
  7. Snapshot to confirm the selection and that Submit is now enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Navigate back to My Items
  11. Locate the record and verify the workflow step has advanced
- **Expected result:** "Assign Person to Certify Invoice" step completes, TaniaSmith is assigned, and the workflow advances to the next step
- **Assertions:**
  - [ ] Workflow action page loads with step "Assign Person to Certify Invoice" visible
  - [ ] Responsible person field is present and TaniaSmith can be selected
  - [ ] Submit becomes enabled after selection
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit
  - [ ] Progress bar reflects advancement

---

## TC-03: Certify Invoice
- **Type:** Happy path (workflow)
- **Login:** TaniaSmith (Business Unit)
- **Prereq:** TC-02 must pass
- **Steps:**
  1. Navigate to the login page and log in as `TaniaSmith` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox
  4. Locate the TC-01 record (use the Ref No noted in TC-01)
  5. Open the record
  6. Snapshot to confirm the current workflow step is "Certify Invoice"
  7. Complete any required fields on the workflow action page
  8. Snapshot to confirm Submit is enabled
  9. Click Submit
  10. Confirm any dialog if prompted
  11. Verify the step completes and the workflow advances
- **Expected result:** Invoice is certified by TaniaSmith and the workflow advances to the next step
- **Assertions:**
  - [ ] Login as TaniaSmith successful
  - [ ] Record is visible in TaniaSmith's Inbox
  - [ ] Workflow step "Certify Invoice" is shown
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-04: Assign Responsible Person to Verify Invoice
- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-03 must pass
- **Steps:**
  1. Navigate to the login page and log in as `Thulilem` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox or My Items
  4. Locate the TC-01 record and open it
  5. Snapshot to confirm the current workflow step is "Assign Responsible Person to Verify Invoice"
  6. On the workflow action page, locate the responsible person assignment field
  7. Select the appropriate responsible person
  8. Snapshot to confirm the selection and that Submit is now enabled
  9. Click Submit
  10. Confirm any dialog if prompted
  11. Verify the step completes and the workflow advances
- **Expected result:** Responsible person for verification is assigned and the workflow advances
- **Assertions:**
  - [ ] Login as Thulilem successful
  - [ ] Record is accessible in Inbox or My Items
  - [ ] Workflow step for assigning verifier is shown
  - [ ] Responsible person field is present and selectable
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-05: Prepare Voucher
- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-04 must pass
- **Steps:**
  1. Log in as `Thulilem` (if not already logged in)
  2. Navigate to Inbox or My Items
  3. Locate the TC-01 record and open it
  4. Snapshot to confirm the current workflow step is "Prepare Voucher"
  5. Complete any required fields on the workflow action page
  6. Snapshot to confirm Submit is enabled
  7. Click Submit
  8. Confirm any dialog if prompted
  9. Verify the step completes and the workflow advances
- **Expected result:** Voucher is prepared and the workflow advances to the next step
- **Assertions:**
  - [ ] Record is accessible in Inbox or My Items
  - [ ] Workflow step "Prepare Voucher" is shown
  - [ ] All required fields on the workflow action page are filled
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-06: Verify Voucher
- **Type:** Happy path (workflow)
- **Login:** Gwenb (Internal Control)
- **Prereq:** TC-05 must pass
- **Steps:**
  1. Navigate to the login page and log in as `Gwenb` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox
  4. Locate the TC-01 record and open it
  5. Snapshot to confirm the current workflow step is "Verify Voucher"
  6. Complete any required fields on the workflow action page
  7. Snapshot to confirm Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify the step completes and the workflow advances
- **Expected result:** Voucher is verified by Internal Control and the workflow advances
- **Assertions:**
  - [ ] Login as Gwenb successful
  - [ ] Record is visible in Gwenb's Inbox
  - [ ] Workflow step "Verify Voucher" is shown
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-07: Approve Invoice
- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-06 must pass
- **Steps:**
  1. Log in as `Thulilem` (if not already logged in)
  2. Navigate to Inbox or My Items
  3. Locate the TC-01 record and open it
  4. Snapshot to confirm the current workflow step is "Approve Invoice"
  5. Complete any required fields on the workflow action page
  6. Snapshot to confirm Submit is enabled
  7. Click Submit
  8. Confirm any dialog if prompted
  9. Verify the step completes and the workflow advances
- **Expected result:** Invoice is approved and the workflow advances to the next step
- **Assertions:**
  - [ ] Record is accessible in Inbox or My Items
  - [ ] Workflow step "Approve Invoice" is shown
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-08: Upload Captured Invoices Report From BAS
- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-07 must pass
- **Steps:**
  1. Log in as `Thulilem` (if not already logged in)
  2. Navigate to Inbox or My Items
  3. Locate the TC-01 record and open it
  4. Snapshot to confirm the current workflow step is "Upload Captured Invoices Report From BAS"
  5. On the workflow action page, locate the report upload field
  6. Upload a local file as the captured invoices report
  7. Snapshot to confirm the file is attached and Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify the step completes and the workflow advances
- **Expected result:** Captured invoices report is uploaded and the workflow advances
- **Assertions:**
  - [ ] Record is accessible in Inbox or My Items
  - [ ] Workflow step "Upload Captured Invoices Report From BAS" is shown
  - [ ] File upload field is present and accepts a local file
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-09: Upload the Final Authorised Invoices Report From BAS
- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-08 must pass
- **Steps:**
  1. Log in as `Thulilem` (if not already logged in)
  2. Navigate to Inbox or My Items
  3. Locate the TC-01 record and open it
  4. Snapshot to confirm the current workflow step is "Upload the Final Authorised Invoices Report From BAS"
  5. On the workflow action page, locate the report upload field
  6. Upload a local file as the final authorised invoices report
  7. Snapshot to confirm the file is attached and Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify the step completes and the workflow advances
- **Expected result:** Final authorised invoices report is uploaded and the workflow advances
- **Assertions:**
  - [ ] Record is accessible in Inbox or My Items
  - [ ] Workflow step "Upload the Final Authorised Invoices Report From BAS" is shown
  - [ ] File upload field is present and accepts a local file
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-10: Capture Filling
- **Type:** Happy path (workflow)
- **Login:** Gwenb (Internal Control)
- **Prereq:** TC-09 must pass
- **Steps:**
  1. Log in as `Gwenb` (if not already logged in)
  2. Navigate to Inbox
  3. Locate the TC-01 record and open it
  4. Snapshot to confirm the current workflow step is "Capture Filling"
  5. Complete any required fields on the workflow action page
  6. Snapshot to confirm Submit is enabled
  7. Click Submit
  8. Confirm any dialog if prompted
  9. Verify the step completes and the workflow advances
- **Expected result:** Filling is captured and the workflow advances to the final step
- **Assertions:**
  - [ ] Record is visible in Gwenb's Inbox
  - [ ] Workflow step "Capture Filling" is shown
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-11: Attach Payment Stub
- **Type:** Happy path (workflow — final step)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-10 must pass
- **Steps:**
  1. Log in as `Thulilem` (if not already logged in)
  2. Navigate to Inbox or My Items
  3. Locate the TC-01 record and open it
  4. Snapshot to confirm the current workflow step is "Attach Payment Stub"
  5. On the workflow action page, locate the payment stub upload field
  6. Upload a local file as the payment stub
  7. Snapshot to confirm the file is attached and Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify the record status updates to "Paid"
  11. Verify the workflow progress bar shows all steps complete
- **Expected result:** Payment stub is attached, record status changes to "Paid", and the full workflow is complete
- **Assertions:**
  - [ ] Record is accessible in Inbox or My Items
  - [ ] Workflow step "Attach Payment Stub" is shown
  - [ ] Payment stub file upload field is present and accepts a local file
  - [ ] Submit completes without errors
  - [ ] Record status updates to "Paid"
  - [ ] Workflow progress bar shows all steps complete
  - [ ] No further workflow actions are available

---

## TC-12: Manage Supplier Related Queries
- **Type:** Exception path
- **Login:** TaniaSmith (Business Unit)
- **Steps:**
  1. Log in as `TaniaSmith` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox or the relevant record where a supplier query has been raised
  4. Locate the workflow action for managing supplier queries
  5. Snapshot to confirm the current state of the record and the query action available
  6. Complete the query management fields (enter response or resolution details)
  7. Snapshot to confirm Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify the query is resolved and the record returns to the main workflow path
  11. Verify the workflow can continue from the appropriate step
- **Expected result:** Supplier query is managed and resolved; the record re-enters the main workflow and can proceed to the next step
- **Assertions:**
  - [ ] Login as TaniaSmith successful
  - [ ] Supplier query action is visible on the record
  - [ ] Query management fields are present and fillable
  - [ ] Submit completes without errors
  - [ ] Query status shows as resolved
  - [ ] Record returns to the main workflow path
  - [ ] Workflow can continue from the appropriate step

---

## TC-13: Review Rejected Invoice
- **Type:** Exception path
- **Login:** Thulilem (Finance Unit)
- **Steps:**
  1. Log in as `Thulilem` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox or My Items
  4. Locate a record where an invoice has been rejected
  5. Open the record and snapshot to confirm the rejection state and the available review action
  6. Review the rejection details / reason
  7. Take corrective action as required (update invoice details, re-upload, or respond to the rejection)
  8. Snapshot to confirm the corrective action fields are filled and Submit is enabled
  9. Click Submit
  10. Confirm any dialog if prompted
  11. Verify the record re-enters the workflow at the appropriate step
- **Expected result:** Rejected invoice is reviewed, corrective action is taken, and the record re-enters the workflow at the appropriate step
- **Assertions:**
  - [ ] Login as Thulilem successful
  - [ ] Rejected record is accessible in Inbox or My Items
  - [ ] Rejection details / reason are visible on the record
  - [ ] Corrective action fields are present and fillable
  - [ ] Submit completes without errors
  - [ ] Record re-enters the workflow at the appropriate step
  - [ ] Workflow can continue from that step
