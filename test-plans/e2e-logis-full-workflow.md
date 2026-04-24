# Test Plan: LOGIS Request for Payment — Full E2E Workflow

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
| Module      | LOGIS Request for Payment — Full Workflow                             |
| URL         | https://pd-invtracking-adminportal-qa.azurewebsites.net/login        |
| Prereqs     | Mode set to Latest before running any test.                           |
| Last tested | Not yet tested                                                        |
| Status      | Not yet tested                                                        |

---

## Accounts Used (verified against actual QA routing on 2026-04-21)
| Role                      | Username                          | Password | Used In                       |
|---------------------------|-----------------------------------|----------|-------------------------------|
| SCM                       | Moshadim                          | 123qwe   | TC-01, TC-06, TC-07           |
| Business Unit             | TaniaSmith                        | 123qwe   | TC-02, TC-05, TC-14, TC-15    |
| Finance Unit              | Thulilem                          | 123qwe   | TC-03 (Approve Invoice — happens EARLY, right after Certify) |
| Branch Finance            | **sarahm** (Sarah Mohlala)        | 123qwe   | TC-04 (primary; fallbacks: jackb, monicak, mahlatsem) |
| Internal Control          | Gwenb                             | 123qwe   | TC-08, TC-11                  |
| Admin                     | Admin                             | 123qwe   | TC-09 (BAS Report Import), TC-10 (Payment Stubs Import) |
| SCM Supervisor            | Eunicem                           | 123qwe   | TC-13 (exception path only — not used in happy path) |
| Business Unit Supervisor  | Tiyih                             | 123qwe   | **NOT USED** in LOGIS happy path (TC-15 exception only) |
| Supplier                  | Thulile.Matekanya@boxfusion.io    | 123qwe   | Reference only                |

### Happy-path sequence at a glance
`Moshadim → TaniaSmith → Thulilem → sarahm → TaniaSmith → Moshadim → Moshadim → Gwenb → Admin (BAS import) → Admin (Stub import) → Gwenb`

---

## Known Behaviors (observed during execution)
- **Supplier Name** uses an entity picker dialog, not a plain text field. Click the field or the `...` button to open a "Select Item" dialog, search for the supplier name, then double-click the result to select it.
- **Invoice Attachment is required.** Adding an invoice row requires an attachment — without one, the row is rejected. Click the upload button in the Invoice Attachment column before confirming the row.
- **Date Received auto-populates** with today's date. Clear it if a different date is needed.
- **Draft record created on form open.** The application creates and persists a Draft record (with a Ref No) the moment "Create New → LOGIS Request For Payment" is clicked, before any fields are filled. Closing without submitting leaves an orphaned Draft in the Drafts section.
- **Submit button is disabled** when required fields are empty. This is the primary validation mechanism — there are no field-level inline error messages.
- **Workflow steps may require selecting an assignee** before Submit is enabled. Always snapshot the workflow action page and check for required fields before clicking Submit.
- **TC-01 form is Order-first.** The current LOGIS form asks for Order No FIRST (entity picker). Selecting the Order auto-populates Supplier, Business Unit, Email, and Order Description. Then add the invoice row (Invoice Date, Service Delivery Date, Invoice No, Amount, Attachment) and click plus-circle to commit, then Submit.
- **TC-03 is Approve Invoice by Thulilem (Finance), NOT Tiyih (BU Supervisor).** After Certify at TC-02, the record goes directly to Thulilem's inbox labelled "Approve Invoice". Tiyih is never used in the happy path. (Originally the test plan had Tiyih at TC-03 — confirmed wrong on 2026-04-21 runs.)
- **TC-04 is assigned to `sarahm` (Sarah Mohlala) — Branch Finance — NOT Eunicem (SCM Supervisor).** Confirmed via progress-hover tooltip on 2026-04-21. Alternate assignees: `jackb`, `monicak`, `mahlatsem`. Eunicem only appears in TC-13 exception path.
- **TC-06 Capture and Link requires Payment Number on the invoice row (inline editor).** Click into the Payment Number textbox on the existing invoice row, type the Ref No digits (e.g. `5554` for PAY5554/2026), then click the small inline "save" icon to commit the row. Submit is only enabled after: Payment Number saved, "Yes" radio for "Should payment proceed?", and the "I confirm that I have captured this invoice on payment system" checkbox/button ticked.
- **TC-09 Final Authorise Payment has NO workflow-action UI.** There is no inbox entry for this step. The record advances when Admin imports a matching BAS Payment Register (`sidebar → BAS Report → BAS Report Import → upload → Import`). A successful advance shows `Is Success: Yes` and `Payments Authorised: 1` in the History tab.
- **TC-10 Attach Payment Stub also has NO workflow-action UI.** The record advances when Admin imports the matching payment stub (`sidebar → Payment Stubs Import → Import Payment Stub → upload → Import`). Success = `Is Success: Yes` and `Payments Confirmed: 1` in History. Only after this does the record status become `Paid`.
- **Progress indicator hover is the source of truth for "who's assigned now".** On the record detail page (`/shesha/workflow?id=…`), hover over each of the 11 progress dots above the heading to see tooltips like `Verify Voucher | Gwen Simbeni | Received on: ...`. This is faster and more reliable than checking each user's inbox.
- **LOGIS stub field mapping differs from BAS.** For LOGIS stubs: Source Doc Number = Invoice Number (from TC-01), Purchase Order Number = Order Number (from TC-01). BAS stubs use `NOT APPLIC` for Purchase Order. Payment Number = record Ref No digits; Amount must match the invoice total.
- **Order entity picker search — Enter key does not work.** Typing an order number and pressing Enter returns "No Data". Clear the input via JavaScript (native value setter + input/change events), then click the search icon. Alternatively, browse pages to find the correct order row and double-click to select.
- **TC-01 must be run as Moshadim (not Admin).** Workflow routing downstream depends on the creator's SCM role. Running TC-01 as Admin causes routing problems.

