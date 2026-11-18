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
