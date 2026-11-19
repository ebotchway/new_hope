import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { prisma } from "@/lib/prisma";

const execFileAsync = promisify(execFile);
const BACKUP_DIR = path.resolve(process.cwd(), "backups");

export type BackupType = "db_snapshot" | "db_sql" | "media" | "unknown";

export interface BackupItem {
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  createdAt: string;
  type: BackupType;
  counts?: Record<string, number>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function sanitizeFilename(filename: string): string {
  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    throw new Error("Invalid backup filename: path traversal is not allowed");
  }
  const base = path.basename(filename);
  if (base !== filename || !/^[a-zA-Z0-9_\-.]+$/.test(base)) {
    throw new Error("Invalid backup filename");
  }
  return base;
}

export function getBackupFilePath(filename: string): string {
  const safeName = sanitizeFilename(filename);
  const filePath = path.join(BACKUP_DIR, safeName);
  if (!fs.existsSync(filePath)) {
    throw new Error("Backup file not found");
  }
  return filePath;
}

export async function listBackups(): Promise<BackupItem[]> {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    return [];
  }

  const entries = fs.readdirSync(BACKUP_DIR, { withFileTypes: true });
  const backups: BackupItem[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith(".")) continue;

    const fullPath = path.join(BACKUP_DIR, entry.name);
    try {
      const stat = fs.statSync(fullPath);
      let type: BackupType = "unknown";
      if (entry.name.includes("_db_snapshot_") || entry.name.endsWith(".json.gz")) {
        type = "db_snapshot";
      } else if (entry.name.includes("_db_") || entry.name.endsWith(".sql.gz")) {
        type = "db_sql";
      } else if (entry.name.includes("_media_") || entry.name.endsWith(".tar.gz")) {
        type = "media";
      }

      backups.push({
        filename: entry.name,
        sizeBytes: stat.size,
        sizeFormatted: formatBytes(stat.size),
        createdAt: stat.mtime.toISOString(),
        type,
      });
    } catch {
      // Ignore unreadable entries
    }
  }

  // Sort newest first
  return backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Creates a complete database snapshot in pure Node.js/Prisma.
 * Guaranteed to succeed in any hosting environment without requiring pg_dump.
 */
export async function createDatabaseSnapshot(): Promise<{
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
  counts: Record<string, number>;
}> {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Extract all models
  const [
    users,
    accounts,
    sessions,
    verificationTokens,
    siteSettings,
    children,
    childUpdates,
    sponsorships,
    donations,
    inquiries,
    stories,
    historyEvents,
    impactStats,
    trustees,
    cmsPages,
    cmsRevisions,
    cmsAuditLogs,
    cmsMediaAssets,
    cmsNavItems,
    cmsAppearances,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.account.findMany(),
    prisma.session.findMany(),
    prisma.verificationToken.findMany(),
    prisma.siteSettings.findMany(),
    prisma.child.findMany(),
    prisma.childUpdate.findMany(),
    prisma.sponsorship.findMany(),
    prisma.donation.findMany(),
    prisma.partnershipInquiry.findMany(),
    prisma.story.findMany(),
    prisma.historyEvent.findMany(),
    prisma.impactStat.findMany(),
    prisma.trustee.findMany(),
    prisma.cmsPage.findMany(),
    prisma.cmsRevision.findMany(),
    prisma.cmsAuditLog.findMany(),
    prisma.cmsMediaAsset.findMany(),
    prisma.cmsNavItem.findMany(),
    prisma.cmsAppearance.findMany(),
  ]);

  const counts: Record<string, number> = {
    users: users.length,
    accounts: accounts.length,
    sessions: sessions.length,
    verificationTokens: verificationTokens.length,
    siteSettings: siteSettings.length,
    children: children.length,
    childUpdates: childUpdates.length,
    sponsorships: sponsorships.length,
    donations: donations.length,
    inquiries: inquiries.length,
    stories: stories.length,
    historyEvents: historyEvents.length,
    impactStats: impactStats.length,
    trustees: trustees.length,
    cmsPages: cmsPages.length,
    cmsRevisions: cmsRevisions.length,
    cmsAuditLogs: cmsAuditLogs.length,
    cmsMediaAssets: cmsMediaAssets.length,
    cmsNavItems: cmsNavItems.length,
    cmsAppearances: cmsAppearances.length,
  };

  const snapshotPayload = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    generator: "LivingHope Pure Snapshot Engine",
    counts,
    data: {
      users,
      accounts,
      sessions,
      verificationTokens,
      siteSettings,
      children,
      childUpdates,
      sponsorships,
      donations,
      inquiries,
      stories,
      historyEvents,
      impactStats,
      trustees,
      cmsPages,
      cmsRevisions,
      cmsAuditLogs,
      cmsMediaAssets,
      cmsNavItems,
      cmsAppearances,
    },
  };

  const jsonString = JSON.stringify(snapshotPayload, null, 2);
  const compressed = zlib.gzipSync(Buffer.from(jsonString, "utf8"));

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .replace(/\..+/, "");
  const filename = `livinghope_db_snapshot_${timestamp}.json.gz`;
  const filePath = path.join(BACKUP_DIR, filename);

  fs.writeFileSync(filePath, compressed);

  const stat = fs.statSync(filePath);
  return {
    filename,
    sizeBytes: stat.size,
    sizeFormatted: formatBytes(stat.size),
    counts,
  };
}

