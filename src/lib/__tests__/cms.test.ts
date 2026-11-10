import test from "node:test";
import assert from "node:assert/strict";
import {
  isReservedSlug,
  cmsPageMetadataSchema,
  cmsAppearanceSchema,
  heroSectionSchema,
  richTextSectionSchema,
  imageTextSectionSchema,
  cardGridSectionSchema,
  impactStatsSectionSchema,
  featuredChildrenSectionSchema,
  donationCtaSectionSchema,
  cmsSectionSchema,
} from "../cms-validations";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_WHAT_WE_DO_SECTIONS,
} from "../cms-defaults";
import { getCmsPage } from "../cms-loader";

test("CMS Routing - Reserved Slugs Security Guard", () => {
  // Reserved system slugs must be blocked
  assert.equal(isReservedSlug("admin"), true);
  assert.equal(isReservedSlug("api"), true);
  assert.equal(isReservedSlug("account"), true);
  assert.equal(isReservedSlug("login"), true);
  assert.equal(isReservedSlug("signup"), true);
  assert.equal(isReservedSlug("donate"), true);
  assert.equal(isReservedSlug("preview"), true);
  assert.equal(isReservedSlug("auth"), true);
  assert.equal(isReservedSlug("admin/dashboard"), true);
  assert.equal(isReservedSlug("api/webhooks/stripe"), true);
  assert.equal(isReservedSlug(""), true);

  // Valid custom slugs must be permitted
  assert.equal(isReservedSlug("annual-report-2025"), false);
  assert.equal(isReservedSlug("christmas-drive"), false);
  assert.equal(isReservedSlug("volunteer-in-ghana"), false);
  assert.equal(isReservedSlug("our-faith"), false);
});

test("CMS Page Metadata Schema - Validation Rules", () => {
  // Valid page metadata
  const valid = cmsPageMetadataSchema.safeParse({
    title: "Annual Report 2025",
    slug: "annual-report-2025",
    publicTitle: "LivingHope 2025 Annual Impact Report",
    description: "Detailed report of audited funds and children assisted in Ghana",
    seoTitle: "LivingHope Annual Report 2025",
    seoDescription: "Audited charity report for LivingHope Ghana 2025.",
    status: "PUBLISHED",
    noIndex: false,
  });
  assert.equal(valid.success, true);

  // Reserved slug must be rejected
  const reserved = cmsPageMetadataSchema.safeParse({
    title: "System Admin Override",
    slug: "admin",
  });
  assert.equal(reserved.success, false);
  if (!reserved.success) {
    assert.match(reserved.error.issues[0]?.message, /reserved by the system/);
  }

  // Invalid slug characters (uppercase, spaces) must be rejected
  const invalidSlug = cmsPageMetadataSchema.safeParse({
    title: "Bad Slug",
    slug: "Annual Report!",
  });
  assert.equal(invalidSlug.success, false);
});

test("CMS Appearance Schema - Design Token Validation", () => {
  // Valid token configuration
  const valid = cmsAppearanceSchema.safeParse({
    primaryColor: "#0f766e",
    secondaryColor: "#d97706",
    accentColor: "#f59e0b",
    fontHeading: "font-heading",
    fontBody: "font-sans",
    buttonRadius: "rounded-xl",
    containerWidth: "max-w-7xl",
    headerSticky: true,
    footerTheme: "dark",
  });
  assert.equal(valid.success, true);

  // Invalid hex color should fail
  const invalidColor = cmsAppearanceSchema.safeParse({
    primaryColor: "not-a-color",
    secondaryColor: "#d97706",
    accentColor: "#f59e0b",
    fontHeading: "font-heading",
    fontBody: "font-sans",
    buttonRadius: "rounded-xl",
    containerWidth: "max-w-7xl",
    headerSticky: true,
    footerTheme: "dark",
  });
  assert.equal(invalidColor.success, false);
});

