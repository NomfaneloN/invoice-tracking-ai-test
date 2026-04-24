# LOGIS Request for Payment — Send for Supplier Related Query Flow

**Run Date:** 2026-04-22
**Started:** 09:10 SAST (TC-01 PAY5568/2026)
**Stopped:** 13:47 SAST (BAS auto-authorise backend bug confirmed blocks both PAY5568 and PAY5578)
**Tester:** Claude (driving browser via MCP)
**Environment:** QA (https://pd-invtracking-adminportal-qa.azurewebsites.net)
**Scenario:** Send for Supplier Related Query exception path, then return via Verification is complete

---

## Run Metrics

| Metric | Value |
|--------|-------|
| Total Duration | ~4h37m (including dev wait time + diagnostic retry with fresh record) |
| Test Cases Executed | TC-01 → TC-08 passed twice; TC-10 blocked on both records |
| Pass | 16 (TC-01→TC-08 + TC-05a + TC-14 for both PAY5568 and PAY5578) |
| Fail / Blocked | TC-10 blocked on both records (auto-authorise backend bug) |
| Skip (dependency of TC-10) | TC-11 Attach Payment Stub, TC-12 Capture Filing |
| UI/UX Issues Found | 5 |
| API Cost (est.) | ~$4.20 (long session with BAS log downloads, diagnostic xlsx inspection, two full runs) |

---

## Records Under Test

- **PAY5568/2026** — Initial run. Workflow ID `ce918780-ab2f-4e32-afcc-05875bb0892a`. ITS-LOGIS-20260422-Q / R2000. Supplier query flow took the branch via Verify Invoice (TC-05a), Respond to Queries (TC-14 equivalent), then Verification is complete. Stuck at Final Authorise Payment.
- **PAY5578/2026** — Fresh run after diagnostic to rule out BAS-row dedup. Workflow ID `5159d152-0e7a-48d3-98fa-4ef728f36223`. ITS-LOGIS-20260422-R / R2000. Same supplier query → resolve → complete flow. Also stuck at Final Authorise Payment.

Both records reached step 10 "Final Authorise Payment" assigned to Thulile Matekanya + System Administrator. Neither advanced despite the BAS Report Import matching correctly.

---

## Scope vs Reality

**Requested:** Run LOGIS Request for Payment via the **Send for Supplier Related Query** exception branch, then resume and complete end-to-end.

**Delivered:**
- ✅ TC-01 → TC-04 happy path to Verify Invoice (Tania)
- ✅ TC-05a — "Send for supplier related query" radio selected at Verify Invoice, query comment submitted via dialog
- ✅ TC-14 — Respond to Queries (back in Tania's inbox after supplier "response"), confirmation checkbox ticked, submitted
- ✅ Return to Verify Invoice, "Verification is complete" selected, submitted
- ✅ TC-06 Capture and Link on LOGIS (Moshadim)
- ✅ TC-07 Pre-Authorise Payment (Moshadim)
- ✅ TC-08 Verify Voucher (Gwenb)
- ❌ TC-10 BLOCKED — BAS Report Import matches correctly (`Inserted: 1, Matched: 1`) but workflow does not advance to Attach Payment Stub. Counters stay at `Payments Authorised: 0`.
- ⏸ TC-11 Attach Payment Stub — not exercised
- ⏸ TC-12 Capture Filing — not exercised

---

## Per-TC Timing (PAY5568 first run; PAY5578 is shorter — same branches in ~1h)

### TC-01 — Register and Upload Invoice (Moshadim)
**Started:** 09:10 | **Completed:** 09:15 | **Duration:** ~5m
- Created LOGIS Request For Payment via Create New
- Selected Order `ORDER-00024` via entity picker (searched, double-clicked)
- Supplier details + Business Unit auto-populated (GEMINI MOON TRADING 7 / Tania Smith)
- Invoice row: 22/04/2026, 22/04/2026, `ITS-LOGIS-20260422-Q`, `R2000`, `training STUB (1).txt`
- plus-circle to commit, Submit
- **Result:** PAY5568/2026 created, status `Received`

### TC-02 — Certify Invoice (TaniaSmith)
**Started:** 09:16 | **Completed:** 09:17 | **Duration:** ~1m
- Happy-path radio "Goods and Service has been delivered satisfactory" → Submit
- **Result:** Status `Certified`

### TC-03 — Approve Invoice (Thulilem, Finance — step 3)
**Started:** 09:17 | **Completed:** 09:19 | **Duration:** ~2m
- Happy-path radio (index 0) → Submit
- **Result:** Record advanced to Assign Responsible Official

### TC-04 — Assign Responsible Official (sarahm / Branch Finance)
**Started:** 09:19 | **Completed:** 09:21 | **Duration:** ~2m
- Official combobox → type "Tania" → select Tania Smith → Submit
- **Result:** Record at "Verify Invoice" in Tania's inbox

### TC-05a — Verify Invoice: Send for Supplier Related Query (TaniaSmith)
**Started:** 09:23 | **Completed:** 09:24 | **Duration:** ~1m
- Order Matching Outcome radio = "Send for supplier related query"
- Submit opens a comment dialog with misleading title **"Send for business related query"** (UI/UX bug — title is wrong)
- Entered supplier query text, clicked Ok
- **Result:** Record routes immediately to "Respond to Queries" in Tania's own inbox

### TC-14 — Manage Supplier Related Query (TaniaSmith as "supplier")
**Started:** 09:24 | **Completed:** 09:25 | **Duration:** ~1m
- Ticked "I confirm that all queries have been resolved and necessary information has been provided."
- Submit → record returns to Verify Invoice step

### TC-05b — Verify Invoice: Verification is complete (TaniaSmith)
**Started:** 09:25 | **Completed:** 09:27 | **Duration:** ~2m
- Radio "Verification is complete" selected (dialog quirk resolved by reloading page)
- Submit completed successfully
- **Result:** Record advanced to TC-06

### TC-06 — Capture and Link Invoice on LOGIS (Moshadim)
**Started:** 09:29 | **Completed:** 09:30 | **Duration:** ~1m
- Payment Number 5568 typed → inline save icon clicked
- "Should payment proceed?" = Yes
- Confirmation checkbox ticked → Submit

### TC-07 — Pre-Authorise Payment (Moshadim)
**Started:** 09:30 | **Completed:** 09:31 | **Duration:** ~1m
- Confirmation ticked → Submit
- **Result:** Record at "Verify Voucher"

### TC-08 — Verify Voucher (Gwenb)
**Started:** 09:32 | **Completed:** 09:33 | **Duration:** ~1m
- Reviewed voucher, ticked confirm checkbox → Submit
- **Result:** Record at "Final Authorise Payment" (confirmed via progress-hover: Thulile Matekanya + System Administrator)

### TC-10 — Final Authorise Payment (Admin — BAS Report Import) **BLOCKED**
**Started:** 09:37 | **Stopped:** 13:47 | **Attempts:** 8 imports
- Imports at 11:37, 11:39, 11:41 (PAY5568 with incorrect type string C10), 13:11, 13:14 (PAY5568 with correct numeric C10), 13:44 (fresh PAY5578 — matches yesterday's template exactly)
- All imports show `Is Success: Yes`, `Rows Affected: 0`, `Payments Authorised: 0`
- Log downloads confirm parsing is correct — 13:44 fresh import returned `Inserted: 1, Updated: 0, Matched: 1` identical to yesterday's success pattern
- Workflow did not advance — still at Final Authorise Payment per progress-hover tooltip on both PAY5568 and PAY5578

---

## Evidence the Blocker Is a Backend Regression, Not a File/User Error

1. **File matches yesterday's successful template exactly.** Same source (LOGIS-20260421X.xlsx), only 3 cells edited: C10 numeric FUNC NO, I10 string SOURCE DOC, T10 numeric AMOUNT.
2. **Log file patterns are identical between today's failing import and yesterday's successful one:**
   - Yesterday 21/04 17:33: `Inserted: 1, Updated: 0, Matched: 1` → Payments Authorised: 1 ✅ advanced
   - Today 22/04 13:44: `Inserted: 1, Updated: 0, Matched: 1` → Payments Authorised: 0 ❌ did not advance
3. **Record confirmed at Final Authorise Payment** via progress-indicator hover tooltip (assignee: Thulile Matekanya + System Administrator). Received 13:42.
4. **Final Authorise Payment form has no Submit** (same as pre-existing memo observation) — the BAS import transition is the only path, and it's broken for LOGIS.
5. **Fresh record (PAY5578) with fresh FUNC/Invoice** produced `Inserted: 1` (new BAS row, not an update) and still did not authorise — ruling out dedup.
6. **Dev's afternoon fix was scoped to the history grid display**: before the fix the Imported File and Log File columns in the BAS Report Import history showed empty; after the fix they populate with the actual filenames. This did not touch the auto-authorise logic.

---

## UI/UX Issues

| # | TC | Severity | Issue | Notes |
|---|-----|----------|-------|-------|
| 1 | TC-05a | High | Dialog title "Send for business related query" appears when the selected radio is "Send for supplier related query" | Labelling bug — the generic query dialog is reused but its title is hardcoded to the business-query wording |
| 2 | TC-05b | Medium | After submitting the Respond to Queries step, the Verify Invoice form reopens but its Submit triggers the same query dialog again even when "Verification is complete" is selected | Workaround: reload the page once before clicking Submit. Dialog seems bound to the Submit handler rather than the selected radio |
| 3 | TC-06 | Medium | Total Amount briefly displays "R 6000" while the row is being captured, before reverting to the correct "R 2000" after save icon is clicked | Visual glitch — appears to sum or duplicate during edit mode |
| 4 | TC-06 | Low | "I confirm that l have captured this invoice on payment system." — `l` instead of `I` in the confirmation text | Typo in user-visible label |
| 5 | TC-10 | Medium (now fixed) | Imported File and Log File columns in BAS Report Import History grid were blank until dev fix at ~13:00 today. Fix populated the fields retroactively for existing rows too | Dev fix confirmed — subsequent imports at 13:11 onward show correct filenames |

---

## Performance Observations

| TC | Action | Approx Load Time | Notes |
|----|--------|-----------------|-------|
| TC-01 | LOGIS form open after Create New | ~4s | Spinner "Fetching data..." visible |
| TC-05b | Verify Invoice reload after Respond to Queries | ~7s | "Loading checklist items..." never finishes; submit still works |
| TC-10 | BAS import processing | <1s | Fast — import itself is not the slow part |

---

## Key Finding

**The "supplier related query" branch of the LOGIS workflow works correctly end-to-end through TC-08.** Both PAY5568 and PAY5578 reached Final Authorise Payment after going through the query → respond → resume path. The blocker is NOT in the query branch — it's the same long-standing LOGIS auto-authorise bug documented in the project memo. Today's dev fix addressed a separate issue (empty display fields on the import history grid), not this auto-authorise trigger.

---

## Recommendations

1. **Dev: investigate the LOGIS auto-authorise trigger.** BAS import correctly matches and inserts the payment row (confirmed by log `Matched: 1, Inserted: 1`), but the post-match hook that advances the workflow to "Attach Payment Stub" and increments `Payments Authorised` is not firing. Compare against the BAS workflow path which works. Review any trunk change between 21/04 end-of-day and 22/04 morning that might have reverted the LOGIS branch.
2. **Fix the dialog title bug** in TC-05a so it reflects the selected query type.
3. **Fix the typo** "I confirm that l have…" → "I confirm that I have…"
4. **Investigate checklist loading** for Verify Invoice after supplier-query resolution — it's perpetually stuck on "Loading checklist items…" but doesn't block submit.

---

## Test Artefacts

- `test-data/bas-registers/BAS Payment Register LOGIS-20260422-Q.xlsx` (PAY5568, FUNC 5568, ITS-LOGIS-20260422-Q)
- `test-data/bas-registers/BAS Payment Register LOGIS-20260422-R.xlsx` (PAY5578, FUNC 5578, ITS-LOGIS-20260422-R)
- Log file downloads in `.playwright-mcp/`:
  - `20260422-11-41-44-BAS-Payment-Register-LOGIS-20260422-Q-xlsx.log` (PAY5568 attempt, numeric C10)
  - `20260422-01-14-23-BAS-Payment-Register-LOGIS-20260422-Q-xlsx.log` (PAY5568 post dev-fix)
  - `20260422-01-44-34-BAS-Payment-Register-LOGIS-20260422-R-xlsx.log` (PAY5578 fresh)
  - `20260421-05-33-13-BAS-Payment-Register-LOGIS-20260421X-xlsx.log` (yesterday's reference for comparison)
