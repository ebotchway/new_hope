"use server";

import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { donationSchema } from "@/lib/validations";

export type CheckoutResult =
  | { success: true; url: string }
  | { success: false; error: string };

function generateMomoReference() {
  return `LH-${randomUUID().slice(0, 6).toUpperCase()}`;
}

export async function createDonationCheckout(values: unknown): Promise<CheckoutResult> {
  const parsed = donationSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  // Bot honeypot check (website/company field must be empty)
  if (data.companyHoneypot) {
    // Silently return fake success for bots
    return { success: true, url: "/" };
  }

  const session = await auth();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3010";

  let child = null;
  if (data.childId) {
    child = await prisma.child.findUnique({ where: { id: data.childId } });
    if (!child) return { success: false, error: "Selected child could not be found" };
  }

  let exchangeRate: number | null = null;
  let amountGhsCents: number | null = null;

  if (data.paymentMethod === "MOBILE_MONEY") {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    exchangeRate = settings?.momoRateUsdToGhs ?? 15.5;
    amountGhsCents = Math.round((data.amountCents / 100) * exchangeRate * 100);
  }

  const donation = await prisma.donation.create({
    data: {
      userId: session?.user?.id ?? null,
      childId: data.childId ?? null,
      title: data.title ?? null,
      donorName: data.donorName.trim(),
      donorEmail: data.donorEmail.toLowerCase().trim(),
      donorPhone: data.donorPhone?.trim() || null,
      anonymous: data.anonymous,
      amountCents: data.amountCents,
      currency: "usd",
      frequency: data.frequency,
      designation: data.designation,
      paymentMethod: data.paymentMethod,
      emailUpdates: data.emailUpdates,
      smsUpdates: data.smsUpdates,
      whatsappUpdates: data.whatsappUpdates,
      status: "PENDING",
      exchangeRate,
      amountGhsCents,
      ...(data.paymentMethod === "MOBILE_MONEY" ? { momoReference: generateMomoReference() } : {}),
    },
  });

  if (data.paymentMethod === "MOBILE_MONEY") {
    return { success: true, url: `${appUrl}/donate/mobile-money/${donation.id}` };
  }

  const productName = child
    ? `Sponsorship for ${child.name}`
    : data.designation === "PARTNERSHIP"
      ? "LivingHope Partnership Contribution"
      : "LivingHope General Donation";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: data.frequency === "MONTHLY" ? "subscription" : "payment",
      customer_email: data.donorEmail.toLowerCase().trim(),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: data.amountCents,
            product_data: { name: productName },
            ...(data.frequency === "MONTHLY" ? { recurring: { interval: "month" as const } } : {}),
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}&donation_id=${donation.id}`,
      cancel_url: `${appUrl}/donate`,
      metadata: {
        donationId: donation.id,
        childId: child?.id ?? "",
        donorEmail: data.donorEmail.toLowerCase().trim(),
      },
      subscription_data:
        data.frequency === "MONTHLY"
          ? {
              metadata: {
                donationId: donation.id,
                childId: child?.id ?? "",
              },
            }
          : undefined,
    });

    await prisma.donation.update({
      where: { id: donation.id },
      data: { stripeCheckoutSessionId: checkoutSession.id },
    });

    if (!checkoutSession.url) {
      return { success: false, error: "Could not start checkout session. Please try again." };
    }

    return { success: true, url: checkoutSession.url };
  } catch (err: unknown) {
    console.error("Stripe checkout session creation failed:", err);
    return {
      success: false,
      error: "Online card payments are currently unavailable. Please try again shortly or use Mobile Money.",
    };
  }
}
