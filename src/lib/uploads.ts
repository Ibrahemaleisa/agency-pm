import path from "node:path";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { del, get, put } from "@vercel/blob";

/**
 * File storage. Uses Vercel Blob (private) when BLOB_READ_WRITE_TOKEN is set,
 * otherwise the local ./uploads folder. Files are always served through
 * /api/files/[id], which checks access first.
 */
const blobEnabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;

export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");

// Vercel functions reject request bodies over 4.5 MB.
export const MAX_UPLOAD_BYTES = (process.env.VERCEL ? 4 : 20) * 1024 * 1024;

export async function saveFile(key: string, data: Buffer, contentType: string) {
  if (blobEnabled()) {
    await put(key, data, { access: "private", contentType, addRandomSuffix: false });
    return;
  }
  const filePath = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, data);
}

export async function loadFile(key: string): Promise<ReadableStream<Uint8Array> | Uint8Array | null> {
  if (blobEnabled()) {
    const res = await get(key, { access: "private" }).catch(() => null);
    return res?.statusCode === 200 ? res.stream : null;
  }
  const filePath = path.join(UPLOAD_DIR, key);
  if (!filePath.startsWith(UPLOAD_DIR)) return null;
  return readFile(filePath).then((b) => new Uint8Array(b)).catch(() => null);
}

export async function removeFile(key: string) {
  if (blobEnabled()) await del(key).catch(() => {});
  else await unlink(path.join(UPLOAD_DIR, key)).catch(() => {});
}
