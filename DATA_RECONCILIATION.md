# DATA_RECONCILIATION.md
**Brillo Events Santa Operations Hub — Source Data Reconciliation & Conflict Register**
*Generated: October 17, 2026 | Authority: Source Tracker 2026, Playbook, Real Beard Archives, Framework & SM Agreements*

---

## 1. Executive Summary & Core Rules
This register captures every discrepancy, ambiguous value, identity mismatch, and data quality issue identified across all source files. In accordance with the system charter:
- **No silent normalization:** Conflicting names and rates are never automatically merged or overwritten.
- **Precedence of executed contracts:** Signed agreements and actual historical booking terms override generic target offer rules.
- **Quotation-first public pricing:** Public figures are starting estimates only; binding quotes require staff review.
- **Auditability:** Every imported record retains its source workbook/document, worksheet name, cell coordinates, raw value, import batch ID, and review status.

---

## 2. Workbook Worksheet Inventory & Dimension Analysis
Source file: `SANTA OPERATION TRACKER- 2026.xlsx` (12 worksheets)

| Worksheet Name in Source | Declared Range | Total Raw Rows | Non-Empty Rows | Observed Structure & Operational Purpose |
|---|---|---:|---:|---|
| `Santa Rate` | `A1:L17` | 17 | 15 | Rate card for real beard Santas, internal TF, client target rates, provincial/holiday guidance, notes |
| `Confirmed Booking` | `A1:W1032` | 1032 | 25 | Historical multi-event contracts (SM Pasig, Megamall, Shaw, Sucat, Ayala Photoshoot, etc.). 1,007 rows are blank/formatting-only. |
| `October Booking` | `A1:Y64` | 64 | 55 | Day-by-day calendar bookings for October 2026 with agency, mall, talent, DP amounts, collectibles, TF, remaining balance, profit, contracts. |
| `November booking` | `A1:W37` | 37 | 35 | November 2026 schedule with date-based entries and mall assignments. |
| `December Booking` | `A1:W73` | 73 | 73 | High-density December 2026 bookings (up to Dec 25 Christmas rush, Dec 31). |
| ` Finance` *(leading space preserved)* | `A1:E19` | 19 | 15 | Cash inflows, depositor names, informal statuses (`Gone`, `On hand`), food/BIR deductions, balance summaries. |
| `Expense` | `A1:E48` | 48 | 37 | September and October 2026 operational expenses, talent advances (`Paluwal`), loan repayments (`Leona`), utility bills. |
| `Data Base Clients` | `A1:D1` | 1 | 1 | Header row only (`Company Name`, `Name`, `Position`, `Contact No.`). No client rows; client records must be derived cautiously from booking sheets. |
| `Santa database` | `A1:G1` | 1 | 1 | Header row only (`Full Name`, `Nationality`, `Age`, `Heights`, `Weights`, `Contact No.`, `Address`). No data rows. |
| `Invidual Booking` *(original spelling preserved)* | `A1:E13` | 13 | 2 | Header row + Row 2 containing `Bob` with blank date/fee/status/notes. Must enter review queue. |
| `List of PA` | `A1:C1` | 1 | 1 | Header row only (`Name`, `Contact No.`, `Address`). No PA records populated. PAs must not be fabricated. |
| `Dept` | `A1:A5` | 5 | 5 | Freeform unverified debt notes (`BOB 60K`, `LIAM ?`, `PETER 11K`, `VIRGIL 8K`, `VIC 7K`, `BENITO. 7,400`, `MORTEZA 10K`, `LEONA--- 34k`, `VENARAO DRAGON 126K ?`, `Santa Total: 137,000`, `263000`). |

---

## 3. Mandatory Conflict Register

### 3.1 Talent Identity & Spelling Mismatches
| Rate Sheet Name (`Santa Rate`) | DOCX Document Name (`Real beard`) | Booking Sheet References | Conflict Details & System Resolution |
|---|---|---|---|
| `BOB HALMITON` | `Bob.docx` | `Bob`, `Santa Bob`, `Santa Rob`, `BOB -4K ADVANCE` | Kept as separate candidate aliases linked to Canonical Talent ID `TAL-BOB`. Display name requires admin confirmation. |
| `CEDRICK` | `Cedric.docx` | `Cedric`, `SANTA CEDRIC` | Kept as candidate aliases under Canonical Talent ID `TAL-CEDRIC`. |
| `GIULIO` | `Guilio.docx` | `Santa Guillo`, `Guilio`, `Giulio` | Kept as candidate aliases under Canonical Talent ID `TAL-GIULIO`. Note typo `Santa Guillo` preserved in metadata. |
| `EDWIN ` *(trailing space)* | `Edwin.docx` | `EDWIN`, `EDWIN `, `Edwin` | Trailing space preserved in raw metadata; canonical alias normalized for search only with audit trace. |
| `PETER ` *(trailing space)* | *(No docx file found)* | `SANTA PETER`, `Peter`, `Peter ` | Peter appears in rate card and multiple bookings (SM Sucat, SMOA, SM Aura) but has NO profile docx. Created as `Draft / Pending Verification`. |
| `RANDY` | `Randy.docx` | `Santa Randy`, `Randy` | Canonical `TAL-RANDY`. Special rate note: `Marquee - 13,000, SM mega 14,000`. |
| `VIC` | `Vic.docx` | `VIC`, `Vic` | Canonical `TAL-VIC`. |
| `LIAM` | `Liam.docx` | `LIAM`, `Liam`, `Liam/ Alpha Bazaar` | Canonical `TAL-LIAM`. |
| `PERRY` | `Perry.docx` | `PERRY`, `Perry` | Canonical `TAL-PERRY`. |
| `ROY` | `Roy.docx` | `ROY`, `Roy` | Canonical `TAL-ROY`. |
| `BENITO` *(Not in rate sheet)* | `Benito.docx` | `Benito`, `Grae - Benito` | Present in DOCX archive and Dec 19 / Dec 25 bookings. Not listed in `Santa Rate`. Rate marked as custom/negotiated. |
| `MICKEYVER` *(Not in rate sheet)* | `Mickeyver.docx` | `SANTA MICKEYVER`, `MICKEYVER` | Present in DOCX archive and SM Shaw bookings (Dec 12, 19, 20). Internal fee ₱12,000–₱36,000 package. |
| `RICHARD` *(Not in rate sheet)* | `Richard.docx` | `Richard` | Present in DOCX archive and Dec 19 (Light), Dec 25 (SM San Lazaro). Custom fee. |
| `TERRY` *(Not in rate sheet)* | `Terry.docx` | `Terry` | Present in DOCX archive and multiple SM bookings (Clark, Rosales, Pampanga, Southmall). Fee ₱12,000–₱13,000. |
| `Fred` *(In Oct booking only)* | *(No docx file)* | `Fred` (SM Cabanatuan Megacenter) | Single appearance in October sheet. Seeded as Unverified External Talent. |
| `VIRGIL`, `MORTEZA`, `VENARAO DRAGON` | *(No docx file)* | `Dept` sheet notes only | Unverified source entities. Recorded in Debt Reconciliation queue only. |

