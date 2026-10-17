# Santa Operations Hub - Production Deployment & Migration Guide

## 1. Hosting Architecture

The **Brillo Events Santa Operations Hub** is designed for deployment on modern serverless or containerized infrastructure:

- **Compute & Routing:** Vercel (Next.js 14 App Router, Server Actions, Dynamic & Static Route Handlers)
- **Database:** Managed PostgreSQL (Supabase, Neon, AWS RDS Aurora Serverless, or Railway)
- **Scheduled Background Tasks:** Vercel Cron (invoking `/api/cron/release-holds`)
- **Asset Storage:** Public assets in `public/talents` (or S3/Cloudinary/Vercel Blob in multi-region setups)

---

## 2. Migrating from SQLite (`dev.db`) to PostgreSQL

The project currently ships with a local SQLite database (`dev.db`) for immediate offline zero-dependency development. To transition to PostgreSQL for production concurrency:

### Step 1: Update Prisma Datasource
In `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 2: Provision Database & Configure Connection String
Set your production connection string with connection pooling enabled (e.g. PgBouncer / Neon pooled URL):
```env
DATABASE_URL="postgres://postgres:[PASSWORD]@[HOST]:[PORT]/[DB]?pgbouncer=true&connection_limit=10"
DIRECT_URL="postgres://postgres:[PASSWORD]@[HOST]:[PORT]/[DB]"
```

### Step 3: Run Database Push / Migrations
```bash
npx prisma db push
# or generate formal migration history:
npx prisma migrate dev --name init_postgres
```

### Step 4: Seed Initial Admin & Talent Roster
```bash
npm run db:seed
npx tsx scripts/run_import.ts
```

---

## 3. Environment Variables Reference

Create a `.env.production` file or set these in your Vercel Project Settings:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Production PostgreSQL connection URL | `postgres://user:pass@ep-xyz.neon.tech/brillo?sslmode=require` |
| `DIRECT_URL` | Non-pooled connection for Prisma migrations | `postgres://user:pass@ep-xyz.neon.tech/brillo?sslmode=require` |
| `NEXTAUTH_SECRET` | Secret key for JWT signing and session security | `openssl rand -base64 32` |
| `CRON_SECRET` | Bearer token for authenticating scheduled cron calls | Secure alphanumeric token |
| `NEXT_PUBLIC_APP_URL`| Canonical domain of the application | `https://santa.brilloevents.com` |
| `NEXT_PUBLIC_CONTACT_PHONE` | Public WhatsApp/Viber booking hotline | `0927 887 2343` *(Verify before launch)* |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public booking inbox | `brilloevents@gmail.com` *(Verify before launch)* |
| `SMTP_HOST` | Transactional email provider host | `smtp.resend.com` / `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `resend` / `apikey` |
| `SMTP_PASS` | SMTP API key | `re_xxxxxxxxxxxx` |

---

## 4. Vercel Cron Configuration (`vercel.json`)

To automatically trigger the 24-hour temporary hold release engine, create `vercel.json` in the root:

```json
{
  "crons": [
    {
      "path": "/api/cron/release-holds",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

*Note: Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically with every cron invocation.*

---

## 5. Pre-Launch Verification Checklist

Before opening the public funnel to corporate clients:
- [ ] **Contact Details Verification:** Confirm that `0927 887 2343` and `brilloevents@gmail.com` are monitored actively by production dispatchers.
- [ ] **Talent Photo Consent:** Verify that all performers marked `approvedForPublicDisplay = true` have granted digital marketing consent. Performers pending verification (e.g. Peter) must remain unlisted publicly until cleared.
- [ ] **Payment Receiving Channels:** Ensure GCash, Maya, and BDO corporate account numbers displayed on `/request-status/[token]` match the designated Brillo Events receiving accounts.
- [ ] **Initial Excel Ingestion:** Run `npx tsx scripts/run_import.ts` against the live master Excel tracker.
- [ ] **Data Conflict Triage:** Navigate to `/admin/conflicts` and resolve any historical date anomalies, spelling mismatches, or debt claims.
