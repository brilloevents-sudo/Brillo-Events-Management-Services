# Architecture & Technical Design

**Project:** Brillo Events Santa Operations Hub  
**Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma ORM + SQLite / PostgreSQL  

---

## 1. High-Level Architectural Model

The application enforces a strict dual-surface architectural pattern:

```
+-----------------------------------------------------------------------------------+
|                           BRILLO EVENTS SANTA HUB                                 |
+-----------------------------------------+-----------------------------------------+
|           PUBLIC FUNNEL                 |              PRIVATE CRM                |
|           (/, /corporate, etc.)         |           (/admin/*)                    |
+-----------------------------------------+-----------------------------------------+
| - Corporate & Private intake forms      | - Master deployment calendar            |
| - Starting rate guidance (₱18k MM)      | - Individual Talent Bookings history    |
| - Real-beard Santa public roster        | - 12-sheet Excel Import Center          |
| - Public date availability checker      | - Paluwal (Talent Advance) ledger       |
| - Secure token status portal            | - Verification gates for payments       |
| - ZERO internal fee / notes leakage     | - Shared mailbox & conversation threads |
+-----------------------------------------+-----------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                           DOMAIN SERVICE LAYER                                    |
|   - Concurrency & Hold Watcher (24h)     - Costing & Quotation Engine             |
|   - 22-State Booking Machine             - Role-Based Access Control (RBAC)       |
|   - Email Provider Adapter Pattern       - Source Conflict Reconciliation         |
+-----------------------------------------------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                           PRISMA ORM & PERSISTENCE                                |
|   - Decimal-safe monetary columns (centavos precision)                            |
|   - Immutable Audit Logs & Data Conflict Queues                                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
brillo-santa-hub/
├── app/
│   ├── (public)/                       # Public-facing funnel routes
│   │   ├── page.tsx                    # Landing page & authentic Santa gallery
│   │   ├── corporate/page.tsx          # B2B Mall & Hotel packages
│   │   ├── private-events/page.tsx     # Residential encounters
│   │   ├── how-booking-works/page.tsx  # 4-step transparent booking journey
│   │   ├── availability/page.tsx       # Date checker
│   │   ├── request-quote/page.tsx      # Multi-step intake form
│   │   └── request-status/[token]/     # Secure client tracking
│   ├── admin/                          # Staff Operations CRM routes
│   │   ├── page.tsx                    # Executive KPI dashboard & priority queues
│   │   ├── individual-talent-bookings/ # Dedicated Santa history module
│   │   ├── bookings/                   # Kanban & table view
│   │   ├── bookings/[id]/              # Single booking manager & status gates
│   │   ├── calendar/                   # Master deployment calendar grid
│   │   ├── talents/                    # Roster & 28 extracted photos
│   │   ├── talents/[id]/               # Bio editor & Paluwal balance
│   │   ├── quotes/                     # Quotations & line-item costing
│   │   ├── contracts/                  # Contract generator & signed upload
│   │   ├── payments/                   # Payment verification center
│   │   ├── paluwal/                    # Talent Advance ledger
│   │   ├── expenses/                   # Expense tracker
│   │   ├── inbox/                      # Shared mailbox
│   │   ├── import/                     # 12-sheet Excel Import Center
│   │   ├── conflicts/                  # Conflict reconciliation register
│   │   └── settings/                   # Policy controls & audit logs
│   ├── api/                            # REST API backend endpoints
│   ├── globals.css                     # Dark obsidian theme & accessibility
│   └── layout.tsx                      # Root layout
├── components/                         # Modular UI components
│   ├── admin-nav.tsx                   # CRM sidebar navigation
│   ├── public-nav.tsx                  # Public navigation header
│   └── quick-actions-drawer.tsx        # Universal quick action center
├── lib/                                # Domain logic & services
│   ├── audit.ts                        # Audit logging service
│   ├── booking-state.ts                # 22-state machine
│   ├── concurrency.ts                  # Conflict check & 24h hold release
│   ├── contracts.ts                    # Framework templates & HTML generator
│   ├── costing.ts                      # Decimal-safe money & margins
│   ├── email-service.ts                # Email adapter & outbox
│   ├── importer.ts                     # 12-sheet Excel importer
│   ├── prisma.ts                       # Singleton client
│   └── rbac.ts                         # Role permissions matrix
├── prisma/
│   ├── schema.prisma                   # Full relational schema
│   └── seed.js                         # Canonical seed data
├── public/                             # Public static assets
│   ├── talents/                        # 28 extracted Santa portraits
│   ├── brand/                          # Brillo logo & signatures
│   └── proofs/                         # Verified payment proofs
└── tests/
    └── run-all-tests.ts                # Acceptance test suite
```
