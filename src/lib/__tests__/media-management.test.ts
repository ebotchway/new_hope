import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { PLACEHOLDER_IMAGES } from "../placeholder-images";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_WHAT_WE_DO_SECTIONS,
} from "../cms-defaults";
import { prisma, closeDatabaseConnection } from "../prisma";

after(async () => {
  await closeDatabaseConnection();
});

describe("Phase 6 — Complete Media Management & Asset Integrity", () => {
  it("1. Zero External CDN URLs in Placeholder & Default Configurations", () => {
    // Check PLACEHOLDER_IMAGES
    for (const [key, url] of Object.entries(PLACEHOLDER_IMAGES)) {
      assert.ok(
        !url.startsWith("http://") && !url.startsWith("https://"),
        `Placeholder image '${key}' must be a local asset path, got external URL: ${url}`
      );
      assert.ok(
        url.startsWith("/images/") || url.startsWith("/uploads/"),
        `Placeholder image '${key}' must begin with /images/ or /uploads/, got: ${url}`
      );
    }

    // Check DEFAULT_HOMEPAGE_SECTIONS
    const homeJson = JSON.stringify(DEFAULT_HOMEPAGE_SECTIONS);
    assert.ok(
      !homeJson.includes("images.unsplash.com"),
      "DEFAULT_HOMEPAGE_SECTIONS must not reference external Unsplash images"
    );

    // Check DEFAULT_ABOUT_SECTIONS
    const aboutJson = JSON.stringify(DEFAULT_ABOUT_SECTIONS);
    assert.ok(
      !aboutJson.includes("images.unsplash.com"),
      "DEFAULT_ABOUT_SECTIONS must not reference external Unsplash images"
    );

    // Check DEFAULT_WHAT_WE_DO_SECTIONS
    const wwdJson = JSON.stringify(DEFAULT_WHAT_WE_DO_SECTIONS);
    assert.ok(
      !wwdJson.includes("images.unsplash.com"),
      "DEFAULT_WHAT_WE_DO_SECTIONS must not reference external Unsplash images"
    );
  });

  it("2. Local Filesystem Asset Verification — All Static Images Exist", () => {
    const requiredImages = [
      "public/images/home/hero.webp",
      "public/images/home/street-child.webp",
      "public/images/home/partnership-banner.webp",
      "public/images/home/impact.webp",
      "public/images/about/hero.webp",
      "public/images/about/team-field.webp",
      "public/images/about/mission.webp",
      "public/images/programmes/hero.webp",
      "public/images/programmes/education.webp",
      "public/images/programmes/vocational.webp",
      "public/images/programmes/outreach.webp",
      "public/images/programmes/health.webp",
      "public/images/sponsorship/hero.webp",
      "public/images/sponsorship/brightener-hero.webp",
      "public/images/donations/hero.webp",
      "public/images/donations/impact.webp",
      "public/images/partnerships/hero.webp",
      "public/images/partnerships/collaboration.webp",
      "public/images/placeholders/child-avatar.webp",
      "public/images/placeholders/fallback.webp",
      "public/images/placeholders/home-hero.webp",
      "public/images/placeholders/street-child.webp",
      "public/images/placeholders/partnership-banner.webp",
      "public/images/placeholders/about-hero.webp",
      "public/images/placeholders/team-field.webp",
      "public/images/placeholders/what-we-do-hero.webp",
    ];

    for (const relPath of requiredImages) {
      const fullPath = path.join(process.cwd(), relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Required image file '${relPath}' must exist on disk`
      );
      const stat = fs.statSync(fullPath);
      assert.ok(
        stat.size > 1024,
        `Image '${relPath}' must be greater than 1KB, got ${stat.size} bytes`
      );
    }
  });

  it("3. Beneficiary Portrait Integrity — Child Photos Exist and Are Valid", () => {
    const childPhotos = [
      "public/uploads/children/amara.webp",
      "public/uploads/children/kwame.webp",
      "public/uploads/children/efua.webp",
    ];

    for (const relPath of childPhotos) {
      const fullPath = path.join(process.cwd(), relPath);
      assert.ok(
        fs.existsSync(fullPath),
        `Beneficiary portrait '${relPath}' must exist on disk`
      );
      const stat = fs.statSync(fullPath);
      assert.ok(
        stat.size > 5000,
        `Beneficiary portrait '${relPath}' must be a high-quality asset (>5KB), got ${stat.size} bytes`
      );
    }
  });

  it("4. Database Child Record Photo URL Verification", async () => {
    const children = await prisma.child.findMany({
      where: { slug: { in: ["amara", "kwame", "efua"] } },
    });

    assert.equal(children.length, 3, "Expected 3 seeded children in database");

    for (const child of children) {
      assert.ok(
        child.photoUrl !== null && child.photoUrl.length > 0,
        `Child '${child.slug}' must have a non-null photoUrl`
      );
      assert.match(
        child.photoUrl,
        /^\/uploads\/children\/.*\.webp$/,
        `Child '${child.slug}' photoUrl must match WebP upload path`
      );
      const filePath = path.join(process.cwd(), "public", child.photoUrl.replace(/^\//, ""));
      assert.ok(
        fs.existsSync(filePath),
        `File referenced by child '${child.slug}' (${child.photoUrl}) must exist on disk`
      );
    }
  });

  it("5. CmsMediaAsset Database Registry & Metadata Accuracy", async () => {
    const assets = await prisma.cmsMediaAsset.findMany();
    assert.ok(
      assets.length >= 10,
      `Expected at least 10 registered CMS media assets, got ${assets.length}`
    );

    for (const asset of assets) {
      assert.ok(asset.url.startsWith("/uploads/"), `Asset URL must start with /uploads/, got ${asset.url}`);
      assert.ok(asset.sizeBytes > 0, `Asset ${asset.url} must have positive sizeBytes`);
      assert.ok(asset.mimeType.startsWith("image/"), `Asset ${asset.url} must have image MIME type`);
      if (asset.width) {
        assert.ok(asset.width > 0, `Asset ${asset.url} width must be positive`);
      }
      if (asset.height) {
        assert.ok(asset.height > 0, `Asset ${asset.url} height must be positive`);
      }
      assert.ok(asset.folder.length > 0, `Asset ${asset.url} must belong to a folder`);
    }
  });

  it("6. Media Security & Upload Validation Logic", () => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    const isUploadValid = (mime: string, size: number) => {
      if (!allowedMimeTypes.includes(mime)) return false;
      if (size <= 0 || size > maxSizeBytes) return false;
      return true;
    };

    // Valid cases
    assert.equal(isUploadValid("image/webp", 1024 * 50), true);
    assert.equal(isUploadValid("image/jpeg", 1024 * 200), true);
    assert.equal(isUploadValid("image/png", 1024 * 500), true);
    assert.equal(isUploadValid("image/avif", 1024 * 80), true);

    // Invalid MIME types
    assert.equal(isUploadValid("application/javascript", 1024), false);
    assert.equal(isUploadValid("text/html", 1024), false);
    assert.equal(isUploadValid("application/x-php", 1024), false);
    assert.equal(isUploadValid("image/svg+xml", 1024), false); // Rejected for XSS attack vector prevention

    // Invalid sizes
    assert.equal(isUploadValid("image/webp", 0), false);
    assert.equal(isUploadValid("image/webp", -10), false);
    assert.equal(isUploadValid("image/webp", 15 * 1024 * 1024), false); // Exceeds 10MB
  });
});
