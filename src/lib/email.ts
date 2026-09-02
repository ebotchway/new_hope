import { Resend } from "resend";
import { formatMoney } from "@/lib/format";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendDonationReceipt(params: {
  to: string;
  donorName: string;
  amountCents: number;
  currency: string;
  frequency: "ONE_TIME" | "MONTHLY";
  designation: string;
}) {
  if (!resend) return;

  const { to, donorName, amountCents, currency, frequency, designation } = params;
  const amount = formatMoney(amountCents, currency);
  const cadence = frequency === "MONTHLY" ? "monthly donation" : "donation";

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "LivingHope <onboarding@resend.dev>",
    to,
    subject: `Thank you for your ${cadence} to LivingHope`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#262b45;">Thank you, ${donorName}!</h2>
        <p>We've received your ${cadence} of <strong>${amount}</strong> toward <strong>${designation}</strong>.</p>
        <p>Your generosity helps transform the lives of street children through education.</p>
        <p style="color:#666;font-size:13px;">LivingHope — Brighten The Future</p>
      </div>
    `,
  });
}
