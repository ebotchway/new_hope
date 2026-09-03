import { prisma } from "@/lib/prisma";
import { sendDonationReceipt } from "@/lib/email";

/**
 * Shared "a donation just succeeded" side effects: create/activate a sponsorship when
 * applicable, mark the child sponsored, and send the receipt once. Used by both the Stripe
 * webhook and the admin's manual Mobile Money reconciliation so the two payment paths stay
 * behaviorally identical.
 */
export async function finalizeSuccessfulDonation(
  donationId: string,
  stripeFields?: {
    stripePaymentIntentId?: string;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
  }
) {
  const donation = await prisma.donation.update({
    where: { id: donationId },
    data: { status: "SUCCEEDED", ...stripeFields },
  });

  if (donation.designation === "CHILD_SPONSORSHIP" && donation.childId && donation.userId) {
    const existing = await prisma.sponsorship.findFirst({
      where: { userId: donation.userId, childId: donation.childId, status: "ACTIVE" },
    });
    if (!existing) {
      await prisma.sponsorship.create({
        data: {
          userId: donation.userId,
          childId: donation.childId,
          type: donation.frequency === "MONTHLY" ? "FULL" : "CONTRIBUTION",
          status: "ACTIVE",
          monthlyAmountCents: donation.frequency === "MONTHLY" ? donation.amountCents : 0,
          stripeSubscriptionId: stripeFields?.stripeSubscriptionId,
        },
      });
    }
    await prisma.child.update({ where: { id: donation.childId }, data: { status: "SPONSORED" } });
  }

  if (!donation.receiptSentAt) {
    await sendDonationReceipt({
      to: donation.donorEmail,
      donorName: donation.donorName,
      amountCents: donation.amountCents,
      currency: donation.currency,
      frequency: donation.frequency,
      designation: donation.designation,
    });
    await prisma.donation.update({ where: { id: donation.id }, data: { receiptSentAt: new Date() } });
  }

  return donation;
}
