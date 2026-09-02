import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendDonationReceipt } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const donationId = session.metadata?.donationId;
      if (!donationId) break;

      const donation = await prisma.donation.update({
        where: { id: donationId },
        data: {
          status: "SUCCEEDED",
          stripePaymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : undefined,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : undefined,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
        },
      });

      if (donation.designation === "CHILD_SPONSORSHIP" && donation.childId) {
        if (donation.userId) {
          await prisma.sponsorship.create({
            data: {
              userId: donation.userId,
              childId: donation.childId,
              type: donation.frequency === "MONTHLY" ? "FULL" : "CONTRIBUTION",
              status: "ACTIVE",
              monthlyAmountCents: donation.frequency === "MONTHLY" ? donation.amountCents : 0,
              stripeSubscriptionId:
                typeof session.subscription === "string" ? session.subscription : undefined,
            },
          });
        }
        await prisma.child.update({ where: { id: donation.childId }, data: { status: "SPONSORED" } });
      }

      if (!donation.receiptSentAt) {
        await sendDonationReceipt({
          to: donation.donorEmail,
          donorName: donation.donorName,
          amountCents: donation.amountCents,
          currency: donation.currency,
          frequency: donation.frequency,
          designation: donation.designation,
        });
        await prisma.donation.update({ where: { id: donation.id }, data: { receiptSentAt: new Date() } });
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const subscriptionId =
        typeof invoice.parent?.subscription_details?.subscription === "string"
          ? invoice.parent.subscription_details.subscription
          : undefined;
      if (!subscriptionId || invoice.billing_reason !== "subscription_cycle") break;

      const original = await prisma.donation.findFirst({
        where: { stripeSubscriptionId: subscriptionId },
        orderBy: { createdAt: "asc" },
      });
      if (!original) break;

      const renewal = await prisma.donation.create({
        data: {
          userId: original.userId,
          childId: original.childId,
          donorName: original.donorName,
          donorEmail: original.donorEmail,
          donorPhone: original.donorPhone,
          anonymous: original.anonymous,
          amountCents: invoice.amount_paid,
          currency: invoice.currency,
          frequency: "MONTHLY",
          designation: original.designation,
          status: "SUCCEEDED",
          emailUpdates: original.emailUpdates,
          smsUpdates: original.smsUpdates,
          whatsappUpdates: original.whatsappUpdates,
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: typeof invoice.customer === "string" ? invoice.customer : undefined,
        },
      });

      await sendDonationReceipt({
        to: renewal.donorEmail,
        donorName: renewal.donorName,
        amountCents: renewal.amountCents,
        currency: renewal.currency,
        frequency: renewal.frequency,
        designation: renewal.designation,
      });
      await prisma.donation.update({ where: { id: renewal.id }, data: { receiptSentAt: new Date() } });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const sponsorship = await prisma.sponsorship.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (sponsorship) {
        await prisma.sponsorship.update({
          where: { id: sponsorship.id },
          data: { status: "ENDED", endDate: new Date() },
        });
        await prisma.child.update({
          where: { id: sponsorship.childId },
          data: { status: "AVAILABLE" },
        });
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
