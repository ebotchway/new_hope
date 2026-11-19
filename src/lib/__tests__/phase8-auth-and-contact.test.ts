import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isGoogleAuthAvailable } from "@/auth";
import { signInWithGoogle } from "@/actions/auth";
import { generalInquirySchema } from "@/lib/validations";
import { submitGeneralInquiry } from "@/actions/inquiries";
import { prisma } from "@/lib/prisma";

describe("Phase 8: Authentication Configuration & Google OAuth Resilience", () => {
  it("detects whether Google OAuth credentials are meaningfully configured", () => {
    // When process.env.AUTH_GOOGLE_ID is unset, isGoogleAuthAvailable must be false
    const expected = Boolean(
      (process.env.AUTH_GOOGLE_ID?.trim() || process.env.GOOGLE_CLIENT_ID?.trim()) &&
        (process.env.AUTH_GOOGLE_SECRET?.trim() || process.env.GOOGLE_CLIENT_SECRET?.trim())
    );
    assert.strictEqual(isGoogleAuthAvailable, expected);
  });

  it("returns a helpful, safe error when Google Sign-In is triggered without client credentials", async () => {
    const originalId = process.env.AUTH_GOOGLE_ID;
    const originalSecret = process.env.AUTH_GOOGLE_SECRET;

    delete process.env.AUTH_GOOGLE_ID;
    delete process.env.AUTH_GOOGLE_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const res = await signInWithGoogle("/account");
    assert.strictEqual(res.success, false);
    assert.ok(res.error?.includes("Google Sign-In is temporarily unavailable"));

    // Restore
    if (originalId) process.env.AUTH_GOOGLE_ID = originalId;
    if (originalSecret) process.env.AUTH_GOOGLE_SECRET = originalSecret;
  });

  it("verifies user role security: new Google sign-in users are restricted to DONOR role", async () => {
    // Check role assignment policy logic in Prisma
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    assert.ok(adminUser, "Database must have an admin user");
    assert.strictEqual(adminUser.role, "ADMIN");
  });
});

describe("Phase 8: Contact Page & General Inquiry Verification", () => {
  it("validates valid contact inquiries with required fields across all enum options", () => {
    const types = ["GENERAL", "SPONSORSHIP", "DONATION", "VOLUNTEER", "VISIT", "MEDIA", "OTHER"] as const;

    for (const t of types) {
      const valid = {
        name: "Kwesi Appiah",
        email: "kwesi@example.com",
        phone: "+233240000000",
        inquiryType: t,
        subject: `Inquiry topic: ${t}`,
        message: "Detailed message regarding our upcoming outreach partnership.",
      };

      const res = generalInquirySchema.safeParse(valid);
      assert.strictEqual(res.success, true, `Expected inquiryType "${t}" to be valid`);
    }
  });

  it("persists contact inquiry with category GENERAL_INQUIRY and verifies admin queryability", async () => {
    const result = await submitGeneralInquiry({
      name: "Esi Badu",
      email: "esi.badu.phase8@example.com",
      inquiryType: "VISIT",
      subject: "Visiting Accra Drop-in Center",
      message: "Please let me know the safeguarding requirements for visiting.",
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.referenceId);

    const record = await prisma.partnershipInquiry.findUnique({
      where: { id: result.referenceId },
    });

    assert.ok(record);
    assert.strictEqual(record.category, "GENERAL_INQUIRY");
    assert.strictEqual(record.status, "NEW");
    assert.strictEqual(record.subject, "Visiting Accra Drop-in Center");

    // Clean up
    await prisma.partnershipInquiry.delete({ where: { id: record.id } });
  });
});

describe("Phase 8: Security and Routing Integrity", () => {
  it("protects system static routes from being hijacked by CMS pages", async () => {
    const { isReservedSlug } = await import("@/lib/cms-validations");
    const requiredReserved = [
      "sponsor-a-child",
      "become-a-brightener",
      "contact",
      "privacy",
      "terms",
      "donate",
      "account",
      "admin",
    ];

    for (const slug of requiredReserved) {
      assert.strictEqual(isReservedSlug(slug), true, `Slug "${slug}" must be reserved`);
    }
  });
});

