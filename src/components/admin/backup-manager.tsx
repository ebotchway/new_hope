"use client";

import { useState, useTransition } from "react";
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

  const handleRestoreBackup = () => {
    if (!restoreTarget) return;
    if (restoreConfirmation.trim() !== "RESTORE") {
      toast.error("Please type 'RESTORE' exactly to confirm");
      return;
    }

    startTransition(async () => {
      toast.loading("Restoring database from snapshot…", { id: "backup-restore" });
      const res = await restoreBackupAction(restoreTarget.filename, restoreConfirmation);
      if (res.success) {
        toast.success("Database restored successfully!", { id: "backup-restore" });
        setRestoreTarget(null);
        setRestoreConfirmation("");
        await refreshList();
      } else {
        toast.error(res.error || "Failed to restore backup", { id: "backup-restore" });
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
            Generate point-in-time database snapshots, download archives for offsite redundancy, or restore data.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={() => setCreateOpen(true)} disabled={isPending}>
            <Plus className="mr-2 h-4 w-4" />
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
                    <p className="text-xs">Click &ldquo;Create Backup Now&rdquo; to generate your first point-in-time snapshot.</p>
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.filename} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5">
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

                        {/* Restore Button (available for JSON database snapshots) */}
                        {b.type === "db_snapshot" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 px-2.5 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
                            onClick={() => {
                              setRestoreTarget(b);
                              setRestoreConfirmation("");
                            }}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Restore
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
                ))
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
              Security &amp; Disaster Recovery Best Practices
            </p>
            <p className="leading-relaxed text-blue-800 dark:text-blue-300">
              Backups contain sensitive donor, beneficiary, and transaction records. Always download copies to an encrypted, access-controlled secondary location (e.g. AWS S3 Glacier, secure corporate cloud drive). When restoring a database snapshot, all existing database records will be transactionally replaced with the snapshot data.
            </p>
          </div>
        </div>
      </div>

      {/* Create Backup Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
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
            <Button onClick={handleCreateBackup} disabled={isPending}>
              {isPending ? "Generating Snapshot…" : "Generate Backup Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Safety Restore Dialog */}
      <Dialog open={Boolean(restoreTarget)} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-destructive mb-1">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Confirm Database Restore</DialogTitle>
            </div>
            <DialogDescription>
              This is a destructive action that will replace current database tables with data from the selected snapshot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive dark:text-red-300 space-y-1">
              <p className="font-semibold">Selected Snapshot:</p>
              <p className="font-mono text-[11px] break-all">{restoreTarget?.filename}</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                All donations, sponsorships, children, CMS revisions, and users will be reset to the state recorded in this backup.
              </p>
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
              {isPending ? "Restoring Snapshot…" : "Yes, Restore Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
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
