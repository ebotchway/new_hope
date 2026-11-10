"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { childSchema } from "@/lib/validations";
import { slugify } from "@/lib/format";
import type { ActionResult } from "@/actions/inquiries";

async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "child";
  let slug = base;
  let suffix = 1;
  while (true) {
    const existing = await prisma.child.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

function parseChildForm(formData: FormData) {
  return childSchema.safeParse({
    name: formData.get("name"),
    gender: formData.get("gender"),
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    bio: formData.get("bio"),
    school: formData.get("school") || undefined,
    location: formData.get("location") || undefined,
    status: formData.get("status") || "AVAILABLE",
    featured: formData.get("featured") === "on",
    archived: formData.get("archived") === "on",
    fundingGoalCents: Math.round(Number(formData.get("fundingGoalCents") || 0) * 100),
  });
}

export async function createChild(formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = parseChildForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const photo = formData.get("photo");
  const photoUrl = photo instanceof File && photo.size > 0 ? await uploadFile(photo, "children") : null;

  const slug = await uniqueSlug(parsed.data.name);

  const child = await prisma.child.create({
    data: {
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      slug,
      photoUrl,
    },
  });

  revalidatePath("/admin/children");
  revalidatePath("/sponsor-a-child");
  redirect(`/admin/children/${child.id}`);
}

export async function updateChild(id: string, formData: FormData): Promise<ActionResult> {
  await requireStaff();
  const parsed = parseChildForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.child.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Child not found" };

  const photo = formData.get("photo");
  const photoUrl =
    photo instanceof File && photo.size > 0 ? await uploadFile(photo, "children") : existing.photoUrl;

  const slug = existing.name === parsed.data.name ? existing.slug : await uniqueSlug(parsed.data.name, id);

  await prisma.child.update({
    where: { id },
    data: {
      ...parsed.data,
      dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null,
      slug,
      photoUrl,
    },
  });

  revalidatePath("/admin/children");
  revalidatePath(`/admin/children/${id}`);
  revalidatePath("/sponsor-a-child");
  revalidatePath(`/sponsor-a-child/${slug}`);
  return { success: true };
}

export async function toggleArchiveChild(id: string, archived: boolean): Promise<ActionResult> {
  await requireStaff();
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child) return { success: false, error: "Child not found" };

  await prisma.child.update({
    where: { id },
    data: { archived },
  });

  revalidatePath("/admin/children");
  revalidatePath("/sponsor-a-child");
  revalidatePath(`/sponsor-a-child/${child.slug}`);
  return { success: true };
}

export async function deleteChild(id: string): Promise<ActionResult> {
  await requireStaff();

  // Check if sponsorships or donations exist before attempting delete
  const [sponsorshipsCount, donationsCount] = await Promise.all([
    prisma.sponsorship.count({ where: { childId: id } }),
    prisma.donation.count({ where: { childId: id } }),
  ]);

  if (sponsorshipsCount > 0 || donationsCount > 0) {
    return {
      success: false,
      error: `Cannot permanently delete this child because they have ${sponsorshipsCount} sponsorship(s) and ${donationsCount} donation(s) linked. Archive the child instead to protect financial history.`,
    };
  }

  try {
    await prisma.child.delete({ where: { id } });
  } catch {
    return {
      success: false,
      error: "Could not delete this child record. Ensure all linked updates and dependencies are resolved.",
    };
  }

  revalidatePath("/admin/children");
  revalidatePath("/sponsor-a-child");
  return { success: true };
}
