import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { getCmsPage } from "@/lib/cms-loader";
import { CmsSectionRenderer } from "@/components/cms/section-renderer";
import { CmsPartnershipCtaSection } from "@/components/cms/sections/partnership-cta-section";
import { CmsDonationCtaSection } from "@/components/cms/sections/donation-cta-section";
import type { PartnershipCtaSectionProps, DonationCtaSectionProps } from "@/lib/cms-types";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("home");
  return {
    title: page?.seoTitle || "LivingHope — Restoring Hope to Children in Ghana",
    description:
      page?.seoDescription ||
      "Empowering underprivileged street-connected children through education, nutrition, shelter, and vocational training.",
    openGraph: page?.ogImageUrl ? { images: [page.ogImageUrl] } : undefined,
  };
}

export default async function HomePage() {
  const [
    cmsPage,
    stories,
    totalRaised,
    activeSponsorships,
    childrenHelped,
    recentDonations,
    urgentChildren,
  ] = await Promise.all([
    getCmsPage("home"),
    prisma.story
      .findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        take: 6,
      })
      .catch(() => []),
    prisma.donation
      .aggregate({ where: { status: "SUCCEEDED" }, _sum: { amountCents: true } })
      .catch(() => ({ _sum: { amountCents: null } })),
    prisma.sponsorship.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.child
      .count({ where: { status: { in: ["SPONSORED", "GRADUATED"] }, archived: false } })
      .catch(() => 0),
    prisma.donation
      .findMany({
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { child: { select: { name: true } } },
      })
      .catch(() => []),
    prisma.child
      .findMany({
        where: { status: "AVAILABLE", archived: false },
        orderBy: [{ featured: "desc" }, { order: "asc" }],
        take: 6,
      })
      .catch(() => []),
  ]);

  const liveStats = {
    totalRaisedFormatted: totalRaised._sum.amountCents
      ? formatMoney(totalRaised._sum.amountCents, "USD")
      : "$120K+",
    childrenHelped: childrenHelped || 450,
    activeSponsorships: activeSponsorships || 85,
  };

  const childrenData = urgentChildren.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    dateOfBirth: c.dateOfBirth || new Date(2015, 0, 1),
    gender: c.gender,
    location: c.location,
    photoUrl: c.photoUrl,
    summary: c.bio,
    fundingGoalCents: c.fundingGoalCents,
  }));

  const storySummaries = stories.map((s) => ({
    id: s.id,
    name: s.name,
    age: s.age,
    quote: s.quote,
    mediaUrl: s.mediaUrl,
    imageUrl: s.imageUrl,
  }));

  const recentDonationEntries = recentDonations.map((d) => ({
    id: d.id,
    donorName: d.donorName,
    anonymous: d.anonymous,
    amountCents: d.amountCents,
    currency: d.currency,
    createdAt: d.createdAt,
    childName: d.child?.name,
  }));

  const sections = cmsPage?.sections || [];

  // Detect whether both partnership_cta and donation_cta exist to render as a balanced side-by-side grid
  const partnershipSec = sections.find((s) => s.type === "partnership_cta" && s.enabled);
  const donationSec = sections.find((s) => s.type === "donation_cta" && s.enabled);
  const shouldPairCtas = Boolean(partnershipSec && donationSec);

  // Group or filter sections
  const renderedSections = sections.filter((s) => {
    if (shouldPairCtas && (s.type === "partnership_cta" || s.type === "donation_cta")) {
      return false; // Handled specially in paired grid below
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12">
      {renderedSections.map((section) => (
        <CmsSectionRenderer
          key={section.id}
          section={section}
          liveStats={liveStats}
          childrenData={childrenData}
          stories={storySummaries}
          recentDonations={recentDonationEntries}
        />
      ))}

      {/* Coordinated Two-Column CTA Section */}
      {shouldPairCtas && partnershipSec && donationSec && (
        <section className="px-4 py-8 sm:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-2 items-stretch">
              <CmsPartnershipCtaSection props={partnershipSec.props as PartnershipCtaSectionProps} />
              <CmsDonationCtaSection props={donationSec.props as DonationCtaSectionProps} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
