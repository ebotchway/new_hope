import { AdminPageHeader } from "@/components/admin/page-header";
import { HistoryEventForm } from "@/components/admin/history-event-form";
import { createHistoryEvent } from "@/actions/admin/history";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add History Event" };

export default function NewHistoryEventPage() {
  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createHistoryEvent(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add a History Event"
        breadcrumbs={[{ label: "History", href: "/admin/history" }, { label: "Add Event" }]}
      />
      <HistoryEventForm action={action} />
    </>
  );
}
