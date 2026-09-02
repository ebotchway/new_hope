import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableListShell, SortableRow } from "@/components/admin/sortable-list";
import { prisma } from "@/lib/prisma";
import { deleteStory } from "@/actions/admin/stories";
import { reorderStories } from "@/actions/admin/reorder";

export const metadata = { title: "Stories" };

export default async function AdminStoriesPage() {
  const stories = await prisma.story.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminPageHeader
        title="Stories"
        description="Testimonial cards shown in the homepage carousel. Drag to reorder."
        action={
          <Button asChild>
            <Link href="/admin/stories/new">
              <Plus className="size-4" />
              Add story
            </Link>
          </Button>
        }
      />
      <SortableListShell ids={stories.map((s) => s.id)} onReorder={reorderStories}>
        <div className="rounded-xl border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Name</TableHead>
                <TableHead>Quote</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No stories yet.
                  </TableCell>
                </TableRow>
              ) : (
                stories.map((story) => (
                  <SortableRow key={story.id} id={story.id}>
                    <TableCell>
                      <Link href={`/admin/stories/${story.id}`} className="font-medium">
                        {story.name}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-sm truncate text-muted-foreground">{story.quote}</TableCell>
                    <TableCell>
                      <Badge variant={story.published ? "default" : "secondary"} className={story.published ? "bg-brand-navy" : ""}>
                        {story.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DeleteButton action={deleteStory.bind(null, story.id)} confirmMessage={`Delete ${story.name}'s story?`} />
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
