import Link from "next/link";
import { CheckCircle2, HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";

export const metadata = { title: "Thank You for Your Generosity — LivingHope" };

export default async function DonateSuccessPage(props: {
  searchParams: Promise<{ donation_id?: string; session_id?: string }>;
}) {
  const searchParams = await props.searchParams;
  const donationId = searchParams.donation_id;

  const donation = donationId
    ? await prisma.donation.findUnique({
        where: { id: donationId },
        include: { child: true },
      })
    : null;

  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-lg rounded-3xl border bg-card p-8 text-center shadow-xs sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-8" />
        </span>

        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Thank you for your generosity!
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Your gift has been received and is transforming the lives of vulnerable street children in Ghana
          through educational access and care.
        </p>

        {donation && (
          <div className="mt-6 rounded-2xl bg-secondary/60 p-5 text-left text-sm space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Gift Amount:</span>
              <span className="font-bold text-foreground">
                {formatMoney(donation.amountCents, donation.currency)} ({donation.frequency === "MONTHLY" ? "Monthly" : "One-time"})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Designation:</span>
              <span className="font-semibold text-foreground">
                {donation.designation.replace("_", " ")}
              </span>
            </div>
            {donation.child && (
              <div className="flex justify-between items-center pt-1 border-t">
                <span className="text-muted-foreground">Sponsored Child:</span>
                <Link
                  href={`/sponsor-a-child/${donation.child.slug}`}
                  className="font-semibold text-brand-navy dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <HeartHandshake className="size-3.5" /> {donation.child.name}
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full rounded-full">
            <Link href="/">
              Return Home <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full rounded-full">
            <Link href="/account">Go to Donor Account</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
