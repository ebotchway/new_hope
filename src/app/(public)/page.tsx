import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBanner } from "@/components/site/cta-banner";
import { StoryCarousel } from "@/components/site/story-carousel";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { ImpactStatsBar } from "@/components/site/impact-stats-bar";
import { RecentActivityTicker } from "@/components/site/recent-activity-ticker";
import { prisma } from "@/lib/prisma";
import { PLACEHOLDER_IMAGES } from "@/lib/placeholder-images";
import { PARTNERSHIP_TYPES } from "@/lib/partnership-types";

export default async function HomePage() {
  const [settings, stories, totalRaised, activeSponsorships, childrenHelped, recentDonations] =
    await Promise.all([
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
      prisma.story.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        take: 6,
      }),
      prisma.donation.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amountCents: true } }),
      prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
      prisma.child.count({ where: { status: { in: ["SPONSORED", "GRADUATED"] } } }),
      prisma.donation.findMany({
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { child: { select: { name: true } } },
      }),
    ]);

  const heroHeadline = settings?.heroHeadline ?? "Transforming Lives Through Education";
  const heroSubheadline =
    settings?.heroSubheadline ?? "Providing access to education for a brighter future";
  const missionTitle = settings?.missionTitle ?? "Our Guiding Mission";
  const missionBody =
    settings?.missionBody ||
    "At LivingHope, we are dedicated to transforming the lives of street children by providing comprehensive access to quality education. We foster environments where every child can discover their innate potential, cultivate their talents, and build a foundation for a brighter, self-sufficient future.";

  return (
    <>
      <section className="px-4 pt-4">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl">
          <div className="relative flex min-h-[420px] items-start justify-center pt-16 sm:min-h-[480px] sm:pt-24">
            <Image
              src={PLACEHOLDER_IMAGES.homeHero}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
            <div className="relative z-10 max-w-2xl px-6 text-center text-white">
              <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{heroHeadline}</h1>
              <p className="mt-4 text-sm text-white/85 sm:text-base">{heroSubheadline}</p>
            </div>
          </div>

          <div className="relative z-10 mx-4 -mt-20 mb-6 rounded-2xl bg-brand-navy px-6 py-10 text-center text-white sm:mx-10 sm:py-12">
            <h2 className="text-xl font-bold sm:text-2xl">{missionTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/80">{missionBody}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-white text-brand-navy hover:bg-white/90">
                <Link href="/donate">Make a General Donation</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/sponsor-a-child">Sponsor a Street Child</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <RecentActivityTicker
        entries={recentDonations.map((d) => ({
          id: d.id,
          donorName: d.donorName,
          anonymous: d.anonymous,
          amountCents: d.amountCents,
          currency: d.currency,
          createdAt: d.createdAt,
          childName: d.child?.name,
        }))}
      />

      <ImpactStatsBar
        totalRaisedCents={totalRaised._sum.amountCents ?? 0}
        activeSponsorships={activeSponsorships}
        childrenHelped={childrenHelped}
      />

      {stories.length > 0 && (
        <section className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading
                title="Stories of Transformation"
                subtitle="See how the gift of education is unlocking potential and building brighter futures."
                className="mb-10"
              />
            </Reveal>
            <Reveal delay={0.1}>
              <StoryCarousel stories={stories} />
            </Reveal>
          </div>
        </section>
      )}

      <CtaBanner
        title="Find a Child to Sponsor"
        subtitle="Help a child build a brighter future. Your donation provides the education and job training needed to break the cycle of poverty."
        primary={{ href: "/sponsor-a-child", label: "View All Children" }}
        className="pt-0"
      />

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              title="Become a Brightener"
              subtitle="Your partnership fuels our mission. Discover the many ways you can join us to illuminate the future for children in need."
              className="mb-10"
            />
          </Reveal>
          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNERSHIP_TYPES.filter((option) => option.showOnHome).map((option, index) => {
              const Icon = option.icon;
              const highlighted = index === 0;
              return (
                <RevealItem key={option.type}>
                  <Card
                    className={
                      highlighted
                        ? "h-full border-none bg-brand-navy text-white transition-transform duration-300 hover:-translate-y-1"
                        : "h-full border-none bg-secondary transition-transform duration-300 hover:-translate-y-1"
                    }
                  >
                    <CardContent className="flex h-full flex-col gap-4 p-6">
                      <Icon className={highlighted ? "size-6" : "size-6 text-brand-navy"} />
                      <div>
                        <h3 className="font-semibold">{option.title}</h3>
                        <p
                          className={
                            highlighted
                              ? "mt-2 text-sm text-white/80"
                              : "mt-2 text-sm text-muted-foreground"
                          }
                        >
                          {option.teaser}
                        </p>
                      </div>
                      <Link
                        href={`/become-a-brightener?type=${option.type}#inquire`}
                        className={
                          highlighted
                            ? "mt-auto text-sm font-semibold underline-offset-4 hover:underline"
                            : "mt-auto text-sm font-semibold text-brand-navy underline-offset-4 hover:underline"
                        }
                      >
                        Learn More →
                      </Link>
                    </CardContent>
                  </Card>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>
    </>
  );
}
