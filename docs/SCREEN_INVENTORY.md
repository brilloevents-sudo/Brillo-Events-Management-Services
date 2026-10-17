# Brillo Events Santa Operations Hub — Screen Inventory & Route Matrix

**Version:** 2.0.0  
**Authority:** *Brillo Events Santa Operations Hub Full UI/UX Codex Master Prompt*

---

## 1. Complete Screen Inventory

### 1.1 Public Booking Funnel (`/(public)/*`)
| Route | Screen Name | Status | Key Capabilities & Security Controls |
| :--- | :--- | :--- | :--- |
| `/` | **Public Landing Page** | ✅ Complete | Hero value proposition, authentic Santa showcase, service pillars, request quote CTA, pre-launch contact disclaimers. |
| `/corporate` | **Corporate Mall & B2B Booking** | ✅ Complete | High-density mall tour activations, SM Supermalls/Ayala case frameworks, package specs. |
| `/private-events` | **Private Event Appearances** | ✅ Complete | Home visits, family celebrations, intimate estate gatherings, etiquette standards. |
| `/how-booking-works` | **How Booking Works** | ✅ Complete | 5-stage transparent workflow explanation, Dual Gate requirement breakdown. |
| `/availability` | **Date & Availability Checker** | ✅ Complete | Non-confidential calendar slot checker; highlights peak dates (Dec 24/25) as requiring custom quotation. |
| `/request-quote` | **Interactive Quote Request Wizard** | ✅ Complete | Step-by-step form with live pricing estimates (Metro Manila ₱18k, Provincial +30% ₱23.4k), talent preference selection, reference ID generation. |
| `/request-status/[token]` | **Secure Token Status Lookup** | ✅ Complete | Client self-service tracker: milestone timeline, e-signed contract preview, deposit receipt upload. No sensitive internal talent rates exposed. |
| `/privacy` | **Privacy Policy** | ✅ Complete | Philippine Data Privacy Act compliance disclosures marked for final owner review. |
| `/terms` | **Terms & Conditions** | ✅ Complete | Booking cancellation, payment terms, and talent safety standards marked for final legal review. |

---

