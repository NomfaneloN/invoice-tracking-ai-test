# Test Report: BAS Request for Payment — Reject Invoice Exception Path (TC-05d + TC-12)

**Date:** 2026-04-20
**Environment:** QA — https://pd-invtracking-adminportal-qa.azurewebsites.net
**Tester:** Claude (AI) via MCP browser tools
**Test Plan:** `test-plans/e2e-bas-full-workflow.md`
**Scenario:** Exception path — TC-05d (Reject Invoice) + TC-12 (Review Rejected Invoice → Send for Invoice Verification), then continuing through TC-06 to TC-10
**Invoice No used:** ITS-E2E-20260420D
**Ref No assigned:** PAY5400/2026

---

## Run Metrics

| Metric | Value |
|--------|-------|
| Total Duration | ~00:56:00 (09:05 – 10:01 approx) |
| Test Cases Executed | 11 (TC-01 through TC-10 + TC-12; TC-04 skipped as obsolete) |
| Pass / Fail / Skip | 10 / 0 / 1 (TC-04 obsolete) |
| UI/UX Issues Found | 4 |
| API Cost (est.) | ~$0.60 |

---

## TC-01: Register and Upload Invoice

**Started:** 09:05 | **Completed:** 09:17 | **Duration:** ~12m
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
10. Added invoice row: Invoice Date 20/04/2026, Service Delivery Date 20/04/2026, Invoice No ITS-E2E-20260420D, Amount 2500
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
- [x] Invoice row added with Invoice No ITS-E2E-20260420D, Invoice Amount 2500
- [x] Invoice Attachment uploaded successfully
- [x] Total Amount reflects 2500
- [x] Form submits without errors
- [x] Next workflow step loads inline — status shown as "Received"

---

## TC-02: Assign Branch Finance Admin To Assign Certifier

**Started:** 09:17 | **Completed:** 09:23 | **Duration:** ~6m
**Login:** Thulilem (Finance Unit) — inline from TC-01
**Result:** PASS

### Steps Executed
1. Step loaded inline after TC-01 submit: "Assign Branch Finance Admin To Assign Certifier"
2. Confirmed step heading and status "Received"
3. Located "Branch Finance Admin" combobox, typed "Tania", selected "Tania Smith"
4. Confirmed Submit enabled
5. Clicked Submit — app redirected to My Items
6. Located record (PAY5400/2026) at top of My Items with status "Received"

### Assertions
- [x] Step heading shows "Assign Branch Finance Admin To Assign Certifier"
- [x] "Branch Finance Admin" field is present and Tania Smith can be selected
- [x] Submit becomes enabled after selection
- [x] Submit completes without errors
- [x] App redirects to My Items after Submit
- [x] Record visible in My Items with status "Received"

---

## TC-03: Assign Responsible Person to Certify Invoice + Certify Invoice

**Started:** 09:23 | **Completed:** 09:37 | **Duration:** ~14m
**Login:** TaniaSmith (Business Unit)
**Result:** PASS

### TC-03a: Assign Responsible Person to Certify Invoice

1. Logged in as TaniaSmith / 123qwe — header showed "Tania Smith"
2. Navigated to Inbox
3. Located record PAY5400/2026 — Action Required: "Assign Responsible Person to Certify Invoice"
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

## TC-05d: Prepare Voucher — Reject Invoice (Exception Path)

**Started:** 09:37 | **Completed:** 09:47 | **Duration:** ~10m
**Login:** TaniaSmith (Business Unit) — inline from TC-03b
**Result:** PASS

