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
| Last tested | 2026-04-02                                                            |
| Status      | TC-01 to TC-07 PASS; TC-08 BLOCKED (no Submit button); TC-09–TC-13 NOT RUN |

---

## Accounts Used
| Role             | Username                          | Password | Used In                                          |
|------------------|-----------------------------------|----------|--------------------------------------------------|
| Finance Unit     | Thulilem                          | 123qwe   | TC-01, TC-02, TC-06, TC-07, TC-08, TC-09, TC-11, TC-13 |
| Business Unit    | TaniaSmith                        | 123qwe   | TC-03, TC-05, TC-12                              |
| Internal Control | Gwenb                             | 123qwe   | TC-10, TC-12                                     |
| Supplier         | Thulile.Matekanya@boxfusion.io    | 123qwe   | Reference only                                   |

---

## Known Behaviors (observed during execution)
- **Supplier Name** uses an entity picker dialog, not a plain text field. Click the field or the `...` button to open a "Select Item" dialog, search for the supplier name, then double-click the result to select it.
- **Invoice Attachment is required.** Adding an invoice row requires an attachment — without one, the row is rejected. Click the upload button in the Invoice Attachment column before confirming the row.
- **Date Received auto-populates** with today's date. Clear it if a different date is needed.
- **Draft record created on form open.** The application creates and persists a Draft record (with a Ref No) the moment "Create New → BAS Request For Payment" is clicked, before any fields are filled. Closing without submitting leaves an orphaned Draft in the Drafts section.
- **Submit button is disabled** when required fields are empty. This is the primary validation mechanism — there are no field-level inline error messages.
- **Workflow steps may require selecting an assignee** before Submit is enabled. Always snapshot the workflow action page and check for required fields before clicking Submit.
- **Mode switcher UI shows "Live"** even when the mode is correctly set to "Latest" (stored in localStorage as `CONFIGURATION_ITEM_MODE="latest"`). The badge label is a display bug — the actual mode is Latest.
- **Post-submit navigation varies by step**: Some steps load the next step inline; others redirect to My Items. Do not assume consistent post-submit behaviour.
- **File-to-PDF conversion**: Any file uploaded as an invoice attachment is automatically converted to PDF by the server after submission. The file is stored as `.pdf` regardless of original format.
- **Attachment file size grows across steps**: The PDF attachment may be re-processed on each workflow step, resulting in an increased file size in the details view.
- **Total Amount shows "R 0" or "R undefined" during page transition** on some workflow steps. This is a transient loading bug — the correct amount loads after a brief delay.
- **Inbox page is titled "Incoming Items"** (not "Inbox"). Access via the Inbox nav link.
- **Create New dropdown has two options**: "BAS Request For Payment" and "test-workflow". Always select "BAS Request For Payment".
- **Certify Invoice requires a radio selection** (satisfactory / not satisfactory) before Submit is enabled.
- **Prepare Voucher requires both an Outcome radio selection AND a 4-item Yes/No checklist** before Submit is enabled.
- **Verify Voucher requires a Batch Number (required field) and a confirmation checkbox** before Submit is enabled. Owner is Thulilem (Finance Unit), not Gwenb (Internal Control).
- **Authorise Invoice Voucher requires only a confirmation checkbox** before Submit is enabled. Step name in the test plan was "Approve Invoice" — actual name is "Authorise Invoice Voucher".
- **[BUG] TC-08 "Upload Captured Invoices Report From BAS" has no Submit button**: The workflow action page renders the general record details view with only an "Other Documents" upload section and a Close button. The step cannot be completed via the UI. Raised as a defect — do not attempt until fixed.

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
  5. Confirm mode is Latest — the UI badge may show "Live" even when correctly set. Verify via browser localStorage key `CONFIGURATION_ITEM_MODE` = `"latest"` if needed.
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
  20. **After Submit, the next workflow step loads inline — the app does NOT redirect to My Items.** Note the step title and status shown.
  21. Verify status shown on the next step header is "Received"
  22. Note the Ref No shown on the page for use in subsequent TCs
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
  - [ ] Next workflow step loads inline — status shown as "Received"

