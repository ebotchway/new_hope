import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnershipCtaSectionProps } from "@/lib/cms-types";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export function CmsPartnershipCtaSection({ props }: { props: PartnershipCtaSectionProps }) {
  const bgImg = props.backgroundImageUrl || PLACEHOLDER_IMAGES.brightenerHero;

  return (
    <section className="px-4 py-6 sm:py-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-slate-900 shadow-md">
        <Image
          src={bgImg}
          alt={props.heading}
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover opacity-25"
        />
        <div className="relative z-10 px-5 py-10 sm:px-12 sm:py-14 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl font-heading text-white">
              {props.heading}
            </h2>
            {props.subheading && (
              <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
                {props.subheading}
              </p>
            )}
            <div className="mt-6">
              <Button
                asChild
                size="lg"
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold px-7 py-2.5 rounded-xl shadow-md"
              >
                <Link href={props.buttonUrl} className="flex items-center gap-2">
                  <span>{props.buttonLabel}</span>
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
