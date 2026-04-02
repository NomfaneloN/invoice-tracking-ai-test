# Test Report: BAS Request for Payment — Full Workflow
**Date:** 2026-04-02  
**Tester:** Claude (MCP browser execution)  
**Environment:** QA — https://pd-invtracking-adminportal-qa.azurewebsites.net  
**Test Plan:** test-plans/e2e-bas-full-workflow.md  
**Ref No created this run:** PAY4718/2026  

---

## Summary

| TC | Title (Test Plan) | Actual Step Observed | Result |
|----|-------------------|----------------------|--------|
| TC-01 | Register and Upload Invoice | Register and Upload Invoice | **PASS** |
| TC-02 | Assign Responsible Person to Certify Invoice | Assign Branch Finance Admin To Assign Certifier | **PASS** (step name differs) |
| TC-03 | Certify Invoice | Assign Responsible Person to Certify Invoice → Certify Invoice (2 sub-steps) | **PASS** (step split into 2) |
| TC-04 | Assign Responsible Person to Verify Invoice | **Did not appear** — step absent in current workflow | **SKIP / REMOVED** |
| TC-05 | Prepare Voucher | Prepare Voucher (TaniaSmith, not Thulilem; includes checklist) | **PASS** (role and fields differ) |
| TC-06 | Verify Voucher | Verify Voucher (Thulilem, not Gwenb; Batch Number + checkbox required) | **PASS** (owner and fields differ) |
| TC-07 | Approve Invoice | Authorise Invoice Voucher (step name differs; checkbox only) | **PASS** (step name differs) |
| TC-08 | Upload Captured Invoices Report From BAS | Upload Captured Invoices Report From BAS — **no Submit button** | **BLOCKED** |
| TC-09–TC-11 | Upload Final Report, Capture Filling, Attach Payment Stub | Not executed — blocked by TC-08 | **NOT RUN** |
| TC-12–TC-13 | Exception paths | Not executed | **NOT RUN** |

**Total: 7 Pass / 0 Fail / 1 Skip / 1 Blocked / 6 Not Run**

---

## TC-01: Register and Upload Invoice

**Ref No created:** PAY4718/2026  
**Invoice No used:** ITS-E2E-001  

### Assertions
- [x] Login as Thulilem successful — dashboard visible
- [x] Mode is Latest (confirmed via localStorage key `CONFIGURATION_ITEM_MODE = "latest"`)
- [!] Mode UI label shows "Live" — mismatch between localStorage value and UI display
- [x] My Items page loads
- [x] Create New dropdown opens with options
- [x] New BAS Request form opens at `/shesha/workflow-action?id=...` — Draft status, Ref No PAY4718/2026 assigned
- [x] Date Received auto-populated: 02/04/2026
- [x] Supplier Name selected via entity picker ("Maake") — Supplier Details panel populated
- [x] Description filled: "E2E BAS test run"
- [x] Invoice row added: Invoice Date 02/04/2026, Service Delivery Date 02/04/2026, Invoice No ITS-E2E-001, Amount 2500, Attachment RULES.md (1.7 kB)
- [x] Invoice row confirmed — Total Amount updates to R 2500
- [x] Attachment converted from RULES.md → RULES.pdf (140.16 kB) on submission
- [x] Form submits without errors
- [x] Post-submit: **next workflow step loads inline** (not redirect to My Items)
- [x] Status set to "Received"

### Changes Observed
1. **[UI CHANGE] Mode label mismatch**: localStorage has `CONFIGURATION_ITEM_MODE="latest"` but the UI badge always displays "Live". The mode IS Latest — the label is incorrect.
2. **[NEW ITEM] Create New dropdown now includes "test-workflow"** in addition to "BAS Request For Payment".
3. **[BEHAVIOR CHANGE] Post-submit navigation**: After submitting "Register and Upload Invoice", the app loads the next workflow step inline (same page, new todoid) — does NOT redirect to My Items.
4. **[BEHAVIOR CHANGE] File-to-PDF conversion**: Uploaded RULES.md (1.7 kB) was converted to RULES.pdf (140.16 kB) upon form submission. The conversion happens server-side after submit, not immediately on upload.
5. **[UI CHANGE] Form opens as workflow-action URL**: `/shesha/workflow-action?id=...&todoid=...` — not a standalone form page.

