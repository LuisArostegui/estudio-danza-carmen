import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openMobileNavigationIfVisible(page: Page) {
  const menuButton = page.locator("[data-menu-button]");

  if (await menuButton.isVisible()) {
    await menuButton.click();
  }
}

test("home renders the current Arabesque-faithful shell and has no axe smoke violations", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /el movimiento\s+se convierte en arte/i,
      level: 1,
    }),
  ).toBeVisible();

  await openMobileNavigationIfVisible(page);

  await expect(
    page.getByRole("navigation", { name: /navegaci[oó]n principal/i }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /descubrir clases/i }),
  ).toHaveAttribute("href", "/classes/");
  await expect(
    page.getByRole("link", { name: /contactar/i }).first(),
  ).toHaveAttribute("href", "/contact/");

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test("mobile navigation opens and closes with keyboard-visible state", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "Mobile-only navigation interaction",
  );

  await page.goto("/");

  const menuButton = page.locator("[data-menu-button]");
  const mobileNavigation = page.locator("[data-site-navigation]");

  await expect(menuButton).toBeVisible();
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(mobileNavigation).not.toBeVisible();

  await menuButton.focus();
  await page.keyboard.press("Enter");

  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(mobileNavigation).toBeVisible();
  await expect(
    mobileNavigation.getByRole("link", { name: /clases/i }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/menu-open/);

  await page.keyboard.press("Escape");

  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(mobileNavigation).not.toBeVisible();
  await expect(menuButton).toBeFocused();
  await expect(page.locator("body")).not.toHaveClass(/menu-open/);
});

test("cms debug mode exposes Sanity field keys", async ({ page }) => {
  await page.goto("/?cms=keys");

  await expect(page.locator("html")).toHaveAttribute("data-cms-debug", "keys");
  await expect(page.locator('[data-cms-field="homeContent.title"]')).toHaveText(
    "homeContent.title",
  );
  await expect(
    page.locator('[data-cms-field="siteSettings.brandLabel"]'),
  ).toHaveText("siteSettings.brandLabel");
});
