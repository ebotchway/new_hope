import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Plus,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { ProgressReportDialog } from "@/components/admin/progress-report-dialog";
import { ProgressReportDetailDialog } from "@/components/admin/progress-report-detail-dialog";
import { ProgressReportsFilter } from "@/components/admin/progress-reports-filter";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteChildUpdate } from "@/actions/admin/child-updates";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Child Progress Reports — LivingHope Admin",
  description: "Academic reports, health milestones, and termly updates for sponsored children.",
};

export default async function AdminProgressReportsPage(props: {
  searchParams: Promise<{ child?: string; status?: string }>;
}) {
  await requireStaff();
  const searchParams = await props.searchParams;

  const [children, allUpdates] = await Promise.all([
    prisma.child.findMany({
      select: { id: true, name: true, slug: true, photoUrl: true },
      orderBy: { name: "asc" },
    }),
    prisma.childUpdate.findMany({
      include: {
        child: {
          select: { id: true, name: true, slug: true, photoUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const selectedChildId = searchParams.child || "";
  const statusFilter = searchParams.status || "all";

  const filteredUpdates = allUpdates.filter((update) => {
    if (selectedChildId && update.childId !== selectedChildId) return false;
    if (statusFilter === "published" && !update.published) return false;
    if (statusFilter === "draft" && update.published) return false;
    return true;
  });

  const totalReports = allUpdates.length;
  const publishedCount = allUpdates.filter((u) => u.published).length;
  const draftCount = totalReports - publishedCount;
  const coveredChildrenCount = new Set(allUpdates.map((u) => u.childId)).size;

  return (
    <>
      <AdminPageHeader
        title="Child Progress Reports & Termly Updates"
        description="Review, publish, and manage academic report cards, health milestones, and developmental notes displayed to sponsors and public visitors."
        breadcrumbs={[{ label: "Progress Reports" }]}
        action={
          children.length > 0 ? (
            <ProgressReportDialog
              mode="create"
              childrenList={children.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
              }))}
            />
          ) : (
            <Button asChild>
              <Link href="/admin/children/new">
                <Plus className="size-4 mr-1.5" />
                Add Child Profile First
              </Link>
            </Button>
          )
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <FileText className="size-4 text-brand-navy dark:text-blue-400" />
            Total Updates
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-foreground">{totalReports}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across all enrolled children</p>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Published Live
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {publishedCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Visible on public profiles</p>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="size-4 text-amber-600" />
            Drafts Pending
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-amber-600 dark:text-amber-400">
            {draftCount}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Internal review or staging</p>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="size-4 text-brand-accent" />
            Children Covered
          </div>
          <p className="mt-2 text-2xl font-bold font-heading text-foreground">
            {coveredChildrenCount} / {children.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Beneficiaries with reports</p>
        </div>
      </div>

      {/* Filter Bar */}
      <ProgressReportsFilter
        childrenList={children}
        selectedChildId={selectedChildId}
        statusFilter={statusFilter}
        totalReports={totalReports}
        publishedCount={publishedCount}
        draftCount={draftCount}
      />

      {/* Reports Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead>Child</TableHead>
              <TableHead>Report Title & Preview</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Posted</TableHead>
              <TableHead className="w-36 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUpdates.map((update) => (
              <TableRow key={update.id} className="hover:bg-muted/40">
                {/* Child info */}
                <TableCell>
                  <Link
                    href={`/admin/children/${update.childId}`}
                    className="flex items-center gap-2.5 group"
                  >
                    <Avatar className="size-8 border">
                      {update.child.photoUrl && (
                        <AvatarImage
                          src={update.child.photoUrl}
                          alt={update.child.name}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-brand-navy text-[10px] font-semibold text-white">
                        {update.child.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-semibold text-xs text-foreground group-hover:underline">
                        {update.child.name}
                      </span>
                    </div>
                  </Link>
                </TableCell>

                {/* Title & snippet */}
                <TableCell className="max-w-md">
                  <span className="font-semibold text-sm text-foreground block">
                    {update.title}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {update.body}
                  </span>
                </TableCell>

                {/* Photo preview */}
                <TableCell>
                  {update.imageUrl ? (
                    <div className="relative size-10 overflow-hidden rounded-md border bg-muted">
                      <Image
                        src={update.imageUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">None</span>
                  )}
                </TableCell>

                {/* Published status */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      update.published
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                    }
                  >
                    {update.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>

                {/* Date */}
                <TableCell className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(update.createdAt)}
                  </div>
                </TableCell>

                {/* Actions: View Detail, Edit Dialog, Delete Button */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* View Detail Modal */}
                    <ProgressReportDetailDialog
                      report={{
                        id: update.id,
                        title: update.title,
                        body: update.body,
                        imageUrl: update.imageUrl,
                        published: update.published,
                        childId: update.childId,
                        childName: update.child.name,
                        createdAt: update.createdAt,
                      }}
                      childSlug={update.child.slug}
                    />

                    {/* Edit Modal */}
                    <ProgressReportDialog
                      mode="edit"
                      childrenList={children.map((c) => ({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                      }))}
                      report={{
                        id: update.id,
                        title: update.title,
                        body: update.body,
                        imageUrl: update.imageUrl,
                        published: update.published,
                        childId: update.childId,
                        childName: update.child.name,
                      }}
                    />

                    {/* Delete with Confirmation */}
                    <DeleteButton
                      action={deleteChildUpdate.bind(null, update.id, update.childId)}
                      confirmMessage={`Are you sure you want to delete "${update.title}"? This cannot be undone.`}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filteredUpdates.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No progress reports match the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
