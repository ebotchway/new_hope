-- Financial integrity, security, and performance enhancements

-- 1. Donations: Drop unique constraint on stripeSubscriptionId to allow renewals
DROP INDEX IF EXISTS "donations_stripeSubscriptionId_key";

-- 2. Donations: Add stripeInvoiceId with unique constraint for idempotency
ALTER TABLE "donations" ADD COLUMN "stripeInvoiceId" TEXT;
CREATE UNIQUE INDEX "donations_stripeInvoiceId_key" ON "donations"("stripeInvoiceId");

-- 3. Donations: Add MoMo verification and multi-currency tracking fields
ALTER TABLE "donations"
ADD COLUMN "momoVerifiedAt" TIMESTAMP(3),
ADD COLUMN "momoVerifiedBy" TEXT,
ADD COLUMN "momoRejectionReason" TEXT,
ADD COLUMN "exchangeRate" DOUBLE PRECISION,
ADD COLUMN "amountGhsCents" INTEGER;

-- 4. Sponsorships: Support guest sponsorships & protect child history
ALTER TABLE "sponsorships" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "sponsorships"
ADD COLUMN "guestName" TEXT,
ADD COLUMN "guestEmail" TEXT,
ADD COLUMN "guestPhone" TEXT;

ALTER TABLE "sponsorships" DROP CONSTRAINT IF EXISTS "sponsorships_childId_fkey";
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sponsorships" DROP CONSTRAINT IF EXISTS "sponsorships_userId_fkey";
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Children: Add archiving support
ALTER TABLE "children" ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;

-- 6. Users: Password reset fields
ALTER TABLE "users"
ADD COLUMN "resetPasswordToken" TEXT,
ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);
CREATE UNIQUE INDEX "users_resetPasswordToken_key" ON "users"("resetPasswordToken");

-- 7. Site settings: MoMo exchange rate & instructions
ALTER TABLE "site_settings"
ADD COLUMN "momoRateUsdToGhs" DOUBLE PRECISION DEFAULT 15.5,
ADD COLUMN "momoInstructions" TEXT;

-- 8. Performance Indexes
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "children_status_idx" ON "children"("status");
CREATE INDEX "children_featured_order_idx" ON "children"("featured", "order");
CREATE INDEX "children_archived_idx" ON "children"("archived");
CREATE INDEX "child_updates_childId_published_idx" ON "child_updates"("childId", "published");
CREATE INDEX "sponsorships_userId_idx" ON "sponsorships"("userId");
CREATE INDEX "sponsorships_childId_idx" ON "sponsorships"("childId");
CREATE INDEX "sponsorships_status_idx" ON "sponsorships"("status");
CREATE INDEX "donations_userId_idx" ON "donations"("userId");
CREATE INDEX "donations_childId_idx" ON "donations"("childId");
CREATE INDEX "donations_status_createdAt_idx" ON "donations"("status", "createdAt");
CREATE INDEX "donations_paymentMethod_status_idx" ON "donations"("paymentMethod", "status");
CREATE INDEX "donations_stripeSubscriptionId_idx" ON "donations"("stripeSubscriptionId");
CREATE INDEX "partnership_inquiries_status_createdAt_idx" ON "partnership_inquiries"("status", "createdAt");
CREATE INDEX "stories_published_order_idx" ON "stories"("published", "order");
CREATE INDEX "impact_stats_published_order_idx" ON "impact_stats"("published", "order");
CREATE INDEX "history_events_published_order_idx" ON "history_events"("published", "order");
CREATE INDEX "trustees_published_order_idx" ON "trustees"("published", "order");

