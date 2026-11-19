// Checks a private review build (pnpm build:review) before it is uploaded:
// _headers sends noindex, every HTML page carries a robots noindex meta, and
// the contact form stays in test mode (no data-endpoint).

import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @param {string} dir @returns {Promise<string[]>} */
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

/** @param {string} outDir @returns {Promise<string[]>} problems found */
export async function checkReviewBuild(outDir) {
  const problems = [];
  let headers = "";
  try {
    headers = await readFile(join(outDir, "_headers"), "utf8");
  } catch {
    problems.push("_headers: file missing");
  }
  if (headers && !/^\/\*\n\s+X-Robots-Tag: noindex/m.test(headers)) {
    problems.push("_headers: no X-Robots-Tag noindex rule for /*");
  }
  for (const file of await htmlFiles(outDir)) {
    const html = await readFile(file, "utf8");
    const name = relative(outDir, file);
    if (!/<meta name="robots" content="noindex[^"]*">/.test(html)) {
      problems.push(`${name}: missing noindex`);
    }
    if (/<form[^>]*\sdata-endpoint=/.test(html)) {
      problems.push(`${name}: contact form is in live mode`);
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outDir = resolve(process.argv[2] ?? "dist");
  const problems = await checkReviewBuild(outDir);
  if (problems.length > 0) {
    console.error(`Review build check failed:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(
    "Review build check passed: noindex everywhere, form in test mode.",
  );
}
