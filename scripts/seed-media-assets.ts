import fs from "fs";
import path from "path";
import { prisma, closeDatabaseConnection } from "../src/lib/prisma";

interface MediaAssetMeta {
  url: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  altText: string;
  caption: string;
  folder: string;
}

const ASSET_REGISTRY: MediaAssetMeta[] = [
  // Beneficiaries
  {
    url: "/uploads/children/amara.webp",
    filename: "amara.webp",
    originalName: "amara-mensah-portrait.jpg",
    mimeType: "image/webp",
    sizeBytes: 33792,
    width: 640,
    height: 800,
    altText: "Amara Mensah - 8 years old primary school student in Accra",
    caption: "Amara loves reading, drawing, and aspires to become a healthcare nurse",
    folder: "children",
  },
  {
    url: "/uploads/children/kwame.webp",
    filename: "kwame.webp",
    originalName: "kwame-asante-portrait.jpg",
    mimeType: "image/webp",
    sizeBytes: 23552,
    width: 640,
    height: 800,
    altText: "Kwame Asante - 12 years old junior secondary student in Kumasi",
    caption: "Kwame excels in mathematics and wants to study civil engineering",
    folder: "children",
  },
  {
    url: "/uploads/children/efua.webp",
    filename: "efua.webp",
    originalName: "efua-osei-portrait.jpg",
    mimeType: "image/webp",
    sizeBytes: 39936,
    width: 640,
    height: 800,
    altText: "Efua Osei - 6 years old kindergarten student in Tamale",
    caption: "Efua is full of energy, loves singing, and is learning to read",
    folder: "children",
  },

  // CMS Uploads & General Media
  {
    url: "/uploads/cms/hero.webp",
    filename: "hero.webp",
    originalName: "livinghope-ghana-hero.jpg",
    mimeType: "image/webp",
    sizeBytes: 144384,
    width: 1600,
    height: 900,
    altText: "Smiling school children in Ghana engaged in classroom learning",
    caption: "LivingHope education programme in Greater Accra",
    folder: "home",
  },
  {
    url: "/uploads/cms/street-child.webp",
    filename: "street-child.webp",
    originalName: "street-outreach-accra.jpg",
    mimeType: "image/webp",
    sizeBytes: 106496,
    width: 1200,
    height: 900,
    altText: "Street-connected child looking toward a brighter future through LivingHope intervention",
    caption: "Street outreach and rescue initiative in urban Accra",
    folder: "home",
  },
  {
    url: "/uploads/cms/partnership-banner.webp",
    filename: "partnership-banner.webp",
    originalName: "brightener-partnership-hands.jpg",
    mimeType: "image/webp",
    sizeBytes: 212992,
    width: 1600,
    height: 800,
    altText: "Community partnership and collective action supporting vulnerable youth",
    caption: "Join hands with LivingHope as a Brightener partner",
    folder: "partnerships",
  },
  {
    url: "/uploads/cms/about-hero.webp",
    filename: "about-hero.webp",
    originalName: "livinghope-leadership-team.jpg",
    mimeType: "image/webp",
    sizeBytes: 98304,
    width: 1600,
    height: 900,
    altText: "LivingHope dedicated staff and social workers in Accra",
    caption: "Our leadership and fieldwork team committed to transparent charity",
    folder: "about",
  },
  {
    url: "/uploads/cms/team-field.webp",
    filename: "team-field.webp",
    originalName: "field-teacher-mentorship.jpg",
    mimeType: "image/webp",
    sizeBytes: 108544,
    width: 1200,
    height: 900,
    altText: "LivingHope certified teacher working with children in classroom",
    caption: "Direct mentorship and educational rehabilitation in the field",
    folder: "about",
  },
  {
    url: "/uploads/cms/mission.webp",
    filename: "mission.webp",
    originalName: "library-books-school.jpg",
    mimeType: "image/webp",
    sizeBytes: 29696,
    width: 1200,
    height: 800,
    altText: "School library and reading resources provided by LivingHope",
    caption: "Educational foundation for sustainable transformation",
    folder: "about",
  },
  {
    url: "/uploads/cms/education.webp",
    filename: "education.webp",
    originalName: "education-programme.jpg",
    mimeType: "image/webp",
    sizeBytes: 14336,
    width: 800,
    height: 500,
    altText: "Young student carrying school supplies ready to learn",
    caption: "Formal School Enrollment and Remedial Tutoring",
    folder: "programmes",
  },
  {
    url: "/uploads/cms/vocational.webp",
    filename: "vocational.webp",
    originalName: "vocational-training-trades.jpg",
    mimeType: "image/webp",
    sizeBytes: 35840,
    width: 800,
    height: 500,
    altText: "Youth learning technical craftsmanship and vocational trades",
    caption: "Vocational Skills & Apprenticeships for older youth",
    folder: "programmes",
  },
  {
    url: "/uploads/cms/outreach.webp",
    filename: "outreach.webp",
    originalName: "street-outreach-dropin.jpg",
    mimeType: "image/webp",
    sizeBytes: 50176,
    width: 800,
    height: 500,
    altText: "Field team meeting street-connected children in urban market",
    caption: "Street Outreach and First Contact Rescue",
    folder: "programmes",
  },
  {
    url: "/uploads/cms/health.webp",
    filename: "health.webp",
    originalName: "health-nutrition-checkup.jpg",
    mimeType: "image/webp",
    sizeBytes: 25600,
    width: 800,
    height: 500,
    altText: "Child receiving nutritious meal and regular health checkup",
    caption: "Nutrition, Mental Wellness & Medical Healthcare",
    folder: "programmes",
  },
  {
    url: "/uploads/cms/brightener-hero.webp",
    filename: "brightener-hero.webp",
    originalName: "brightener-hero-community.jpg",
    mimeType: "image/webp",
    sizeBytes: 135168,
    width: 1600,
    height: 900,
    altText: "Vibrant Ghanaian youth thriving in safe community environment",
    caption: "Become a Brightener partner",
    folder: "sponsorship",
  },
  {
    url: "/uploads/cms/impact.webp",
    filename: "impact.webp",
    originalName: "community-impact-meeting.jpg",
    mimeType: "image/webp",
    sizeBytes: 53248,
    width: 1200,
    height: 800,
    altText: "Community partnership impact meeting",
    caption: "100% transparent and accountable financial stewardship",
    folder: "general",
  },
  {
    url: "/uploads/cms/child-avatar.webp",
    filename: "child-avatar.webp",
    originalName: "child-avatar-placeholder.jpg",
    mimeType: "image/webp",
    sizeBytes: 15360,
    width: 400,
    height: 400,
    altText: "Child profile avatar placeholder",
    caption: "Default beneficiary avatar",
    folder: "placeholders",
  },
];

