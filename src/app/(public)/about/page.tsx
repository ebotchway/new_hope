import Image from "next/image";
import { Users, Binoculars, Target, HeartHandshake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBanner } from "@/components/site/cta-banner";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { AnimatedCounter } from "@/components/site/animated-counter";
import { prisma } from "@/lib/prisma";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import { formatDonorDisplayName, formatMoney, timeAgo } from "@/lib/format";

export const metadata = { title: "About Us" };

const VALUES = [
  { label: "Faith", body: "Belief in Possibilities" },
  { label: "Passion", body: "Strongly driven to make a positive difference" },
  { label: "Diligence", body: "Tireless in pursuit of our goals" },
  { label: "Dependability", body: "Steady, Constant and Trustworthy" },
  { label: "Collaboration", body: "Help each other to achieve common good" },
];

export default async function AboutPage() {
  const [stats, history, trustees, recentDonors] = await Promise.all([
    prisma.impactStat.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.historyEvent.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.trustee.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    prisma.donation.findMany({
      where: { status: "SUCCEEDED" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <>
      <PageHero
        title="Transforming Lives of Street-Dwelling Children"
        subtitle="Through education, mentorship, and community support, we're creating pathways to brighter futures for vulnerable children."
        imageUrl={PLACEHOLDER_IMAGES.aboutHero}
      />

      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              eyebrow="Our Story"
              title="About Us"
              subtitle="Learn about our mission, vision, and the values that drive our work with street-dwelling children"
              className="mb-12"
            />
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-2">
            <RevealGroup className="grid gap-5 sm:grid-cols-1">
              <RevealItem className="rounded-2xl bg-secondary p-7 shadow-sm">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-navy/10">
                  <Users className="size-6 text-foreground" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Who We Are</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  LivingHope is a Christian ministry specifically for street children. We are
                  motivated by the love of Christ towards the deprived and less privileged.
                </p>
              </RevealItem>
              <RevealItem className="rounded-2xl bg-secondary p-7 shadow-sm">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-navy/10">
                  <Binoculars className="size-6 text-foreground" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Our Vision</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We are agents of change for a brighter future of street-dwelling children.
                </p>
              </RevealItem>
              <RevealItem className="rounded-2xl bg-secondary p-7 shadow-sm">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-navy/10">
                  <Target className="size-6 text-foreground" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Our Mission</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  To support street-dwelling children through education and preparation for a
                  self-supportive adult life.
                </p>
              </RevealItem>
            </RevealGroup>
            <Reveal direction="left" delay={0.1} className="rounded-3xl bg-brand-navy p-9 text-white shadow-xl shadow-brand-navy/15">
              <h3 className="text-lg font-semibold">Our Values</h3>
              <p className="mt-2 text-sm text-white/80">Our work is rooted in a strong commitment to:</p>
              <ul className="mt-6 space-y-4">
                {VALUES.map((value) => (
                  <li key={value.label} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs">
                      ✓
                    </span>
                    <span>
                      <span className="font-semibold">{value.label}:</span>{" "}
                      <span className="text-white/85">{value.body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="relative px-4 py-24">
          <div className="absolute inset-0">
            <Image src={PLACEHOLDER_IMAGES.impactBand} alt="" fill sizes="100vw" className="object-cover" />
            <div className="absolute inset-0 bg-brand-navy-dark/80" />
          </div>
          <div className="relative mx-auto max-w-4xl text-center text-white">
            <h2 className="text-3xl font-bold sm:text-4xl">Our Impact</h2>
            <p className="mt-3 text-sm text-white/70">
              Through a handful of like-minded friends and family since 2010
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-14 gap-y-10">
              {stats.map((stat) => {
                const numeric = Number(stat.value.replace(/[^0-9.]/g, ""));
                const suffix = stat.value.replace(/[0-9.]/g, "");
                return (
                  <div key={stat.id}>
                    {Number.isFinite(numeric) && numeric > 0 ? (
                      <AnimatedCounter value={numeric} suffix={suffix} className="text-5xl font-bold sm:text-6xl" />
                    ) : (
                      <p className="text-5xl font-bold sm:text-6xl">{stat.value}</p>
                    )}
                    <p className="mt-3 max-w-40 text-sm text-white/80">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading
                eyebrow="Our Journey"
                title="Our History"
                subtitle="The journey of hope and transformation"
                className="mb-12"
              />
            </Reveal>
            <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((event) => (
                <RevealItem
                  key={event.id}
                  className="overflow-hidden rounded-2xl bg-secondary shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
                >
                  {event.imageUrl && (
                    <div className="relative aspect-4/3">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-sm font-bold text-brand-accent">{event.year}</p>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{event.title}</h3>
                    <ul className="mt-3 space-y-1.5">
                      {event.bulletPoints.map((point) => (
                        <li key={point} className="flex gap-2 text-xs text-muted-foreground">
                          <span>•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {trustees.length > 0 && (
        <section className="bg-secondary px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading eyebrow="Leadership" title="Our Trustees" className="mb-12" />
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
              {trustees.map((trustee) => (
                <RevealItem key={trustee.id} className="text-center">
                  <Avatar className="mx-auto size-24 rounded-2xl shadow-sm transition-transform duration-300 hover:scale-105">
                    <AvatarImage src={trustee.photoUrl ?? undefined} alt={trustee.name} className="rounded-2xl" />
                    <AvatarFallback className="rounded-2xl bg-brand-navy text-lg text-white">
                      {trustee.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-3 text-sm font-medium">{trustee.name}</p>
                  {trustee.title && <p className="text-xs text-muted-foreground">{trustee.title}</p>}
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {recentDonors.length > 0 && (
        <section className="px-4 py-24">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <SectionHeading
                eyebrow="Community"
                title="Our Supporters"
                subtitle="A recent, growing list of people whose generosity makes this work possible."
                className="mb-12"
              />
            </Reveal>
            <RevealGroup className="grid gap-3 sm:grid-cols-2">
              {recentDonors.map((donation) => (
                <RevealItem
                  key={donation.id}
                  className="flex items-center gap-3 rounded-xl bg-secondary p-4 shadow-sm"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-foreground">
                    <HeartHandshake className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {formatDonorDisplayName(donation.donorName, donation.anonymous)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(donation.amountCents, donation.currency)} · {timeAgo(donation.createdAt)}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      <CtaBanner
        title="Ready to Make a Difference?"
        subtitle="Every partnership, every contribution, and every hour volunteered helps us provide hope and a brighter future to children in need. Your support transforms lives."
        primary={{ href: "/donate", label: "Make a General Donation" }}
        secondary={{ href: "/sponsor-a-child", label: "Sponsor a Street Child" }}
        className="pt-0"
      />
    </>
  );
}
