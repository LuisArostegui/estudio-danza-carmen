import { readFile } from "node:fs/promises";

const html = await readFile("dist/index.html", "utf8");
const css = await readFile("src/styles/global.css", "utf8");

const expectedHtmlFragments = [
  '<section class="home-hero"',
  '<section class="home-intro"',
  '<section class="home-class-pathways"',
  '<section class="home-planning"',
  '<section class="home-trust"',
  '<section class="home-discovery"',
  '<section class="home-final"',
  "Elige tu camino en la escuela",
  "Horarios y contacto claros para empezar",
  "Una practica cercana, tecnica y cuidada",
  "Mas formas de vivir la danza",
  "Encuentra la clase que encaja contigo",
  'data-cms-field="homeContent.classPathways[0].title"',
  'data-cms-field="homeContent.planningCards[0].title"',
  'data-cms-field="homeContent.trustItems[0].title"',
  'data-cms-field="homeContent.discoveryCards[0].title"',
  'data-cms-field="homeContent.finalPrompt.title"',
  'href="/classes/"',
  'href="/schedules/"',
  'href="/rad/"',
  'href="/contact/"',
];

const expectedCssFragments = [
  ".section-heading",
  ".editorial-card",
  ".home-class-pathways",
  ".home-planning",
  ".home-trust",
  ".home-discovery",
  ".home-final",
  "border-radius: var(--radius-md)",
  "letter-spacing: 0.18em",
];

const missingHtml = expectedHtmlFragments.filter(
  (fragment) => !html.includes(fragment),
);
const missingCss = expectedCssFragments.filter(
  (fragment) => !css.includes(fragment),
);

if (missingHtml.length > 0 || missingCss.length > 0) {
  console.error("Missing expected Home page fragments:");

  for (const fragment of missingHtml) {
    console.error(`- html: ${fragment}`);
  }

  for (const fragment of missingCss) {
    console.error(`- css: ${fragment}`);
  }

  process.exit(1);
}
