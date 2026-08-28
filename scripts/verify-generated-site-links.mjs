import { spawn } from "node:child_process";
import { createRequire } from "node:module";
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
const PLANNED_ROUTE_PATTERN = `${baseUrl}/(classes|schedules|teachers|facilities|performances|courses|rad|contact|legal/legal-notice|legal/privacy-policy|legal/cookie-policy)/?$`;

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
    "--skip",
    PLANNED_ROUTE_PATTERN,
  ]);
} finally {
  server.kill("SIGTERM");
}
