-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NavMenu" AS ENUM ('HEADER', 'FOOTER_COL1', 'FOOTER_COL2', 'FOOTER_COL3', 'FOOTER_LEGAL');

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publicTitle" TEXT,
    "description" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedRevisionId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "canonicalUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_revisions" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "authorId" TEXT,
    "authorName" TEXT,
    "sections" JSONB NOT NULL,
    "changelog" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_audit_logs" (
    "id" TEXT NOT NULL,
    "pageId" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_media_assets" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "caption" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_nav_items" (
    "id" TEXT NOT NULL,
    "menu" "NavMenu" NOT NULL DEFAULT 'HEADER',
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_nav_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_appearance" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "primaryColor" TEXT NOT NULL DEFAULT '#0f766e',
    "secondaryColor" TEXT NOT NULL DEFAULT '#d97706',
    "accentColor" TEXT NOT NULL DEFAULT '#f59e0b',
    "fontHeading" TEXT NOT NULL DEFAULT 'font-heading',
    "fontBody" TEXT NOT NULL DEFAULT 'font-sans',
    "buttonRadius" TEXT NOT NULL DEFAULT 'rounded-xl',
    "containerWidth" TEXT NOT NULL DEFAULT 'max-w-7xl',
    "headerSticky" BOOLEAN NOT NULL DEFAULT true,
    "footerTheme" TEXT NOT NULL DEFAULT 'dark',
    "logoUrl" TEXT,
    "logoDarkUrl" TEXT,
    "faviconUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_appearance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");
CREATE INDEX "cms_pages_status_idx" ON "cms_pages"("status");
CREATE INDEX "cms_pages_slug_idx" ON "cms_pages"("slug");

-- CreateIndex
CREATE INDEX "cms_revisions_pageId_idx" ON "cms_revisions"("pageId");
CREATE INDEX "cms_revisions_authorId_idx" ON "cms_revisions"("authorId");
CREATE UNIQUE INDEX "cms_revisions_pageId_revisionNumber_key" ON "cms_revisions"("pageId", "revisionNumber");

-- CreateIndex
CREATE INDEX "cms_audit_logs_pageId_idx" ON "cms_audit_logs"("pageId");
CREATE INDEX "cms_audit_logs_userId_idx" ON "cms_audit_logs"("userId");
CREATE INDEX "cms_audit_logs_action_idx" ON "cms_audit_logs"("action");
CREATE INDEX "cms_audit_logs_createdAt_idx" ON "cms_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cms_media_assets_url_key" ON "cms_media_assets"("url");
CREATE INDEX "cms_media_assets_folder_idx" ON "cms_media_assets"("folder");
CREATE INDEX "cms_media_assets_mimeType_idx" ON "cms_media_assets"("mimeType");
CREATE INDEX "cms_media_assets_createdAt_idx" ON "cms_media_assets"("createdAt");
CREATE INDEX "cms_media_assets_uploadedBy_idx" ON "cms_media_assets"("uploadedBy");

-- CreateIndex
CREATE INDEX "cms_nav_items_menu_published_order_idx" ON "cms_nav_items"("menu", "published", "order");

-- AddForeignKey
ALTER TABLE "cms_revisions" ADD CONSTRAINT "cms_revisions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cms_revisions" ADD CONSTRAINT "cms_revisions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_audit_logs" ADD CONSTRAINT "cms_audit_logs_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cms_audit_logs" ADD CONSTRAINT "cms_audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_media_assets" ADD CONSTRAINT "cms_media_assets_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_nav_items" ADD CONSTRAINT "cms_nav_items_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cms_nav_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

