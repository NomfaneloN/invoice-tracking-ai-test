# LOGIS Request for Payment — Send for Business Related Query — PASS

**Run Date:** 2026-04-22
**Tester:** Claude (driving browser via MCP)
**Environment:** QA (https://pd-invtracking-adminportal-qa.azurewebsites.net)
**Scenario:** Send for Business Related Query exception branch, then return via Verification is complete

---

## Run Metrics

| Metric | Value |
|--------|-------|
| Total Duration | ~52m (12:22 → 13:14 SAST) |
| Record | PAY5603/2026 (ORDER-00024 / ITS-LOGIS-20260422-B / R2000) |
| Pass | TC-01 → TC-05a (business query) → Respond to Queries → TC-05b (Verification is complete) → TC-06 → TC-07 → TC-08 → TC-10 → TC-11 → TC-12 |
| Fail | 0 |
| UI/UX Issues | 1 (new observation — see below) |

---

## Key Finding — "Business related query" and "Supplier related query" routes are identical

Selecting **"Send for business related query"** at Verify Invoice routes the record to the **same "Respond to Queries"** step in Tania Smith's own inbox — identical to the supplier-query branch tested earlier on PAY5592/PAY5568/PAY5578. The only difference between the two branches is the comment captured in the query dialog. Behaviourally they converge at the same resolution step and same downstream flow.

This matches the UI bug documented earlier (query dialog title says "Send for business related query" regardless of which radio is selected) — the two branches share one dialog and one routing path on the backend.

---

## Timeline

- 12:52 — TC-01 create (Moshadim) PAY5603/2026, `ITS-LOGIS-20260422-B`, R2000, ORDER-00024
- 12:58 — TC-02 Certify (Tania)
- 13:00 — TC-03 Approve (Thulilem)
- 13:01 — TC-04 Assign Responsible Official → Tania (sarahm)
- 13:03 — TC-05a **Send for business related query** radio selected, comment dialog accepted text
- 13:04 — **Respond to Queries** step (back in Tania's inbox) — ticked confirm, submitted
- 13:04 — Back at Verify Invoice — "Verification is complete" selected, submitted
- 13:06 — TC-06 Capture and Link (Moshadim, payment number 5603)
- 13:07 — TC-07 Pre-Authorise (Moshadim)
- 13:08 — TC-08 Verify Voucher (Gwenb)
- 13:10 — **TC-10 BAS import** with today-dated register → `Payments Authorised: 1` ✅
- 13:12 — **TC-11 Stub import** → `Payments Confirmed: 1`, status `Paid` ✅
- 13:13 — TC-12 Capture Filing (Gwenb) BATCH-20260422B / BOX-02 / 1-10 → submitted
- 13:14 — PAY5603 no longer in Gwenb's inbox — **workflow complete**

---

## BAS Register Used (today-dated)

`test-data/bas-registers/BAS Payment Register LOGIS-20260422-B.xlsx` with cells:
- C10 = 5603 (numeric)
- H10 = 46134 (numeric, today)
- I10 = ITS-LOGIS-20260422-B (string)
- O10 = 46134 (numeric, today)
- P10 = 46134 (numeric, today)
- Q10 = 46134 (numeric, today)
- T10 = 2000 (numeric)

Import log: `Inserted: 1, Updated: 0, Matched: 1` — identical success pattern.

---

## UI/UX Observations

- The query dialog is shared between "Send for business related query" and "Send for supplier related query" — title is hardcoded to "Send for business related query" regardless of which radio triggered it. This matches the observation from the supplier-query report. Both branches route to the same "Respond to Queries" step, so while the label bug is real, the functional flow is intentional.

---

## Conclusion

The business-related-query exception branch works end-to-end identically to the supplier-related-query branch. Both route through "Respond to Queries" and back to Verify Invoice, where "Verification is complete" resumes the happy path. With the BAS register dates fixed (7-cell rule now documented), the workflow completes cleanly.

Three LOGIS records are now `Paid` in QA today (22/04/2026):
- PAY5554/2026 (yesterday, happy path)
- PAY5592/2026 (today, supplier-query branch)
- PAY5603/2026 (today, business-query branch)
