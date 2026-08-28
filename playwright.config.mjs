import { defineConfig, devices } from "@playwright/test";
import { createRequire } from "node:module";
import path from "node:path";
import { env } from "node:process";

const require = createRequire(import.meta.url);
const astroPackagePath = require.resolve("astro/package.json");
const vitePackagePath = require.resolve("vite/package.json", {
  paths: [path.dirname(astroPackagePath)],
});
const viteCliPath = path.join(path.dirname(vitePackagePath), "bin", "vite.js");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(env.CI),
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  webServer: {
    command: `node "${viteCliPath}" preview --outDir dist --host 127.0.0.1 --port 4321 --strictPort`,
    gracefulShutdown: {
      signal: "SIGTERM",
      timeout: 500,
    },
    url: "http://127.0.0.1:4321",
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
});
