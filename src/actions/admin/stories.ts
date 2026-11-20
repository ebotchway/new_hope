"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/storage";
import { storySchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

function parseForm(formData: FormData) {
  return storySchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age") || undefined,
    quote: formData.get("quote"),
    published: formData.get("published") === "on" || formData.get("published") === "true",
    order: formData.get("order") || 0,
  });
}

export async function createStory(formData: FormData): Promise<ActionResult> {
  try {
    await requireStaff();
    const parsed = parseForm(formData);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const image = formData.get("image");
    let imageUrl: string | null = null;
    if (image instanceof File && image.size > 0) {
      try {
        imageUrl = await uploadFile(image, "stories");
      } catch (uploadErr: unknown) {
        return {
          success: false,
          error: uploadErr instanceof Error ? uploadErr.message : "Failed to upload story image.",
        };
      }
    }

    await prisma.story.create({ data: { ...parsed.data, imageUrl } });
    revalidatePath("/admin/stories");
    revalidatePath("/");
  } catch (err: unknown) {
    console.error("[createStory Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while creating story.",
    };
  }

  redirect("/admin/stories");
}

export async function updateStory(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireStaff();
    const parsed = parseForm(formData);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const existing = await prisma.story.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Story not found" };

    const image = formData.get("image");
    let imageUrl = existing.imageUrl;
    if (image instanceof File && image.size > 0) {
      try {
        if (existing.imageUrl) {
          await deleteFile(existing.imageUrl).catch(() => null);
        }
        imageUrl = await uploadFile(image, "stories");
      } catch (uploadErr: unknown) {
        return {
          success: false,
          error: uploadErr instanceof Error ? uploadErr.message : "Failed to upload story image.",
        };
      }
    }

    await prisma.story.update({ where: { id }, data: { ...parsed.data, imageUrl } });
    revalidatePath("/admin/stories");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("[updateStory Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while updating story.",
    };
  }
}

export async function deleteStory(id: string): Promise<ActionResult> {
  try {
    await requireStaff();
    const existing = await prisma.story.findUnique({ where: { id } });
    if (existing?.imageUrl) {
      await deleteFile(existing.imageUrl).catch(() => null);
    }
    await prisma.story.delete({ where: { id } });
    revalidatePath("/admin/stories");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteStory Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while deleting story.",
    };
  }
}
