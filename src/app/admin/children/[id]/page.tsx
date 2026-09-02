import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChildForm } from "@/components/admin/child-form";
import { prisma } from "@/lib/prisma";
import { updateChild } from "@/actions/admin/children";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Edit Child" };

export default async function EditChildPage(props: PageProps<"/admin/children/[id]">) {
  const { id } = await props.params;
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child) notFound();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return updateChild(id, formData);
  }

  return (
    <>
      <AdminPageHeader title={`Edit ${child.name}`} description="Update this child's profile." />
      <ChildForm child={child} action={action} />
    </>
  );
}
