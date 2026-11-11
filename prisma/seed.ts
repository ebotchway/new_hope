import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      heroHeadline: "Transforming Lives Through Education",
      heroSubheadline: "Providing access to education for a brighter future",
      missionTitle: "Our Guiding Mission",
      missionBody:
        "At LivingHope, we are dedicated to transforming the lives of street children by providing comprehensive access to quality education. We foster environments where every child can discover their innate potential, cultivate their talents, and build a foundation for a brighter, self-sufficient future.",
      contactEmail: "hello@livinghope.org",
    },
    update: {},
  });

  const adminEmail = "admin@livinghope.org";
  const adminPassword = "ChangeMe123!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "LivingHope Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 12),
    },
    update: {},
  });

  const children = [
    {
      slug: "amara",
      name: "Amara",
      gender: "FEMALE" as const,
      bio: "Amara loves to read and dreams of becoming a teacher one day. She recently started school for the first time thanks to a LivingHope sponsor.",
      school: "Accra Community School",
      location: "Accra, Ghana",
      status: "AVAILABLE" as const,
      featured: true,
      photoUrl: null, // Neutral safeguarding placeholder used until authorized parental/guardian photography is verified
    },
    {
      slug: "kwame",
      name: "Kwame",
      gender: "MALE" as const,
      bio: "Kwame is a bright, curious 10-year-old who wants to learn how things work. He's currently enrolled in a vocational carpentry program.",
      school: "Tema Vocational Institute",
      location: "Tema, Ghana",
      status: "AVAILABLE" as const,
      featured: false,
      photoUrl: null,
    },
    {
      slug: "efua",
      name: "Efua",
      gender: "FEMALE" as const,
      bio: "Efua is full of energy and loves to sing. With your support, she can continue her education and pursue her passion for music.",
      school: "Kumasi Primary School",
      location: "Kumasi, Ghana",
      status: "AVAILABLE" as const,
      featured: false,
      photoUrl: null,
    },
  ];

  for (const child of children) {
    await prisma.child.upsert({
      where: { slug: child.slug },
      create: child,
      update: { photoUrl: child.photoUrl },
    });
  }

  const stories = [
    {
      name: "Amara",
      age: 12,
      quote:
        "Receiving books and a uniform meant I could finally attend school. This education is the greatest gift I have ever received.",
      order: 0,
    },
  ];

  for (const story of stories) {
    const existing = await prisma.story.findFirst({ where: { name: story.name, order: story.order } });
    if (!existing) await prisma.story.create({ data: story });
  }

  const impactStats = [
    { label: "Street Children provided with education / vocational training", value: "20+", order: 0 },
  ];
  for (const stat of impactStats) {
    const existing = await prisma.impactStat.findFirst({ where: { value: stat.value, label: stat.label } });
    if (!existing) await prisma.impactStat.create({ data: stat });
  }

  const historyEvents = [
    {
      year: "2010",
      title: "Launched SheltaAfrica NGO",
      bulletPoints: [
        "Preach Jesus Christ to street dwellers.",
        "Provide free meals.",
        "Provide health care.",
        "Provide start-up capital for petty trading.",
        "Sponsor children's education.",
      ],
      order: 0,
    },
    {
      year: "2015",
      title: "Expanded Our Reach",
      bulletPoints: [
        "Preach Jesus Christ to street dwellers.",
        "Provide free meals.",
        "Sponsor children's education.",
        "Provide vocational training opportunities.",
      ],
      order: 1,
    },
    {
      year: "2025",
      title: "Launched LivingHope",
      bulletPoints: [
        "Scale up education sponsorship using digital media.",
        "Preach Jesus Christ to street dwellers.",
        "Provide free meals.",
        "Provide health care.",
        "Provide start-up capital for petty trading.",
      ],
      order: 2,
    },
  ];
  for (const event of historyEvents) {
    const existing = await prisma.historyEvent.findFirst({ where: { year: event.year, title: event.title } });
    if (!existing) await prisma.historyEvent.create({ data: event });
  }

  const trustees = [
    { name: "Seyram Akotey", order: 0 },
    { name: "Angela Farley", order: 1 },
    { name: "CK Bruce", order: 2 },
    { name: "Cobby Washington", order: 3 },
    { name: "Frank Bediako", order: 4 },
    { name: "Clifford Frempong", order: 5 },
  ];
  for (const trustee of trustees) {
    const existing = await prisma.trustee.findFirst({ where: { name: trustee.name } });
    if (!existing) await prisma.trustee.create({ data: trustee });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
