# LOGIS Request for Payment — Full E2E Workflow Test Run

**Run Date:** 2026-04-23
**Started:** 10:48:46
**Completed:** 11:27:30
**Record Ref:** PAY5642/2026
**Order:** ORDER-00024 (GEMINI MOON TRADING 7, Tania Smith)
**Invoice:** ITS-LOGIS-20260423 — R 3000
**Execution Mode:** Claude-driven via MCP browser tools (RunType: local)

## Run Metrics

| Metric | Value |
|--------|-------|
| Total Duration | 00:38:44 |
| Test Cases Executed | 11 (TC-01…TC-08, TC-10, TC-11, TC-12) |
| Pass / Fail / Skip | 10 / 1 / 1 |
| UI/UX Issues Found | 4 |
| API Cost (est.) | ~$2.10 |

**Note on TC count:** TC-09 Obsolete (equivalent of TC-03 Finance Approve); TC-13/TC-14/TC-15 are exception paths and not in scope for this happy-path run.

## Per-TC Summary

| TC | Title | User | Status | Duration |
|----|-------|------|--------|----------|
| TC-01 | Register and Upload Invoice | Moshadim | **PASS** | ~4m |
| TC-02 | Certify Invoice | TaniaSmith | **PASS** | <1m |
| TC-03 | Approve Invoice (Finance) | Thulilem | **PASS** | <1m |
| TC-04 | Assign Responsible Official | sarahm | **PASS** | <1m |
| TC-05 | Verify Invoice — **"Verification is complete"** | TaniaSmith | **PASS** | <1m |
| TC-06 | Capture and Link Invoice on LOGIS | Moshadim | **PASS** | ~1m |
| TC-07 | Pre-Authorise Payment | Moshadim | **PASS** | <1m |
| TC-08 | Verify Voucher | Gwenb | **PASS** | <1m |
| TC-09 | (Obsolete — equivalent handled in TC-03) | — | SKIP | — |
| TC-10 | Final Authorise Payment (Admin BAS Import) | Admin | **PASS** (after template fix) | ~7m |
| TC-11 | Attach Payment Stub (Admin) | Admin | **PASS** | <1m |
| TC-12 | Capture Filing | Gwenb | **FAIL — BLOCKER** | N/A |

---

## TC-05 — Highlight

Primary request was executed successfully: the **"Verification is complete"** radio option was selected at the Order Matching Outcome section, workflow advanced to TC-06 Capture and Link Invoice on LOGIS.

```
Options presented at TC-05:
○ Send for business related query
○ Send for supplier related query
● Verification is complete       ← selected (user-requested happy path)
○ Reject Invoice
```

Workflow decision recorded: `Decision: VerificationComplete`

---

## TC-10 — Final Authorise Payment (resolved with user feedback)

Two distinct template problems caused the auto-authorise trigger to silently skip the first three BAS imports. Resolved on fourth attempt after user guidance.

### Root cause — wrong template
The initial BAS register was generated from `BAS Payment Register E2E-20260421B3.xlsx` (a **BAS workflow** template), which had cells that do not match what the LOGIS workflow's auto-authorise logic expects:

| Cell | E2E (wrong) | LOGIS (correct) | User comment |
|------|-------------|-----------------|--------------|
| R10 SOURCE DOC TYPE | `SUNDRY` | `INV` | "For BAS we write SUNDRY, for LOGIS we write INV" |
| N10 ENT NUMBER | `Maaa123` | `GR442` (supplier no) | — |
| J10 PAYSTA | — | `AUTH` | — |
| K10 PAYMTD | — | `EBT` | — |
| L10 PAYEE NAME | — | `GEMINI MOON TRADING 7` | — |
| M10 ENT TYPE | — | `CSDSUP` | — |

### Evidence trail (BAS Report Import History tab)
| Attempt | Time | Template | Is Success | Payments Authorised | Outcome |
|---|---|---|---|---|---|
| 1 | 13:05 | E2E (SUNDRY) | Yes | 0 | Updated: 1, Matched: 0 — no advance |
| 2 | 13:10 | E2E (SUNDRY) | Yes | 0 | Same — no advance |
| 3 | 13:16 | E2E + R10=INV + N10=GR442 | Yes | 0 | Same — no advance |
| 4 | 13:20 | **LOGIS template (full field set)** | Yes | **1** | ✅ Record advanced to Attach Payment Stub |

