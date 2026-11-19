# Netlify Deployment Guide — LivingHope Next.js 16 Platform

This guide outlines how to deploy LivingHope directly to Netlify from your GitHub repository with zero configuration friction and automated database initialization.

---

## 1. Prerequisites
1. **GitHub Repository**: Push this repository to your GitHub account (`main` branch).
2. **PostgreSQL Database**: A cloud-hosted PostgreSQL instance (e.g. [Supabase](https://supabase.com), [Neon](https://neon.tech), [Prisma Postgres](https://prisma.io), or [Railway](https://railway.app)).

---

## 2. Supabase Connection Strings & Connection Pooler Guide

In your Supabase Dashboard under **Project Settings** $\rightarrow$ **Database** $\rightarrow$ **Connection String**, Supabase provides two connection types:

### A. Session Mode (Port 5432) — Used for Prisma Migrations & Schema Deployment
- **Port**: `5432`
- **Example**: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres`
- **Why**: Session mode supports PostgreSQL advisory locks (`pg_advisory_lock`), which Prisma CLI requires to deploy migrations safely.
- **Environment Variable**: `DIRECT_URL` (or used as `DATABASE_URL` during migrations).

### B. Transaction Mode (Port 6543) — Used for Next.js App Queries
- **Port**: `6543` (with `?pgbouncer=true`)
- **Example**: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Why**: Transaction mode multiplexes hundreds of concurrent serverless requests through PgBouncer efficiently.
- **Environment Variable**: `DATABASE_URL` (or `SUPABASE_CONNECT`).

> [!NOTE]
> The automated migration script (`scripts/deploy-database.mjs`) automatically detects if port `6543` was passed for migrations and safely routes the migration to the Session Pooler on port `5432`, preventing PgBouncer advisory lock hangs!

---

## 3. Automated Build & Database Migration (`netlify.toml`)

The repository includes an intelligent preconfigured [netlify.toml](file:///Users/qwaku/Codes/QBE/new_hope/netlify.toml) and [deploy-database.mjs](file:///Users/qwaku/Codes/QBE/new_hope/scripts/deploy-database.mjs) in the project root:

```toml
[build]
  command = "node scripts/deploy-database.mjs && npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  SECRETS_SCAN_OMIT_KEYS = "AUTH_SECRET"
  SECRETS_SCAN_OMIT_PATHS = ".netlify/**,.next/**"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### How the automated database build works on Netlify:
1. **Connection Resolution**: Checks `DIRECT_URL`, `DATABASE_URL`, or `SUPABASE_CONNECT`.
2. **Supabase Pooler Auto-Routing**: If the URL contains `:6543`, it automatically transforms it to port `:5432` for the migration phase so Prisma advisory locks don't hang.
3. **Timeout Protection**: Enforces a strict 30-second execution guard on migrations and user seeding so Netlify never times out or hangs.
4. **Account Seeding**: Automatically seeds the 2 Admins, 5 Brighteners, and default site settings on first deploy.
5. **Offline Prisma Compilation**: `npm run build` runs `prisma generate && next build`, guaranteeing that Prisma Client types are compiled before Next.js builds.

---

## 4. Required Environment Variables on Netlify

In your Netlify Site Dashboard, navigate to **Site configuration** $\rightarrow$ **Environment variables** and add:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` (or `SUPABASE_CONNECT`) | Supabase PostgreSQL Connection String | `postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` *(Recommended for Supabase)* | Supabase Session Port (5432) for migrations | `postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres` |
| `AUTH_SECRET` | NextAuth session encryption secret (32+ chars) | Generate with `openssl rand -base64 33` |
| `AUTH_URL` | Your production Netlify URL | `https://your-site-name.netlify.app` |

---

## 5. Pre-Seeded Test Credentials
Once deployed, the following accounts are automatically ready:

### Administrators
- `admin1@livinghope.org` / Password: `Super@Password1212` (or username `admin1`)
- `admin2@livinghope.org` / Password: `Super@Password1212` (or username `admin2`)
- `admin@livinghope.org` / Password: `Super@Password1212` (or username `admin`)

### Contributors / Brighteners
- `brightnerone@livinghope.org` through `brightnerfive@livinghope.org`
- Password for all contributors: `AdomNhyira10` (or username `brightnerone` ... `brightnerfive`)
