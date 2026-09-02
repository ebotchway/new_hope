import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { prisma } from "@/lib/prisma";
import { deleteChild } from "@/actions/admin/children";
import { calculateAge } from "@/lib/format";

export const metadata = { title: "Children" };

export default async function AdminChildrenPage() {
  const children = await prisma.child.findMany({ orderBy: [{ createdAt: "desc" }] });

  return (
    <>
      <AdminPageHeader
        title="Children"
        description="Manage the profiles shown on the Sponsor a Child page."
        action={
          <Button asChild>
            <Link href="/admin/children/new">
              <Plus className="size-4" />
              Add child
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Child</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow key={child.id}>
                <TableCell>
                  <Link href={`/admin/children/${child.id}`} className="flex items-center gap-3">
                    <Avatar className="size-9">
                      {child.photoUrl && <AvatarImage src={child.photoUrl} alt={child.name} />}
                      <AvatarFallback className="bg-brand-navy text-xs text-white">
                        {child.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{child.name}</span>
                  </Link>
                </TableCell>
                <TableCell>{calculateAge(child.dateOfBirth) ?? "—"}</TableCell>
                <TableCell>{child.location ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={child.status === "AVAILABLE" ? "default" : "secondary"}
                    className={child.status === "AVAILABLE" ? "bg-brand-navy" : ""}
                  >
                    {child.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DeleteButton action={deleteChild.bind(null, child.id)} confirmMessage={`Delete ${child.name}?`} />
                </TableCell>
              </TableRow>
            ))}
            {children.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No children yet. Add your first profile.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
