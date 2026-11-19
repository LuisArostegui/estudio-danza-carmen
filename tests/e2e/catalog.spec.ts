import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { isMobileMenu, waitForRevealsSettled } from "./helpers";

const SHOTS_DIR = "test-results/preview-shots";

const familySlug: Record<string, string> = {
  ballet: "clases-de-ballet-granada",
  salud: "salud-corporal",
  otras: "otras-disciplinas",
};

/** Every activity file, read the same way the site does. */
const activities = readdirSync("src/content/activities")
  .filter((file) => file.endsWith(".md"))
  .map((file) => {
    const source = readFileSync(`src/content/activities/${file}`, "utf8");
    const field = (key: string) =>
      source.match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?`, "m"))?.[1] ?? "";
    const id = file.replace(/\.md$/, "");
    const family = field("family");
    return {
      id,
      title: field("title"),
      status: field("status"),
      family,
      order: Number(field("order")),
      path: `/${familySlug[family]}/${id}/`,
      categoryPath: `/${familySlug[family]}/`,
    };
  });

test.describe("catalogue", () => {
  test("19 activity pages, 8 / 5 / 6 per family", () => {
    expect(activities).toHaveLength(19);
    const count = (family: string) =>
      activities.filter((a) => a.family === family).length;
    expect([count("ballet"), count("salud"), count("otras")]).toEqual([
      8, 5, 6,
    ]);
    // No activity is left as a placeholder.
    expect(activities.filter((a) => a.status === "pending")).toEqual([]);
  });

  for (const [family, slug] of Object.entries(familySlug)) {
    test(`/${slug}/ lists its cards, each clickable to its ficha`, async ({
      page,
    }) => {
      await page.goto(`/${slug}/`);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".category-hero__intro")).toBeVisible();
      const cards = page.getByTestId("activity-card");
      const expected = activities
        .filter((a) => a.family === family)
        .sort((a, b) => a.order - b.order);
      await expect(cards).toHaveCount(expected.length);
      await expect(page.getByText("Ficha en preparación")).toHaveCount(0);
      await expect(
        page.locator('.category-presentation a[href="/sobre-nosotros/"]'),
      ).toHaveCount(1);
      await expect(page.getByTestId("enquiry-form")).toBeVisible();
      const options = page.locator('select[name="actividad"] option[value]');
      for (const activity of expected)
        await expect(
          options.locator(`xpath=self::*[@value="${activity.id}"]`),
        ).toHaveCount(1);
      if (family !== "ballet") {
        await expect(page.locator("body")).toHaveAttribute(
          "data-page-status",
          "review",
        );
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
          "content",
          /noindex/,
        );
      }
      await cards.last().click();
      await expect(page).toHaveURL(new RegExp(`${expected.at(-1)!.path}$`));
    });
  }

  for (const activity of activities) {
    test(`ficha ${activity.path}`, async ({ page }) => {
      const response = await page.goto(activity.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("h1")).toHaveText(activity.title);
      expect((await page.title()).length).toBeGreaterThan(10);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        /.{40,}/,
      );
      if (activity.status !== "complete") {
        await expect(page.locator("body")).toHaveAttribute(
          "data-page-status",
          "review",
        );
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
          "content",
          /noindex/,
        );
      }
      await expect(page.locator(".activity-body")).toBeVisible();
      await expect(page.getByText("Ficha en preparación")).toHaveCount(0);
      // Back to category and enquiry with the activity preselected.
      await expect(
        page.locator(`.activity-hero a[href="${activity.categoryPath}"]`),
      ).toBeVisible();
      await expect(page.locator('select[name="actividad"]')).toHaveValue(
        activity.id,
      );
      await expect(page.getByTestId("activity-cta")).toHaveAttribute(
        "href",
        `/contacto/?actividad=${activity.id}`,
      );
      // Optional blocks never render empty.
      const gallery = page.locator(".activity-gallery");
      if (await gallery.count())
        expect(await gallery.locator(".photo").count()).toBeGreaterThan(0);
      for (const summary of await page.locator(".activity-faqs__item").all())
        await expect(summary.locator("p")).not.toHaveText("");
    });
  }

  test("header submenus list every ficha without «en preparación»", async ({
    page,
  }) => {
    await page.goto("/");
    const children = page.locator("#site-navigation .site-nav__child");
    await expect(children).toHaveCount(19);
    await expect(page.locator(".site-nav__pending")).toHaveCount(0);
    const hrefs = await children.evaluateAll((items) =>
      items.map((item) => item.getAttribute("href")),
    );
    expect(hrefs.sort()).toEqual(activities.map((a) => a.path).sort());
  });

  test("menu → category → ficha → consulta", async ({ page }) => {
    await page.goto("/");
    const salud = page.locator("#site-navigation .site-nav__item").nth(1);
    if (await isMobileMenu(page)) {
      await page.locator("[data-menu-button]").click();
      await salud.locator("[data-category-link]").click();
    } else {
      await salud.locator("[data-category-link]").click();
    }
    await expect(page).toHaveURL(/\/salud-corporal\/$/);
    await page
      .getByTestId("activity-card")
      .filter({ hasText: "Pilates" })
      .click();
    await expect(page).toHaveURL(/\/salud-corporal\/pilates\/$/);
    await page.getByTestId("activity-cta").click();
    await expect(page).toHaveURL(/\/contacto\/\?actividad=pilates$/);
    await expect(page.locator('select[name="actividad"]')).toHaveValue(
      "pilates",
    );
  });

  for (const path of [
    "/clases-de-ballet-granada/ballet-junior/",
    "/clases-de-ballet-granada/ballet-nivel-medio/",
  ]) {
    test(`${path} describes the group by level, not by unconfirmed ages`, async ({
      page,
    }) => {
      await page.goto(path);
      const visible = (
        await page
          .locator(
            ".activity-hero, .activity-body, .activity-why, .activity-form",
          )
          .allTextContents()
      ).join(" ");
      expect(visible).not.toMatch(/\b\d{1,2}\s*(?:a|y|–|-)\s*\d{1,2} años/);
      expect(await page.title()).not.toMatch(/\d+ (?:a|–) \d+ años/);
      await expect(page.getByTestId("activity-audience")).toContainText(
        "Escríbenos",
      );
    });
  }

  test("Viernes is an informative ficha with no past calendar claim", async ({
    page,
  }) => {
    await page.goto("/otras-disciplinas/planes-en-granada-los-viernes/");
    const copy = (
      await page
        .locator(".activity-hero, .activity-body, .activity-form")
        .allTextContents()
    ).join(" ");
    expect(copy).not.toContain("septiembre de 2026");
    expect(copy).not.toMatch(/reservar tu viernes|cada mes publicamos/i);
    await expect(page.getByTestId("activity-cta")).toHaveAttribute(
      "href",
      /\/contacto\//,
    );
  });

  for (const path of [
    "/salud-corporal/",
    "/otras-disciplinas/",
    "/clases-de-ballet-granada/diverballet/",
    "/otras-disciplinas/sevillanas/",
  ]) {
    test(`axe and no overflow: ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      await waitForRevealsSettled(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.scrollingElement!.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const mobile = await isMobileMenu(page);
      const name = path.replace(/^\/|\/$/g, "").replace(/\//g, "--");
      await page.screenshot({
        path: `${SHOTS_DIR}/${name}-${mobile ? 390 : 1440}.png`,
        fullPage: true,
      });
    });
  }
});
