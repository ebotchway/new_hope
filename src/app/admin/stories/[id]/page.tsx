import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StoryForm } from "@/components/admin/story-form";
import { prisma } from "@/lib/prisma";
import { updateStory } from "@/actions/admin/stories";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Edit Story" };

export default async function EditStoryPage(props: PageProps<"/admin/stories/[id]">) {
  const { id } = await props.params;
  const story = await prisma.story.findUnique({ where: { id } });
  if (!story) notFound();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return updateStory(id, formData);
  }

  return (
    <>
      <AdminPageHeader
        title={`Edit ${story.name}'s Story`}
        breadcrumbs={[{ label: "Stories", href: "/admin/stories" }, { label: story.name }]}
      />
      <StoryForm story={story} action={action} />
    </>
  );
}
