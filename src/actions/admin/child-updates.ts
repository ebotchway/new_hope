"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/storage";
import { childUpdateSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

export async function createChildUpdate(childId: string, formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const parsed = childUpdateSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) return { success: false, error: "Child not found" };

  const image = formData.get("image");
  const imageUrl = image instanceof File && image.size > 0 ? await uploadFile(image, "child-updates") : null;

  await prisma.childUpdate.create({ data: { ...parsed.data, childId, imageUrl } });

  revalidatePath("/admin/progress-reports");
  revalidatePath(`/admin/children/${childId}/updates`);
  revalidatePath(`/sponsor-a-child/${child.slug}`);
  return { success: true };
}

export async function createChildUpdateGeneral(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireStaff();

  const childId = formData.get("childId");
  if (typeof childId !== "string" || !childId) {
    return { success: false, error: "Please select a child for this progress report." };
  }

  return createChildUpdate(childId, formData);
}

export async function updateChildUpdate(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireStaff();

  const existing = await prisma.childUpdate.findUnique({
    where: { id },
    include: { child: true },
  });
  if (!existing) return { success: false, error: "Progress update not found." };

  const parsed = childUpdateSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const image = formData.get("image");
  let imageUrl = existing.imageUrl;

  if (image instanceof File && image.size > 0) {
    if (existing.imageUrl) {
      await deleteFile(existing.imageUrl).catch(() => null);
    }
    imageUrl = await uploadFile(image, "child-updates");
  }

  await prisma.childUpdate.update({
    where: { id },
    data: {
      ...parsed.data,
      imageUrl,
    },
  });

  revalidatePath("/admin/progress-reports");
  revalidatePath(`/admin/children/${existing.childId}/updates`);
  if (existing.child) {
    revalidatePath(`/sponsor-a-child/${existing.child.slug}`);
  }
  return { success: true };
}

export async function deleteChildUpdate(id: string, childId?: string): Promise<ActionResult> {
  await requireStaff();

  const existing = await prisma.childUpdate.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Update not found" };

  const targetChildId = childId || existing.childId;

  if (existing.imageUrl) {
    await deleteFile(existing.imageUrl).catch(() => null);
  }

  await prisma.childUpdate.delete({ where: { id } }).catch(() => null);

  const child = await prisma.child.findUnique({ where: { id: targetChildId } });

  revalidatePath("/admin/progress-reports");
  revalidatePath(`/admin/children/${targetChildId}/updates`);
  if (child) revalidatePath(`/sponsor-a-child/${child.slug}`);
  return { success: true };
}
