import { Resend } from "resend";
import { formatMoney } from "@/lib/format";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendDonationReceipt(params: {
  to: string;
  donorName: string;
  amountCents: number;
  currency: string;
  frequency: "ONE_TIME" | "MONTHLY";
  designation: string;
}) {
  if (!resend) {
    console.info("Resend API key not configured; skipping receipt email dispatch to", params.to);
    return;
  }

  const { to, donorName, amountCents, currency, frequency, designation } = params;
  const amount = formatMoney(amountCents, currency);
  const cadence = frequency === "MONTHLY" ? "monthly contribution" : "donation";
  const safeName = escapeHtml(donorName);
  const safeDesignation = escapeHtml(designation.replace(/_/g, " "));

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "LivingHope <onboarding@resend.dev>",
    to,
    subject: `Official Receipt: Thank you for your ${cadence} to LivingHope`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #262b45; padding-bottom: 16px; margin-bottom: 20px;">
          <h1 style="color: #262b45; font-size: 22px; margin: 0;">LivingHope Platform</h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Transforming Street Children's Lives Through Education</p>
        </div>

        <h2 style="color: #1e293b; font-size: 18px; margin-top: 0;">Thank you, ${safeName}!</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          We have successfully received your ${cadence} of <strong style="color: #262b45;">${amount}</strong> toward <strong>${safeDesignation}</strong>.
        </p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0;">Designation:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #1e293b;">${safeDesignation}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Amount:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #1e293b;">${amount}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0;">Frequency:</td>
              <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #1e293b;">${frequency === "MONTHLY" ? "Monthly" : "One-time"}</td>
            </tr>
          </table>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          Your generosity provides schooling, uniforms, books, and loving guidance to children in Ghana.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
          <p style="margin: 0;">LivingHope Ghana — Brighten The Future</p>
          <p style="margin: 4px 0 0 0;">This email serves as an official electronic donation acknowledgment.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetLink: string;
}) {
  if (!resend) {
    console.info("Resend not configured; password reset link for", params.to, ":", params.resetLink);
    return;
  }

  const { to, name, resetLink } = params;
  const safeName = escapeHtml(name);

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "LivingHope <onboarding@resend.dev>",
    to,
    subject: "Reset your LivingHope account password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Hello ${safeName},<br/>
          We received a request to reset your password for your LivingHope account. Click the button below to choose a new password:
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetLink}" style="background-color: #262b45; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 24px; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          This link will expire in 1 hour. If you did not make this request, you can safely ignore this email; your password will remain unchanged.
        </p>
      </div>
    `,
  });
}
