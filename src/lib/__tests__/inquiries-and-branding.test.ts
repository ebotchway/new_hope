import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { brightenerRegistrationSchema, generalInquirySchema } from "@/lib/validations";
import { submitBrightenerRegistration, submitGeneralInquiry } from "@/actions/inquiries";

describe("Phase 7: Official Branding & Vector/Raster Asset Verification", () => {
  const brandDir = path.join(process.cwd(), "public/brand");

  it("has master official vector and raster brand assets", () => {
    const requiredFiles = [
      "livinghope-logo-master.svg",
      "livinghope-logo-dark.svg",
      "livinghope-logo-light.svg",
      "livinghope-logo-transparent.svg",
      "livinghope-symbol.svg",
      "livinghope-symbol.png",
      "livinghope-logo-dark.png",
      "livinghope-logo-light.png",
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(brandDir, file);
      assert.ok(fs.existsSync(filePath), `Brand asset ${file} should exist`);
      const stat = fs.statSync(filePath);
      assert.ok(stat.size > 100, `Asset ${file} should be non-empty`);
    }
  });

  it("has official favicon and touch icon files in public root", () => {
    const faviconPath = path.join(process.cwd(), "public/favicon.ico");
    const iconPath = path.join(process.cwd(), "public/icon.png");

    assert.ok(fs.existsSync(faviconPath), "favicon.ico must exist");
    assert.ok(fs.existsSync(iconPath), "icon.png must exist");
  });

  it("validates that the official SVG contains the exact red circular 'o' and navy palette", () => {
    const masterSvg = fs.readFileSync(path.join(brandDir, "livinghope-logo-master.svg"), "utf8");
    // Verify distinctive red dot #DC2626
    assert.ok(masterSvg.includes("#DC2626"), "Should contain primary red #DC2626");
    // Verify navy background / brand navy
    assert.ok(masterSvg.includes("#0B132B"), "Should contain brand navy #0B132B");
    // Verify tagline
    assert.ok(masterSvg.includes("BRIGHTEN THE FUTURE"), "Should contain official tagline");
  });
});

