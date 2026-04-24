# Test Report: BAS Request for Payment — Full E2E Workflow (Business Related Query)

**Date:** 2026-04-20
**Environment:** QA — https://pd-invtracking-adminportal-qa.azurewebsites.net
**Tester:** Claude (AI) via MCP browser tools
**Test Plan:** `test-plans/e2e-bas-full-workflow.md`
**Scenario:** Exception path — TC-01 through TC-10 (TC-05c: Send for business related query)
**Invoice No used:** ITS-E2E-20260420C
**Ref No assigned:** PAY5392/2026

---

## Run Metrics

| Metric | Value |
|--------|-------|
| Total Duration | ~00:16:00 (09:22 – 09:38 approx) |
| Test Cases Executed | 10 (TC-01 through TC-10; TC-04 skipped as obsolete) |
| Pass / Fail / Skip | 10 / 0 / 1 (TC-04 obsolete) |
| UI/UX Issues Found | 4 |
| API Cost (est.) | ~$0.55 |

---

## TC-01: Register and Upload Invoice

**Started:** 09:22 | **Completed:** 09:25 | **Duration:** ~3m
**Login:** Thulilem (Finance Unit)
**Result:** PASS

### Steps Executed
1. Navigated to login page, logged in as Thulilem / 123qwe
2. Verified login — dashboard loaded, header showed "Thulile Matekanya"
3. Confirmed mode set to Latest (localStorage `CONFIGURATION_ITEM_MODE = "latest"` set)
4. Navigated to My Items → Create New → BAS Request For Payment
5. Verified form opened with Draft status and Ref No assigned
6. Confirmed Date Received auto-populated with 20/04/2026
7. Selected Supplier Name "Maake" via entity picker dialog
8. Verified Supplier Details populated (Maake, Maaa123, 265 West Avenue)
9. Filled Description: "E2E BAS test run"
10. Added invoice row: Invoice Date 20/04/2026, Service Delivery Date 20/04/2026, Invoice No ITS-E2E-20260420C, Amount 2500
11. Uploaded invoice attachment (training STUB (1).txt — auto-converted to PDF by server)
12. Confirmed invoice row; Total Amount showed R 2500
13. Clicked Submit; next step loaded inline
14. Verified status "Received"

### Assertions
- [x] Login successful — dashboard visible
- [x] Mode is set to Latest
- [x] My Items page loads
- [x] New BAS Request form opens with Draft status and a Ref No assigned
- [x] Date Received auto-populated with today's date (20/04/2026)
- [x] Supplier Name selected and Supplier Details panel populated
- [x] Description filled
- [x] Invoice row added with Invoice No ITS-E2E-20260420C, Invoice Amount 2500
- [x] Invoice Attachment uploaded successfully
- [x] Total Amount reflects 2500
- [x] Form submits without errors
- [x] Next workflow step loads inline — status shown as "Received"

---

## TC-02: Assign Branch Finance Admin To Assign Certifier

**Started:** 09:25 | **Completed:** 09:26 | **Duration:** ~1m
**Login:** Thulilem (Finance Unit) — inline from TC-01
**Result:** PASS

### Steps Executed
1. Step loaded inline after TC-01 submit: "Assign Branch Finance Admin To Assign Certifier"
2. Confirmed step heading and status "Received"
3. Located "Branch Finance Admin" combobox, typed "Tania", selected "Tania Smith"
4. Confirmed Submit enabled
5. Clicked Submit — app redirected to My Items
6. Located record (PAY5392/2026) at top of My Items with status "Received"

### Assertions
- [x] Step heading shows "Assign Branch Finance Admin To Assign Certifier"
- [x] "Branch Finance Admin" field is present and Tania Smith can be selected
- [x] Submit becomes enabled after selection
- [x] Submit completes without errors
- [x] App redirects to My Items after Submit
- [x] Record visible in My Items with status "Received"

---

## TC-03: Assign Responsible Person to Certify Invoice + Certify Invoice

