import { expect, test, type Page } from "@playwright/test";
import { ADULTOS_PATH, isMobileMenu } from "./helpers";

/**
 * Cross-engine and reflow checks (#32, #33 preliminary). Runs in the default
 * Chromium projects and in the opt-in Firefox/WebKit projects
 * (`PLAYWRIGHT_ENGINES=firefox,webkit`).
 *
 * 200 % zoom is emulated as the CSS viewport a 1440x900 window has at 200 %
 * (720x450, device scale 2). It is layout-equivalent, not the browser's own
 * zoom control.
 */

const REPRESENTATIVE_ROUTES = [
  "/",
  "/clases-de-ballet-granada/",
  ADULTOS_PATH,
  "/contacto/?actividad=ballet-para-adultos",
  "/sobre-nosotros/",
  "/espectaculos/",
  "/horarios/",
  "/cursos/",
];

const REFLOW_SIZES = [
  { label: "narrow-320", width: 320, height: 640 },
  { label: "zoom-200", width: 720, height: 450 },
] as const;

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const limit = document.documentElement.clientWidth;
    const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
      .filter((el) => {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden")
          return false;
        // Elements clipped by an ancestor do not scroll the page.
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === "hidden" || o === "clip" || o === "auto" || o === "scroll")
            return false;
        }
        return el.getBoundingClientRect().right > limit + 1;
      })
      .slice(0, 5)
      .map(
        (el) =>
          `${el.tagName.toLowerCase()}.${[...el.classList].join(".")} → ${Math.round(el.getBoundingClientRect().right)}`,
      );
    return {
      scrollWidth: document.scrollingElement!.scrollWidth,
      clientWidth: limit,
      offenders,
    };
  });
}

/** Distance from the top of the viewport to the element, minus the header. */
async function clearOfHeader(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const header = document.querySelector("[data-site-header]");
    const headerBottom =
      header && getComputedStyle(header).position.match(/sticky|fixed/)
        ? header.getBoundingClientRect().bottom
        : 0;
    const target = document.querySelector(sel)!;
    const heading = target.querySelector("h2, h3") ?? target;
    const rect = heading.getBoundingClientRect();
    return {
      headingTop: rect.top,
      headerBottom,
      inView: rect.top < window.innerHeight && rect.bottom > 0,
    };
  }, selector);
}

test.describe("reflow at narrow width and 200 % zoom", () => {
  // Sizes are set per test; one run per project is enough.
  for (const size of REFLOW_SIZES) {
    for (const route of REPRESENTATIVE_ROUTES) {
      test(`${size.label}: ${route} has no horizontal scroll`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: size.width, height: size.height });
        await page.goto(route);
        const result = await horizontalOverflow(page);
        expect(
          result.scrollWidth,
          `offenders: ${result.offenders.join(", ")}`,
        ).toBeLessThanOrEqual(result.clientWidth);
      });
    }

    test(`${size.label}: menu, chevron and form stay usable`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto("/");
      expect(await isMobileMenu(page)).toBe(true);

      const button = page.locator("[data-menu-button]");
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      const chevron = page
        .locator("#site-navigation .site-nav__item")
        .first()
        .locator("[data-submenu-toggle]");
      await chevron.click();
      const child = page
        .locator("#site-navigation .site-nav__item")
        .first()
        .getByRole("link", { name: /Ballet para adultos/ });
      await child.scrollIntoViewIfNeeded();
      await expect(child).toBeInViewport();
      const box = await child.boundingBox();
      expect(box!.x + box!.width).toBeLessThanOrEqual(size.width);
      await child.click();
      await expect(page).toHaveURL(new RegExp(`${ADULTOS_PATH}$`));

      await page.goto("/contacto/");
      const submit = page.getByRole("button", { name: "Enviar consulta" });
      await submit.scrollIntoViewIfNeeded();
      await submit.click();
      await expect(page.getByTestId("enquiry-errors")).toBeFocused();
      await expect(page.getByTestId("enquiry-errors")).toBeInViewport();
    });
  }
});

