# LivingHope

A donation, sponsorship, and content platform for LivingHope — a Ghana-based charity
supporting street children's education. Rebuilt from the original WordPress site into a
Next.js + PostgreSQL app with a full admin CMS and real Stripe payment collection.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **PostgreSQL** + **Prisma 7** (driver adapter, `@prisma/adapter-pg`)
- **Auth.js (NextAuth v5)** — credentials + Google OAuth, role-gated `/admin`
- **Stripe Checkout** — one-time and monthly donations/sponsorships, reconciled via webhook
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **Resend** for transactional email (donation receipts)
- Local disk or **Vercel Blob** for uploaded images (child photos, stories, trustees)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start Postgres** (local dev, via Docker — runs on port `5442` to avoid clashing with
   other projects' databases)

   ```bash
   docker compose up -d db
   ```

3. **Copy environment variables**

   ```bash
   cp .env.example .env
   ```

   `.env` already points at the Docker Postgres instance. Fill in the rest as you
   configure each provider (see [Environment variables](#environment-variables) below).

4. **Run migrations and seed sample data**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   This creates an admin account: `admin@livinghope.org` / `ChangeMe123!` — change the
   password (or the user's role) right after logging in.

5. **Run the dev server** (pinned to port `3010`)

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3010](http://localhost:3010) for the public site and
   [http://localhost:3010/admin](http://localhost:3010/admin) for the CMS.

## Environment variables

See `.env.example` for the full list. Notes on the less obvious ones:

- `AUTH_SECRET` — generate with `npx auth secret`.
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — from a Google Cloud OAuth client
  (Web application, authorized redirect URI `http(s)://<host>/api/auth/callback/google`).
  Google sign-in silently fails until these are set.
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from the
  [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) (test mode to start).
- `STRIPE_WEBHOOK_SECRET` — from `stripe listen --forward-to localhost:3010/api/webhooks/stripe`
  in dev, or the endpoint's signing secret in the Stripe Dashboard in production. Donations
  stay `PENDING` and sponsorships never activate without this wired up.
- `RESEND_API_KEY` / `EMAIL_FROM` — optional; without a key, receipt emails are silently
  skipped rather than erroring.
- `STORAGE_DRIVER` — `local` (default, writes to `public/uploads`, fine for a single-server
  deploy) or `vercel-blob` (set `BLOB_READ_WRITE_TOKEN` too) for serverless/multi-instance
  hosting where local disk isn't persistent.

## What's admin-controlled

Everything under `/admin` (role `STAFF` or `ADMIN`) manages live content:

- **Children** — sponsorship profiles, photos, status
- **Stories** — homepage testimonial carousel
- **Impact Stats**, **History**, **Trustees** — About page content
- **Site Settings** — homepage hero copy, mission text, social links, contact info
- **Donations** — full transaction ledger (read-only, reconciled from Stripe)
- **Inquiries** — partnership/"Become a Brightener" leads, with status tracking
- **Users** — promote a donor account to `STAFF`/`ADMIN` (role changes require `ADMIN`)

Informational page copy that doesn't change often (e.g. the "What We Do" and About page
descriptive text, the "How Sponsorship Works" steps) is still code-level content rather
than CMS-editable — extending that would mean a generic page-builder, which was out of
scope for this pass.

## Payments & sponsorship flow

Donations (general or child-designated, one-time or monthly) go through a single Stripe
Checkout flow (`src/actions/donations.ts`). The webhook
(`src/app/api/webhooks/stripe/route.ts`) is the source of truth: it marks a `Donation`
`SUCCEEDED`, sends the receipt, and — for a monthly child sponsorship — creates a
`Sponsorship` row and flips the `Child` to `SPONSORED`. It also logs each subscription
renewal as its own `Donation` row (via `invoice.paid`) and reverts a child to `AVAILABLE`
if a sponsorship subscription is cancelled.

Sponsoring a specific child requires being signed in (so the sponsorship can be tied to an
account and shown on `/account`); general donations don't.

## Useful scripts

```bash
npm run db:studio   # Prisma Studio — browse/edit the database directly
npm run db:migrate   # create + apply a new migration
npm run lint          # ESLint
npm run build         # production build
```
