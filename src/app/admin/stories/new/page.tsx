import { AdminPageHeader } from "@/components/admin/page-header";
import { StoryForm } from "@/components/admin/story-form";
import { createStory } from "@/actions/admin/stories";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add Story" };

export default function NewStoryPage() {
  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createStory(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add a Story"
        breadcrumbs={[{ label: "Stories", href: "/admin/stories" }, { label: "Add Story" }]}
      />
      <StoryForm action={action} />
    </>
  );
}