test.describe("core journey with touch and keyboard", () => {
  test("Inicio → menu → landing → ficha → Contacto preselected", async ({
    page,
  }) => {
    await page.goto("/");
    const item = page.locator("#site-navigation .site-nav__item").first();
    if (await isMobileMenu(page)) {
      await page.locator("[data-menu-button]").click();
      const chevron = item.locator("[data-submenu-toggle]");
      if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches))
        await chevron.tap();
      else await chevron.click();
      await expect(chevron).toHaveAttribute("aria-expanded", "true");
      await expect(item.locator(".site-nav__panel a")).toHaveCount(8);
    } else {
      await item.locator("[data-category-link]").hover();
      await expect(item.locator(".site-nav__panel")).toBeVisible();
    }
    await item.locator("[data-category-link]").click();
    await expect(page).toHaveURL(/\/clases-de-ballet-granada\/$/);

    await page
      .getByTestId("activity-card")
      .filter({ hasText: "Ballet para adultos" })
      .click();
    await expect(page).toHaveURL(new RegExp(`${ADULTOS_PATH}$`));
    await page.getByTestId("activity-cta").first().click();
    await expect(page).toHaveURL(/\?actividad=ballet-para-adultos$/);
    await expect(page.locator('select[name="actividad"]')).toHaveValue(
      "ballet-para-adultos",
    );
  });

  test("fichas open directly by URL", async ({ page }) => {
    for (const path of [
      ADULTOS_PATH,
      "/clases-de-ballet-granada/ballet-junior/",
      "/salud-corporal/",
      "/otras-disciplinas/",
    ]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }
  });
});

test.describe("in-page anchors", () => {
  test("every Inicio show tile resolves to a production on Espectáculos", async ({
    page,
  }) => {
    await page.goto("/");
    const hrefs = await page
      .getByTestId("show-gallery")
      .locator("a")
      .evaluateAll((items) => items.map((item) => item.getAttribute("href")!));
    expect(hrefs).toHaveLength(7);
    await page.goto("/espectaculos/");
    for (const href of hrefs) {
      const id = href.split("#")[1]!;
      await expect(page.locator(`[id="${id}"]`), href).toHaveCount(1);
    }

    const last = hrefs.at(-1)!;
    await page.goto(last);
    const position = await clearOfHeader(page, `[id="${last.split("#")[1]}"]`);
    expect(position.inView).toBe(true);
    expect(position.headingTop).toBeGreaterThanOrEqual(
      position.headerBottom - 1,
    );
  });

  for (const id of ["profesorado", "instalaciones"]) {
    test(`/sobre-nosotros/#${id} lands clear of the sticky header`, async ({
      page,
    }) => {
      await page.goto(`/sobre-nosotros/#${id}`);
      await expect(page.locator(`section#${id}`)).toBeVisible();
      const position = await clearOfHeader(page, `section#${id}`);
      expect(position.inView).toBe(true);
      expect(position.headingTop).toBeGreaterThanOrEqual(
        position.headerBottom - 1,
      );
    });
  }
});

test.describe("empty states", () => {
  test("Cursos shows the empty state or cards, never both", async ({
    page,
  }) => {
    await page.goto("/cursos/");
    const cards = await page.getByTestId("course-card").count();
    const empty = page.getByTestId("courses-empty");
    if (cards === 0) await expect(empty).toBeVisible();
    else await expect(empty).toHaveCount(0);
  });

  // The public build's empty state (example data hidden) is checked on the
  // HTML by `pnpm check:public`; the preview build shows the example table.
  test("Horarios shows exactly one of timetable or empty state", async ({
    page,
  }) => {
    await page.goto("/horarios/");
    const example =
      (await page
        .locator(".timetable-page")
        .getAttribute("data-schedule-example")) === "true";
    if (example)
      await expect(page.getByTestId("schedule-example-note")).toBeVisible();
    const table = await page.getByTestId("timetable").count();
    const empty = await page.getByTestId("schedule-empty").count();
    expect(table + empty).toBe(1);
    await expect(
      page.getByTestId(table ? "timetable" : "schedule-empty"),
    ).toBeVisible();
  });
});
