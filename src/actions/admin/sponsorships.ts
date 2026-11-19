"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import type { SponsorshipStatus } from "@/generated/prisma/enums";
import type { ActionResult } from "@/actions/inquiries";

export async function updateSponsorshipStatusAction(
  id: string,
  newStatus: SponsorshipStatus
): Promise<ActionResult> {
  await requireStaff();

  const sponsorship = await prisma.sponsorship.findUnique({
    where: { id },
    include: { child: true },
  });

  if (!sponsorship) {
    return { success: false, error: "Sponsorship record not found" };
  }

  if (sponsorship.status === newStatus) {
    return { success: true };
  }

  // If ending an active Stripe subscription, cancel on Stripe directly
  if (newStatus === "ENDED" && sponsorship.stripeSubscriptionId) {
    try {
      const stripeClient = await getStripeClient();
      await stripeClient.subscriptions.cancel(sponsorship.stripeSubscriptionId);
    } catch (stripeErr) {
      console.warn("Could not cancel Stripe subscription during status update:", stripeErr);
    }
  }

  await prisma.sponsorship.update({
    where: { id },
    data: {
      status: newStatus,
      endDate: newStatus === "ENDED" ? new Date() : undefined,
    },
  });

  // Re-evaluate child availability
  if (newStatus === "ENDED") {
    const remainingActiveCount = await prisma.sponsorship.count({
      where: {
        childId: sponsorship.childId,
        status: "ACTIVE",
        id: { not: id },
      },
    });

    if (remainingActiveCount === 0) {
      await prisma.child.update({
        where: { id: sponsorship.childId },
        data: { status: "AVAILABLE" },
      });
    }
  } else if (newStatus === "ACTIVE") {
    await prisma.child.update({
      where: { id: sponsorship.childId },
      data: { status: "SPONSORED" },
    });
  }

  revalidatePath("/admin/reports/sponsorships");
  revalidatePath("/admin");
  revalidatePath("/sponsor-a-child");
  revalidatePath(`/sponsor-a-child/${sponsorship.child.slug}`);
  revalidatePath("/account");

  return { success: true };
}
