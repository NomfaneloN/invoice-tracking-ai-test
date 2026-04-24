# LOGIS Request for Payment — Full Workflow (Supplier-Query + Happy-Path) — PASS

**Run Date:** 2026-04-22
**Tester:** Claude (driving browser via MCP)
**Environment:** QA (https://pd-invtracking-adminportal-qa.azurewebsites.net)

---

## Run Metrics

| Metric | Value |
|--------|-------|
| Total Duration | ~5h 40m from 09:10 to 12:49 SAST (incl. diagnostic cycles for date-column issue) |
| Records Exercised | 3 (PAY5568, PAY5578 blocked; PAY5592 completed end-to-end) |
| Pass | TC-01 → TC-14 → TC-05b → TC-06 → TC-07 → TC-08 → TC-10 → TC-11 → TC-12 on PAY5592 |
| Fail / Blocked | PAY5568 and PAY5578 TC-10 blocked (diagnosed as file-prep error — stale date columns) |
| UI/UX Issues Found | 5 |
| API Cost (est.) | ~$5.00 |

---

## Key Finding — Root Cause of the "LOGIS Final Authorise Blocker" from the memo

The long-standing LOGIS auto-authorise blocker documented in `project_logis_final_authorise_blocker.md` is **NOT a backend bug**. It's a file-prep issue in the test data.

**Rule:** The BAS Payment Register `.xlsx` must have **7 cells** in row 10 updated before each import — not just 3 as previously documented:

| Cell | Column | Value | Type |
|------|--------|-------|------|
| C10 | FUNC NO | Ref No digits (e.g. 5592) | numeric |
| **H10** | **INV RECDTE** | **today's Excel serial** | **numeric** |
| I10 | SOURCE DOC NUMBER | Invoice No | string |
| **O10** | **CAPTURE DATE** | **today's Excel serial** | **numeric** |
| **P10** | **AUTH DATE** | **today's Excel serial** | **numeric** |
| **Q10** | **INV DATE** | **today's Excel serial** | **numeric** |
| T10 | AMOUNT | invoice total | numeric |

The yesterday's template we'd been reusing had `46133 = 2026-04-21` frozen in H10/O10/P10/Q10. With stale dates, the import log shows `Inserted: 1, Matched: 1` — same as a successful run — but `Payments Authorised: 0` and the workflow silently refuses to advance. With today's dates (46134 = 2026-04-22), the same payload produced `Payments Authorised: 1` and advanced the record through to Paid.

**Credit:** the user identified this hypothesis when I was preparing to escalate — "the Invoice Received Date, Capture Date, Authorise Date and Invoice Date are wrong." Confirmed correct.

---

## Proof Chain

| Record | Date columns | Log outcome | Workflow | Status |
|--------|--------------|-------------|----------|--------|
| PAY5568/2026 | yesterday (46133) | Matched: 1, Authorised: 0 | stuck at Final Authorise | Verified |
| PAY5578/2026 | yesterday (46133) | Matched: 1, Authorised: 0 | stuck at Final Authorise | Verified |
| PAY5578/2026 (retry) | today (46134) | BUT Updated: 1 (dedup) Matched: 0 | stuck | (dedup bit us on retry) |
| **PAY5592/2026** | **today (46134) from the start** | **Matched: 1, Authorised: 1** | **advanced 10→11→12** | **Paid** |

---

## PAY5592 End-to-End Timeline

- 12:22 — TC-01 create (Moshadim) `ITS-LOGIS-20260422-S` R2000 ORDER-00024
- 12:27 — TC-02 Certify (Tania)
- 12:28 — TC-03 Approve Invoice (Thulilem)
- 12:29 — TC-04 Assign Responsible Official → Tania (sarahm)
- 12:31 — TC-05 Verify Invoice → Verification is complete (Tania) — **happy path this run, supplier-query branch already verified on PAY5568/PAY5578 through TC-08**
- 12:32 — TC-06 Capture and Link on LOGIS (Moshadim), payment number 5592
- 12:33 — TC-07 Pre-Authorise Payment (Moshadim)
- 12:34 — TC-08 Verify Voucher (Gwenb)
- 12:35 — **TC-10 Final Authorise Payment — BAS import with today's dates → Payments Authorised: 1, record advanced to Attach Payment Stub**
- 12:43 — TC-11 Attach Payment Stub via Admin Payment Stubs Import → Payments Confirmed: 1, status `Paid`
- 12:45 — TC-12 Capture Filing (Gwenb) — Batch-20260422 / BOX-01 / 1-10 → submitted, record left Gwenb's inbox

---

## Supplier-Query Branch Verification (from earlier in the run)

Exercised twice on PAY5568 (supplier query → resolve → resume as Verification is complete), and the branch mechanics all work:
- "Send for supplier related query" radio at Verify Invoice step
- Comment dialog accepts input (title label bug — says "business related query" but wording doesn't affect flow)
- Record routes immediately to "Respond to Queries" in Tania's own inbox (since she's both BU and the supplier-response role in this test setup)
- Ticking the "all queries resolved" checkbox and submitting returns record to Verify Invoice
- Selecting "Verification is complete" there and submitting resumes the happy path

---

## Updated Test Plan

`test-plans/e2e-logis-full-workflow.md` TC-10 has been updated to list all 7 cells with the Excel-serial helper formula. The old "3 cells" guidance has been corrected.

---

## UI/UX Issues (unchanged from morning report)

| # | TC | Severity | Issue |
|---|-----|----------|-------|
| 1 | TC-05a | High | Query-dialog title says "Send for business related query" regardless of which radio was selected |
| 2 | TC-05b | Medium | Dialog reappears on Submit after query resolution; workaround is page reload before clicking Submit |
| 3 | TC-06 | Medium | "Total Amount" briefly shows "R 6000" during save mode before settling at R 2000 |
| 4 | TC-06 | Low | Typo: "I confirm that l have captured…" (lowercase l) |
| 5 | TC-10 | **Critical (now diagnosed)** | BAS auto-authorise silently skips with stale H10/O10/P10/Q10 dates — no error surfaced in log. Either: (a) file prep discipline (templates should have today's dates), or (b) backend should either accept older dates OR surface a "date stale" error in the import log |

---

## Recommendations for Dev

1. **Improve BAS import log verbosity** — when the match succeeds but auto-authorise skips, log the reason (e.g. `Skipped authorise: INV RECDTE 2026-04-21 is not today`). Currently the log is indistinguishable from a successful authorise.
2. **Consider relaxing the date requirement** — is strict equality with today actually required, or would any non-future date be acceptable? Worth asking the BAS integration spec.
3. Fix the query-dialog title (TC-05a).
4. Fix typo "l" → "I" in TC-06 confirmation.

---

## Artefacts

- `test-data/bas-registers/BAS Payment Register LOGIS-20260422-S.xlsx` — the file that worked (all 7 cells today-dated)
- `.playwright-mcp/20260422-02.35.20_BAS Payment Register LOGIS-20260422-S.xlsx.log` — successful import log (`Matched: 1, Payments Authorised: 1`)
- `test-data/payment-stubs/training STUB LOGIS-20260422S.txt` — stub file for TC-11