---

## TC-02: Assign Branch Finance Admin To Assign Certifier
> **[UPDATED 2026-04-02]** Step name and field label have changed. Previously documented as "Assign Responsible Person to Certify Invoice" with field "Responsible Person". Actual step is "Assign Branch Finance Admin To Assign Certifier" with field "Branch Finance Admin".

- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-01 must pass — the next step loads inline after TC-01 submit
- **Steps:**
  1. After TC-01 submit, the step "Assign Branch Finance Admin To Assign Certifier" loads inline
  2. Snapshot to confirm step heading is "Assign Branch Finance Admin To Assign Certifier" and status is "Received"
  3. Locate the **"Branch Finance Admin"** combobox field
  4. Type `Tania` and select `Tania Smith` from the dropdown
  5. Snapshot to confirm selection and that Submit is now enabled
  6. Click Submit
  7. Confirm any dialog if prompted
  8. Verify the app redirects to **My Items** (post-submit from this step goes to My Items, not inline)
  9. Locate PAY4718/2026 at the top of My Items list with status "Received"
- **Expected result:** "Assign Branch Finance Admin To Assign Certifier" step completes, Tania Smith is assigned, and the app redirects to My Items
- **Assertions:**
  - [ ] Step heading shows "Assign Branch Finance Admin To Assign Certifier"
  - [ ] "Branch Finance Admin" field is present and Tania Smith can be selected
  - [ ] Submit becomes enabled after selection
  - [ ] Submit completes without errors
  - [ ] App redirects to My Items after Submit
  - [ ] Record visible in My Items with status "Received"

---

## TC-03: Assign Responsible Person to Certify Invoice + Certify Invoice
> **[UPDATED 2026-04-02]** Previously a single step "Certify Invoice". Now split into two sequential steps, both performed by TaniaSmith: (A) Assign the certifier, then (B) Certify.

- **Type:** Happy path (workflow)
- **Login:** TaniaSmith (Business Unit)
- **Prereq:** TC-02 must pass

### TC-03a: Assign Responsible Person to Certify Invoice
- **Steps:**
  1. Navigate to the login page and log in as `TaniaSmith` with password `123qwe`
  2. Verify login successful — header shows "Tania Smith"
  3. Navigate to **Inbox** ("Incoming Items" page title)
  4. Locate the TC-01 record by Ref No — "Action Required" column shows "Assign Responsible Person to Certify Invoice"
  5. Click the search icon to open the workflow action
  6. Snapshot to confirm step heading is "Assign Responsible Person to Certify Invoice"
  7. Locate the **"Official"** combobox field
  8. Type `Tania` and select `Tania Smith` from the dropdown
  9. Snapshot to confirm Submit is enabled
  10. Click Submit
  11. Confirm any dialog if prompted
  12. Verify the "Certify Invoice" step loads **inline** (no redirect)

### TC-03b: Certify Invoice
- **Steps (continuing from TC-03a, inline):**
  1. Snapshot to confirm step heading is "Certify Invoice" and status is "Received"
  2. Under **"Business Unit Responses"**, select the appropriate radio button:
     - For happy path: "Goods and Service has been delivered satisfactory - Invoice should be paid"
  3. Snapshot to confirm Submit is now enabled
  4. Click Submit
  5. Confirm any dialog if prompted
  6. Verify the "Prepare Voucher" step loads **inline**
  7. Verify status updates to **"Certified"**