### 3.2 Pricing & Rate Sheet Ambiguities
1. **Row 14 `REGULAR SANTA`:**
   - Raw cell: `REGULAR SANTA`, Note: `"Regular days 13,000 - Holiday Rate 16,900"`, Holiday Rate column: `16000`.
   - Discrepancy: Note says 16,900 while column contains 16,000.
   - Resolution: Stored as raw source note; flagged in conflict queue; not applied as automated calculation rule.
2. **Row 15 `8000` & Row 16 `WITHOUT - 6,000`:**
   - Standalone cell values under column B without talent name or clear label.
   - Resolution: Preserved with coordinates `Santa Rate!B15` and `Santa Rate!B16` in review queue without automated business meaning.
3. **Provincial Target Multiplier vs Actual Quotes:**
   - Playbook target: Metro Manila ₱18,000 + 30% = ₱23,400.
   - Historical signed contracts show varying regional rates:
     - SM CDO Downtown: ₱24,000.00
     - SM Tuguegarao: ₱25,000.00
     - SM Rosales: ₱22,000.00
     - SM Marilao: ₱19,000.00
     - Clark Cityfront: ₱15,000.00
     - SM Davao / Lanang: ₱20,000.00
   - Resolution: New public funnel displays ₱23,400 as starting guidance only; historical agreements retain exact executed figures.

### 3.3 Historical Booking Anomalies & Date Typos
1. **Typo `November 29, 20206 (Sunday)`:**
   - Found in `Confirmed Booking!C3` and `Confirmed Booking!C9`.
   - Resolution: Flagged as date typo for year 2026; original raw string retained in metadata.
2. **Typo `2028-09-27`:**
   - Found in `Confirmed Booking!H20` (`One Mall Ayala Bob Voice Over`).
   - Resolution: Preserved raw value; flagged for review as intended September 27, 2026.
3. **Date Typo `2029-10-06` in Expense Sheet:**
   - Found in `Expense!B38` (Row 38: `-3000 allowance`).
   - Resolution: Flagged for review as intended October 6, 2026.
4. **Informal Statuses in Finance Sheet:**
   - `Gone` (Entcars ₱27,000, SAGA ₱9,000).
   - `On hand` (Ever Gotesco ₱11,300 with remaining ₱8,800).
   - Status `45` in Row 15.
   - Resolution: Stored as raw source status; routed to Finance verification queue for official reconciliation.

### 3.4 Unverified Debt & Balance Notes (`Dept` Sheet)
- The entire `Dept` worksheet contains informal, unverified ledger claims:
  - `BOB 60K`
  - `LIAM ?`
  - `PETER 11K`
  - `VIRGIL 8K`
  - `VIC 7K`
  - `BENITO. 7,400`
  - `MORTEZA 10K`
  - `LEONA--- 34k`
  - `VENARAO DRAGON 126K ?`
  - `Santa Total: 137,000`
  - `263000`
- Resolution: Treated strictly as unverified historical notes. Never recorded as actual ledger debits or deducted from payouts without explicit staff confirmation and supporting proof.

---

## 4. Contract Inventory & Operational Precedence (28 SM Files)
All 28 files from `SM SUPER MALLS Booking Agreement s` are cataloged with format, mall branch, dates, and amounts:
- Multiple revisions exist (e.g. `SM Rosales final` vs `Revised SM Rosales Booking Agreement`, `SM Novaliches Oct 23` vs `Dec 25`).
- Resolution: Both versions preserved; status set to `Pending Staff Confirmation of Operative Version`; neither is silently deleted.

---

## 5. Public Safety & Data Privacy
- **Public display permission:** Every talent profile and photo defaults to `approved_for_public_display = false`. Only approved assets appear in public client funnels.
- **Contact verification:** Reference phone `0927 887 2343` and email `brilloevents@gmail.com` are marked `Verify Before Launch` in system settings.
