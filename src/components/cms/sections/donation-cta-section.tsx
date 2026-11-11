import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationCtaSectionProps } from "@/lib/cms-types";

export function CmsDonationCtaSection({ props }: { props: DonationCtaSectionProps }) {
  const presetAmounts = props.presetAmounts || [25, 50, 100, 250];

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-linear-to-br from-brand-primary via-emerald-800 to-teal-950 p-6 sm:p-8 text-white shadow-md border border-emerald-700/30 h-full">
      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-emerald-100">
            <Heart className="size-3.5 fill-white text-white" />
            Direct Child Support
          </span>
          <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
            {props.heading}
          </h3>
          {props.subheading && (
            <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-emerald-100">
              {props.subheading}
            </p>
          )}

          {/* Quick-select amount buttons connected directly to donation flow */}
          <div className="mt-5 flex flex-wrap gap-2">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                asChild
                variant="outline"
                size="sm"
                className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-emerald-900 font-bold px-3.5 py-1.5 rounded-lg transition-all text-xs"
              >
                <Link href={`/donate?amount=${amount}`}>${amount}</Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Link href="/donate">
              <span>{props.primaryCtaLabel || "Make a Direct Gift"}</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
