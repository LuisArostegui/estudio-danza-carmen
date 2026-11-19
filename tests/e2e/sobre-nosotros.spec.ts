import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { isMobileMenu, waitForRevealsSettled } from "./helpers";

const SHOTS_DIR = "test-results/preview-shots";
const PATH = "/sobre-nosotros/";

/**
 * /sobre-nosotros/ carries Elena's dossier copy (00 · pp. 60–64) and stays in
 * review: noindex, data-page-status="review", never counted as verified.
 */
test.describe("/sobre-nosotros/ (review)", () => {
  test("is a real page in review with one H1", async ({ page }) => {
    await page.goto(PATH);
    await expect(page.locator("body")).toHaveAttribute(
      "data-page-status",
      "review",
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(page.locator("[data-pending-page]")).toHaveCount(0);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("Sobre nosotros");
  });

  test("has every linkable section from Elena's structure", async ({
    page,
  }) => {
    await page.goto(PATH);
    for (const id of [
      "historia",
      "metodo",
      "profesorado",
      "rad",
      "escenario",
      "inclusion",
      "instalaciones",
    ]) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    const toc = page.getByRole("navigation", { name: "En esta página" });
    await expect(toc.getByRole("link")).toHaveCount(7);
    await toc.getByRole("link", { name: "Profesorado" }).click();
    await expect(page).toHaveURL(/#profesorado$/);
  });

  test("names Carmen Sánchez as director and keeps unverified facts out of the copy", async ({
    page,
  }) => {
    await page.goto(PATH);
    const team = page.locator("#profesorado");
    await expect(
      team.getByText("Carmen Sánchez", { exact: true }),
    ).toBeVisible();
    await expect(team.getByText(/^Directora/)).toBeVisible();
    // Unverified figures and awards stay out of the public copy (they are
    // listed only in the private preview note).
    const copy = (
      await page
        .locator("section.about-section, .about-hero__text, .about-closing")
        .allTextContents()
    ).join(" ");
    for (const text of [
      "Vive tu Sueño",
      "tres aulas",
      "más de 15 grupos",
      "[Nombre de la profesora]",
    ])
      expect(copy).not.toContain(text);
  });

  test("closes the journey with Ballet, Contacto, RAD and Espectáculos links", async ({
    page,
  }) => {
    await page.goto(PATH);
    const main = page.locator("main");
    await expect(
      main.locator('a[href="/clases-de-ballet-granada/"]').first(),
    ).toBeVisible();
    await expect(main.locator('a[href="/contacto/"]').first()).toBeVisible();
    await expect(main.locator('a[href="/examenes-rad/"]')).toHaveCount(1);
    await expect(main.locator('a[href="/espectaculos/"]')).toHaveCount(1);
  });

  test("Inicio → Sobre nosotros → Contacto", async ({ page }) => {
    await page.goto("/");
    await page.locator('.home-story a[href="/sobre-nosotros/"]').click();
    await expect(page).toHaveURL(/\/sobre-nosotros\/$/);
    await page
      .locator("#contacto-sobre-nosotros")
      .getByRole("link", { name: /Contacta/ })
      .click();
    await expect(page).toHaveURL(/\/contacto\/$/);
  });

  test("passes axe and has no horizontal overflow", async ({ page }) => {
    await page.goto(PATH);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await waitForRevealsSettled(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
    const fits = await page.evaluate(
      () => document.scrollingElement!.scrollWidth <= window.innerWidth,
    );
    expect(fits).toBe(true);
    const mobile = await isMobileMenu(page);
    await page.screenshot({
      path: `${SHOTS_DIR}/sobre-nosotros-${mobile ? 390 : 1440}.png`,
      fullPage: true,
    });
  });
});

test.describe("Inicio · espectáculos gallery", () => {
  test("seven tiles link to /espectaculos/#slug with visible labels", async ({
    page,
  }) => {
    await page.goto("/");
    const tiles = page.getByTestId("show-gallery").locator("a");
    await expect(tiles).toHaveCount(7);
    const hrefs = await tiles.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    );
    expect(hrefs[0]).toBe("/espectaculos/#mary-poppins");
    for (const href of hrefs)
      expect(href).toMatch(/^\/espectaculos\/#[a-z-]+$/);
    await expect(tiles.first()).toHaveAccessibleName("Mary Poppins");

    // Label is visible on focus (keyboard) and on touch / no-photo tiles.
    await tiles.first().focus();
    await expect
      .poll(() =>
        tiles
          .first()
          .locator(".gallery__caption")
          .evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe("1");

    await tiles.nth(2).click();
    await expect(page).toHaveURL(/\/espectaculos\/#pulgarcita$/);
    await expect(page.locator("#pulgarcita")).toBeInViewport();
  });
});

test.describe("header Escape", () => {
  test("pointer over Ballet, focus in Salud corporal: Escape closes Salud and keeps focus there", async ({
    page,
  }) => {
    await page.goto("/");
    test.skip(await isMobileMenu(page), "Desktop dropdown");
    const items = page.locator("#site-navigation .site-nav__item.has-menu");
    const ballet = items.nth(0);
    const salud = items.nth(1);
    const saludLink = salud.locator("[data-category-link]");

    await ballet.locator("[data-category-link]").hover();
    await saludLink.focus();
    await expect(salud.locator(".site-nav__panel")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(salud.locator(".site-nav__panel")).toBeHidden();
    await expect(ballet.locator(".site-nav__panel")).toBeHidden();
    await expect(saludLink).toBeFocused();
  });

  test("hover only: Escape closes the hovered panel without moving focus", async ({
    page,
  }) => {
    await page.goto("/");
    test.skip(await isMobileMenu(page), "Desktop dropdown");
    const ballet = page
      .locator("#site-navigation .site-nav__item.has-menu")
      .first();
    await ballet.locator("[data-category-link]").hover();
    await expect(ballet.locator(".site-nav__panel")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(ballet.locator(".site-nav__panel")).toBeHidden();
    expect(
      await page.evaluate(() => document.activeElement === document.body),
    ).toBe(true);

    // Leaving and re-entering opens it again.
    await page.mouse.move(5, 600);
    await ballet.locator("[data-category-link]").hover();
    await expect(ballet.locator(".site-nav__panel")).toBeVisible();
  });

  test("the six header destinations stay reachable", async ({ page }) => {
    await page.goto("/");
    const links = page.locator("#site-navigation [data-category-link]");
    await expect(links).toHaveCount(6);
    const hrefs = await links.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    );
    expect(hrefs).toEqual([
      "/clases-de-ballet-granada/",
      "/salud-corporal/",
      "/otras-disciplinas/",
      "/espectaculos/",
      "/examenes-rad/",
      "/cursos/",
    ]);
    for (const href of hrefs) {
      const response = await page.request.get(href!);
      expect(response.status()).toBe(200);
    }
  });
});
