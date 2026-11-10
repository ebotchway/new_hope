import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { PageSectionsEditor } from "@/components/admin/cms/page-sections-editor";
import { CmsSection } from "@/lib/cms-types";

export const metadata = {
  title: "Edit Page Sections | LivingHope Admin",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPageSectionsPage(props: PageProps) {
  await requireStaff();
  const params = await props.params;

  const page = await prisma.cmsPage.findUnique({
    where: { id: params.id },
    include: {
      revisions: {
        orderBy: { revisionNumber: "desc" },
        take: 25,
      },
    },
  });

  if (!page) {
    notFound();
  }

  const latestRevision = page.revisions[0];
  const initialSections: CmsSection[] =
    latestRevision && Array.isArray(latestRevision.sections)
      ? (latestRevision.sections as unknown as CmsSection[])
      : [];

  return (
    <PageSectionsEditor
      pageId={page.id}
      pageTitle={page.title}
      slug={page.slug}
      initialSections={initialSections}
      publishedRevisionId={page.publishedRevisionId}
      revisions={page.revisions.map((r) => ({
        id: r.id,
        revisionNumber: r.revisionNumber,
        authorName: r.authorName,
        changelog: r.changelog,
        createdAt: r.createdAt,
      }))}
    />
  );
}

