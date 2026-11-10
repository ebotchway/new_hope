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

  // Anti-bot honeypot check
  if (parsed.data.companyHoneypot) {
    return { success: true };
  }

  const data = parsed.data;

  await prisma.partnershipInquiry.create({
    data: {
      ...data,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || null,
      message: data.message?.trim() || null,
    },
  });

  return { success: true };
}
