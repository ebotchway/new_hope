import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal } from "@/components/site/reveal";
import { SponsorshipProgress } from "@/components/site/sponsorship-progress";
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

  return (
    <section className="px-4 py-16">
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
        <Reveal direction="right" className="relative aspect-4/5 overflow-hidden rounded-2xl bg-muted">
          {child.photoUrl ? (
            <Image src={child.photoUrl} alt={child.name} fill sizes="(min-width: 640px) 40vw, 90vw" className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Avatar className="size-24">
                <AvatarFallback className="bg-brand-navy text-3xl text-white">
                  {child.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </Reveal>

        <Reveal direction="left" delay={0.1}>
          <Badge variant={isAvailable ? "default" : "secondary"} className="mb-4 bg-brand-navy">
            {isAvailable ? "Available for sponsorship" : child.status === "SPONSORED" ? "Sponsored" : "Graduated"}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-brand-navy">{child.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {age !== null && <span>{age} years old</span>}
            {child.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {child.location}
              </span>
            )}
            {child.school && (
              <span className="flex items-center gap-1">
                <School className="size-3.5" />
                {child.school}
              </span>
            )}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-foreground sm:text-base">{child.bio}</p>

          {raised && (
            <div className="mt-6">
              <SponsorshipProgress raisedCents={raised.get(child.id) ?? 0} goalCents={child.fundingGoalCents} />
            </div>
          )}

          {isAvailable ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link href={`/donate?childId=${child.id}&frequency=MONTHLY`}>
                  Sponsor {child.name.split(" ")[0]} Monthly
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link href={`/donate?childId=${child.id}&frequency=ONE_TIME`}>Make a One-Time Gift</Link>
              </Button>
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              {child.name} is currently sponsored — thank you for your interest! Browse other
              children who are still waiting.
            </p>
          )}

          <Link
            href="/sponsor-a-child"
            className="mt-8 inline-block text-sm font-medium text-brand-navy underline-offset-4 hover:underline"
          >
            ← Back to all children
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
