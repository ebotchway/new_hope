import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableListShell, SortableRow } from "@/components/admin/sortable-list";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteTrustee } from "@/actions/admin/trustees";
import { reorderTrustees } from "@/actions/admin/reorder";

export const metadata = { title: "Board of Trustees — LivingHope Admin" };

export default async function AdminTrusteesPage() {
  await requireStaff();
  const trustees = await prisma.trustee.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="Board of Trustees"
        description="Governance and board leadership displayed on the About page. Drag to reorder."
        breadcrumbs={[{ label: "Trustees" }]}
        action={
          <Button asChild>
            <Link href="/admin/trustees/new">
              <Plus className="size-4" />
              Add Trustee
            </Link>
          </Button>
        }
      />
      <SortableListShell ids={trustees.map((t) => t.id)} onReorder={reorderTrustees}>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="w-8" />
                <TableHead>Trustee</TableHead>
                <TableHead>Role / Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trustees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No trustees added yet. Add board members to show governance transparency.
                  </TableCell>
                </TableRow>
              ) : (
                trustees.map((trustee) => (
                  <SortableRow key={trustee.id} id={trustee.id}>
                    <TableCell>
                      <Link href={`/admin/trustees/${trustee.id}`} className="flex items-center gap-3 group">
                        <Avatar className="size-9 border">
                          {trustee.photoUrl && <AvatarImage src={trustee.photoUrl} alt={trustee.name} className="object-cover" />}
                          <AvatarFallback className="bg-brand-navy text-xs text-white">
                            {trustee.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground group-hover:underline">{trustee.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{trustee.title ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={trustee.published ? "default" : "secondary"} className={trustee.published ? "bg-brand-navy" : ""}>
                        {trustee.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteButton
                        action={deleteTrustee.bind(null, trustee.id)}
                        confirmMessage={`Delete trustee "${trustee.name}"?`}
                      />
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
