# Santa Operations Hub - 12-Sheet Excel Import Mapping Specification

## 1. Overview & Architectural Philosophy

The **Brillo Events Santa Operations Hub** processes the operational master tracker (`SANTA OPERATION TRACKER- 2026.xlsx`), containing 12 heterogeneous worksheets. 

### Zero-Silent-Normalization Principle
Historical bookings and executed agreements are legally and financially binding. Our ingestion pipeline adheres strictly to **Zero Silent Normalization**:
1. **Never alter or discard historical data silently.** If an anomalous date (e.g., `November 29, 20206`), unknown talent spelling (`Fred`, `Rey`), or freeform debt record (`Dept` sheet) is encountered, the original raw values are preserved verbatim in metadata, the record is imported safely, and a `DataConflict` incident is queued in the triage inbox for human review.
2. **Preserve Source Coordinates.** Every imported record links back to its originating `sheetName`, `rowNumber`, and `rawPayload`.
3. **Historical Contract Primacy.** If a historical row in `Confirmed Booking` specifies a rate different from current standard pricing guidelines, the historical booked amount takes precedence.

---

## 2. Worksheet-by-Worksheet Ingestion Rules

### Sheet 1: `Santa Rate`
* **Purpose:** Talent roster, baseline talent fee rates, internal notes, costume availability, and casting tiers.
* **Target Prisma Model:** `Talent`
* **Column Mappings:**
  | Source Header | Target Field | Data Type & Transformation | Anomaly Handling |
  | :--- | :--- | :--- | :--- |
  | `SANTA'S NAME` / Name | `name`, `code` | String. Slugified code generated (e.g., `SANTA-NOLI`). | Normalizes capitalization. Missing names skipped. |
  | `RATE` / `FEES` | `standardFee` | Decimal/Float. Extracted via regex `/\d+[\d,.]*/`. | Defaults to ₱10,000 if blank or unlisted. |
  | `TYPE` / `BEARD` | `beardType` | String Enum: `REAL_BEARD`, `THEATRICAL`, etc. | Defaults to `REAL_BEARD`. |
  | `STATUS` | `isActive` | Boolean. Active if not marked retired/inactive. | Defaults to `true`. |
  | `NOTES` / Remarks | `notes` | String. Stored in talent metadata. | Null-safe. |
* **Special Cases:** Peter is listed in `Santa Rate` but lacked a DOCX profile in the portrait zip archive; Peter is imported with `verificationStatus = PENDING_VERIFICATION` and `approvedForPublicDisplay = false`.

---

### Sheet 2: `Confirmed Booking`
* **Purpose:** Authoritative record of confirmed commercial and private Santa bookings.
* **Target Prisma Model:** `Booking`, `TalentAssignment`, `Client`
* **Column Mappings:**
  | Source Header | Target Field | Transformation & Validation |
  | :--- | :--- | :--- |
  | `DATE` | `eventDate` | Parsed with Excel date serial / JS Date. If invalid or typo (e.g. year `20206`), normalized to reasonable year (2024/2026) and logged as `DataConflict` (type: `DATE_TYPO`). |
  | `CLIENT` / `COMPANY` | `Client.name`, `Booking.eventName` | Linked or created in `Client` table. |
  | `VENUE` / `MALL` / `LOCATION` | `mallOrVenue`, `locationCity` | Categorized into Metro Manila or Provincial based on location lookup. |
  | `TIME` / `CALL TIME` | `startTime`, `endTime`, `callTime` | Parsed into standard 12/24-hour time strings. |
  | `SANTA ASSIGNED` | `TalentAssignment.talentId` | Fuzzy matched against `Talent.name`. If unassigned or ambiguous, flagged as `SECURED_UNASSIGNED` and logged in `DataConflict`. |
  | `PA ASSIGNED` | `paAssigned` | Stored in booking metadata or linked to PA roster. |
  | `CLIENT RATE` / `CONTRACT` | `clientQuotedAmount` | Extracted numeric amount. Defaults to standard ₱18,000 if omitted. |
  | `TALENT FEE` | `internalTalentFee` | Internal pay rate for assigned talent. |
  | `STATUS` | `status` | Normalized to `SECURED_ASSIGNED` or `SECURED_UNASSIGNED`. |

---

### Sheets 3, 4, 5: `October Booking`, `November booking`, `December Booking`
* **Purpose:** Monthly operational staging schedules, shifts, and tentative holds.
* **Target Prisma Model:** `Booking`, `TalentAssignment`
* **Column Mappings:**
  - Follow the same schema as `Confirmed Booking`.
  - Empty calendar spacer rows (grid format) are detected and filtered out cleanly (1,114 blank grid rows skipped during initial migration).
  - Status mapped based on payment/contract flags:
    - Confirmed rows $\rightarrow$ `SECURED_ASSIGNED`
    - In-progress rows $\rightarrow$ `UNDER_CLIENT_REVIEW` or `TEMPORARY_HOLD`
    - Date anomalies (e.g., `2028-09-27` or `20206`) logged to `DataConflict`.