test("CMS Section Registry - Typed Section Validation", () => {
  // 1. Hero
  const hero = heroSectionSchema.safeParse({
    badge: "Urgent Need",
    title: "Transforming Lives",
    subtitle: "Empowering street children with education.",
    alignment: "center",
    primaryCta: { label: "Sponsor a Child", href: "/sponsor-a-child" },
  });
  assert.equal(hero.success, true);

  // 2. Rich Text
  const richText = richTextSectionSchema.safeParse({
    heading: "Our Vision",
    content: "We envision a world where no child lives on the streets.",
    containerWidth: "default",
    backgroundColor: "brand",
  });
  assert.equal(richText.success, true);

  // 3. Image & Text Split
  const imageText = imageTextSectionSchema.safeParse({
    heading: "Vocational Skills",
    lead: "Building livelihoods",
    paragraphs: ["Apprenticeships in carpentry and sewing."],
    imageUrl: "/images/placeholders/street-child.webp",
    imageAlt: "Vocational training",
    imagePosition: "right",
    bulletPoints: ["Carpentry", "Masonry", "Coding"],
  });
  assert.equal(imageText.success, true);

  // 4. Card Grid
  const cardGrid = cardGridSectionSchema.safeParse({
    heading: "Core Pillars",
    columns: 3,
    cards: [
      { title: "Education", description: "School uniforms and tuition." },
      { title: "Nutrition", description: "Daily warm lunches." },
    ],
  });
  assert.equal(cardGrid.success, true);

  // 5. Impact Stats
  const impactStats = impactStatsSectionSchema.safeParse({
    heading: "Audited Stats",
    useLiveDatabase: true,
    customStats: [{ value: "450+", label: "Children Enrolled" }],
  });
  assert.equal(impactStats.success, true);

  // 6. Featured Children
  const featuredChildren = featuredChildrenSectionSchema.safeParse({
    heading: "Children Awaiting Help",
    mode: "auto_urgent",
    maxCount: 3,
  });
  assert.equal(featuredChildren.success, true);

  // 7. Donation CTA
  const donationCta = donationCtaSectionSchema.safeParse({
    heading: "Support Our Work",
    presetAmounts: [25, 50, 100, 250],
    primaryCtaLabel: "Donate Now",
  });
  assert.equal(donationCta.success, true);
});

test("CMS Default Page Sections - Schema Integrity", () => {
  // Every default section in Homepage must pass cmsSectionSchema
  for (const section of DEFAULT_HOMEPAGE_SECTIONS) {
    const res = cmsSectionSchema.safeParse(section);
    assert.equal(res.success, true, `Homepage section "${section.id}" (${section.type}) failed validation`);
  }

  // Every default section in About must pass cmsSectionSchema
  for (const section of DEFAULT_ABOUT_SECTIONS) {
    const res = cmsSectionSchema.safeParse(section);
    assert.equal(res.success, true, `About section "${section.id}" (${section.type}) failed validation`);
  }

  // Every default section in What We Do must pass cmsSectionSchema
  for (const section of DEFAULT_WHAT_WE_DO_SECTIONS) {
    const res = cmsSectionSchema.safeParse(section);
    assert.equal(res.success, true, `What We Do section "${section.id}" (${section.type}) failed validation`);
  }
});

test("CMS Loader - Graceful Fallbacks", async () => {
  // Unknown page returns null
  const unknownPage = await getCmsPage("non-existent-campaign-xyz-123");
  assert.equal(unknownPage, null);

  // Fallback for home
  const home = await getCmsPage("home");
  assert.ok(home !== null);
  assert.equal(home?.slug, "home");
  assert.ok(home.sections.length > 0);

  // Fallback for about
  const about = await getCmsPage("about");
  assert.ok(about !== null);
  assert.equal(about?.slug, "about");
  assert.ok(about.sections.length > 0);

  // Fallback for what-we-do
  const wwd = await getCmsPage("what-we-do");
  assert.ok(wwd !== null);
  assert.equal(wwd?.slug, "what-we-do");
  assert.ok(wwd.sections.length > 0);
});

test.after(async () => {
  const { prisma } = await import("../prisma");
  await prisma.$disconnect();
  // Ensure node test exits cleanly when done
  setTimeout(() => process.exit(0), 100).unref();
});



