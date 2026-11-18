import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { homeCopy, waitForRevealsSettled } from "./helpers";

test("home renders the landmarks, Elena's hero copy and the six header entries", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    homeCopy("title", 1),
  );

  await expect(
    page.getByRole("link", { name: homeCopy("label", 0) }),
  ).toHaveAttribute("href", "#nuestras-clases");
  await expect(
    page.getByRole("link", { name: homeCopy("label", 1), exact: true }),
  ).toHaveAttribute("href", "/sobre-nosotros/");

  await expect(page.locator("#nuestras-clases")).toBeAttached();
  await expect(
    page.locator("#nuestras-clases a[href^='/']").first(),
  ).toBeAttached();

  const nav = page.locator("#site-navigation");
  await expect(nav.locator("[data-category-link]")).toHaveCount(6);
  await expect(nav.locator("[data-category-link]")).toHaveText([
    /^Clases de ballet$/,
    /^Salud corporal/,
    /^Otras disciplinas/,
    /^Espectáculos/,
    /^Exámenes RAD/,
    /^Cursos/,
  ]);
});

test("home lists the four class cards pointing at the four families", async ({
  page,
}) => {
  await page.goto("/");
  const cards = page.locator("#nuestras-clases a[href]");
  const hrefs = await cards.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  for (const href of [
    "/clases-de-ballet-granada/",
    "/clases-de-ballet-granada/ballet-para-adultos/",
    "/salud-corporal/",
    "/otras-disciplinas/",
  ]) {
    expect(hrefs).toContain(href);
  }
});

test("footer exposes WhatsApp and phone links", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(
    footer.locator('a[href="https://wa.me/34653424880"]'),
  ).toBeVisible();
  await expect(footer.locator('a[href="tel:+34958961504"]')).toBeVisible();
});

test("footer contact link text does not repeat its own label", async ({
  page,
}) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  const whatsapp = await footer
    .locator('a[href="https://wa.me/34653424880"]')
    .innerText();
  const phone = await footer.locator('a[href="tel:+34958961504"]').innerText();
  expect(whatsapp.match(/WhatsApp/g)).toHaveLength(1);
  expect(phone.match(/Tel[eé]fono/g)).toHaveLength(1);
});

test("home has no axe violations", async ({ page }) => {
  await page.goto("/");
  await waitForRevealsSettled(page);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("mobile navigation opens and closes with keyboard-visible state", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Mobile-only navigation interaction");

  await page.goto("/");

  const menuButton = page.locator("[data-menu-button]");
  const navigation = page.locator("[data-site-navigation]");

  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton).toHaveAttribute("aria-controls", "site-navigation");
  await expect(navigation).not.toBeVisible();

  await menuButton.focus();
  await page.keyboard.press("Enter");

  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(navigation).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/menu-open/);

  await page.keyboard.press("Escape");

  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(navigation).not.toBeVisible();
  await expect(menuButton).toBeFocused();
  await expect(page.locator("body")).not.toHaveClass(/menu-open/);
});

test("cms debug mode flags the document", async ({ page }) => {
  await page.goto("/?cms=keys");
  await expect(page.locator("html")).toHaveAttribute("data-cms-debug", "keys");
});
