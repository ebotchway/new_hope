-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DONOR', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "ChildStatus" AS ENUM ('AVAILABLE', 'SPONSORED', 'GRADUATED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "SponsorshipType" AS ENUM ('FULL', 'CONTRIBUTION');

-- CreateEnum
CREATE TYPE "SponsorshipStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "DonationFrequency" AS ENUM ('ONE_TIME', 'MONTHLY');

-- CreateEnum
CREATE TYPE "DonationDesignation" AS ENUM ('GENERAL', 'CHILD_SPONSORSHIP', 'PARTNERSHIP');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PartnershipType" AS ENUM ('INDIVIDUAL', 'GROUP', 'CORPORATE', 'CHURCH', 'WILL_GIFT', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'DONOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "children" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "bio" TEXT NOT NULL,
    "photoUrl" TEXT,
    "school" TEXT,
    "location" TEXT,
    "status" "ChildStatus" NOT NULL DEFAULT 'AVAILABLE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsorships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "type" "SponsorshipType" NOT NULL,
    "status" "SponsorshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "monthlyAmountCents" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsorships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "childId" TEXT,
    "title" TEXT,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "donorPhone" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "frequency" "DonationFrequency" NOT NULL,
    "designation" "DonationDesignation" NOT NULL DEFAULT 'GENERAL',
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "emailUpdates" BOOLEAN NOT NULL DEFAULT true,
    "smsUpdates" BOOLEAN NOT NULL DEFAULT false,
    "whatsappUpdates" BOOLEAN NOT NULL DEFAULT false,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "receiptSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partnership_inquiries" (
    "id" TEXT NOT NULL,
    "type" "PartnershipType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnership_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "quote" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "impact_stats" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impact_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_events" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bulletPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "history_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trustees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trustees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroHeadline" TEXT NOT NULL DEFAULT 'Transforming Lives Through Education',
    "heroSubheadline" TEXT NOT NULL DEFAULT 'Providing access to education for a brighter future',
    "missionTitle" TEXT NOT NULL DEFAULT 'Our Guiding Mission',
    "missionBody" TEXT NOT NULL DEFAULT '',
    "facebookUrl" TEXT,
    "twitterUrl" TEXT,
    "youtubeUrl" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "children_slug_key" ON "children"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sponsorships_stripeSubscriptionId_key" ON "sponsorships"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "donations_stripeCheckoutSessionId_key" ON "donations"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "donations_stripePaymentIntentId_key" ON "donations"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "donations_stripeSubscriptionId_key" ON "donations"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsorships" ADD CONSTRAINT "sponsorships_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_childId_fkey" FOREIGN KEY ("childId") REFERENCES "children"("id") ON DELETE SET NULL ON UPDATE CASCADE;
