import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { TrusteeForm } from "@/components/admin/trustee-form";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateTrustee } from "@/actions/admin/trustees";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Edit Trustee — LivingHope Admin" };

export default async function EditTrusteePage(props: PageProps<"/admin/trustees/[id]">) {
  await requireStaff();
  const { id } = await props.params;
  const trustee = await prisma.trustee.findUnique({ where: { id } });
  if (!trustee) notFound();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return updateTrustee(id, formData);
  }

  return (
    <>
      <AdminPageHeader
        title={`Edit ${trustee.name}`}
        breadcrumbs={[{ label: "Trustees", href: "/admin/trustees" }, { label: trustee.name }]}
      />
      <TrusteeForm trustee={trustee} action={action} />
    </>
  );
}
