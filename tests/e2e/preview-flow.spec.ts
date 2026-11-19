import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  ADULTOS_PATH,
  VERIFIED_PAGES,
  isMobileMenu,
  waitForRevealsSettled,
} from "./helpers";

const SHOTS_DIR = "test-results/preview-shots";
const ADULTOS_TITLE = "Ballet para adultos";

const nav = (page: Page) => page.locator("#site-navigation");
const balletItem = (page: Page) => nav(page).locator(".site-nav__item").first();
const balletCategoryLink = (page: Page) =>
  balletItem(page).locator("[data-category-link]");

async function openMobileMenu(page: Page) {
  const button = page.locator("[data-menu-button]");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
}

/** Scroll the whole page so lazy images load, then return to the top. */
async function loadAllImages(page: Page) {
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img")) {
      img.loading = "eager";
    }
    const step = Math.max(window.innerHeight / 2, 200);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
    await Promise.all(
      [...document.images].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
    window.scrollTo(0, 0);
  });
}

test.describe("preview journey", () => {
  test("Inicio -> clases de ballet -> Ballet para adultos -> contacto preselected", async ({
    page,
  }) => {
    await page.goto("/");

    if (await isMobileMenu(page)) {
      await openMobileMenu(page);
      await balletCategoryLink(page).click();
    } else {
      await balletCategoryLink(page).hover();
      await expect(
        balletItem(page).locator(".site-nav__child").first(),
      ).toBeVisible();
      await balletCategoryLink(page).click();
    }

    await expect(page).toHaveURL(/\/clases-de-ballet-granada\/$/);

    const cards = page
      .getByTestId("activity-cards")
      .getByTestId("activity-card");
    await expect(cards).toHaveCount(8);
    await expect(cards.filter({ hasText: "Ficha en preparación" })).toHaveCount(
      0,
    );
    expect(
      await page
        .getByTestId("activity-cards")
        .locator('[data-status="review"]')
        .count(),
    ).toBe(7);
    expect(
      await page
        .getByTestId("activity-cards")
        .locator('[data-status="complete"]')
        .count(),
    ).toBe(1);

    await cards.filter({ hasText: ADULTOS_TITLE }).click();
    await expect(page).toHaveURL(new RegExp(`${ADULTOS_PATH}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      ADULTOS_TITLE,
    );
    await expect(
      page.getByText("Nunca es tarde para empezar... ¡o volver a bailar!"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "¿Cómo son las clases de ballet para adultos?",
      }),
    ).toBeVisible();

    await page.getByTestId("activity-cta").first().click();
    await expect(page).toHaveURL(
      /\/contacto\/\?actividad=ballet-para-adultos$/,
    );
    await expect(page.locator('select[name="actividad"]')).toHaveValue(
      "ballet-para-adultos",
    );
  });
});

test.describe("header dropdown", () => {
  test("desktop: hover opens the panel and a child link navigates directly", async ({
    page,
  }) => {
    await page.goto("/");
    test.skip(await isMobileMenu(page), "Desktop dropdown");

    await balletCategoryLink(page).hover();
    const child = balletItem(page).getByRole("link", {
      name: /Ballet para adultos/,
    });
    await expect(child).toBeVisible();
    await child.click();
    await expect(page).toHaveURL(new RegExp(`${ADULTOS_PATH}$`));
  });

  test("desktop: keyboard Tab reaches dropdown items and Escape closes it returning focus", async ({
    page,
  }) => {
    await page.goto("/");
    test.skip(await isMobileMenu(page), "Desktop dropdown");

    const category = balletCategoryLink(page);
    const firstChild = balletItem(page).locator(".site-nav__child").first();
    const panel = balletItem(page).locator(".site-nav__panel");

    await category.focus();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(firstChild).toBeFocused();
    await expect(firstChild).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(
      balletItem(page).locator(".site-nav__child").nth(1),
    ).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(category).toBeFocused();
  });

  test("mobile: category link and chevron are separate 44px targets; chevron toggles 8 children; Escape restores focus", async ({
    page,
  }) => {
    await page.goto("/");
    test.skip(!(await isMobileMenu(page)), "Mobile menu");

    await openMobileMenu(page);

    const link = balletCategoryLink(page);
    const chevron = balletItem(page).locator("[data-submenu-toggle]");
    const panel = balletItem(page).locator(".site-nav__panel");

    expect(
      await link.evaluate((element) => element.closest("button")),
    ).toBeNull();
    expect(
      await chevron.evaluate((element) =>
        element.contains(document.querySelector("[data-category-link]")),
      ),
    ).toBe(false);

    for (const [name, locator] of [
      ["category link", link],
      ["chevron", chevron],
    ] as const) {
      const box = await locator.boundingBox();
      expect(box, `${name} box`).not.toBeNull();
      expect(box!.width, `${name} width`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${name} height`).toBeGreaterThanOrEqual(44);
    }

    await expect(chevron).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();

    await chevron.click();
    await expect(chevron).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    await expect(panel.locator("a")).toHaveCount(8);

    await chevron.click();
    await expect(chevron).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Escape");
    await expect(page.locator("[data-menu-button]")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await expect(page.locator("[data-menu-button]")).toBeFocused();
    await expect(nav(page)).toBeHidden();
  });
});

test.describe("focus visibility", () => {
  test("tabbing shows a visible outline on links and buttons", async ({
    page,
  }) => {
    await page.goto("/");
    const seen: { tag: string; outline: string; width: string }[] = [];

    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          outline: style.outlineStyle,
          width: style.outlineWidth,
          visible: el.getBoundingClientRect().width > 0,
        };
      });
      if (info?.visible) seen.push(info);
    }

    expect(seen.length).toBeGreaterThanOrEqual(3);
    expect(seen.some((item) => item.tag === "a")).toBe(true);
    for (const item of seen) {
      expect(item.outline, `${item.tag} outline style`).not.toBe("none");
      expect(
        parseFloat(item.width),
        `${item.tag} outline width`,
      ).toBeGreaterThan(0);
    }
  });

  test("the primary buttons keep a focus outline", async ({ page }) => {
    await page.goto(ADULTOS_PATH);
    for (const locator of [
      page.getByTestId("activity-cta").first(),
      page.getByTestId("carousel-next"),
    ]) {
      await locator.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      const outline = await locator.evaluate(
        (element) => getComputedStyle(element).outlineStyle,
      );
      expect(outline).not.toBe("none");
    }
  });
});

