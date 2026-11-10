import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroSectionProps } from "@/lib/cms-types";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

export function CmsHeroSection({ props }: { props: HeroSectionProps }) {
  const isLeft = props.alignment === "left";
  const bgImage = props.imageUrl || PLACEHOLDER_IMAGES.homeHero;

  return (
    <section className="px-4 pt-2">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl shadow-xl">
        <div
          className={cn(
            "relative flex min-h-135 justify-center pt-20 sm:min-h-165 sm:pt-28",
            isLeft ? "items-start text-left" : "items-center text-center"
          )}
        >
          <Image
            src={bgImage}
            alt={props.title}
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/40 to-black/75" />

          <div
            className={cn(
              "relative z-10 max-w-4xl px-6 text-white pb-16",
              isLeft ? "mr-auto text-left" : "mx-auto text-center"
            )}
          >
            {props.badge && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-md">
                <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                {props.badge}
              </div>
            )}

            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl drop-shadow-sm font-heading">
              {props.title}
            </h1>

            <p
              className={cn(
                "mt-6 text-lg leading-relaxed text-white/90 sm:text-xl",
                !isLeft && "mx-auto max-w-2xl"
              )}
            >
              {props.subtitle}
            </p>

            {(props.primaryCta || props.secondaryCta) && (
              <div
                className={cn(
                  "mt-8 flex flex-wrap gap-4",
                  isLeft ? "justify-start" : "justify-center"
                )}
              >
                {props.primaryCta && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-brand-primary text-white hover:bg-brand-primary-hover shadow-lg text-base h-12 px-7 rounded-xl"
                  >
                    <Link href={props.primaryCta.href}>{props.primaryCta.label}</Link>
                  </Button>
                )}
                {props.secondaryCta && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/25 hover:border-white text-base h-12 px-7 rounded-xl"
                  >
                    <Link href={props.secondaryCta.href}>{props.secondaryCta.label}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

