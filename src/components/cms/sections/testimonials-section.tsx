import Image from "next/image";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TestimonialsSectionProps } from "@/lib/cms-types";

export function CmsTestimonialsSection({ props }: { props: TestimonialsSectionProps }) {
  return (
    <section className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-heading">
            {props.heading}
          </h2>
          {props.subheading && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {props.subheading}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {props.testimonials.map((t, idx) => (
            <Card
              key={idx}
              className="relative overflow-hidden rounded-2xl border-border/60 bg-card p-6 shadow-sm transition-all hover:shadow-md"
            >
              <CardContent className="p-0">
                <Quote className="size-8 text-brand-primary/20 mb-4" />
                {t.rating && (
                  <div className="mb-3 flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                )}
                <p className="text-base italic leading-relaxed text-foreground/90">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
                  {t.avatarUrl ? (
                    <div className="relative size-10 overflow-hidden rounded-full bg-muted">
                      <Image src={t.avatarUrl} alt={t.author} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                      {t.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-foreground text-sm">{t.author}</div>
                    {t.role && <div className="text-xs text-muted-foreground">{t.role}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

