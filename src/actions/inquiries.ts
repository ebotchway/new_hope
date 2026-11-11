"use server";

import { prisma } from "@/lib/prisma";
import {
  partnershipInquirySchema,
  brightenerRegistrationSchema,
  generalInquirySchema,
} from "@/lib/validations";

export type ActionResult =
  | { success: true; referenceId?: string }
  | { success: false; error: string };

/**
 * Legacy partnership inquiry handler (maintained for backward compatibility).
 */
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

  const record = await prisma.partnershipInquiry.create({
    data: {
      type: data.type,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || null,
      message: data.message?.trim() || null,
      category: "BRIGHTENER_REGISTRATION",
    },
  });

  return { success: true, referenceId: record.id };
}

/**
 * Submits a differentiated Brightener Program participation registration.
 * Captures category-specific parameters (volunteering skills, availability, corporate details).
 */
export async function submitBrightenerRegistration(
  values: unknown
): Promise<ActionResult> {
  const parsed = brightenerRegistrationSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid registration details" };
  }

  // Anti-bot honeypot check
  if (parsed.data.companyHoneypot) {
    return { success: true };
  }

  const data = parsed.data;

  const record = await prisma.partnershipInquiry.create({
    data: {
      type: data.type,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || null,
      organization: data.organization?.trim() || null,
      role: data.role?.trim() || null,
      skills: data.skills?.trim() || null,
      availability: data.availability?.trim() || null,
      preferredFrequency: data.preferredFrequency?.trim() || null,
      message: data.message?.trim() || null,
      category: "BRIGHTENER_REGISTRATION",
      metadata: data.areasOfInterest && data.areasOfInterest.length > 0
        ? { areasOfInterest: data.areasOfInterest }
        : undefined,
    },
  });

  return { success: true, referenceId: record.id };
}

/**
 * Submits a short, direct general inquiry (contact message) without requiring
 * or associating with a Brightener category.
 */
export async function submitGeneralInquiry(
  values: unknown
): Promise<ActionResult> {
  const parsed = generalInquirySchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid inquiry input" };
  }

  // Anti-bot honeypot check
  if (parsed.data.companyHoneypot) {
    return { success: true };
  }

  const data = parsed.data;

  const record = await prisma.partnershipInquiry.create({
    data: {
      type: "INDIVIDUAL", // Default internal enum for database schema compliance
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || null,
      subject: data.subject.trim(),
      message: data.message.trim(),
      category: "GENERAL_INQUIRY",
      metadata: {
        inquiryType: data.inquiryType,
      },
    },
  });

  return { success: true, referenceId: record.id };
}
