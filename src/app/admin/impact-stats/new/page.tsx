import { AdminPageHeader } from "@/components/admin/page-header";
import { ImpactStatForm } from "@/components/admin/impact-stat-form";
import { createImpactStat } from "@/actions/admin/impact-stats";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add Impact Stat" };

export default function NewImpactStatPage() {
  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createImpactStat(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add an Impact Stat"
        breadcrumbs={[{ label: "Impact Stats", href: "/admin/impact-stats" }, { label: "Add Stat" }]}
      />
      <ImpactStatForm action={action} />
    </>
  );
}
