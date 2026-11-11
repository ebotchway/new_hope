import { prisma, closeDatabaseConnection } from "../src/lib/prisma";

async function main() {
  console.log("Remediating beneficiary child photos for child safeguarding compliance...");

  const result = await prisma.child.updateMany({
    where: {
      slug: { in: ["amara", "kwame", "efua"] },
    },
    data: {
      photoUrl: null,
    },
  });

  console.log(`✓ Reset photoUrl to null for ${result.count} seeded children.`);
}

main()
  .catch((e) => {
    console.error("Safeguarding remediation failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await closeDatabaseConnection();
  });

