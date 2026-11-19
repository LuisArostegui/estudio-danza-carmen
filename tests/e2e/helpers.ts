import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";

/**
 * The only routes that count as verified. Pending pages (data-page-status=
 * "pending") are deliberately absent: they must never be counted as verified.
 */
export const VERIFIED_PAGES = [
  { slug: "home", path: "/" },
  { slug: "clases-de-ballet", path: "/clases-de-ballet-granada/" },
  {
    slug: "ballet-para-adultos",
    path: "/clases-de-ballet-granada/ballet-para-adultos/",
  },
  { slug: "contacto", path: "/contacto/" },
] as const;

export const ADULTOS_PATH = "/clases-de-ballet-granada/ballet-para-adultos/";

/** Elena's literal Home copy, read from the content file. */
const homeSource = readFileSync("src/content/home/inicio.md", "utf8");
export function homeCopy(key: string, index = 0): string {
  const matches = [
    ...homeSource.matchAll(
      new RegExp(`^\\s*(?:- )?${key}:\\s*"(.*)"\\s*$`, "gm"),
    ),
  ];
  const value = matches[index]?.[1];
  if (value === undefined)
    throw new Error(`Missing home copy: ${key}[${index}]`);
  return value;
}

/** True when the header collapses into the mobile menu (< 64rem). */
export async function isMobileMenu(page: Page): Promise<boolean> {
  return page.evaluate(() => !window.matchMedia("(min-width: 64rem)").matches);
}

/**
 * Axe samples colours mid-transition, so a scroll-reveal or entrance animation
 * that is still running produces bogus contrast failures. Wait until every
 * [data-reveal] element in the viewport is fully revealed and no finite CSS
 * animation or transition is running.
 */
export async function waitForRevealsSettled(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const revealed = [
      ...document.querySelectorAll<HTMLElement>("[data-reveal]"),
    ]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight;
      })
      .every((el) => {
        const s = getComputedStyle(el);
        return s.opacity === "1" && s.transform === "none";
      });
    const running = document
      .getAnimations()
      .filter(
        (a) =>
          a.playState === "running" &&
          Number.isFinite(a.effect?.getComputedTiming().endTime as number),
      );
    return revealed && running.length === 0;
  });
}

/**
 * WebKit follows macOS Safari's default, where Tab skips links unless the
 * user turns on "Press Tab to highlight each item"; Option+Tab reaches them.
 */
export function tabKey(browserName: string, shift = false): string {
  const key = shift ? "Shift+Tab" : "Tab";
  return browserName === "webkit" ? `Alt+${key}` : key;
}
