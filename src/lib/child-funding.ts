import { prisma } from "@/lib/prisma";

/** Sum of succeeded donations designated to each child, keyed by childId. */
export async function getRaisedAmountsByChild(childIds: string[]): Promise<Map<string, number>> {
  if (childIds.length === 0) return new Map();

  const grouped = await prisma.donation.groupBy({
    by: ["childId"],
    where: {
      childId: { in: childIds },
      status: "SUCCEEDED",
      designation: "CHILD_SPONSORSHIP",
    },
    _sum: { amountCents: true },
  });

  return new Map(grouped.map((g) => [g.childId as string, g._sum.amountCents ?? 0]));
}
