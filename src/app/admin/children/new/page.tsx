import { AdminPageHeader } from "@/components/admin/page-header";
import { ChildForm } from "@/components/admin/child-form";
import { requireStaff } from "@/lib/session";
import { createChild } from "@/actions/admin/children";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add Child Profile — LivingHope Admin" };

export default async function NewChildPage() {
  await requireStaff();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createChild(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add a Child"
        description="Create a new sponsorable child profile with bio, school, and photo."
        breadcrumbs={[{ label: "Children", href: "/admin/children" }, { label: "Add Child" }]}
      />
      <ChildForm action={action} />
    </>
  );
}
