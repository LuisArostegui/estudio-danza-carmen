import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { isMobileMenu, waitForRevealsSettled } from "./helpers";

const SHOTS_DIR = "test-results/preview-shots";

async function expectReview(page: Page, h1: string) {
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
  await expect(page.locator("h1")).toHaveText(h1);
}

/** Public copy only: the private preview note lists the unconfirmed facts. */
async function publicCopy(page: Page) {
  return (
    await page
      .locator(".info-hero__intro, .info-section, .info-closing, .courses")
      .allTextContents()
  ).join(" ");
}

test.describe("/examenes-rad/ (review)", () => {
  test("explains the process and links to a consulta", async ({ page }) => {
    await page.goto("/examenes-rad/");
    await expectReview(page, "Exámenes RAD");
    await expect(page.locator("#proceso .info-steps__item")).toHaveCount(3);
    await expect(
      page.locator('.info-closing a[href="/contacto/"]'),
    ).toBeVisible();
  });

  test("keeps unconfirmed accreditation, venue and figures out of the copy", async ({
    page,
  }) => {
    await page.goto("/examenes-rad/");
    const copy = await publicCopy(page);
    for (const text of [
      "examinador oficial",
      "centro preparador",
      "230.000",
      "80 países",
      "1920",
      "en nuestra escuela",
      "30 y 40 minutos",
      "primera academia",
    ])
      expect(copy, text).not.toContain(text);
  });
});

test.describe("/cursos/ (review)", () => {
  // Rendering of each course case (empty, bookable, date to confirm, past)
  // is checked with fixture data by `pnpm check:courses`. Here the real page
  // must be consistent with whatever courses the school has published.
  test("shows either upcoming courses or the empty state, never both", async ({
    page,
  }) => {
    await page.goto("/cursos/");
    await expectReview(page, "Cursos y talleres de danza en Granada");
    const cards = page.getByTestId("course-card");
    const empty = page.getByTestId("courses-empty");
    if ((await cards.count()) === 0) {
      await expect(empty).toBeVisible();
      await expect(empty).toContainText(
        "¡Estamos preparando nuevas actividades!",
      );
      await expect(empty.getByRole("link")).toHaveAttribute(
        "href",
        "/contacto/",
      );
    } else {
      await expect(empty).toHaveCount(0);
      // Every upcoming card offers exactly one way to ask or book.
      for (const card of await cards.all())
        await expect(
          card.locator(
            '[data-testid="course-book"], [data-testid="course-ask"]',
          ),
        ).toHaveCount(1);
    }
    // Past courses never offer a link.
    await expect(page.getByTestId("past-course-card").locator("a")).toHaveCount(
      0,
    );
    const copy = await publicCopy(page);
    expect(copy).not.toContain("no tenemos cursos con inscripciones abiertas");
    expect(copy).not.toContain("Plantilla de curso");
  });
});

test.describe("/regala-danza/ (review)", () => {
  test("is informative with a consulta CTA and no invented terms", async ({
    page,
  }) => {
    await page.goto("/regala-danza/");
    await expectReview(page, "Regala danza");
    await expect(
      page.locator('.info-closing a[href="/contacto/"]'),
    ).toBeVisible();
    const copy = await publicCopy(page);
    expect(copy).not.toMatch(/€|validez de|caduca/i);
    // No voucher is confirmed yet: the page invites to ask, it offers nothing.
    expect(copy).not.toMatch(
      /contamos con bonos|bonos regalo|regalar una plaza/i,
    );
    expect(copy).toContain("Escríbenos");
  });
});

test.describe("/horarios/", () => {
  test("timetable fits the phone width", async ({ page }) => {
    await page.goto("/horarios/");
    expect(
      await page.evaluate(
        () => document.scrollingElement!.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
});

test.describe("404", () => {
  test("an unknown route returns HTTP 404 with the custom error view", async ({
    page,
  }) => {
    // Served by `astro preview` (see playwright.config.mjs): the Vite preview
    // server would answer an unknown route with Inicio and HTTP 200.
    // Its port is the Vite preview port + 1.
    const base = new URL(test.info().project.use.baseURL!);
    base.port = String(Number(base.port) + 1);
    const response = await page.goto(
      new URL("/esta-pagina-no-existe/", base).href,
    );
    expect(response?.status()).toBe(404);
    await expect(page.getByTestId("not-found")).toBeVisible();
    await expect(page.locator("h1")).toHaveText("Página no encontrada");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(
      page.getByRole("link", { name: "Volver al inicio" }),
    ).toBeVisible();
  });
});

test.describe("legal routes are ready for approved texts", () => {
  for (const path of [
    "/legal/privacy-policy/",
    "/legal/legal-notice/",
    "/legal/cookie-policy/",
  ]) {
    test(`${path} renders as pending, noindex`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).toHaveAttribute(
        "data-page-status",
        "pending",
      );
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }
});

test.describe("support pages: axe, overflow, screenshots", () => {
  for (const path of [
    "/examenes-rad/",
    "/cursos/",
    "/regala-danza/",
    "/horarios/",
    "/espectaculos/",
    "/contacto/",
    "/404.html",
  ]) {
    test(path, async ({ page }) => {
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
      const name = path.replace(/^\/|\/$|\.html$/g, "").replace(/\//g, "--");
      await page.screenshot({
        path: `${SHOTS_DIR}/${name}-${mobile ? 390 : 1440}.png`,
        fullPage: true,
      });
    });
  }
});

test.describe("enquiry form layout", () => {
  test("privacy label sits next to its checkbox and the notes line up with the button", async ({
    page,
  }) => {
    await page.goto("/contacto/");
    const check = page.locator('.field--check input[type="checkbox"]');
    const label = page.locator(".field--check .field__label");
    // Fill a text field so no floating-label state can leak onto the checkbox.
    await page.locator('[name="nombre"]').fill("Ana");
    expect(await label.evaluate((el) => getComputedStyle(el).transform)).toBe(
      "none",
    );
    const cb = (await check.boundingBox())!;
    const lb = (await label.boundingBox())!;
    expect(lb.x - (cb.x + cb.width)).toBeLessThan(24);
    const center = async (selector: string) => {
      const box = (await page.locator(selector).boundingBox())!;
      return box.x + box.width / 2;
    };
    const button = await center(".enquiry__submit");
    expect(
      Math.abs((await center(".enquiry__required-note")) - button),
    ).toBeLessThan(2);
    expect(Math.abs((await center(".enquiry__preview")) - button)).toBeLessThan(
      2,
    );
  });
});