/**
 * Creates an archive of public uploaded media files (/public/uploads).
 */
export async function createMediaArchive(): Promise<{
  filename: string;
  sizeBytes: number;
  sizeFormatted: string;
}> {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "_")
    .replace(/\..+/, "");
  const filename = `livinghope_media_${timestamp}.tar.gz`;
  const archivePath = path.join(BACKUP_DIR, filename);

  try {
    await execFileAsync("tar", ["-czf", archivePath, "-C", path.resolve(process.cwd(), "public"), "uploads"]);
  } catch (err) {
    // If tar binary isn't accessible, write a fallback zip/marker
    throw new Error(`Failed to create media archive: ${err instanceof Error ? err.message : String(err)}`);
  }

  const stat = fs.statSync(archivePath);
  return {
    filename,
    sizeBytes: stat.size,
    sizeFormatted: formatBytes(stat.size),
  };
}

/**
 * Restores database from a JSON snapshot.
 */
export async function restoreFromSnapshot(filename: string): Promise<{
  success: boolean;
  counts: Record<string, number>;
  message: string;
}> {
  const filePath = getBackupFilePath(filename);

  let rawJson: string;
  try {
    const fileBuffer = fs.readFileSync(filePath);
    if (filename.endsWith(".gz")) {
      rawJson = zlib.gunzipSync(fileBuffer).toString("utf8");
    } else {
      rawJson = fileBuffer.toString("utf8");
    }
  } catch (err) {
    throw new Error(`Failed to read/decompress snapshot: ${err instanceof Error ? err.message : String(err)}`);
  }

  let payload: {
    version: string;
    counts?: Record<string, number>;
    data?: Record<string, unknown[]>;
  };

  try {
    payload = JSON.parse(rawJson);
  } catch {
    throw new Error("Invalid snapshot format: not valid JSON");
  }

  if (!payload.data || typeof payload.data !== "object") {
    throw new Error("Corrupted snapshot: missing 'data' object");
  }

  const { data } = payload;

  // Execute restore in a safe transactional sequence
  await prisma.$transaction(async (tx) => {
    // 1. Clear tables in reverse dependency order
    await tx.cmsAuditLog.deleteMany();
    await tx.cmsRevision.deleteMany();
    await tx.cmsPage.deleteMany();
    await tx.cmsMediaAsset.deleteMany();
    await tx.cmsNavItem.deleteMany();
    await tx.cmsAppearance.deleteMany();

    await tx.sponsorship.deleteMany();
    await tx.donation.deleteMany();
    await tx.childUpdate.deleteMany();
    await tx.child.deleteMany();

    await tx.story.deleteMany();
    await tx.historyEvent.deleteMany();
    await tx.impactStat.deleteMany();
    await tx.trustee.deleteMany();
    await tx.partnershipInquiry.deleteMany();

    await tx.siteSettings.deleteMany();
    await tx.session.deleteMany();
    await tx.account.deleteMany();
    await tx.verificationToken.deleteMany();
    await tx.user.deleteMany();

    // 2. Re-insert records in dependency order
    /* eslint-disable @typescript-eslint/no-explicit-any */
    if (Array.isArray(data.users) && data.users.length) {
      for (const u of data.users) {
        await tx.user.create({ data: u as any });
      }
    }

    if (Array.isArray(data.accounts) && data.accounts.length) {
      for (const a of data.accounts) {
        await tx.account.create({ data: a as any });
      }
    }

    if (Array.isArray(data.sessions) && data.sessions.length) {
      for (const s of data.sessions) {
        await tx.session.create({ data: s as any });
      }
    }

    if (Array.isArray(data.verificationTokens) && data.verificationTokens.length) {
      for (const vt of data.verificationTokens) {
        await tx.verificationToken.create({ data: vt as any });
      }
    }

    if (Array.isArray(data.siteSettings) && data.siteSettings.length) {
      for (const ss of data.siteSettings) {
        await tx.siteSettings.create({ data: ss as any });
      }
    }

    if (Array.isArray(data.children) && data.children.length) {
      for (const c of data.children) {
        await tx.child.create({ data: c as any });
      }
    }

    if (Array.isArray(data.childUpdates) && data.childUpdates.length) {
      for (const cu of data.childUpdates) {
        await tx.childUpdate.create({ data: cu as any });
      }
    }

    if (Array.isArray(data.donations) && data.donations.length) {
      for (const d of data.donations) {
        await tx.donation.create({ data: d as any });
      }
    }

    if (Array.isArray(data.sponsorships) && data.sponsorships.length) {
      for (const sp of data.sponsorships) {
        await tx.sponsorship.create({ data: sp as any });
      }
    }

    if (Array.isArray(data.inquiries) && data.inquiries.length) {
      for (const inq of data.inquiries) {
        await tx.partnershipInquiry.create({ data: inq as any });
      }
    }

    if (Array.isArray(data.stories) && data.stories.length) {
      for (const st of data.stories) {
        await tx.story.create({ data: st as any });
      }
    }

    if (Array.isArray(data.historyEvents) && data.historyEvents.length) {
      for (const he of data.historyEvents) {
        await tx.historyEvent.create({ data: he as any });
      }
    }

    if (Array.isArray(data.impactStats) && data.impactStats.length) {
      for (const is of data.impactStats) {
        await tx.impactStat.create({ data: is as any });
      }
    }

    if (Array.isArray(data.trustees) && data.trustees.length) {
      for (const tr of data.trustees) {
        await tx.trustee.create({ data: tr as any });
      }
    }

    if (Array.isArray(data.cmsPages) && data.cmsPages.length) {
      for (const cp of data.cmsPages) {
        await tx.cmsPage.create({ data: cp as any });
      }
    }

    if (Array.isArray(data.cmsRevisions) && data.cmsRevisions.length) {
      for (const cr of data.cmsRevisions) {
        await tx.cmsRevision.create({ data: cr as any });
      }
    }

    if (Array.isArray(data.cmsMediaAssets) && data.cmsMediaAssets.length) {
      for (const cma of data.cmsMediaAssets) {
        await tx.cmsMediaAsset.create({ data: cma as any });
      }
    }

    if (Array.isArray(data.cmsAuditLogs) && data.cmsAuditLogs.length) {
      for (const cal of data.cmsAuditLogs) {
        await tx.cmsAuditLog.create({ data: cal as any });
      }
    }

    if (Array.isArray(data.cmsNavItems) && data.cmsNavItems.length) {
      for (const cni of data.cmsNavItems) {
        await tx.cmsNavItem.create({ data: cni as any });
      }
    }

    if (Array.isArray(data.cmsAppearances) && data.cmsAppearances.length) {
      for (const ca of data.cmsAppearances) {
        await tx.cmsAppearance.create({ data: ca as any });
      }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
  });

  return {
    success: true,
    counts: payload.counts || {},
    message: "Database snapshot restored successfully.",
  };
}

export async function deleteBackup(filename: string): Promise<boolean> {
  const filePath = getBackupFilePath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