describe("Phase 7: Brightener Registration vs General Inquiry Separation", () => {
  const createdInquiryIds: string[] = [];

  after(async () => {
    if (createdInquiryIds.length > 0) {
      await prisma.partnershipInquiry.deleteMany({
        where: { id: { in: createdInquiryIds } },
      });
    }
  });

  describe("Validation Schemas", () => {
    it("validates individual brightener registration", () => {
      const validIndividual = {
        name: "Abena Osei",
        email: "abena@example.com",
        phone: "+233241234567",
        type: "INDIVIDUAL" as const,
        preferredFrequency: "MONTHLY" as const,
        message: "I want to support a street child every month.",
        agreementAccepted: true,
      };

      const result = brightenerRegistrationSchema.safeParse(validIndividual);
      assert.ok(result.success, "Valid individual registration should succeed");
    });

    it("requires agreement acceptance for brightener registration", () => {
      const unaccepted = {
        name: "Abena Osei",
        email: "abena@example.com",
        type: "INDIVIDUAL" as const,
        agreementAccepted: false,
      };

      const result = brightenerRegistrationSchema.safeParse(unaccepted);
      assert.strictEqual(result.success, false, "Should fail without agreement acceptance");
    });

    it("validates volunteer registration with skills and availability", () => {
      const validVolunteer = {
        name: "Kofi Mensah",
        email: "kofi@example.com",
        phone: "+233200000000",
        type: "VOLUNTEER" as const,
        skills: "Mathematics, Computer Literacy, Carpentry",
        availability: "Saturdays 9am-1pm",
        message: "Ready to assist with weekend tutoring in Accra.",
        agreementAccepted: true,
      };

      const result = brightenerRegistrationSchema.safeParse(validVolunteer);
      assert.ok(result.success, "Volunteer with skills & availability should succeed");
    });

    it("validates corporate registration with organization name", () => {
      const validCorporate = {
        name: "Daniel Addo",
        email: "daniel@gh-fintech.com",
        organization: "Ghana FinTech Labs",
        role: "CSR Director",
        type: "CORPORATE" as const,
        message: "Our company wishes to sponsor 10 children through our annual CSR budget.",
        agreementAccepted: true,
      };

      const result = brightenerRegistrationSchema.safeParse(validCorporate);
      assert.ok(result.success, "Corporate registration with organization should succeed");
    });

    it("validates general inquiry without requiring partnership type", () => {
      const validGeneral = {
        name: "Dr. Kwame Baah",
        email: "kwame.baah@research.edu.gh",
        phone: "+233555123456",
        inquiryType: "MEDIA" as const,
        subject: "Academic Research Interview on Street Youth Vulnerability",
        message:
          "Good afternoon, I am a sociologist at University of Ghana researching street children reintegration models. I would like to request an interview with your programme director.",
      };

      const result = generalInquirySchema.safeParse(validGeneral);
      assert.ok(result.success, "General inquiry should succeed");
    });

    it("rejects general inquiries with invalid email or missing message", () => {
      const invalidEmail = {
        name: "Test User",
        email: "not-an-email",
        inquiryType: "GENERAL" as const,
        subject: "Question",
        message: "This is long enough to meet min length requirement.",
      };
      assert.strictEqual(generalInquirySchema.safeParse(invalidEmail).success, false);

      const shortMessage = {
        name: "Test User",
        email: "test@example.com",
        inquiryType: "GENERAL" as const,
        subject: "Question",
        message: "Too short",
      };
      assert.strictEqual(generalInquirySchema.safeParse(shortMessage).success, false);
    });
  });

  describe("Server Actions & Persisted Separation", () => {
    it("submits a Brightener Registration and sets category to BRIGHTENER_REGISTRATION", async () => {
      const res = await submitBrightenerRegistration({
        name: "Akosua Boateng",
        email: "akosua.qa@livinghope-test.org",
        phone: "+233249998877",
        type: "VOLUNTEER",
        skills: "Health screening & nutrition",
        availability: "Weekends",
        message: "I am a registered pediatric nurse eager to volunteer in Accra.",
        agreementAccepted: true,
      });

      assert.strictEqual(res.success, true);
      assert.ok(res.referenceId, "Should return a referenceId");

      if (res.referenceId) {
        createdInquiryIds.push(res.referenceId);
        const record = await prisma.partnershipInquiry.findUnique({
          where: { id: res.referenceId },
        });

        assert.ok(record !== null, "Record should exist in database");
        assert.strictEqual(record?.category, "BRIGHTENER_REGISTRATION");
        assert.strictEqual(record?.type, "VOLUNTEER");
        assert.strictEqual(record?.skills, "Health screening & nutrition");
        assert.strictEqual(record?.status, "NEW");
      }
    });

    it("submits a General Inquiry and sets category to GENERAL_INQUIRY", async () => {
      const res = await submitGeneralInquiry({
        name: "Yaw Donkor",
        email: "yaw.donkor@livinghope-test.org",
        phone: "+233541112233",
        inquiryType: "SPONSORSHIP",
        subject: "Tax deductibility for European donors",
        message:
          "Hello, I am based in Germany and would like to know if donations through LivingHope qualify for EU tax exemption certificates. Thank you.",
      });

      assert.strictEqual(res.success, true);
      assert.ok(res.referenceId, "Should return a referenceId");

      if (res.referenceId) {
        createdInquiryIds.push(res.referenceId);
        const record = await prisma.partnershipInquiry.findUnique({
          where: { id: res.referenceId },
        });

        assert.ok(record !== null, "Record should exist in database");
        assert.strictEqual(record?.category, "GENERAL_INQUIRY");
        assert.strictEqual(record?.subject, "Tax deductibility for European donors");
        assert.strictEqual(record?.status, "NEW");
      }
    });

    it("silently drops spam honeypot submissions without writing to database", async () => {
      const beforeCount = await prisma.partnershipInquiry.count();

      const botRes = await submitGeneralInquiry({
        name: "Spam Bot",
        email: "spambot@seo-traffic-boost.com",
        inquiryType: "GENERAL",
        subject: "Cheap SEO ranking",
        message: "Buy backlinks now at discounted rates for your website ranking.",
        companyHoneypot: "http://spammy-bot-site.com", // honeypot filled
      });

      assert.strictEqual(botRes.success, true);
      const afterCount = await prisma.partnershipInquiry.count();
      assert.strictEqual(afterCount, beforeCount, "No database row should be created for honeypot bot");
    });
  });
});
