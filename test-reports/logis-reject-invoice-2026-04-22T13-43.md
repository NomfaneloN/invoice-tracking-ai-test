# LOGIS Request for Payment — Reject Invoice Branch — PASS (with observation)

**Run Date:** 2026-04-22
**Tester:** Claude (driving browser via MCP)
**Environment:** QA (https://pd-invtracking-adminportal-qa.azurewebsites.net)
**Scenario:** Verify Invoice → radio[3] Reject Invoice, then return via "Verification is complete" to complete full workflow

---

## Run Metrics

| Metric | Value |
|--------|-------|
| Total Duration | ~50m (12:52 → 13:43 SAST) |
| Record | PAY5612/2026 (ORDER-00024 / ITS-LOGIS-20260422-REJ / R2000) |
| Pass | TC-01 → TC-02 → TC-03 → TC-04 → TC-05a (Reject Invoice) → Respond to Queries → TC-05b (Verification is complete) → TC-06 → TC-07 → TC-08 → TC-10 → TC-11 → TC-12 |
| Fail | 0 |
| UI/UX Issues | Reject Invoice routing observation (see Key Finding below) |

---

## Key Finding — "Reject Invoice" radio routes to "Respond to Queries" (same as query branches)

Selecting **"Reject Invoice"** (radio index 3) at Verify Invoice routes the record to the **same "Respond to Queries"** step in Tania Smith's own inbox — behaviourally identical to the "Send for business related query" and "Send for supplier related query" branches tested earlier on PAY5603/PAY5592. All four Verify Invoice radio outcomes except "Verification is complete" converge at the same "Respond to Queries" resolution page:

| Radio (1-indexed) | 0-indexed | Label | Destination step after Submit |
|---|---|---|---|
| 1 | 0 | Send for business related query | Respond to Queries |
| 2 | 1 | Send for supplier related query | Respond to Queries |
| 3 | 2 | Verification is complete | Capture and Link Invoice on LOGIS (happy path) |
| 4 | 3 | Reject Invoice | **Respond to Queries (same as queries)** |

The existing workflow has a separate **"Review Invoice Rejection"** step visible on PAY4510/2026 in Tania's inbox, but this Reject Invoice radio at Verify Invoice does NOT trigger it. If "Review Invoice Rejection" is meant to be the outcome of rejection, the routing is not wired up — rejection currently behaves as a third query branch.

This is consistent with the shared-dialog behaviour documented on earlier runs: the comment dialog title is hardcoded to "Send for business related query" regardless of which radio triggered it. The three non-happy-path radios share one dialog and one downstream path on the backend.

---

## Timeline

- 12:52 — TC-01 create (Moshadim) PAY5612/2026, `ITS-LOGIS-20260422-REJ`, R2000, ORDER-00024
- 13:23 — TC-02 Certify (Tania)
- 13:25 — TC-03 Approve (Thulilem)
- 13:27 — TC-04 Assign Responsible Official → Tania (sarahm)
- 13:29 — TC-05a **Reject Invoice** radio (index 3 / 1-indexed position 4) selected; rejection comment captured
- 13:29 — **Respond to Queries** step (back in Tania's inbox) — ticked confirm, submitted
- 13:33 — Back at Verify Invoice — **"Verification is complete"** (radio index 2 / position 3) selected, submitted (required page reload workaround for the hardcoded-dialog bug)
- 13:35 — TC-06 Capture and Link (Moshadim, payment number 5612)
- 13:36 — TC-07 Pre-Authorise (Moshadim)
- 13:37 — TC-08 Verify Voucher (Gwenb)
- 13:39 — **TC-10 BAS import** with today-dated register → `Payments Authorised: 1` ✅
- 13:40 — **TC-11 Stub import** → `Payments Confirmed: 1`, status `Paid` ✅
- 13:42 — TC-12 Capture Filing (Gwenb) BATCH-20260422REJ / BOX-03 / 1-10 → submitted
- 13:43 — PAY5612 no longer in Gwenb's inbox — **workflow complete**

---

## BAS Register Used (today-dated)

`test-data/bas-registers/BAS Payment Register LOGIS-20260422-REJ.xlsx` with cells:
- C10 = 5612 (numeric)
- H10 = 46134 (numeric, today)
- I10 = ITS-LOGIS-20260422-REJ (string)
- O10 = 46134 (numeric, today)
- P10 = 46134 (numeric, today)
- Q10 = 46134 (numeric, today)
- T10 = 2000 (numeric)

Import log: `Rows Affected: 0, Rows Skipped: 0, Payments Authorised: 1` — identical success pattern.

---

## UI/UX Observations

- **Reject Invoice routing convergence** (high — may be a functional bug): The Reject Invoice radio routes to the same "Respond to Queries" step as the query branches. No distinct rejection flow is triggered. Confirm with dev whether this is the intended behaviour or whether Reject Invoice should invoke the "Review Invoice Rejection" step seen elsewhere in the system.
- **Hardcoded query-dialog title** (medium — known from earlier runs): On Submit from Verify Invoice, the dialog title always reads "Send for business related query" even when Reject Invoice or Verification is complete was selected. Workaround: close the dialog and reload the page before clicking Submit again.
- **Dialog reappears on Submit after query resolution** (medium — known): After Respond to Queries, attempting to select Verification is complete and Submit triggers the business-related-query dialog; page reload is required to bypass.

---

## Conclusion

The Reject Invoice exception branch completes end-to-end, but it is functionally indistinguishable from the supplier/business query branches — all three non-happy-path radios converge at Respond to Queries and return to Verify Invoice, where Verification is complete resumes the happy path. With the BAS register dates fixed (7-cell rule), the workflow completes cleanly.

Four LOGIS records are now `Paid` in QA today (22/04/2026):
- PAY5554/2026 (yesterday, happy path)
- PAY5592/2026 (today, supplier-query branch)
- PAY5603/2026 (today, business-query branch)
- PAY5612/2026 (today, reject-invoice branch)
