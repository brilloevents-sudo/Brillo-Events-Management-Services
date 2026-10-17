# Brillo Events Santa Operations Hub 🎅✨

> **Production Santa Operations Hub & Talent Dispatch System**  
> Built for [Brillo Events](https://brilloevents.com) to power corporate mall tours, private appearances, and holiday activations across Metro Manila and Provincial locations.

---

## 🌟 Overview

The **Brillo Events Santa Operations Hub** is an integrated web application combining two unified experiences backed by a single high-integrity database:

1. **Public Booking Funnel** (`/(public)/*`): Clean, branded client portal for corporate event planners, mall chains, agencies, and private families to check availability, calculate transparent pricing, view approved talent portfolios, submit quote requests, and track real-time booking status with secure tokens (`/request-status/[token]`).
2. **Private Operations CRM** (`/admin/*`): Enterprise command center for Brillo Events staff to manage 96+ live bookings, dispatch real-beard Santas and Production Assistants, execute e-contracts, verify downpayments, manage talent Paluwal advances, audit operational disbursements, and reconcile 12-sheet Excel master trackers with zero silent normalization.

---

## 🚀 Key Features

### 🏛️ Public Experience
- **Transparent Pricing Calculator:**
  - **Metro Manila Standard:** ₱18,000 / 4-hour performance block (standard 50% deposit: ₱9,000).
  - **Provincial Destinations:** +30% travel surcharge = ₱23,400 (Clark, Tagaytay, Cavite, Laguna, Rizal).
  - **Christmas Eve & Day Peak (Dec 24/25):** Dynamic holiday guidance (₱23,000 – ₱30,000) routed directly to staff for dedicated custom quoting.
- **Real Beard Talent Portfolio:** Features authentic, vetted Santa performers extracted from historical casting archives.
- **Secure Token Lookup:** Clients can track booking milestones, view e-signed contracts, and upload bank transfer slips at `/request-status/[token]`.
- **Pre-Launch Verification:** Public contact coordinates (`0927 887 2343` / `brilloevents@gmail.com`) are flagged for confirmation before public marketing deployment.

### 🛡️ Private Operations CRM
- **Executive Operations Dashboard:** Live revenue, active bookings, dispatch counts, conflict alerts, and hold timers.
- **Interactive Deployment Calendar:** Daily, weekly, and monthly views with Santa and PA assignment badges.
- **Individual Talent Bookings:** Dedicated management interface for direct solo appearances.
- **Costing & Contract Generation:** Decimal-safe financial calculator with Gross Margin metrics and one-click e-signature agreements.
- **Payment & Paluwal Ledger:** Strict distinction between unverified slip uploads and verified payments; talent advance disbursements tracked with auto-settlement.
- **12-Sheet Excel Ingestion Engine:** Parses `SANTA OPERATION TRACKER- 2026.xlsx` into normalized models with complete coordinate tracking.
- **Data Conflict Resolution Inbox:** Queues historical anomalies (e.g., date typos like `20206`, unknown performer names, informal debt notes) for administrative review.
- **Universal Quick Actions Drawer:** Instant modal access from any admin screen to 24 operational workflows.

---

## 🔒 Core Invariants & Security Principles

### 1. The Strict Dual Gate
A booking **cannot** be marked as `SECURED` until two non-negotiable requirements are satisfied:
1. **Executed Service Contract:** Signed by client and authorized representative.
2. **Verified Deposit:** Confirmed in company bank records by a Finance officer (an uploaded client slip is **not** verification).
3. **Staff Confirmation:** Only authorized staff (`ADMIN` or `OPS`) may confirm secured status.

### 2. Zero Silent Normalization
Historical executed contracts take precedence over modern rate cards. Ingestion pipelines never discard or alter raw source text silently; any ambiguity or typo is preserved verbatim and routed to the `DataConflict` queue.

### 3. Role-Based Access Control (RBAC)
Strict separation of operational roles:
- **SALES:** Quotes, client review, hold placement.
- **OPS:** Rostering, Santa/PA assignment, calendar scheduling, logistics, dispatch.
- **FINANCE:** Payment verification, Paluwal creation, talent payout recording, expense management.
- **ADMIN:** Conflict resolution, contract templates, system settings, global overrides.

### 4. 24-Hour Temporary Hold Expiration
Calendar holds automatically lapse after 24 hours if no deposit confirmation is logged. Triggered automatically via `/api/cron/release-holds`.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14.2 (App Router, Server Actions, Dynamic API Routes)
- **Language:** TypeScript 5.6 (Strict Mode, 100% Type-Safe)
- **Styling:** Tailwind CSS + Lucide Icons + Framer Motion
- **ORM & Database:** Prisma ORM 5.21 with SQLite (`dev.db`, easily switchable to PostgreSQL)
- **Data Processing:** SheetJS (`xlsx`) for 12-sheet Excel ingestion, `adm-zip` for portrait extraction
- **Testing:** Custom zero-dependency TypeScript test runner (`npm run test`)

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v20.18 LTS)
- npm 10+

### 2. Installation
```bash
# Clone and enter directory
cd brillo-santa-hub

# Install dependencies
npm install
```

### 3. Database Initialization
```bash
# Push schema to SQLite database
npm run db:push

# Seed admin users and talent roster
npm run db:seed
```

### 4. Import Historical Operations Data
```bash
# Imports all 12 sheets from SANTA OPERATION TRACKER- 2026.xlsx
npx tsx scripts/run_import.ts
```

### 5. Run Acceptance Tests
```bash
npm run test
```
*Expected: 14/14 tests passing with 100% success.*

### 6. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public portal or [http://localhost:3000/admin](http://localhost:3000/admin) for the operations hub.

---

## 📚 Documentation Directory

Explore the complete architecture and operational guides in `/docs`:

- [**System Architecture & Data Flow**](docs/architecture.md) — Component diagrams, directory structure, and entity-relationship models.
- [**Role-Based Access Control (RBAC) Matrix**](docs/permissions-matrix.md) — Permission breakdown by user role.
- [**12-Sheet Excel Import Specification**](docs/import-mapping.md) — Column-level mapping, transformation rules, and anomaly handling.
- [**22-State Booking Lifecycle Machine**](docs/booking-state-machine.md) — 5 operational stages, state transitions, and dual-gate rules.
- [**Production Deployment & PostgreSQL Migration**](docs/deployment.md) — Guide for Vercel, Supabase/Neon, and cron setup.
- [**Acceptance Test Suite & Invariants**](docs/acceptance-tests.md) — Detailed test cases and invariant guarantees.
- [**Source Data Reconciliation Report**](DATA_RECONCILIATION.md) — Talent profile audit, debt notes analysis, and source findings.

---

## 👥 Seed Accounts (Development & Testing)

| Role | Email | Password | Primary Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@brilloevents.com` | `brillo2026!` | Full administrative control |
| **OPS** | `ops@brilloevents.com` | `brillo2026!` | Roster assignment & logistics |
| **FINANCE** | `finance@brilloevents.com` | `brillo2026!` | Payments, Paluwal & payouts |
| **SALES** | `sales@brilloevents.com` | `brillo2026!` | Inquiries & quotes |
| **PA** | `pa@brilloevents.com` | `brillo2026!` | On-site handler coordination |

---

## 📄 License
Internal proprietary software for **Brillo Events Philippines**. All rights reserved.
