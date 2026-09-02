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
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true };
}
