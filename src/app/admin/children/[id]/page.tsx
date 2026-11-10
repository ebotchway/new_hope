import Link from "next/link";
import { notFound } from "next/navigation";
import { NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChildForm } from "@/components/admin/child-form";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateChild } from "@/actions/admin/children";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Edit Child Profile" };

export default async function EditChildPage(props: PageProps<"/admin/children/[id]">) {
  await requireStaff();
  const { id } = await props.params;
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child) notFound();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return updateChild(id, formData);
  }

  return (
    <>
      <AdminPageHeader
        title={`Edit ${child.name}`}
        description="Update this child's profile details and photo."
        breadcrumbs={[{ label: "Children", href: "/admin/children" }, { label: child.name }]}
        action={
          <Button asChild variant="outline">
            <Link href={`/admin/children/${id}/updates`}>
              <NotebookPen className="size-4" />
              Manage updates
            </Link>
          </Button>
        }
      />
      <ChildForm child={child} action={action} />
    </>
  );
}