- **Expected result:** Both sub-steps complete — certifier is assigned, invoice is certified, status is "Certified", workflow advances to Prepare Voucher
- **Assertions:**
  - [ ] Login as TaniaSmith successful
  - [ ] Record visible in Inbox with Action Required "Assign Responsible Person to Certify Invoice"
  - [ ] TC-03a: Step heading "Assign Responsible Person to Certify Invoice" shown
  - [ ] TC-03a: "Official" field present and Tania Smith selectable
  - [ ] TC-03a: Submit enabled and completes without errors
  - [ ] TC-03a: "Certify Invoice" loads inline after submit
  - [ ] TC-03b: Radio buttons for Business Unit Responses visible
  - [ ] TC-03b: Submit enabled after radio selection
  - [ ] TC-03b: Submit completes without errors
  - [ ] TC-03b: Status updates to "Certified"
  - [ ] TC-03b: "Prepare Voucher" loads inline after submit

---

## TC-04: ~~Assign Responsible Person to Verify Invoice~~ — OBSOLETE
> **[REMOVED 2026-04-02]** This step no longer exists in the BAS workflow. During the 2026-04-02 test run, the workflow proceeded directly from "Certify Invoice" to "Prepare Voucher" — the "Assign Responsible Person to Verify Invoice" step (Thulilem, Finance Unit) was absent. Confirm with the development team whether this step has been removed or is pending reimplementation.

- **Status:** Obsolete — skip this TC until confirmed with dev/business team

---

## TC-05: Prepare Voucher
> **[UPDATED 2026-04-02]** Step owner changed from Thulilem (Finance Unit) to TaniaSmith (Business Unit). Step now has an Outcome radio (4 options) and a 4-item Yes/No Business Unit Response checklist. Step loads inline after TC-03b submit.

- **Type:** Happy path (workflow)
- **Login:** TaniaSmith (Business Unit) — step loads inline after Certify Invoice
- **Prereq:** TC-03b must pass
- **Steps:**
  1. After TC-03b submit, the "Prepare Voucher" step loads **inline**
  2. Snapshot to confirm step heading is "Prepare Voucher" and status is "Certified"
  3. Under **"Outcome"**, select: `Verification is complete`
  4. Under **"Business Unit Response"**, answer all 4 checklist items with **Yes**:
     - "Received ALL the different supporting documents."
     - "Prepare a payment voucher pack using a checklist of ALL documents needed..."
     - "Confirms the work performed on the Invoice Tracking system ready for transfer..."
     - "Reconcile the physical list of Vouchers prepared..."
  5. Snapshot to confirm Submit is now enabled
  6. Click Submit
  7. Confirm any dialog if prompted
  8. Verify the app redirects to **My Items**
  9. The record is no longer in TaniaSmith's queue (passed to next owner)
- **Expected result:** Voucher is prepared, all checklist items answered Yes, and the workflow advances
- **Assertions:**
  - [ ] Step heading "Prepare Voucher" shown with status "Certified"
  - [ ] "Outcome" radio buttons present with 4 options
  - [ ] "Business Unit Response" checklist present with 4 Yes/No questions
  - [ ] Submit enabled after Outcome selected and all checklist items answered
  - [ ] Submit completes without errors
  - [ ] App redirects to My Items after Submit
  - [ ] Record no longer in TaniaSmith's queue

---

## TC-06: Verify Voucher
> **[UPDATED 2026-04-02]** Owner changed from Gwenb (Internal Control) to Thulilem (Finance Unit). Step now requires a Batch Number field (required) and a confirmation checkbox. Post-submit loads next step inline.

- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit)
- **Prereq:** TC-05 must pass
- **Steps:**
  1. Log in as `Thulilem` with password `123qwe` (if not already logged in)
  2. Verify login successful — header shows "Thulile Matekanya"
  3. Navigate to **Inbox** ("Incoming Items")
  4. Search for the TC-01 record by Ref No — "Action Required" column shows "Verify Voucher"
  5. Click the search icon to open the workflow action
  6. Snapshot to confirm step heading is "Verify Voucher" and status is "Certified"
  7. Locate the **"Batch Number"** field (required, marked with *)
  8. Fill Batch Number with a value (e.g. `BATCH-E2E-001`)
  9. Check the confirmation checkbox: "I confirm that I have reviewed the payment and supporting information"
  10. Snapshot to confirm Submit is now enabled
  11. Click Submit
  12. Confirm any dialog if prompted
  13. Verify **"Authorise Invoice Voucher"** step loads **inline** (no redirect)
  14. Verify status updates to **"Verified"**