---

## TC-01: Register and Upload Invoice
- **Type:** Happy path
- **Login:** Moshadim (SCM)
- **URL:** https://pd-invtracking-adminportal-qa.azurewebsites.net/login
- **Steps:**
  1. Navigate to the login page
  2. Fill Username with `Moshadim` and Password with `123qwe`
  3. Click Login
  4. Verify login was successful (dashboard loads)
  5. Locate the mode switcher and confirm mode is set to Latest (set it if not already)
  6. Navigate to My Items
  7. Click "Create New" and select "LOGIS Request For Payment" from the dropdown
  8. Verify form opens (title: "Register and Upload Invoice:", status: Draft, Ref No assigned)
  9. Verify Date Received is auto-populated with today's date
  10. Fill Supplier Name: click the field or `...` button → search `GEMINI MOON TRADING 7` in the entity picker dialog → double-click the result to select
  11. Verify Supplier Details panel populates with supplier info
  12. Fill Description
  13. In the Invoices table, fill Invoice Date and Service Delivery Date
  14. Fill Invoice No with `ITS-LOGIS-001`
  15. Fill Invoice Amount with `3000`
  16. Upload Invoice Attachment (required — click the upload button in the Invoice Attachment column and select any local file)
  17. Click the plus-circle button to confirm the invoice row
  18. Verify the invoice row appears in the table and Total Amount updates
  19. Click Submit
  20. Verify redirect to My Items
  21. Verify the new record appears at the top of the list with status "Received"
  22. Note the Ref No for use in subsequent TCs
- **Input data:**
  | Field                  | Value                    | Type                          |
  |------------------------|--------------------------|-------------------------------|
  | Supplier Name          | GEMINI MOON TRADING 7    | Entity picker                 |
  | Description            | E2E LOGIS test run       | Text                          |
  | Invoice Date           | Today's date             | Date picker                   |
  | Service Delivery Date  | Today's date             | Date picker                   |
  | Invoice No             | ITS-LOGIS-001            | Text                          |
  | Invoice Amount         | 3000                     | Number                        |
  | Invoice Attachment     | Any local file           | File upload                   |
- **Expected result:** LOGIS Request for Payment is created, submitted, and visible in My Items with status "Received" and a Ref No assigned
- **Assertions:**
  - [ ] Login as Moshadim successful — dashboard visible
  - [ ] Mode is set to Latest
  - [ ] My Items page loads
  - [ ] New LOGIS Request form opens with Draft status and a Ref No assigned
  - [ ] Date Received auto-populated with today's date
  - [ ] Supplier Name "GEMINI MOON TRADING 7" selected and Supplier Details panel populated
  - [ ] Description filled
  - [ ] Invoice row added with Invoice No ITS-LOGIS-001, Invoice Amount 3000
  - [ ] Invoice Attachment uploaded successfully
  - [ ] Total Amount reflects 3000
  - [ ] Form submits without errors
  - [ ] New record appears in My Items with status "Received"

