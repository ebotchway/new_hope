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
  try {
    await requireStaff();
    const parsed = parseForm(formData);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const image = formData.get("image");
    let imageUrl: string | null = null;
    if (image instanceof File && image.size > 0) {
      try {
        imageUrl = await uploadFile(image, "history");
      } catch (uploadErr: unknown) {
        return {
          success: false,
          error: uploadErr instanceof Error ? uploadErr.message : "Failed to upload event image.",
        };
      }
    }

    await prisma.historyEvent.create({ data: { ...parsed.data, imageUrl } });
    revalidatePath("/admin/history");
    revalidatePath("/about");
  } catch (err: unknown) {
    console.error("[createHistoryEvent Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while creating milestone.",
    };
  }

  redirect("/admin/history");
}

export async function updateHistoryEvent(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireStaff();
    const parsed = parseForm(formData);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const existing = await prisma.historyEvent.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Event not found" };

    const image = formData.get("image");
    let imageUrl = existing.imageUrl;
    if (image instanceof File && image.size > 0) {
      try {
        if (existing.imageUrl) {
          await deleteFile(existing.imageUrl).catch(() => null);
        }
        imageUrl = await uploadFile(image, "history");
      } catch (uploadErr: unknown) {
        return {
          success: false,
          error: uploadErr instanceof Error ? uploadErr.message : "Failed to upload event image.",
        };
      }
    }

    await prisma.historyEvent.update({ where: { id }, data: { ...parsed.data, imageUrl } });
    revalidatePath("/admin/history");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    console.error("[updateHistoryEvent Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while updating milestone.",
    };
  }
}

export async function deleteHistoryEvent(id: string): Promise<ActionResult> {
  try {
    await requireStaff();
    const existing = await prisma.historyEvent.findUnique({ where: { id } });
    if (existing?.imageUrl) {
      await deleteFile(existing.imageUrl).catch(() => null);
    }
    await prisma.historyEvent.delete({ where: { id } });
    revalidatePath("/admin/history");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteHistoryEvent Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while deleting milestone.",
    };
  }
}
