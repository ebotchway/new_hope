import { prisma } from "./prisma";
import { CmsPageData, CmsSection } from "./cms-types";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_WHAT_WE_DO_SECTIONS,
} from "./cms-defaults";
import type { NavMenu } from "@/generated/prisma/enums";

export async function getCmsPage(
  slug: string,
  options?: { previewRevisionId?: string; isStaffPreview?: boolean }
): Promise<CmsPageData | null> {
  const normalizedSlug = slug === "/" || slug === "" ? "home" : slug.replace(/^\/+|\/+$/g, "");
  const isStaff = Boolean(options?.isStaffPreview);

  try {
    const page = await prisma.cmsPage.findUnique({
      where: { slug: normalizedSlug },
      include: {
        revisions: {
          orderBy: { revisionNumber: "desc" },
          take: 5,
        },
      },
    });

    // 1. PAGE EXISTS IN DATABASE
    if (page) {
      // 1.0 Strict Archive Enforcement: Archived pages are offline and never rendered
      if (page.status === "ARCHIVED") {
        return null;
      }

      // 1.1 Staff Preview Mode
      if (isStaff) {
        let activeRevision = null;
        if (options?.previewRevisionId) {
          activeRevision = await prisma.cmsRevision.findUnique({
            where: { id: options.previewRevisionId },
          });
        }
        if (!activeRevision && page.revisions.length > 0) {
          activeRevision = page.revisions[0];
        }
        if (!activeRevision && page.publishedRevisionId) {
          activeRevision = await prisma.cmsRevision.findUnique({
            where: { id: page.publishedRevisionId },
          });
        }

        if (activeRevision && Array.isArray(activeRevision.sections)) {
          return {
            id: page.id,
            slug: page.slug,
            title: page.title,
            publicTitle: page.publicTitle,
            description: page.description,
            status: page.status,
            publishedRevisionId: page.publishedRevisionId,
            isSystem: page.isSystem,
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
            ogImageUrl: page.ogImageUrl,
            canonicalUrl: page.canonicalUrl,
            noIndex: page.noIndex,
            publishedAt: page.publishedAt,
            sections: activeRevision.sections as unknown as CmsSection[],
            revisionNumber: activeRevision.revisionNumber,
          };
        }
        return null;
      }

      // 1.2 Public Visitor Mode - Strict status enforcement
      // If page is DRAFT: it is unpublished. Never leak draft content or show static fallback!
      if (page.status === "DRAFT") {
        return null;
      }

      // If page is PUBLISHED:
      if (page.status === "PUBLISHED") {
        // Scheduled Publishing check: if publishedAt is set in the future, page is not yet public
        if (page.publishedAt && new Date(page.publishedAt).getTime() > Date.now()) {
          return null;
        }

        // Must have a valid publishedRevisionId
        if (!page.publishedRevisionId) {
          console.warn(`[CMS Loader] Page "${normalizedSlug}" is marked PUBLISHED but publishedRevisionId is missing.`);
          return null;
        }

        const publishedRevision = await prisma.cmsRevision.findUnique({
          where: { id: page.publishedRevisionId },
        });

        if (publishedRevision && Array.isArray(publishedRevision.sections)) {
          return {
            id: page.id,
            slug: page.slug,
            title: page.title,
            publicTitle: page.publicTitle,
            description: page.description,
            status: "PUBLISHED",
            publishedRevisionId: page.publishedRevisionId,
            isSystem: page.isSystem,
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
            ogImageUrl: page.ogImageUrl,
            canonicalUrl: page.canonicalUrl,
            noIndex: page.noIndex,
            publishedAt: page.publishedAt,
            sections: publishedRevision.sections as unknown as CmsSection[],
            revisionNumber: publishedRevision.revisionNumber,
          };
        }

        // Published revision was corrupted or missing
        console.error(`[CMS Loader] Published revision "${page.publishedRevisionId}" not found for page "${normalizedSlug}".`);
        return null;
      }

      return null;
    }

    // 2. PAGE DOES NOT EXIST IN DATABASE
    // Differentiate between "Initial unconfigured site" vs "Missing custom page"
    const totalPageCount = await prisma.cmsPage.count();
    if (totalPageCount === 0) {
      // Fresh, unseeded database: provide rich initial defaults for core system paths only
      if (normalizedSlug === "home") {
        return {
          id: "virtual_home",
          slug: "home",
          title: "Homepage",
          publicTitle: "LivingHope — Restoring Hope to Children in Ghana",
          description: "Nonprofit charity supporting street-connected children in Ghana",
          status: "PUBLISHED",
          isSystem: true,
          noIndex: false,
          sections: DEFAULT_HOMEPAGE_SECTIONS,
        };
      }
      if (normalizedSlug === "about") {
        return {
          id: "virtual_about",
          slug: "about",
          title: "About Us",
          publicTitle: "About LivingHope Ghana",
          description: "Our history, faith, mission, and leadership team in Accra, Ghana",
          status: "PUBLISHED",
          isSystem: true,
          noIndex: false,
          sections: DEFAULT_ABOUT_SECTIONS,
        };
      }
      if (normalizedSlug === "what-we-do") {
        return {
          id: "virtual_what_we_do",
          slug: "what-we-do",
          title: "What We Do",
          publicTitle: "Our Programmes & Community Interventions",
          description: "Street outreach, schooling, and vocational training programmes in Ghana",
          status: "PUBLISHED",
          isSystem: true,
          noIndex: false,
          sections: DEFAULT_WHAT_WE_DO_SECTIONS,
        };
      }
    }

    // Database is configured, and this page does not exist -> 404
    return null;
  } catch (error) {
    console.error(`[CMS Loader] Database outage / error loading page "${normalizedSlug}":`, error);

    // 3. DATABASE OUTAGE FAIL-SAFE
    // For core landing page during a database connectivity outage, serve static defaults so public visitors can still read emergency information
    if (!isStaff && normalizedSlug === "home") {
      return {
        id: "virtual_home",
        slug: "home",
        title: "Homepage",
        publicTitle: "LivingHope — Restoring Hope to Children in Ghana",
        description: "Nonprofit charity supporting street-connected children in Ghana",
        status: "PUBLISHED",
        isSystem: true,
        noIndex: false,
        sections: DEFAULT_HOMEPAGE_SECTIONS,
      };
    }

    return null;
  }
}

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  buttonRadius: string;
  containerWidth: string;
  headerSticky: boolean;
  footerTheme: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  primaryColor: "#0f766e",
  secondaryColor: "#d97706",
  accentColor: "#f59e0b",
  fontHeading: "font-heading",
  fontBody: "font-sans",
  buttonRadius: "rounded-xl",
  containerWidth: "max-w-7xl",
  headerSticky: true,
  footerTheme: "dark",
  logoUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
};

