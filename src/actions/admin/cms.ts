"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { uploadFile, deleteFile } from "@/lib/storage";
import {
  isReservedSlug,
  cmsSectionSchema,
  cmsAppearanceSchema,
  cmsNavItemSchema,
} from "@/lib/cms-validations";
import { CmsSection } from "@/lib/cms-types";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_WHAT_WE_DO_SECTIONS,
} from "@/lib/cms-defaults";
import type { NavMenu } from "@/generated/prisma/enums";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Creates or updates a draft revision for a CMS page.
 */
export async function savePageDraft(
  pageId: string,
  sections: CmsSection[],
  changelog?: string
): Promise<ActionResult<{ revisionId: string; revisionNumber: number }>> {
  const session = await requireStaff();

  // Validate sections array
  if (!Array.isArray(sections)) {
    return { success: false, error: "Sections payload must be an array" };
  }

  for (let i = 0; i < sections.length; i++) {
    const parsed = cmsSectionSchema.safeParse(sections[i]);
    if (!parsed.success) {
      return {
        success: false,
        error: `Section #${i + 1} (${sections[i]?.type || "unknown"}) has invalid schema: ${parsed.error.issues[0]?.message}`,
      };
    }
  }

  const page = await prisma.cmsPage.findUnique({
    where: { id: pageId },
    include: {
      revisions: {
        orderBy: { revisionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!page) {
    return { success: false, error: "Page not found" };
  }

  const lastRevisionNumber = page.revisions[0]?.revisionNumber || 0;
  const nextRevisionNumber = lastRevisionNumber + 1;

  const revision = await prisma.cmsRevision.create({
    data: {
      pageId: page.id,
      revisionNumber: nextRevisionNumber,
      authorId: session.user.id,
      authorName: session.user.name || session.user.email || "Staff Editor",
      sections: sections as unknown as Prisma.InputJsonValue,
      changelog: changelog || `Draft updated (v${nextRevisionNumber})`,
    },
  });

  await prisma.cmsAuditLog.create({
    data: {
      pageId: page.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: "REVISION_DRAFT_SAVED",
      details: {
        revisionId: revision.id,
        revisionNumber: nextRevisionNumber,
        sectionCount: sections.length,
      },
    },
  });

  return {
    success: true,
    data: { revisionId: revision.id, revisionNumber: nextRevisionNumber },
  };
}

/**
 * Atomically publishes a specific revision of a page.
 */
export async function publishPageRevision(
  pageId: string,
  revisionId: string
): Promise<ActionResult<{ publishedAt: Date }>> {
  const session = await requireStaff();

  const revision = await prisma.cmsRevision.findUnique({
    where: { id: revisionId },
    include: { page: true },
  });

  if (!revision || revision.pageId !== pageId) {
    return { success: false, error: "Revision not found for this page" };
  }

  const publishedAt = new Date();

  await prisma.cmsPage.update({
    where: { id: pageId },
    data: {
      publishedRevisionId: revision.id,
      status: "PUBLISHED",
      publishedAt,
    },
  });

  await prisma.cmsAuditLog.create({
    data: {
      pageId,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: "PAGE_PUBLISHED",
      details: {
        revisionId: revision.id,
        revisionNumber: revision.revisionNumber,
        publishedAt,
      },
    },
  });

  // Revalidate public routes
  if (revision.page.slug === "home") {
    revalidatePath("/");
  } else {
    revalidatePath(`/${revision.page.slug}`);
  }
  revalidatePath(`/admin/website/pages`);
  revalidatePath(`/admin/website/homepage`);

  return { success: true, data: { publishedAt } };
}

/**
 * Unpublishes a page (switches status to DRAFT).
 */
export async function unpublishPage(pageId: string): Promise<ActionResult> {
  const session = await requireStaff();

  const page = await prisma.cmsPage.findUnique({ where: { id: pageId } });
  if (!page) {
    return { success: false, error: "Page not found" };
  }

  await prisma.cmsPage.update({
    where: { id: pageId },
    data: {
      status: "DRAFT",
    },
  });

  await prisma.cmsAuditLog.create({
    data: {
      pageId,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: "PAGE_UNPUBLISHED",
      details: { slug: page.slug },
    },
  });

  if (page.slug === "home") {
    revalidatePath("/");
  } else {
    revalidatePath(`/${page.slug}`);
  }
  revalidatePath("/admin/website/pages");
  revalidatePath("/admin/website/homepage");

  return { success: true };
}

/**
 * Schedules a revision to be published at a future timestamp.
 */
export async function schedulePagePublish(
  pageId: string,
  revisionId: string,
  publishAt: Date
): Promise<ActionResult> {
  const session = await requireStaff();

  const revision = await prisma.cmsRevision.findUnique({
    where: { id: revisionId },
    include: { page: true },
  });

  if (!revision || revision.pageId !== pageId) {
    return { success: false, error: "Revision not found for this page" };
  }

  if (publishAt.getTime() <= Date.now()) {
    return { success: false, error: "Scheduled publication time must be in the future" };
  }

  await prisma.cmsPage.update({
    where: { id: pageId },
    data: {
      publishedRevisionId: revision.id,
      status: "PUBLISHED",
      publishedAt: publishAt,
    },
  });

  await prisma.cmsAuditLog.create({
    data: {
      pageId,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: "PAGE_PUBLISH_SCHEDULED",
      details: {
        revisionId: revision.id,
        revisionNumber: revision.revisionNumber,
        scheduledFor: publishAt,
      },
    },
  });

  revalidatePath("/admin/website/pages");
  revalidatePath("/admin/website/homepage");

  return { success: true };
}

/**
 * Fetches media assets for the visual media picker dialog.
 */
export async function getCmsMediaAssetsList(folder?: string) {
  await requireStaff();

  return prisma.cmsMediaAsset.findMany({
    where: folder && folder !== "all" ? { folder } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      url: true,
      filename: true,
      altText: true,
      caption: true,
      folder: true,
      sizeBytes: true,
      mimeType: true,
      createdAt: true,
    },
  });
}

/**
 * Compares two revisions and returns their section diff breakdown.
 */
export async function compareRevisions(
  revAId: string,
  revBId: string
): Promise<ActionResult<{
  revA: { number: number; author: string | null; date: Date; sections: CmsSection[] };
  revB: { number: number; author: string | null; date: Date; sections: CmsSection[] };
}>> {
  await requireStaff();

  const [revA, revB] = await Promise.all([
    prisma.cmsRevision.findUnique({ where: { id: revAId } }),
    prisma.cmsRevision.findUnique({ where: { id: revBId } }),
  ]);

  if (!revA || !revB) {
    return { success: false, error: "One or both revisions were not found" };
  }

  return {
    success: true,
    data: {
      revA: {
        number: revA.revisionNumber,
        author: revA.authorName,
        date: revA.createdAt,
        sections: revA.sections as unknown as CmsSection[],
      },
      revB: {
        number: revB.revisionNumber,
        author: revB.authorName,
        date: revB.createdAt,
        sections: revB.sections as unknown as CmsSection[],
      },
    },
  };
}

/**
 * Reverts to an earlier revision by creating a new revision with its sections and immediately publishing it.
 */
export async function restorePageRevision(
  pageId: string,
  targetRevisionId: string
): Promise<ActionResult> {
  const session = await requireStaff();

  const targetRevision = await prisma.cmsRevision.findUnique({
    where: { id: targetRevisionId },
    include: { page: true },
  });

  if (!targetRevision || targetRevision.pageId !== pageId) {
    return { success: false, error: "Target revision not found" };
  }

  const page = targetRevision.page;
  const lastRev = await prisma.cmsRevision.findFirst({
    where: { pageId },
    orderBy: { revisionNumber: "desc" },
  });

  const nextRevNumber = (lastRev?.revisionNumber || 0) + 1;

  const newRevision = await prisma.cmsRevision.create({
    data: {
      pageId,
      revisionNumber: nextRevNumber,
      authorId: session.user.id,
      authorName: session.user.name || session.user.email,
      sections: targetRevision.sections as unknown as Prisma.InputJsonValue,
      changelog: `Restored from revision #${targetRevision.revisionNumber}`,
    },
  });

  await prisma.cmsPage.update({
    where: { id: pageId },
    data: {
      publishedRevisionId: newRevision.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  await prisma.cmsAuditLog.create({
    data: {
      pageId,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: "PAGE_RESTORED",
      details: {
        restoredFromRevision: targetRevision.revisionNumber,
        newRevisionNumber: nextRevNumber,
      },
    },
  });

  if (page.slug === "home") {
    revalidatePath("/");
  } else {
    revalidatePath(`/${page.slug}`);
  }

  return { success: true };
}

/**
 * Creates a new custom CMS page.
 */
export async function createCmsPage(data: {
  title: string;
  slug: string;
  publicTitle?: string;
  description?: string;
}): Promise<ActionResult<{ pageId: string }>> {
  const session = await requireStaff();

  const normalizedSlug = data.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");

  if (!normalizedSlug) {
    return { success: false, error: "Slug cannot be empty" };
  }

  if (isReservedSlug(normalizedSlug)) {
    return {
      success: false,
      error: `Slug "${normalizedSlug}" is reserved by system routing and cannot be used.`,
    };
  }

  const existing = await prisma.cmsPage.findUnique({
    where: { slug: normalizedSlug },
  });

  if (existing) {
    return { success: false, error: `A page with slug "/${normalizedSlug}" already exists.` };
  }

  const page = await prisma.cmsPage.create({
    data: {
      slug: normalizedSlug,
      title: data.title.trim(),
      publicTitle: data.publicTitle?.trim() || data.title.trim(),
      description: data.description?.trim(),
      status: "DRAFT",
      isSystem: false,
    },
  });

  // Create initial empty revision
  const initialSections: CmsSection[] = [
    {
      id: `sec_hero_${Date.now()}`,
      type: "hero",
      enabled: true,
      props: {
        title: data.title.trim(),
        subtitle: data.description?.trim() || "Welcome to this page.",
        alignment: "center",
      },
    },
  ];

  await prisma.cmsRevision.create({
    data: {
      pageId: page.id,
      revisionNumber: 1,
      authorId: session.user.id,
      authorName: session.user.name || session.user.email,
      sections: initialSections as unknown as Prisma.InputJsonValue,
      changelog: "Initial creation",
    },
  });

  await prisma.cmsAuditLog.create({
    data: {
      pageId: page.id,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: "PAGE_CREATED",
      details: { slug: normalizedSlug, title: data.title },
    },
  });

  revalidatePath("/admin/website/pages");

  return { success: true, data: { pageId: page.id } };
}

/**
 * Updates metadata & SEO settings for a page.
 */
export async function updatePageMetadata(
  pageId: string,
  data: {
    title: string;
    publicTitle?: string;
    description?: string;
    seoTitle?: string;
    seoDescription?: string;
    ogImageUrl?: string;
    canonicalUrl?: string;
    noIndex?: boolean;
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  }
): Promise<ActionResult> {
  const session = await requireStaff();

  const page = await prisma.cmsPage.findUnique({ where: { id: pageId } });
  if (!page) {
    return { success: false, error: "Page not found" };
  }

  await prisma.cmsPage.update({
    where: { id: pageId },
    data: {
      title: data.title.trim(),
      publicTitle: data.publicTitle?.trim() || null,
      description: data.description?.trim() || null,
      seoTitle: data.seoTitle?.trim() || null,
      seoDescription: data.seoDescription?.trim() || null,
      ogImageUrl: data.ogImageUrl?.trim() || null,
      canonicalUrl: data.canonicalUrl?.trim() || null,
      noIndex: data.noIndex ?? false,
      status: data.status || page.status,
    },
  });

  await prisma.cmsAuditLog.create({
    data: {
      pageId,
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: "PAGE_METADATA_UPDATED",
      details: data,
    },
  });

  if (page.slug === "home") {
    revalidatePath("/");
  } else {
    revalidatePath(`/${page.slug}`);
  }
  revalidatePath("/admin/website/pages");
  revalidatePath("/admin/website/seo");

  return { success: true };
}

/**
 * Deletes a non-system CMS page.
 */
export async function deleteCmsPage(pageId: string): Promise<ActionResult> {
  const session = await requireStaff();

  const page = await prisma.cmsPage.findUnique({ where: { id: pageId } });
  if (!page) {
    return { success: false, error: "Page not found" };
  }

  if (page.isSystem) {
    return {
      success: false,
      error: `Cannot delete protected system page "/${page.slug}". You can edit or unpublish its contents instead.`,
    };
  }

  await prisma.cmsPage.delete({ where: { id: pageId } });

  await prisma.cmsAuditLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      action: "PAGE_DELETED",
      details: { slug: page.slug, title: page.title },
    },
  });

  revalidatePath("/admin/website/pages");

  return { success: true };
}

/**
 * Updates appearance and branding settings.
 */
export async function updateCmsAppearance(formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const parsed = cmsAppearanceSchema.safeParse({
    primaryColor: formData.get("primaryColor"),
    secondaryColor: formData.get("secondaryColor"),
    accentColor: formData.get("accentColor"),
    fontHeading: formData.get("fontHeading") || "font-heading",
    fontBody: formData.get("fontBody") || "font-sans",
    buttonRadius: formData.get("buttonRadius") || "rounded-xl",
    containerWidth: formData.get("containerWidth") || "max-w-7xl",
    headerSticky: formData.get("headerSticky") === "true" || formData.get("headerSticky") === "on",
    footerTheme: formData.get("footerTheme") || "dark",
    logoUrl: formData.get("logoUrl") || null,
    logoDarkUrl: formData.get("logoDarkUrl") || null,
    faviconUrl: formData.get("faviconUrl") || null,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid appearance values" };
  }

  await prisma.cmsAppearance.upsert({
    where: { id: 1 },
    create: { id: 1, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/website/appearance");

  return { success: true };
}

/**
 * Saves navigation menu items.
 */
export async function saveNavItems(
  menu: NavMenu,
  items: Array<{
    id?: string;
    label: string;
    href: string;
    order: number;
    isExternal: boolean;
    published: boolean;
  }>
): Promise<ActionResult> {
  await requireStaff();

  for (let i = 0; i < items.length; i++) {
    const parsed = cmsNavItemSchema.safeParse({ menu, ...items[i] });
    if (!parsed.success) {
      return { success: false, error: `Item "${items[i]?.label}": ${parsed.error.issues[0]?.message}` };
    }
  }

  // Delete existing items for this menu and re-insert in order
  await prisma.$transaction(async (tx) => {
    await tx.cmsNavItem.deleteMany({ where: { menu } });
    if (items.length > 0) {
      await tx.cmsNavItem.createMany({
        data: items.map((item, idx) => ({
          menu,
          label: item.label.trim(),
          href: item.href.trim(),
          order: idx,
          isExternal: item.isExternal ?? false,
          published: item.published ?? true,
        })),
      });
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/website/navigation");

  return { success: true };
}

/**
 * Uploads a media asset to the CMS media library.
 */
export async function uploadCmsMedia(formData: FormData): Promise<ActionResult<{ url: string; id: string }>> {
  const session = await requireStaff();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "No valid file selected" };
  }

  const folder = (formData.get("folder") as string) || "general";
  const altText = (formData.get("altText") as string) || "";
  const caption = (formData.get("caption") as string) || "";

  try {
    const url = await uploadFile(file, `cms/${folder}`);
    const asset = await prisma.cmsMediaAsset.create({
      data: {
        url,
        filename: file.name,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        altText: altText.trim() || file.name,
        caption: caption.trim() || null,
        folder,
        uploadedBy: session.user.id,
      },
    });

    revalidatePath("/admin/website/media");

    return { success: true, data: { url: asset.url, id: asset.id } };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload media asset",
    };
  }
}

/**
 * Deletes a media asset from the CMS media library.
 */
export async function deleteCmsMedia(assetId: string): Promise<ActionResult> {
  await requireStaff();

  const asset = await prisma.cmsMediaAsset.findUnique({ where: { id: assetId } });
  if (!asset) {
    return { success: false, error: "Asset not found" };
  }

  // Delete physical storage file safely
  if (asset.url) {
    await deleteFile(asset.url);
  }

  await prisma.cmsMediaAsset.delete({ where: { id: assetId } });
  revalidatePath("/admin/website/media");

  return { success: true };
}

/**
 * Updates metadata (alt text, caption, folder) for an existing media asset.
 */
export async function updateCmsMedia(
  assetId: string,
  data: { altText?: string; caption?: string; folder?: string }
): Promise<ActionResult> {
  await requireStaff();

  await prisma.cmsMediaAsset.update({
    where: { id: assetId },
    data: {
      altText: data.altText?.trim() || null,
      caption: data.caption?.trim() || null,
      folder: data.folder?.trim() || "general",
    },
  });

  revalidatePath("/admin/website/media");
  return { success: true };
}

/**
 * Seeds default CMS pages (home, about, what-we-do) in database if not already present.
 */
export async function seedDefaultCmsPagesIfEmpty(): Promise<{ seededCount: number }> {
  let seeded = 0;

  // 1. Home
  const homeExists = await prisma.cmsPage.findUnique({ where: { slug: "home" } });
  if (!homeExists) {
    const page = await prisma.cmsPage.create({
      data: {
        slug: "home",
        title: "Homepage",
        publicTitle: "LivingHope — Restoring Hope to Children in Ghana",
        description: "Nonprofit charity supporting street-connected children in Ghana",
        status: "PUBLISHED",
        isSystem: true,
        publishedAt: new Date(),
      },
    });

    const rev = await prisma.cmsRevision.create({
      data: {
        pageId: page.id,
        revisionNumber: 1,
        authorName: "System Seed",
        sections: DEFAULT_HOMEPAGE_SECTIONS as unknown as Prisma.InputJsonValue,
        changelog: "Default Initial Homepage",
      },
    });

    await prisma.cmsPage.update({
      where: { id: page.id },
      data: { publishedRevisionId: rev.id },
    });
    seeded++;
  }

  // 2. About
  const aboutExists = await prisma.cmsPage.findUnique({ where: { slug: "about" } });
  if (!aboutExists) {
    const page = await prisma.cmsPage.create({
      data: {
        slug: "about",
        title: "About Us",
        publicTitle: "About LivingHope Ghana",
        description: "Our history, faith, mission, and leadership team in Accra, Ghana",
        status: "PUBLISHED",
        isSystem: true,
        publishedAt: new Date(),
      },
    });

    const rev = await prisma.cmsRevision.create({
      data: {
        pageId: page.id,
        revisionNumber: 1,
        authorName: "System Seed",
        sections: DEFAULT_ABOUT_SECTIONS as unknown as Prisma.InputJsonValue,
        changelog: "Default Initial About Page",
      },
    });

    await prisma.cmsPage.update({
      where: { id: page.id },
      data: { publishedRevisionId: rev.id },
    });
    seeded++;
  }

  // 3. What We Do
  const wwdExists = await prisma.cmsPage.findUnique({ where: { slug: "what-we-do" } });
  if (!wwdExists) {
    const page = await prisma.cmsPage.create({
      data: {
        slug: "what-we-do",
        title: "What We Do",
        publicTitle: "Our Programmes & Community Interventions",
        description: "Street outreach, schooling, and vocational training programmes in Ghana",
        status: "PUBLISHED",
        isSystem: true,
        publishedAt: new Date(),
      },
    });

    const rev = await prisma.cmsRevision.create({
      data: {
        pageId: page.id,
        revisionNumber: 1,
        authorName: "System Seed",
        sections: DEFAULT_WHAT_WE_DO_SECTIONS as unknown as Prisma.InputJsonValue,
        changelog: "Default Initial What We Do Page",
      },
    });

    await prisma.cmsPage.update({
      where: { id: page.id },
      data: { publishedRevisionId: rev.id },
    });
    seeded++;
  }

  return { seededCount: seeded };
}
