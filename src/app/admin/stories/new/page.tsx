import { AdminPageHeader } from "@/components/admin/page-header";
import { StoryForm } from "@/components/admin/story-form";
import { requireStaff } from "@/lib/session";
import { createStory } from "@/actions/admin/stories";
import type { ActionResult } from "@/actions/inquiries";

export const metadata = { title: "Add Beneficiary Story — LivingHope Admin" };

export default async function NewStoryPage() {
  await requireStaff();

  async function action(_prevState: ActionResult, formData: FormData) {
    "use server";
    return createStory(formData);
  }

  return (
    <>
      <AdminPageHeader
        title="Add a Beneficiary Story"
        description="Share a child's story and testimonial for the homepage carousel."
        breadcrumbs={[{ label: "Stories", href: "/admin/stories" }, { label: "Add Story" }]}
      />
      <StoryForm action={action} />
    </>
  );
}
