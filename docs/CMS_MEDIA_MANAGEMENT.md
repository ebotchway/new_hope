# LivingHope Platform — CMS Media Management System

**Version:** 1.0 (Phase 6 Production Architecture)  
**Location:** `/admin/website/media`  
**Components:** `src/components/admin/cms/media-library.tsx`, `media-picker-dialog.tsx`, `section-property-editor.tsx`  
**Database Model:** `CmsMediaAsset` (Prisma)

---

## 1. System Overview

The LivingHope CMS Media Management System provides administrative staff with a powerful, secure, centralized environment for uploading, browsing, searching, categorizing, inspecting, and inserting media assets across the public-facing website.

Rather than storing unmanaged files or relying on external URLs, all media uploaded through the dashboard is:
1. Validated strictly on client and server (MIME type whitelist, file size ceilings).
2. Stored locally in `public/uploads/*` (or cloud storage driver when configured).
3. Persisted in Docker through dedicated persistent volume mounts (`uploads:/app/public/uploads`).
4. Registered as a structured record in the `CmsMediaAsset` database table with dimensions, byte size, alt text, caption, and folder categorization.

```
+-------------------------------------------------------------------------------+
|                             Admin CMS Dashboard                               |
|  (/admin/website/media | /admin/website/homepage | /admin/website/pages/[id])  |
+-------------------------------------------------------------------------------+
           |                                                      |
           v                                                      v
  [Media Upload Modal]                                 [Media Picker Dialog]
           |                                                      |
           v                                                      v
  +------------------+                                  +------------------+
  | Server Action /  |                                  | Filter by Folder |
  | Upload Handler   |                                  | Full-text Search |
  +------------------+                                  +------------------+
           |                                                      |
  +--------+--------+                                             v
  |                 |                                   [Select Image Asset]
  v                 v                                             |
[Disk Storage]   [Database Record]                                v
/public/uploads/  CmsMediaAsset (Prisma)               [Section Property Editor]
(Docker Volume)  - url, filename, size,                           |
                 - dimensions, alt, folder                        v
                                                       [Published Public Page]
```

---

## 2. Database Schema: `CmsMediaAsset`

```prisma
model CmsMediaAsset {
  id           String    @id @default(cuid())
  url          String    @unique
  filename     String
  originalName String
  mimeType     String
  sizeBytes    Int
  width        Int?
  height       Int?
  altText      String?
  caption      String?
  folder       String    @default("general")
  uploadedBy   String?

  uploader     User?     @relation(fields: [uploadedBy], references: [id], onDelete: SetNull)

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([folder])
  @@index([mimeType])
}
```

### Key Field Responsibilities:
- `url`: Canonical local URI path (e.g. `/uploads/cms/hero.webp` or `/uploads/children/amara.webp`). Guaranteed unique.
- `folder`: Logical taxonomy for folder-based browsing (`home`, `about`, `programmes`, `sponsorship`, `partnerships`, `children`, `placeholders`, `general`).
- `width` / `height`: Captured during image decoding; utilized by Next.js `<Image>` for accurate intrinsic aspect ratios and zero Cumulative Layout Shift (CLS).
- `altText`: Accessibility attribute rendered into HTML for screen readers and SEO.
- `caption`: Contextual description enforcing safeguarding and dignified storytelling.

---

## 3. Media Picker & Section Property Integration

The media picker dialog (`src/components/admin/cms/media-picker-dialog.tsx`) is seamlessly embedded into the CMS section editor (`SectionPropertyEditor`):
- **Hero Sections:** Select high-resolution hero banners with preview and alignment controls.
- **Image & Text Sections:** Select outreach and classroom photography with left/right alignment toggles.
- **Programme Cards:** Assign dedicated thumbnail photography to each programme card.
- **Partnership Banners:** Select subtle background imagery with automatic dark overlay.
- **Beneficiary Profiles:** Link verified child portraits directly to sponsorship records.

### Non-Destructive Replacement & Rollback
Replacing an image in a draft page revision does **not** alter the live published page. The draft stores the new image URI in its isolated revision JSON. Only upon authorized publication does the public page reflect the new asset. Restoring a prior revision cleanly reverts image references without deleting the physical files.

---

## 4. Media Security Controls

| Threat / Risk | Mitigation Mechanism | Verification Status |
|---|---|---|
| **Malicious File Upload (Web Shells)** | Strict MIME type validation (`image/jpeg`, `image/png`, `image/webp`, `image/avif`). Disallows `.php`, `.sh`, `.exe`, `.js`. | **Enforced & Verified** (Test Suite) |
| **Cross-Site Scripting (XSS via SVG)** | SVG upload disallowed in public asset library to prevent embedded `<script>` execution. | **Enforced & Verified** |
| **Denial of Service (Oversized Files)** | 10 MB maximum file size limit enforced prior to stream processing. | **Enforced & Verified** |
| **Path Traversal Attacks** | Unique generated filenames (UUID / CUID); rejection of `../` in upload path strings. | **Enforced & Verified** |
| **Access Control** | Admin role required for media library mutations (`ADMIN` or `SUPERADMIN`). | **Enforced & Verified** |