test.describe("verified pages", () => {
  for (const { slug, path } of VERIFIED_PAGES) {
    test(`links on ${path} return 200`, async ({ page }) => {
      await page.goto(path);
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll("a[href]")].map((a) =>
          a.getAttribute("href"),
        ),
      );
      const targets = new Set<string>();
      for (const href of hrefs) {
        if (!href || href.startsWith("#")) continue;
        const url = new URL(href, page.url());
        if (url.origin !== new URL(page.url()).origin) continue;
        targets.add(url.pathname + url.search);
      }
      expect(targets.size).toBeGreaterThan(5);
      for (const target of targets) {
        const response = await page.request.get(target);
        expect(response.status(), target).toBe(200);
      }
    });

    test(`no horizontal overflow and images render on ${path}`, async ({
      page,
    }) => {
      await page.goto(path);
      await loadAllImages(page);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.scrollingElement!.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);

      const images = await page.evaluate(() =>
        [...document.querySelectorAll("img")].map((img) => ({
          src: img.currentSrc || img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          inPhoto: img.classList.contains("photo"),
          fit: getComputedStyle(img).objectFit,
          rendered: img.getBoundingClientRect().width > 0,
        })),
      );
      for (const image of images) {
        expect(
          image.naturalWidth,
          `${image.src} natural width`,
        ).toBeGreaterThan(0);
        expect(
          image.naturalHeight,
          `${image.src} natural height`,
        ).toBeGreaterThan(0);
        if (image.inPhoto) {
          expect(image.fit, `${image.src} object-fit`).toBe("cover");
        }
      }

      const gaps = await page.evaluate(() =>
        [...document.querySelectorAll("[role=img][data-photo-pending]")].map(
          (gap) => ({
            role: gap.getAttribute("role"),
            label: gap.getAttribute("aria-label") ?? "",
          }),
        ),
      );
      for (const gap of gaps) {
        expect(gap.role).toBe("img");
        expect(gap.label.startsWith("Foto pendiente")).toBe(true);
      }
    });

    test(`axe finds no violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await waitForRevealsSettled(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(
        results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    });

    test(`screenshots of ${path}`, async ({ page }, testInfo) => {
      await page.goto(path);
      await loadAllImages(page);
      await page.screenshot({
        path: `${SHOTS_DIR}/${slug}-${testInfo.project.name}-fold.png`,
      });
      await page.screenshot({
        path: `${SHOTS_DIR}/${slug}-${testInfo.project.name}-full.png`,
        fullPage: true,
      });
    });
  }
});

test.describe("show gallery", () => {
  test("every tile has a caption", async ({ page }) => {
    await page.goto("/");
    const tiles = page.getByTestId("show-gallery").locator("a");
    await expect(tiles).toHaveCount(7);
    for (let index = 0; index < 7; index++) {
      await expect(
        tiles.nth(index).locator(".gallery__caption"),
      ).not.toBeEmpty();
      await expect(tiles.nth(index)).toHaveAttribute(
        "href",
        /^\/espectaculos\/#/,
      );
    }
  });

  test("hover and focus reveal the caption overlay (hover-capable devices)", async ({
    page,
  }) => {
    await page.goto("/");
    test.skip(
      await page.evaluate(() => matchMedia("(hover: none)").matches),
      "hover:none devices show captions permanently",
    );
    // Tiles without a photo keep the name visible; only photo tiles fade it.
    const tiles = page.getByTestId("show-gallery").locator("a:not(.is-gap)");
    test.skip(
      (await tiles.count()) < 2,
      "No production has an authorised photo yet: every label stays visible",
    );
    const caption = (index: number) =>
      tiles.nth(index).locator(".gallery__caption");
    const opacity = (index: number) =>
      caption(index).evaluate((el) => getComputedStyle(el).opacity);

    await tiles.nth(0).scrollIntoViewIfNeeded();
    expect(await opacity(0)).toBe("0");

    await tiles.nth(0).hover();
    await expect.poll(() => opacity(0)).toBe("1");

    await page.mouse.move(0, 0);
    await expect.poll(() => opacity(0)).toBe("0");

    await tiles.nth(1).focus();
    await expect.poll(() => opacity(1)).toBe("1");
  });

  test("captions are visible without interaction under hover:none", async ({
    page,
  }) => {
    await page.goto("/");
    test.skip(
      await page.evaluate(() => !matchMedia("(hover: none)").matches),
      "Only for hover:none (touch) devices",
    );
    const captions = page
      .getByTestId("show-gallery")
      .locator(".gallery__caption");
    await captions.first().scrollIntoViewIfNeeded();
    for (let index = 0; index < 7; index++) {
      await expect(captions.nth(index)).toHaveCSS("opacity", "1");
    }
  });

  test("reduced motion removes the caption transition", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const duration = await page
      .getByTestId("show-gallery")
      .locator(".gallery__caption")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
  });

  test("caption overlay uses a 200ms transition with motion allowed", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    const duration = await page
      .getByTestId("show-gallery")
      .locator(".gallery__caption")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration).toBe("0.2s");
  });
});

test.describe("carousel", () => {
  const activeIndex = (page: Page) =>
    page
      .getByTestId("carousel-dot")
      .evaluateAll((dots) =>
        dots.findIndex((dot) => dot.getAttribute("aria-current") === "true"),
      );

  test("next, previous and ArrowRight move the active dot and live region", async ({
    page,
  }) => {
    await page.goto(ADULTOS_PATH);
    const carousel = page.getByTestId("carousel");
    const dots = page.getByTestId("carousel-dot");
    const total = await dots.count();
    expect(total).toBeGreaterThan(1);
    const live = carousel.locator("[data-carousel-live]");

    await carousel.scrollIntoViewIfNeeded();
    expect(await activeIndex(page)).toBe(0);

    await page.getByTestId("carousel-next").click();
    expect(await activeIndex(page)).toBe(1);
    await expect(live).toHaveText(`Foto 2 de ${total}`);

    await page.getByTestId("carousel-prev").click();
    expect(await activeIndex(page)).toBe(0);
    await expect(live).toHaveText(`Foto 1 de ${total}`);

    await page.getByTestId("carousel-next").focus();
    await page.keyboard.press("ArrowRight");
    expect(await activeIndex(page)).toBe(1);

    await page.keyboard.press("ArrowLeft");
    expect(await activeIndex(page)).toBe(0);

    await dots.nth(total - 1).click();
    expect(await activeIndex(page)).toBe(total - 1);
  });

  test("reduced motion removes the track transition", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(ADULTOS_PATH);
    const duration = await page
      .getByTestId("carousel")
      .locator("[data-carousel-track]")
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(duration)).toBeLessThanOrEqual(0.01);
  });
});

test.describe("enquiry form", () => {
  test("empty submit shows the error summary with focus and invalid fields", async ({
    page,
  }) => {
    await page.goto("/contacto/");
    await page.getByRole("button", { name: "Enviar consulta" }).click();

    const summary = page.getByTestId("enquiry-errors");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    for (const name of [
      "nombre",
      "correo",
      "mensaje",
      "actividad",
      "privacidad",
    ]) {
      await expect(page.locator(`[name="${name}"]`)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    }
    await expect(page.locator('[name="telefono"]')).not.toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("invalid email and short phone get specific messages", async ({
    page,
  }) => {
    await page.goto("/contacto/");
    await page.locator('[name="nombre"]').fill("Ana");
    await page.locator('[name="correo"]').fill("ana-sin-arroba");
    await page.locator('[name="telefono"]').fill("12345");
    await page.getByRole("button", { name: "Enviar consulta" }).click();

    const summary = page.getByTestId("enquiry-errors");
    await expect(summary).toContainText("Revisa el correo");
    await expect(summary).toContainText("al menos 9 cifras");
    await expect(page.locator('[name="correo"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.locator('[name="telefono"]')).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("valid submit runs in test mode and sends no network request", async ({
    page,
  }) => {
    const posts: string[] = [];
    page.on("request", (request) => {
      if (request.method() !== "GET")
        posts.push(`${request.method()} ${request.url()}`);
    });

    await page.goto("/contacto/?actividad=ballet-para-adultos");
    await expect(page.getByTestId("enquiry-preview")).toBeVisible();

    await page.locator('[name="nombre"]').fill("Ana Prueba");
    await page.locator('[name="correo"]').fill("ana@example.com");
    await page.locator('[name="telefono"]').fill("600 123 456");
    await page
      .locator('[name="mensaje"]')
      .fill("Me gustaría probar una clase de ballet.");
    await page.locator('[name="privacidad"]').check();
    await page.getByRole("button", { name: "Enviar consulta" }).click();

    const status = page.getByTestId("enquiry-status");
    await expect(status).toBeVisible();
    await expect(status).toContainText("Modo de prueba");
    await expect(page.getByTestId("enquiry-errors")).toBeHidden();
    await page.waitForTimeout(300);
    expect(posts).toEqual([]);
    expect(new URL(page.url()).search).toBe("?actividad=ballet-para-adultos");
  });
});

test.describe("pending and review pages are never verified", () => {
  for (const [path, status] of [
    ["/salud-corporal/", "review"],
    ["/otras-disciplinas/", "review"],
    ["/clases-de-ballet-granada/ballet-junior/", "review"],
    ["/sobre-nosotros/", "review"],
  ] as const) {
    test(`${path} is marked ${status} and noindex`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("body")).toHaveAttribute(
        "data-page-status",
        status,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
      expect(VERIFIED_PAGES.map((item) => item.path)).not.toContain(path);
    });
  }

  for (const { path } of VERIFIED_PAGES) {
    test(`${path} is complete and indexable`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("body")).toHaveAttribute(
        "data-page-status",
        "complete",
      );
      await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    });
  }
});

test.describe("header at the desktop breakpoint", () => {
  test("six entries fit on one row at 1024px without overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/");
    expect(await isMobileMenu(page)).toBe(false);

    const links = page.locator("#site-navigation [data-category-link]");
    await expect(links).toHaveCount(6);
    const boxes = await links.evaluateAll((items) =>
      items.map((item) => {
        const rect = item.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, right: rect.right };
      }),
    );
    const header = await page
      .locator("[data-site-header]")
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(new Set(boxes.map((box) => Math.round(box.top))).size).toBe(1);
    for (const box of boxes) expect(box.right).toBeLessThanOrEqual(1024);
    expect(header).toBeLessThan(120);
    const overflow = await page.evaluate(
      () => document.scrollingElement!.scrollWidth <= window.innerWidth,
    );
    expect(overflow).toBe(true);
    await page.screenshot({
      path: `${SHOTS_DIR}/header-1024.png`,
      clip: { x: 0, y: 0, width: 1024, height: 160 },
    });
  });
});
