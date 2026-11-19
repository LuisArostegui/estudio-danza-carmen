import { defineConfig } from "astro/config";

export default defineConfig({
  // Fixture builds (scripts/verify-courses-page.mjs) use their own cache so
  // their content never leaks into the normal build's content store.
  ...(process.env.CARMEN_CACHE_DIR
    ? { cacheDir: process.env.CARMEN_CACHE_DIR }
    : {}),
});