---

## TC-02: Certify Invoice
- **Type:** Happy path (workflow)
- **Login:** TaniaSmith (Business Unit)
- **Prereq:** TC-01 must pass — use the record created there
- **Steps:**
  1. Navigate to the login page and log in as `TaniaSmith` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox
  4. Locate the TC-01 record (use the Ref No noted in TC-01) and open it
  5. Snapshot to confirm the current workflow step is "Certify Invoice"
  6. Complete any required fields on the workflow action page
  7. Snapshot to confirm Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify the step completes and the workflow advances
- **Expected result:** Invoice is certified by TaniaSmith and the workflow advances to the next step
- **Assertions:**
  - [ ] Login as TaniaSmith successful
  - [ ] Record is visible in TaniaSmith's Inbox
  - [ ] Workflow step "Certify Invoice" is shown
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-03: Approve Invoice (Finance Unit — Thulilem)
- **Type:** Happy path (workflow)
- **Login:** **Thulilem (Finance Unit)** — NOT Tiyih. Confirmed via progress-hover on 2026-04-21 runs: after TC-02 Certify, the record routes directly to Thulilem's inbox labelled "Approve Invoice". Tiyih is NOT used in the LOGIS happy path.
- **Prereq:** TC-02 must pass
- **IMPORTANT:** Don't confuse with the later Final Authorise step. This is the early Finance Approve (step 3 in the real workflow), happens straight after Certify.
- **Steps:**
  1. Log out TaniaSmith, log in as `Thulilem` with password `123qwe`
  2. Navigate to Inbox, search the PAY Ref No from TC-01
  3. The record's Action column = `Approve Invoice`, Status = `Certified`. Open it.
  4. Select radio **"Goods and Service has been delivered satisfactory - Invoice should be paid"** (value 1, happy path)
  5. Click Submit
- **Expected result:** Record advances; appears in `sarahm`'s inbox at "Assign Responsible Official"
- **Assertions:**
  - [ ] Thulilem login successful
  - [ ] Record at `Approve Invoice` in Thulilem's Inbox with status `Certified`
  - [ ] Happy-path radio selected
  - [ ] Submit completes; workflow advances

---

## TC-04: Assign Responsible Official (Branch Finance — sarahm)
- **Type:** Happy path (workflow)
- **Login:** **sarahm (Sarah Mohlala — Branch Finance)** — NOT Eunicem. Confirmed across 2026-04-20 and 2026-04-21 runs. Fallback users if sarahm unavailable: `jackb`, `monicak`, `mahlatsem`. Eunicem (SCM Supervisor) is only used in TC-13 exception path.
- **Prereq:** TC-03 must pass
- **Steps:**
  1. Log out Thulilem, log in as `sarahm` with password `123qwe`
  2. Navigate to Inbox, search the PAY Ref No
  3. Open the record; Action = `Assign Responsible Official`
  4. Click the `Official` combobox; type `Tania` in the search; select `Tania Smith`
  5. Click Submit
- **Expected result:** Record advances; appears in Tania's inbox at "Verify Invoice"
- **Assertions:**
  - [ ] sarahm login successful
  - [ ] Record at `Assign Responsible Official` in her Inbox
  - [ ] Official combobox searchable; Tania Smith selected
  - [ ] Submit completes; workflow advances

---

## TC-05: Verify Invoice
- **Type:** Happy path (workflow)
- **Login:** TaniaSmith (Business Unit — assigned in TC-04)
- **Prereq:** TC-04 must pass
- **Steps:**
  1. Navigate to the login page and log in as `TaniaSmith` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox
  4. Locate the TC-01 record and open it
  5. Snapshot to confirm the current workflow step is "Verify Invoice"
  6. Complete any required fields on the workflow action page
  7. Snapshot to confirm Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify the step completes and the workflow advances
