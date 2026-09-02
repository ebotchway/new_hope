import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { HistoryEventForm } from "@/components/admin/history-event-form";
import { prisma } from "@/lib/prisma";
import { updateHistoryEvent } from "@/actions/admin/history";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Edit History Event" };

export default async function EditHistoryEventPage(props: PageProps<"/admin/history/[id]">) {
  const { id } = await props.params;
  const event = await prisma.historyEvent.findUnique({ where: { id } });
  if (!event) notFound();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return updateHistoryEvent(id, formData);
  }

  return (
    <>
      <AdminPageHeader title={`Edit ${event.year} Entry`} />
      <HistoryEventForm event={event} action={action} />
    </>
  );
}
