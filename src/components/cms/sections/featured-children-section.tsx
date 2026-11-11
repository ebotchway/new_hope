import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChildPhotoPlaceholder } from "@/components/site/child-photo-placeholder";
import { FeaturedChildrenSectionProps } from "@/lib/cms-types";
import { calculateAge } from "@/lib/format";

export interface FeaturedChildSummary {
  id: string;
  name: string;
  slug: string;
  dateOfBirth: Date | string;
  gender: string;
  location: string | null;
  photoUrl: string | null;
  summary: string | null;
  fundingGoalCents: number;
}

export function CmsFeaturedChildrenSection({
  props,
  childrenData = [],
}: {
  props: FeaturedChildrenSectionProps;
  childrenData?: FeaturedChildSummary[];
}) {
  const displayChildren = childrenData.slice(0, props.maxCount || 3);

  return (
    <section className="px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end mb-8 sm:mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl font-heading">
              {props.heading}
            </h2>
            {props.subheading && (
              <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-2xl">
                {props.subheading}
              </p>
            )}
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/sponsor-a-child" className="flex items-center gap-2">
              <span>View All Children</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {displayChildren.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              No children currently waiting for sponsorship.
            </p>
            <Button asChild className="mt-4 rounded-xl">
              <Link href="/sponsor-a-child">Browse Sponsorship Directory</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayChildren.map((child) => {
              const age = calculateAge(new Date(child.dateOfBirth));
              return (
                <Card
                  key={child.id}
                  className="group overflow-hidden rounded-2xl border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                    {child.photoUrl ? (
                      <Image
                        src={child.photoUrl}
                        alt={child.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <ChildPhotoPlaceholder name={child.name} className="size-full" />
                    )}
                    <Badge className="absolute top-3 right-3 bg-brand-primary text-white backdrop-blur-xs font-semibold">
                      Awaiting Sponsor
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-foreground font-heading">{child.name}</h3>
                      <span className="text-sm font-semibold text-muted-foreground">
                        Age {age}
                      </span>
                    </div>
                    {child.location && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {child.location}
                      </p>
                    )}
                    {child.summary && (
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {child.summary}
                      </p>
                    )}
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                      <Button asChild className="w-full rounded-xl bg-brand-primary hover:bg-brand-primary-hover shadow-sm">
                        <Link href={`/sponsor-a-child/${child.slug}`}>
                          <Heart className="mr-2 size-4 fill-white" />
                          <span>Sponsor {child.name}</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
