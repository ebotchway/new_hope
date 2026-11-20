import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/pjpeg": "jpg",
  "image/png": "png",
  "image/x-png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const EXTENSION_MAP: Record<string, string> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  avif: "avif",
  gif: "gif",
  svg: "svg",
};

function extensionFor(file: File): string {
  const mime = (file.type || "").toLowerCase().trim();
  if (mime && ALLOWED_MIME_TYPES[mime]) {
    return ALLOWED_MIME_TYPES[mime];
  }

  // Fallback to filename extension when MIME type is absent or generic
  const name = file.name || "";
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex !== -1) {
    const rawExt = name.slice(dotIndex + 1).toLowerCase();
    if (EXTENSION_MAP[rawExt]) {
      return EXTENSION_MAP[rawExt];
    }
  }

  throw new Error(
    "Invalid file type. Supported formats are JPG, PNG, WebP, AVIF, GIF, and SVG."
  );
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

  try {
    const destDir = path.join(UPLOAD_DIR, sanitizedFolder);
    await mkdir(destDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    const destPath = path.join(UPLOAD_DIR, filename);
    await writeFile(destPath, buffer);
    return `/uploads/${filename}`;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Storage] Failed to store uploaded file to ${filename}:`, err);
    throw new Error(`Upload storage error: ${message}`);
  }
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
