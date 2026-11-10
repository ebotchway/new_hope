import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ChildUpdateForm } from "@/components/admin/child-update-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { deleteChildUpdate } from "@/actions/admin/child-updates";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Child Progress Updates — LivingHope Admin" };

export default async function ChildUpdatesPage(props: PageProps<"/admin/children/[id]/updates">) {
  await requireStaff();
  const { id } = await props.params;
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child) notFound();

  const updates = await prisma.childUpdate.findMany({
    where: { childId: id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminPageHeader
        title={`${child.name}'s Updates`}
        description="Progress reports shown on this child's public profile, newest first."
        breadcrumbs={[
          { label: "Children", href: "/admin/children" },
          { label: child.name, href: `/admin/children/${id}` },
          { label: "Updates" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <ChildUpdateForm childId={id} />

        <div className="space-y-3">
          {updates.length === 0 ? (
            <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
              No updates posted yet. Use the form on the left to post a school report, photo, or milestone.
            </div>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="flex gap-4 rounded-2xl border bg-card p-5">
                {update.imageUrl && (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={update.imageUrl} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{formatDate(update.createdAt)}</p>
                      <h3 className="font-semibold text-foreground">{update.title}</h3>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={update.published ? "default" : "secondary"} className={update.published ? "bg-brand-navy" : ""}>
                        {update.published ? "Published" : "Draft"}
                      </Badge>
                      <DeleteButton
                        action={deleteChildUpdate.bind(null, update.id, id)}
                        confirmMessage={`Delete "${update.title}"?`}
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{update.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
