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
  // Beneficiaries (Authentic, dignified portraits)
  {
    url: "/uploads/children/amara.webp",
    filename: "amara.webp",
    originalName: "amara-mensah-portrait.jpg",
    mimeType: "image/webp",
    sizeBytes: 51200,
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
    sizeBytes: 29696,
    width: 640,
    height: 800,
    altText: "Kwame Asante - 10 years old student in Tema, Ghana",
    caption: "Kwame excels in mathematics and wants to study civil engineering",
    folder: "children",
  },
  {
    url: "/uploads/children/efua.webp",
    filename: "efua.webp",
    originalName: "efua-osei-portrait.jpg",
    mimeType: "image/webp",
    sizeBytes: 69632,
    width: 640,
    height: 800,
    altText: "Efua Osei - 6 years old kindergarten student in Tamale, Ghana",
    caption: "Efua is full of energy, loves singing, and is learning to read",
    folder: "children",
  },

  // CMS Uploads & General Authentic African Media
  {
    url: "/uploads/cms/hero.webp",
    filename: "hero.webp",
    originalName: "ghanaian-school-children-classroom.jpg",
    mimeType: "image/webp",
    sizeBytes: 175104,
    width: 1600,
    height: 900,
    altText: "Joyful Ghanaian school children in bright uniforms smiling together in classroom",
    caption: "LivingHope education and school sponsorship programme in Ghana",
    folder: "home",
  },
  {
    url: "/uploads/cms/home-hero.webp",
    filename: "home-hero.webp",
    originalName: "ghanaian-school-children-classroom.jpg",
    mimeType: "image/webp",
    sizeBytes: 175104,
    width: 1600,
    height: 900,
    altText: "LivingHope Ghana Home Hero - School children in Ghana",
    caption: "Transforming lives through love and education",
    folder: "placeholders",
  },
  {
    url: "/uploads/cms/street-child.webp",
    filename: "street-child.webp",
    originalName: "child-at-roadside-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 142336,
    width: 1200,
    height: 900,
    altText: "Vulnerable child by the roadside in Kuntanase, Ghana looking toward a brighter future through LivingHope intervention",
    caption: "Street outreach, immediate sanctuary, and educational rescue in Ghana",
    folder: "home",
  },
  {
    url: "/uploads/cms/partnership-banner.webp",
    filename: "partnership-banner.webp",
    originalName: "brightener-solidarity-accra.jpg",
    mimeType: "image/webp",
    sizeBytes: 80896,
    width: 1600,
    height: 800,
    altText: "Young people and community solidarity in Accra, Ghana",
    caption: "Join hands with LivingHope as a Brightener partner",
    folder: "partnerships",
  },
  {
    url: "/uploads/cms/about-hero.webp",
    filename: "about-hero.webp",
    originalName: "livinghope-leadership-accra.jpg",
    mimeType: "image/webp",
    sizeBytes: 96256,
    width: 1600,
    height: 900,
    altText: "LivingHope dedicated Ghanaian leadership team and community educators in Accra",
    caption: "Our leadership and fieldwork team committed to transparent charity in Ghana",
    folder: "about",
  },
  {
    url: "/uploads/cms/team-field.webp",
    filename: "team-field.webp",
    originalName: "teacher-mentoring-student-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 91136,
    width: 1200,
    height: 900,
    altText: "Ghanaian teacher providing personalized reading mentorship to an eager student",
    caption: "Direct mentorship and educational rehabilitation in the field",
    folder: "about",
  },
  {
    url: "/uploads/cms/mission.webp",
    filename: "mission.webp",
    originalName: "students-books-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 77824,
    width: 1200,
    height: 800,
    altText: "School books, notebooks, and learning supplies provided by LivingHope",
    caption: "Educational foundation for sustainable transformation in Ghana",
    folder: "about",
  },
  {
    url: "/uploads/cms/education.webp",
    filename: "education.webp",
    originalName: "education-programme-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 23552,
    width: 800,
    height: 500,
    altText: "Young students proudly wearing school uniforms on their way to class",
    caption: "Formal School Enrollment and Remedial Tutoring",
    folder: "programmes",
  },
  {
    url: "/uploads/cms/vocational.webp",
    filename: "vocational.webp",
    originalName: "carpenter-workshop-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 51200,
    width: 800,
    height: 500,
    altText: "Youth learning carpentry craftsmanship in a vocational workshop in Ghana",
    caption: "Vocational Skills & Apprenticeships for older youth",
    folder: "programmes",
  },
  {
    url: "/uploads/cms/outreach.webp",
    filename: "outreach.webp",
    originalName: "street-outreach-community-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 80896,
    width: 800,
    height: 500,
    altText: "Field team meeting and supporting children in local Ghanaian community",
    caption: "Street Outreach and First Contact Rescue in Ghana",
    folder: "programmes",
  },
  {
    url: "/uploads/cms/health.webp",
    filename: "health.webp",
    originalName: "school-meals-nutrition-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 73728,
    width: 800,
    height: 500,
    altText: "School children served warm, balanced meals in classroom in Ghana",
    caption: "Nutrition, Mental Wellness & Medical Healthcare",
    folder: "programmes",
  },
  {
    url: "/uploads/cms/brightener-hero.webp",
    filename: "brightener-hero.webp",
    originalName: "brightener-hero-kumasi.jpg",
    mimeType: "image/webp",
    sizeBytes: 228352,
    width: 1600,
    height: 900,
    altText: "Joyful Ghanaian children playing outdoors in Kumasi, thriving in a safe environment",
    caption: "Become a Brightener partner",
    folder: "sponsorship",
  },
  {
    url: "/uploads/cms/impact.webp",
    filename: "impact.webp",
    originalName: "community-impact-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 77824,
    width: 1200,
    height: 800,
    altText: "African students gathered at classroom desks, engaged in collaborative learning",
    caption: "Real, audited educational outcomes across Ghana",
    folder: "general",
  },
  {
    url: "/uploads/cms/child-avatar.webp",
    filename: "child-avatar.webp",
    originalName: "child-avatar-ghana.jpg",
    mimeType: "image/webp",
    sizeBytes: 11264,
    width: 400,
    height: 400,
    altText: "Beneficiary profile avatar in Ghana",
    caption: "Default beneficiary avatar",
    folder: "placeholders",
  },
];

async function main() {
  console.log("Seeding authentic African & Ghanaian media assets into CMS registry...");

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

    console.log(`✓ Upserted CmsMediaAsset: ${asset.url} (${asset.altText})`);
  }

  console.log("\nAll media assets successfully synchronized!");
}

main()
  .catch((e) => {
    console.error("Failed to seed media assets:", e);
    process.exit(1);
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });
