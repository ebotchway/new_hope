import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../prisma";
import {
  sanitizeCsvField,
  buildCsvRow,
  resolveDateRange,
  getFinancialReport,
  getExecutiveReportingOverview,
  getSponsorshipReport,
  getDonorReport,
  getMobileMoneyReconciliationReport,
  getPaymentReconciliationAudit,
} from "../reports";

test("CSV Formula Injection Protection (CWE-1236)", () => {
  // Dangerous characters must be prefixed with single quote (')
  assert.equal(sanitizeCsvField("=1+2"), "'=1+2");
  assert.equal(sanitizeCsvField("=cmd|' /C calc'!A0"), "'=cmd|' /C calc'!A0");
  assert.equal(sanitizeCsvField("+12345"), "'+12345");
  assert.equal(sanitizeCsvField("-500"), "'-500");
  assert.equal(sanitizeCsvField("@SUM(A1:A10)"), "'@SUM(A1:A10)");
  assert.equal(sanitizeCsvField("\tTabInjected"), "'\tTabInjected");
  assert.equal(sanitizeCsvField("\rReturnInjected"), '"\'\rReturnInjected"');

  // Safe strings and numbers must remain unaltered
  assert.equal(sanitizeCsvField("LivingHope Charity"), "LivingHope Charity");
  assert.equal(sanitizeCsvField("donor@example.com"), "donor@example.com");
  assert.equal(sanitizeCsvField(45.5), "45.5");

  // Quoting for commas and double quotes
  assert.equal(sanitizeCsvField('Accra, "Ghana"'), '"Accra, ""Ghana"""');

  // Row builder formatting
  const row = buildCsvRow(["=SUM(B1:B2)", "Safe Name", 100]);
  assert.equal(row, "'=SUM(B1:B2),Safe Name,100\r\n");
});

test("Reporting Period Date Resolvers", () => {
  // All time returns undefined bounds
  const allTime = resolveDateRange({ period: "all_time" });
  assert.equal(allTime.from, undefined);
  assert.equal(allTime.to, undefined);
  assert.equal(allTime.label, "All Time");

  // 7 days resolver
  const sevenDays = resolveDateRange({ period: "7d" });
  assert.ok(sevenDays.from instanceof Date);
  assert.ok(sevenDays.to instanceof Date);
  assert.ok(sevenDays.from < sevenDays.to);

  // 30 days resolver
  const thirtyDays = resolveDateRange({ period: "30d" });
  assert.ok(thirtyDays.from instanceof Date);
  assert.ok(thirtyDays.to instanceof Date);
  assert.ok(thirtyDays.from < thirtyDays.to);

  // This month resolver
  const thisMonth = resolveDateRange({ period: "this_month" });
  assert.ok(thisMonth.from instanceof Date);
  assert.equal(thisMonth.from.getUTCDate(), 1);

  // Custom date range
  const customFrom = new Date("2026-01-01T00:00:00Z");
  const customTo = new Date("2026-06-30T23:59:59Z");
  const customRange = resolveDateRange({ period: "custom", from: customFrom, to: customTo });
  assert.equal(customRange.from?.toISOString(), customFrom.toISOString());
  assert.equal(customRange.to?.toISOString(), customTo.toISOString());
});

test("Financial Report Aggregation Integrity", async (t) => {
  let testChildId = "";
  let testDonationId = "";

  await t.test("Setup: Create Test Child & Donation Fixture", async () => {
    const child = await prisma.child.create({
      data: {
        name: `Reporting Test Child ${Date.now()}`,
        slug: `rep-child-${Date.now()}`,
        gender: "FEMALE",
        bio: "Test child for reporting aggregate checks",
        status: "AVAILABLE",
      },
    });
    testChildId = child.id;

    const donation = await prisma.donation.create({
      data: {
        amountCents: 15000, // $150.00
        currency: "usd",
        frequency: "ONE_TIME",
        designation: "GENERAL",
        status: "SUCCEEDED",
        paymentMethod: "CARD",
        donorName: "Dr. Jane Smith",
        donorEmail: "jane.smith@example.org",
        childId: testChildId,
      },
    });
    testDonationId = donation.id;
    assert.ok(donation.id);
  });

  await t.test("Verify Financial Totals Calculation", async () => {
    const report = await getFinancialReport({ period: "all_time" });
    assert.ok(report.totals.grossUsdCents >= 15000);
    assert.ok(report.totals.netUsdCents >= 15000);
    assert.ok(report.totals.estimatedStripeFeesCents >= 0);
    assert.ok(report.counts.succeeded >= 1);
  });

  await t.test("Verify Executive Overview Metrics", async () => {
    const overview = await getExecutiveReportingOverview();
    assert.ok(overview.realizedUsdCents >= 15000);
    assert.ok(overview.realizedCount >= 1);
    assert.ok(overview.velocityChart.length === 30);
  });

  await t.test("Verify Sponsorship & Beneficiary Roster Integration", async () => {
    const spReport = await getSponsorshipReport();
    assert.ok(spReport.children.total >= 1);
    assert.ok(spReport.children.available >= 1);
    assert.ok(typeof spReport.children.coverageRatioPercent === "number");
  });

  await t.test("Verify Donor Cohort Analytics", async () => {
    const donorReport = await getDonorReport();
    assert.ok(donorReport.totalDistinctDonors >= 1);
    assert.ok(typeof donorReport.repeatDonorRatePercent === "number");
    assert.ok(donorReport.tiers.regular100to499 >= 1); // Our $150 donation is in regular tier
  });

  await t.test("Verify MoMo Reconciliation Query", async () => {
    const momoReport = await getMobileMoneyReconciliationReport();
    assert.ok(typeof momoReport.pending.count === "number");
    assert.ok(typeof momoReport.verified.count === "number");
    assert.ok(Array.isArray(momoReport.records));
  });

  await t.test("Verify Payment Reconciliation Audit", async () => {
    const audit = await getPaymentReconciliationAudit();
    assert.ok(audit.totalCardDonations >= 1);
    assert.equal(audit.duplicateInvoicesCount, 0); // Must be zero
    assert.ok(Array.isArray(audit.ledger));
  });

  // Cleanup fixtures
  await prisma.donation.delete({ where: { id: testDonationId } });
  await prisma.child.delete({ where: { id: testChildId } });
});

test.after(async () => {
  await prisma.$disconnect();
  setTimeout(() => process.exit(0), 100).unref();
});
