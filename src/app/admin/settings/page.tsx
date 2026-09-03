import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Site Settings" };

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  return (
    <>
      <AdminPageHeader
        title="Site Settings"
        description="Control the homepage hero, mission, and contact details."
        breadcrumbs={[{ label: "Site Settings" }]}
      />
      <SettingsForm settings={settings} />
    </>
  );
}
