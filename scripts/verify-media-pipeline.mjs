import { readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const repoRoot = process.cwd();
const publicAssetsDir = join(repoRoot, "public", "assets");
const allowedExtensions = new Set([
  ".avif",
  ".gif",
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".webp",
]);
const maxRepresentativeAssetBytes = 2 * 1024 * 1024;

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else {
      files.push(path);
    }
  }

  return files;
}

const files = await collectFiles(publicAssetsDir);

for (const file of files) {
  const extension = extname(file).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new Error(
      `Unsupported public media format: ${relative(repoRoot, file)}`,
    );
  }

  const fileStat = await stat(file);
  if (fileStat.size > maxRepresentativeAssetBytes) {
    throw new Error(
      `Public media exceeds the representative asset limit: ${relative(repoRoot, file)} (${fileStat.size} bytes).`,
    );
  }
}

console.log(`Public media policy verified for ${files.length} file(s).`);