---

## TC-02: Assign Branch Finance Admin To Assign Certifier

*Test plan called this "Assign Responsible Person to Certify Invoice" — actual step name is different.*

**Ref No used:** PAY4718/2026

### Assertions
- [x] Workflow action page loads inline after TC-01 submit
- [x] Step heading: **"Assign Branch Finance Admin To Assign Certifier"** (not "Assign Responsible Person to Certify Invoice")
- [x] Field present: **"Branch Finance Admin"** combobox (test plan says "Responsible Person")
- [x] Tania Smith selected as Branch Finance Admin
- [x] Submit becomes enabled after selection
- [x] Submit completes without errors
- [x] Post-submit: **redirects to My Items** (unlike TC-01 which loaded inline)
- [x] Record PAY4718/2026 visible in My Items with status "Received"

### Changes Observed
6. **[STEP NAME CHANGE] TC-02 step renamed**: Actual step is "Assign Branch Finance Admin To Assign Certifier", not "Assign Responsible Person to Certify Invoice".
7. **[FIELD LABEL CHANGE] Assignee field**: Label is "Branch Finance Admin", not "Responsible Person".
8. **[BEHAVIOR CHANGE] Post-submit navigation**: After TC-02, redirects to My Items (not inline next step).

---

## TC-03: Assign Responsible Person to Certify Invoice → Certify Invoice

*Test plan has a single TC-03 "Certify Invoice" for TaniaSmith. Actual workflow has TWO sequential steps, both assigned to TaniaSmith.*

**Ref No used:** PAY4718/2026  
**Access via:** TaniaSmith's Inbox (titled "Incoming Items")

### Sub-step A: Assign Responsible Person to Certify Invoice
- [x] Login as TaniaSmith successful
- [x] Record visible in TaniaSmith's Inbox ("Incoming Items") with Action Required: "Assign Responsible Person to Certify Invoice"
- [x] Workflow action page loads: step heading "Assign Responsible Person to Certify Invoice"
- [x] Field present: **"Official"** combobox
- [x] Tania Smith selected as Official (self-assignment allowed)
- [x] Submit becomes enabled; completes without errors
- [x] Post-submit: "Certify Invoice" step loads **inline** (not redirect to Inbox)

### Sub-step B: Certify Invoice
- [x] Step heading: "Certify Invoice"
- [x] Status: Received (from Tania Smith)
- [x] **Radio buttons present under "Business Unit Responses"**:
  - "Goods and Service has been delivered satisfactory - Invoice should be paid"
  - "Goods and Service has not been delivered or delivered to an unacceptable standard - Invoices should not be paid"
- [x] Submit is **disabled until a radio option is selected**
- [x] "Goods and Service has been delivered satisfactory" selected
- [x] Submit enabled; completes without errors
- [x] Post-submit: "Prepare Voucher" step loads **inline**
- [x] Status updated to **"Certified"**
- [!] Total Amount shows "R 0" during loading — resolves to R 2500 once fully loaded

### Changes Observed
9. **[WORKFLOW CHANGE] TC-03 is now 2 steps**: "Assign Responsible Person to Certify Invoice" + "Certify Invoice" — both performed by TaniaSmith.
10. **[NEW FIELD] Certify Invoice has radio buttons** for business unit response (satisfactory / not satisfactory). Not documented in test plan.
11. **[FIELD LABEL CHANGE] Assignee field in sub-step A**: "Official" (not "Responsible Person").
12. **[BEHAVIOR CHANGE] Post-submit from sub-step A**: Next step loads inline.
13. **[BEHAVIOR CHANGE] Post-submit from sub-step B**: Next step (Prepare Voucher) loads inline.
14. **[BUG] Total Amount shows "R 0"** on Certify Invoice step during page load — transient display issue.

---

## TC-04: Assign Responsible Person to Verify Invoice

*Test plan documents this as TC-04 for Thulilem (Finance Unit). This step did NOT appear in the actual workflow.*

### Assertions
- [!] Step **never appeared** after Certify Invoice — workflow went directly to Prepare Voucher

