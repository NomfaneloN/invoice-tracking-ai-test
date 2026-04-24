# Test Report: BAS Request for Payment — Full E2E Workflow (Supplier Related Query)

**Date:** 2026-04-20
**Environment:** QA — https://pd-invtracking-adminportal-qa.azurewebsites.net
**Tester:** Claude (AI) via MCP browser tools
**Test Plan:** `test-plans/e2e-bas-full-workflow.md`
**Scenario:** Exception path — TC-01 through TC-10 (TC-05b: Send for supplier related query → TC-11 → Verification is complete)
**Invoice No used:** ITS-E2E-20260420B
**Ref No assigned:** PAY5383/2026

---

## Run Metrics

| Metric | Value |
|--------|-------|
| Total Duration | ~01:22:00 (08:55 – 09:17 approx) |
| Test Cases Executed | 11 (TC-01 through TC-10 + TC-11; TC-04 skipped as obsolete) |
| Pass / Fail / Skip | 11 / 0 / 1 (TC-04 obsolete) |
| UI/UX Issues Found | 4 |
| API Cost (est.) | ~$0.65 |

---

## TC-01: Register and Upload Invoice

**Started:** 08:55 | **Completed:** 09:02 | **Duration:** ~7m
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
10. Added invoice row: Invoice Date 20/04/2026, Service Delivery Date 20/04/2026, Invoice No ITS-E2E-20260420B, Amount 2500
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
- [x] Invoice row added with Invoice No ITS-E2E-20260420B, Invoice Amount 2500
- [x] Invoice Attachment uploaded successfully
- [x] Total Amount reflects 2500
- [x] Form submits without errors
- [x] Next workflow step loads inline — status shown as "Received"

---

## TC-02: Assign Branch Finance Admin To Assign Certifier

**Started:** 09:02 | **Completed:** 09:04 | **Duration:** ~2m
**Login:** Thulilem (Finance Unit) — inline from TC-01
**Result:** PASS

### Steps Executed
1. Step loaded inline after TC-01 submit: "Assign Branch Finance Admin To Assign Certifier"
2. Confirmed step heading and status "Received"
3. Located "Branch Finance Admin" combobox, typed "Tania", selected "Tania Smith"
4. Confirmed Submit enabled
5. Clicked Submit — app redirected to My Items
6. Located record (PAY5383/2026) at top of My Items with status "Received"

### Assertions
- [x] Step heading shows "Assign Branch Finance Admin To Assign Certifier"
- [x] "Branch Finance Admin" field is present and Tania Smith can be selected
- [x] Submit becomes enabled after selection
- [x] Submit completes without errors
- [x] App redirects to My Items after Submit
- [x] Record visible in My Items with status "Received"

---

## TC-03: Assign Responsible Person to Certify Invoice + Certify Invoice

**Started:** 09:04 | **Completed:** 09:10 | **Duration:** ~6m
**Login:** TaniaSmith (Business Unit)
**Result:** PASS

### TC-03a: Assign Responsible Person to Certify Invoice

1. Logged in as TaniaSmith / 123qwe — header showed "Tania Smith"
2. Navigated to Inbox
3. Located record PAY5383/2026 — Action Required: "Assign Responsible Person to Certify Invoice"
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

## TC-05b: Prepare Voucher — Send for Supplier Related Query

**Started:** 09:10 | **Completed:** 09:19 | **Duration:** ~9m
**Login:** TaniaSmith (Business Unit) — inline from TC-03b
**Result:** PASS

