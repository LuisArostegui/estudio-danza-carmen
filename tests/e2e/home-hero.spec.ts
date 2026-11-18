import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const SHOTS_DIR = "test-results/preview-shots";

const hero = (page: Page) => page.getByTestId("hero-carousel");
const dots = (page: Page) => page.getByTestId("hero-dot");
const activeIndex = (page: Page) =>
  dots(page).evaluateAll((els) =>
    els.findIndex((el) => el.getAttribute("aria-current") === "true"),
  );
const visibleSlides = (page: Page) =>
  hero(page).locator("[data-slide]:not([aria-hidden='true'])");

test.describe("home hero carousel", () => {
  test("controls change slides, keep exactly one visible and never change the H1", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(dots(page)).toHaveCount(4);
    await expect(hero(page).locator("[data-slide]")).toHaveCount(4);
    const h1 = page.locator("h1");
    const title = await h1.innerText();
    expect(await activeIndex(page)).toBe(0);
    await expect(visibleSlides(page)).toHaveCount(1);

    await page.getByTestId("hero-next").click();
    expect(await activeIndex(page)).toBe(1);
    await expect(visibleSlides(page)).toHaveCount(1);
    expect(await h1.innerText()).toBe(title);

    await page.getByTestId("hero-prev").click();
    expect(await activeIndex(page)).toBe(0);

    await dots(page).nth(2).click();
    await expect(dots(page).nth(2)).toHaveAttribute("aria-current", "true");
    expect(await activeIndex(page)).toBe(2);
    await expect(visibleSlides(page)).toHaveCount(1);

    await page.getByTestId("hero-next").focus();
    await page.keyboard.press("ArrowRight");
    expect(await activeIndex(page)).toBe(3);
    await page.keyboard.press("ArrowLeft");
    expect(await activeIndex(page)).toBe(2);
    await expect(visibleSlides(page)).toHaveCount(1);
    expect(await h1.innerText()).toBe(title);
  });

  test("only the first slide image is eager", async ({ page }) => {
    await page.goto("/");
    const loading = await hero(page)
      .locator("[data-slide]")
      .evaluateAll((slides) =>
        slides.map((s) => s.querySelector("img")?.getAttribute("loading")),
      );
    expect(loading).toHaveLength(4);
    expect(loading[0]).not.toBe("lazy");
    for (const l of loading.slice(1)) expect(l).toBe("lazy");
  });

  test("autoplays every 6s and stops after Pausar fotos", async ({ page }) => {
    await page.clock.install();
    await page.goto("/");
    expect(await activeIndex(page)).toBe(0);

    await page.clock.runFor(6500);
    expect(await activeIndex(page)).toBe(1);

    const pause = page.getByTestId("hero-pause");
    await expect(pause).toHaveAccessibleName("Pausar fotos");
    await pause.click();
    await expect(pause).toHaveAccessibleName("Reanudar fotos");
    // Move the pointer away so hover does not mask the paused state.
    await page.mouse.move(0, 0);
    await page.clock.runFor(13000);
    expect(await activeIndex(page)).toBe(1);
  });

  test("pauses while hovered", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "hover is a desktop pointer behaviour");
    await page.clock.install();
    await page.goto("/");
    await hero(page).hover();
    await page.clock.runFor(13000);
    expect(await activeIndex(page)).toBe(0);
  });

  test("reduced motion: no autoplay, paused label, no copy animation", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.clock.install();
    await page.goto("/");

    await expect(page.getByTestId("hero-pause")).toHaveAccessibleName(
      "Reanudar fotos",
    );
    await page.clock.runFor(13000);
    expect(await activeIndex(page)).toBe(0);

    const motion = await page
      .locator(".home-hero__copy > *")
      .evaluateAll((els) =>
        els.map((el) => {
          const s = getComputedStyle(el);
          return { name: s.animationName, duration: s.animationDuration };
        }),
      );
    expect(motion.length).toBeGreaterThan(0);
    for (const m of motion) {
      const seconds = parseFloat(m.duration);
      expect(m.name === "none" || seconds <= 0.01, JSON.stringify(m)).toBe(
        true,
      );
    }
  });

  test("with motion allowed the hero copy has a one-time reveal", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await expect(page.locator(".home-hero__copy > h1")).toHaveCSS(
      "animation-name",
      "hero-rise",
    );
  });

  test("mobile fold: CTAs above 844px, clear of controls, targets >= 44px", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "mobile only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(100);

    const ctas = page.locator(".home-hero__actions a");
    await expect(ctas).toHaveCount(2);
    const controls = await page.locator(".home-hero__controls").boundingBox();
    expect(controls).not.toBeNull();

    for (let i = 0; i < 2; i++) {
      const box = await ctas.nth(i).boundingBox();
      expect(box, `CTA ${i}`).not.toBeNull();
      expect(box!.y + box!.height, `CTA ${i} bottom`).toBeLessThanOrEqual(844);
      const overlaps =
        box!.x < controls!.x + controls!.width &&
        box!.x + box!.width > controls!.x &&
        box!.y < controls!.y + controls!.height &&
        box!.y + box!.height > controls!.y;
      expect(overlaps, `CTA ${i} overlaps controls`).toBe(false);
    }

    const buttons = hero(page).locator(".home-hero__controls button");
    const n = await buttons.count();
    expect(n).toBe(7);
    for (let i = 0; i < n; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box!.width, `control ${i} width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `control ${i} height`).toBeGreaterThanOrEqual(44);
    }
  });

  test("desktop hero height is between 520 and 700px", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1440", "desktop only");
    await page.goto("/");
    const box = await hero(page).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(520);
    expect(box!.height).toBeLessThanOrEqual(700);
  });

  test("fold screenshots for each slide", async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    for (let i = 1; i <= 4; i++) {
      if (i > 1) await page.getByTestId("hero-next").click();
      await page.evaluate(async (n) => {
        const img =
          document.querySelectorAll<HTMLImageElement>("[data-slide] img")[
            n - 1
          ];
        img.loading = "eager";
        if (!img.complete)
          await new Promise((r) => {
            img.addEventListener("load", r, { once: true });
            img.addEventListener("error", r, { once: true });
          });
      }, i);
      await page.waitForTimeout(150);
      await page.screenshot({
        path: `${SHOTS_DIR}/home-slide${i}-${testInfo.project.name}-fold.png`,
      });
    }
  });
});

test.describe("headline variant ?titulo=serif", () => {
  test("serif variant switches H1 and section titles; default stays Montserrat", async ({
    page,
  }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    expect(await h1.evaluate((e) => getComputedStyle(e).fontFamily)).toContain(
      "Montserrat",
    );
    await expect(h1).toHaveCSS("text-transform", "uppercase");
    await expect(page.locator("html")).not.toHaveAttribute("data-titulo", /.*/);

    await page.goto("/?titulo=serif");
    await expect(page.locator("html")).toHaveAttribute("data-titulo", "serif");
    expect(await h1.evaluate((e) => getComputedStyle(e).fontFamily)).toContain(
      "Cormorant",
    );
    await expect(h1).toHaveCSS("text-transform", "none");

    const title = page.locator("main .section-title").first();
    expect(
      await title.evaluate((e) => getComputedStyle(e).fontFamily),
    ).toContain("Cormorant");
    await expect(title).toHaveCSS("text-transform", "none");
  });

  test("axe finds no violations on /?titulo=serif", async ({ page }) => {
    await page.goto("/?titulo=serif");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("fold screenshot", async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/?titulo=serif");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({
      path: `${SHOTS_DIR}/home-serif-${testInfo.project.name}-fold.png`,
    });
  });
});

test("ballet landing: first two activity cards sit side by side at 360px", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390", "mobile only");
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/clases-de-ballet-granada/");

  const cards = page.getByTestId("activity-cards").getByTestId("activity-card");
  const a = await cards.nth(0).boundingBox();
  const b = await cards.nth(1).boundingBox();
  expect(Math.abs(a!.y - b!.y), "same top").toBeLessThanOrEqual(1);
  expect(b!.x).toBeGreaterThan(a!.x + a!.width - 1);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
