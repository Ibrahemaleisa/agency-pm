/**
 * Thmanyah Sans is licensed: its font files must not be publicly downloadable, but this repository
 * is public. So the repo only stores AES-256-GCM encrypted copies (*.woff2.enc); the build decrypts
 * them with the FONT_KEY secret (set in Vercel) and Next.js bundles them into the site.
 *
 *   node scripts/fonts.mjs encrypt   # after adding/updating plain .woff2 files locally
 *   node scripts/fonts.mjs decrypt   # runs automatically before builds
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "src/fonts/thmanyah");
const mode = process.argv[2];
const keyHex = process.env.FONT_KEY;

function key() {
  if (!keyHex || !/^[0-9a-f]{64}$/i.test(keyHex)) {
    console.error("FONT_KEY is missing or invalid (expected 64 hex chars). Set it in the environment.");
    process.exit(1);
  }
  return Buffer.from(keyHex, "hex");
}

if (mode === "encrypt") {
  for (const f of readdirSync(DIR).filter((f) => f.endsWith(".woff2"))) {
    const iv = randomBytes(12);
    const c = createCipheriv("aes-256-gcm", key(), iv);
    const data = Buffer.concat([c.update(readFileSync(path.join(DIR, f))), c.final()]);
    writeFileSync(path.join(DIR, `${f}.enc`), Buffer.concat([iv, c.getAuthTag(), data]));
    console.log("encrypted", f);
  }
} else if (mode === "decrypt") {
  const encrypted = readdirSync(DIR).filter((f) => f.endsWith(".woff2.enc"));
  const missing = encrypted.filter((f) => !existsSync(path.join(DIR, f.replace(/\.enc$/, ""))));
  if (missing.length === 0) process.exit(0); // plain files already present (local dev)
  for (const f of missing) {
    const buf = readFileSync(path.join(DIR, f));
    const d = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    writeFileSync(path.join(DIR, f.replace(/\.enc$/, "")), Buffer.concat([d.update(buf.subarray(28)), d.final()]));
  }
  console.log(`decrypted ${missing.length} font file(s)`);
} else {
  console.error("usage: node scripts/fonts.mjs encrypt|decrypt");
  process.exit(1);
}
