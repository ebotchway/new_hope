import { prisma } from "@/lib/prisma";
import { sendDonationReceipt } from "@/lib/email";

/**
 * Shared "a donation just succeeded" side effects:
 * - Update donation status atomically
 * - Create or activate sponsorship (for registered users or guest donors)
 * - Update child status to SPONSORED when fully sponsored
 * - Send receipt email in an isolated try/catch so email failures never break financial state
 *
 * Used by Stripe webhooks, manual Mobile Money reconciliation, and checkout fulfillment.
 */
export async function finalizeSuccessfulDonation(
  donationId: string,
  stripeFields?: {
    stripePaymentIntentId?: string;
    stripeSubscriptionId?: string;
    stripeCustomerId?: string;
    stripeInvoiceId?: string;
  }
) {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { child: true },
  });

  if (!donation) {
    throw new Error(`Donation not found: ${donationId}`);
  }

  // Already succeeded — guarantee idempotency
  if (donation.status === "SUCCEEDED") {
    return donation;
  }

  // Atomic update
  const updatedDonation = await prisma.donation.update({
    where: { id: donationId },
    data: {
      status: "SUCCEEDED",
      ...(stripeFields?.stripePaymentIntentId
        ? { stripePaymentIntentId: stripeFields.stripePaymentIntentId }
        : {}),
      ...(stripeFields?.stripeSubscriptionId
        ? { stripeSubscriptionId: stripeFields.stripeSubscriptionId }
        : {}),
      ...(stripeFields?.stripeCustomerId
        ? { stripeCustomerId: stripeFields.stripeCustomerId }
        : {}),
      ...(stripeFields?.stripeInvoiceId
        ? { stripeInvoiceId: stripeFields.stripeInvoiceId }
        : {}),
    },
  });

  // Handle Child Sponsorship
  if (donation.designation === "CHILD_SPONSORSHIP" && donation.childId) {
    const subscriptionId = stripeFields?.stripeSubscriptionId ?? donation.stripeSubscriptionId;

    // Check if a sponsorship with this subscription ID already exists (idempotency)
    const existingBySub = subscriptionId
      ? await prisma.sponsorship.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        })
      : null;

    if (!existingBySub) {
      // Check if user already has an active sponsorship for this child
      const existingActive = donation.userId
        ? await prisma.sponsorship.findFirst({
            where: {
              userId: donation.userId,
              childId: donation.childId,
              status: "ACTIVE",
            },
          })
        : null;

      if (!existingActive) {
        await prisma.sponsorship.create({
          data: {
            userId: donation.userId ?? null,
            childId: donation.childId,
            guestName: donation.userId ? null : donation.donorName,
            guestEmail: donation.userId ? null : donation.donorEmail,
            guestPhone: donation.userId ? null : donation.donorPhone,
            type: donation.frequency === "MONTHLY" ? "FULL" : "CONTRIBUTION",
            status: "ACTIVE",
            monthlyAmountCents: donation.frequency === "MONTHLY" ? donation.amountCents : 0,
            stripeSubscriptionId: subscriptionId ?? null,
          },
        });
      }
    }

    // Determine whether child should transition to SPONSORED status:
    // 1. Monthly recurring sponsorship fully sponsors the child.
    // 2. Or if fundingGoalCents > 0, cumulative gifts meet or exceed the goal.
    let shouldMarkSponsored = donation.frequency === "MONTHLY";

    if (!shouldMarkSponsored && donation.child?.fundingGoalCents && donation.child.fundingGoalCents > 0) {
      const aggregate = await prisma.donation.aggregate({
        where: {
          childId: donation.childId,
          status: "SUCCEEDED",
          designation: "CHILD_SPONSORSHIP",
        },
        _sum: { amountCents: true },
      });
      const totalRaised = aggregate._sum.amountCents ?? 0;
      if (totalRaised >= donation.child.fundingGoalCents) {
        shouldMarkSponsored = true;
      }
    }

    if (shouldMarkSponsored) {
      await prisma.child.update({
        where: { id: donation.childId },
        data: { status: "SPONSORED" },
      });
    }
  }

  // Send donation receipt (isolated failure boundary)
  if (!updatedDonation.receiptSentAt) {
    try {
      await sendDonationReceipt({
        to: donation.donorEmail,
        donorName: donation.donorName,
        amountCents: donation.amountCents,
        currency: donation.currency,
        frequency: donation.frequency,
        designation: donation.designation,
      });

      await prisma.donation.update({
        where: { id: donationId },
        data: { receiptSentAt: new Date() },
      });
    } catch (emailError) {
      // Log error but do not fail the financial transaction
      console.error(
        `Failed to send donation receipt email for donation ${donationId}:`,
        emailError
      );
    }
  }

  return updatedDonation;
}
