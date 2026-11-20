import { HeartHandshake } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SectionHeading } from "@/components/site/section-heading";
import { CtaBanner } from "@/components/site/cta-banner";
import { Reveal, RevealGroup, RevealItem } from "@/components/site/reveal";
import { prisma } from "@/lib/prisma";
import { formatDonorDisplayName, formatMoney, timeAgo } from "@/lib/format";
import { getCmsPage } from "@/lib/cms-loader";
import { CmsSectionRenderer } from "@/components/cms/section-renderer";
import type { Metadata } from "next";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("about");
  return {
    title: page?.seoTitle || "About Us | LivingHope Ghana",
    description:
      page?.seoDescription ||
      "Dedicated to rescuing, educating, and uplifting vulnerable street-connected children across Greater Accra since 2012.",
    openGraph: page?.ogImageUrl ? { images: [page.ogImageUrl] } : undefined,
  };
}

export default async function AboutPage() {
  const [cmsPage, history, trustees, recentDonors] = await Promise.all([
    getCmsPage("about"),
    prisma.historyEvent
      .findMany({ where: { published: true }, orderBy: { order: "asc" } })
      .catch(() => []),
    prisma.trustee
      .findMany({ where: { published: true }, orderBy: { order: "asc" } })
      .catch(() => []),
    prisma.donation
      .findMany({
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
      .catch(() => []),
  ]);

  const sections = cmsPage?.sections || [];

  return (
    <div className="space-y-12 pb-16">
      {/* CMS Managed Sections (Hero, Narrative, Values) */}
      {sections.map((section) => (
        <CmsSectionRenderer key={section.id} section={section} />
      ))}

      {/* Database Milestones History */}
      {history.length > 0 && (
        <section className="px-4 py-8 sm:py-12 bg-muted/20">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <SectionHeading
                eyebrow="Milestones"
                title="Our Journey"
                subtitle="The major milestones that shaped our path to impacting hundreds of children"
                className="mb-6 sm:mb-8"
              />
            </Reveal>
            <div className="space-y-4 sm:space-y-6">
              {history.map((event) => (
                <div key={event.id} className="rounded-xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3 mb-3">
                    <h3 className="text-lg font-bold font-heading">{event.title}</h3>
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary w-fit">
                      {event.year}
                    </span>
                  </div>
                  {event.bulletPoints && event.bulletPoints.length > 0 && (
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {event.bulletPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-brand-primary">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leadership Trustees */}
      {trustees.length > 0 && (
        <section className="px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionHeading
                eyebrow="Leadership"
                title="Board of Trustees"
                subtitle="Fiduciary leadership and oversight ensuring ethical stewardship and programmatic integrity"
                className="mb-6 sm:mb-8"
              />
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {trustees.map((trustee) => (
                <RevealItem key={trustee.id} className="text-center">
                  <Avatar className="mx-auto size-20 rounded-2xl shadow-xs transition-transform duration-300 hover:scale-105">
                    <AvatarImage src={trustee.photoUrl ?? undefined} alt={trustee.name} className="rounded-2xl" />
                    <AvatarFallback className="rounded-2xl bg-brand-navy text-lg text-white">
                      {trustee.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-2.5 text-sm font-bold font-heading">{trustee.name}</p>
                  {trustee.title && <p className="text-xs text-muted-foreground">{trustee.title}</p>}
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>
      )}

      {/* Recent Community Supporters */}
      {recentDonors.length > 0 && (
        <section className="px-4 py-8 sm:py-10 bg-muted/30">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <SectionHeading
                eyebrow="Community"
                title="Our Supporters"
                subtitle="A recent, growing list of generous partners whose gifts make this work possible"
                className="mb-10"
              />
            </Reveal>
            <RevealGroup className="grid gap-3 sm:grid-cols-2">
              {recentDonors.map((donation) => (
                <RevealItem
                  key={donation.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-xs"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <HeartHandshake className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
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
        subtitle="Every partnership, every contribution, and every hour volunteered helps us provide hope and a brighter future to children in need."
        primary={{ href: "/donate", label: "Make a General Donation" }}
        secondary={{ href: "/sponsor-a-child", label: "Sponsor a Street Child" }}
        className="pt-0"
      />
    </div>
  );
}