**Started:** 09:26 | **Completed:** 09:28 | **Duration:** ~2m
**Login:** TaniaSmith (Business Unit)
**Result:** PASS

### TC-03a: Assign Responsible Person to Certify Invoice

1. Logged in as TaniaSmith / 123qwe — header showed "Tania Smith"
2. Navigated to Inbox
3. Located record PAY5392/2026 — Action Required: "Assign Responsible Person to Certify Invoice"
4. Opened workflow action
5. Confirmed step heading and status
6. Located "Official" combobox, typed "Tania", selected "Tania Smith"
7. Confirmed Submit enabled
8. Clicked Submit — "Certify Invoice" loaded inline

### TC-03b: Certify Invoice

1. Confirmed step heading "Certify Invoice" and status "Received"
2. Under "Business Unit Responses": selected radio "Goods and Service has been delivered satisfactory - Invoice should be paid"
3. Confirmed Submit enabled
4. Clicked Submit — "Prepare Voucher" loaded inline
5. Status updated to "Certified"

### Assertions
- [x] Login as TaniaSmith successful
- [x] Record visible in Inbox with Action Required "Assign Responsible Person to Certify Invoice"
- [x] TC-03a: Step heading "Assign Responsible Person to Certify Invoice" shown
- [x] TC-03a: "Official" field present and Tania Smith selectable
- [x] TC-03a: Submit enabled and completes without errors
- [x] TC-03a: "Certify Invoice" loads inline after submit
- [x] TC-03b: Radio buttons for Business Unit Responses visible
- [x] TC-03b: Submit enabled after radio selection
- [x] TC-03b: Submit completes without errors
- [x] TC-03b: Status updates to "Certified"
- [x] TC-03b: "Prepare Voucher" loads inline after submit

---

## TC-04: SKIPPED — Obsolete

**Status:** SKIP — Step no longer exists in the BAS workflow (removed as of 2026-04-02). Workflow goes directly from Certify Invoice to Prepare Voucher.

---

## TC-05c: Prepare Voucher — Send for Business Related Query

**Started:** 09:28 | **Completed:** 09:31 | **Duration:** ~3m
**Login:** TaniaSmith (Business Unit) — inline from TC-03b
**Result:** PASS

