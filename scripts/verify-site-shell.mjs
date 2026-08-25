import { readFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const css = await readFile("src/styles/global.css", "utf8");

const expectedHtmlFragments = [
  '<div class="site-topbar"',
  '<header class="site-header"',
  'aria-label="Navegación principal"',
  "site-nav--desktop",
  "site-nav--mobile",
  'class="site-header__search"',
  'aria-controls="site-navigation"',
  'aria-expanded="false"',
  '<main id="main-content"',
  '<section class="home-hero"',
  "Dance with soul",
  "El movimiento",
  'class="home-hero__actions"',
  'class="home-hero__scroll"',
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

const expectedCssFragments = [
  "--color-arabesque-primary: #fdd8d6",
  "--color-arabesque-secondary: #ffd0ce",
  "--color-footer-background: #171717",
  "--layout-shell: 68.75rem",
  "--letter-spacing-navigation: 0.14em",
  ".site-topbar",
  ".site-nav--desktop",
  ".home-hero",
  'url("/assets/hero-ballet.png")',
  "min-height: calc(100vh - 140px)",
];

const missingHtml = expectedHtmlFragments.filter(
  (fragment) => !html.includes(fragment),
);
const missingCss = expectedCssFragments.filter(
  (fragment) => !css.includes(fragment),
);

if (missingHtml.length > 0 || missingCss.length > 0) {
  console.error("Missing expected site shell fragments:");
  for (const fragment of missingHtml) {
    console.error(`- html: ${fragment}`);
  }

  for (const fragment of missingCss) {
    console.error(`- css: ${fragment}`);
  }

  process.exit(1);
}
