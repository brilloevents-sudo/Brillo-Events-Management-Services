# Santa Operations Hub - Acceptance Test Suite & Verification Report

## 1. Executive Summary

The automated acceptance test suite guarantees that core business invariants, security gates, financial calculations, role permissions, and import mappings remain strictly enforced across code revisions.

- **Test Runner Location:** [`tests/run-all-tests.ts`](file:///c:/Users/ACER/Documents/brillo-santa-hub/tests/run-all-tests.ts)
- **Execution Command:** `npm run test` (or `npx tsx tests/run-all-tests.ts`)
- **Current Status:** **14/14 Tests Passing (100% Success)**

---

## 2. Test Inventory & Business Invariants

### Category 1: Pricing & Decimal-Safe Financial Precision
| # | Test Name | Invariant Tested | Expected Output |
| :--- | :--- | :--- | :--- |
| 1 | `50% deposit calculation handles centavo rounding consistently` | Floating-point IEEE-754 precision; $9000.28 + 9000.27 = 18000.55$. | Deposit: ₱9,000.28, Balance: ₱9,000.27, Sum: ₱18,000.55. |
| 2 | `Provincial target calculation yields ₱23,400 from ₱18,000 (+30%)` | Standard 30% travel surcharge for provincial locations (Clark, Tagaytay, Laguna, Cavite). | Target: ₱23,400.00, Deposit: ₱11,700.00. |
| 3 | `Holiday estimate shows ₱23k–₱30k range and routes to staff quote` | Peak dates (Dec 24, Dec 25) prevent automated underpricing and require staff approval. | Base: ₱23,000.00, Range text: `₱23,000 – ₱30,000`. |
| 4 | `Gross profit is calculated from direct costs and not mislabeled as net profit` | Direct event costs (Santa fee, PA fee, transport, wardrobe) deducted from revenue; labeled strictly as Gross Profit. | Direct Costs: ₱15,000.00, Gross Profit: ₱3,000.00, Margin: 16.67%. |

---

### Category 2: Booking State Machine & Security Gates
| # | Test Name | Invariant Tested | Security Rule |
| :--- | :--- | :--- | :--- |
| 5 | `Non-staff user cannot confirm booking as SECURED` | An unauthorized client or public actor cannot promote their own booking to `SECURED_UNASSIGNED`. | Transition rejected (`Only authorized staff may confirm a secured booking`). |
| 6 | `Signed agreement without verified payment remains UNSECURED` | A digital contract signature alone is insufficient to hold the roster. | Transition rejected (`Verified payment is required before confirming a booking`). |
| 7 | `Verified payment without signed agreement remains UNSECURED` | Uploading a payment slip without an executed contract cannot secure a talent booking. | Transition rejected (`A signed agreement is required before confirming a booking`). |
| 8 | `Staff can confirm booking as SECURED when BOTH signed agreement and verified payment exist` | The Dual Gate: only authorized staff with both verified payment and signed agreement can secure bookings. | Transition allowed (`allowed: true`). |

---

### Category 3: Role-Based Access Control (RBAC) Matrix
| # | Test Name | Invariant Tested | Permission Matrix Rule |
| :--- | :--- | :--- | :--- |
| 9 | `Sales role cannot execute payouts or view sensitive talent data` | Separation of duties prevents sales staff from disbursing company funds or viewing talent bank details. | `payout:record = false`, `paluwal:approve = false`, `talent:view_sensitive = false`. |
| 10 | `Finance role can verify payments, create paluwal, and record payouts` | Finance specialists verify cash movements, manage Paluwal advances, and record settlements. | `payment:verify = true`, `paluwal:create = true`, `payout:record = true`. |
| 11 | `Admin role possesses all operational, financial, and configuration permissions` | System administrators hold supervisory rights over conflict resolution, system settings, and state overrides. | Full rights across operational and financial domains. |

---

### Category 4: Excel Import 12-Sheet Inventory Detection
| # | Test Name | Invariant Tested | Source Reference |
| :--- | :--- | :--- | :--- |
| 12 | `All 12 sheets are detected with correct dimensions from source tracker` | Validates that all 12 operational sheets from `SANTA OPERATION TRACKER- 2026.xlsx` are recognized. | Confirms sheets: `Santa Rate`, `Confirmed Booking`, `October Booking`, `November booking`, `December Booking`, ` Finance`, `Expense`, `Data Base Clients`, `Santa database`, `Invidual Booking`, `List of PA`, `Dept`. |

---

### Category 5: Concurrency & Hold Expiration Engines
| # | Test Name | Invariant Tested | Operational Rule |
| :--- | :--- | :--- | :--- |
| 13 | `24-Hour temporary hold release engine runs cleanly without unhandled exceptions` | Verifies `releaseExpiredHolds()` processes expired holds, rolls back transactions on failure, and returns audit payloads. | Returns `{ releasedCount: N, releasedBookingNumbers: [...] }`. |
| 14 | `Talent concurrency checker identifies duplicate assignment on the same calendar day` | Verifies `checkTalentConflict()` accurately cross-checks talent calendar dates to prevent double-booking. | Returns `hasConflict: boolean`. |

---

## 3. Running the Test Suite

Execute from the repository root:
```bash
npm run test
```

Expected output:
```text
=================================================
BRILLO EVENTS SANTA OPERATIONS HUB - ACCEPTANCE TEST SUITE
=================================================

[PASS] 50% deposit calculation handles centavo rounding consistently
[PASS] Provincial target calculation yields ₱23,400 from ₱18,000 (+30%)
[PASS] Holiday estimate shows ₱23k–₱30k range and routes to staff quote
[PASS] Gross profit is calculated from direct costs and not mislabeled as net profit
[PASS] Non-staff user cannot confirm booking as SECURED
[PASS] Signed agreement without verified payment remains UNSECURED
[PASS] Verified payment without signed agreement remains UNSECURED
[PASS] Staff can confirm booking as SECURED when BOTH signed agreement and verified payment exist
[PASS] Sales role cannot execute payouts or view sensitive talent data
[PASS] Finance role can verify payments, create paluwal, and record payouts
[PASS] Admin role possesses all operational, financial, and configuration permissions
[PASS] All 12 sheets are detected with correct dimensions from source tracker
[PASS] 24-Hour temporary hold release engine runs cleanly without unhandled exceptions
[PASS] Talent concurrency checker identifies duplicate assignment on the same calendar day

=================================================
TEST RESULTS: 14/14 TESTS PASSED (100% SUCCESS)
=================================================
```
