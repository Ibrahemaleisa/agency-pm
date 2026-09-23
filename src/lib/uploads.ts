import path from "node:path";

/** Local file storage root. Swap for S3/R2 later by replacing read/write call sites. */
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