### Changes Observed
15. **[STEP REMOVED] TC-04 no longer exists**: "Assign Responsible Person to Verify Invoice" (Thulilem) is absent from the current BAS workflow. The workflow proceeds from Certify Invoice directly to Prepare Voucher.

---

## TC-05: Prepare Voucher

*Test plan documents this as Thulilem's (Finance Unit) step. Actual owner is TaniaSmith (Business Unit).*

**Access via:** Inline after Certify Invoice

### Assertions
- [x] Step heading: "Prepare Voucher" — status "Certified"
- [!] Step owner is **TaniaSmith** (Business Unit), NOT Thulilem (Finance Unit) as documented
- [x] **Outcome radio buttons present** (4 options):
  - Verification is complete
  - Send for supplier related query
  - Send for business related query
  - Reject Invoice
- [x] **Business Unit Response checklist** loaded with 4 Yes/No questions:
  1. "Received ALL the different supporting documents."
  2. "Prepare a payment voucher pack using a checklist of ALL documents needed to validate the transaction to be paid."
  3. "Confirms the work performed on the Invoice Tracking system ready for transfer of readily prepare voucher packs to be transferred to the next level of payment process which is the Pre-check (Verification) point."
  4. "Reconcile the physical list of Vouchers prepared, with the system Invoice records and hand over to the Pre-Check (Verification) point."
- [x] All 4 checklist items answered "Yes"
- [x] "Verification is complete" selected as Outcome
- [x] Submit enabled; completes without errors
- [x] Post-submit: redirects to **My Items**
- [x] PAY4718/2026 no longer in TaniaSmith's queue (passed to next owner — Gwenb)
- [!] Total Amount shows "R 0" during initial load; resolves to R 2500 after full load
- [!] Attachment size changed: RULES.pdf grew from 140.16 kB to **226.67 kB** between steps

### Changes Observed
16. **[ROLE CHANGE] Prepare Voucher owner**: Step belongs to TaniaSmith (Business Unit), not Thulilem (Finance Unit).
17. **[NEW FIELDS] Prepare Voucher has 4-option Outcome radio** (not documented).
18. **[NEW FIELDS] Prepare Voucher has 4-item Yes/No Business Unit Response checklist** (not documented). Submit is blocked until all items are answered.
19. **[BEHAVIOR CHANGE] Post-submit from Prepare Voucher**: Redirects to My Items (not inline).
20. **[BUG] Attachment file size grows across steps**: RULES.pdf was 140.16 kB on TC-02 details view; 226.67 kB on TC-05 details view. Same file, different sizes — may indicate server-side re-processing on each step.

---

---

## TC-06: Verify Voucher

*Test plan documents this as Gwenb (Internal Control). Actual owner is Thulilem (Finance Unit).*

**Access via:** Thulilem's Inbox — record found by searching "PAY4718"

### Assertions
- [x] PAY4718/2026 found in Thulilem's Inbox (not Gwenb's) — Action Required: "Verify Voucher"
- [x] Workflow action page loads: step heading "Verify Voucher"
- [x] Status: Certified
- [x] Received from Tania Smith
- [x] **Batch Number** field present (required, marked with *)
- [x] Batch Number filled: BATCH-E2E-001
- [x] **Confirmation checkbox** present: "I confirm that I have reviewed the payment and supporting information"
- [x] Submit disabled until both Batch Number filled and checkbox checked
- [x] Checkbox checked — Submit enabled
- [x] Submit completes without errors
- [x] Post-submit: **"Authorise Invoice Voucher" step loads inline** (not redirect to Inbox)
- [x] Status updates to **"Verified"**

### Changes Observed
21. **[ROLE CHANGE] Verify Voucher owner**: Step is assigned to Thulilem (Finance Unit), not Gwenb (Internal Control) as documented in TC-06.
22. **[NEW FIELDS] Verify Voucher has Batch Number field** (required) — not documented in test plan.
23. **[NEW FIELDS] Verify Voucher has confirmation checkbox** — not documented in test plan.
24. **[BEHAVIOR CHANGE] Post-submit from Verify Voucher**: Next step loads inline (not redirect to Inbox).

---

## TC-07: Authorise Invoice Voucher

*Test plan documents this as "Approve Invoice". Actual step name is "Authorise Invoice Voucher".*

**Access via:** Inline after Verify Voucher submit

