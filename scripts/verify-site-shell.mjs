import { readFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const css = await readFile("src/styles/global.css", "utf8");
const siteHeader = await readFile("src/components/SiteHeader.astro", "utf8");

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
  "classList.toggle(`is-open`",
  "classList.toggle(`menu-open`",
  "classList.remove(`menu-open`)",
];

const expectedCssFragments = [
  "--color-arabesque-primary: #fdd8d6",
  "--color-arabesque-secondary: #ffd0ce",
  "--color-footer-background: #171717",
  "--layout-shell: 68.75rem",
  "--letter-spacing-navigation: 0.14em",
  "body.menu-open",
  ".site-topbar",
  ".site-nav--desktop",
  ".site-nav--mobile.is-open",
  "position: absolute",
  "inset-block-start: 100%",
  "inset-inline: 0",
  "min-height: calc(100svh - 4.875rem)",
  "visibility: hidden",
  "opacity: 0",
  '.site-header__menu-button[aria-expanded="true"]',
  ".site-header__menu-icon",
  ".home-hero",
  'url("/assets/hero-carmen.png")',
  "min-height: calc(100vh - 140px)",
];

const missingHtml = expectedHtmlFragments.filter(
  (fragment) => !html.includes(fragment),
);
const missingCss = expectedCssFragments.filter(
  (fragment) => !css.includes(fragment),
);

const headerInnerStart = siteHeader.indexOf('class="site-header__inner"');
const mobileNavStart = siteHeader.indexOf('class="site-nav site-nav--mobile"');
const headerInnerEnd = siteHeader.indexOf("</div>", headerInnerStart);
const mobileNavIsOutsideHeaderInner =
  headerInnerStart >= 0 &&
  headerInnerEnd >= 0 &&
  mobileNavStart > headerInnerEnd;

if (
  missingHtml.length > 0 ||
  missingCss.length > 0 ||
  !mobileNavIsOutsideHeaderInner
) {
  console.error("Missing expected site shell fragments:");
  for (const fragment of missingHtml) {
    console.error(`- html: ${fragment}`);
  }

  for (const fragment of missingCss) {
    console.error(`- css: ${fragment}`);
  }

  if (!mobileNavIsOutsideHeaderInner) {
    console.error(
      "- source: mobile navigation must sit outside site-header__inner",
    );
  }

  process.exit(1);
}
