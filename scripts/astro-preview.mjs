import { preview } from "astro";

/**
 * Foreground `astro preview` for Playwright. The Astro CLI moves the preview
 * server to the background when it detects an AI agent, which Playwright
 * reads as an early exit; the JS API always stays in this process.
 *
 * Usage: node scripts/astro-preview.mjs <port>
 */
const port = Number(process.argv[2] ?? 4322);
const server = await preview({
  logLevel: "warn",
  server: { host: "127.0.0.1", port },
});
console.log(`astro preview on http://127.0.0.1:${port}`);

const stop = async () => {
  await server.stop();
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
