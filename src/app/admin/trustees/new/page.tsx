import { AdminPageHeader } from "@/components/admin/page-header";
import { TrusteeForm } from "@/components/admin/trustee-form";
import { createTrustee } from "@/actions/admin/trustees";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add Trustee" };

export default function NewTrusteePage() {
  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createTrustee(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add a Trustee"
        breadcrumbs={[{ label: "Trustees", href: "/admin/trustees" }, { label: "Add Trustee" }]}
      />
      <TrusteeForm action={action} />
    </>
  );
}
