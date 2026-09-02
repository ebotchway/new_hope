"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { InquiryStatus } from "@/generated/prisma/enums";
import type { ActionResult } from "@/actions/inquiries";

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<ActionResult> {
  await requireStaff();
  await prisma.partnershipInquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/inquiries");
  return { success: true };
}
