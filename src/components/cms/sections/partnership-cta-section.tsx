import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnershipCtaSectionProps } from "@/lib/cms-types";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export function CmsPartnershipCtaSection({ props }: { props: PartnershipCtaSectionProps }) {
  const bgImg = props.backgroundImageUrl || PLACEHOLDER_IMAGES.partnershipBanner || PLACEHOLDER_IMAGES.brightenerHero;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-brand-navy p-6 sm:p-8 text-white shadow-md border border-brand-navy-light/20 h-full">
      {/* Background Accent Image with Controlled Vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImg}
          alt={props.heading}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-linear-to-tr from-brand-navy via-brand-navy/90 to-brand-navy/70" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold/15 px-3 py-1 text-xs font-semibold text-brand-gold">
            <Sparkles className="size-3.5" />
            Brightener Alliance
          </span>
          <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
            {props.heading}
          </h3>
          {props.subheading && (
            <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-slate-200">
              {props.subheading}
            </p>
          )}
        </div>

        <div className="pt-2">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Link href={props.buttonUrl || "/become-a-brightener"}>
              <HeartHandshake className="size-4" />
              <span>{props.buttonLabel || "Explore Partnerships"}</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
