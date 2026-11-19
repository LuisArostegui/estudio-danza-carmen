import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const astroPackagePath = require.resolve("astro/package.json");
const vitePackagePath = require.resolve("vite/package.json", {
  paths: [path.dirname(astroPackagePath)],
});
const viteCliPath = path.join(path.dirname(vitePackagePath), "bin", "vite.js");
const linkinatorCliPath = path.join(
  path.dirname(require.resolve("linkinator")),
  "cli.js",
);
const host = "127.0.0.1";
const port = "4322";
const baseUrl = `http://${host}:${port}`;

/**
 * Routes that must be built, complete and indexable. A pending or missing
 * page here fails the run, so a placeholder can never count as verified.
 */
const VERIFIED_ROUTES = [
  "/",
  "/clases-de-ballet-granada/",
  "/clases-de-ballet-granada/ballet-para-adultos/",
  "/contacto/",
];

/** Activity slugs per family, read from the content files. */
const familySlug = {
  ballet: "clases-de-ballet-granada",
  salud: "salud-corporal",
  otras: "otras-disciplinas",
};
const activityRoutes = [];
for (const file of await readdir("src/content/activities")) {
  if (!file.endsWith(".md")) continue;
  const source = await readFile(`src/content/activities/${file}`, "utf8");
  const family = source.match(/^family:\s*(\w+)/m)?.[1];
  const status = source.match(/^status:\s*(\w+)/m)?.[1];
  if (status === "review")
    activityRoutes.push(`/${familySlug[family]}/${file.replace(/\.md$/, "")}/`);
}

/**
 * Built pages with full content awaiting owner review. Each must exist, be
 * `review` and noindex: a missing page or a fallback placeholder fails.
 */
const REVIEW_ROUTES = [
  "/salud-corporal/",
  "/otras-disciplinas/",
  "/sobre-nosotros/",
  "/espectaculos/",
  "/examenes-rad/",
  "/cursos/",
  "/regala-danza/",
  ...activityRoutes,
];

function waitForServer(url, timeoutMs = 10_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    async function poll() {
      try {
        const response = await fetch(url);

        if (response.ok) {
          resolve();
          return;
        }
      } catch {
        // Keep polling until the preview server is ready or times out.
      }

      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }

      setTimeout(poll, 150);
    }

    poll();
  });
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} failed with ${code}`));
    });
  });
}

const server = spawn(
  process.execPath,
  [
    viteCliPath,
    "preview",
    "--outDir",
    "dist",
    "--host",
    host,
    "--port",
    port,
    "--strictPort",
  ],
  {
    stdio: "inherit",
  },
);

try {
  await waitForServer(baseUrl);
  await run(process.execPath, [
    linkinatorCliPath,
    baseUrl,
    "--recurse",
    "--clean-urls",
    "--check-fragments",
    "--check-css",
    "--skip",
    "^https://",
  ]);
} finally {
  server.kill("SIGTERM");
}

async function findIndexFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await findIndexFiles(full)));
    else if (entry.name === "index.html") found.push(full);
  }
  return found;
}

const distDirectory = path.resolve("dist");
const pages = new Map();
for (const file of await findIndexFiles(distDirectory)) {
  const route =
    "/" +
    path.relative(distDirectory, path.dirname(file)).split(path.sep).join("/");
  const html = await readFile(file, "utf8");
  pages.set(route === "/" ? "/" : `${route}/`, {
    status:
      html.match(/<body[^>]*data-page-status="([a-z]+)"/)?.[1] ?? "missing",
    noindex: /<meta[^>]*name="robots"[^>]*noindex/.test(html),
  });
}

const sorted = [...pages].sort(([a], [b]) => a.localeCompare(b));
const complete = sorted.filter(([, page]) => page.status === "complete");
const pending = sorted.filter(([, page]) => page.status === "pending");
// Built pages with real content that are still in owner review.
const review = sorted.filter(([, page]) => page.status === "review");
const unknown = sorted.filter(
  ([, page]) => !["complete", "pending", "review"].includes(page.status),
);

console.log(`\nCOMPLETE (${complete.length}):`);
for (const [route] of complete) {
  console.log(
    `  ${VERIFIED_ROUTES.includes(route) ? "[verified]" : "          "} ${route}`,
  );
}
console.log(`\nPENDING (not verified) (${pending.length}):`);
for (const [route] of pending) console.log(`  ${route}`);
console.log(`\nIN REVIEW (not verified) (${review.length}):`);
for (const [route] of review) console.log(`  ${route}`);

const problems = [];
for (const route of VERIFIED_ROUTES) {
  const page = pages.get(route);
  if (!page) problems.push(`verified route is missing from dist: ${route}`);
  else if (page.status !== "complete")
    problems.push(`verified route is ${page.status}, not complete: ${route}`);
  else if (page.noindex) problems.push(`verified route is noindex: ${route}`);
}
for (const route of REVIEW_ROUTES) {
  const page = pages.get(route);
  if (!page) problems.push(`review route is missing from dist: ${route}`);
  else if (page.status !== "review")
    problems.push(`review route is ${page.status}, not review: ${route}`);
}
if (activityRoutes.length < 18)
  problems.push(
    `expected 18 activity pages in review, found ${activityRoutes.length}`,
  );
for (const [route, page] of pending) {
  if (!page.noindex) problems.push(`pending page lacks noindex: ${route}`);
}
for (const [route, page] of review) {
  if (!page.noindex) problems.push(`review page lacks noindex: ${route}`);
}
for (const [route, page] of unknown) {
  problems.push(`page without data-page-status (${page.status}): ${route}`);
}

if (problems.length > 0) {
  console.error("\nVerification status check FAILED:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `\nVerification status OK: ${VERIFIED_ROUTES.length} verified routes complete; ${REVIEW_ROUTES.length} required review routes present; ${pending.length} pending and ${review.length} in-review pages excluded and noindex.`,
);
