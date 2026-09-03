import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableListShell, SortableRow } from "@/components/admin/sortable-list";
import { prisma } from "@/lib/prisma";
import { deleteHistoryEvent } from "@/actions/admin/history";
import { reorderHistoryEvents } from "@/actions/admin/reorder";

export const metadata = { title: "History" };

export default async function AdminHistoryPage() {
  const events = await prisma.historyEvent.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="History"
        description="Timeline entries shown on the About page. Drag to reorder."
        breadcrumbs={[{ label: "History" }]}
        action={
          <Button asChild>
            <Link href="/admin/history/new">
              <Plus className="size-4" />
              Add event
            </Link>
          </Button>
        }
      />
      <SortableListShell ids={events.map((e) => e.id)} onReorder={reorderHistoryEvents}>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Year</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No history entries yet.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <SortableRow key={event.id} id={event.id}>
                    <TableCell className="font-medium">{event.year}</TableCell>
                    <TableCell>
                      <Link href={`/admin/history/${event.id}`}>{event.title}</Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.published ? "default" : "secondary"} className={event.published ? "bg-brand-navy" : ""}>
                        {event.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeleteButton action={deleteHistoryEvent.bind(null, event.id)} confirmMessage={`Delete ${event.year} entry?`} />
                    </TableCell>
                  </SortableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </SortableListShell>
    </>
  );
}
