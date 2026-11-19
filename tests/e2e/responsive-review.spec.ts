import { expect, test, type Page } from "@playwright/test";
import { readdirSync } from "node:fs";

/**
 * Responsive review (#32): the two Playwright projects cover 390 and 1440 px;
 * this spec adds the 768 px tablet width and checks legibility of text laid
 * over photos. Each test runs once (desktop project) and sets its own size.
 */

const SHOTS_DIR = "test-results/preview-shots";
const WIDTHS = [390, 768, 1024, 1025, 1050, 1080, 1280, 1440] as const;

/** Every generated page, read from `dist/` (built before Playwright runs). */
function builtRoutes(dir = "dist", prefix = "/"): string[] {
  const entries = readdirSync(dir);
  const routes = entries.includes("index.html") ? [prefix] : [];
  for (const entry of entries) {
    if (entry.includes(".") || entry === "_astro") continue;
    routes.push(...builtRoutes(`${dir}/${entry}`, `${prefix}${entry}/`));
  }
  return routes;
}

async function showSlide(page: Page, index: number) {
  await page.evaluate((n) => {
    const root = document.querySelector<HTMLElement>(
      "[data-testid='hero-carousel']",
    )!;
    const slides = [...root.querySelectorAll<HTMLElement>("[data-slide]")];
    root
      .querySelectorAll<HTMLElement>("[data-slide], .home-hero__scrim")
      .forEach((el) => (el.style.transition = "none"));
    slides.forEach((el, i) => el.classList.toggle("is-active", i === n));
    root.dataset.tone = slides[n]!.dataset.tone ?? "dark";
  }, index);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(resolve)),
  );
}

type TextSample = { label: string; large: boolean; worst: number };

/**
 * Worst contrast between each text element's colour and the pixels behind
 * its line boxes: the text is made transparent, the line boxes are
 * screenshotted, and every fourth pixel is compared with the text colour.
 */
async function textContrast(
  page: Page,
  selector: string,
): Promise<TextSample[]> {
  const targets = await page.$$eval(selector, (els) =>
    els.map((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const style = getComputedStyle(el);
      const size = parseFloat(style.fontSize);
      return {
        label: (el.textContent ?? "").trim().slice(0, 32),
        color: style.color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number),
        large: size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700),
        rects: [...range.getClientRects()]
          .filter((r) => r.width >= 2 && r.height >= 2)
          .map((r) => ({
            x: r.x,
            y: r.y + window.scrollY,
            width: r.width,
            height: r.height,
          })),
      };
    }),
  );
  const hide = await page.addStyleTag({
    content: `${selector}, ${selector} * { color: transparent !important; text-shadow: none !important; }`,
  });
  const samples: TextSample[] = [];
  for (const target of targets) {
    let worst = Infinity;
    for (const clip of target.rects) {
      const png = await page.screenshot({ clip, fullPage: true });
      const ratio = await page.evaluate(
        async ({ b64, color }) => {
          const blob = await (
            await fetch(`data:image/png;base64,${b64}`)
          ).blob();
          const bitmap = await createImageBitmap(blob);
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(bitmap, 0, 0);
          const data = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
          const channel = (v: number) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          };
          const lum = (r: number, g: number, b: number) =>
            0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
          const text = lum(color[0]!, color[1]!, color[2]!);
          let min = Infinity;
          for (let p = 0; p < data.length; p += 16) {
            const bg = lum(data[p]!, data[p + 1]!, data[p + 2]!);
            const r = (Math.max(text, bg) + 0.05) / (Math.min(text, bg) + 0.05);
            if (r < min) min = r;
          }
          return min;
        },
        { b64: png.toString("base64"), color: target.color },
      );
      worst = Math.min(worst, ratio);
    }
    samples.push({ label: target.label, large: target.large, worst });
  }
  await hide.evaluate((node) => (node as Element).remove());
  return samples;
}

test.describe("responsive review at 390, 768 and 1440 px", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop-1440",
      "sets its own viewport; runs once",
    );
  });

  test("no built page overflows horizontally at 768 px", async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 768, height: 1024 });
    const routes = builtRoutes();
    expect(routes.length).toBeGreaterThan(20);
    const overflowing: string[] = [];
    for (const route of routes) {
      await page.goto(route);
      const fits = await page.evaluate(
        () => document.scrollingElement!.scrollWidth <= window.innerWidth,
      );
      if (!fits) overflowing.push(route);
    }
    expect(overflowing).toEqual([]);
  });

  for (const width of WIDTHS) {
    test(`hero arrows never cover the hero copy at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      const copy = (await page.locator(".home-hero__copy").boundingBox())!;
      for (const id of ["hero-prev", "hero-next"]) {
        const arrow = (await page.getByTestId(id).boundingBox())!;
        const overlaps =
          arrow.x < copy.x + copy.width &&
          arrow.x + arrow.width > copy.x &&
          arrow.y < copy.y + copy.height &&
          arrow.y + arrow.height > copy.y;
        expect(overlaps, `${id} overlaps the hero copy`).toBe(false);
      }
    });

    test(`hero text stays legible over every slide at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      const count = await page
        .getByTestId("hero-carousel")
        .locator("[data-slide]")
        .count();
      for (let i = 0; i < count; i++) {
        await showSlide(page, i);
        await page.getByTestId("hero-carousel").screenshot({
          path: `${SHOTS_DIR}/hero-slide-${i + 1}-${width}.png`,
        });
        const samples = await textContrast(
          page,
          ".home-hero__copy :is(.eyebrow, h1, p)",
        );
        expect(samples.length).toBe(3);
        for (const s of samples) {
          expect(
            s.worst,
            `slide ${i + 1} · «${s.label}» (${testInfo.project.name})`,
          ).toBeGreaterThanOrEqual(s.large ? 3 : 4.5);
        }
      }
    });
  }
});
