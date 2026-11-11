import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageTextSectionProps } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

export function CmsImageTextSection({ props }: { props: ImageTextSectionProps }) {
  const isLeft = props.imagePosition === "left";

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className={cn(isLeft && "lg:order-2")}>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl font-heading">
              {props.heading}
            </h2>

            {props.lead && (
              <p className="mt-3 text-lg font-medium leading-relaxed text-brand-primary sm:text-xl">
                {props.lead}
              </p>
            )}

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {props.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {props.bulletPoints && props.bulletPoints.length > 0 && (
              <ul className="mt-4 space-y-2.5">
                {props.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-brand-primary" />
                    <span className="text-foreground/90 text-sm sm:text-base">{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {props.cta && (
              <div className="mt-6">
                <Button asChild size="default" className="rounded-xl shadow-sm h-11 px-6">
                  <Link href={props.cta.href}>{props.cta.label}</Link>
                </Button>
              </div>
            )}
          </div>

          <div className={cn("relative", isLeft && "lg:order-1")}>
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-md sm:aspect-16/11">
              <Image
                src={props.imageUrl}
                alt={props.imageAlt || props.heading}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-black/10 ring-inset rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

