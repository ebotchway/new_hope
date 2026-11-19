# Netlify Deployment Guide — LivingHope Next.js 16 Platform

This guide outlines how to deploy LivingHope directly to Netlify from your GitHub repository with zero configuration friction.

---

## 1. Prerequisites
1. **GitHub Repository**: Push this repository to your GitHub account (`main` branch).
2. **PostgreSQL Database**: A cloud-hosted PostgreSQL instance (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), [Prisma Postgres](https://prisma.io), or [Railway](https://railway.app)).
   - *Tip*: For serverless platforms like Netlify functions, use a pooled connection string with `pgbouncer` or Neon/Supabase pooled URL.

---

## 2. Automated Build Configuration (`netlify.toml`)

The repository includes a preconfigured [netlify.toml](file:///Users/qwaku/Codes/QBE/new_hope/netlify.toml) in the project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  SECRETS_SCAN_ENABLED = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

The `build` script in `package.json` automatically runs `prisma generate && next build`, ensuring the Prisma 7 client is always generated before Next.js compiles.

---

## 3. Deploying via Netlify Dashboard

1. Sign in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** $\rightarrow$ **"Import an existing project"**.
3. Select **GitHub** and grant access to the repository.
4. Verify the detected settings:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Click **"Deploy site"**.

---

## 4. Required Environment Variables

In your Netlify Site Dashboard, navigate to **Site configuration** $\rightarrow$ **Environment variables** and add:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cloud PostgreSQL connection string | `postgresql://user:pass@ep-xyz.neon.tech/livinghope?sslmode=require` |
| `AUTH_SECRET` | NextAuth session encryption secret (32+ chars) | Generate with `openssl rand -base64 33` |
| `AUTH_URL` | Your production Netlify URL | `https://your-site-name.netlify.app` |
| `NEXT_PUBLIC_APP_URL` | Public application URL | `https://your-site-name.netlify.app` |
| `STRIPE_SECRET_KEY` | *(Optional fallback)* Stripe Secret API key | `sk_test_...` or configure in Admin Dashboard |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | *(Optional fallback)* Stripe Publishable key | `pk_test_...` or configure in Admin Dashboard |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | `whsec_...` |

---

## 5. One-Time Database Setup

Once your cloud PostgreSQL database is connected, apply migrations and seed the initial users:

```bash
# 1. Apply schema migrations to your cloud database
DATABASE_URL="your-cloud-database-url" npx prisma migrate deploy

# 2. Seed test admin and contributor accounts
DATABASE_URL="your-cloud-database-url" npx tsx scripts/seed-test-users.ts
```

---

## 6. Verification Checklist

1. **Homepage & Navigation**: Open `https://your-site-name.netlify.app/` and verify hero, stories, and programs render.
2. **Staff/Admin Login**: Sign in at `/login` using:
   - **Admin**: `admin1` / `Super@Password1212`
   - **Contributor**: `brightnerone` / `AdomNhyira10`
3. **Stripe Payment Gateway**: Open `/admin/settings` $\rightarrow$ Stripe Gateway card, click **"Test Stripe Connection"** to verify live API communication.
4. **Disaster Recovery**: Open `/admin/settings/backups` and click **"Create Backup Now"** to generate your first cloud point-in-time snapshot.