- **Expected result:** Invoice is verified and the workflow advances to the next step
- **Assertions:**
  - [ ] Login as TaniaSmith successful
  - [ ] Record is visible in TaniaSmith's Inbox
  - [ ] Workflow step "Verify Invoice" is shown
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-06: Capture and Link Invoice on LOGIS
- **Type:** Happy path (workflow)
- **Login:** Moshadim (SCM)
- **Prereq:** TC-05 must pass
- **Steps:**
  1. Navigate to the login page and log in as `Moshadim` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox or My Items
  4. Locate the TC-01 record and open it
  5. Snapshot to confirm the current workflow step is "Capture and Link Invoice on LOGIS"
  6. Complete any required fields on the workflow action page (capture/link invoice details)
  7. Snapshot to confirm Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify the step completes and the workflow advances
- **Expected result:** Invoice is captured and linked on LOGIS and the workflow advances
- **Assertions:**
  - [ ] Login as Moshadim successful
  - [ ] Record is accessible in Inbox or My Items
  - [ ] Workflow step "Capture and Link Invoice on LOGIS" is shown
  - [ ] Required fields are present and fillable
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-07: Pre-Authorise Payment
- **Type:** Happy path (workflow)
- **Login:** Moshadim (SCM)
- **Prereq:** TC-06 must pass
- **Steps:**
  1. Log in as `Moshadim` (if not already logged in)
  2. Navigate to Inbox or My Items
  3. Locate the TC-01 record and open it
  4. Snapshot to confirm the current workflow step is "Pre-Authorise Payment"
  5. Complete any required fields on the workflow action page
  6. Snapshot to confirm Submit is enabled
  7. Click Submit
  8. Confirm any dialog if prompted
  9. Verify the step completes and the workflow advances
- **Expected result:** Payment is pre-authorised and the workflow advances to the next step
- **Assertions:**
  - [ ] Record is accessible in Inbox or My Items
  - [ ] Workflow step "Pre-Authorise Payment" is shown
  - [ ] Submit completes without errors
  - [ ] Workflow step advances after Submit

---

## TC-08: Verify Voucher
- **Type:** Happy path (workflow)
- **Login:** Gwenb (Internal Control)
- **Prereq:** TC-07 must pass
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

## TC-09: Approve Invoice (Finance Unit) — **ALREADY DONE AT TC-03, SKIP**
- **Type:** ⚠️ **Obsolete — do not run.** The original test plan placed Finance Approve at TC-09, but the actual QA workflow runs it at step 3 (right after Certify). This TC-09 was handled by TC-03 (Approve Invoice — Finance Unit — Thulilem). Leave this entry in the plan for historical reference but skip it in execution.
- **If you see the record at "Approve Invoice" action assigned to Thulilem AFTER TC-08**, something is wrong with the workflow routing — investigate via progress-hover. In the standard happy path, after TC-08 Verify Voucher the next step is TC-10 Final Authorise Payment (Admin BAS import).
- **Assertions:**
  - [x] SKIPPED — equivalent step was performed at TC-03

---