- **Expected result:** Voucher is verified by Thulilem (Finance Unit) and the workflow advances inline to Authorise Invoice Voucher
- **Assertions:**
  - [ ] Login as Thulilem successful
  - [ ] Record is visible in Thulilem's Inbox with Action Required "Verify Voucher"
  - [ ] Step heading "Verify Voucher" shown, status "Certified"
  - [ ] Batch Number field present and fillable
  - [ ] Confirmation checkbox present
  - [ ] Submit disabled until both Batch Number filled and checkbox checked
  - [ ] Submit completes without errors
  - [ ] "Authorise Invoice Voucher" loads inline after submit
  - [ ] Status updates to "Verified"

---

## TC-07: Authorise Invoice Voucher
> **[UPDATED 2026-04-02]** Step renamed from "Approve Invoice" to "Authorise Invoice Voucher". Step loads inline after TC-06. Requires only a confirmation checkbox — no other input fields. Post-submit loads TC-08 inline.

- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit) — step loads inline after TC-06 submit
- **Prereq:** TC-06 must pass
- **Steps:**
  1. After TC-06 submit, "Authorise Invoice Voucher" loads **inline**
  2. Snapshot to confirm step heading is "Authorise Invoice Voucher" and status is "Verified"
  3. Verify invoice details are displayed correctly (Total Amount R 2500)
  4. Check the confirmation checkbox: "I confirm that I have reviewed and approve the invoice, payment details and all supporting information."
  5. Snapshot to confirm Submit is now enabled
  6. Click Submit
  7. Confirm any dialog if prompted
  8. Verify **"Upload Captured Invoices Report From BAS"** step loads **inline**
  9. Verify status updates to **"Approved"**
- **Expected result:** Invoice voucher is authorised by Thulilem and the workflow advances inline to the next step
- **Assertions:**
  - [ ] Step heading "Authorise Invoice Voucher" shown, status "Verified"
  - [ ] Confirmation checkbox present and required
  - [ ] Submit disabled until checkbox checked
  - [ ] Submit completes without errors
  - [ ] "Upload Captured Invoices Report From BAS" loads inline after submit
  - [ ] Status updates to "Approved"

---

## TC-08: Upload Captured Invoices Report From BAS
> **[BLOCKED 2026-04-02]** Step loads inline after TC-07 but has **no Submit button**. The workflow action page renders the general BAS request details view (`SAGov-BAS-request-for-payment-details v11`) with only an "Other Documents" upload section and a Close button. Uploading a file saves it to the record but does not advance the workflow. Clicking Close navigates back to the previous step. **This step is blocked pending a fix from the development team.**

- **Type:** Happy path (workflow)
- **Login:** Thulilem (Finance Unit) — step loads inline after TC-07 submit
- **Prereq:** TC-07 must pass
- **Status:** BLOCKED — no Submit button on workflow action page
- **Steps (when unblocked):**
  1. After TC-07 submit, "Upload Captured Invoices Report From BAS" should load inline
  2. Snapshot to confirm step heading and status "Approved"
  3. Locate the report upload section
  4. Upload a local file as the Captured Invoices Report from BAS
  5. Snapshot to confirm the file is attached and Submit is enabled
  6. Click Submit
  7. Confirm any dialog if prompted
  8. Verify the step completes and the workflow advances
- **Expected result:** Captured invoices report is uploaded and the workflow advances
- **Assertions:**
  - [ ] Step heading "Upload Captured Invoices Report From BAS" shown, status "Approved"
  - [ ] File upload field is present and accepts a local file
  - [ ] **[FAILING 2026-04-02] Submit button is present** — currently absent; workflow cannot advance
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
