"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { impactStatSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

function parseForm(formData: FormData) {
  return impactStatSchema.safeParse({
    label: formData.get("label"),
    value: formData.get("value"),
    order: formData.get("order") || 0,
    published: formData.get("published") === "on",
  });
}

export async function createImpactStat(formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.impactStat.create({ data: parsed.data });
  revalidatePath("/admin/impact-stats");
  revalidatePath("/about");
  redirect("/admin/impact-stats");
}

export async function updateImpactStat(id: string, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.impactStat.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/impact-stats");
  revalidatePath("/about");
  return { success: true };
}

export async function deleteImpactStat(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.impactStat.delete({ where: { id } });
  revalidatePath("/admin/impact-stats");
  revalidatePath("/about");
  return { success: true };
}
