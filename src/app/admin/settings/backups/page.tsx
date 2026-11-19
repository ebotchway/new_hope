import { AdminPageHeader } from "@/components/admin/page-header";
import { BackupManager } from "@/components/admin/backup-manager";
import { requireAdmin } from "@/lib/session";
import { listBackups } from "@/lib/backup-service";

export const metadata = { title: "Backups & Disaster Recovery — LivingHope Admin" };

export default async function AdminBackupsPage() {
  await requireAdmin();
  const backups = await listBackups();

  return (
    <>
      <AdminPageHeader
        title="Database & Media Backups"
        description="Create point-in-time database snapshots, download archives for offsite disaster recovery, and restore data."
        breadcrumbs={[
          { label: "Site & Payments", href: "/admin/settings" },
          { label: "Backups & Restore" },
        ]}
      />
      <BackupManager initialBackups={backups} />
    </>
  );
}