## TC-10: Final Authorise Payment (Admin — via BAS Report Import)
- **Type:** Happy path — **NO workflow-action UI; advance via Admin BAS Report import**
- **Login:** **Admin** — NOT Thulilem. There is no inbox entry for this step; Thulilem is the conceptual role but the advancement is done by Admin importing a matching BAS Payment Register.
- **Prereq:** TC-08 must pass; record at "Final Authorise Payment" (confirm via progress-hover on the record detail page — won't appear in any user's Inbox)
- **Note (file prep):** The backend matches the BAS row by FUNC NO / SOURCE DOC NUMBER / AMOUNT, but **also requires H10/O10/P10/Q10 date columns to be today's date** or the auto-authorise trigger silently skips (Matched: 1 / Payments Authorised: 0). Headers are on row 9 of the .xlsx, data on row 10.
- **Steps:**
  1. Prepare `test-data/bas-registers/BAS Payment Register LOGIS-<tag>.xlsx` by copying an existing LOGIS BAS register and editing **7 cells** (previously this said 3 — that's wrong, stale dates in the 4 date columns will cause the import to silently fail):
     - **C10 FUNC NO** = Ref No digits, numeric type (e.g. `5592` for PAY5592/2026)
     - **H10 INV RECDTE** = today's Excel serial, numeric (e.g. `46134` for 2026-04-22)
     - **I10 SOURCE DOC NUMBER** = Invoice No from TC-01, string (e.g. `ITS-LOGIS-20260422-S`)
     - **O10 CAPTURE DATE** = today's Excel serial, numeric
     - **P10 AUTH DATE** = today's Excel serial, numeric
     - **Q10 INV DATE** = today's Excel serial, numeric
     - **T10 AMOUNT** = invoice total, numeric (e.g. `2000`)
     - (Excel serial helper: `Math.floor((new Date('YYYY-MM-DD') - new Date('1899-12-30')) / 86400000)`)
     - (Fast method: node+xlsx script — set ws.C10.v, ws.H10.v, ws.I10.v, ws.O10.v, ws.P10.v, ws.Q10.v, ws.T10.v and writeFile)
  2. Log in as `Admin` with password `123qwe`
  3. Sidebar → `BAS Report` → `BAS Report Import`
  4. Click `press to upload`, select the prepared `.xlsx`, click `Import`
  5. Click the `History` tab; verify top row:
     - Is Success: `Yes`
     - **Payments Authorised: `1`** (if 0, check FUNC NO / SOURCE DOC / AMOUNT match the pending record exactly)
- **Expected result:** Record advances to "Attach Payment Stub" — another Admin-import step handled by TC-11
- **Assertions:**
  - [ ] BAS .xlsx has correct FUNC NO, SOURCE DOC, AMOUNT in row 10
  - [ ] Admin login successful
  - [ ] BAS Report Import page loads
  - [ ] Upload + Import complete without error
  - [ ] History top row: `Is Success: Yes`, `Payments Authorised: 1`

---

## TC-11: Attach Payment Stub
- **Type:** Happy path (workflow)
- **Login:** Admin (System Administrator) — uploads the stub on behalf of the Attach Payment Stub step, even though the step is assigned to Thulilem (Finance Unit)
- **Prereq:** TC-10 must pass; the record should be at the "Attach Payment Stub" step in Thulilem's inbox
- **Note:** The stub upload is performed via Admin's **Payment Stubs Import** (sidebar menu → `Payment Stubs Import → Import Payment Stub`), NOT via the workflow action page. Before importing, open the stub file and confirm all four fields match the current record.
- **Steps:**
  1. Open `test-data/payment-stubs/training STUB LOGIS-<YYYYMMDD>.txt` (or the current LOGIS stub) and verify/update:
     - **SOURCE DOC NUMBER** = Invoice Number from TC-01 (e.g. `ITS-LOGIS-20260421`)
     - **PURCHASE ORDER NUMBER** = Order Number from TC-06 (e.g. `ORDER-00024`) — NOT `NOT APPLIC`
     - **PAYMENT NUMBER** = record Ref No digits (e.g. `5541` for PAY5541/2026)
     - **AMOUNT** = invoice total (e.g. `3,000.00`)
  2. Log in as `Admin` with password `123qwe`
  3. In the sidebar, click `Payment Stubs Import` → `Import Payment Stub`
  4. Click the upload button (press to upload) and select the updated stub file
  5. Click the `Import` button
  6. Wait for the import to complete (file field clears, Import button disables)
  7. Click the `History` tab and verify the top row shows:
     - Is Success: `Yes`
     - Rows Affected: `1`, Rows Skipped: `0`
     - **Payments Confirmed: `1`** (if 0, the record was not at the Attach Payment Stub step — re-check the workflow state)
  8. Log out of Admin. Log in as `Thulilem` (or any role) and verify the record has advanced — it should no longer be in Thulilem's inbox at "Attach Payment Stub"; it should now be in Gwenb's inbox at "Capture Filling" with status `Paid`
- **Expected result:** Payment stub is imported successfully, payment is confirmed, record status changes to `Paid`, and the workflow advances to Capture Filling (TC-12)
- **Assertions:**
  - [ ] Stub file fields updated: Source Doc = Invoice No, Purchase Order = Order No, Payment Number = record Ref No, Amount matches
  - [ ] Admin login successful
  - [ ] Payment Stubs Import page loads
  - [ ] File uploads without errors
  - [ ] Import button enables after file selection
  - [ ] Import completes (file field clears, button disables)
  - [ ] History tab shows `Is Success: Yes`, `Rows Affected: 1`, `Rows Skipped: 0`, `Payments Confirmed: 1`
  - [ ] Record status updates to `Paid`
  - [ ] Record appears in Gwenb's inbox at "Capture Filling" step

---

## TC-12: Capture Filing
- **Type:** Happy path (workflow — final step)
- **Login:** Gwenb (Internal Control)
- **Prereq:** TC-11 must pass — record must have advanced to Capture Filing with status `Paid`
- **Steps:**
  1. Log in as `Gwenb` with password `123qwe`
  2. Navigate to Inbox
  3. Locate the TC-01 record (status `Paid`, action `Capture Filling`) and open it
  4. Snapshot to confirm the current workflow step is "Capture Filling"
  5. Fill the Filing Details fields (all required):
     - **Batch Number** (e.g. `BATCH-20260421`)
     - **Box Number** (e.g. `BOX-01`)
     - **File Range** (e.g. `1-10`)
  6. Tick the confirmation checkbox: "I confirm that I have captured all the filing details under which the invoice is stored."
  7. Snapshot to confirm Submit is enabled
  8. Click Submit
  9. Confirm any dialog if prompted
  10. Verify redirect to My Items and that the record is no longer in Gwenb's inbox at Capture Filing
  11. Verify the workflow progress bar shows all steps complete
- **Expected result:** Filing details are captured, the workflow completes, and the full LOGIS workflow is done
- **Assertions:**
  - [ ] Login as Gwenb successful
  - [ ] Record is visible in Gwenb's Inbox at "Capture Filling" with status `Paid`
  - [ ] Batch Number, Box Number, File Range fields are present, required, and fillable
  - [ ] Confirmation checkbox is present and tickable
  - [ ] Submit button enables only after all three fields are filled and the checkbox is ticked
  - [ ] Submit completes without errors
  - [ ] Record is no longer in Gwenb's inbox after submit
  - [ ] Workflow progress bar shows all steps complete
  - [ ] No further workflow actions are available

---

## TC-13: Re-route to Correct Business Unit
- **Type:** Exception path
- **Login:** Eunicem (SCM Supervisor)
- **Steps:**
  1. Log in as `Eunicem` with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox or My Items
  4. Locate a record where a certify or verify step has been assigned to the wrong business unit
  5. Snapshot to confirm the current state of the record and the re-route action available
  6. Select the re-route or reassign action on the workflow action page
  7. Choose the correct business unit as the target
  8. Snapshot to confirm the selection and that Submit is enabled
  9. Click Submit
  10. Confirm any dialog if prompted
  11. Verify the record is now routed to the correct business unit
  12. Verify the workflow can resume from the reassigned step
- **Expected result:** Record is re-routed to the correct business unit and the workflow resumes from the appropriate step
- **Assertions:**
  - [ ] Login as Eunicem successful
  - [ ] Record with incorrect routing is accessible
  - [ ] Re-route / reassign action is available on the workflow action page
  - [ ] Correct business unit can be selected as the new assignee
  - [ ] Submit completes without errors
  - [ ] Record is now visible in the correct business unit's queue
  - [ ] Workflow can continue from the reassigned step

---

## TC-14: Manage Supplier Related Queries
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

## TC-15: Review Invoice Rejection
- **Type:** Exception path
- **Login:** TaniaSmith (Business Unit) or Moshadim (SCM) — depending on which step the rejection occurs
- **Steps:**
  1. Log in as the responsible party (TaniaSmith or Moshadim, whichever is applicable) with password `123qwe`
  2. Verify login successful
  3. Navigate to Inbox or My Items
  4. Locate a record where an invoice has been rejected
  5. Open the record and snapshot to confirm the rejection state and the available review action
  6. Review the rejection details and reason
  7. Take corrective action (update invoice details, re-upload, or respond to the rejection)
  8. Snapshot to confirm the corrective action fields are filled and Submit is enabled
  9. Click Submit
  10. Confirm any dialog if prompted
  11. Verify the record re-enters the workflow at the appropriate step
- **Expected result:** Rejected invoice is reviewed, corrective action is taken, and the record re-enters the workflow at the appropriate step
- **Assertions:**
  - [ ] Login successful for the applicable role
  - [ ] Rejected record is accessible in Inbox or My Items
  - [ ] Rejection details and reason are visible on the record
  - [ ] Corrective action fields are present and fillable
  - [ ] Submit completes without errors
  - [ ] Record re-enters the workflow at the appropriate step
  - [ ] Workflow can continue from that step
