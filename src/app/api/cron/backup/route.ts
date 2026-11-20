import { NextRequest, NextResponse } from "next/server";
import {
  createDatabaseSnapshot,
  createMediaArchive,
  listBackups,
  deleteBackup,
} from "@/lib/backup-service";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleBackupCron(request);
}

export async function GET(request: NextRequest) {
  return handleBackupCron(request);
}

async function handleBackupCron(request: NextRequest) {
  // 1. Authorization Verification
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");

  let isAuthorized = false;

  if (cronSecret) {
    if (authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret) {
      isAuthorized = true;
    }
  } else {
    // If no CRON_SECRET is configured, check if caller is an authenticated ADMIN
    const session = await auth();
    if (session?.user && (session.user as { role?: string }).role === "ADMIN") {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      {
        error:
          "Unauthorized. Pass a valid CRON_SECRET via Bearer token (Authorization: Bearer <token>) or ?secret=<token> query parameter.",
      },
      { status: 401 }
    );
  }

  try {
    const startedAt = new Date().toISOString();

    // 2. Generate database snapshot
    const dbResult = await createDatabaseSnapshot();

    // 3. Generate media archive
    let mediaResult: { filename: string; sizeFormatted: string } | undefined;
    try {
      const media = await createMediaArchive();
      mediaResult = {
        filename: media.filename,
        sizeFormatted: media.sizeFormatted,
      };
    } catch (mediaErr) {
      console.warn("Cron media archive warning:", mediaErr);
    }

    // 4. Automated Retention Cleanup: Keep the 14 newest snapshots/media archives
    const allBackups = await listBackups();
    let deletedOldCount = 0;

    const dbBackups = allBackups.filter((b) => b.type === "db_snapshot");
    if (dbBackups.length > 14) {
      const toDelete = dbBackups.slice(14);
      for (const b of toDelete) {
        await deleteBackup(b.filename).catch(() => null);
        deletedOldCount++;
      }
    }

    const mediaBackups = allBackups.filter((b) => b.type === "media");
    if (mediaBackups.length > 14) {
      const toDelete = mediaBackups.slice(14);
      for (const b of toDelete) {
        await deleteBackup(b.filename).catch(() => null);
        deletedOldCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Scheduled automated backup snapshot completed successfully.",
      startedAt,
      completedAt: new Date().toISOString(),
      databaseSnapshot: {
        filename: dbResult.filename,
        size: dbResult.sizeFormatted,
        counts: dbResult.counts,
      },
      mediaArchive: mediaResult ?? null,
      retentionCleanedCount: deletedOldCount,
    });
  } catch (err) {
    console.error("Scheduled backup cron failure:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to execute automated backup",
      },
      { status: 500 }
    );
  }
}
