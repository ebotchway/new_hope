import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ImpactStatForm } from "@/components/admin/impact-stat-form";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateImpactStat } from "@/actions/admin/impact-stats";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Edit Impact Stat — LivingHope Admin" };

export default async function EditImpactStatPage(props: PageProps<"/admin/impact-stats/[id]">) {
  await requireStaff();
  const { id } = await props.params;
  const stat = await prisma.impactStat.findUnique({ where: { id } });
  if (!stat) notFound();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return updateImpactStat(id, formData);
  }

  return (
    <>
      <AdminPageHeader
        title={`Edit "${stat.label}"`}
        breadcrumbs={[{ label: "Impact Stats", href: "/admin/impact-stats" }, { label: stat.label }]}
      />
      <ImpactStatForm stat={stat} action={action} />
    </>
  );
}
