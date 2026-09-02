"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/actions/inquiries";

async function persistOrder(
  model: "story" | "trustee" | "historyEvent" | "impactStat",
  ids: string[]
) {
  await prisma.$transaction(
    ids.map((id, index) => {
      switch (model) {
        case "story":
          return prisma.story.update({ where: { id }, data: { order: index } });
        case "trustee":
          return prisma.trustee.update({ where: { id }, data: { order: index } });
        case "historyEvent":
          return prisma.historyEvent.update({ where: { id }, data: { order: index } });
        case "impactStat":
          return prisma.impactStat.update({ where: { id }, data: { order: index } });
      }
    })
  );
}

export async function reorderStories(ids: string[]): Promise<ActionResult> {
  await requireStaff();
  await persistOrder("story", ids);
  revalidatePath("/admin/stories");
  revalidatePath("/");
  return { success: true };
}

export async function reorderTrustees(ids: string[]): Promise<ActionResult> {
  await requireStaff();
  await persistOrder("trustee", ids);
  revalidatePath("/admin/trustees");
  revalidatePath("/about");
  return { success: true };
}

export async function reorderHistoryEvents(ids: string[]): Promise<ActionResult> {
  await requireStaff();
  await persistOrder("historyEvent", ids);
  revalidatePath("/admin/history");
  revalidatePath("/about");
  return { success: true };
}

export async function reorderImpactStats(ids: string[]): Promise<ActionResult> {
  await requireStaff();
  await persistOrder("impactStat", ids);
  revalidatePath("/admin/impact-stats");
  revalidatePath("/about");
  return { success: true };
}
