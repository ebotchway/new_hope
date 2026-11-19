import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function extensionFor(file: File): string {
  const mime = file.type.toLowerCase();
  const ext = ALLOWED_MIME_TYPES[mime];
  if (!ext) {
    throw new Error("Invalid file type. Only JPG, PNG, and WebP images are permitted.");
  }
  return ext;
}

function sanitizeFolderPath(folder: string): string {
  // Allow nested subfolders (e.g. cms/general) while safely stripping any path traversal
  const sanitized = folder
    .split(/[\\/]+/)
    .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, ""))
    .filter(Boolean)
    .join("/");
  return sanitized || "general";
}

/**
 * Stores an uploaded file securely and returns a public URL.
 * Driven by STORAGE_DRIVER: "vercel-blob" in cloud deployments, "local" (public/uploads) in local/dev.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds the maximum allowable size of 5MB.");
  }

  // Sanitize folder path to support subfolders while strictly preventing directory traversal
  const sanitizedFolder = sanitizeFolderPath(folder);
  const extension = extensionFor(file);
  const filename = `${sanitizedFolder}/${randomUUID()}.${extension}`;

  if (process.env.STORAGE_DRIVER === "vercel-blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(filename, file, { access: "public" });
    return blob.url;
  }

  const destDir = path.join(UPLOAD_DIR, sanitizedFolder);
  await mkdir(destDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const destPath = path.join(UPLOAD_DIR, filename);
  await writeFile(destPath, buffer);
  return `/uploads/${filename}`;
}

/**
 * Deletes an uploaded file by its URL or relative path.
 * Supports both local storage and Vercel Blob.
 */
export async function deleteFile(urlOrPath: string): Promise<boolean> {
  if (!urlOrPath) return false;

  try {
    if (process.env.STORAGE_DRIVER === "vercel-blob" || urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
      const { del } = await import("@vercel/blob");
      await del(urlOrPath);
      return true;
    }

    // Local file deletion
    const relativePath = urlOrPath.startsWith("/uploads/")
      ? urlOrPath.slice("/uploads/".length)
      : urlOrPath.replace(/^\/+/, "");

    // Guard against path traversal
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.join(UPLOAD_DIR, safePath);

    if (fullPath.startsWith(UPLOAD_DIR)) {
      await unlink(fullPath);
      return true;
    }
  } catch (err: unknown) {
    console.warn(`[Storage] Could not delete file: ${urlOrPath}`, err);
  }
  return false;
}
