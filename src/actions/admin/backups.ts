"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import {
  listBackups,
  createDatabaseSnapshot,
  createMediaArchive,
  restoreFromSnapshot,
  deleteBackup,
  type BackupItem,
} from "@/lib/backup-service";

export interface BackupActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getBackupsAction(): Promise<BackupActionResult<BackupItem[]>> {
  try {
    await requireAdmin();
    const items = await listBackups();
    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to list backups" };
  }
}

export async function createBackupAction(options?: {
  includeMedia?: boolean;
}): Promise<BackupActionResult<{ filename: string; mediaFilename?: string }>> {
  try {
    await requireAdmin();
    const dbResult = await createDatabaseSnapshot();
    let mediaFilename: string | undefined;

    if (options?.includeMedia) {
      try {
        const mediaResult = await createMediaArchive();
        mediaFilename = mediaResult.filename;
      } catch (mediaErr) {
        console.warn("Media backup warning:", mediaErr);
      }
    }

    revalidatePath("/admin/settings/backups");
    return {
      success: true,
      data: {
        filename: dbResult.filename,
        mediaFilename,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create database backup",
    };
  }
}

export async function restoreBackupAction(
  filename: string,
  confirmation: string
): Promise<BackupActionResult<{ counts: Record<string, number> }>> {
  try {
    await requireAdmin();

    if (confirmation.trim() !== "RESTORE") {
      return {
        success: false,
        error: "Confirmation failed. You must type 'RESTORE' exactly to proceed with database restore.",
      };
    }

    if (!filename.includes("_db_snapshot_") && !filename.endsWith(".json.gz")) {
      return {
        success: false,
        error: "Only JSON database snapshots (.json.gz) can be restored directly through the browser. For .sql.gz archives, please use the CLI restore script.",
      };
    }

    const result = await restoreFromSnapshot(filename);

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/children");
    revalidatePath("/stories");
    revalidatePath("/donate");
    revalidatePath("/admin");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/backups");

    return { success: true, data: { counts: result.counts } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to restore backup snapshot",
    };
  }
}

export async function deleteBackupAction(filename: string): Promise<BackupActionResult<null>> {
  try {
    await requireAdmin();
    const success = await deleteBackup(filename);
    if (!success) {
      return { success: false, error: "Backup file not found or already deleted" };
    }
    revalidatePath("/admin/settings/backups");
    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete backup file",
    };
  }
}
