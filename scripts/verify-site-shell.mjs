import { readFile } from "node:fs/promises";

/** Static smoke check for the shared header and footer in the generated Home. */
const html = await readFile("dist/index.html", "utf8");
const school = await readFile("src/content/school/escuela.md", "utf8");
const headerSource = await readFile("src/components/SiteHeader.astro", "utf8");

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};

// Landmarks.
expect(html.includes('<header class="site-header"'), "header landmark");
expect(html.includes('<main id="main-content"'), "main landmark with id");
expect(html.includes('<footer class="site-footer"'), "footer landmark");
expect(
  html.includes('aria-label="Navegación principal"'),
  "primary navigation label",
);
expect(html.includes('<html lang="es"'), "html lang=es");

// Menu button wiring.
expect(html.includes("data-menu-button"), "menu button");
expect(html.includes('aria-controls="site-navigation"'), "menu aria-controls");
expect(html.includes('aria-expanded="false"'), "menu aria-expanded=false");
expect(html.includes('id="site-navigation"'), "navigation id");
expect(html.includes('aria-label="Abrir menú"'), "menu button label");

// Six header entries, in order.
const expectedMenu = [
  ["Clases de ballet", "/clases-de-ballet-granada/"],
  ["Salud corporal", "/salud-corporal/"],
  ["Otras disciplinas", "/otras-disciplinas/"],
  ["Espectáculos", "/espectaculos/"],
  ["Exámenes RAD", "/examenes-rad/"],
  ["Cursos", "/cursos/"],
];
const categoryLinks = [
  ...html.matchAll(
    /<a[^>]*class="[^"]*site-nav__link[^"]*"[^>]*href="([^"]+)"[^>]*data-category-link[^>]*>([\s\S]*?)<\/a>/g,
  ),
].map((match) => [
  match[2]
    .replace(/<[^>]+>/g, "")
    .replace(/\s*\(en preparación\)/, "")
    .trim(),
  match[1],
]);
expect(
  categoryLinks.length === 6,
  `expected 6 header entries, found ${categoryLinks.length}`,
);
expectedMenu.forEach(([label, href], index) => {
  const actual = categoryLinks[index];
  expect(
    actual?.[0] === label && actual?.[1] === href,
    `header entry ${index + 1} should be "${label}" -> ${href}, got ${JSON.stringify(actual)}`,
  );
});

// Each family has a separate chevron button and its own panel.
const toggles = (html.match(/<button[^>]*data-submenu-toggle/g) ?? []).length;
expect(toggles === 3, `expected 3 submenu toggle buttons, found ${toggles}`);
expect(
  html.includes('aria-label="Mostrar clases de Clases de ballet"'),
  "ballet chevron button label",
);

// Ballet children: 8 links inside the first panel.
const panel = html.match(
  /<ul class="site-nav__panel" id="submenu-0">([\s\S]*?)<\/ul>/,
);
const children = panel ? (panel[1].match(/<a /g) ?? []).length : 0;
expect(children === 8, `expected 8 ballet dropdown links, found ${children}`);

// Footer contact links come from the school file, not duplicated copy.
const field = (key) => school.match(new RegExp(`^${key}:\\s*"(.*)"`, "m"))?.[1];
expect(
  field("whatsappHref") === "https://wa.me/34653424880",
  "school WhatsApp href",
);
expect(field("phoneHref") === "tel:+34958961504", "school phone href");
const footer = html.slice(html.indexOf('<footer class="site-footer"'));
expect(
  footer.includes('href="https://wa.me/34653424880"'),
  "footer WhatsApp link",
);
expect(footer.includes('href="tel:+34958961504"'), "footer phone link");
expect(footer.includes('href="/contacto/"'), "footer contact link");
expect(footer.includes('href="/legal/privacy-policy/"'), "footer privacy link");
expect(
  footer.includes(field("addressLine") ?? "__missing__"),
  "footer address",
);

// The mobile menu markup must not regress to the old topbar shell.
expect(!html.includes("site-topbar"), "legacy site-topbar must be gone");

// Behaviour hooks in the header script.
for (const hook of ['event.key !== "Escape"', "aria-expanded", "menu-open"]) {
  expect(headerSource.includes(hook), `header script: ${hook}`);
}

if (failures.length > 0) {
  console.error("Site shell verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "Site shell verified: 6 header entries, landmarks, footer contacts.",
);
