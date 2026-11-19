"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { siteSettingsSchema } from "@/lib/validations";
import { invalidateStripeCache, testStripeConnection } from "@/lib/stripe";
import type { ActionResult } from "@/actions/inquiries";

export async function updateSiteSettings(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const clearStripe = formData.get("clearStripeCredentials") === "true";
  const rawStripeSecret = formData.get("stripeSecretKey");
  const rawStripeWebhook = formData.get("stripeWebhookSecret");

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
    stripePublishableKey: formData.get("stripePublishableKey") || undefined,
    stripeSecretKey: typeof rawStripeSecret === "string" && rawStripeSecret.trim() ? rawStripeSecret.trim() : undefined,
    stripeWebhookSecret: typeof rawStripeWebhook === "string" && rawStripeWebhook.trim() ? rawStripeWebhook.trim() : undefined,
    stripeMode: formData.get("stripeMode") === "live" ? "live" : "test",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { contactEmail, stripeSecretKey, stripeWebhookSecret, ...rest } = parsed.data;

  // Retrieve current settings to retain secrets if left blank in form
  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const finalSecretKey = clearStripe ? null : (stripeSecretKey || existing?.stripeSecretKey || null);
  const finalWebhookSecret = clearStripe ? null : (stripeWebhookSecret || existing?.stripeWebhookSecret || null);

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      ...rest,
      contactEmail: contactEmail || undefined,
      stripeSecretKey: finalSecretKey,
      stripeWebhookSecret: finalWebhookSecret,
    },
    update: {
      ...rest,
      contactEmail: contactEmail || null,
      stripeSecretKey: finalSecretKey,
      stripeWebhookSecret: finalWebhookSecret,
    },
  });

  invalidateStripeCache();

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/donate");
  revalidatePath("/admin/settings");
  return { success: true };
}

/**
 * Live test of Stripe credentials directly from dashboard.
 */
export async function testStripeCredentialsAction(keyToTest?: string): Promise<{
  success: boolean;
  mode?: "test" | "live";
  currencies?: string[];
  error?: string;
}> {
  await requireStaff();
  const res = await testStripeConnection(keyToTest);
  return {
    success: res.ok,
    mode: res.mode,
    currencies: res.currencies,
    error: res.error,
  };
}
