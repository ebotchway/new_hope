"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/storage";
import { trusteeSchema } from "@/lib/validations";
import type { ActionResult } from "@/actions/inquiries";

function parseForm(formData: FormData) {
  return trusteeSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title") || undefined,
    order: formData.get("order") || 0,
    published: formData.get("published") === "on" || formData.get("published") === "true",
  });
}

export async function createTrustee(formData: FormData): Promise<ActionResult> {
  try {
    await requireStaff();
    const parsed = parseForm(formData);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const photo = formData.get("photo");
    let photoUrl: string | null = null;
    if (photo instanceof File && photo.size > 0) {
      try {
        photoUrl = await uploadFile(photo, "trustees");
      } catch (uploadErr: unknown) {
        return {
          success: false,
          error: uploadErr instanceof Error ? uploadErr.message : "Failed to upload trustee photo.",
        };
      }
    }

    await prisma.trustee.create({ data: { ...parsed.data, photoUrl } });
    revalidatePath("/admin/trustees");
    revalidatePath("/about");
  } catch (err: unknown) {
    console.error("[createTrustee Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while creating board member.",
    };
  }

  redirect("/admin/trustees");
}

export async function updateTrustee(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await requireStaff();
    const parsed = parseForm(formData);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const existing = await prisma.trustee.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Trustee not found" };

    const photo = formData.get("photo");
    let photoUrl = existing.photoUrl;
    if (photo instanceof File && photo.size > 0) {
      try {
        if (existing.photoUrl) {
          await deleteFile(existing.photoUrl).catch(() => null);
        }
        photoUrl = await uploadFile(photo, "trustees");
      } catch (uploadErr: unknown) {
        return {
          success: false,
          error: uploadErr instanceof Error ? uploadErr.message : "Failed to upload trustee photo.",
        };
      }
    }

    await prisma.trustee.update({ where: { id }, data: { ...parsed.data, photoUrl } });
    revalidatePath("/admin/trustees");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    console.error("[updateTrustee Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while updating board member.",
    };
  }
}

export async function deleteTrustee(id: string): Promise<ActionResult> {
  try {
    await requireStaff();
    const existing = await prisma.trustee.findUnique({ where: { id } });
    if (existing?.photoUrl) {
      await deleteFile(existing.photoUrl).catch(() => null);
    }
    await prisma.trustee.delete({ where: { id } });
    revalidatePath("/admin/trustees");
    revalidatePath("/about");
    return { success: true };
  } catch (err: unknown) {
    console.error("[deleteTrustee Error]:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected server error occurred while deleting board member.",
    };
  }
}
