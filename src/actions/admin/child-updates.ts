"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { childUpdateSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

export async function createChildUpdate(childId: string, formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const parsed = childUpdateSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    published: formData.get("published") === "on",
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return { success: false, error: "Child not found" };

  const image = formData.get("image");
  const imageUrl = image instanceof File && image.size > 0 ? await uploadFile(image, "child-updates") : null;

  await prisma.childUpdate.create({ data: { ...parsed.data, childId, imageUrl } });

  revalidatePath(`/admin/children/${childId}/updates`);
  revalidatePath(`/sponsor-a-child/${child.slug}`);
  return { success: true };
}

export async function deleteChildUpdate(id: string, childId: string): Promise<ActionResult> {
  await requireStaff();

  const update = await prisma.childUpdate.delete({ where: { id } }).catch(() => null);
  if (!update) return { success: false, error: "Update not found" };

  const child = await prisma.child.findUnique({ where: { id: childId } });

  revalidatePath(`/admin/children/${childId}/updates`);
  if (child) revalidatePath(`/sponsor-a-child/${child.slug}`);
  return { success: true };
}