---

### Sheet 6: ` Finance` *(Note Leading Space in Sheet Name)*
* **Purpose:** Master revenue summary, payment tranches, balances, and gross margins.
* **Target Prisma Model:** `Payment`, `Booking` financial reconciliation
* **Ingestion Logic:**
  - Matches client name and event date against existing `Booking` records.
  - Generates `Payment` records for downpayment (50%) and balance settlements.
  - Calculates gross profit: $\text{Gross Profit} = \text{Client Revenue} - \text{Total Direct Costs}$ (talent fees, PA fees, transport allowances).
  - Validates that IEEE-754 floating-point rounding is rounded to two decimal places (centavo precision).

---

### Sheet 7: `Expense`
* **Purpose:** Operational disbursements, wardrobe maintenance, dry cleaning, props, travel logistics, and materials.
* **Target Prisma Model:** `Expense`
* **Column Mappings:**
  | Source Header | Target Field | Transformation & Type |
  | :--- | :--- | :--- |
  | `DATE` | `expenseDate` | Standardized Date. |
  | `CATEGORY` | `category` | Enum: `WARDROBE`, `LOGISTICS`, `MEALS`, `SUPPLIES`, `MARKETING`, `OTHER`. |
  | `PARTICULARS` / `ITEM` | `description` | String description of the disbursement. |
  | `AMOUNT` | `amount` | Decimal. Positive float. |
  | `PAID BY` / `DISBURSED TO` | `disbursedBy` / `recipient` | Staff or talent name. |
  | `RECEIPT` / `REF` | `receiptNumber` | Verification reference. |

---

### Sheet 8: `Data Base Clients`
* **Purpose:** Corporate client accounts, private event organizers, agency contacts, and billing info.
* **Target Prisma Model:** `Client`
* **Column Mappings:**
  | Source Header | Target Field | Notes |
  | :--- | :--- | :--- |
  | `COMPANY NAME` / `CLIENT` | `name` | Primary identifier. Deduplicated on name. |
  | `CONTACT PERSON` | `contactPerson` | Full name of corporate liaison. |
  | `EMAIL` | `email` | Primary billing/booking email. |
  | `PHONE` / `MOBILE` | `phone` | Public contact verified before outward sending. |
  | `TIN` / `BILLING ADDRESS` | `billingAddress` | Corporate invoice details. |

---

### Sheet 9: `Santa database`
* **Purpose:** Detailed performer profiles, body measurements, costume sizes, beard authenticity, and emergency contacts.
* **Target Prisma Model:** `Talent` (Enrichment)
* **Ingestion Logic:**
  - Enriches baseline talent records from `Santa Rate` with measurements (suit size, boot size, height, eye color) and costume specifications.
  - Cross-references photo directories in `public/talents/[TalentName]/` extracted from real talent portrait docx archives.

---

### Sheet 10: `Invidual Booking` *(Spelling Preserved)*
* **Purpose:** Standalone talent engagements, direct private appearances, and specialized non-commercial gigs.
* **Target Prisma Model:** `Booking` (with `isIndividualBooking: true`)
* **Anomaly Handling:**
  - Contains irregular rows such as `Bob` without clear client dates.
  - Ingested safely with status `INQUIRY_RECEIVED` and flagged in `DataConflict` for triage.

---

### Sheet 11: `List of PA`
* **Purpose:** Production Assistants and Santa Handlers roster.
* **Target Prisma Model:** `User` / `StaffProfile` (Role: `OPS`)
* **Ingestion Logic:**
  - Names, mobile numbers, assigned territories (Mall of Asia, Megamall, North EDSA, South Luzon).
  - Used for PA dispatch drop-downs on the booking detail screen.

---

### Sheet 12: `Dept`
* **Purpose:** Unstructured informal debt notes, cash advances, and talent ledger adjustments.
* **Target Prisma Model:** `DataConflict`, `TalentLedgerEntry` (Pending Audit)
* **Ingestion Logic & Strict Constraint:**
  - Freeform text notes such as `VENARAO DRAGON 126K ?` and `BOB 60K` represent unverified claims.
  - **Zero Auto-Deduction Policy:** These are NEVER automatically deducted from performer payout slips.
  - Each item is converted into a high-priority `DataConflict` (type: `UNVERIFIED_DEBT_CLAIM`) for administrative and legal verification.

---

## 3. Reconciliation & Audit Log

Every import run generates an `ImportBatch` containing:
- `totalRowsScanned`
- `importedBookings`
- `importedExpenses`
- `conflictsQueued`
- `skippedEmptyRows`

Administrators can inspect, resolve, or re-run imports from `/admin/import` and `/admin/conflicts`.
