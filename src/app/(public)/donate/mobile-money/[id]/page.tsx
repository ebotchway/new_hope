import Link from "next/link";
import { notFound } from "next/navigation";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Complete Your Mobile Money Donation" };

export default async function MobileMoneyInstructionsPage(
  props: PageProps<"/donate/mobile-money/[id]">
) {
  const { id } = await props.params;
  const [donation, settings] = await Promise.all([
    prisma.donation.findUnique({ where: { id } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  if (!donation || donation.paymentMethod !== "MOBILE_MONEY") notFound();

  const provider = settings?.momoProvider || "Mobile Money";
  const number = settings?.momoNumber;

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-lg rounded-3xl bg-secondary p-10 shadow-sm sm:p-12">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-navy/10">
          <Smartphone className="size-8 text-foreground" />
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          Almost there — complete your gift
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Send your donation using {provider}, then we&apos;ll confirm it against your reference
          within 24 hours and email you a receipt.
        </p>

        <dl className="mt-8 space-y-4 rounded-2xl bg-card p-6 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="text-lg font-semibold text-foreground">
              {formatMoney(donation.amountCents, donation.currency)}
            </dd>
          </div>
          {number && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">{provider} Number</dt>
              <dd className="font-mono font-semibold">{number}</dd>
            </div>
          )}
          {settings?.momoName && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Registered Name</dt>
              <dd className="font-medium">{settings.momoName}</dd>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-4">
            <dt className="text-muted-foreground">Reference (required)</dt>
            <dd className="font-mono text-lg font-semibold tracking-wide text-brand-accent">
              {donation.momoReference}
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-xs text-muted-foreground">
          Please enter <span className="font-semibold">{donation.momoReference}</span> as the
          reference or note on your Mobile Money transfer so we can match it to your donation.
        </p>

        <Button asChild size="lg" className="mt-8 w-full rounded-full">
          <Link href="/">I&apos;ve sent it — return home</Link>
        </Button>
      </div>
    </section>
  );
}
