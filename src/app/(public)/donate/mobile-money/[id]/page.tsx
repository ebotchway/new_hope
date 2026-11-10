import Link from "next/link";
import { notFound } from "next/navigation";
import { Smartphone, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Complete Your Mobile Money Donation — LivingHope" };

export default async function MobileMoneyInstructionsPage(
  props: PageProps<"/donate/mobile-money/[id]">
) {
  const { id } = await props.params;
  const [donation, settings] = await Promise.all([
    prisma.donation.findUnique({
      where: { id },
      include: { child: true },
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  if (!donation || donation.paymentMethod !== "MOBILE_MONEY") notFound();

  const provider = settings?.momoProvider || "MTN Mobile Money";
  const number = settings?.momoNumber;
  const rate = donation.exchangeRate ?? settings?.momoRateUsdToGhs ?? 15.5;
  const ghsAmount = donation.amountGhsCents
    ? (donation.amountGhsCents / 100).toFixed(2)
    : ((donation.amountCents / 100) * rate).toFixed(2);

  const isConfirmed = donation.status === "SUCCEEDED";

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
        <div className="flex items-center justify-between">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white">
            <Smartphone className="size-7" />
          </span>
          <Badge
            variant={isConfirmed ? "default" : "secondary"}
            className={
              isConfirmed
                ? "bg-emerald-600 text-white"
                : "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
            }
          >
            {isConfirmed ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="size-3.5" /> Transfer Verified
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" /> Awaiting Transfer
              </span>
            )}
          </Badge>
        </div>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {isConfirmed ? "Transfer Confirmed!" : "Complete Your Mobile Money Gift"}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {isConfirmed ? (
            <>
              Thank you! We have verified your Mobile Money payment. A receipt has been issued to{" "}
              <strong>{donation.donorEmail}</strong>.
            </>
          ) : (
            <>
              Send your transfer using <strong>{provider}</strong> quoting your unique reference
              below. Our team will verify the transfer and email you an official acknowledgment.
            </>
          )}
        </p>

        {donation.child && (
          <div className="mt-4 rounded-xl bg-secondary/80 p-3 text-xs text-secondary-foreground">
            Sponsorship designated for: <strong>{donation.child.name}</strong>
          </div>
        )}

        <div className="mt-6 space-y-3 rounded-2xl bg-secondary/50 p-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payable Amount (GHS)</span>
            <span className="text-xl font-bold text-foreground">GH₵ {ghsAmount}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Equivalent in USD</span>
            <span>{formatMoney(donation.amountCents, donation.currency)} (Rate: 1 USD = {rate} GHS)</span>
          </div>

          <div className="my-2 border-t" />

          {number && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{provider} Number</span>
              <span className="font-mono text-base font-semibold text-foreground">{number}</span>
            </div>
          )}

          {settings?.momoName && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Registered Account Name</span>
              <span className="font-medium text-foreground">{settings.momoName}</span>
            </div>
          )}

          <div className="my-2 border-t" />

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-muted-foreground">Payment Reference (Required)</span>
            <span className="rounded-md bg-brand-navy/10 px-3 py-1 font-mono text-lg font-bold tracking-wider text-brand-navy dark:bg-white/10 dark:text-white">
              {donation.momoReference}
            </span>
          </div>
        </div>

        {!isConfirmed && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200">
            <strong>Important:</strong> Please ensure you enter{" "}
            <span className="font-mono font-bold">{donation.momoReference}</span> in the
            &ldquo;Reference&rdquo; or &ldquo;Note&rdquo; field when sending via {provider}. This allows
            our finance team to match your transfer immediately.
          </div>
        )}

        {settings?.momoInstructions && !isConfirmed && (
          <div className="mt-4 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Transfer Guide:</p>
            <p className="whitespace-pre-line">{settings.momoInstructions}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full rounded-full">
            <Link href="/">
              Return Home <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full rounded-full">
            <Link href="/account">View My Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
