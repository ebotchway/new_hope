import { AdminPageHeader } from "@/components/admin/page-header";
import { TrusteeForm } from "@/components/admin/trustee-form";
import { requireStaff } from "@/lib/session";
import { createTrustee } from "@/actions/admin/trustees";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add Trustee — LivingHope Admin" };

export default async function NewTrusteePage() {
  await requireStaff();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createTrustee(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add Trustee Member"
        description="Add a member of the Board of Trustees."
        breadcrumbs={[{ label: "Trustees", href: "/admin/trustees" }, { label: "Add Trustee" }]}
      />
      <TrusteeForm action={action} />
    </>
  );
}