### Assertions
- [x] Step heading: "Authorise Invoice Voucher" (not "Approve Invoice")
- [x] Status: Verified
- [x] Received from Thulile Matekanya
- [x] Invoice details visible: ITS-E2E-001, R 2500, RULES.pdf 226.67 kB
- [!] Total Amount shows "R undefined" during initial load — resolves to R 2500
- [x] **Confirmation checkbox** present: "I confirm that I have reviewed and approve the invoice, payment details and all supporting information."
- [x] No Batch Number field (unlike TC-06)
- [x] Submit disabled until checkbox checked
- [x] Checkbox checked — Submit enabled
- [x] Submit completes without errors
- [x] Post-submit: **"Upload Captured Invoices Report From BAS" step loads inline**
- [x] Status updates to **"Approved"**

### Changes Observed
25. **[STEP NAME CHANGE] TC-07 step renamed**: Actual step is "Authorise Invoice Voucher", not "Approve Invoice".
26. **[NEW FIELD] Confirmation checkbox** required on Authorise Invoice Voucher — not documented.
27. **[BEHAVIOR CHANGE] Post-submit from Authorise Invoice Voucher**: Next step loads inline.

---

## TC-08: Upload Captured Invoices Report From BAS — BLOCKED

*Step name matches test plan. Step loaded inline after TC-07 submit.*

**Access via:** Inline after Authorise Invoice Voucher submit

