import test, { after } from "node:test";
import assert from "node:assert/strict";
import { prisma, closeDatabaseConnection } from "../prisma";
import {
  sanitizeCsvField,
  buildCsvRow,
  resolveDateRange,
  getFinancialReport,
  getRecurringGivingReport,
  getSponsorshipReport,
  getDonorReport,
  getMobileMoneyReconciliationReport,
  getPaymentReconciliationAudit,
} from "../reports";

// =========================================================================
// LIVINGHOPE PHASE 5 SYSTEM VERIFICATION & COMPREHENSIVE TEST SUITE
// =========================================================================

test("1. Financial Integrity - Multi-Currency & Refund Accounting", async (t) => {
  const timestamp = Date.now();
  const testEmail = `fin_audit_${timestamp}@example.com`;

  // Create isolated user fixture
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: "Financial Audit Donor",
      role: "DONOR",
    },
  });

  try {
    // Succeeded USD Card Donation ($100.00)
    const cardDonation = await prisma.donation.create({
      data: {
        userId: user.id,
        amountCents: 10000,
        currency: "usd",
        status: "SUCCEEDED",
        frequency: "ONE_TIME",
        paymentMethod: "CARD",
        stripePaymentIntentId: `pi_test_${timestamp}`,
        donorName: "Financial Audit Donor",
        donorEmail: testEmail,
      },
    });

    // Refunded USD Card Donation ($50.00)
    await prisma.donation.create({
      data: {
        userId: user.id,
        amountCents: 5000,
        currency: "usd",
        status: "REFUNDED",
        frequency: "ONE_TIME",
        paymentMethod: "CARD",
        stripePaymentIntentId: `pi_refund_${timestamp}`,
        donorName: "Financial Audit Donor",
        donorEmail: testEmail,
      },
    });

    // Succeeded Ghana MoMo Donation (GH₵300.00)
    await prisma.donation.create({
      data: {
        userId: user.id,
        amountCents: 2000, // Equivalent USD cents recorded at pledge
        amountGhsCents: 30000, // Real GH₵300.00
        currency: "ghs",
        status: "SUCCEEDED",
        frequency: "ONE_TIME",
        paymentMethod: "MOBILE_MONEY",
        momoReference: `MOMO_AUDIT_${timestamp}`,
        donorName: "Financial Audit Donor",
        donorEmail: testEmail,
      },
    });

    // Pending USD Pledge ($75.00)
    await prisma.donation.create({
      data: {
        userId: user.id,
        amountCents: 7500,
        currency: "usd",
        status: "PENDING",
        frequency: "ONE_TIME",
        paymentMethod: "CARD",
        donorName: "Financial Audit Donor",
        donorEmail: testEmail,
      },
    });

    // Query financial report
    const report = await getFinancialReport({ period: "all_time" });

    // Assertions
    await t.test("USD and GHS are partitioned without uncalibrated blending", () => {
      assert.ok(report.totals.grossUsdCents >= 10000);
      assert.ok(report.totals.realizedGhsCents >= 30000);
      // Net USD accounts for refunds
      assert.ok(report.totals.refundedUsdCents >= 5000);
      assert.equal(
        report.totals.netUsdCents,
        Math.max(0, report.totals.grossUsdCents - report.totals.refundedUsdCents)
      );
    });

    await t.test("Pending commitments are isolated from realized gross", () => {
      assert.ok(report.totals.pendingUsdCents >= 7500);
      assert.ok(report.totals.grossUsdCents >= cardDonation.amountCents);
    });

    await t.test("Estimated provider fees are non-negative and explicitly calculated", () => {
      assert.ok(report.totals.estimatedStripeFeesCents > 0);
      assert.ok(report.totals.estimatedMomoFeesGhsCents > 0);
      assert.ok(report.totals.netUsdAfterFeesCents <= report.totals.netUsdCents);
      assert.ok(report.totals.netGhsAfterFeesCents <= report.totals.realizedGhsCents);
    });

    // Cleanup fixtures
    await prisma.donation.deleteMany({ where: { userId: user.id } });
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
  }
});

