"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/storage";
import { historyEventSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

function parseForm(formData: FormData) {
  const parsed = historyEventSchema.safeParse({
    year: formData.get("year"),
    title: formData.get("title"),
    bulletPoints: formData.get("bulletPoints"),
    order: formData.get("order") || 0,
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });
  if (!parsed.success) return parsed;

  return {
    success: true as const,
    data: {
      ...parsed.data,
      bulletPoints: parsed.data.bulletPoints
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    },
  };
}

export async function createHistoryEvent(formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const image = formData.get("image");
  const imageUrl = image instanceof File && image.size > 0 ? await uploadFile(image, "history") : null;

  await prisma.historyEvent.create({ data: { ...parsed.data, imageUrl } });
  revalidatePath("/admin/history");
  revalidatePath("/about");
  redirect("/admin/history");
}

export async function updateHistoryEvent(id: string, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await prisma.historyEvent.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Event not found" };

  const image = formData.get("image");
  const imageUrl = image instanceof File && image.size > 0 ? await uploadFile(image, "history") : existing.imageUrl;

  await prisma.historyEvent.update({ where: { id }, data: { ...parsed.data, imageUrl } });
  revalidatePath("/admin/history");
  revalidatePath("/about");
  return { success: true };
}

export async function deleteHistoryEvent(id: string): Promise<ActionResult> {
  await requireStaff();
  const existing = await prisma.historyEvent.findUnique({ where: { id } });
  if (existing?.imageUrl) {
    await deleteFile(existing.imageUrl);
  }
  await prisma.historyEvent.delete({ where: { id } });
  revalidatePath("/admin/history");
  revalidatePath("/about");
  return { success: true };
}
