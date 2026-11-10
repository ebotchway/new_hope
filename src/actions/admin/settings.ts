"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { siteSettingsSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

export async function updateSiteSettings(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const parsed = siteSettingsSchema.safeParse({
    heroHeadline: formData.get("heroHeadline"),
    heroSubheadline: formData.get("heroSubheadline"),
    missionTitle: formData.get("missionTitle"),
    missionBody: formData.get("missionBody"),
    facebookUrl: formData.get("facebookUrl") || undefined,
    twitterUrl: formData.get("twitterUrl") || undefined,
    youtubeUrl: formData.get("youtubeUrl") || undefined,
    contactEmail: formData.get("contactEmail") || "",
    contactPhone: formData.get("contactPhone") || undefined,
    momoProvider: formData.get("momoProvider") || undefined,
    momoNumber: formData.get("momoNumber") || undefined,
    momoName: formData.get("momoName") || undefined,
    momoRateUsdToGhs: formData.get("momoRateUsdToGhs") || 15.5,
    momoInstructions: formData.get("momoInstructions") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { contactEmail, ...rest } = parsed.data;

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...rest, contactEmail: contactEmail || undefined },
    update: { ...rest, contactEmail: contactEmail || null },
  });

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/donate");
  revalidatePath("/admin/settings");
  return { success: true };
}
