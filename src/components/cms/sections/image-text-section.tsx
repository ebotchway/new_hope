import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageTextSectionProps } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

export function CmsImageTextSection({ props }: { props: ImageTextSectionProps }) {
  const isLeft = props.imagePosition === "left";

  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className={cn(isLeft && "lg:order-2")}>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-heading">
              {props.heading}
            </h2>

            {props.lead && (
              <p className="mt-4 text-xl font-medium leading-relaxed text-brand-primary">
                {props.lead}
              </p>
            )}

            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {props.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {props.bulletPoints && props.bulletPoints.length > 0 && (
              <ul className="mt-6 space-y-3">
                {props.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-brand-primary" />
                    <span className="text-foreground/90">{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {props.cta && (
              <div className="mt-8">
                <Button asChild size="lg" className="rounded-xl shadow-md">
                  <Link href={props.cta.href}>{props.cta.label}</Link>
                </Button>
              </div>
            )}
          </div>

          <div className={cn("relative", isLeft && "lg:order-1")}>
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl shadow-xl sm:aspect-16/11">
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

