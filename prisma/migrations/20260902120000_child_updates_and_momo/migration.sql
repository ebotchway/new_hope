-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'MOBILE_MONEY');

-- AlterTable
ALTER TABLE "donations" ADD COLUMN     "momoReference" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CARD';

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "momoName" TEXT,
ADD COLUMN     "momoNumber" TEXT,
ADD COLUMN     "momoProvider" TEXT DEFAULT 'MTN Mobile Money';

-- CreateTable
CREATE TABLE "child_updates" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_updates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donations_momoReference_key" ON "donations"("momoReference");

-- AddForeignKey
ALTER TABLE "child_updates" ADD CONSTRAINT "child_updates_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;
