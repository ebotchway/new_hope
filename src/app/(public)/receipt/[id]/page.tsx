import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, ShieldCheck, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/site/print-button";

export const metadata = {
  title: "Official Donation Receipt — LivingHope",
  description: "Official electronic donation acknowledgment and tax deduction record.",
};

export default async function DonationReceiptPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const donation = await prisma.donation.findUnique({
    where: { id },
    include: {
      child: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!donation) {
    notFound();
  }

  const receiptNumber = `LH-REC-${donation.id.slice(-6).toUpperCase()}`;
  const formattedAmount = formatMoney(donation.amountCents, donation.currency);
  const isMomo = donation.paymentMethod === "MOBILE_MONEY";

  return (
    <div className="min-h-screen bg-muted/20 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Navigation / Action Bar */}
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Link href="/account">
              <ArrowLeft className="size-4" />
              Back to My Account
            </Link>
          </Button>

          <PrintButton />
        </div>

        {/* Printable Official Letterhead Certificate */}
        <div className="rounded-3xl border bg-card p-8 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-brand-navy pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-heading tracking-tight text-brand-navy dark:text-blue-400">
                  Living<span className="text-brand-accent">Hope</span>
                </span>
                <span className="rounded-full bg-brand-accent/10 px-2 py-0.5 text-[10px] font-bold text-brand-accent uppercase tracking-wider">
                  Official NGO
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Transforming Vulnerable Children&apos;s Lives in Ghana
              </p>
              <p className="text-[11px] text-muted-foreground">
                Accra &amp; Kumasi, Ghana • Contact: info@livinghopeghana.org
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs">
              <span className="block font-bold text-foreground text-sm">{receiptNumber}</span>
              <span className="text-muted-foreground block">
                Issued: {formatDate(new Date())}
              </span>
              <span className="text-muted-foreground block">
                Contribution Date: {formatDate(donation.createdAt)}
              </span>
            </div>
          </div>

          {/* Receipt Status Badge */}
          <div className="my-6 flex items-center justify-between rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wide">
                  Official Electronic Receipt &amp; Acknowledgment
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Payment Status: {donation.status}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Amount Contributed</span>
              <span className="text-2xl font-black text-brand-navy dark:text-blue-400 font-heading">
                {formattedAmount}
              </span>
            </div>
          </div>

          {/* Donor & Contribution Grid */}
          <div className="grid gap-6 sm:grid-cols-2 text-sm border-b pb-8">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Donor Information
              </h3>
              <div>
                <span className="text-xs text-muted-foreground block">Full Legal Name:</span>
                <span className="font-semibold text-foreground">
                  {donation.title ? `${donation.title} ` : ""}
                  {donation.anonymous ? "Anonymous Supporter" : donation.donorName}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email Address:</span>
                <span className="text-foreground">{donation.donorEmail}</span>
              </div>
              {donation.donorPhone && (
                <div>
                  <span className="text-xs text-muted-foreground block">Contact Phone:</span>
                  <span className="text-foreground">{donation.donorPhone}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment &amp; Allocation Details
              </h3>
              <div>
                <span className="text-xs text-muted-foreground block">Designation / Program:</span>
                <span className="font-semibold text-foreground">
                  {donation.designation.replace(/_/g, " ")}
                </span>
              </div>
              {donation.child && (
                <div>
                  <span className="text-xs text-muted-foreground block">Sponsored Beneficiary:</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Heart className="size-3.5 text-rose-500" />
                    {donation.child.name}
                  </span>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground block">Payment Method:</span>
                <span className="text-foreground">
                  {isMomo ? "Mobile Money" : "Debit / Credit Card (Stripe)"}
                </span>
              </div>
              {isMomo && donation.momoReference && (
                <div>
                  <span className="text-xs text-muted-foreground block">MoMo Reference Code:</span>
                  <span className="font-mono font-bold text-brand-accent">{donation.momoReference}</span>
                </div>
              )}
              {isMomo && donation.amountGhsCents && (
                <div>
                  <span className="text-xs text-muted-foreground block">Local Currency Amount:</span>
                  <span className="font-bold text-emerald-600">
                    GH₵ {(donation.amountGhsCents / 100).toFixed(2)}
                  </span>
                </div>
              )}
              {donation.frequency && (
                <div>
                  <span className="text-xs text-muted-foreground block">Contribution Frequency:</span>
                  <span className="text-foreground">
                    {donation.frequency === "MONTHLY" ? "Recurring Monthly Partner" : "One-Time Donation"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Legal / Tax Exemption Acknowledgment */}
          <div className="mt-8 space-y-4 text-xs text-muted-foreground leading-relaxed">
            <div className="flex gap-2">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Tax &amp; Humanitarian Acknowledgment:</strong> LivingHope is a recognized humanitarian non-profit organization dedicated to street child rescue, education, and vocational empowerment in Ghana. No goods or services were provided in exchange for this contribution other than intangible religious and charitable benefits.
              </p>
            </div>
            <p>
              Please retain this official electronic receipt for your personal tax records and employer gift matching applications.
            </p>
          </div>

          {/* Signoff Mark */}
          <div className="mt-10 pt-6 border-t flex items-center justify-between text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">LivingHope Foundation Board of Trustees</p>
              <p>Finance &amp; Stewardship Secretariat</p>
            </div>
            <div className="text-right font-mono text-[11px]">
              VERIFIED SECURE RECORD
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
