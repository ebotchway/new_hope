import fs from "node:fs";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { getBackupFilePath, sanitizeFilename } from "@/lib/backup-service";

export async function GET(
  _request: Request,
  props: { params: Promise<{ filename: string }> }
) {
  try {
    await requireAdmin();
    const params = await props.params;
    const safeName = sanitizeFilename(params.filename);
    const filePath = getBackupFilePath(safeName);

    const stat = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="${safeName}"`);
    headers.set("Content-Type", "application/gzip");
    headers.set("Content-Length", stat.size.toString());
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

    return new Response(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized or file not found";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