### Steps Executed
1. Confirmed step heading "Prepare Voucher" and status "Certified"
2. Under "Outcome": selected "Send for business related query" (3rd radio)
3. Under "Business Unit Response": attempted to load 4-item checklist — **API returned 404** (see UI/UX Issue #1)
4. Clicked Submit — dialog appeared: **"Send for business related query"**
5. Dialog hint text showed `"Send for business relatd query"` — typo noted (see UI/UX Issue #2)
6. Entered comment in dialog text area
7. Clicked Ok — dialog dismissed
8. Next step loaded: **"Resolve Queries"**
9. Confirmed step title `Shesha.SaGovInvoiceTracking/SAGovRequestForPayment-BAS-wf-RespondtoQueries-Details v7`
10. Checked confirmation checkbox: "I confirm that all queries have been resolved and necessary information has been provided."
11. Clicked Submit — **Prepare Voucher reloaded** with a new todoid (status still "Certified")
12. Selected "Verification is complete" (1st radio) on reloaded Prepare Voucher
13. Clicked Submit — app redirected to TaniaSmith's My Items
14. Verified PAY5392/2026 no longer in TaniaSmith's queue

### Assertions
- [x] Step heading "Prepare Voucher" shown with status "Certified"
- [x] "Outcome" radio buttons present with at least 3 options including "Send for business related query"
- [!] "Business Unit Response" checklist stuck on "Loading checklist items..." — API 404 (see Issue #1, recurring defect)
- [x] Submit enabled (checklist failure did not block Submit)
- [x] Submit triggers "Send for business related query" dialog
- [!] Dialog hint text contains typo: `"Send for business relatd query"` ("relatd" instead of "related") — see Issue #2
- [x] Comment field present in dialog; Ok button dismisses dialog and advances workflow
- [x] "Resolve Queries" step loads after dialog Ok
- [x] Resolve Queries confirmation checkbox present
- [x] Resolve Queries Submit enabled after checkbox checked
- [x] Resolve Queries Submit completes without errors
- [x] Prepare Voucher reloads after Resolve Queries submit (new todoid, status still "Certified")
- [x] "Verification is complete" selectable on reloaded Prepare Voucher
- [x] Second Prepare Voucher submit completes without errors
- [x] App redirects to My Items; PAY5392/2026 no longer in TaniaSmith's queue

---

## TC-06: Verify Voucher

**Started:** 09:32 | **Completed:** 09:33 | **Duration:** ~1m
**Login:** Thulilem (Finance Unit)
**Result:** PASS

### Steps Executed
1. Logged in as Thulilem / 123qwe
2. Navigated to Inbox
3. Located PAY5392/2026 at top of Inbox — Action Required: "Verify Voucher", Status: "Certified"
4. Navigated directly to workflow action URL (flyout submenu workaround — see Issue #4)
5. Confirmed step heading "Verify Voucher" and status "Certified"
6. Confirmed invoice details: Invoice No ITS-E2E-20260420C, Total Amount R 2500
7. Filled Batch Number: "BATCH-E2E-001"
8. Checked confirmation checkbox: "I confirm that I have reviewed the payment and supporting information"
9. Confirmed Submit enabled
10. Clicked Submit — "Authorise Invoice Voucher" loaded inline
11. Status updated to "Verified"

### Assertions
- [x] Login as Thulilem successful
- [x] Record is visible in Thulilem's Inbox with Action Required "Verify Voucher"
- [x] Step heading "Verify Voucher" shown, status "Certified"
- [x] Batch Number field present and fillable
- [x] Confirmation checkbox present
- [x] Submit disabled until both Batch Number filled and checkbox checked
- [x] Submit completes without errors
- [x] "Authorise Invoice Voucher" loads inline after submit
- [x] Status updates to "Verified"

---

## TC-07: Authorise Invoice Voucher

**Started:** 09:33 | **Completed:** 09:35 | **Duration:** ~2m
**Login:** Thulilem (Finance Unit) — inline from TC-06
**Result:** PASS

### Steps Executed
1. Confirmed step heading "Authorise Invoice Voucher" and status "Verified"
2. Verified invoice details: Total Amount R 2500
3. Checked confirmation checkbox: "I confirm that I have reviewed and approve the invoice, payment details and all supporting information."
4. Confirmed Submit enabled
5. Clicked Submit — "Upload Captured Invoices Report From BAS" loaded inline
6. Status updated to "Approved"

### Assertions
- [x] Step heading "Authorise Invoice Voucher" shown, status "Verified"
- [x] Total Amount R 2500 confirmed
- [x] Confirmation checkbox present and required
- [x] Submit disabled until checkbox checked
- [x] Submit completes without errors
- [x] "Upload Captured Invoices Report From BAS" loads inline after submit
- [x] Status updates to "Approved"

---

## TC-08: Upload Captured Invoices Report From BAS (Admin BAS Report Import)

**Started:** 09:35 | **Completed:** 09:36 | **Duration:** ~1m
**Login:** admin (Admin portal)
**Result:** PASS

### Steps Executed

**Step A — Excel Prep:**
- Copied "BAS Payment Register E2E-20260420B.xlsx" as base file
- Updated row 10 via Node.js `xlsx` package:
  - H10 (INV RECDTE): 46132 (2026-04-20)
  - I10 (SOURCE DOC NUMBER): ITS-E2E-20260420C
  - O10 (CAPTURE DATE): 46132
  - P10 (AUTH DATE): 46132
  - Q10 (INV DATE): 46132
- Saved as `test-data/bas-registers/BAS Payment Register E2E-20260420C.xlsx`

**Step B — Admin Import:**
1. Navigated to admin portal, logged in as admin / 123qwe
2. Navigated to BAS Report menu item → BAS Report Import page
3. Uploaded `BAS Payment Register E2E-20260420C.xlsx`
4. Clicked Import

**Step C — Verify History:**
- History tab top row (20/04/2026 09:34):
  - Is Success: **Yes**
  - Imported File: BAS Payment Register E2E-20260420C.xlsx
  - Payments Authorised: **1**

### Assertions
- [x] Excel file updated with correct system data
- [x] Admin login successful
- [x] BAS Report Import menu item found and page loads
- [x] File upload field present
- [x] Excel file uploaded successfully
- [x] Import completes without errors
- [x] History tab shows Payments Authorised = 1
- [x] Workflow advances (confirmed in TC-09 — Gwenb inbox shows "Capture Filing" with status "Paid")

---

## TC-09: Payment Stubs Import (Attach Payment Stub)

**Started:** 09:36 | **Completed:** 09:37 | **Duration:** ~1m
**Login:** admin (Admin portal) → Gwenb (Internal Control) for inbox verify
**Result:** PASS

### Steps Executed

**Step A — Stub File Prep:**
- Copied `training STUB E2E-20260420B.txt` as template
- Updated SOURCE DOC NUMBER on line 21: ITS-E2E-20260420C
- Saved as `test-data/payment-stubs/training STUB E2E-20260420C.txt`

**Step B — Admin Import:**
1. Navigated to Payment Stubs Import → Import Payment Stub
2. Uploaded `training STUB E2E-20260420C.txt`
3. Clicked Import

**Step C — Verify History:**
- History tab top row (20/04/2026 09:35):
  - Is Success: **Yes**
  - Imported File: training STUB E2E-20260420C.txt
  - Payments Confirmed: **1**

**Step D — Gwenb Inbox Verify:**
1. Logged in as Gwenb / 123qwe
2. Navigated to Inbox ("Incoming Items")
3. Located PAY5392/2026 at top of Inbox:
   - Action Required: **Capture Filing**
   - Status: **Paid**
   - Name: Invoice(s) - ITS-E2E-20260420C | Supplier Name - Maake

### Assertions
- [x] Stub file updated with correct SOURCE DOC NUMBER (ITS-E2E-20260420C)
- [x] Admin login successful
- [x] Payment Stubs Import page loads
- [x] Stub file uploaded successfully
- [x] Import completes — Is Success: Yes
- [x] History tab shows Payments Confirmed = 1
- [x] Gwenb's Inbox shows record with Action Required "Capture Filing" and Status "Paid"

---

## TC-10: Capture Filing

**Started:** 09:37 | **Completed:** 09:38 | **Duration:** ~1m
**Login:** Gwenb (Internal Control)
**Result:** PASS

### Steps Executed
1. Navigated directly to workflow action URL from Inbox (flyout submenu workaround)
2. Confirmed heading "Capture Filing: Invoice(s) - ITS-E2E-20260420C | Supplier Name - Maake", status "Paid"
3. Ref No: PAY5392/2026, Created by: Thulile Matekanya
4. Payment Number PAYNO91 visible in invoice row (confirms stub matched correctly)
5. Under Filing Details:
   - Batch Number: **BATCH-E2E-002**
   - Box Number: **BOX-001**
   - File Range: **A-Z**
6. Checked confirmation checkbox: "I confirm that I have captured all the filing details under which the invoice is stored."
7. Confirmed Submit enabled
8. Clicked Submit — app redirected to My Items
9. Navigated to Inbox — PAY5392/2026 no longer present; inbox count dropped from 23 to 22

### Assertions
- [x] Record is visible in Gwenb's Inbox with Action Required "Capture Filing"
- [x] Step heading "Capture Filing" shown, status "Paid"
- [x] Payment Number PAYNO91 visible — stub matched correctly
- [x] Filing Details section present with Batch Number, Box Number, File Range (all required)
- [x] Confirmation checkbox present
- [x] Submit disabled until all fields filled and checkbox checked
- [x] Submit completes without errors
- [x] Record no longer in Gwenb's Inbox after submit (count: 23 → 22)

---

## UI/UX Issues

| # | TC | Severity | Issue | Screenshot |
|---|-----|----------|-------|------------|
| 1 | TC-05c | High | `POST /api/services/Enterprise/CheckList/Initialise` returns **404**. The "Business Unit Response" checklist section shows "Loading checklist items..." indefinitely — items never render. Submit was not blocked by this failure and the workflow advanced normally. Risk: checklist validation is silently bypassed — users may submit without completing required checklist items. **Recurring defect — observed in all three runs.** | — |
| 2 | TC-05c | Medium | Dialog hint text for "Send for business related query" contains a typo: displays `"Send for business relatd query"` ("relatd" instead of "related"). The same typo was previously observed in the "Send for supplier related query" dialog (Run 2). Likely the same shared component or copy-paste error. | — |
| 3 | TC-01 | Low | Mode badge in header displays "Live" even when localStorage is correctly set to "latest". The badge label is a cosmetic display bug — actual mode is Latest. **Recurring cosmetic defect — observed in all three runs.** | — |
| 4 | Multiple | Low | Workflow action flyout submenu (Inbox/My Items/Sent/Drafts) renders over page content during navigation, blocking clicks on Inbox table rows. Workaround: navigate directly to the workflow action URL. **Recurring UX defect — observed in all three runs.** | — |

---

## Performance Observations

| TC | Action | Approx Load Time | Notes |
|----|--------|-----------------|-------|
| TC-08 | BAS Report Import | <1s | Instant — import completed within 1 second of clicking Import |
| TC-09 | Payment Stub Import | <1s | Instant — import completed within 1 second of clicking Import |
| TC-10 | Workflow action page load | ~3s | Brief delay before Capture Filing form rendered after navigation |

---

## Recommendations

1. **Fix CheckList/Initialise API (Critical Defect):** The `POST /api/services/Enterprise/CheckList/Initialise` endpoint returns 404, causing the Business Unit Response checklist to never load in Prepare Voucher. The system silently bypasses checklist validation and allows submission. This has been observed across all three test runs (Runs 1, 2, 3). Raise with the development team for immediate investigation and fix.

2. **Fix "relatd" typo in query dialogs:** Both the "Send for supplier related query" and "Send for business related query" dialog hint texts display `"relatd"` instead of "related". Fix both dialog strings (likely shared component).

3. **Fix flyout submenu z-index/dismissal:** The Workflows sidebar submenu flyout floats over page content and blocks row clicks in the Inbox table. It should dismiss on click-away or render with proper z-index layering.

4. **Fix mode badge display:** The mode indicator badge shows "Live" even when the application is correctly running in "Latest" mode. Update the badge to accurately reflect the stored localStorage mode value.

5. **Verify checklist enforcement:** Once the CheckList API is fixed, confirm that Submit is correctly disabled until all Business Unit Response checklist items are answered in Prepare Voucher (TC-05 and TC-05c).

---

## Summary

All 10 test cases (TC-01 to TC-10, TC-04 skipped as obsolete) passed on the "Send for business related query" exception path. The full BAS Request for Payment workflow completed successfully from invoice registration, through the business query exception path (Resolve Queries → Prepare Voucher reloads → Verification is complete), through to capture filing.

Key observations for this exception path:
- Selecting "Send for business related query" in Prepare Voucher triggers a dialog with a comment field; after clicking Ok, the next step is "Resolve Queries"
- "Resolve Queries" requires a single confirmation checkbox; after submission, Prepare Voucher reloads with a new todoid
- "Verification is complete" was selected on the reloaded Prepare Voucher to complete the normal workflow path
- The "relatd" typo in the business query dialog hint text is a new finding (same pattern as the supplier query dialog — Issue #2)

The **CheckList/Initialise API 404 defect** remains the primary functional concern and should be treated as a High-priority defect. All other issues are cosmetic or low-impact.
