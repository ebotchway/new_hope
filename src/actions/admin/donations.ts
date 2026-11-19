"use server";

import { revalidatePath } from "next/cache";
import { requireStaff, requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { finalizeSuccessfulDonation } from "@/lib/donation-fulfillment";
import { getStripeClient } from "@/lib/stripe";
import type { ActionResult } from "@/actions/inquiries";

/** Manual reconciliation for Mobile Money donations: staff confirm the transfer landed. */
export async function markMobileMoneyDonationReceived(id: string): Promise<ActionResult> {
  const session = await requireStaff();

  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) return { success: false, error: "Donation not found" };
  if (donation.paymentMethod !== "MOBILE_MONEY") {
    return { success: false, error: "Only Mobile Money donations can be confirmed this way" };
  }
  if (donation.status !== "PENDING") {
    return { success: false, error: `This donation is already marked as ${donation.status.toLowerCase()}` };
  }

  // Record audit info
  await prisma.donation.update({
    where: { id },
    data: {
      momoVerifiedAt: new Date(),
      momoVerifiedBy: session.user.name ?? session.user.email ?? "Staff",
    },
  });

  await finalizeSuccessfulDonation(id);

  revalidatePath("/admin/donations");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}

/** Reject a Mobile Money donation that was never received or invalid */
export async function rejectMobileMoneyDonation(id: string, reason?: string): Promise<ActionResult> {
  await requireStaff();

  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) return { success: false, error: "Donation not found" };
  if (donation.paymentMethod !== "MOBILE_MONEY") {
    return { success: false, error: "Only Mobile Money donations can be rejected this way" };
  }
  if (donation.status !== "PENDING") {
    return { success: false, error: `Cannot reject a donation that is already ${donation.status.toLowerCase()}` };
  }

  await prisma.donation.update({
    where: { id },
    data: {
      status: "FAILED",
      momoRejectionReason: reason || "Transfer not found or unmatched reference",
    },
  });

  revalidatePath("/admin/donations");
  revalidatePath("/admin");
  return { success: true };
}

/** Issue a refund for a donation (requires Admin role) */
export async function refundDonation(id: string): Promise<ActionResult> {
  await requireAdmin();

  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) return { success: false, error: "Donation not found" };
  if (donation.status !== "SUCCEEDED") {
    return { success: false, error: "Only succeeded donations can be refunded" };
  }

  // If paid via Stripe and has payment intent (or invoice), issue Stripe refund
  if (donation.paymentMethod === "CARD") {
    let paymentIntentId = donation.stripePaymentIntentId;

    try {
      const stripeClient = await getStripeClient();

      if (!paymentIntentId && donation.stripeInvoiceId) {
        try {
          const inv = await stripeClient.invoices.retrieve(donation.stripeInvoiceId);
          const invRaw = inv as unknown as { payment_intent?: string | { id?: string } };
          if (typeof invRaw.payment_intent === "string") {
            paymentIntentId = invRaw.payment_intent;
          } else if (invRaw.payment_intent && typeof invRaw.payment_intent === "object" && "id" in invRaw.payment_intent) {
            paymentIntentId = (invRaw.payment_intent as { id: string }).id;
          }
        } catch (invErr) {
          console.warn("Could not retrieve Stripe invoice for refund:", invErr);
        }
      }

      if (paymentIntentId) {
        await stripeClient.refunds.create({
          payment_intent: paymentIntentId,
          reason: "requested_by_customer",
        });
      }
    } catch (stripeErr: unknown) {
      console.error("Stripe refund call failed:", stripeErr);
      return { success: false, error: "Stripe refund failed. Please inspect Stripe dashboard." };
    }
  }

  await prisma.donation.update({
    where: { id },
    data: { status: "REFUNDED" },
  });

  revalidatePath("/admin/donations");
  revalidatePath("/admin");
  revalidatePath("/");
  return { success: true };
}