export async function getCmsAppearance(): Promise<AppearanceSettings> {
  try {
    const config = await prisma.cmsAppearance.findUnique({
      where: { id: 1 },
    });
    if (config) {
      return {
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        accentColor: config.accentColor,
        fontHeading: config.fontHeading,
        fontBody: config.fontBody,
        buttonRadius: config.buttonRadius,
        containerWidth: config.containerWidth,
        headerSticky: config.headerSticky,
        footerTheme: config.footerTheme,
        logoUrl: config.logoUrl,
        logoDarkUrl: config.logoDarkUrl,
        faviconUrl: config.faviconUrl,
      };
    }
  } catch (error) {
    console.warn("[CMS Loader] Could not load CMS appearance, using defaults:", error);
  }
  return DEFAULT_APPEARANCE;
}

export interface NavItemWithChildren {
  id: string;
  menu: NavMenu;
  label: string;
  href: string;
  order: number;
  isExternal: boolean;
  children: NavItemWithChildren[];
}

export async function getCmsNavItems(menu: NavMenu): Promise<NavItemWithChildren[]> {
  try {
    const items = await prisma.cmsNavItem.findMany({
      where: {
        menu,
        published: true,
        parentId: null,
      },
      include: {
        children: {
          where: { published: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    if (items.length > 0) {
      return items.map((item) => ({
        id: item.id,
        menu: item.menu,
        label: item.label,
        href: item.href,
        order: item.order,
        isExternal: item.isExternal,
        children: item.children.map((child) => ({
          id: child.id,
          menu: child.menu,
          label: child.label,
          href: child.href,
          order: child.order,
          isExternal: child.isExternal,
          children: [],
        })),
      }));
    }
  } catch (error) {
    console.warn(`[CMS Loader] Could not load nav items for ${menu}:`, error);
  }

  // Default header links
  if (menu === "HEADER") {
    return [
      { id: "def_about", menu: "HEADER", label: "About Us", href: "/about", order: 1, isExternal: false, children: [] },
      { id: "def_wwd", menu: "HEADER", label: "What We Do", href: "/what-we-do", order: 2, isExternal: false, children: [] },
      { id: "def_sponsor", menu: "HEADER", label: "Sponsor a Child", href: "/sponsor-a-child", order: 3, isExternal: false, children: [] },
      { id: "def_brightener", menu: "HEADER", label: "Become a Brightener", href: "/become-a-brightener", order: 4, isExternal: false, children: [] },
      { id: "def_contact", menu: "HEADER", label: "Contact", href: "/#contact", order: 5, isExternal: false, children: [] },
    ];
  }

  return [];
}
