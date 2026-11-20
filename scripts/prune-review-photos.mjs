// Removes raster files from dist-review/_astro/ that no page, stylesheet or
// script references. With PUBLIC_REVIEW_HIDE_PHOTOS=true no photo is rendered,
// but Astro still emits the original of every image imported by a content
// collection. Those orphans would be uploaded (and reachable by URL) without
// any page showing them. A photo that is still rendered stays referenced, is
// kept, and then fails scripts/verify-review-build.mjs.

import { readFile, readdir, rm } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RASTER = /\.(?:avif|webp|jpe?g|png|gif)$/i;
const TEXT = /\.(?:html|css|js|mjs|json|xml|txt|webmanifest)$/i;

/** @param {string} outDir @returns {Promise<string[]>} removed paths */
export async function pruneUnreferencedPhotos(outDir) {
  const entries = await readdir(outDir, {
    withFileTypes: true,
    recursive: true,
  });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(outDir, join(entry.parentPath, entry.name)).replaceAll(
        "\\",
        "/",
      ),
    );

  const texts = await Promise.all(
    files
      .filter((name) => TEXT.test(name))
      .map((name) => readFile(join(outDir, name), "utf8")),
  );
  const corpus = texts.join("\n");

  const removed = files
    .filter((name) => name.startsWith("_astro/") && RASTER.test(name))
    .filter((name) => !corpus.includes(name.slice("_astro/".length)))
    .sort();
  await Promise.all(removed.map((name) => rm(join(outDir, name))));
  return removed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outDir = resolve(process.argv[2] ?? "dist-review");
  const removed = await pruneUnreferencedPhotos(outDir);
  console.log(
    `Removed ${removed.length} unreferenced image file(s) from ${relative(process.cwd(), outDir)}`,
  );
}
