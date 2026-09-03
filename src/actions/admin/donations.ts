"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { finalizeSuccessfulDonation } from "@/lib/donation-fulfillment";
import type { ActionResult } from "@/actions/inquiries";

/** Manual reconciliation for Mobile Money donations: staff confirm the transfer landed. */
export async function markMobileMoneyDonationReceived(id: string): Promise<ActionResult> {
  await requireStaff();

  const donation = await prisma.donation.findUnique({ where: { id } });
  if (!donation) return { success: false, error: "Donation not found" };
  if (donation.paymentMethod !== "MOBILE_MONEY") {
    return { success: false, error: "Only Mobile Money donations can be confirmed this way" };
  }
  if (donation.status !== "PENDING") {
    return { success: false, error: "This donation has already been processed" };
  }

  await finalizeSuccessfulDonation(id);

  revalidatePath("/admin/donations");
  revalidatePath("/");
  return { success: true };
}
