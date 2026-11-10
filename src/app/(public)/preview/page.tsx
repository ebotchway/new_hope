import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, ArrowLeft } from "lucide-react";
import { requireStaff } from "@/lib/session";
import { getCmsPage } from "@/lib/cms-loader";
import { CmsSectionRenderer } from "@/components/cms/section-renderer";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Preview Mode | LivingHope CMS",
};

interface PreviewPageProps {
  searchParams: Promise<{ slug?: string; revision?: string }>;
}

export default async function CmsPreviewPage(props: PreviewPageProps) {
  await requireStaff();
  const searchParams = await props.searchParams;
  const slug = searchParams.slug || "home";
  const revisionId = searchParams.revision;

  const page = await getCmsPage(slug, {
    previewRevisionId: revisionId,
    isStaffPreview: true,
  });

  if (!page) {
    notFound();
  }

  // Fetch contextual preview data
  const [totalRaised, activeSponsorships, childrenHelped, recentDonations, stories, urgentChildren] =
    await Promise.all([
      prisma.donation.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amountCents: true } }),
      prisma.sponsorship.count({ where: { status: "ACTIVE" } }),
      prisma.child.count({ where: { status: { in: ["SPONSORED", "GRADUATED"] }, archived: false } }),
      prisma.donation.findMany({
        where: { status: "SUCCEEDED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { child: { select: { name: true } } },
      }),
      prisma.story.findMany({
        where: { published: true },
        orderBy: { order: "asc" },
        take: 6,
      }),
      prisma.child.findMany({
        where: { status: "AVAILABLE", archived: false },
        orderBy: [{ featured: "desc" }, { order: "asc" }],
        take: 6,
      }),
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

  return (
    <div>
      {/* Floating Preview Mode Banner */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/30 bg-amber-500/90 px-6 py-2.5 text-slate-950 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Eye className="size-4 animate-pulse" />
          <span>
            PREVIEW MODE: Viewing draft of &ldquo;{page.title}&rdquo; (Revision #{page.revisionNumber || "Draft"})
          </span>
          <span className="hidden sm:inline text-xs bg-black/15 px-2 py-0.5 rounded-md">
            Not visible to public visitors
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild size="sm" variant="outline" className="border-black/20 bg-white/20 hover:bg-white/40 text-slate-950 h-8 rounded-lg text-xs font-bold">
            <Link href={slug === "home" ? "/admin/website/homepage" : `/admin/website/pages`}>
              <ArrowLeft className="mr-1 size-3.5" />
              <span>Back to Editor</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-12 pb-16">
        {page.sections.map((section) => (
          <CmsSectionRenderer
            key={section.id}
            section={section}
            liveStats={liveStats}
            childrenData={childrenData}
            stories={storySummaries}
            recentDonations={recentDonationEntries}
          />
        ))}
      </div>
    </div>
  );
}
