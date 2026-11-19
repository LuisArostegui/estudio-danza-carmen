// Writes dist/_headers for the private review build so every static asset is
// served with X-Robots-Tag: noindex. Workers Static Assets applies _headers to
// asset responses; /api/* responses come from the Worker and return JSON.
// This complements Cloudflare Access. It never replaces it.

import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const REVIEW_HEADERS = "/*\n  X-Robots-Tag: noindex, nofollow\n";

/** @param {string} outDir */
export async function writeReviewHeaders(outDir) {
  await writeFile(join(outDir, "_headers"), REVIEW_HEADERS);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outDir = resolve(process.argv[2] ?? "dist");
  await writeReviewHeaders(outDir);
  console.log(`Wrote review _headers to ${outDir}`);
}
