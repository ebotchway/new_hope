import { CtaBanner } from "@/components/site/cta-banner";
import { getCmsPage } from "@/lib/cms-loader";
import { CmsSectionRenderer } from "@/components/cms/section-renderer";
import type { Metadata } from "next";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("what-we-do");
  return {
    title: page?.seoTitle || "What We Do | LivingHope Ghana",
    description:
      page?.seoDescription ||
      "Connecting generous people to vulnerable street-connected children through schooling, nutrition, and vocational training.",
    openGraph: page?.ogImageUrl ? { images: [page.ogImageUrl] } : undefined,
  };
}

export default async function WhatWeDoPage() {
  const cmsPage = await getCmsPage("what-we-do");
  const sections = cmsPage?.sections || [];

  return (
    <div className="space-y-6 pb-16">
      {sections.map((section) => (
        <CmsSectionRenderer key={section.id} section={section} />
      ))}

      <CtaBanner
        title="Ready to Help an Impoverished Child?"
        subtitle="Your generosity provides an immediate pathway from street dependency to independent, educated adulthood."
        primary={{ href: "/sponsor-a-child", label: "Sponsor a Child" }}
        secondary={{ href: "/donate", label: "Make a General Donation" }}
      />
    </div>
  );
}
