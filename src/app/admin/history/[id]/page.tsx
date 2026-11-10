import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { HistoryEventForm } from "@/components/admin/history-event-form";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateHistoryEvent } from "@/actions/admin/history";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Edit History Milestone — LivingHope Admin" };

export default async function EditHistoryEventPage(props: PageProps<"/admin/history/[id]">) {
  await requireStaff();
  const { id } = await props.params;
  const event = await prisma.historyEvent.findUnique({ where: { id } });
  if (!event) notFound();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return updateHistoryEvent(id, formData);
  }

  return (
    <>
      <AdminPageHeader
        title={`Edit Milestone (${event.year})`}
        breadcrumbs={[{ label: "History", href: "/admin/history" }, { label: event.year }]}
      />
      <HistoryEventForm event={event} action={action} />
    </>
  );
}
