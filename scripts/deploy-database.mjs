#!/usr/bin/env node
/**
 * LivingHope Platform — Automated Resilient Database Deployment Script
 * Safely executes Prisma client generation, migrations, and test user seeding for Supabase, Netlify,
 * and Docker environments with automatic pooler detection, session port routing,
 * and strict timeout safeguards.
 */

import { execSync } from "child_process";

const rawDbUrl =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL ||
  process.env.SUPABASE_CONNECT;

// Ensure DATABASE_URL is populated if user provided SUPABASE_CONNECT
if (!process.env.DATABASE_URL && process.env.SUPABASE_CONNECT) {
  process.env.DATABASE_URL = process.env.SUPABASE_CONNECT;
}

// Generate Prisma Client first so types and models are always ready
console.log("📦 Generating Prisma Client...");
try {
  execSync("npx prisma generate", {
    env: process.env,
    stdio: "inherit",
    timeout: 30000,
  });
  console.log("✓ Prisma Client generated.");
} catch (err) {
  console.warn("⚠️ Warning: Prisma generate had issues:", err.message || err);
}

if (!rawDbUrl) {
  console.log("ℹ No database connection string detected. Skipping automated migrations.");
  process.exit(0);
}

// Check for Supabase Transaction Pooler (port 6543)
let migrationUrl = process.env.DIRECT_URL || rawDbUrl;
if (migrationUrl.includes(":6543")) {
  console.log("⚡ Notice: Detected Supabase Transaction Pooler (port 6543).");
  console.log("   Port 6543 uses transaction pooling and does not support Prisma migration advisory locks.");
  console.log("   Automatically switching to Session Pooler (port 5432) for migrations...");

  migrationUrl = migrationUrl
    .replace(":6543", ":5432")
    .replace("?pgbouncer=true", "")
    .replace("&pgbouncer=true", "");

  process.env.DIRECT_URL = migrationUrl;
}

const envWithDirect = {
  ...process.env,
  DIRECT_URL: process.env.DIRECT_URL || migrationUrl,
  DATABASE_URL: process.env.DATABASE_URL || migrationUrl,
};

console.log("🚀 Running Prisma database migrations (30s timeout guard)...");
try {
  execSync("npx prisma migrate deploy", {
    env: envWithDirect,
    stdio: "inherit",
    timeout: 30000, // 30 seconds max to prevent Netlify build hangs
  });
  console.log("✓ Prisma migrations deployed successfully.");
} catch (err) {
  console.warn("⚠️ Warning: Prisma migrate deploy could not complete within timeout or failed.");
  console.warn("   Error summary:", err.message || err);
  console.warn("   Site build will proceed without blocking.");
}

console.log("🌱 Running complete platform seed (users, children, CMS, settings)...");
try {
  execSync("npx tsx scripts/seed-complete-platform.ts", {
    env: envWithDirect,
    stdio: "inherit",
    timeout: 30000,
  });
  console.log("✓ Complete platform seeded successfully.");
} catch (err) {
  console.warn("⚠️ Warning: Platform seeding skipped or failed:", err.message || err);
}

console.log("✅ Database deployment step completed.");
process.exit(0);
