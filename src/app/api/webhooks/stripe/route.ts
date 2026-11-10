import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { finalizeSuccessfulDonation } from "@/lib/donation-fulfillment";
import { sendDonationReceipt } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("Stripe webhook: missing signature or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const donationId = session.metadata?.donationId;
        if (!donationId) {
          console.warn("checkout.session.completed received without donationId in metadata");
          break;
        }

        await finalizeSuccessfulDonation(donationId, {
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : undefined,
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : undefined,
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.id) break;

        // Idempotency: Skip if we have already recorded this invoice payment
        const existingDonation = await prisma.donation.findUnique({
          where: { stripeInvoiceId: invoice.id },
        });
        if (existingDonation) {
          break;
        }

        // Determine subscription ID across Stripe API versions
        const subscriptionId =
          typeof invoice.parent?.subscription_details?.subscription === "string"
            ? invoice.parent.subscription_details.subscription
            : typeof (invoice as unknown as { subscription?: string }).subscription === "string"
              ? (invoice as unknown as { subscription: string }).subscription
              : undefined;

        if (!subscriptionId) {
          // One-off invoice or direct charge not tied to a subscription
          break;
        }

        // Only handle recurring cycle renewals here (initial checkout creates donation via session)
        if (invoice.billing_reason !== "subscription_cycle") {
          // If it's subscription_create, checkout.session.completed handles it.
          // Link invoice ID to existing initial donation if not yet linked
          const initial = await prisma.donation.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
            orderBy: { createdAt: "asc" },
          });
          if (initial && !initial.stripeInvoiceId) {
            await prisma.donation.update({
              where: { id: initial.id },
              data: { stripeInvoiceId: invoice.id },
            });
          }
          break;
        }

        // Find initial donation to inherit donor, designation, and child references
        const original = await prisma.donation.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
          orderBy: { createdAt: "asc" },
        });
        if (!original) {
          console.warn(`Original donation not found for renewal subscription: ${subscriptionId}`);
          break;
        }

        // Create renewal donation record with unique invoiceId
        const renewal = await prisma.donation.create({
          data: {
            userId: original.userId,
            childId: original.childId,
            donorName: original.donorName,
            donorEmail: original.donorEmail,
            donorPhone: original.donorPhone,
            anonymous: original.anonymous,
            amountCents: invoice.amount_paid,
            currency: invoice.currency ?? "usd",
            frequency: "MONTHLY",
            designation: original.designation,
            status: "SUCCEEDED",
            emailUpdates: original.emailUpdates,
            smsUpdates: original.smsUpdates,
            whatsappUpdates: original.whatsappUpdates,
            stripeInvoiceId: invoice.id,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId:
              typeof invoice.customer === "string" ? invoice.customer : original.stripeCustomerId,
          },
        });

        // Send renewal receipt safely
        try {
          await sendDonationReceipt({
            to: renewal.donorEmail,
            donorName: renewal.donorName,
            amountCents: renewal.amountCents,
            currency: renewal.currency,
            frequency: renewal.frequency,
            designation: renewal.designation,
          });
          await prisma.donation.update({
            where: { id: renewal.id },
            data: { receiptSentAt: new Date() },
          });
        } catch (emailErr) {
          console.error("Failed to send renewal receipt:", emailErr);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const sponsorship = await prisma.sponsorship.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (sponsorship) {
          await prisma.sponsorship.update({
            where: { id: sponsorship.id },
            data: { status: "ENDED", endDate: new Date() },
          });

          // Check if any other active sponsorships exist for this child before reverting status
          const otherActiveCount = await prisma.sponsorship.count({
            where: {
              childId: sponsorship.childId,
              status: "ACTIVE",
              id: { not: sponsorship.id },
            },
          });

          if (otherActiveCount === 0) {
            await prisma.child.update({
              where: { id: sponsorship.childId },
              data: { status: "AVAILABLE" },
            });
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;

        if (paymentIntentId) {
          await prisma.donation.updateMany({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { status: "REFUNDED" },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error(`Error processing Stripe webhook event ${event.type}:`, error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
