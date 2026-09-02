"use server";

import { prisma } from "@/lib/prisma";
import { partnershipInquirySchema } from "@/lib/validations";

export type ActionResult = { success: true } | { success: false; error: string };

export async function submitPartnershipInquiry(
  values: unknown
): Promise<ActionResult> {
  const parsed = partnershipInquirySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.partnershipInquiry.create({ data: parsed.data });
  return { success: true };
}
