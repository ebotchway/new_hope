import test from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../prisma";

test("Financial & Sponsorship Regression Suite", async (t) => {
  const testSubId = `sub_test_${Date.now()}`;
  const invoice1 = `in_test_1_${Date.now()}`;
  const invoice2 = `in_test_2_${Date.now()}`;
  let childId = "";
  let sponsorshipId = "";
  let donation1Id = "";
  let donation2Id = "";

  await t.test("Setup: Create Test Child", async () => {
    const child = await prisma.child.create({
      data: {
        name: `Test Child ${Date.now()}`,
        slug: `test-child-${Date.now()}`,
        gender: "MALE",
        bio: "Test child for regression testing",
        status: "AVAILABLE",
      },
    });
    childId = child.id;
    assert.ok(child.id);
  });

  await t.test("1. Stripe Recurring Donations - Multi-Invoice & Unique Invoices", async () => {
    // Initial donation on subscription
    const donation1 = await prisma.donation.create({
      data: {
        amountCents: 4500,
        currency: "usd",
        frequency: "MONTHLY",
        designation: "CHILD_SPONSORSHIP",
        status: "SUCCEEDED",
        paymentMethod: "CARD",
        stripeSubscriptionId: testSubId,
        stripeInvoiceId: invoice1,
        donorName: "Generous Donor",
        donorEmail: "donor1@example.com",
        childId,
      },
    });
    donation1Id = donation1.id;
    assert.equal(donation1.stripeSubscriptionId, testSubId);
    assert.equal(donation1.stripeInvoiceId, invoice1);

    // Renewal donation on the SAME subscription (must not violate unique constraints!)
    const donation2 = await prisma.donation.create({
      data: {
        amountCents: 4500,
        currency: "usd",
        frequency: "MONTHLY",
        designation: "CHILD_SPONSORSHIP",
        status: "SUCCEEDED",
        paymentMethod: "CARD",
        stripeSubscriptionId: testSubId, // Same subscription ID
        stripeInvoiceId: invoice2,       // Unique invoice ID
        donorName: "Generous Donor",
        donorEmail: "donor1@example.com",
        childId,
      },
    });
    donation2Id = donation2.id;
    assert.equal(donation2.stripeSubscriptionId, testSubId);
    assert.equal(donation2.stripeInvoiceId, invoice2);

    // Verify both donations are linked to same subscription
    const count = await prisma.donation.count({
      where: { stripeSubscriptionId: testSubId },
    });
    assert.equal(count, 2, "Both renewal donations must exist under the same subscription");

    // Idempotency: Attempting to insert duplicate invoice must be rejected by unique constraint
    let duplicateRejected = false;
    try {
      await prisma.donation.create({
        data: {
          amountCents: 4500,
          currency: "usd",
          frequency: "MONTHLY",
          designation: "CHILD_SPONSORSHIP",
          status: "SUCCEEDED",
          paymentMethod: "CARD",
          stripeSubscriptionId: testSubId,
          stripeInvoiceId: invoice1, // Duplicate invoice ID
          donorName: "Generous Donor",
          donorEmail: "donor1@example.com",
        },
      });
    } catch {
      duplicateRejected = true;
    }
    assert.equal(duplicateRejected, true, "Duplicate stripeInvoiceId must be blocked by database unique constraint");
  });

  await t.test("2. MoMo Dual Currency & Reconciliation Integrity", async () => {
    const exchangeRate = 15.5; // 1 USD = 15.50 GHS
    const usdAmountCents = 5000; // $50.00
    const ghsAmountCents = Math.round(usdAmountCents * exchangeRate); // 775.00 GHS

    const momoDonation = await prisma.donation.create({
      data: {
        amountCents: usdAmountCents,
        currency: "usd",
        amountGhsCents: ghsAmountCents,
        exchangeRate: exchangeRate,
        frequency: "ONE_TIME",
        designation: "GENERAL",
        status: "PENDING",
        paymentMethod: "MOBILE_MONEY",
        momoReference: `LH-${Date.now().toString(36).toUpperCase()}`,
        donorName: "Kofi Mensah",
        donorEmail: "momo_donor@example.com",
        donorPhone: "0241234567",
      },
    });

    assert.equal(momoDonation.status, "PENDING");
    assert.equal(momoDonation.amountGhsCents, 77500);

    // Admin confirmation transition to SUCCEEDED
    const confirmedDonation = await prisma.donation.update({
      where: { id: momoDonation.id },
      data: {
        status: "SUCCEEDED",
        momoVerifiedAt: new Date(),
        momoVerifiedBy: "admin@livinghope.org",
      },
    });
    assert.equal(confirmedDonation.status, "SUCCEEDED");
    assert.ok(confirmedDonation.momoVerifiedAt !== null);

    // Clean up momo donation
    await prisma.donation.delete({ where: { id: momoDonation.id } });
  });

  await t.test("3. Child Sponsorship Cascade Protection", async () => {
    // Create an active sponsorship for the child
    const sponsorship = await prisma.sponsorship.create({
      data: {
        childId,
        status: "ACTIVE",
        type: "FULL",
        monthlyAmountCents: 4500,
        stripeSubscriptionId: testSubId,
      },
    });
    sponsorshipId = sponsorship.id;

    // Deleting the child directly must fail due to foreign key RESTRICT on Sponsorship
    let deleteBlocked = false;
    try {
      await prisma.child.delete({ where: { id: childId } });
    } catch {
      deleteBlocked = true;
    }
    assert.equal(deleteBlocked, true, "Foreign key RESTRICT constraint must prevent deleting child with active sponsorship");

    // Soft-archiving must succeed without affecting financial audit trail
    const archivedChild = await prisma.child.update({
      where: { id: childId },
      data: { archived: true },
    });
    assert.equal(archivedChild.archived, true);
  });

  // Cleanup test records in correct order
  if (sponsorshipId) {
    await prisma.sponsorship.delete({ where: { id: sponsorshipId } });
  }
  await prisma.donation.deleteMany({
    where: { id: { in: [donation1Id, donation2Id] } },
  });
  if (childId) {
    await prisma.child.delete({ where: { id: childId } });
  }
});

test.after(async () => {
  await prisma.$disconnect();
  setTimeout(() => process.exit(0), 100).unref();
});
