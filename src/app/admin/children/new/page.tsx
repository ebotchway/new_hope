import { AdminPageHeader } from "@/components/admin/page-header";
import { ChildForm } from "@/components/admin/child-form";
import { createChild } from "@/actions/admin/children";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add Child" };

export default function NewChildPage() {
  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createChild(formData);
  }

  return (
    <>
      <AdminPageHeader title="Add a Child" description="Create a new sponsorable child profile." />
      <ChildForm action={action} />
    </>
  );
}