### Assertions
- [x] Step heading: "Upload Captured Invoices Report From BAS" — correct
- [x] Status: Approved
- [x] Page component: `SAGov-BAS-request-for-payment-details v11` (general record details view, not a dedicated action form)
- [x] "Other Documents" upload section present — file (RULES.md 1.7 kB) uploaded successfully
- [!] **No Submit button present** — only Close button and file upload controls
- [!] Clicking Close navigated back to the previous completed step (TC-07's todoid) showing "Requested action is not available"
- [!] PAY4718/2026 remains at "Upload Captured Invoices Report From BAS" step in Thulilem's Inbox after Close

### Changes Observed
28. **[BUG] TC-08 has no Submit button**: The "Upload Captured Invoices Report From BAS" workflow action page shows only the record details form with "Other Documents" upload and a Close button. There is no Submit button to advance the workflow. This step is **BLOCKED** — PAY4718/2026 cannot be advanced past this step.
29. **[DESIGN DIFFERENCE] TC-08 uses general record details form** (`SAGov-BAS-request-for-payment-details v11`) rather than a dedicated workflow action form. All other steps used purpose-built action forms.
30. **[BEHAVIOR] Clicking Close on TC-08** navigates to the previous step's URL showing "Requested action is not available" — not the expected Inbox redirect.

---

## TC-09 to TC-13: Not Executed

TC-09 ("Upload Final Authorised Invoices Report From BAS"), TC-10 ("Capture Filling"), TC-11 ("Attach Payment Stub"), TC-12 ("Manage Supplier Related Queries"), and TC-13 ("Review Rejected Invoice") were not executed.

**Blocker**: TC-08 cannot be completed — no Submit button on the workflow action page. PAY4718/2026 remains stuck at "Upload Captured Invoices Report From BAS" with status "Approved".

---

## Consolidated Change Log

| # | TC | Area | Change | Impact |
|---|----|----|--------|--------|
| 1 | TC-01 | Mode switcher | UI badge shows "Live" but localStorage is "latest" — mismatch | Update Known Behaviors; update TC-01 step 5 |
| 2 | TC-01 | Create New dropdown | "test-workflow" appears as a new dropdown option | Note in Known Behaviors |
| 3 | TC-01 | Post-submit | Submit → next step loads inline (not My Items redirect) | Update TC-01 steps 19–21 |
| 4 | TC-01 | Attachment | .md upload converts to .pdf server-side after submit | Update Known Behaviors |
| 5 | TC-01 | Form URL | Form opens at `/shesha/workflow-action?id=...&todoid=...` | Note in Known Behaviors |
| 6 | TC-02 | Step name | "Assign Branch Finance Admin To Assign Certifier" (not "Assign Responsible Person to Certify Invoice") | Rewrite TC-02 title and steps |
| 7 | TC-02 | Field label | "Branch Finance Admin" not "Responsible Person" | Rewrite TC-02 step 6 |
| 8 | TC-02 | Post-submit | Redirects to My Items (not inline) | Update TC-02 step 10 |
| 9 | TC-03 | Workflow | TC-03 split into 2 sub-steps: Assign Certifier + Certify | Rewrite TC-03 |
| 10 | TC-03 | Sub-step A field | Field label "Official" (not "Responsible Person") | Update TC-03 |
| 11 | TC-03 | Sub-step B | Certify Invoice requires radio button selection (satisfactory/not) | Update TC-03 |
| 12 | TC-03 | Post-submit | Both sub-steps load next step inline | Update TC-03 |
| 13 | TC-04 | Workflow | "Assign Responsible Person to Verify Invoice" step REMOVED from BAS workflow | Delete TC-04 or mark obsolete |
| 14 | TC-05 | Role | Prepare Voucher owner changed from Thulilem (Finance) to TaniaSmith (Business Unit) | Rewrite TC-05 |
| 15 | TC-05 | New fields | 4-option Outcome radio added to Prepare Voucher | Update TC-05 steps |
| 16 | TC-05 | New fields | 4-item Yes/No Business Unit Response checklist added | Update TC-05 steps |
| 17 | TC-05 | Post-submit | Redirects to My Items | Update TC-05 |
| 18 | Multiple | Total Amount | Shows "R 0" or "R undefined" during page load on each step — transient bug | Add to Known Behaviors (bug) |
| 19 | Multiple | Attachment size | RULES.pdf size changes between steps (140 kB → 226 kB) — may indicate re-processing | Add to Known Behaviors |
| 20 | TC-06 | Role | Verify Voucher owner is Thulilem (Finance Unit), not Gwenb (Internal Control) | Rewrite TC-06 owner |
| 21 | TC-06 | New fields | Batch Number (required) + confirmation checkbox added to Verify Voucher | Rewrite TC-06 steps |
| 22 | TC-06 | Post-submit | Next step loads inline (not Inbox redirect) | Update TC-06 |
| 23 | TC-07 | Step name | "Authorise Invoice Voucher" not "Approve Invoice" | Rewrite TC-07 title |
| 24 | TC-07 | New field | Confirmation checkbox required on Authorise Invoice Voucher | Rewrite TC-07 steps |
| 25 | TC-07 | Post-submit | Next step loads inline | Update TC-07 |
| 26 | TC-08 | BUG | No Submit button — workflow cannot advance past this step | **Raise as defect; mark TC-08 BLOCKED** |
| 27 | TC-08 | Design | Uses general record details form, not a dedicated workflow action form | Investigate with dev team |

---

## Recommendations

1. **Rewrite TC-02**: New step name, field label, and post-submit behaviour.
2. **Split TC-03 into TC-03a and TC-03b**: "Assign Responsible Person to Certify Invoice" and "Certify Invoice" are distinct steps requiring separate test cases.
3. **Remove TC-04**: "Assign Responsible Person to Verify Invoice" no longer exists in the BAS workflow. Flag for business/dev confirmation.
4. **Rewrite TC-05**: Owner is TaniaSmith; add Outcome radio and Yes/No checklist steps.
5. **Rewrite TC-06**: Owner is Thulilem (not Gwenb); add Batch Number and confirmation checkbox; update post-submit.
6. **Rewrite TC-07**: Rename to "Authorise Invoice Voucher"; add confirmation checkbox; update post-submit.
7. **Log TC-08 as a defect**: "Upload Captured Invoices Report From BAS" step has no Submit button — the workflow action page renders a general record details view instead of a dedicated action form. This is a blocking defect preventing the BAS workflow from completing.
8. **Log Total Amount loading bug**: "R 0" / "R undefined" during step transitions should be raised as a defect — users may think the amount is wrong.
9. **Log Attachment re-processing**: File size growing between steps suggests the PDF is being re-generated on each workflow step — investigate whether this is intended.
10. **Run TC-09–TC-11 after TC-08 is fixed**: Once the Submit button defect in TC-08 is resolved, continue the PAY4718/2026 record through the remaining steps.
7. **Run TC-06 through TC-13**: Continue the PAY4718/2026 record with Gwenb (Verify Voucher) in a follow-up session.
