import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5442/livinghope";
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedTestUsers() {
  console.log("Seeding test users into LivingHope platform...");

  const adminPassword = "Super@Password1212";
  const contributorPassword = "AdomNhyira10";

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const contributorHash = await bcrypt.hash(contributorPassword, 12);

  // 1. Seed 2 Administrators (plus update default admin)
  const admins = [
    {
      email: "admin1@livinghope.org",
      name: "admin1",
      role: "ADMIN" as const,
      passwordHash: adminHash,
    },
    {
      email: "admin2@livinghope.org",
      name: "admin2",
      role: "ADMIN" as const,
      passwordHash: adminHash,
    },
    {
      email: "admin@livinghope.org",
      name: "Super Admin",
      role: "ADMIN" as const,
      passwordHash: adminHash,
    },
  ];

  for (const admin of admins) {
    const user = await prisma.user.upsert({
      where: { email: admin.email },
      create: admin,
      update: {
        name: admin.name,
        role: admin.role,
        passwordHash: admin.passwordHash,
      },
    });
    console.log(`✓ Admin user: ${user.email} (${user.name}) [Role: ${user.role}]`);
  }

  // 2. Seed 5 Contributors (brightnerone through brightnerfive)
  const contributors = [
    { email: "brightnerone@livinghope.org", name: "brightnerone", role: "STAFF" as const },
    { email: "brightnertwo@livinghope.org", name: "brightnertwo", role: "STAFF" as const },
    { email: "brightnerthree@livinghope.org", name: "brightnerthree", role: "STAFF" as const },
    { email: "brightnerfour@livinghope.org", name: "brightnerfour", role: "STAFF" as const },
    { email: "brightnerfive@livinghope.org", name: "brightnerfive", role: "STAFF" as const },
  ];

  for (const contributor of contributors) {
    const user = await prisma.user.upsert({
      where: { email: contributor.email },
      create: {
        ...contributor,
        passwordHash: contributorHash,
      },
      update: {
        name: contributor.name,
        role: contributor.role,
        passwordHash: contributorHash,
      },
    });
    console.log(`✓ Contributor user: ${user.email} (${user.name}) [Role: ${user.role}]`);
  }

  // 3. Ensure default SiteSettings exists
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
      stripeMode: "test",
      momoProvider: "MTN Mobile Money",
      momoRateUsdToGhs: 15.5,
    },
    update: {},
  });
  console.log("✓ Site settings verified.");

  console.log("\n==================================================");
  console.log("All 7 test accounts seeded successfully!");
  console.log("--------------------------------------------------");
  console.log("ADMINS (Password: Super@Password1212):");
  console.log("  1. admin1@livinghope.org (or username: admin1)");
  console.log("  2. admin2@livinghope.org (or username: admin2)");
  console.log("  3. admin@livinghope.org");
  console.log("\nCONTRIBUTORS (Password: AdomNhyira10):");
  console.log("  1. brightnerone@livinghope.org (or username: brightnerone)");
  console.log("  2. brightnertwo@livinghope.org (or username: brightnertwo)");
  console.log("  3. brightnerthree@livinghope.org (or username: brightnerthree)");
  console.log("  4. brightnerfour@livinghope.org (or username: brightnerfour)");
  console.log("  5. brightnerfive@livinghope.org (or username: brightnerfive)");
  console.log("==================================================");
}

seedTestUsers()
  .catch((err) => {
    console.error("Failed to seed test users:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
