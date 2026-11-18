import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const SHOTS_DIR = "test-results/preview-shots";

// /horarios/ carries EXAMPLE data and is pending: it is deliberately absent
// from VERIFIED_PAGES and must never be counted as verified.

test.describe("/horarios/ (pending, example data)", () => {
  test("is noindex, pending and shows the example banner", async ({ page }) => {
    await page.goto("/horarios/");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(page.locator("body")).toHaveAttribute(
      "data-page-status",
      "pending",
    );
    const note = page.getByTestId("schedule-example-note");
    await expect(note).toBeVisible();
    await expect(note).toContainText("Horario de ejemplo");
  });

  test("filter tabs set aria-pressed and hide non-matching sessions", async ({
    page,
  }) => {
    await page.goto("/horarios/");
    const tabs = page.getByTestId("timetable-tab");
    const salud = tabs.filter({ hasText: "Salud corporal" });
    const all = tabs.filter({ hasText: /^Todas$/ });
    await expect(salud).toHaveCount(1);
    await expect(all).toHaveAttribute("aria-pressed", "true");

    // Table cells exist in the DOM at all widths; the list is the phone view.
    const sessions = page.locator(
      ".timetable__session[data-family], .timetable__items li[data-family]",
    );
    const total = await sessions.count();
    expect(total).toBeGreaterThan(0);
    const families = await sessions.evaluateAll((els) => [
      ...new Set(els.map((el) => (el as HTMLElement).dataset.family)),
    ]);
    expect(
      families.length,
      "example data spans several families",
    ).toBeGreaterThan(1);
    expect(families).toContain("salud");

    await salud.click();
    await expect(page.locator("[data-timetable-live]")).toHaveText(
      /\d+ clases? visibles?/,
    );
    await expect(salud).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");
    const states = await sessions.evaluateAll((els) =>
      els.map((el) => ({
        family: (el as HTMLElement).dataset.family,
        hidden: (el as HTMLElement).hidden,
      })),
    );
    for (const s of states)
      expect(s.hidden, `${s.family} hidden state`).toBe(s.family !== "salud");
    // Visible cells in the active view are all salud.
    const visibleSessions = sessions.filter({ visible: true });
    expect(await visibleSessions.count()).toBeGreaterThan(0);
    const visibleFamilies = await visibleSessions.evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).dataset.family),
    );
    for (const f of visibleFamilies) expect(f).toBe("salud");

    await all.click();
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(salud).toHaveAttribute("aria-pressed", "false");
    expect(
      await sessions.evaluateAll(
        (els) => els.filter((el) => (el as HTMLElement).hidden).length,
      ),
    ).toBe(0);
  });

  test("session cells link to activity pages that return 200", async ({
    page,
    request,
  }) => {
    await page.goto("/horarios/");
    const hrefs = await page
      .locator("[data-testid='timetable-cell'] a")
      .evaluateAll((els) => [
        ...new Set(els.map((el) => el.getAttribute("href") ?? "")),
      ]);
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href, "internal link").toMatch(/^\//);
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
    }
  });

  test("no horizontal overflow on mobile", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390", "mobile only");
    await page.goto("/horarios/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("axe finds no violations", async ({ page }) => {
    await page.goto("/horarios/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  });

  test("screenshot", async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/horarios/");
    await page.screenshot({
      path: `${SHOTS_DIR}/horarios-${testInfo.project.name}.png`,
      fullPage: true,
    });
  });
});
