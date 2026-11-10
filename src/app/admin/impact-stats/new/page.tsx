import { AdminPageHeader } from "@/components/admin/page-header";
import { ImpactStatForm } from "@/components/admin/impact-stat-form";
import { requireStaff } from "@/lib/session";
import { createImpactStat } from "@/actions/admin/impact-stats";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add Impact Metric — LivingHope Admin" };

export default async function NewImpactStatPage() {
  await requireStaff();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createImpactStat(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add Impact Statistic"
        description="Add a verified impact number to display on the public platform."
        breadcrumbs={[{ label: "Impact Stats", href: "/admin/impact-stats" }, { label: "Add Stat" }]}
      />
      <ImpactStatForm action={action} />
    </>
  );
}
