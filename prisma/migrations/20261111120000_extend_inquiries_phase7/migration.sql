-- AlterTable
ALTER TABLE "partnership_inquiries" 
  ADD COLUMN IF NOT EXISTS "organization" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "skills" TEXT,
  ADD COLUMN IF NOT EXISTS "availability" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredFrequency" TEXT,
  ADD COLUMN IF NOT EXISTS "subject" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'BRIGHTENER_REGISTRATION',
  ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "partnership_inquiries_category_idx" ON "partnership_inquiries"("category");
