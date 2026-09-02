"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { storySchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

function parseForm(formData: FormData) {
  return storySchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age") || undefined,
    quote: formData.get("quote"),
    published: formData.get("published") === "on",
    order: formData.get("order") || 0,
  });
}

export async function createStory(formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const image = formData.get("image");
  const imageUrl = image instanceof File && image.size > 0 ? await uploadFile(image, "stories") : null;

  await prisma.story.create({ data: { ...parsed.data, imageUrl } });
  revalidatePath("/admin/stories");
  revalidatePath("/");
  redirect("/admin/stories");
}

export async function updateStory(id: string, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await prisma.story.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Story not found" };

  const image = formData.get("image");
  const imageUrl = image instanceof File && image.size > 0 ? await uploadFile(image, "stories") : existing.imageUrl;

  await prisma.story.update({ where: { id }, data: { ...parsed.data, imageUrl } });
  revalidatePath("/admin/stories");
  revalidatePath("/");
  return { success: true };
}

export async function deleteStory(id: string): Promise<ActionResult> {
  await requireStaff();
  await prisma.story.delete({ where: { id } });
  revalidatePath("/admin/stories");
  revalidatePath("/");
  return { success: true };
}
