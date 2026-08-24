import { readFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");

const expectedFragments = [
  '<header class="site-header"',
  'aria-label="Navegación principal"',
  'aria-controls="site-navigation"',
  'aria-expanded="false"',
  '<main id="main-content"',
  '<footer class="site-footer"',
  'href="/classes/"',
  'href="/schedules/"',
  'href="/teachers/"',
  'href="/facilities/"',
  'href="/performances/"',
  'href="/courses/"',
  'href="/rad/"',
  'href="/contact/"',
  'href="/legal/legal-notice/"',
  'href="/legal/privacy-policy/"',
  'href="/legal/cookie-policy/"',
];

const missing = expectedFragments.filter(
  (fragment) => !html.includes(fragment),
);

if (missing.length > 0) {
  console.error("Missing expected site shell fragments:");
  for (const fragment of missing) {
    console.error(`- ${fragment}`);
  }
  process.exit(1);
}
