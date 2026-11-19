import { readFile } from "node:fs/promises";

/**
 * Static smoke check for the generated Home page. Elena's literal copy is read
 * from src/content/home/inicio.md instead of being duplicated here.
 */
const html = await readFile("dist/index.html", "utf8");
const source = await readFile("src/content/home/inicio.md", "utf8");

/** Value of the first `key: "value"` line with this key in the front matter. */
function frontMatterValues(key) {
  const pattern = new RegExp(`^\\s*(?:- )?${key}:\\s*"(.*)"\\s*$`, "gm");
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

const escapeHtml = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const decoded = html.replaceAll("&#39;", "'").replaceAll("&quot;", '"');
const failures = [];

function expectHtml(fragment, label = fragment) {
  if (!html.includes(fragment) && !decoded.includes(fragment)) {
    failures.push(`html: ${label}`);
  }
}

// Elena's copy: hero, section titles, card titles, show names, CTAs.
const copyKeys = ["title", "label", "name", "eyebrow", "accent"];
const literalCopy = new Set();
for (const key of copyKeys) {
  for (const value of frontMatterValues(key)) literalCopy.add(value);
}
// The SEO title of the page itself is only in <title>, not in the body copy.
literalCopy.delete(frontMatterValues("title")[0]);
// Pending photo labels are not copy; they are checked by the e2e suite.
for (const value of frontMatterValues("body")) literalCopy.add(value);

for (const text of literalCopy) {
  expectHtml(escapeHtml(text), `copy "${text.slice(0, 60)}"`);
}

expectHtml(
  "<title>Estudio de Danza Carmen · Escuela de ballet en Granada</title>",
);
expectHtml('<h1 id="home-title"', "single H1 hero");
expectHtml('id="nuestras-clases"');
expectHtml('href="#nuestras-clases"');
expectHtml('href="/sobre-nosotros/"');
expectHtml('data-testid="show-gallery"');
expectHtml('data-testid="enquiry-form"');

// Four class cards link to the four families.
for (const href of [
  "/clases-de-ballet-granada/",
  "/clases-de-ballet-granada/ballet-para-adultos/",
  "/salud-corporal/",
  "/otras-disciplinas/",
]) {
  expectHtml(`href="${href}"`);
}

const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
if (h1Count !== 1)
  failures.push(`html: expected exactly 1 <h1>, found ${h1Count}`);

// Seven production tiles, each a link to its anchor on /espectaculos/.
const tiles = (
  html.match(
    /<a class="[^"]*gallery__tile[^"]*"[^>]*href="\/espectaculos\/#[a-z-]+"/g,
  ) ?? []
).length;
if (tiles !== 7)
  failures.push(`html: expected 7 linked gallery tiles, found ${tiles}`);

if (!html.includes('data-page-status="complete"')) {
  failures.push("html: Home must be marked data-page-status=complete");
}
if (/name="robots"[^>]*noindex/.test(html)) {
  failures.push("html: Home must not be noindex");
}

if (failures.length > 0) {
  console.error("Home page verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Home page verified: ${literalCopy.size} literal copy strings, 1 H1, 7 gallery tiles.`,
);