### Fix applied
Created `scripts/prepare-bas-register-logis-5642-v2.js` using `BAS Payment Register LOGIS-20260422-REJ.xlsx` as template (preserves all LOGIS-specific fields), only overwriting: C10 FUNC NO=5642, H10/O10/P10/Q10 (all today's serial 46135), I10 SOURCE DOC NUMBER=ITS-LOGIS-20260423, T10 AMOUNT=3000.

### Assertions
- [x] BAS .xlsx has correct FUNC NO, SOURCE DOC, AMOUNT in row 10
- [x] Admin login successful
- [x] BAS Report Import page loads
- [x] Upload + Import complete without error
- [x] History top row: `Is Success: Yes`, `Payments Authorised: 1` (after template fix)

---

## TC-11 — Attach Payment Stub

Created `test-data/payment-stubs/training STUB LOGIS-20260423.txt` with:
- SOURCE DOC NUMBER: `ITS-LOGIS-20260423`
- PURCHASE ORDER NUMBER: `ORDER-00024`
- PAYMENT NUMBER: `5642`
- AMOUNT: `3,000.00`

Imported via Admin → Payment Stubs Import → Import Payment Stub. Result row:
- Is Success: Yes, Rows Affected: 1, Rows Skipped: 0, **Payments Confirmed: 1**
- Record advanced to "Capture Filling" received by Internal Control at 13:21

### Assertions
- [x] Stub file fields updated
- [x] Admin login successful
- [x] Import completes
- [x] History: `Is Success: Yes`, `Rows Affected: 1`, `Payments Confirmed: 1`
- [x] Record status updates to `Paid`
- [x] Record appears in Gwenb's inbox at "Capture Filling" step

---

## TC-12 — Capture Filing — **BLOCKER (application defect)**

**Status:** FAIL — Submit button non-functional on LOGIS Capture Filling.

Reproduction:
1. Logged in as Gwenb
2. Opened PAY5642/2026 from inbox (Action = Capture Filling, Status = Paid)
3. Filled **Batch Number** = `BATCH-20260423`, **Box Number** = `BOX-01`, **File Range** = `1-10`
4. Ticked "I confirm that I have captured all the filing details under which the invoice is stored."
5. Submit button became enabled as expected
6. Clicked Submit — **no-op**: no network call, no toast, no validation error, page did not redirect
7. Retried via Playwright native click, via JS `button.click()`, and after re-loading the form fresh via a new inbox todoid — all three attempts produced the same silent no-op
8. Workflow history tab confirms Capture Filling "received by Internal Control" at 13:21 with **no matching "completed by" entry**

**User has reported this to the dev team.** This defect does not exist in the equivalent BAS (E2E) Capture Filling step, where Submit works normally.

### Assertions
- [x] Login as Gwenb successful
- [x] Record visible in Gwenb's Inbox at Capture Filling, status `Paid`
- [x] Batch/Box/File Range fields present, required, fillable
- [x] Confirmation checkbox present and tickable
- [x] Submit enables after fields + checkbox valid
- [!] **Submit completes without errors — FAIL: click is a no-op**
- [!] Record still in Gwenb's inbox — FAIL
- [!] Workflow progress bar shows all steps complete — FAIL

---

## UI/UX Issues

| # | TC | Severity | Issue |
|---|-----|----------|-------|
| 1 | Global | Low | Mode badge in header shows "Live" but mode switcher not found in user dropdown (previously noted) |
| 2 | TC-06 | Medium | Total Amount briefly showed "R 9000" while Payment Number save icon was active — looked like it stacked the order total and invoice, then settled at R 3000. Confusing during save. |
| 3 | TC-10 | **High** | BAS Report Import silently does NOT advance workflow when template is from the "wrong" workflow type. Log shows "Updated: 1, Matched: 0" but UI reports `Is Success: Yes` — a user has no way to know the import was effectively a no-op for the workflow without reading the log file. |
| 4 | TC-12 | **Critical** | Submit button on LOGIS Capture Filing is a no-op — blocks workflow completion; defect reported to dev |

## Performance Observations

| TC | Action | Approx Load Time | Notes |
|----|--------|-----------------|-------|
| TC-01 | Form open after Create New | ~5s | Spinner "Fetching data..." visible |
| TC-03/04 | Login → Inbox (per user switch) | 4–6s | Persistent across all user swaps |
| TC-06 | Capture and Link form | ~6s | |
| TC-08 | Verify Voucher form | ~8s | Initial page skeleton, then full render |
| TC-12 | Capture Filing form | ~8s | |

## Memory Updates Made
- Added `feedback_bas_source_doc_type.md`: R10 SOURCE DOC TYPE = `INV` for LOGIS, `SUNDRY` for BAS — silently breaks auto-authorise otherwise
- Added `project_logis_capture_filing_submit_defect.md`: TC-12 Submit no-op, reported to dev 2026-04-23

## Recommendations
1. **Dev team:** Fix LOGIS Capture Filing Submit handler — see defect memory file for full repro
2. **Dev team:** Surface BAS import template-mismatch as a visible warning rather than silent `Matched: 0` (current behaviour makes it indistinguishable from a successful no-op)
3. **Test plan:** Update `test-plans/e2e-logis-full-workflow.md` TC-10 prerequisite to explicitly state that BAS register must be copied from a LOGIS template, NOT the E2E template. List required cell values (R10=INV, N10=supplier number, J10/K10/L10/M10 carried over)
4. **Scripts:** Update `scripts/prepare-bas-register-*.js` future versions to accept a `--workflow={bas|logis}` flag so R10 + other differing cells are set correctly by construction
