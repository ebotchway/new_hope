import Link from "next/link";
import {
  GraduationCap,
  HeartHandshake,
  Hammer,
  Heart,
  ShieldCheck,
  Users,
  Flame,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CardGridSectionProps } from "@/lib/cms-types";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  HeartHandshake,
  Hammer,
  Heart,
  ShieldCheck,
  Users,
  Flame,
  Clock,
  Sparkles,
  BookOpen,
};

export function CmsCardGridSection({ props }: { props: CardGridSectionProps }) {
  const colClass = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[props.columns || 3];

  return (
    <section className="px-4 py-16 sm:py-24 bg-muted/20">
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

        <div className={cn("grid gap-6 sm:gap-8", colClass)}>
          {props.cards.map((card, idx) => {
            const IconComponent = card.icon ? ICON_MAP[card.icon] || Sparkles : Sparkles;

            return (
              <Card
                key={idx}
                className="group relative overflow-hidden rounded-2xl border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-0">
                  <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                    <IconComponent className="size-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground font-heading">{card.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {card.description}
                  </p>
                  {card.link && (
                    <Link
                      href={card.link.href}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-hover"
                    >
                      <span>{card.link.label}</span>
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

