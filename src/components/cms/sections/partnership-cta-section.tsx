import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnershipCtaSectionProps } from "@/lib/cms-types";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export function CmsPartnershipCtaSection({ props }: { props: PartnershipCtaSectionProps }) {
  const bgImg = props.backgroundImageUrl || PLACEHOLDER_IMAGES.brightenerHero;

  return (
    <section className="px-4 py-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
        <Image
          src={bgImg}
          alt={props.heading}
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover opacity-25"
        />
        <div className="relative z-10 px-6 py-16 sm:px-16 sm:py-20 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-heading text-white">
              {props.heading}
            </h2>
            {props.subheading && (
              <p className="mt-4 text-base leading-relaxed text-slate-200 sm:text-lg">
                {props.subheading}
              </p>
            )}
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold px-8 py-3 rounded-xl shadow-lg"
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
