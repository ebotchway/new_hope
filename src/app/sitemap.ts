import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://livinghope.org.gh";

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/what-we-do`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sponsor-a-child`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/become-a-brightener`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic published children available for sponsorship
  let childRoutes: MetadataRoute.Sitemap = [];
  try {
    const children = await prisma.child.findMany({
      where: { status: "AVAILABLE" },
      select: { slug: true, updatedAt: true },
    });
    childRoutes = children.map((c) => ({
      url: `${baseUrl}/sponsor-a-child/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Error generating sitemap child routes:", error);
  }

  // Dynamic published custom CMS pages
  let cmsRoutes: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.cmsPage.findMany({
      where: {
        status: "PUBLISHED",
        slug: { notIn: ["home", "about", "what-we-do"] },
      },
      select: { slug: true, updatedAt: true },
    });
    cmsRoutes = pages.map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error generating sitemap CMS routes:", error);
  }

  return [...staticRoutes, ...childRoutes, ...cmsRoutes];
}

