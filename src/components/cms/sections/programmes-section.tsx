import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProgrammesSectionProps } from "@/lib/cms-types";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";

export function CmsProgrammesSection({ props }: { props: ProgrammesSectionProps }) {
  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-8 sm:mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl font-heading">
            {props.heading}
          </h2>
          {props.subheading && (
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {props.subheading}
            </p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {props.programmes.map((prog, idx) => (
            <Card
              key={idx}
              className="overflow-hidden rounded-2xl border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
                <Image
                  src={prog.imageUrl || PLACEHOLDER_IMAGES.whatWeDoHero}
                  alt={prog.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-slate-900/80 text-white backdrop-blur-xs font-semibold">
                  {prog.category}
                </Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground font-heading">{prog.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {prog.description}
                </p>
                {prog.metrics && (
                  <div className="mt-4 inline-flex items-center rounded-lg bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary">
                    {prog.metrics}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