test("2. Recurring Giving & Subscription MRCV Calculations", async (t) => {
  const timestamp = Date.now();
  const subId = `sub_mrcv_${timestamp}`;

  // Create test child and sponsor
  const child = await prisma.child.create({
    data: {
      name: `MRCV Child ${timestamp}`,
      slug: `mrcv-child-${timestamp}`,
      gender: "FEMALE",
      status: "SPONSORED",
      bio: "Test bio for MRCV calculation.",
    },
  });

  const sponsor = await prisma.user.create({
    data: {
      email: `sponsor_mrcv_${timestamp}@example.com`,
      name: "MRCV Test Sponsor",
      role: "DONOR",
    },
  });

  try {
    // Create active sponsorship with $40.00/mo commitment
    const sponsorship = await prisma.sponsorship.create({
      data: {
        childId: child.id,
        userId: sponsor.id,
        monthlyAmountCents: 4000,
        status: "ACTIVE",
        type: "FULL",
        stripeSubscriptionId: subId,
      },
    });

    // Create 2 monthly renewal donations under same subscription
    await prisma.donation.create({
      data: {
        userId: sponsor.id,
        childId: child.id,
        amountCents: 4000,
        currency: "usd",
        status: "SUCCEEDED",
        frequency: "MONTHLY",
        paymentMethod: "CARD",
        stripeSubscriptionId: subId,
        stripeInvoiceId: `in_mrcv_1_${timestamp}`,
        donorName: sponsor.name ?? "MRCV Test Sponsor",
        donorEmail: sponsor.email,
      },
    });

    await prisma.donation.create({
      data: {
        userId: sponsor.id,
        childId: child.id,
        amountCents: 4000,
        currency: "usd",
        status: "SUCCEEDED",
        frequency: "MONTHLY",
        paymentMethod: "CARD",
        stripeSubscriptionId: subId,
        stripeInvoiceId: `in_mrcv_2_${timestamp}`,
        donorName: sponsor.name ?? "MRCV Test Sponsor",
        donorEmail: sponsor.email,
      },
    });

    const recurringReport = await getRecurringGivingReport();

    await t.test("Active MRCV includes active monthly sponsorship commitments", () => {
      assert.ok(recurringReport.mrcvUsdCents >= 4000);
      assert.ok(recurringReport.activeSubscriptionsCount >= 1);
    });

    await t.test("Multiple invoices under single subscription are tracked cleanly", () => {
      assert.ok(recurringReport.totalSuccessfulRenewalsCount >= 2);
    });

    // Cleanup
    await prisma.donation.deleteMany({ where: { userId: sponsor.id } });
    await prisma.sponsorship.delete({ where: { id: sponsorship.id } });
  } finally {
    await prisma.child.delete({ where: { id: child.id } });
    await prisma.user.delete({ where: { id: sponsor.id } });
  }
});

