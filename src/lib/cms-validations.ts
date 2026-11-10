import { z } from "zod";

export const RESERVED_SLUGS = [
  "",
  "admin",
  "api",
  "account",
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "donate",
  "preview",
  "auth",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
];

export function isReservedSlug(slug: string): boolean {
  const normalized = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
  return RESERVED_SLUGS.includes(normalized) || normalized.startsWith("admin/") || normalized.startsWith("api/");
}

const ctaLinkSchema = z.object({
  label: z.string().min(1, "Button label is required").max(60),
  href: z.string().min(1, "URL is required").max(500),
});

export const heroSectionSchema = z.object({
  badge: z.string().max(80).optional(),
  title: z.string().min(1, "Title is required").max(200),
  subtitle: z.string().min(1, "Subtitle is required").max(500),
  imageUrl: z.string().url().or(z.string().startsWith("/")).optional(),
  primaryCta: ctaLinkSchema.optional(),
  secondaryCta: ctaLinkSchema.optional(),
  alignment: z.enum(["center", "left"]).default("center"),
});

export const richTextSectionSchema = z.object({
  heading: z.string().max(200).optional(),
  subheading: z.string().max(300).optional(),
  content: z.string().min(1, "Content is required"),
  containerWidth: z.enum(["narrow", "default", "wide"]).default("default"),
  backgroundColor: z.enum(["white", "muted", "brand"]).default("white"),
});

export const imageTextSectionSchema = z.object({
  heading: z.string().min(1, "Heading is required").max(200),
  lead: z.string().max(500).optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
  imageUrl: z.string().min(1, "Image URL is required"),
  imageAlt: z.string().min(1, "Image alt text is required").max(200),
  imagePosition: z.enum(["left", "right"]).default("right"),
  bulletPoints: z.array(z.string()).optional(),
  cta: ctaLinkSchema.optional(),
});

export const cardGridItemSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().min(1, "Description is required").max(500),
  icon: z.string().max(50).optional(),
  imageUrl: z.string().optional(),
  link: ctaLinkSchema.optional(),
});

export const cardGridSectionSchema = z.object({
  heading: z.string().min(1, "Heading is required").max(200),
  subheading: z.string().max(300).optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  cards: z.array(cardGridItemSchema).min(1, "At least one card is required"),
});

export const customStatItemSchema = z.object({
  value: z.string().min(1).max(30),
  label: z.string().min(1).max(100),
  prefix: z.string().max(10).optional(),
  suffix: z.string().max(10).optional(),
});

export const impactStatsSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  useLiveDatabase: z.boolean().default(true),
  customStats: z.array(customStatItemSchema).optional(),
});

export const featuredChildrenSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  mode: z.enum(["auto_urgent", "manual"]).default("auto_urgent"),
  childIds: z.array(z.string()).optional(),
  maxCount: z.number().int().min(1).max(12).default(6),
});

export const programmeItemSchema = z.object({
  title: z.string().min(1).max(120),
  category: z.string().min(1).max(60),
  description: z.string().min(1).max(500),
  imageUrl: z.string().optional(),
  metrics: z.string().max(100).optional(),
});

export const programmesSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  programmes: z.array(programmeItemSchema).min(1),
});

export const featuredStoriesSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  storyIds: z.array(z.string()).optional(),
  showRecentDonors: z.boolean().default(true),
});

export const testimonialItemSchema = z.object({
  quote: z.string().min(1).max(600),
  author: z.string().min(1).max(100),
  role: z.string().max(100).optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const testimonialsSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  testimonials: z.array(testimonialItemSchema).min(1),
});

export const faqItemSchema = z.object({
  question: z.string().min(1).max(250),
  answer: z.string().min(1).max(1500),
});

export const faqSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  items: z.array(faqItemSchema).min(1),
});

export const donationCtaSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  presetAmounts: z.array(z.number().int()).default([25, 50, 100, 250]),
  primaryCtaLabel: z.string().default("Donate Now"),
  accentColor: z.string().optional(),
});

export const partnershipCtaSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  buttonLabel: z.string().min(1).max(60),
  buttonUrl: z.string().min(1).max(300),
  backgroundImageUrl: z.string().optional(),
});

export const contactInfoSectionSchema = z.object({
  heading: z.string().min(1).max(200),
  subheading: z.string().max(300).optional(),
  address: z.string().max(300).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().or(z.literal("")).optional(),
  hours: z.string().max(200).optional(),
  mapEmbedUrl: z.string().optional(),
});

export const cmsSectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "hero",
    "rich_text",
    "image_text",
    "card_grid",
    "impact_stats",
    "featured_children",
    "programmes",
    "featured_stories",
    "testimonials",
    "faq",
    "donation_cta",
    "partnership_cta",
    "contact_info",
  ]),
  enabled: z.boolean().default(true),
  props: z.record(z.string(), z.unknown()),
});

export const cmsPageMetadataSchema = z.object({
  title: z.string().min(1, "Page title is required").max(120),
  publicTitle: z.string().max(120).optional(),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .refine((val) => !isReservedSlug(val), {
      message: "This slug is reserved by the system and cannot be used",
    }),
  description: z.string().max(300).optional(),
  seoTitle: z.string().max(100).optional(),
  seoDescription: z.string().max(200).optional(),
  ogImageUrl: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noIndex: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export const cmsAppearanceSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color code"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color code"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color code"),
  fontHeading: z.string().min(1).max(50),
  fontBody: z.string().min(1).max(50),
  buttonRadius: z.enum(["rounded-none", "rounded-md", "rounded-xl", "rounded-full"]),
  containerWidth: z.enum(["max-w-6xl", "max-w-7xl", "max-w-screen-2xl"]),
  headerSticky: z.boolean(),
  footerTheme: z.enum(["dark", "light", "brand"]),
  logoUrl: z.string().optional().nullable(),
  logoDarkUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
});

export const cmsNavItemSchema = z.object({
  menu: z.enum(["HEADER", "FOOTER_COL1", "FOOTER_COL2", "FOOTER_COL3", "FOOTER_LEGAL"]),
  label: z.string().min(1, "Label is required").max(60),
  href: z.string().min(1, "URL is required").max(300),
  order: z.number().int().default(0),
  isExternal: z.boolean().default(false),
  published: z.boolean().default(true),
  parentId: z.string().optional().nullable(),
});

