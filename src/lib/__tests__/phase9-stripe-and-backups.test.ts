import test from "node:test";
import assert from "node:assert/strict";
import { siteSettingsSchema } from "@/lib/validations";
import { sanitizeFilename, listBackups } from "@/lib/backup-service";
import { testStripeConnection, getStripeConfig } from "@/lib/stripe";

test("Phase 9: Stripe Gateway & Backup Engine Verification", async (t) => {
  await t.test("siteSettingsSchema validates Stripe configuration accurately", () => {
    // Valid test configuration
    const validTest = siteSettingsSchema.safeParse({
      heroHeadline: "Transforming Lives",
      heroSubheadline: "Education for All",
      missionTitle: "Our Mission",
      missionBody: "Providing quality education to underserved communities.",
      stripePublishableKey: "pk_test_51MockKey12345",
      stripeSecretKey: "sk_test_51MockSecretKey67890",
      stripeWebhookSecret: "whsec_mockWebhookSecret123",
      stripeMode: "test",
    });
    assert.equal(validTest.success, true);
    if (validTest.success) {
      assert.equal(validTest.data.stripeMode, "test");
      assert.equal(validTest.data.stripePublishableKey, "pk_test_51MockKey12345");
      assert.equal(validTest.data.stripeSecretKey, "sk_test_51MockSecretKey67890");
      assert.equal(validTest.data.stripeWebhookSecret, "whsec_mockWebhookSecret123");
    }

    // Valid live configuration
    const validLive = siteSettingsSchema.safeParse({
      heroHeadline: "Transforming Lives",
      heroSubheadline: "Education for All",
      missionTitle: "Our Mission",
      missionBody: "Providing quality education to underserved communities.",
      stripePublishableKey: "pk_live_51MockLiveKey123",
      stripeSecretKey: "sk_live_51MockLiveSecretKey456",
      stripeWebhookSecret: "whsec_liveWebhookSecret789",
      stripeMode: "live",
    });
    assert.equal(validLive.success, true);
    if (validLive.success) {
      assert.equal(validLive.data.stripeMode, "live");
    }

    // Valid with empty optional strings (cleared keys)
    const validEmpty = siteSettingsSchema.safeParse({
      heroHeadline: "Transforming Lives",
      heroSubheadline: "Education for All",
      missionTitle: "Our Mission",
      missionBody: "Providing quality education.",
      stripePublishableKey: "",
      stripeSecretKey: "",
      stripeWebhookSecret: "",
      stripeMode: "test",
    });
    assert.equal(validEmpty.success, true);

    // Invalid mode rejection
    const invalidMode = siteSettingsSchema.safeParse({
      heroHeadline: "Transforming Lives",
      heroSubheadline: "Education for All",
      missionTitle: "Our Mission",
      missionBody: "Providing quality education.",
      stripeMode: "staging", // not allowed, must be test or live
    });
    assert.equal(invalidMode.success, false);
  });

  await t.test("sanitizeFilename strictly blocks directory traversal", () => {
    // Valid filenames
    assert.equal(
      sanitizeFilename("livinghope_db_snapshot_20261119_163000.json.gz"),
      "livinghope_db_snapshot_20261119_163000.json.gz"
    );
    assert.equal(
      sanitizeFilename("livinghope_media_20261110_125913.tar.gz"),
      "livinghope_media_20261110_125913.tar.gz"
    );

    // Traversal attempts must throw
    assert.throws(() => sanitizeFilename("../../../etc/passwd"), /Invalid backup filename/);
    assert.throws(() => sanitizeFilename("backups/test.sql"), /Invalid backup filename/);
    assert.throws(() => sanitizeFilename("..\\windows\\system32"), /Invalid backup filename/);
    assert.throws(() => sanitizeFilename("file with spaces.gz"), /Invalid backup filename/);
    assert.throws(() => sanitizeFilename("test;rm -rf /"), /Invalid backup filename/);
  });

  await t.test("listBackups correctly indexes backups directory", async () => {
    const backups = await listBackups();
    assert.ok(Array.isArray(backups), "listBackups must return an array");
    assert.ok(backups.length >= 2, "Should discover pre-existing backup files in ./backups");

    const sqlBackup = backups.find((b) => b.filename.includes("livinghope_db_20261110_121435.sql.gz"));
    assert.ok(sqlBackup, "SQL backup file should be found");
    assert.equal(sqlBackup?.type, "db_sql");
    assert.ok(sqlBackup!.sizeBytes > 0);

    const mediaBackup = backups.find((b) => b.filename.includes("livinghope_media_20261110_125913.tar.gz"));
    assert.ok(mediaBackup, "Media backup file should be found");
    assert.equal(mediaBackup?.type, "media");
    assert.ok(mediaBackup!.sizeBytes > 0);
  });

  await t.test("testStripeConnection validates key format and rejects invalid inputs safely", async () => {
    // Missing key
    const missing = await testStripeConnection("");
    assert.equal(missing.ok, false);
    assert.ok(missing.error?.includes("No Stripe Secret Key") || missing.error?.includes("Invalid Stripe key format"));

    // Malformed key format
    const malformed = await testStripeConnection("invalid_prefix_123456789");
    assert.equal(malformed.ok, false);
    assert.ok(malformed.error?.includes("Invalid Stripe key format"));
  });

  await t.test("getStripeConfig returns structured gateway configuration", async () => {
    const config = await getStripeConfig();
    assert.ok(config);
    assert.ok("isConfigured" in config);
    assert.ok("mode" in config);
    assert.ok("source" in config);
    assert.ok(["test", "live"].includes(config.mode));
    assert.ok(["database", "environment", "none"].includes(config.source));
  });
});
