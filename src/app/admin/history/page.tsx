import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableListShell, SortableRow } from "@/components/admin/sortable-list";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteHistoryEvent } from "@/actions/admin/history";
import { reorderHistoryEvents } from "@/actions/admin/reorder";

export const metadata = { title: "Organization History — LivingHope Admin" };

export default async function AdminHistoryPage() {
  await requireStaff();
  const events = await prisma.historyEvent.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="Organizational Milestones"
        description="Historical timeline entries shown on the About page. Drag to reorder."
        breadcrumbs={[{ label: "History" }]}
        action={
          <Button asChild>
            <Link href="/admin/history/new">
              <Plus className="size-4" />
              Add Milestone
            </Link>
          </Button>
        }
      />
      <SortableListShell ids={events.map((e) => e.id)} onReorder={reorderHistoryEvents}>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="w-8" />
                <TableHead>Year</TableHead>
                <TableHead>Milestone Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No history timeline milestones added yet.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <SortableRow key={event.id} id={event.id}>
                    <TableCell className="font-mono font-bold text-sm text-brand-navy dark:text-blue-400">
                      {event.year}
                    </TableCell>
                    <TableCell className="font-semibold">
                      <Link href={`/admin/history/${event.id}`} className="hover:underline">
                        {event.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.published ? "default" : "secondary"} className={event.published ? "bg-brand-navy" : ""}>
                        {event.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="size-8" title="Edit Milestone">
                          <Link href={`/admin/history/${event.id}`}>
                            <Edit className="size-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        <DeleteButton
                          action={deleteHistoryEvent.bind(null, event.id)}
                          confirmMessage={`Delete milestone "${event.title}"?`}
                        />
                      </div>
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
