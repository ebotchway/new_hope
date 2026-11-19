import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeCsvField } from "@/lib/reports";
import { childSchema } from "@/lib/validations";
import * as proxyModule from "@/proxy";

test("Phase 10: Deep System Audit Verification", async (t) => {
  await t.test("Next.js 16 proxy export contract conforms to specification", () => {
    assert.ok(proxyModule.proxy, "proxy must be exported as a named function for Next.js 16");
    assert.ok(proxyModule.default, "default export must be present for backward compatibility");
    assert.ok(proxyModule.config?.matcher, "matcher config must be defined");
    assert.deepEqual(proxyModule.config.matcher, ["/admin", "/admin/:path*"]);
  });

  await t.test("childSchema reliably parses form data with boolean checkboxes", () => {
    const parsedNative = childSchema.safeParse({
      name: "Amara Boateng",
      gender: "FEMALE",
      bio: "Amara loves drawing and mathematics.",
      featured: true,
      archived: false,
      fundingGoalCents: 15000,
    });
    assert.equal(parsedNative.success, true);
    if (parsedNative.success) {
      assert.equal(parsedNative.data.featured, true);
      assert.equal(parsedNative.data.archived, false);
      assert.equal(parsedNative.data.fundingGoalCents, 15000);
    }
  });

  await t.test("CSV sanitization neutralizes formula injection attempts", () => {
    assert.equal(sanitizeCsvField("=SUM(A1:A10)"), "'=SUM(A1:A10)");
    assert.equal(sanitizeCsvField("+1234567890"), "'+1234567890");
    assert.equal(sanitizeCsvField("-500"), "'-500");
    assert.equal(sanitizeCsvField("@cmd"), "'@cmd");
    assert.equal(sanitizeCsvField("Clean Company Ltd"), "Clean Company Ltd");
    assert.equal(sanitizeCsvField('Name with "quotes" and, commas'), '"Name with ""quotes"" and, commas"');
  });
});
