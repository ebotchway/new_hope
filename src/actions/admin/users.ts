"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";
import type { ActionResult } from "@/actions/inquiries";

export async function updateUserRole(id: string, role: Role): Promise<ActionResult> {
  const session = await requireAdmin();
  if (session.user.id === id && role !== "ADMIN") {
    return { success: false, error: "You can't remove your own admin access." };
  }

  // Prevent demoting the only remaining administrator
  if (role !== "ADMIN") {
    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (targetUser?.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return { success: false, error: "Cannot demote the only remaining administrator." };
      }
    }
  }

  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  if (session.user.id === id) {
    return { success: false, error: "You cannot delete your own logged-in account." };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: { donations: true, sponsorships: true },
      },
    },
  });

  if (!targetUser) {
    return { success: false, error: "User account not found." };
  }

  if (targetUser.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return { success: false, error: "Cannot delete the sole administrator account." };
    }
  }

  // Prevent accidental deletion if the user has realized financial transactions
  if (targetUser._count.donations > 0) {
    return {
      success: false,
      error: `Cannot delete user: ${targetUser._count.donations} financial donation records are linked to this account for audit compliance.`,
    };
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { success: true };
}
