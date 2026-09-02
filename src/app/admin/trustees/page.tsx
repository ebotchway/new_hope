import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableListShell, SortableRow } from "@/components/admin/sortable-list";
import { prisma } from "@/lib/prisma";
import { deleteTrustee } from "@/actions/admin/trustees";
import { reorderTrustees } from "@/actions/admin/reorder";

export const metadata = { title: "Trustees" };

export default async function AdminTrusteesPage() {
  const trustees = await prisma.trustee.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="Trustees"
        description="Board members shown on the About page. Drag to reorder."
        action={
          <Button asChild>
            <Link href="/admin/trustees/new">
              <Plus className="size-4" />
              Add trustee
            </Link>
          </Button>
        }
      />
      <SortableListShell ids={trustees.map((t) => t.id)} onReorder={reorderTrustees}>
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Trustee</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {trustees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No trustees yet.
                  </TableCell>
                </TableRow>
              ) : (
                trustees.map((trustee) => (
                  <SortableRow key={trustee.id} id={trustee.id}>
                    <TableCell>
                      <Link href={`/admin/trustees/${trustee.id}`} className="flex items-center gap-3">
                        <Avatar className="size-9">
                          {trustee.photoUrl && <AvatarImage src={trustee.photoUrl} alt={trustee.name} />}
                          <AvatarFallback className="bg-brand-navy text-xs text-white">
                            {trustee.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{trustee.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{trustee.title ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={trustee.published ? "default" : "secondary"} className={trustee.published ? "bg-brand-navy" : ""}>
                        {trustee.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeleteButton action={deleteTrustee.bind(null, trustee.id)} confirmMessage={`Delete ${trustee.name}?`} />
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
