import Image from "next/image";
import Link from "next/link";
import { Search, PointerIcon, Heart, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBanner } from "@/components/site/cta-banner";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { ChildFilterBar } from "@/components/site/child-filter-bar";
import { SponsorshipProgress } from "@/components/site/sponsorship-progress";
import { prisma } from "@/lib/prisma";
import { getRaisedAmountsByChild } from "@/lib/child-funding";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import { calculateAge } from "@/lib/format";
import type { Gender } from "@/generated/prisma/enums";

export const metadata = { title: "Sponsor a Child" };

const STEPS = [
  { icon: Search, title: "Check Available Children", body: "View profiles of children waiting for help" },
  { icon: PointerIcon, title: "Choose a Child", body: "Select a child you connect with" },
  { icon: Heart, title: "Select Sponsorship", body: "Choose your donation type and amount" },
  { icon: Globe, title: "Stay in Touch", body: "Enquire about your child's progress" },
];

const BENEFITS = [
  "Your donations will be used for school fees, books and stationery etc.",
  "You can be connected directly to the head of the school if you wish to enquire about your child directly",
  "You would be able to access termly reports for the child via this website",
  "You can correspond directly with the child via video exchanges on our website",
  "You can sponsor a child for a minimum of one academic year",
  "Consult your inland revenue office for tax deduction",
];

export default async function SponsorAChildPage(props: PageProps<"/sponsor-a-child">) {
  const searchParams = await props.searchParams;
  const gender = typeof searchParams.gender === "string" ? searchParams.gender : undefined;
  const location = typeof searchParams.location === "string" ? searchParams.location : undefined;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "featured";

  const allLocations = await prisma.child.findMany({
    where: { status: "AVAILABLE", location: { not: null } },
    select: { location: true },
    distinct: ["location"],
  });

  const children = await prisma.child.findMany({
    where: {
      status: "AVAILABLE",
      ...(gender ? { gender: gender as Gender } : {}),
      ...(location ? { location } : {}),
    },
    orderBy:
      sort === "newest" ? [{ createdAt: "desc" }] : [{ featured: "desc" }, { order: "asc" }],
  });

  const raisedByChild = await getRaisedAmountsByChild(
    children.filter((c) => c.fundingGoalCents > 0).map((c) => c.id)
  );

  return (
    <>
      <PageHero
        title="Sponsor a Child's Education"
        subtitle="Give the gift of education and transform a child's future today."
        imageUrl={PLACEHOLDER_IMAGES.sponsorHero}
      >
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-white text-brand-navy hover:bg-white/90">
            <Link href="#available-children">Browse Children</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="#how-it-works">Learn More</Link>
          </Button>
        </div>
      </PageHero>

      <section id="how-it-works" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading title="How Child Sponsorship Works" className="mb-10" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative mb-12 aspect-21/9 overflow-hidden rounded-2xl">
              <Image
                src={PLACEHOLDER_IMAGES.brightenerHero}
                alt="Children who could be sponsored"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          <RevealGroup className="grid gap-8 sm:grid-cols-4">
            {STEPS.map((step) => (
              <RevealItem key={step.title} className="flex flex-col items-center gap-3 text-center">
                <step.icon className="size-6 text-brand-navy" />
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.body}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="bg-secondary px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionHeading title="When You Sponsor a Child's Education" className="mb-10" />
          </Reveal>
          <RevealGroup className="space-y-4">
            {BENEFITS.map((benefit) => (
              <RevealItem key={benefit} className="flex items-start gap-3 text-sm sm:text-base">
                <Badge className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-navy p-0 text-white">
                  ✓
                </Badge>
                {benefit}
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="available-children" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              title="Children Waiting for a Sponsor"
              subtitle="Every profile below represents a child ready to begin, or continue, their education journey."
              className="mb-8"
            />
          </Reveal>

          <ChildFilterBar locations={allLocations.map((l) => l.location!).filter(Boolean)} />

          {children.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No children match these filters right now. Try a different search, or check back soon.
            </p>
          ) : (
            <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((child) => {
                const age = calculateAge(child.dateOfBirth);
                const raised = raisedByChild.get(child.id) ?? 0;
                return (
                  <RevealItem key={child.id}>
                    <Link href={`/sponsor-a-child/${child.slug}`} className="group block h-full">
                      <Card className="h-full overflow-hidden border-none bg-secondary py-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <div className="relative aspect-4/3 overflow-hidden bg-muted">
                          {child.photoUrl ? (
                            <Image
                              src={child.photoUrl}
                              alt={child.name}
                              fill
                              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Avatar className="size-16">
                                <AvatarFallback className="bg-brand-navy text-lg text-white">
                                  {child.name.slice(0, 1)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{child.name}</h3>
                            {age !== null && (
                              <span className="text-xs text-muted-foreground">{age} yrs</span>
                            )}
                          </div>
                          {child.location && (
                            <p className="mt-1 text-xs text-muted-foreground">{child.location}</p>
                          )}
                          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                            {child.bio}
                          </p>
                          {child.fundingGoalCents > 0 && (
                            <div className="mt-4">
                              <SponsorshipProgress raisedCents={raised} goalCents={child.fundingGoalCents} />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          )}
        </div>
      </section>

      <CtaBanner
        title="Find a Child to Sponsor"
        primary={{ href: "#available-children", label: "View All Children" }}
        className="pt-0"
      />
    </>
  );
}
