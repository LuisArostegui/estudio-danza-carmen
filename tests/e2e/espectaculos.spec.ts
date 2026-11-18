import AxeBuilder from "@axe-core/playwright";
import { readFileSync, readdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { isMobileMenu, waitForRevealsSettled } from "./helpers";

/**
 * /espectaculos/ is built with Elena's dossier copy but stays in review:
 * noindex, data-page-status="review", and never counted as verified.
 */
const PATH = "/espectaculos/";

/** The seven productions, in dossier order, read from the content files. */
const productions = readdirSync("src/content/performances")
  .filter((file) => file.endsWith(".md"))
  .map((file) => {
    const source = readFileSync(`src/content/performances/${file}`, "utf8");
    return {
      slug: file.replace(/\.md$/, ""),
      title: source.match(/^title:\s*"(.*)"\s*$/m)?.[1] ?? "",
      order: Number(source.match(/^order:\s*(\d+)\s*$/m)?.[1]),
      hasPhoto: /^\s+src:\s*\S+/m.test(source),
    };
  })
  .sort((a, b) => a.order - b.order);

const DOSSIER_ORDER = [
  "Mary Poppins",
  "Orquesta Clásica de Granada",
  "Pulgarcita",
  "La Bella y la Bestia",
  "La Bella Durmiente",
  "Alicia en el País de las Maravillas",
  "La leyenda de las Princesas Cisne",
];

const tiles = (page: Page) =>
  page.getByTestId("performance-index").getByRole("link");

test.describe("/espectaculos/ (review)", () => {
  test("content files keep the seven productions in dossier order", () => {
    expect(productions.map((item) => item.title)).toEqual(DOSSIER_ORDER);
  });

  test("is a real page in review: noindex, not pending", async ({ page }) => {
    const response = await page.goto(PATH);
    expect(response?.status()).toBe(200);
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
    await expect(page.locator("h1")).toHaveText("Espectáculos");
    const crumbs = page.getByRole("navigation", { name: "Migas de pan" });
    await expect(crumbs.getByRole("link", { name: "Inicio" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText(
      "Espectáculos",
    );
  });

  test("renders Elena's structure and the seven productions in order", async ({
    page,
  }) => {
    await page.goto(PATH);
    const h2 = page.locator("main h2");
    await expect(
      h2.filter({ hasText: "Mucho más que una actuación de fin de curso" }),
    ).toHaveCount(1);
    await expect(h2.filter({ hasText: "Nuestros espectáculos" })).toHaveCount(
      1,
    );
    await expect(
      h2.filter({ hasText: "Vive la danza también sobre el escenario" }),
    ).toHaveCount(1);
    await expect(page.locator("main h3")).toHaveText(DOSSIER_ORDER);
    for (const { slug } of productions) {
      await expect(page.locator(`article#${slug}`)).toHaveCount(1);
    }
  });

  test("index tiles are real links to each production", async ({ page }) => {
    await page.goto(PATH);
    await expect(tiles(page)).toHaveCount(7);
    for (const [index, { slug, title }] of productions.entries()) {
      await expect(tiles(page).nth(index)).toHaveAttribute("href", `#${slug}`);
      await expect(tiles(page).nth(index)).toHaveAccessibleName(
        new RegExp(title),
      );
    }
  });

  test("hover and keyboard focus reveal the name (hover devices)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(PATH);
    test.skip(
      await page.evaluate(() => matchMedia("(hover: none)").matches),
      "Touch devices keep the names visible",
    );
    const label = (index: number) =>
      tiles(page).nth(index).locator("[data-performance-label]");
    const opacity = (index: number) =>
      label(index).evaluate((el) => getComputedStyle(el).opacity);

    // Drive both tile states explicitly so the test never depends on which
    // productions already have an authorised photo in the content files.
    const setGap = (index: number, gap: boolean) =>
      tiles(page)
        .nth(index)
        .evaluate((el, value) => el.classList.toggle("is-gap", value), gap);

    // Without a photo there is nothing to reveal: the name stays visible.
    await tiles(page).first().scrollIntoViewIfNeeded();
    await setGap(0, true);
    await expect.poll(() => opacity(0)).toBe("1");

    // With a photo the name hides until hover or focus (200 ms veil).
    await setGap(0, false);
    await setGap(1, false);
    await expect.poll(() => opacity(0)).toBe("0");
    expect(
      await label(0).evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe("0.2s");

    await tiles(page).first().hover();
    await expect.poll(() => opacity(0)).toBe("1");
    await page.mouse.move(0, 0);
    await expect.poll(() => opacity(0)).toBe("0");

    await page.keyboard.press("Tab");
    await tiles(page).nth(1).focus();
    await expect.poll(() => opacity(1)).toBe("1");
  });

  test("only tiles without an authorised photo are marked as gaps", async ({
    page,
  }) => {
    await page.goto(PATH);
    for (const [index, { hasPhoto }] of productions.entries()) {
      const classes =
        (await tiles(page).nth(index).getAttribute("class")) ?? "";
      expect(classes.split(/\s+/).includes("is-gap")).toBe(!hasPhoto);
    }
  });

  test("touch devices show every name without interaction", async ({
    page,
  }) => {
    await page.goto(PATH);
    test.skip(
      await page.evaluate(() => !matchMedia("(hover: none)").matches),
      "Only for hover:none (touch) devices",
    );
    const labels = page.locator("[data-performance-label]");
    await expect(labels).toHaveCount(7);
    for (let index = 0; index < 7; index++) {
      await expect(labels.nth(index)).toHaveCSS("opacity", "1");
    }
  });

  test("reduced motion keeps a static view", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(PATH);
    const durations = await page
      .locator("[data-performance-label], [data-performance-index] .photo")
      .evaluateAll((items) =>
        items.map((el) => parseFloat(getComputedStyle(el).transitionDuration)),
      );
    expect(durations.length).toBeGreaterThan(0);
    for (const duration of durations)
      expect(duration).toBeLessThanOrEqual(0.01);
  });

  test("missing photos show a discreet editorial gap, never stock", async ({
    page,
  }) => {
    await page.goto(PATH);
    const withoutPhoto = productions.filter((item) => !item.hasPhoto).length;
    await expect(page.locator("article [data-photo-pending]")).toHaveCount(
      withoutPhoto,
    );
    // Only Carmen's optimised photos (astro:assets) may appear, never stock.
    const sources = await page
      .locator("main img")
      .evaluateAll((items) => items.map((el) => el.getAttribute("src") ?? ""));
    for (const src of sources) expect(src).toMatch(/^\/_astro\//);
  });

  test("closes with a useful link to /contacto/", async ({ page }) => {
    await page.goto(PATH);
    const cta = page.getByTestId("performances-cta").getByRole("link");
    await expect(cta).toHaveAttribute("href", "/contacto/");
    await cta.click();
    await expect(page).toHaveURL(/\/contacto\/$/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("has no axe violations", async ({ page }) => {
    await page.goto(PATH);
    await waitForRevealsSettled(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("Espectáculos in the shared navigation", () => {
  test("the header entry is not marked as pending", async ({ page }) => {
    await page.goto(PATH);
    if (await isMobileMenu(page)) {
      await page.getByRole("button", { name: "Abrir menú" }).click();
    }
    const entry = page
      .locator("#site-navigation [data-category-link]")
      .filter({ hasText: "Espectáculos" });
    await expect(entry).toHaveAttribute("href", PATH);
    await expect(entry).not.toContainText("en preparación");
    await expect(entry).toHaveAttribute("aria-current", "page");
  });

  test("Inicio → Espectáculos → Contacto", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", {
      name: "Descubre nuestros espectáculos",
    });
    await cta.scrollIntoViewIfNeeded();
    await cta.click();
    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    await expect(page.locator("body")).toHaveAttribute(
      "data-page-status",
      "review",
    );
    await page.getByTestId("performances-cta").getByRole("link").click();
    await expect(page).toHaveURL(/\/contacto\/$/);
  });
});