async function main() {
  console.log("Seeding Phase 6 media assets and updating beneficiary child records...");

  // 1. Update Child records with verified local photoUrls
  const childUpdates = [
    { slug: "amara", photoUrl: "/uploads/children/amara.webp" },
    { slug: "kwame", photoUrl: "/uploads/children/kwame.webp" },
    { slug: "efua", photoUrl: "/uploads/children/efua.webp" },
  ];

  for (const c of childUpdates) {
    const existing = await prisma.child.findUnique({ where: { slug: c.slug } });
    if (existing) {
      await prisma.child.update({
        where: { slug: c.slug },
        data: { photoUrl: c.photoUrl },
      });
      console.log(`✓ Updated child '${c.slug}' with photoUrl: ${c.photoUrl}`);
    }
  }

  // 2. Upsert CmsMediaAsset records
  for (const asset of ASSET_REGISTRY) {
    const filePath = path.join(process.cwd(), "public", asset.url.replace(/^\//, ""));
    let actualSize = asset.sizeBytes;
    if (fs.existsSync(filePath)) {
      actualSize = fs.statSync(filePath).size;
    }

    await prisma.cmsMediaAsset.upsert({
      where: { url: asset.url },
      create: {
        url: asset.url,
        filename: asset.filename,
        originalName: asset.originalName,
        mimeType: asset.mimeType,
        sizeBytes: actualSize,
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        caption: asset.caption,
        folder: asset.folder,
      },
      update: {
        filename: asset.filename,
        originalName: asset.originalName,
        mimeType: asset.mimeType,
        sizeBytes: actualSize,
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        caption: asset.caption,
        folder: asset.folder,
      },
    });
    console.log(`✓ Upserted CmsMediaAsset: ${asset.url} (${asset.folder})`);
  }

  const totalAssets = await prisma.cmsMediaAsset.count();
  console.log(`Total CmsMediaAsset records in database: ${totalAssets}`);
}

main()
  .catch((e) => {
    console.error("Failed to seed media assets:", e);
    process.exit(1);
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