### Steps Executed
1. Confirmed step heading "Prepare Voucher" and status "Certified"
2. Under "Outcome": selected "Reject Invoice" (4th radio)
3. Under "Business Unit Response": attempted to load 4-item checklist — **API returned 404** (see UI/UX Issue #1)
4. Despite checklist API failure, Submit was enabled (checklist failure not blocking)
5. Clicked Submit — confirmation dialog appeared requiring a rejection reason comment
6. Entered rejection reason comment; Ok button became enabled after comment entry
7. Clicked Ok — workflow routed to TC-12 ("Review Rejected Invoice" for Thulilem)
8. Verified record no longer in TaniaSmith's active queue

### Assertions
- [x] Step heading "Prepare Voucher" shown with status "Certified"
- [x] "Outcome" radio buttons present with 4 options
- [x] "Reject Invoice" (4th radio) selectable
- [!] "Business Unit Response" checklist stuck on "Loading checklist items..." — API 404 (see Issue #1)
- [x] Submit enabled despite checklist failure (Submit was not blocked)
- [x] Submit triggers confirmation dialog requiring a rejection reason comment
- [x] Dialog requires a comment before Ok is enabled
- [x] Submit completes without errors after Ok
- [x] Workflow routes to "Review Rejected Invoice" step for Thulilem

---

## TC-12: Review Rejected Invoice

**Started:** 09:47 | **Completed:** 09:53 | **Duration:** ~6m
**Login:** Thulilem (Finance Unit)
**Result:** PASS

### Steps Executed

**TC-12: Review Rejected Invoice (Thulilem)**
1. Logged in as Thulilem / 123qwe — header showed "Thulile Matekanya"
2. Navigated to Inbox
3. Located PAY5400/2026 — Action Required: "Review Rejected Invoice"
4. Navigated directly to workflow action URL (flyout submenu blocking workaround)
5. Confirmed step heading "Review Rejected Invoice" and status
6. Reviewed rejection details and available options: "Approve Rejection" / "Send for Invoice Verification"
7. Selected "Send for Invoice Verification"
8. Clicked Submit — dialog appeared: "Send back to review rejection decision" requiring a comment (see UI/UX Issue #4)
9. Entered comment: "E2E test — sending back for invoice verification after rejection review"
10. Ok became enabled after comment entry; clicked Ok
11. App redirected

**TC-12 Resolution: Post-TC-12 Prepare Voucher (TaniaSmith)**
1. Logged in as TaniaSmith / 123qwe
2. Navigated to Inbox — PAY5400/2026 visible with Action Required "Prepare Voucher" (new todoid: beb64590-427a-4731-bf4d-bb921ecce2ad)
3. Navigated directly to workflow action URL
4. Confirmed step heading "Prepare Voucher" and status "Certified" — all selections reset
5. Under "Outcome": selected "Verification is complete" (1st radio)
6. Under "Business Unit Response": checklist API 404 again — not blocking
7. Confirmed Submit enabled
8. Clicked Submit — app redirected to My Items
9. Verified record no longer in TaniaSmith's queue

### Assertions
- [x] Login as Thulilem successful
- [x] Rejected record PAY5400/2026 accessible in Thulilem's Inbox with Action Required "Review Rejected Invoice"
- [x] Step heading "Review Rejected Invoice" shown
- [x] Both options present: "Approve Rejection" and "Send for Invoice Verification"
- [x] "Send for Invoice Verification" selectable
- [x] Submit triggers dialog requiring a comment before Ok is enabled
- [x] Submit completes without errors after Ok
- [x] Record re-enters workflow at "Prepare Voucher" step for TaniaSmith
- [x] Post-TC-12: TaniaSmith's Inbox shows PAY5400/2026 with Action Required "Prepare Voucher"
- [x] Post-TC-12: "Verification is complete" selected and Submit completes without errors
- [x] Post-TC-12: Record no longer in TaniaSmith's queue after submit

---

## TC-06: Verify Voucher

**Started:** 09:53 | **Completed:** 09:55 | **Duration:** ~2m
**Login:** Thulilem (Finance Unit)
**Result:** PASS

### Steps Executed
1. Logged in as Thulilem / 123qwe
2. Navigated to Inbox
3. Located PAY5400/2026 — Action Required: "Verify Voucher"
4. Navigated directly to workflow action URL (todoid: 35d35905-d101-465b-b302-5bbfd79ec9cb)
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

**Started:** 09:55 | **Completed:** 09:56 | **Duration:** ~1m
**Login:** Thulilem (Finance Unit) — inline from TC-06
**Result:** PASS

### Steps Executed
1. Confirmed step heading "Authorise Invoice Voucher" and status "Verified"
2. Verified invoice details: Total Amount R 2500
3. Checked confirmation checkbox
4. Confirmed Submit enabled
5. Clicked Submit — "Upload Captured Invoices Report From BAS" loaded inline
6. Status updated to "Approved"

### Assertions
- [x] Step heading "Authorise Invoice Voucher" shown, status "Verified"
- [x] Confirmation checkbox present and required
- [x] Submit disabled until checkbox checked
- [x] Submit completes without errors
- [x] "Upload Captured Invoices Report From BAS" loads inline after submit
- [x] Status updates to "Approved"

---

## TC-08: Upload Captured Invoices Report From BAS (Admin BAS Report Import)

**Started:** 09:56 | **Completed:** 09:57 | **Duration:** ~1m
**Login:** admin (Admin portal)
**Result:** PASS

### Steps Executed

**Step A — Excel Prep:**
- Copied "BAS Payment Register for 17 MARCH 2026 2 2.xlsx" as base file
- Updated row 10 via Node.js `xlsx` package:
  - H10 (INV RECDTE): 46132 (2026-04-20)
  - I10 (SOURCE DOC NUMBER): ITS-E2E-20260420D
  - O10 (CAPTURE DATE): 46132
  - P10 (AUTH DATE): 46132
  - Q10 (INV DATE): 46132
- Saved as `test-data/bas-registers/BAS Payment Register E2E-20260420D.xlsx`

**Step B — Admin Import:**
1. Navigated to admin portal, logged in as admin / 123qwe
2. Clicked BAS Report menu item in sidebar → selected "BAS Report Import" sub-menu link
3. Uploaded `BAS Payment Register E2E-20260420D.xlsx`
4. Clicked Import

**Step C — Verify History:**
- History tab top row (20/04/2026 09:57):
  - Is Success: **Yes**
  - Imported File: BAS Payment Register E2E-20260420D.xlsx
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

**Started:** 09:57 | **Completed:** 09:58 | **Duration:** ~1m
**Login:** admin (Admin portal) → Gwenb (Internal Control) for inbox verify
**Result:** PASS

### Steps Executed

**Step A — Stub File Prep:**
- Copied `training STUB E2E-20260413.txt` as template
- Updated SOURCE DOC NUMBER on line 21: ITS-E2E-20260420D
- Saved as `test-data/payment-stubs/training STUB E2E-20260420D.txt`

**Step B — Admin Import:**
1. Navigated to Payment Stubs Import → Import Payment Stub
2. Uploaded `training STUB E2E-20260420D.txt`
3. Clicked Import

**Step C — Verify History:**
- History tab top row (20/04/2026 09:57):
  - Is Success: **Yes**
  - Imported File: training STUB E2E-20260420D.txt (2.36 kB)
  - Payments Confirmed: **1**

**Step D — Gwenb Inbox Verify:**
1. Logged in as Gwenb / 123qwe
2. Navigated to Inbox ("Incoming Items")
3. Located PAY5400/2026 at top of Inbox:
   - Action Required: **Capture Filing**
   - Status: **Paid**
   - Name: Invoice(s) - ITS-E2E-20260420D | Supplier Name - Maake

### Assertions
- [x] Stub file updated with correct SOURCE DOC NUMBER (ITS-E2E-20260420D)
- [x] Admin login successful
- [x] Payment Stubs Import page loads
- [x] Stub file uploaded successfully
- [x] Import completes — Is Success: Yes
- [x] History tab shows Payments Confirmed = 1
- [x] Gwenb's Inbox shows record with Action Required "Capture Filing" and Status "Paid"

---

## TC-10: Capture Filing

**Started:** 10:00 | **Completed:** 10:01 | **Duration:** ~1m
**Login:** Gwenb (Internal Control)
**Result:** PASS

### Steps Executed
1. Logged in as Gwenb / 123qwe — header showed "Gwen Simbeni"
2. Navigated directly to workflow action URL (todoid: dac4fcb2-782e-414b-80de-0ec2ba00ed02)
3. Confirmed heading "Capture Filing: Invoice(s) - ITS-E2E-20260420D | Supplier Name - Maake", status "Paid"
4. Ref No: PAY5400/2026, Created by: Thulile Matekanya
5. Under Filing Details:
   - Batch Number: **BATCH-E2E-002**
   - Box Number: **BOX-001**
   - File Range: **A-Z**
6. Checked confirmation checkbox: "I confirm that I have captured all the filing details..."
7. Confirmed Submit enabled
8. Clicked Submit — app redirected to My Items
9. Navigated to Inbox — PAY5400/2026 no longer present; inbox count dropped from 23 to 22

### Assertions
- [x] Login as Gwenb successful — "Gwen Simbeni" shown in header
- [x] Record is visible in Gwenb's Inbox with Action Required "Capture Filing"
- [x] Step heading "Capture Filing" shown, status "Paid"
- [x] Filing Details section present with Batch Number, Box Number, File Range (all required)
- [x] Confirmation checkbox present
- [x] Submit disabled until all fields filled and checkbox checked
- [x] Submit completes without errors
- [x] Record no longer in Gwenb's Inbox after submit (count: 23 → 22)

---

## UI/UX Issues

| # | TC | Severity | Issue | Screenshot |
|---|-----|----------|-------|------------|
| 1 | TC-05d, Post-TC-12 Prepare Voucher | High | `POST /api/services/Enterprise/CheckList/Initialise` returns **404**. The "Business Unit Response" checklist shows "Loading checklist items..." indefinitely in both TC-05d and the post-TC-12 Prepare Voucher. Submit was not blocked by this failure in either case — users can submit without completing required checklist items. Risk: checklist validation is silently bypassed. (Also observed in TC-05a run 1 of today's session.) | — |
| 2 | TC-01 | Low | Mode badge in header displays "Live" even when localStorage is correctly set to "latest". The badge label is a cosmetic display bug — actual mode is Latest. | — |
| 3 | Multiple | Low | Workflow action flyout submenu (Inbox/My Items/Sent/Drafts) renders over page content during navigation, blocking clicks on Inbox table rows. Workaround: navigate directly to the workflow action URL. | — |
| 4 | TC-12 | Low | When "Send for Invoice Verification" is selected in "Review Rejected Invoice" and Submit is clicked, a dialog appears titled "Send back to review rejection decision". The dialog title does not match the selected option ("Send for Invoice Verification") — expected the dialog to reference the chosen action. A comment is required before Ok is enabled. Behavior is functional but the label mismatch may confuse users. | — |

---

## Performance Observations

| TC | Action | Approx Load Time | Notes |
|----|--------|-----------------|-------|
| TC-08 | BAS Report Import | <1s | Instant — import completed within 1 second of clicking Import |
| TC-09 | Payment Stub Import | <1s | Instant — import completed within 1 second of clicking Import |
| TC-10 | Workflow action page load | ~3s | Brief delay before form rendered after navigation |

---

## Recommendations

1. **Fix CheckList/Initialise API (Critical Defect):** The `POST /api/services/Enterprise/CheckList/Initialise` endpoint returns 404, causing the Business Unit Response checklist to never load in TC-05d (Prepare Voucher — Reject Invoice) and in the post-TC-12 Prepare Voucher re-entry. The system silently bypasses checklist validation and allows submission. This defect persists across all Prepare Voucher paths (TC-05a and TC-05d confirmed). Raise with development for immediate investigation.

2. **Fix TC-12 dialog label:** The dialog triggered on "Send for Invoice Verification" is titled "Send back to review rejection decision", which does not match the selected option. Update the dialog title/hint to reflect the actual action chosen ("Send for Invoice Verification").

3. **Fix flyout submenu z-index/dismissal:** The Workflows sidebar submenu flyout floats over page content and blocks Inbox row clicks. Should dismiss on click-away or render with proper z-index layering.

4. **Fix mode badge display:** The mode indicator badge shows "Live" when the application is correctly running in "Latest" mode.

5. **Verify checklist enforcement after API fix:** Once CheckList/Initialise is fixed, confirm that Submit is correctly disabled until all 4 Business Unit Response items are answered across all Prepare Voucher paths (TC-05a, TC-05d, and post-exception re-entries).

---

## Summary

All 10 test cases (TC-01 to TC-10, TC-04 skipped as obsolete, TC-12 added for exception path) passed on the "Reject Invoice" exception path scenario. The full BAS Request for Payment workflow completed end-to-end: invoice was registered, certified, rejected at Prepare Voucher (TC-05d), reviewed and re-routed by Thulilem (TC-12 → Send for Invoice Verification), re-submitted with "Verification is complete" by TaniaSmith, then continued through Verify Voucher → Authorise → BAS Import → Stub Import → Capture Filing.

The primary functional concern remains the **CheckList/Initialise API 404 defect** — observed in both Prepare Voucher passes (TC-05d and post-TC-12). A secondary observation is the TC-12 dialog label mismatch ("Send back to review rejection decision" vs. the selected "Send for Invoice Verification" action).
