# Brillo Events Santa Operations Hub — Comprehensive UI/UX Audit

**Date:** October 17, 2026  
**Auditor:** Principal Product Designer & Senior UX Architect  
**Authority:** *Brillo Events Santa Operations Hub FULL UI/UX Codex Master Prompt*  
**Application Root:** `C:\Users\ACER\Documents\brillo-santa-hub`

---

## 1. Executive Summary & Audit Scope

The **Brillo Events Santa Operations Hub** was evaluated against the 27 operational sections of the Master Prompt. The platform bridges two high-stakes experiences:
1. **Public Booking Funnel** (`/(public)/*`): A customer-facing, high-trust portal for corporate event directors (SM Supermalls, Robinsons, Ayala) and private families.
2. **Private Staff Operations Workspace** (`/admin/*`): An enterprise operations command center for sales, operations, finance, and talent handlers.

### Overall Readiness Rating
- **Core Architecture & Data Layer:** **95% Complete** (Prisma ORM, SQLite `dev.db`, 12-sheet Excel parser, 14 talent profiles, 96 bookings, 14 passing automated tests).
- **Functional Business Logic:** **92% Complete** (Dual-gate security, 24-hr hold expiration cron, decimal-safe costing, Paluwal ledger).
- **UI/UX Polish & Visual System:** **85% Complete** (Requires refinement to match the warm off-white `#F6F3EC` workspace canvas, dark charcoal `#171A18` sidebar, serif headings, and full 22-route navigation shell).

---

## 2. Detailed Module-by-Module Assessment

### 2.1 Global Application Shell & Navigation
- **Current State:** Dark sidebar with 12 navigation items and a floating Quick Actions drawer.
- **Audit Finding:** The master prompt mandates a 22-item workflow-grouped navigation order:
  1. Overview (`/admin`)
  2. Leads & Inquiries (`/admin/leads`)
  3. CRM Pipeline (`/admin/pipeline`)
  4. Booking Calendar (`/admin/calendar`)
  5. Bookings (`/admin/bookings`)
  6. Individual Talent Bookings (`/admin/individual-talent-bookings`)
  7. Santa Talent (`/admin/talents`)
  8. PA & Crew (`/admin/pa-crew`)
  9. Clients & Agencies (`/admin/clients`)
  10. Quotes & Costing (`/admin/quotes`)
  11. Contracts & E-signatures (`/admin/contracts`)
  12. Payments & Receivables (`/admin/payments`)
  13. Expenses (`/admin/expenses`)
  14. Talent Advances / Paluwal (`/admin/paluwal`)
  15. Event Deployment (`/admin/deployment`)
  16. Email Center (`/admin/inbox`)
  17. Excel Import Center (`/admin/import`)
  18. Source Conflicts (`/admin/conflicts`)
  19. Reports (`/admin/reports`)
  20. Audit Log (`/admin/audit-log`)
  21. Users & Roles (`/admin/users`)
  22. Settings (`/admin/settings`)
- **Required Action:** Elevate `admin-nav.tsx` to support the full 22-item structure with collapsible icon-only mode, role-aware visibility, and breadcrumbs in the top bar.

### 2.2 Visual Theme & Brand Palette
- **Current State:** Obsidian dark theme throughout all admin pages.
- **Audit Finding:** The Master Prompt explicitly directs:
  > *"The existing visual direction includes a dark charcoal sidebar, warm off-white workspace, serif display headings, small uppercase section labels, restrained gold accents, and deep crimson primary actions."*
  - Charcoal: `#171A18`
  - Dark panel: `#202421`
  - Warm canvas: `#F6F3EC`
  - Surface: `#FFFEFB`
  - Muted gold: `#B99A5B`
  - Deep crimson: `#A92F3A`
  - Body text: `#252824`
  - Muted text: `#6B706C`
  - Border: `#E2DED4`
- **Required Action:** Update `tailwind.config.ts` and `app/admin/layout.tsx` to establish this editorial contrast (dark charcoal navigation sidebar + warm ivory workspace canvas).

