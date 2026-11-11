import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DonationCtaSectionProps } from "@/lib/cms-types";

export function CmsDonationCtaSection({ props }: { props: DonationCtaSectionProps }) {
  const presetAmounts = props.presetAmounts || [25, 50, 100, 250];

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-linear-to-r from-brand-primary via-emerald-800 to-teal-900 p-6 sm:p-10 text-center text-white shadow-lg">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl font-heading text-white">
          {props.heading}
        </h2>

        {props.subheading && (
          <p className="mx-auto mt-2.5 max-w-2xl text-sm text-emerald-100 sm:text-base">
            {props.subheading}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          {presetAmounts.map((amount) => (
            <Button
              key={amount}
              asChild
              variant="outline"
              size="default"
              className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-brand-primary font-bold px-5 py-2 rounded-xl transition-all"
            >
              <Link href={`/donate?amount=${amount}`}>${amount}</Link>
            </Button>
          ))}
        </div>

        <div className="mt-6">
          <Button
            asChild
            size="lg"
            className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold px-7 py-2.5 text-base rounded-xl shadow-md transition-all"
          >
            <Link href="/donate">{props.primaryCtaLabel || "Donate Now"}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