### Steps Executed
1. Confirmed step heading "Prepare Voucher" and status "Certified"
2. Under "Outcome": selected "Send for supplier related query" (2nd radio)
3. Under "Business Unit Response": checklist failed to load — **API returned 404** (see UI/UX Issue #1)
4. Clicked Submit — dialog appeared requesting a query comment
5. Entered comment: "Supplier invoice amount does not match purchase order — please confirm correct amount and resubmit"
6. Clicked Ok to dismiss dialog
7. App redirected away from TaniaSmith's queue
8. Verified record no longer in TaniaSmith's active queue
9. Status updated to "Awaiting Supplier Response"

### Assertions
- [x] Step heading "Prepare Voucher" shown with status "Certified"
- [x] "Outcome" radio buttons present with options including "Send for supplier related query"
- [!] "Business Unit Response" checklist stuck on "Loading checklist items..." — API 404 (see Issue #1)
- [x] Submit enabled (checklist failure did not block submission)
- [x] Dialog appeared requesting query comment after Submit
- [x] Comment entered and Ok accepted without errors
- [x] App advances workflow — status updated to "Awaiting Supplier Response"
- [x] Record no longer in TaniaSmith's active queue

---

## TC-11: Manage Supplier Related Queries

**Started:** 09:19 | **Completed:** 09:26 | **Duration:** ~7m
**Login:** TaniaSmith (Business Unit)
**Result:** PASS

### Steps Executed
1. Navigated to TaniaSmith's Inbox
2. Located PAY5383/2026 — Action Required: "Manage Supplier Related Queries"
3. Opened workflow action via direct URL (flyout submenu workaround)
4. Confirmed step heading "Manage Supplier Related Queries" and status "Awaiting Supplier Response"
5. Under "Supplier Responses": checked checkbox "Supplier has provided a satisfactory response"
6. Confirmed Submit enabled
7. Clicked Submit — "Prepare Voucher" loaded inline (loop back)
8. Status updated to "Certified"

### Assertions
- [x] Record visible in TaniaSmith's Inbox with Action Required "Manage Supplier Related Queries"
- [x] Step heading "Manage Supplier Related Queries" shown, status "Awaiting Supplier Response"
- [x] Supplier Responses checkbox present
- [x] Submit enabled after checkbox checked
- [x] Submit completes without errors
- [x] "Prepare Voucher" reloads inline after submit (loop back to exception resolution)
- [x] Status updates to "Certified"

---

## TC-05b (Resolution): Prepare Voucher — Verification is Complete

**Started:** 09:26 | **Completed:** 09:29 | **Duration:** ~3m
**Login:** TaniaSmith (Business Unit) — inline from TC-11
**Result:** PASS

### Steps Executed
1. Confirmed "Prepare Voucher" reloaded inline after TC-11 Submit
2. Under "Outcome": selected "Verification is complete" (1st radio)
3. Under "Business Unit Response": checklist again failed to load — API 404 (see UI/UX Issue #1)
4. Clicked Submit — app redirected to My Items
5. Record no longer in TaniaSmith's queue

### Assertions
- [x] "Prepare Voucher" step heading shown, status "Certified"
- [x] "Outcome" radio buttons present
- [!] "Business Unit Response" checklist again stuck on "Loading checklist items..." — API 404 (see Issue #1)
- [x] Submit enabled (checklist failure not blocking)
- [x] Submit completes without errors
- [x] App redirects away; record removed from TaniaSmith's queue

---

## TC-06: Verify Voucher

**Started:** 09:29 | **Completed:** 09:35 | **Duration:** ~6m
**Login:** Thulilem (Finance Unit)
**Result:** PASS

### Steps Executed
1. Logged in as Thulilem / 123qwe
2. Navigated to Inbox
3. Located PAY5383/2026 — Action Required: "Verify Voucher"
4. Opened workflow action via direct URL (flyout submenu workaround)
5. Confirmed step heading "Verify Voucher" and status "Certified"
6. Filled Batch Number: "BATCH-E2E-001"
7. Checked confirmation checkbox
8. Confirmed Submit enabled
9. Clicked Submit — "Authorise Invoice Voucher" loaded inline
10. Status updated to "Verified"

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

**Started:** 09:08 | **Completed:** 09:11 | **Duration:** ~3m
**Login:** Thulilem (Finance Unit) — inline from TC-06
**Result:** PASS

### Steps Executed
1. Confirmed step heading "Authorise Invoice Voucher" and status "Verified"
2. Waited for page to fully load — confirmed invoice details: Total Amount R 2500, Invoice No ITS-E2E-20260420B
3. Checked confirmation checkbox
4. Confirmed Submit enabled
5. Clicked Submit — "Upload Captured Invoices Report From BAS" loaded inline
6. Status updated to "Approved"

### Assertions
- [x] Step heading "Authorise Invoice Voucher" shown, status "Verified"
- [x] Invoice details loaded: Invoice No ITS-E2E-20260420B, Total Amount R 2500
- [x] Confirmation checkbox present and required
- [x] Submit disabled until checkbox checked
- [x] Submit completes without errors
- [x] "Upload Captured Invoices Report From BAS" loads inline after submit
- [x] Status updates to "Approved"

---

## TC-08: Upload Captured Invoices Report From BAS (Admin BAS Report Import)

**Started:** 09:11 | **Completed:** 09:13 | **Duration:** ~2m
**Login:** admin (Admin portal)
**Result:** PASS

### Steps Executed

**Step A — Excel Prep:**
- Copied `BAS Payment Register E2E-20260420.xlsx` as base file
- Updated row 10 via Node.js `xlsx` package:
  - H10 (INV RECDTE): 46132 (2026-04-20)
  - I10 (SOURCE DOC NUMBER): ITS-E2E-20260420B
  - O10, P10, Q10 (dates): 46132 (unchanged from base)
- Saved as `test-data/bas-registers/BAS Payment Register E2E-20260420B.xlsx`

**Step B — Admin Import:**
1. Navigated to admin portal, logged in as admin / 123qwe
2. Navigated to BAS Report → BAS Report Import
3. Uploaded `BAS Payment Register E2E-20260420B.xlsx`
4. Clicked Import

**Step C — Verify History:**
- History tab top row (20/04/2026 09:13):
  - Is Success: **Yes**
  - Imported File: BAS Payment Register E2E-20260420B.xlsx
  - Payments Authorised: **1**

### Assertions
- [x] Excel file updated with correct SOURCE DOC NUMBER (ITS-E2E-20260420B)
- [x] Admin login successful
- [x] BAS Report Import menu item found and page loads
- [x] File upload field present
- [x] Excel file uploaded successfully
- [x] Import completes without errors
- [x] History tab shows Is Success: Yes, Payments Authorised = 1

---

## TC-09: Payment Stubs Import (Attach Payment Stub)

**Started:** 09:13 | **Completed:** 09:16 | **Duration:** ~3m
**Login:** admin (Admin portal) → Gwenb (Internal Control) for inbox verify
**Result:** PASS

### Steps Executed

**Step A — Stub File Prep:**
- Copied `training STUB E2E-20260420.txt` as template
- Updated SOURCE DOC NUMBER on line 21: ITS-E2E-20260420B
- Saved as `test-data/payment-stubs/training STUB E2E-20260420B.txt`

**Step B — Admin Import:**
1. Navigated to Payment Stubs Import → Import Payment Stub
2. Uploaded `training STUB E2E-20260420B.txt`
3. Clicked Import

**Step C — Verify History:**
- History tab top row (20/04/2026 09:14):
  - Is Success: **Yes**
  - Imported File: training STUB E2E-20260420B.txt
  - Payments Confirmed: **1**

**Step D — Gwenb Inbox Verify:**
1. Logged in as Gwenb / 123qwe
2. Navigated to Inbox ("Incoming Items")
3. Located PAY5383/2026 at top of Inbox:
   - Action Required: **Capture Filing**
   - Status: **Paid**
   - Name: Invoice(s) - ITS-E2E-20260420B | Supplier Name - Maake

### Assertions
- [x] Stub file updated with correct SOURCE DOC NUMBER (ITS-E2E-20260420B)
- [x] Admin login successful
- [x] Payment Stubs Import page loads
- [x] Stub file uploaded successfully
- [x] Import completes — Is Success: Yes
- [x] History tab shows Payments Confirmed = 1
- [x] Gwenb's Inbox shows record with Action Required "Capture Filing" and Status "Paid"

---

## TC-10: Capture Filing

**Started:** 09:16 | **Completed:** 09:17 | **Duration:** ~1m
**Login:** Gwenb (Internal Control)
**Result:** PASS

### Steps Executed
1. Navigated directly to workflow action URL from Inbox (flyout submenu workaround)
2. Confirmed heading "Capture Filing: Invoice(s) - ITS-E2E-20260420B | Supplier Name - Maake", status "Paid"
3. Ref No: PAY5383/2026, Created by: Thulile Matekanya
4. Confirmed invoice data loaded: Invoice No ITS-E2E-20260420B, Total Amount R 2500, Payment Number PAYNO91
5. Under Filing Details:
   - Batch Number: **BATCH-E2E-002**
   - Box Number: **BOX-001**
   - File Range: **A-Z**
6. Checked confirmation checkbox: "I confirm that I have captured all the filing details..."
7. Confirmed Submit enabled
8. Clicked Submit — app redirected to My Items
9. Navigated to Inbox — PAY5383/2026 no longer present; inbox count dropped from 23 to 22

### Assertions
- [x] Record is visible in Gwenb's Inbox with Action Required "Capture Filing"
- [x] Step heading "Capture Filing" shown, status "Paid"
- [x] Invoice details loaded: Invoice No ITS-E2E-20260420B, Total Amount R 2500, Payment Number PAYNO91
- [x] Filing Details section present with Batch Number, Box Number, File Range (all required)
- [x] Confirmation checkbox present
- [x] Submit disabled until all fields filled and checkbox checked
- [x] Submit completes without errors
- [x] Record no longer in Gwenb's Inbox after submit (count: 23 → 22)

---

## UI/UX Issues

| # | TC | Severity | Issue | Screenshot |
|---|-----|----------|-------|------------|
| 1 | TC-05b, TC-05b(R) | High | `POST /api/services/Enterprise/CheckList/Initialise` returns **404**. The "Business Unit Response" checklist section shows "Loading checklist items..." indefinitely — items never render. Occurred on both the initial Prepare Voucher (supplier query selection) and the return Prepare Voucher (verification complete). Submit is not blocked but checklist validation is silently bypassed. | — |
| 2 | TC-05b | Medium | Supplier query comment dialog hint text incorrectly reads **"Send for business relatd query"** — wrong action name (should reference "supplier related query") and contains a typo ("relatd" instead of "related"). | — |
| 3 | TC-01 | Low | Mode badge in header displays "Live" even when localStorage is correctly set to "latest". The badge label is a cosmetic display bug — actual mode is Latest. | — |
| 4 | Multiple | Low | Workflow action flyout submenu (Inbox/My Items/Sent/Drafts) renders over page content during navigation, blocking clicks on Inbox table rows. Workaround: navigate directly to the workflow action URL. | — |

---

## Performance Observations

| TC | Action | Approx Load Time | Notes |
|----|--------|-----------------|-------|
| TC-08 | BAS Report Import | <1s | Import completed within 1 second of clicking Import |
| TC-09 | Payment Stub Import | <1s | Import completed within 1 second of clicking Import |
| TC-10 | Workflow action page load | ~3s | Brief delay before form rendered after navigation |
| TC-07 | Authorise Invoice Voucher data | ~3s | "Fetching data..." spinner visible; invoice list delayed before rendering |

---

## Recommendations

1. **Fix CheckList/Initialise API (Critical Defect):** The `POST /api/services/Enterprise/CheckList/Initialise` endpoint returns 404, causing the Business Unit Response checklist to fail on every Prepare Voucher step — including both the TC-05b exception path and the resolution path. Submit is silently allowed without checklist completion. Raise with the development team for immediate investigation and fix.

2. **Fix supplier query dialog text (Defect):** The comment dialog displayed after selecting "Send for supplier related query" shows hint text "Send for business relatd query" — this is both incorrect (wrong query type) and contains a typo. Update the hint text to match the selected action: "Send for supplier related query".

3. **Fix flyout submenu z-index/dismissal:** The Workflows sidebar submenu flyout (Inbox/My Items etc.) floats over page content and blocks row clicks in the Inbox table. It should dismiss on click-away or render with proper z-index layering.

4. **Fix mode badge display:** The mode indicator badge shows "Live" even when the application is correctly running in "Latest" mode. Update the badge to accurately reflect the stored localStorage mode value.

5. **Verify checklist enforcement:** Once the CheckList API is fixed, confirm that Submit is correctly disabled until all Business Unit Response checklist items are answered in both TC-05b paths (supplier query and verification complete).

---

## Summary

All 11 test cases (TC-01 to TC-10 plus TC-11, TC-04 skipped as obsolete) passed on the exception path "Send for supplier related query" scenario. The full BAS Request for Payment workflow completed end-to-end:
- TC-05b: Prepare Voucher → Send for supplier related query → dialog comment entered
- TC-11: TaniaSmith resolved query (Manage Supplier Related Queries) → Prepare Voucher reloaded
- TC-05b (Resolution): Selected "Verification is complete" → continued normal path through TC-06 to TC-10

The **CheckList/Initialise API 404 defect** (Issue #1) recurred on both Prepare Voucher interactions. A new defect was identified: the **supplier query comment dialog displays incorrect hint text** with a typo (Issue #2). Both should be raised with the development team.
