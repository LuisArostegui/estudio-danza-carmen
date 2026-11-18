import { expect, test } from "@playwright/test";
import { VERIFIED_PAGES } from "./helpers";

/**
 * Arabesque-style section title, rebuilt as a Carmen component:
 * a decorative script word sitting behind the heading, an uppercase
 * Montserrat heading and a 140px hairline rule that draws in on scroll.
 */

for (const { slug, path } of VERIFIED_PAGES) {
  test(`${slug}: every section heading uses the shared section title`, async ({
    page,
  }) => {
    await page.goto(path);

    const stray = await page
      .locator("main .section-title")
      .evaluateAll(
        (headings) =>
          headings.filter((h) => !h.closest("[data-section-title]")).length,
      );
    expect(stray, "headings outside <SectionTitle>").toBe(0);

    const blocks = page.locator("main [data-section-title]");
    const count = await blocks.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index++) {
      const block = blocks.nth(index);
      const heading = block.locator(".section-title");
      await expect(heading).toHaveCount(1);
      await expect(heading).toHaveCSS("text-transform", "uppercase");
      await expect(heading).toHaveCSS("font-weight", "500");

      const rule = block.locator(".section-rule");
      await expect(rule).toHaveAttribute("aria-hidden", "true");
      await expect(rule).toHaveCSS("width", "140px");
    }
  });
}

test("the script accent is decorative and tucks behind the heading", async ({
  page,
}) => {
  await page.goto("/");
  const accents = page.locator("main [data-section-title] .script-accent");
  const count = await accents.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index++) {
    const accent = accents.nth(index);
    await expect(accent).toHaveAttribute("aria-hidden", "true");
    // Painted as generated content with empty alt text: visible, but not
    // DOM text, so it is neither announced nor contrast-checked as copy.
    await expect(accent).toHaveText("");
    const painted = await accent.evaluate(
      (el) => getComputedStyle(el, "::before").content,
    );
    expect(painted).toContain(await accent.getAttribute("data-accent"));
    await accent.scrollIntoViewIfNeeded();

    const { overlap, accentZ, headingZ } = await accent.evaluate((el) => {
      const heading = el.parentElement!.querySelector(".section-title")!;
      const a = el.getBoundingClientRect();
      const h = heading.getBoundingClientRect();
      return {
        overlap: a.bottom - h.top,
        accentZ: Number(getComputedStyle(el).zIndex) || 0,
        headingZ: Number(getComputedStyle(heading).zIndex) || 0,
      };
    });
    expect(overlap, "accent overlaps the heading").toBeGreaterThan(4);
    expect(headingZ, "heading paints above the accent").toBeGreaterThan(
      accentZ,
    );
  }
});

test("motion tokens follow the Arabesque timing", async ({ page }) => {
  await page.goto("/");
  const tokens = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement);
    const read = (name: string) => s.getPropertyValue(name).trim();
    return {
      fast: read("--motion-duration-fast"),
      base: read("--motion-duration-base"),
      image: read("--motion-ease-image")
        .replace(/\s+/g, "")
        .replace(/(^|[(,])\./g, "$10."),
    };
  });
  // The minifier may write 200ms as .2s; compare in milliseconds.
  const ms = (value: string) =>
    value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000;
  expect(ms(tokens.fast)).toBe(200);
  expect(ms(tokens.base)).toBe(300);
  expect(tokens.image).toBe("cubic-bezier(0.27,0.76,0.72,0.9)");
});

test.describe("section rule draw-in", () => {
  test("draws in on scroll when motion is allowed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const name = await page
      .locator("main [data-section-title] .section-rule")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe("section-rule-draw");
  });

  test("is static with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const rule = page
      .locator("main [data-section-title] .section-rule")
      .first();
    const name = await rule.evaluate(
      (el) => getComputedStyle(el).animationName,
    );
    expect(name).toBe("none");
    await expect(rule).toHaveCSS("transform", "none");
  });
});
