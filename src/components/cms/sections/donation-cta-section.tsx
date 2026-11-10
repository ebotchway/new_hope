import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DonationCtaSectionProps } from "@/lib/cms-types";

export function CmsDonationCtaSection({ props }: { props: DonationCtaSectionProps }) {
  const presetAmounts = props.presetAmounts || [25, 50, 100, 250];

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-linear-to-r from-brand-primary via-emerald-800 to-teal-900 p-8 sm:p-16 text-center text-white shadow-2xl">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-heading text-white">
          {props.heading}
        </h2>

        {props.subheading && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-emerald-100 sm:text-lg">
            {props.subheading}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {presetAmounts.map((amount) => (
            <Button
              key={amount}
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-brand-primary font-bold px-6 py-2 rounded-xl transition-all"
            >
              <Link href={`/donate?amount=${amount}`}>${amount}</Link>
            </Button>
          ))}
        </div>

        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/donate">{props.primaryCtaLabel || "Donate Now"}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

