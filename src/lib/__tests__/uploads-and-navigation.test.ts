import { test } from "node:test";
import assert from "node:assert/strict";
import { isRouteActive, ADMIN_NAV_SECTIONS } from "@/components/admin/sidebar-nav";
import { uploadFile, deleteFile } from "@/lib/storage";

test("Admin Sidebar Navigation - Active State Matching Algorithm", () => {
  // Exact dashboard root match
  assert.equal(isRouteActive("/admin", "/admin"), true);
  assert.equal(isRouteActive("/admin/reports", "/admin"), false);
  assert.equal(isRouteActive("/admin/children", "/admin"), false);

  // Specific section match
  assert.equal(isRouteActive("/admin/progress-reports", "/admin/progress-reports"), true);
  assert.equal(isRouteActive("/admin/children", "/admin/progress-reports"), false);

  // Subpath matching for children section
  assert.equal(isRouteActive("/admin/children/new", "/admin/children"), true);
  assert.equal(isRouteActive("/admin/children/cm0abc123/updates", "/admin/children"), true);

  // Disambiguation between /admin/settings and /admin/settings/backups
  assert.equal(isRouteActive("/admin/settings", "/admin/settings"), true);
  assert.equal(isRouteActive("/admin/settings/backups", "/admin/settings/backups"), true);
  assert.equal(isRouteActive("/admin/settings/backups", "/admin/settings"), false); // Should NOT highlight settings when on backups

  // Reports and sub-reports
  assert.equal(isRouteActive("/admin/reports", "/admin/reports"), true);
  assert.equal(isRouteActive("/admin/reports/audit-logs", "/admin/reports/audit-logs"), true);
  assert.equal(isRouteActive("/admin/reports/audit-logs", "/admin/reports"), false); // Should NOT highlight overview reports when on audit-logs
});

test("Storage Engine - Extended MIME and Extension Resilience", async () => {
  // Test valid buffer and PNG upload
  const pngContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13]);
  const testPngFile = new File([pngContent], "test-avatar.png", { type: "image/png" });
  const pngUrl = await uploadFile(testPngFile, "test-unit");
  assert.ok(pngUrl.startsWith("/uploads/test-unit/"));
  assert.ok(pngUrl.endsWith(".png"));

  // Clean up
  const deletedPng = await deleteFile(pngUrl);
  assert.equal(deletedPng, true);

  // Test fallback when MIME is empty/generic but file extension is valid
  const testJpgFile = new File([new Uint8Array([255, 216, 255, 224])], "donor-photo.jpeg", {
    type: "application/octet-stream",
  });
  const jpgUrl = await uploadFile(testJpgFile, "test-unit");
  assert.ok(jpgUrl.startsWith("/uploads/test-unit/"));
  assert.ok(jpgUrl.endsWith(".jpg"));

  // Clean up
  const deletedJpg = await deleteFile(jpgUrl);
  assert.equal(deletedJpg, true);

  // Test WebP format
  const testWebpFile = new File([new Uint8Array([82, 73, 70, 70])], "banner.webp", {
    type: "image/webp",
  });
  const webpUrl = await uploadFile(testWebpFile, "test-unit");
  assert.ok(webpUrl.startsWith("/uploads/test-unit/"));
  assert.ok(webpUrl.endsWith(".webp"));

  // Clean up
  const deletedWebp = await deleteFile(webpUrl);
  assert.equal(deletedWebp, true);

  // Rejects invalid file formats
  const testTextFile = new File([new TextEncoder().encode("malicious executable")], "script.sh", {
    type: "text/x-sh",
  });
  await assert.rejects(
    async () => {
      await uploadFile(testTextFile, "test-unit");
    },
    { message: /Invalid file type/ }
  );
});
