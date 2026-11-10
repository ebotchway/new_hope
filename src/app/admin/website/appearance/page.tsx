import { requireStaff } from "@/lib/session";
import { getCmsAppearance } from "@/lib/cms-loader";
import { AppearanceSettingsForm } from "@/components/admin/cms/appearance-settings-form";

export const metadata = {
  title: "Appearance & Branding | LivingHope Admin",
};

export default async function AdminAppearancePage() {
  await requireStaff();
  const appearance = await getCmsAppearance();

  return <AppearanceSettingsForm initialConfig={appearance} />;
}

