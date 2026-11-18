import AxeBuilder from "@axe-core/playwright";
import { waitForRevealsSettled } from "./helpers";
import { expect, test, type Page } from "@playwright/test";

const SHOTS_DIR = "test-results/preview-shots";

const testimonials = (page: Page) => page.getByTestId("home-testimonials");
const slides = (page: Page) => testimonials(page).locator("[data-slide]");
const activeIndex = (page: Page) =>
  slides(page).evaluateAll((els) =>
    els.findIndex((el) => el.hasAttribute("data-active")),
  );

/** Scroll through the whole page so lazy images and reveals settle. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(300, window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 300));
    document
      .querySelectorAll<HTMLImageElement>("img[loading='lazy']")
      .forEach((img) => (img.loading = "eager"));
    await Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? null
          : new Promise((r) => {
              img.addEventListener("load", r, { once: true });
              img.addEventListener("error", r, { once: true });
            }),
      ),
    );
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
}

test("home reasons show four distinct ballet illustrations in order", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const icons = page.locator(".home-reasons img.reason__icon");
  await expect(icons).toHaveCount(4);
  for (const [index, pose] of [
    "assemble",
    "penche",
    "echappe",
    "retire",
  ].entries()) {
    const icon = icons.nth(index);
    await icon.scrollIntoViewIfNeeded();
    await expect(icon).toHaveAttribute("alt", "");
    await expect(icon).toHaveAttribute(
      "src",
      new RegExp(`ballet-${pose}\\..+\\.svg$`),
    );
    await expect
      .poll(() => icon.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBe(147);
  }
});

test.describe("home testimonials", () => {
  test("while every review is a placeholder: one slide, no controls, no fake numbering, no autoplay", async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto("/");
    await expect(slides(page)).toHaveCount(1);
    await expect(slides(page).first()).toContainText(
      "Reseña pendiente de incorporar",
    );
    const section = testimonials(page);
    for (const name of [
      "Reseña anterior",
      "Reseña siguiente",
      /^Ir a la reseña/,
    ]) {
      await expect(section.getByRole("button", { name })).toHaveCount(0);
    }
    await expect(section).not.toContainText(/Reseña \d+ de \d+/);
    await page.clock.runFor(30000);
    expect(await activeIndex(page)).toBe(0);
  });

  test("when two or more real reviews exist the carousel navigates with one active, inert elsewhere", async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto("/");
    const next = testimonials(page).getByRole("button", {
      name: "Reseña siguiente",
    });
    const prev = testimonials(page).getByRole("button", {
      name: "Reseña anterior",
    });
    const count = await slides(page).count();
    test.skip(
      count < 2 || !(await next.isVisible()),
      "Carousel is intentionally absent until two real reviews exist (content has only placeholders).",
    );

    const dots = testimonials(page).getByRole("button", {
      name: /^Ir a la reseña \d+$/,
    });
    await expect(dots).toHaveCount(count);
    const inertStates = () =>
      slides(page).evaluateAll((els) =>
        els.map((el) => (el as HTMLElement).inert),
      );
    expect(await activeIndex(page)).toBe(0);
    expect((await inertStates()).filter((i) => !i)).toHaveLength(1);

    await next.click();
    expect(await activeIndex(page)).toBe(1);
    expect((await inertStates())[1]).toBe(false);
    await prev.click();
    expect(await activeIndex(page)).toBe(0);
    await prev.click();
    expect(await activeIndex(page), "wraps backwards").toBe(count - 1);
    await dots.nth(1).click();
    expect(await activeIndex(page)).toBe(1);
    await expect(dots.nth(1)).toHaveAttribute("aria-current", "true");
    await page.clock.runFor(30000);
    expect(await activeIndex(page), "no autoplay").toBe(1);
  });
});

test.describe("home gift and Instagram", () => {
  test("gift button links to the pending /regala-danza/ page", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page.getByTestId("home-gift").getByRole("link");
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute("href", "/regala-danza/");
    // The target page is still pending, so the section says so.
    await expect(page.getByTestId("home-gift")).toContainText("Próximamente");
  });

  test("Instagram link opens the school profile safely", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", {
      name: "Síguenos en Instagram (@danza_carmen)",
    });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute(
      "href",
      "https://www.instagram.com/danza_carmen/",
    );
    await expect(link).toHaveAttribute("target", "_blank");
    const rel = await link.getAttribute("rel");
    expect(rel).toContain("noopener");
  });
});

test.describe("click-to-load map", () => {
  for (const path of ["/", "/contacto/"]) {
    test(`no OpenStreetMap request until "Ver mapa" is clicked on ${path}`, async ({
      page,
    }) => {
      const osm: string[] = [];
      page.on("request", (req) => {
        if (req.url().includes("openstreetmap.org")) osm.push(req.url());
      });
      await page.goto(path);
      await page.waitForLoadState("load");
      await scrollThrough(page);
      expect(osm, "requests before click").toEqual([]);
      await expect(
        page
          .getByText("Al cargar el mapa se conecta con OpenStreetMap.")
          .first(),
      ).toBeVisible();
      await expect(page.locator("iframe")).toHaveCount(0);

      const button = page.getByRole("button", { name: "Ver mapa" }).first();
      await button.scrollIntoViewIfNeeded();
      await button.click();
      const frame = page.locator(
        'iframe[title="Mapa: Estudio de Danza Carmen"]',
      );
      await expect(frame).toHaveCount(1);
      await expect(frame).toHaveAttribute("sandbox", /.+/);
      await expect(frame).toBeFocused();
      await expect(frame).toHaveAttribute(
        "src",
        /^https:\/\/www\.openstreetmap\.org\//,
      );
      await expect.poll(() => osm.length).toBeGreaterThan(0);
    });
  }
});

test("contact page exposes a hidden heading for contact details and map", async ({
  page,
}) => {
  await page.goto("/contacto/");
  await expect(
    page.getByRole("heading", { name: "Datos de contacto y mapa", level: 2 }),
  ).toHaveCount(1);
});

test.describe("scroll reveal", () => {
  test("data-reveal elements fade in once scrolled into view", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/js-reveal/);
    const item = page.getByTestId("home-gift").locator("[data-reveal]").first();
    await expect(item).toHaveCSS("opacity", "0");
    await item.scrollIntoViewIfNeeded();
    await expect(item).toHaveCSS("opacity", "1");
    await expect(item).toHaveClass(/is-revealed/);
  });

  test("reduced motion: reveal elements are visible immediately", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/js-reveal/);
    const opacities = await page
      .locator("[data-reveal]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(opacities.length).toBeGreaterThan(5);
    for (const o of opacities) expect(o).toBe("1");
  });
});

test.describe("palette ?paleta=escenario", () => {
  const reasonsBg = (page: Page) =>
    page
      .locator("section.home-reasons")
      .evaluate((el) => getComputedStyle(el).backgroundColor);

  test("sets the attribute and changes the dark block background", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-paleta", /.*/);
    const base = await reasonsBg(page);

    await page.goto("/?paleta=escenario");
    await expect(page.locator("html")).toHaveAttribute(
      "data-paleta",
      "escenario",
    );
    const stage = await reasonsBg(page);
    expect(stage).not.toBe(base);
  });

  test("axe finds no violations on /?paleta=escenario", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?paleta=escenario");
    await waitForRevealsSettled(page);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
});

test.describe("preview screenshots", () => {
  for (const [label, query] of [
    ["default", "/"],
    ["escenario", "/?paleta=escenario"],
  ] as const) {
    test(`full home ${label}`, async ({ page }, testInfo) => {
      test.setTimeout(90000);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(query);
      await scrollThrough(page);
      await page.screenshot({
        path: `${SHOTS_DIR}/home-full-${label}-${testInfo.project.name}.png`,
        fullPage: true,
      });
    });
  }

  test("contact with the map open", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/contacto/");
    await page.getByRole("button", { name: "Ver mapa" }).click();
    const frame = page.locator("iframe");
    await expect(frame).toHaveCount(1);
    await frame.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: `${SHOTS_DIR}/contacto-map-open-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