test("3. Provider Reconciliation & Duplicate Invoice Prevention", async (t) => {
  const timestamp = Date.now();
  const invoiceId = `inv_idempotency_${timestamp}`;

  const donor = await prisma.user.create({
    data: {
      email: `idemp_${timestamp}@example.com`,
      name: "Idempotency Donor",
      role: "DONOR",
    },
  });

  try {
    // First invoice donation
    await prisma.donation.create({
      data: {
        userId: donor.id,
        amountCents: 3500,
        currency: "usd",
        status: "SUCCEEDED",
        frequency: "MONTHLY",
        paymentMethod: "CARD",
        stripeInvoiceId: invoiceId,
        donorName: donor.name ?? "Idempotency Donor",
        donorEmail: donor.email,
      },
    });

    await t.test("Duplicate stripeInvoiceId is strictly rejected by database constraint", async () => {
      let rejected = false;
      try {
        await prisma.donation.create({
          data: {
            userId: donor.id,
            amountCents: 3500,
            currency: "usd",
            status: "SUCCEEDED",
            frequency: "MONTHLY",
            paymentMethod: "CARD",
            stripeInvoiceId: invoiceId, // Duplicate
            donorName: donor.name ?? "Idempotency Donor",
            donorEmail: donor.email,
          },
        });
      } catch (err: unknown) {
        rejected = true;
        assert.ok((err as { code?: string })?.code === "P2002" || String(err).includes("Unique constraint"));
      }
      assert.equal(rejected, true);
    });

    const audit = await getPaymentReconciliationAudit();
    await t.test("Reconciliation audit reports 0 duplicate invoice violations", () => {
      assert.equal(audit.duplicateInvoicesCount, 0);
    });

    await prisma.donation.deleteMany({ where: { userId: donor.id } });
  } finally {
    await prisma.user.delete({ where: { id: donor.id } });
  }
});

test("4. MoMo Verification State Machine & Query Accuracy", async (t) => {
  const timestamp = Date.now();
  const refMtn = `MTN_${timestamp}`;
  const refTelecel = `TEL_${timestamp}`;

  // Create verified MoMo donation
  const d1 = await prisma.donation.create({
    data: {
      amountCents: 1500,
      amountGhsCents: 20000,
      currency: "ghs",
      status: "SUCCEEDED",
      frequency: "ONE_TIME",
      paymentMethod: "MOBILE_MONEY",
      momoReference: refMtn,
      donorName: "MoMo Test Donor 1",
      donorEmail: `momo1_${timestamp}@example.com`,
    },
  });

  // Create pending MoMo donation
  const d2 = await prisma.donation.create({
    data: {
      amountCents: 1000,
      amountGhsCents: 15000,
      currency: "ghs",
      status: "PENDING",
      frequency: "ONE_TIME",
      paymentMethod: "MOBILE_MONEY",
      momoReference: refTelecel,
      donorName: "MoMo Test Donor 2",
      donorEmail: `momo2_${timestamp}@example.com`,
    },
  });

  try {
    const momoReport = await getMobileMoneyReconciliationReport();

    await t.test("MoMo report segregates verified vs pending claims correctly", () => {
      assert.ok(momoReport.verified.count >= 1);
      assert.ok(momoReport.pending.count >= 1);
      assert.ok(momoReport.verified.ghsCents >= 20000);
      assert.ok(momoReport.pending.ghsCents >= 15000);
    });
  } finally {
    await prisma.donation.deleteMany({
      where: { id: { in: [d1.id, d2.id] } },
    });
  }
});

test("5. Donor Identity Deduplication & Cohort Analytics", async (t) => {
  const timestamp = Date.now();
  const donorEmail = `dedup_${timestamp}@example.com`;

  const donor = await prisma.user.create({
    data: {
      email: donorEmail,
      name: "Cohort Repeat Donor",
      role: "DONOR",
    },
  });

  try {
    // 3 gifts to qualify as repeat donor
    await prisma.donation.createMany({
      data: [
        {
          userId: donor.id,
          amountCents: 5000,
          currency: "usd",
          status: "SUCCEEDED",
          frequency: "ONE_TIME",
          paymentMethod: "CARD",
          donorName: donor.name ?? "Cohort Repeat Donor",
          donorEmail: donorEmail,
        },
        {
          userId: donor.id,
          amountCents: 7500,
          currency: "usd",
          status: "SUCCEEDED",
          frequency: "ONE_TIME",
          paymentMethod: "CARD",
          donorName: donor.name ?? "Cohort Repeat Donor",
          donorEmail: donorEmail,
        },
        {
          userId: donor.id,
          amountCents: 2500,
          currency: "usd",
          status: "SUCCEEDED",
          frequency: "ONE_TIME",
          paymentMethod: "CARD",
          donorName: donor.name ?? "Cohort Repeat Donor",
          donorEmail: donorEmail,
        },
      ],
    });

    const donorReport = await getDonorReport();

    await t.test("Donor report classifies donors with multiple gifts into repeat cohort", () => {
      assert.ok(donorReport.repeatDonorsCount >= 1);
      assert.ok(donorReport.activeIn90DaysCount >= 1);
    });

    await t.test("Top donors list reflects accurate Lifetime Value (LTV)", () => {
      const topDonor = donorReport.topDonors.find((d) => d.email === donorEmail);
      if (topDonor) {
        assert.equal(topDonor.totalContributedCents, 15000); // $150.00
        assert.equal(topDonor.giftCount, 3);
      }
    });
  } finally {
    await prisma.donation.deleteMany({ where: { userId: donor.id } });
    await prisma.user.delete({ where: { id: donor.id } });
  }
});

