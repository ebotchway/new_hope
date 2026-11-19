-- AlterTable
ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "stripePublishableKey" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeSecretKey" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeWebhookSecret" TEXT,
  ADD COLUMN IF NOT EXISTS "stripeMode" TEXT DEFAULT 'test';
