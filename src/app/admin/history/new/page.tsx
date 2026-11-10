import { AdminPageHeader } from "@/components/admin/page-header";
import { HistoryEventForm } from "@/components/admin/history-event-form";
import { requireStaff } from "@/lib/session";
import { createHistoryEvent } from "@/actions/admin/history";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add History Milestone — LivingHope Admin" };

export default async function NewHistoryEventPage() {
  await requireStaff();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createHistoryEvent(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add Organizational Milestone"
        description="Add a notable founding or impact milestone to the history timeline."
        breadcrumbs={[{ label: "History", href: "/admin/history" }, { label: "Add Milestone" }]}
      />
      <HistoryEventForm action={action} />
    </>
  );
}
