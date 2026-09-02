import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) return fromName.toLowerCase();
  return (file.type.split("/")[1] ?? "bin").toLowerCase();
}

/**
 * Stores an uploaded file and returns a public URL.
 * Driven by STORAGE_DRIVER: "vercel-blob" in production, "local" (public/uploads) in dev.
 */
export async function uploadFile(file: File, folder: string): Promise<string> {
  const filename = `${folder}/${randomUUID()}.${extensionFor(file)}`;

  if (process.env.STORAGE_DRIVER === "vercel-blob") {
    const { put } = await import("@vercel/blob");
    const blob = await put(filename, file, { access: "public" });
    return blob.url;
  }

  const destDir = path.join(UPLOAD_DIR, folder);
  await mkdir(destDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const destPath = path.join(UPLOAD_DIR, filename);
  await writeFile(destPath, buffer);
  return `/uploads/${filename}`;
}
