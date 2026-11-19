// Checks the private review artifact (pnpm build:review → dist-review/) before
// it is uploaded. It fails unless the artifact is complete and safe:
// - the output directory exists and holds every required page;
// - _headers sends X-Robots-Tag noindex under the /* rule;
// - every HTML page carries a robots noindex meta;
// - the contact form is present and in test mode (no data-endpoint);
// - preview notes are hidden (PUBLIC_HIDE_PREVIEW_NOTES=true was applied).

import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Kept apart from dist/ so a normal build can never be deployed as review. */
export const REVIEW_OUT_DIR = "dist-review";

export const REQUIRED_PAGES = [
  "index.html",
  "404.html",
  "clases-de-ballet-granada/index.html",
  "clases-de-ballet-granada/ballet-para-adultos/index.html",
  "horarios/index.html",
  "contacto/index.html",
];

// Review notes gated by PUBLIC_HIDE_PREVIEW_NOTES: the collapsible «datos por
// confirmar» blocks and the Horarios example banner. The «Página en
// preparación» note on pending pages is page content and is not listed.
const PREVIEW_NOTE_MARKERS = [
  '<details class="preview-note',
  'data-testid="schedule-example-note"',
];

/** @param {string} dir @returns {Promise<string[]>} */
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

/**
 * True when the `/*` rule block contains an X-Robots-Tag noindex header.
 * @param {string} headers
 */
function rootRuleHasNoindex(headers) {
  let inRoot = false;
  for (const line of headers.split("\n")) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      inRoot = line.trim() === "/*";
      continue;
    }
    if (inRoot && /^X-Robots-Tag:\s*noindex\b/i.test(line.trim())) return true;
  }
  return false;
}

/** @param {string} outDir @returns {Promise<string[]>} problems found */
export async function checkReviewBuild(outDir) {
  const isDir = await stat(outDir).then(
    (s) => s.isDirectory(),
    () => false,
  );
  if (!isDir) return [`${outDir}: output directory missing`];

  const problems = [];
  let headers = null;
  try {
    headers = await readFile(join(outDir, "_headers"), "utf8");
  } catch {
    problems.push("_headers: file missing");
  }
  if (headers !== null && !rootRuleHasNoindex(headers)) {
    problems.push("_headers: no X-Robots-Tag noindex rule for /*");
  }

  const files = await htmlFiles(outDir);
  const names = new Set(files.map((file) => relative(outDir, file)));
  for (const page of REQUIRED_PAGES) {
    if (!names.has(page)) problems.push(`${page}: required page missing`);
  }

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const name = relative(outDir, file);
    if (!/<meta name="robots" content="noindex[^"]*">/.test(html)) {
      problems.push(`${name}: missing noindex`);
    }
    if (
      name === "contacto/index.html" &&
      !/<form[^>]*\sdata-enquiry-form/.test(html)
    ) {
      problems.push(`${name}: contact form missing`);
    }
    if (/<form[^>]*\sdata-endpoint=/.test(html)) {
      problems.push(`${name}: contact form is in live mode`);
    }
    if (PREVIEW_NOTE_MARKERS.some((marker) => html.includes(marker))) {
      problems.push(`${name}: preview notes are visible`);
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const outDir = resolve(process.argv[2] ?? REVIEW_OUT_DIR);
  const problems = await checkReviewBuild(outDir);
  if (problems.length > 0) {
    console.error(`Review build check failed:\n- ${problems.join("\n- ")}`);
    process.exit(1);
  }
  console.log(
    `Review build check passed for ${relative(process.cwd(), outDir)}: complete, noindex everywhere, form in test mode, preview notes hidden.`,
  );
}
