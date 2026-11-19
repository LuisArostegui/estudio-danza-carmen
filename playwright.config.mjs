import { defineConfig, devices } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
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

/**
 * Extra engines (#32) are opt-in so CI keeps installing Chromium only:
 * `PLAYWRIGHT_ENGINES=firefox,webkit pnpm test:e2e:engines`. They run the
 * representative journeys below, not the whole suite.
 */
const engines = (env.PLAYWRIGHT_ENGINES ?? "")
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);
const engineJourneys = [
  "cross-engine.spec.ts",
  "preview-flow.spec.ts",
  "sobre-nosotros.spec.ts",
  "espectaculos.spec.ts",
  "support-pages.spec.ts",
  "horarios.spec.ts",
];
const engineProjects = [];
/**
 * Playwright's Firefox can exit with "Could not find profile folder" when it
 * cannot use the default macOS app-data folders; give it temporary ones.
 */
function firefoxLaunchEnv() {
  const temp = (name) => mkdtempSync(path.join(tmpdir(), `carmen-${name}-`));
  return {
    ...env,
    MOZ_APP_DATA: env.MOZ_APP_DATA ?? temp("moz-app-data"),
    MOZ_LOCAL_APP_DATA: env.MOZ_LOCAL_APP_DATA ?? temp("moz-local-app-data"),
  };
}
if (engines.includes("firefox")) {
  const launchOptions = { env: firefoxLaunchEnv() };
  engineProjects.push(
    {
      name: "firefox-390",
      testMatch: engineJourneys,
      // Firefox has no isMobile emulation; touch and width still apply.
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        launchOptions,
      },
    },
    {
      name: "firefox-1440",
      testMatch: engineJourneys,
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
        launchOptions,
      },
    },
  );
}
if (engines.includes("webkit")) {
  engineProjects.push(
    {
      name: "webkit-390",
      testMatch: engineJourneys,
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
    {
      name: "webkit-768",
      testMatch: engineJourneys,
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: "webkit-1440",
      testMatch: engineJourneys,
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1440, height: 900 },
      },
    },
  );
}

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
    ...engineProjects,
  ],
});
