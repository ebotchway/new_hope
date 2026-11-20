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
import { deleteStory } from "@/actions/admin/stories";
import { reorderStories } from "@/actions/admin/reorder";

export const metadata = { title: "Stories — LivingHope Admin" };

export default async function AdminStoriesPage() {
  await requireStaff();
  const stories = await prisma.story.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="Beneficiary Stories"
        description="Testimonial cards featured in the homepage carousel. Drag handles to reorder."
        breadcrumbs={[{ label: "Stories" }]}
        action={
          <Button asChild>
            <Link href="/admin/stories/new">
              <Plus className="size-4" />
              Add Story
            </Link>
          </Button>
        }
      />
      <SortableListShell ids={stories.map((s) => s.id)} onReorder={reorderStories}>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/40">
                <TableHead className="w-8" />
                <TableHead>Name</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No stories added yet. Create your first beneficiary story card.
                  </TableCell>
                </TableRow>
              ) : (
                stories.map((story) => (
                  <SortableRow key={story.id} id={story.id}>
                    <TableCell className="font-semibold">
                      <Link href={`/admin/stories/${story.id}`} className="hover:underline">
                        {story.name}
                        {story.age ? ` (${story.age})` : ""}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-xs text-muted-foreground">
                      &ldquo;{story.quote}&rdquo;
                    </TableCell>
                    <TableCell>
                      <Badge variant={story.published ? "default" : "secondary"} className={story.published ? "bg-brand-navy" : ""}>
                        {story.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="size-8" title="Edit Story">
                          <Link href={`/admin/stories/${story.id}`}>
                            <Edit className="size-4 text-muted-foreground" />
                          </Link>
                        </Button>
                        <DeleteButton
                          action={deleteStory.bind(null, story.id)}
                          confirmMessage={`Delete story for "${story.name}"?`}
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