### 2.3 Overview Dashboard & Needs Attention Queue
- **Current State:** Displays live metric counters, quick shortcuts, recent bookings table, and conflict alert banner.
- **Audit Finding:** Needs an explicit **Priority Attention Queue** grouping:
  - New inquiries awaiting triage
  - Temporary holds nearing 24-hr expiration
  - Contracts awaiting client e-signature
  - Payments awaiting finance verification
  - Secured bookings missing talent/PA assignment
  - Unresolved Excel import conflicts
- **Required Action:** Enrich `/admin/page.tsx` with a dedicated Attention Queue component linking directly to actionable rows.

### 2.4 CRM & Lead Pipeline
- **Current State:** Leads are tracked within `/admin/bookings` under state filters.
- **Audit Finding:** A dedicated `/admin/leads` and `/admin/pipeline` (Kanban view) provides sales staff with drag-and-drop state progression backed by server-side transition checks.

### 2.5 Booking Calendar UX
- **Current State:** Monthly grid calendar with Santa assignment indicators.
- **Audit Finding:** Must provide Month, Week, Day, and Agenda/List views, with an accessible slide-over event detail drawer showing client info, talent/PA badges, and readiness checklist.

### 2.6 Santa Talent Roster & Photo Gallery
- **Current State:** Cards and detail page displaying extracted real photos (28 portraits across 14 talents).
- **Audit Finding:** Talent detail page must contain all 8 specified tabs:
  1. Profile
  2. Photo Gallery (upload, replace, set primary, approve for public display)
  3. Booking History
  4. Availability
  5. Rates & Costing (restricted to Finance/Admin)
  6. Documents
  7. Payments / Payouts (restricted)
  8. Notes & Audit Trail

### 2.7 PA & Crew Management
- **Current State:** Production Assistant assignment field on bookings.
- **Audit Finding:** Create `/admin/pa-crew` providing dedicated PA directory, conflict checks, and event briefing export.

### 2.8 Quotes, Costing & Contracts
- **Current State:** Costing engine computes 50% deposit, provincial surcharge (+30%), holiday rate, and gross margin.
- **Audit Finding:** Contract templates must strictly distinguish between **With DP** (standard commercial) and **No DP** (government/SM billing terms) based on `Framework - No DP.docx` and `Booking agreement framework - with DP.docx`.

### 2.9 Finance, Payments, Paluwal & Expenses
- **Current State:** Endpoints and tables for Payments, Paluwal, and Expenses.
- **Audit Finding:** Enforce strict separation between *Reported* payment slips and *Verified* receipts. Paluwal ledger must remain append-only with zero automated deductions from unverified debt notes (`Dept` sheet).

### 2.10 Email Center & Shared Inbox
- **Current State:** Shared mailbox UI with thread listing.
- **Audit Finding:** When external IMAP/SMTP provider is not connected, the UI must honestly show *"Provider Not Connected"* with configuration instructions, rather than disguising with mock state.

### 2.11 Public Funnel
- **Current State:** `/`, `/corporate`, `/private-events`, `/how-booking-works`, `/availability`, `/request-quote`, `/request-status/[token]`, `/privacy`, `/terms`.
- **Audit Finding:** High conversion quality, authentic Santa portraits, transparent pricing calculator, and secure token tracking. Public contact details (`0927 887 2343` / `brilloevents@gmail.com`) clearly display *"Verify before launch"*.

---

## 3. Implementation Plan & Priority Action Items

1. **Design System & Tokens:** Add warm canvas `#F6F3EC`, charcoal `#171A18`, surface `#FFFEFB`, crimson `#A92F3A`, and muted gold `#B99A5B` into Tailwind config and CSS variables.
2. **Global Shell Enhancement:** Upgrade `admin-nav.tsx` to the 22-route structure with workflow groupings and responsive drawer.
3. **Admin Layout Contrast:** Render admin workspace canvas in warm ivory with elegant serif display headings and crisp sans-serif data tables.
4. **Talent Profile Tabs:** Expand `/admin/talents/[id]` into the 8-tab operational layout.
5. **Additional Dedicated Workspaces:**
   - `/admin/leads` & `/admin/pipeline` (CRM)
   - `/admin/pa-crew` (PA & Crew management)
   - `/admin/clients` (Clients & Agency directory)
   - `/admin/deployment` (Event readiness & ingress checklists)
   - `/admin/reports` (Executive financial & dispatch analytics)
   - `/admin/audit-log` (System-wide immutable change log)
   - `/admin/users` (RBAC management)
