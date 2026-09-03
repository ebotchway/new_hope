import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/site/reveal";
import { SponsorshipProgress } from "@/components/site/sponsorship-progress";
import { ChildPhotoPlaceholder } from "@/components/site/child-photo-placeholder";
import { ChildUpdateTimeline } from "@/components/site/child-update-timeline";
import { prisma } from "@/lib/prisma";
import { getRaisedAmountsByChild } from "@/lib/child-funding";
import { calculateAge } from "@/lib/format";

export async function generateMetadata(props: PageProps<"/sponsor-a-child/[slug]">) {
  const { slug } = await props.params;
  const child = await prisma.child.findUnique({ where: { slug } });
  return { title: child ? child.name : "Child not found" };
}

export default async function ChildDetailPage(props: PageProps<"/sponsor-a-child/[slug]">) {
  const { slug } = await props.params;
  const child = await prisma.child.findUnique({ where: { slug } });

  if (!child) notFound();

  const age = calculateAge(child.dateOfBirth);
  const isAvailable = child.status === "AVAILABLE";
  const raised = child.fundingGoalCents > 0 ? await getRaisedAmountsByChild([child.id]) : null;
  const updates = await prisma.childUpdate.findMany({
    where: { childId: child.id, published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
    <section className="px-4 py-20">
      <div className="mx-auto grid max-w-6xl gap-12 sm:grid-cols-2 sm:items-center">
        <Reveal direction="right" className="relative aspect-4/5 overflow-hidden rounded-3xl bg-muted shadow-sm">
          {child.photoUrl ? (
            <Image src={child.photoUrl} alt={child.name} fill sizes="(min-width: 640px) 40vw, 90vw" className="object-cover" />
          ) : (
            <ChildPhotoPlaceholder />
          )}
        </Reveal>

        <Reveal direction="left" delay={0.1}>
          <Badge variant={isAvailable ? "default" : "secondary"} className="mb-5 rounded-full bg-brand-navy px-3 py-1">
            {isAvailable ? "Available for sponsorship" : child.status === "SPONSORED" ? "Sponsored" : "Graduated"}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{child.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
            {age !== null && <span>{age} years old</span>}
            {child.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-4" />
                {child.location}
              </span>
            )}
            {child.school && (
              <span className="flex items-center gap-1.5">
                <School className="size-4" />
                {child.school}
              </span>
            )}
          </div>

          <p className="mt-7 text-base leading-relaxed text-foreground">{child.bio}</p>

          {raised && (
            <div className="mt-7 rounded-2xl bg-secondary p-5">
              <SponsorshipProgress raisedCents={raised.get(child.id) ?? 0} goalCents={child.fundingGoalCents} />
            </div>
          )}

          {isAvailable ? (
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href={`/donate?childId=${child.id}&frequency=MONTHLY`}>
                  Sponsor {child.name.split(" ")[0]} Monthly
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7">
                <Link href={`/donate?childId=${child.id}&frequency=ONE_TIME`}>Make a One-Time Gift</Link>
              </Button>
            </div>
          ) : (
            <p className="mt-9 text-sm text-muted-foreground">
              {child.name} is currently sponsored — thank you for your interest! Browse other
              children who are still waiting.
            </p>
          )}

          <Link
            href="/sponsor-a-child"
            className="mt-9 inline-block text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Back to all children
          </Link>
        </Reveal>
      </div>
    </section>
    <ChildUpdateTimeline childName={child.name} updates={updates} />
    </>
  );
}
