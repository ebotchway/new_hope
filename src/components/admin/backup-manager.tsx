"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import {
  Archive,
  Download,
  RotateCcw,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  FileArchive,
  Database,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  ShieldAlert,
  Upload,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createBackupAction,
  deleteBackupAction,
  restoreBackupAction,
  restoreMediaAction,
  uploadBackupAction,
  getBackupsAction,
} from "@/actions/admin/backups";
import type { BackupItem } from "@/lib/backup-service";

interface BackupManagerProps {
  initialBackups: BackupItem[];
}

export function BackupManager({ initialBackups }: BackupManagerProps) {
  const [backups, setBackups] = useState<BackupItem[]>(initialBackups);
  const [isPending, startTransition] = useTransition();

  // Create Dialog State
  const [createOpen, setCreateOpen] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(false);

  // Upload Dialog State
  const [uploadOpen, setUploadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore Dialog State
  const [restoreTarget, setRestoreTarget] = useState<BackupItem | null>(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState("");

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<BackupItem | null>(null);

  const totalSize = backups.reduce((acc, b) => acc + b.sizeBytes, 0);
  const totalFormatted =
    totalSize > 1024 * 1024
      ? `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
      : `${(totalSize / 1024).toFixed(1)} KB`;

  const refreshList = async () => {
    const res = await getBackupsAction();
    if (res.success && res.data) {
      setBackups(res.data);
    }
  };

  const handleCreateBackup = () => {
    startTransition(async () => {
      toast.loading("Creating backup snapshot…", { id: "backup-create" });
      const res = await createBackupAction({ includeMedia });
      if (res.success && res.data) {
        toast.success(
          `Backup created: ${res.data.filename}${res.data.mediaFilename ? ` & ${res.data.mediaFilename}` : ""}`,
          { id: "backup-create" }
        );
        setCreateOpen(false);
        await refreshList();
      } else {
        toast.error(res.error || "Failed to create backup", { id: "backup-create" });
      }
    });
  };

  const handleUploadBackup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      toast.loading("Uploading and verifying backup archive…", { id: "backup-upload" });
      const res = await uploadBackupAction(formData);
      if (res.success && res.data) {
        toast.success(`Backup archive uploaded: ${res.data.filename}`, { id: "backup-upload" });
        setUploadOpen(false);
        await refreshList();
      } else {
        toast.error(res.error || "Failed to upload backup archive", { id: "backup-upload" });
      }
    });
  };

  const handleRestoreBackup = () => {
    if (!restoreTarget) return;
    if (restoreConfirmation.trim() !== "RESTORE") {
      toast.error("Please type 'RESTORE' exactly to confirm");
      return;
    }

    startTransition(async () => {
      if (restoreTarget.type === "media") {
        toast.loading("Restoring media files from archive…", { id: "backup-restore" });
        const res = await restoreMediaAction(restoreTarget.filename, restoreConfirmation);
        if (res.success) {
          toast.success("Media files restored successfully!", { id: "backup-restore" });
          setRestoreTarget(null);
          setRestoreConfirmation("");
          await refreshList();
        } else {
          toast.error(res.error || "Failed to restore media", { id: "backup-restore" });
        }
      } else {
        toast.loading("Creating safety snapshot & restoring database…", { id: "backup-restore" });
        const res = await restoreBackupAction(restoreTarget.filename, restoreConfirmation);
        if (res.success) {
          toast.success("Database restored successfully!", { id: "backup-restore" });
          setRestoreTarget(null);
          setRestoreConfirmation("");
          await refreshList();
        } else {
          toast.error(res.error || "Failed to restore backup", { id: "backup-restore" });
        }
      }
    });
  };

  const handleDeleteBackup = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      toast.loading("Deleting backup…", { id: "backup-delete" });
      const res = await deleteBackupAction(deleteTarget.filename);
      if (res.success) {
        toast.success("Backup deleted", { id: "backup-delete" });
        setDeleteTarget(null);
        await refreshList();
      } else {
        toast.error(res.error || "Failed to delete backup", { id: "backup-delete" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Available Backups</p>
              <p className="text-xl font-bold tracking-tight">{backups.length} archives</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-secondary p-2.5 text-foreground">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Backup Storage</p>
              <p className="text-xl font-bold tracking-tight">{totalFormatted}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Snapshot Engine</p>
              <p className="text-xl font-bold tracking-tight">Ready &amp; Verified</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Backup Archives</h2>
          <p className="text-xs text-muted-foreground">
            Generate point-in-time database snapshots, upload external archives, or restore data.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              startTransition(async () => {
                await refreshList();
                toast.success("Backup list refreshed");
              });
            }}
            disabled={isPending}
          >
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setUploadOpen(true)}
            disabled={isPending}
            className="gap-1.5"
          >
            <Upload className="h-4 w-4" />
            Upload Archive
          </Button>

          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            disabled={isPending}
            className="bg-brand-navy hover:bg-brand-navy/90 text-white gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Create Backup Now
          </Button>
        </div>
      </div>

      {/* Backups Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Archive File Name</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {backups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    <Archive className="mx-auto mb-3 h-8 w-8 opacity-40" />
                    <p className="font-medium">No backups created yet</p>
                    <p className="text-xs">
                      Click &ldquo;Create Backup Now&rdquo; to generate your first point-in-time snapshot, or upload an existing archive.
                    </p>
                  </td>
                </tr>
              ) : (
                backups.map((b) => {
                  const isPreRestore = b.filename.includes("_pre_restore_");

                  return (
                    <tr key={b.filename} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          {b.type === "db_snapshot" ? (
                            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
                              <Database className="h-3 w-3" />
                              DB Snapshot
                            </Badge>
                          ) : b.type === "db_sql" ? (
                            <Badge variant="outline" className="gap-1 border-blue-500/30 text-blue-600 dark:text-blue-400">
                              <FileArchive className="h-3 w-3" />
                              SQL Dump
                            </Badge>
                          ) : b.type === "media" ? (
                            <Badge variant="outline" className="gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400">
                              <ImageIcon className="h-3 w-3" />
                              Media Tarball
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Archive</Badge>
                          )}
                          {isPreRestore && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                              Safety Rollback
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs font-medium text-foreground">
                        {b.filename}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {b.sizeFormatted}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {new Date(b.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct Download Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 gap-1.5 px-2.5 text-xs"
                          >
                            <a href={`/api/admin/backups/${b.filename}`} download={b.filename}>
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                          </Button>

                          {/* Restore Button (for DB snapshots or Media tarballs) */}
                          {(b.type === "db_snapshot" || b.type === "media") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 px-2.5 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 border-amber-500/30"
                              onClick={() => {
                                setRestoreTarget(b);
                                setRestoreConfirmation("");
                              }}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              {b.type === "media" ? "Restore Media" : "Restore DB"}
                            </Button>
                          )}

                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(b)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information / Storage Guidance Box */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-900 dark:text-blue-200">
        <div className="flex gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="space-y-1">
            <p className="font-semibold text-blue-950 dark:text-blue-100">
              Disaster Recovery &amp; Safety Isolation
            </p>
            <p className="leading-relaxed text-blue-800 dark:text-blue-300">
              When restoring a database snapshot, the platform automatically takes a pre-restore safety snapshot before applying changes so you can always roll back. Always download copies of your archives to secure secondary storage for cold offsite recovery.
            </p>
          </div>
        </div>
      </div>

      {/* Create Backup Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle>Create New Backup Snapshot</DialogTitle>
            <DialogDescription>
              Create an instant, compressed snapshot of the LivingHope database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              This will extract all 20 database tables (users, donations, children, sponsorships, CMS pages, settings, and logs) and store a gzip-compressed JSON snapshot in the secure server backups repository.
            </div>

            <div className="flex items-start gap-3 rounded-lg border p-3">
              <input
                type="checkbox"
                id="includeMediaCheckbox"
                checked={includeMedia}
                onChange={(e) => setIncludeMedia(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="space-y-0.5">
                <Label htmlFor="includeMediaCheckbox" className="text-xs font-semibold cursor-pointer">
                  Include Media Files (/public/uploads)
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Also creates an archive of all uploaded photos, receipts, and CMS assets.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleCreateBackup} disabled={isPending} className="bg-brand-navy hover:bg-brand-navy/90 text-white">
              {isPending ? "Generating Snapshot…" : "Generate Backup Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Backup Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-brand-navy dark:text-blue-400" />
              Upload Backup Archive
            </DialogTitle>
            <DialogDescription>
              Upload an existing backup archive from your local machine to restore or store on the server.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadBackup} className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              Supported formats:
              <ul className="list-disc list-inside mt-1 font-mono text-[11px] space-y-0.5">
                <li>.json.gz (Prisma Database Snapshot)</li>
                <li>.tar.gz (Media Uploads Archive)</li>
                <li>.sql.gz (PostgreSQL Dump Archive)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFileInput" className="text-xs font-semibold">
                Select Archive File (.gz / .tar.gz)
              </Label>
              <Input
                id="backupFileInput"
                name="file"
                type="file"
                ref={fileInputRef}
                accept=".gz,.tar.gz"
                required
                className="cursor-pointer file:cursor-pointer"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-brand-navy hover:bg-brand-navy/90 text-white">
                {isPending ? "Uploading & Verifying…" : "Upload Archive"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Safety Restore Dialog */}
      <Dialog open={Boolean(restoreTarget)} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>
                {restoreTarget?.type === "media" ? "Confirm Media Archive Restore" : "Confirm Database Restore"}
              </DialogTitle>
            </div>
            <DialogDescription>
              {restoreTarget?.type === "media"
                ? "This will extract all files from this archive into the public uploads directory."
                : "This is a major action that will replace current database tables with data from the selected snapshot."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive dark:text-red-300 space-y-1">
              <p className="font-semibold">Selected Archive:</p>
              <p className="font-mono text-[11px] break-all">{restoreTarget?.filename}</p>
              {restoreTarget?.type === "db_snapshot" && (
                <div className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>An automatic safety snapshot of your current database will be saved before restoring.</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmInput" className="text-xs font-semibold">
                To confirm, type <span className="font-mono text-destructive select-all">RESTORE</span> below:
              </Label>
              <Input
                id="confirmInput"
                placeholder="Type RESTORE to confirm"
                value={restoreConfirmation}
                onChange={(e) => setRestoreConfirmation(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRestoreTarget(null);
                setRestoreConfirmation("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRestoreBackup}
              disabled={restoreConfirmation.trim() !== "RESTORE" || isPending}
            >
              {isPending
                ? "Restoring…"
                : restoreTarget?.type === "media"
                  ? "Yes, Restore Media"
                  : "Yes, Restore Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle>Delete Backup Archive</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete this backup file from the server?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <p className="font-mono text-xs bg-muted p-2 rounded break-all">{deleteTarget?.filename}</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBackup} disabled={isPending}>
              {isPending ? "Deleting…" : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
