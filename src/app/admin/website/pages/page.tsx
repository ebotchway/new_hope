import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/session";
import { PagesManager, PageListItem } from "@/components/admin/cms/pages-manager";

export const metadata = {
  title: "Pages Manager | LivingHope Admin",
};

export default async function AdminPagesPage() {
  await requireStaff();

  const pages = await prisma.cmsPage.findMany({
    orderBy: [{ isSystem: "desc" }, { title: "asc" }],
    include: {
      revisions: {
        select: {
          id: true,
          revisionNumber: true,
        },
      },
    },
  });

  const formattedPages: PageListItem[] = pages.map((p) => {
    const publishedRev = p.revisions.find((r) => r.id === p.publishedRevisionId);
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      publicTitle: p.publicTitle,
      description: p.description,
      status: p.status,
      isSystem: p.isSystem,
      publishedAt: p.publishedAt,
      updatedAt: p.updatedAt,
      revisionCount: p.revisions.length,
      publishedRevisionNumber: publishedRev ? publishedRev.revisionNumber : null,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
    };
  });

  return <PagesManager initialPages={formattedPages} />;
}

