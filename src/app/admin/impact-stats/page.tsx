import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableListShell, SortableRow } from "@/components/admin/sortable-list";
import { prisma } from "@/lib/prisma";
import { deleteImpactStat } from "@/actions/admin/impact-stats";
import { reorderImpactStats } from "@/actions/admin/reorder";

export const metadata = { title: "Impact Stats" };

export default async function AdminImpactStatsPage() {
  const stats = await prisma.impactStat.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="Impact Stats"
        description="Big numbers shown on the About page impact band. Drag to reorder."
        breadcrumbs={[{ label: "Impact Stats" }]}
        action={
          <Button asChild>
            <Link href="/admin/impact-stats/new">
              <Plus className="size-4" />
              Add stat
            </Link>
          </Button>
        }
      />
      <SortableListShell ids={stats.map((s) => s.id)} onReorder={reorderImpactStats}>
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Value</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No stats yet.
                  </TableCell>
                </TableRow>
              ) : (
                stats.map((stat) => (
                  <SortableRow key={stat.id} id={stat.id}>
                    <TableCell>
                      <Link href={`/admin/impact-stats/${stat.id}`} className="font-medium">
                        {stat.value}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-sm truncate text-muted-foreground">{stat.label}</TableCell>
                    <TableCell>
                      <Badge variant={stat.published ? "default" : "secondary"} className={stat.published ? "bg-brand-navy" : ""}>
                        {stat.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeleteButton action={deleteImpactStat.bind(null, stat.id)} confirmMessage={`Delete "${stat.value}"?`} />
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