### 1.2 Private Staff Operations Workspace (`/admin/*`)
| Route | Screen Name | Status | Key Capabilities & RBAC Access |
| :--- | :--- | :--- | :--- |
| `/admin` | **Operations Overview** | ✅ Complete | Real metric cards, Priority Attention Queue, recent activity feed, quick-action triggers. |
| `/admin/leads` | **Leads & Inquiries Inbox** | 🔄 Enhancing | Triage incoming requests from web and email, search, status filters, convert to booking. |
| `/admin/pipeline` | **CRM Pipeline (Kanban)** | 🔄 Enhancing | Drag-and-drop progression across 5 operational stages with server-side validation. |
| `/admin/calendar` | **Deployment Calendar** | ✅ Complete | Month, week, day, and agenda views; talent and PA assignment badges; slide-over booking drawer. |
| `/admin/bookings` | **Master Bookings Manager** | ✅ Complete | 96 imported historical bookings, multi-column filters, status chips, quick action menus. |
| `/admin/bookings/[id]` | **Booking Workspace** | ✅ Complete | Detailed event overview, talent & PA dispatch, readiness checklist, contract & payment verification. |
| `/admin/individual-talent-bookings` | **Individual Talent Bookings** | ✅ Complete | Dedicated solo Santa management, rate checks, historical assignment cross-referencing. |
| `/admin/talents` | **Santa Talent Roster** | ✅ Complete | Performer directory cards with extracted real portraits, costume measurements, beard authenticity. |
| `/admin/talents/[id]` | **Talent Profile & Ops Workspace**| ✅ Complete | 8-tab operational view: Profile, Photo Gallery, Booking History, Availability, Rates, Docs, Payouts, Audit. |
| `/admin/pa-crew` | **PA & Santa Handlers Roster** | 🔄 Enhancing | Production Assistant directory, gig assignments, event briefing sheets. |
| `/admin/clients` | **Clients & Agency Directory** | 🔄 Enhancing | Corporate accounts (SM, Ayala, Robinsons, agencies), billing history, corporate liaisons. |
| `/admin/quotes` | **Quotes & Costing Engine** | ✅ Complete | Decimal-safe margin calculator, client-facing PDF generator, internal direct cost breakdown. |
| `/admin/contracts` | **Contracts & E-Signatures** | ✅ Complete | Agreement library with With DP vs No DP frameworks, e-signature tracking, signed PDF upload fallback. |
| `/admin/payments` | **Payments & Receivables** | ✅ Complete | Unverified slip review queue, verified bank ledger, balance tracking, downpayment confirmations. |
| `/admin/expenses` | **Operational Disbursements** | ✅ Complete | 31 imported expense records, wardrobe maintenance, logistics, receipts. |
| `/admin/paluwal` | **Talent Advances / Paluwal** | ✅ Complete | Append-only cash advance ledger, automatic gig payout deduction, audit trail. |
| `/admin/deployment` | **Event Ingress & Deployment** | 🔄 Enhancing | Day-of call times, ingress permits, dressing room readiness, talent transit status. |
| `/admin/inbox` | **Shared Mailbox Center** | ✅ Complete | Customer email conversation threads, honest disconnected provider state, template previews. |
| `/admin/import` | **12-Sheet Excel Import Wizard**| ✅ Complete | Full ingestion of `SANTA OPERATION TRACKER- 2026.xlsx`, sheet preview, dry run, commit report. |
| `/admin/conflicts` | **Source Conflict Queue** | ✅ Complete | 13 queued discrepancies (date typos `20206`, unknown names `Fred`, `Rey`, informal `Dept` debt notes). |
| `/admin/reports` | **Executive Analytics** | 🔄 Enhancing | Monthly gross margins, regional deployment volume, talent fee reconciliation. |
| `/admin/audit-log` | **Immutable Audit Trail** | 🔄 Enhancing | Historical change log with actor, timestamp, entity ID, and before/after values. |
| `/admin/users` | **Users & Staff RBAC** | 🔄 Enhancing | Role definitions (`ADMIN`, `SALES`, `OPS`, `FINANCE`, `PA`), permission assignments. |
| `/admin/settings` | **System Settings & Policies** | ✅ Complete | Default 50% deposit policy, 24-hr hold duration, verified contact phone & email disclosures. |

---

## 2. Universal Navigation Architecture (22-Item Order)

The staff workspace sidebar adheres to the 22-item workflow-grouped order:
1. **Overview** (`/admin`)
2. **Leads & Inquiries** (`/admin/leads`)
3. **CRM Pipeline** (`/admin/pipeline`)
4. **Booking Calendar** (`/admin/calendar`)
5. **Bookings** (`/admin/bookings`)
6. **Individual Talent Bookings** (`/admin/individual-talent-bookings`)
7. **Santa Talent** (`/admin/talents`)
8. **PA & Crew** (`/admin/pa-crew`)
9. **Clients & Agencies** (`/admin/clients`)
10. **Quotes & Costing** (`/admin/quotes`)
11. **Contracts & E-signatures** (`/admin/contracts`)
12. **Payments & Receivables** (`/admin/payments`)
13. **Expenses** (`/admin/expenses`)
14. **Talent Advances / Paluwal** (`/admin/paluwal`)
15. **Event Deployment** (`/admin/deployment`)
16. **Email Center** (`/admin/inbox`)
17. **Excel Import Center** (`/admin/import`)
18. **Source Conflicts** (`/admin/conflicts`)
19. **Reports** (`/admin/reports`)
20. **Audit Log** (`/admin/audit-log`)
21. **Users & Roles** (`/admin/users`)
22. **Settings** (`/admin/settings`)
