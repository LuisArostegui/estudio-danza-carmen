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

const port = env.PLAYWRIGHT_PORT ?? "4321";
/**
 * `astro preview` serves the custom 404 page with HTTP 404 for unknown
 * routes (the Vite preview server falls back to Inicio with HTTP 200).
 * Tests reach it on the Vite preview port + 1.
 */
const astroPort = String(Number(port) + 1);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(env.CI),
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: `node "${viteCliPath}" preview --outDir dist --host 127.0.0.1 --port ${port} --strictPort`,
      gracefulShutdown: {
        signal: "SIGTERM",
        timeout: 500,
      },
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer: false,
    },
    {
      // Foreground wrapper around Astro's preview API (see the script).
      command: `node scripts/astro-preview.mjs ${astroPort}`,
      gracefulShutdown: {
        signal: "SIGTERM",
        timeout: 500,
      },
      url: `http://127.0.0.1:${astroPort}`,
      reuseExistingServer: false,
    },
  ],
  projects: [
    {
      name: "mobile-390",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: "desktop-1440",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
