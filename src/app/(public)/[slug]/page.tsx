import { notFound } from "next/navigation";
import { getCmsPage } from "@/lib/cms-loader";
import { CmsSectionRenderer } from "@/components/cms/section-renderer";
import type { Metadata } from "next";

interface DynamicCmsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: DynamicCmsPageProps): Promise<Metadata> {
  const params = await props.params;
  const page = await getCmsPage(params.slug);

  if (!page) {
    return { title: "Page Not Found | LivingHope" };
  }

  return {
    title: `${page.seoTitle || page.title} | LivingHope`,
    description: page.seoDescription || page.description || undefined,
    openGraph: page.ogImageUrl ? { images: [page.ogImageUrl] } : undefined,
  };
}

export default async function DynamicCmsPage(props: DynamicCmsPageProps) {
  const params = await props.params;
  const page = await getCmsPage(params.slug);

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="space-y-8 pb-16">
      {page.sections.map((section) => (
        <CmsSectionRenderer key={section.id} section={section} />
      ))}
    </div>
  );
}

