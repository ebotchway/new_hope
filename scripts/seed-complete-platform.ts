import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import {
  DEFAULT_HOMEPAGE_SECTIONS,
  DEFAULT_ABOUT_SECTIONS,
  DEFAULT_WHAT_WE_DO_SECTIONS,
} from "../src/lib/cms-defaults";
import { DEFAULT_APPEARANCE } from "../src/lib/cms-loader";

// Normalize connection string: use Transaction Mode pooler (port 6543) if pooler 5432 is detected
function getDbUrl(): string {
  const raw =
    process.env.DATABASE_URL ||
    process.env.SUPABASE_CONNECT ||
    "postgresql://postgres:postgres@localhost:5442/livinghope";
  if (raw.includes("pooler.supabase.com:5432")) {
    let normalized = raw.replace(":5432", ":6543");
    if (!normalized.includes("pgbouncer=true")) {
      const sep = normalized.includes("?") ? "&" : "?";
      normalized = `${normalized}${sep}pgbouncer=true`;
    }
    return normalized;
  }
  return raw;
}

const dbUrl = getDbUrl();
console.log("🌱 Connecting to database for platform seeding:", dbUrl.replace(/:[^:@]+@/, ":***@"));

const pool = new Pool({
  connectionString: dbUrl,
  max: 2,
  connectionTimeoutMillis: 10000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function seedCompletePlatform() {
  console.log("==================================================");
  console.log("   LIVINGHOPE COMPLETE PLATFORM SEEDER");
  console.log("==================================================");

  // 1. SITE SETTINGS
  console.log("1/10 Seeding Site Settings...");
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      heroHeadline: "Restoring Hope to Street-Connected Children in Ghana",
      heroSubheadline: "Providing access to education, nutrition, and holistic mentorship for a brighter future.",
      missionTitle: "Our Guiding Mission",
      missionBody:
        "At LivingHope, we are dedicated to transforming the lives of street children by providing comprehensive access to quality education. We foster environments where every child can discover their innate potential, cultivate their talents, and build a foundation for a brighter, self-sufficient future.",
      contactEmail: "hello@livinghope.org",
      contactPhone: "+233 24 123 4567",
      momoNumber: "0241234567",
      momoName: "LivingHope Foundation Ghana",
      momoProvider: "MTN Mobile Money",
    },
    update: {
      heroHeadline: "Restoring Hope to Street-Connected Children in Ghana",
      heroSubheadline: "Providing access to education, nutrition, and holistic mentorship for a brighter future.",
      contactEmail: "hello@livinghope.org",
    },
  });

  // 2. TEST USERS (Admins & Staff)
  console.log("2/10 Seeding Administrative & Contributor Accounts...");
  const adminPassword = "Super@Password1212";
  const adminHash = await bcrypt.hash(adminPassword, 12);
  const contributorPassword = "AdomNhyira10";
  const contributorHash = await bcrypt.hash(contributorPassword, 12);

  const initialUsers = [
    { email: "admin1@livinghope.org", name: "admin1", role: "ADMIN" as const, passwordHash: adminHash },
    { email: "admin2@livinghope.org", name: "admin2", role: "ADMIN" as const, passwordHash: adminHash },
    { email: "admin@livinghope.org", name: "Super Admin", role: "ADMIN" as const, passwordHash: adminHash },
    { email: "brightnerone@livinghope.org", name: "brightnerone", role: "STAFF" as const, passwordHash: contributorHash },
    { email: "brightnertwo@livinghope.org", name: "brightnertwo", role: "STAFF" as const, passwordHash: contributorHash },
    { email: "brightnerthree@livinghope.org", name: "brightnerthree", role: "STAFF" as const, passwordHash: contributorHash },
    { email: "brightnerfour@livinghope.org", name: "brightnerfour", role: "STAFF" as const, passwordHash: contributorHash },
    { email: "brightnerfive@livinghope.org", name: "brightnerfive", role: "STAFF" as const, passwordHash: contributorHash },
  ];

  for (const u of initialUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: u,
      update: { name: u.name, role: u.role, passwordHash: u.passwordHash },
    });
  }

  // 3. CHILDREN PROFILES
  console.log("3/10 Seeding Dignified Children Profiles...");
  const children = [
    {
      slug: "amara",
      name: "Amara",
      gender: "FEMALE" as const,
      dateOfBirth: new Date(2014, 4, 15),
      bio: "Amara loves to read and dreams of becoming a teacher. With support from LivingHope, she is excelling in reading and remedial math at Accra Community School.",
      school: "Accra Community School",
      location: "Accra, Ghana",
      status: "AVAILABLE" as const,
      featured: true,
      fundingGoalCents: 45000, // $450/year
      photoUrl: null, // Ethical Safeguarding: Neutral safeguarding placeholder is used
      order: 1,
    },
    {
      slug: "kwame",
      name: "Kwame",
      gender: "MALE" as const,
      dateOfBirth: new Date(2016, 8, 22),
      bio: "Kwame is a bright, curious boy who loves building things and aspires to be an engineer. He is currently enrolled in primary STEM education.",
      school: "Tema Vocational Institute",
      location: "Tema, Ghana",
      status: "AVAILABLE" as const,
      featured: true,
      fundingGoalCents: 48000, // $480/year
      photoUrl: null,
      order: 2,
    },
    {
      slug: "efua",
      name: "Efua",
      gender: "FEMALE" as const,
      dateOfBirth: new Date(2017, 2, 10),
      bio: "Efua is full of energy and loves music and poetry. With sponsor backing, she attends school daily and participates in cultural creative arts.",
      school: "Kumasi Primary School",
      location: "Kumasi, Ghana",
      status: "AVAILABLE" as const,
      featured: true,
      fundingGoalCents: 40000, // $400/year
      photoUrl: null,
      order: 3,
    },
    {
      slug: "kofi",
      name: "Kofi",
      gender: "MALE" as const,
      dateOfBirth: new Date(2015, 6, 18),
      bio: "Kofi was found working along the Jamestown fishing harbor. Through LivingHope outreach, he has returned to school and loves learning computer skills.",
      school: "Lighthouse Academy",
      location: "Accra, Ghana",
      status: "AVAILABLE" as const,
      featured: false,
      fundingGoalCents: 52000,
      photoUrl: null,
      order: 4,
    },
    {
      slug: "abena",
      name: "Abena",
      gender: "FEMALE" as const,
      dateOfBirth: new Date(2018, 1, 5),
      bio: "Abena is a determined young girl in Ashaiman who dreams of becoming a pediatric nurse. Sponsoring her covers tuition, books, and daily hot lunches.",
      school: "Hope Revival Basic School",
      location: "Tema, Ghana",
      status: "AVAILABLE" as const,
      featured: false,
      fundingGoalCents: 38000,
      photoUrl: null,
      order: 5,
    },
    {
      slug: "yaw",
      name: "Yaw",
      gender: "MALE" as const,
      dateOfBirth: new Date(2013, 11, 29),
      bio: "Yaw is a resilient 13-year-old learning technical woodworking and numeracy. He hopes to start his own community furniture enterprise.",
      school: "St. Peter's Vocational Academy",
      location: "Kumasi, Ghana",
      status: "AVAILABLE" as const,
      featured: false,
      fundingGoalCents: 55000,
      photoUrl: null,
      order: 6,
    },
  ];

  for (const child of children) {
    await prisma.child.upsert({
      where: { slug: child.slug },
      create: child,
      update: {
        name: child.name,
        gender: child.gender,
        dateOfBirth: child.dateOfBirth,
        bio: child.bio,
        school: child.school,
        location: child.location,
        status: child.status,
        featured: child.featured,
        fundingGoalCents: child.fundingGoalCents,
        order: child.order,
      },
    });
  }

  // 4. STORIES
  console.log("4/10 Seeding Impact Stories...");
  const stories = [
    {
      name: "Amara",
      age: 12,
      quote: "Receiving books and a uniform meant I could finally attend school. This education is the greatest gift I have ever received.",
      order: 0,
      published: true,
    },
    {
      name: "Kwame",
      age: 10,
      quote: "I used to wander the streets of Tema wondering what tomorrow would bring. Now I have books, teachers, and a future.",
      order: 1,
      published: true,
    },
    {
      name: "Efua",
      age: 9,
      quote: "Reading stories in class and singing in the choir makes me smile every single day. Thank you to everyone who supports us.",
      order: 2,
      published: true,
    },
  ];

  for (const story of stories) {
    const existing = await prisma.story.findFirst({ where: { name: story.name } });
    if (!existing) {
      await prisma.story.create({ data: story });
    } else {
      await prisma.story.update({ where: { id: existing.id }, data: story });
    }
  }

  // 5. IMPACT STATS
  console.log("5/10 Seeding Impact Statistics...");
  const impactStats = [
    { label: "Street Children Supported into Schooling", value: "20+", order: 0 },
    { label: "Uniforms & Academic Kits Distributed", value: "150+", order: 1 },
    { label: "Nutritious Meals Served Annually", value: "12,000+", order: 2 },
    { label: "Community Brightener Mentors", value: "45+", order: 3 },
  ];

  for (const stat of impactStats) {
    const existing = await prisma.impactStat.findFirst({ where: { label: stat.label } });
    if (!existing) {
      await prisma.impactStat.create({ data: stat });
    } else {
      await prisma.impactStat.update({ where: { id: existing.id }, data: stat });
    }
  }

  // 6. HISTORY EVENTS (Milestones)
  console.log("6/10 Seeding History & Milestones...");
  const historyEvents = [
    {
      year: "2010",
      title: "Launched SheltaAfrica NGO",
      bulletPoints: [
        "Preached compassion and hope to street dwellers in Accra.",
        "Provided daily hot meals and basic medical relief.",
        "Funded initial micro-trading start-up capital for vulnerable mothers.",
        "Sponsored the first cohort of children into local basic schools.",
      ],
      order: 0,
      published: true,
    },
    {
      year: "2015",
      title: "Expanded Educational & Vocational Outreach",
      bulletPoints: [
        "Expanded feeding and learning centres across Greater Accra and Tema.",
        "Introduced vocational trades (carpentry, electrical, tailoring) for older youth.",
        "Formed partnerships with accredited local basic and junior high schools.",
      ],
      order: 1,
      published: true,
    },
    {
      year: "2025",
      title: "Launched LivingHope Digital Platform",
      bulletPoints: [
        "Scaled up sponsorship outreach through transparent online profiles.",
        "Integrated dual-currency Mobile Money and international card giving.",
        "Established dedicated Brightener community mentorship network.",
      ],
      order: 2,
      published: true,
    },
  ];

  for (const event of historyEvents) {
    const existing = await prisma.historyEvent.findFirst({ where: { year: event.year } });
    if (!existing) {
      await prisma.historyEvent.create({ data: event });
    } else {
      await prisma.historyEvent.update({ where: { id: existing.id }, data: event });
    }
  }

  // 7. TRUSTEES
  console.log("7/10 Seeding Board of Trustees...");
  const trustees = [
    { name: "Seyram Akotey", title: "Board Chairman & Executive Director", order: 0, published: true },
    { name: "Angela Farley", title: "Trustee — International Relations & Child Safeguarding", order: 1, published: true },
    { name: "CK Bruce", title: "Trustee — Strategy, Technology & Governance", order: 2, published: true },
    { name: "Cobby Washington", title: "Trustee — Finance & Operations", order: 3, published: true },
    { name: "Frank Bediako", title: "Trustee — Field Welfare & Community Outreach", order: 4, published: true },
    { name: "Clifford Frempong", title: "Trustee — Legal, Compliance & Partnerships", order: 5, published: true },
  ];

  for (const trustee of trustees) {
    const existing = await prisma.trustee.findFirst({ where: { name: trustee.name } });
    if (!existing) {
      await prisma.trustee.create({ data: trustee });
    } else {
      await prisma.trustee.update({ where: { id: existing.id }, data: trustee });
    }
  }

  // 8. CMS APPEARANCE
  console.log("8/10 Seeding CMS Appearance Settings...");
  await prisma.cmsAppearance.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      primaryColor: DEFAULT_APPEARANCE.primaryColor,
      secondaryColor: DEFAULT_APPEARANCE.secondaryColor,
      accentColor: DEFAULT_APPEARANCE.accentColor,
      fontHeading: DEFAULT_APPEARANCE.fontHeading,
      fontBody: DEFAULT_APPEARANCE.fontBody,
      buttonRadius: DEFAULT_APPEARANCE.buttonRadius,
      containerWidth: DEFAULT_APPEARANCE.containerWidth,
      headerSticky: DEFAULT_APPEARANCE.headerSticky,
      footerTheme: DEFAULT_APPEARANCE.footerTheme,
      logoUrl: "/brand/livinghope-logo-master.svg",
      logoDarkUrl: "/brand/livinghope-logo-master.svg",
      faviconUrl: "/favicon.ico",
    },
    update: {
      logoUrl: "/brand/livinghope-logo-master.svg",
      logoDarkUrl: "/brand/livinghope-logo-master.svg",
    },
  });

  // 9. CMS NAVIGATION ITEMS
  console.log("9/10 Seeding CMS Navigation Items...");
  const navItems = [
    { menu: "HEADER" as const, label: "What We Do", href: "/what-we-do", order: 1, isExternal: false, published: true },
    { menu: "HEADER" as const, label: "Sponsor a Child", href: "/sponsor-a-child", order: 2, isExternal: false, published: true },
    { menu: "HEADER" as const, label: "Become a Brightener", href: "/become-a-brightener", order: 3, isExternal: false, published: true },
    { menu: "HEADER" as const, label: "Make a Donation", href: "/donate", order: 4, isExternal: false, published: true },
    { menu: "HEADER" as const, label: "About Us", href: "/about", order: 5, isExternal: false, published: true },
    { menu: "HEADER" as const, label: "Contact Us", href: "/contact", order: 6, isExternal: false, published: true },
  ];

  for (const item of navItems) {
    const existing = await prisma.cmsNavItem.findFirst({
      where: { menu: item.menu, href: item.href },
    });
    if (!existing) {
      await prisma.cmsNavItem.create({ data: item });
    }
  }

  // 10. CMS CORE PAGES (Home, About, What We Do)
  console.log("10/10 Seeding CMS Pages & Published Revisions...");
  const cmsPagesToSeed = [
    {
      slug: "home",
      title: "Homepage",
      publicTitle: "LivingHope — Restoring Hope to Children in Ghana",
      description: "Nonprofit charity transforming the lives of street-connected children in Ghana through education and community support.",
      sections: DEFAULT_HOMEPAGE_SECTIONS,
    },
    {
      slug: "about",
      title: "About Us",
      publicTitle: "About LivingHope Ghana",
      description: "Our history, faith, mission, and leadership team in Accra, Ghana.",
      sections: DEFAULT_ABOUT_SECTIONS,
    },
    {
      slug: "what-we-do",
      title: "What We Do",
      publicTitle: "Our Programmes & Community Interventions",
      description: "Street outreach, schooling, and vocational training programmes in Ghana.",
      sections: DEFAULT_WHAT_WE_DO_SECTIONS,
    },
  ];

  for (const p of cmsPagesToSeed) {
    let page = await prisma.cmsPage.findUnique({ where: { slug: p.slug } });
    if (!page) {
      page = await prisma.cmsPage.create({
        data: {
          slug: p.slug,
          title: p.title,
          publicTitle: p.publicTitle,
          description: p.description,
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
          sections: p.sections as any,
          changelog: `Initial ${p.title} Content`,
        },
      });

      await prisma.cmsPage.update({
        where: { id: page.id },
        data: { publishedRevisionId: rev.id },
      });
    }
  }

  // 11. MEDIA ASSETS REGISTRY
  console.log("11/11 Registering CMS Media Assets in Database...");
  const mediaAssets = [
    { filename: "home-hero.webp", originalName: "home-hero.webp", url: "/uploads/cms/home-hero.webp", mimeType: "image/webp", sizeBytes: 154200, folder: "cms", altText: "Home Hero" },
    { filename: "street-child.webp", originalName: "street-child.webp", url: "/uploads/cms/street-child.webp", mimeType: "image/webp", sizeBytes: 132400, folder: "cms", altText: "Street Child" },
    { filename: "team-field.webp", originalName: "team-field.webp", url: "/uploads/cms/team-field.webp", mimeType: "image/webp", sizeBytes: 189400, folder: "cms", altText: "Team in Field" },
    { filename: "about-hero.webp", originalName: "about-hero.webp", url: "/uploads/cms/about-hero.webp", mimeType: "image/webp", sizeBytes: 142000, folder: "cms", altText: "About Hero" },
    { filename: "mission.webp", originalName: "mission.webp", url: "/uploads/cms/mission.webp", mimeType: "image/webp", sizeBytes: 165000, folder: "cms", altText: "Mission in Action" },
    { filename: "brightener-hero.webp", originalName: "brightener-hero.webp", url: "/uploads/cms/brightener-hero.webp", mimeType: "image/webp", sizeBytes: 178000, folder: "cms", altText: "Brightener Outreach" },
    { filename: "education.webp", originalName: "education.webp", url: "/uploads/cms/education.webp", mimeType: "image/webp", sizeBytes: 162000, folder: "cms", altText: "Education Programme" },
    { filename: "health.webp", originalName: "health.webp", url: "/uploads/cms/health.webp", mimeType: "image/webp", sizeBytes: 149000, folder: "cms", altText: "Health Programme" },
    { filename: "vocational.webp", originalName: "vocational.webp", url: "/uploads/cms/vocational.webp", mimeType: "image/webp", sizeBytes: 158000, folder: "cms", altText: "Vocational Programme" },
    { filename: "partnership-banner.webp", originalName: "partnership-banner.webp", url: "/uploads/cms/partnership-banner.webp", mimeType: "image/webp", sizeBytes: 139000, folder: "cms", altText: "Partnership Banner" },
  ];

  for (const asset of mediaAssets) {
    const existing = await prisma.cmsMediaAsset.findFirst({ where: { url: asset.url } });
    if (!existing) {
      await prisma.cmsMediaAsset.create({ data: asset });
    }
  }

  console.log("==================================================");
  console.log("✅ PLATFORM SEEDING COMPLETED SUCCESSFULLY!");
  console.log("==================================================");
}

if (process.argv[1]?.endsWith("seed-complete-platform.ts")) {
  seedCompletePlatform()
    .then(async () => {
      await prisma.$disconnect();
      await pool.end();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error("❌ Seeding failed:", e);
      await prisma.$disconnect();
      await pool.end();
      process.exit(1);
    });
}
