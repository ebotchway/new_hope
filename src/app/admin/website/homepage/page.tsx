import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requireStaff } from "@/lib/session";
import { HomepageBuilder } from "@/components/admin/cms/homepage-builder";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/cms-defaults";
import { CmsSection } from "@/lib/cms-types";

export const metadata = {
  title: "Homepage Builder | LivingHope Admin",
};

export default async function AdminHomepageBuilderPage() {
  await requireStaff();

  let homePage = await prisma.cmsPage.findUnique({
    where: { slug: "home" },
    include: {
      revisions: {
        orderBy: { revisionNumber: "desc" },
        take: 25,
      },
    },
  });

  // If not created yet in DB, create it now
  if (!homePage) {
    homePage = await prisma.cmsPage.create({
      data: {
        slug: "home",
        title: "Homepage",
        publicTitle: "LivingHope — Restoring Hope to Children in Ghana",
        description: "Nonprofit charity supporting street-connected children in Ghana",
        status: "PUBLISHED",
        isSystem: true,
        publishedAt: new Date(),
      },
      include: {
        revisions: true,
      },
    });

    const rev = await prisma.cmsRevision.create({
      data: {
        pageId: homePage.id,
        revisionNumber: 1,
        authorName: "System",
        sections: DEFAULT_HOMEPAGE_SECTIONS as unknown as Prisma.InputJsonValue,
        changelog: "Initial homepage setup",
      },
    });

    await prisma.cmsPage.update({
      where: { id: homePage.id },
      data: { publishedRevisionId: rev.id },
    });

    homePage.publishedRevisionId = rev.id;
    homePage.revisions = [rev];
  }

  const latestRevision = homePage.revisions[0];
  const initialSections: CmsSection[] =
    latestRevision && Array.isArray(latestRevision.sections)
      ? (latestRevision.sections as unknown as CmsSection[])
      : DEFAULT_HOMEPAGE_SECTIONS;

  return (
    <HomepageBuilder
      pageId={homePage.id}
      initialSections={initialSections}
      publishedRevisionId={homePage.publishedRevisionId}
      revisions={homePage.revisions.map((r) => ({
        id: r.id,
        revisionNumber: r.revisionNumber,
        authorName: r.authorName,
        changelog: r.changelog,
        createdAt: r.createdAt,
      }))}
    />
  );
}
