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
      <section className="px-4 pt-2">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl">
          <div className="relative flex min-h-135 items-start justify-center pt-20 sm:min-h-165 sm:pt-28">
            <Image
              src={PLACEHOLDER_IMAGES.homeHero}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65" />
            <div className="relative z-10 max-w-3xl px-6 text-center text-white">
              <h1 className="text-4xl tracking-tight text-balance sm:text-6xl lg:text-7xl">
                {heroHeadline}
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/90 sm:text-lg">
                {heroSubheadline}
              </p>
            </div>
          </div>

          <div
            className="relative z-10 mx-4 -mt-24 mb-6 rounded-3xl bg-brand-navy px-6 py-12 text-center text-white sm:mx-10 sm:py-16"
            style={{
              backgroundImage:
                "radial-gradient(120% 140% at 85% 110%, color-mix(in oklch, var(--brand-navy-dark) 55%, transparent), transparent 60%)",
            }}
          >
            <h2 className="text-2xl tracking-tight sm:text-3xl lg:text-4xl">{missionTitle}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/85">
              {missionBody}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-7 text-base text-brand-navy shadow-lg shadow-black/20 hover:bg-white/90"
              >
                <Link href="/donate">Make a General Donation</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-transparent px-7 text-base text-white hover:bg-white/10 hover:text-white"
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
        <section className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading
                eyebrow="Real Stories"
                title="Stories of Transformation"
                subtitle="See how the gift of education is unlocking potential and building brighter futures."
                className="mb-12"
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

      <section className="px-4 pb-28">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionHeading
              eyebrow="Get Involved"
              title="Become a Brightener"
              subtitle="Your partnership fuels our mission. Discover the many ways you can join us to illuminate the future for children in need."
              className="mb-12"
            />
          </Reveal>
          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNERSHIP_TYPES.filter((option) => option.showOnHome).map((option, index) => {
              const Icon = option.icon;
              const highlighted = index === 0;
              return (
                <RevealItem key={option.type}>
                  <Card
                    className={
                      highlighted
                        ? "h-full rounded-2xl border-none bg-brand-navy text-white shadow-xl shadow-brand-navy/15 transition-all duration-300 hover:-translate-y-1.5"
                        : "h-full rounded-2xl border-none bg-secondary shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
                    }
                  >
                    <CardContent className="flex h-full flex-col gap-4 p-7">
                      <span
                        className={
                          highlighted
                            ? "flex size-11 items-center justify-center rounded-xl bg-white/15"
                            : "flex size-11 items-center justify-center rounded-xl bg-brand-navy/10"
                        }
                      >
                        <Icon className={highlighted ? "size-5" : "size-5 text-foreground"} />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold">{option.title}</h3>
                        <p
                          className={
                            highlighted
                              ? "mt-2 text-sm leading-relaxed text-white/80"
                              : "mt-2 text-sm leading-relaxed text-muted-foreground"
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
                            : "mt-auto text-sm font-semibold text-foreground underline-offset-4 hover:underline"
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
