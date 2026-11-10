import Link from "next/link";
import { Plus, ExternalLink, Users, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteChild } from "@/actions/admin/children";
import { calculateAge } from "@/lib/format";

export const metadata = { title: "Manage Children — LivingHope Admin" };

export default async function AdminChildrenPage() {
  await requireStaff();

  const children = await prisma.child.findMany({
    orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { sponsorships: true, donations: true },
      },
    },
  });

  return (
    <>
      <AdminPageHeader
        title="Children & Sponsorship Profiles"
        description="Manage the children profiles featured on the public sponsorship directory."
        breadcrumbs={[{ label: "Children" }]}
        action={
          <Button asChild>
            <Link href="/admin/children/new">
              <Plus className="size-4" />
              Add Child Profile
            </Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead>Child</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Linked Gifts</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow key={child.id} className="hover:bg-muted/40">
                <TableCell>
                  <Link
                    href={`/admin/children/${child.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="size-10 border">
                      {child.photoUrl && <AvatarImage src={child.photoUrl} alt={child.name} className="object-cover" />}
                      <AvatarFallback className="bg-brand-navy text-xs font-semibold text-white">
                        {child.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold text-foreground group-hover:underline">
                        {child.name}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        /{child.slug}
                      </span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {calculateAge(child.dateOfBirth) ? `${calculateAge(child.dateOfBirth)} yrs` : "—"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{child.location ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={child.status === "AVAILABLE" ? "default" : "secondary"}
                      className={
                        child.status === "AVAILABLE"
                          ? "bg-brand-navy text-white"
                          : child.status === "SPONSORED"
                            ? "bg-emerald-600 text-white"
                            : ""
                      }
                    >
                      {child.status}
                    </Badge>
                    {child.archived && (
                      <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300">
                        Archived
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1" title="Active/Past Sponsorships">
                      <HeartHandshake className="size-3.5 text-brand-accent" />
                      {child._count.sponsorships}
                    </span>
                    <span className="flex items-center gap-1" title="Individual Donations">
                      <Users className="size-3.5 text-brand-navy dark:text-blue-400" />
                      {child._count.donations}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="size-8" title="View Public Profile">
                      <Link href={`/sponsor-a-child/${child.slug}`} target="_blank">
                        <ExternalLink className="size-4 text-muted-foreground" />
                      </Link>
                    </Button>
                    <DeleteButton
                      action={deleteChild.bind(null, child.id)}
                      confirmMessage={`Are you sure you want to delete ${child.name}? This will permanently remove the profile.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {children.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No children profiles created yet. Add your first child to begin sponsorships.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
