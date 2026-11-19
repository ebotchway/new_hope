import { AdminPageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireStaff } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Site Settings — LivingHope Admin" };

export default async function AdminSettingsPage() {
  await requireStaff();
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  return (
    <>
      <AdminPageHeader
        title="Site & Payment Settings"
        description="Configure public content, organization contact channels, Ghana Mobile Money, and live Stripe payment credentials."
        breadcrumbs={[{ label: "Site & Payments" }]}
      />
      <div className="rounded-2xl border bg-card p-6 shadow-xs">
        <SettingsForm settings={settings} />
      </div>
    </>
  );
}
