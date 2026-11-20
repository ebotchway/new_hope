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
import { deleteImpactStat } from "@/actions/admin/impact-stats";
import { reorderImpactStats } from "@/actions/admin/reorder";

export const metadata = { title: "Impact Stats — LivingHope Admin" };

export default async function AdminImpactStatsPage() {
  await requireStaff();
  const stats = await prisma.impactStat.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="Impact Statistics"
        description="Key performance and community metrics displayed on the About and Impact pages. Drag to reorder."
        breadcrumbs={[{ label: "Impact Stats" }]}
        action={
          <Button asChild>
            <Link href="/admin/impact-stats/new">
              <Plus className="size-4" />
              Add Metric
            </Link>
          </Button>
        }
      />
      <SortableListShell ids={stats.map((s) => s.id)} onReorder={reorderImpactStats}>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="w-8" />
                <TableHead>Value / Number</TableHead>
                <TableHead>Description Label</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No impact statistics recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                stats.map((stat) => (
                  <SortableRow key={stat.id} id={stat.id}>
                    <TableCell className="font-bold text-base text-brand-navy dark:text-blue-400">
                      <Link href={`/admin/impact-stats/${stat.id}`} className="hover:underline">
                        {stat.value}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{stat.label}</TableCell>
                    <TableCell>
                      <Badge variant={stat.published ? "default" : "secondary"} className={stat.published ? "bg-brand-navy" : ""}>
                        {stat.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="size-8" title="Edit Metric">
                          <Link href={`/admin/impact-stats/${stat.id}`}>
                            <Edit className="size-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        <DeleteButton
                          action={deleteImpactStat.bind(null, stat.id)}
                          confirmMessage={`Delete "${stat.label}"?`}
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