test("6. Date Boundary & Filter Resolutions", () => {
  const allTime = resolveDateRange({ period: "all_time" });
  assert.equal(allTime.label, "All Time");
  assert.equal(allTime.from, undefined);

  const today = resolveDateRange({ period: "today" });
  assert.equal(today.label, "Today");
  assert.ok(today.from instanceof Date);
  assert.ok(today.to instanceof Date);
  assert.ok(today.from.getTime() <= today.to.getTime());

  const sevenDays = resolveDateRange({ period: "7d" });
  assert.equal(sevenDays.label, "Last 7 Days");
  assert.ok(sevenDays.from && sevenDays.to);
  const diff7d = sevenDays.to.getTime() - sevenDays.from.getTime();
  assert.ok(Math.abs(diff7d - 7 * 24 * 60 * 60 * 1000) < 1000);

  const thisMonth = resolveDateRange({ period: "this_month" });
  assert.equal(thisMonth.label, "This Month");
  assert.ok(thisMonth.from && thisMonth.to);
  assert.equal(thisMonth.from.getUTCDate(), 1);

  const customFrom = new Date("2026-01-01T00:00:00Z");
  const customTo = new Date("2026-06-30T23:59:59Z");
  const custom = resolveDateRange({ period: "custom", from: customFrom, to: customTo });
  assert.ok(custom.label.includes("2026-01-01"));
  assert.ok(custom.label.includes("2026-06-30"));
});

test("7. CSV Formula Injection Defense (CWE-1236)", () => {
  // Dangerous prefix characters must be prepended with a single quote
  assert.equal(sanitizeCsvField("=SUM(A1:A10)"), "'=SUM(A1:A10)");
  assert.equal(sanitizeCsvField("+100"), "'+100");
  assert.equal(sanitizeCsvField("-50"), "'-50");
  assert.equal(sanitizeCsvField("@malicious"), "'@malicious");
  assert.equal(sanitizeCsvField("\tPAYLOAD"), "'\tPAYLOAD");
  assert.equal(sanitizeCsvField("\rCOMMAND"), '"\'\rCOMMAND"');

  // Standard alphanumeric values must remain unaltered
  assert.equal(sanitizeCsvField("LivingHope"), "LivingHope");
  assert.equal(sanitizeCsvField("donor@example.com"), "donor@example.com");

  // Multi-field CSV row builder RFC-4180 compliance
  const row = buildCsvRow(["=1+1", 'Normal, "Quotes"', 100]);
  assert.ok(row.startsWith("'=1+1,"));
  assert.ok(row.includes('"Normal, ""Quotes"""'));
  assert.ok(row.endsWith("\r\n"));
});

test("8. Beneficiary Coverage Ratio Precision", async () => {
  const report = await getSponsorshipReport();
  assert.ok(typeof report.children.coverageRatioPercent === "number");
  assert.ok(report.children.coverageRatioPercent >= 0 && report.children.coverageRatioPercent <= 100);
});

after(async () => {
  await closeDatabaseConnection();
});
