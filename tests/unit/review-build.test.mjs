import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  REVIEW_HEADERS,
  writeReviewHeaders,
} from "../../scripts/write-review-headers.mjs";
import {
  REQUIRED_PAGES,
  REVIEW_OUT_DIR,
  checkReviewBuild,
} from "../../scripts/verify-review-build.mjs";

const NOINDEX_HEAD = '<head><meta name="robots" content="noindex"></head>';
const NOINDEX_PAGE = `<html>${NOINDEX_HEAD}<body></body></html>`;
const CONTACT_PAGE = `<html>${NOINDEX_HEAD}<body><form data-enquiry-form></form></body></html>`;

async function fakeDist(pages) {
  const dir = await mkdtemp(join(tmpdir(), "carmen-review-"));
  for (const [path, html] of Object.entries(pages)) {
    await mkdir(join(dir, path, ".."), { recursive: true });
    await writeFile(join(dir, path), html);
  }
  return dir;
}

/** A complete review artifact, optionally with some files replaced. */
async function completeDist(overrides = {}, { headers = REVIEW_HEADERS } = {}) {
  const pages = Object.fromEntries(
    REQUIRED_PAGES.map((page) => [
      page,
      page === "contacto/index.html" ? CONTACT_PAGE : NOINDEX_PAGE,
    ]),
  );
  const dir = await fakeDist({ ...pages, ...overrides });
  if (headers !== null) await writeFile(join(dir, "_headers"), headers);
  return dir;
}

describe("review headers", () => {
  test("send X-Robots-Tag noindex for every path", () => {
    assert.match(REVIEW_HEADERS, /^\/\*\n/);
    assert.match(REVIEW_HEADERS, /\n {2}X-Robots-Tag: noindex, nofollow\n/);
  });

  test("are written to _headers in the output directory", async () => {
    const dir = await fakeDist({});
    await writeReviewHeaders(dir);
    assert.equal(await readFile(join(dir, "_headers"), "utf8"), REVIEW_HEADERS);
  });
});

describe("review build output", () => {
  test("is a separate directory from the normal build", () => {
    assert.equal(REVIEW_OUT_DIR, "dist-review");
  });

  test("the review Worker serves only that directory", async () => {
    const config = await readFile(
      new URL("../../wrangler.jsonc", import.meta.url),
      "utf8",
    );
    const review = config.slice(config.indexOf('"review"'));
    assert.match(review, /"directory": "\.\/dist-review"/);
    assert.doesNotMatch(review, /"directory": "\.\/dist"/);
  });
});

describe("review build check", () => {
  test("accepts the pending-page placeholder note", async () => {
    const dir = await completeDist({
      "legal/privacy-policy/index.html": `<html>${NOINDEX_HEAD}<body><div class="preview-note pending-page__note"><p>Página en preparación</p></div></body></html>`,
    });
    assert.deepEqual(await checkReviewBuild(dir), []);
  });

  test("passes for a complete review artifact", async () => {
    assert.deepEqual(await checkReviewBuild(await completeDist()), []);
  });

  test("reports a missing output directory", async () => {
    const problems = await checkReviewBuild(join(tmpdir(), "carmen-nope-x"));
    assert.equal(problems.length, 1);
    assert.match(problems[0], /output directory missing/);
  });

  test("reports an empty artifact", async () => {
    const dir = await fakeDist({});
    await writeReviewHeaders(dir);
    const problems = await checkReviewBuild(dir);
    for (const page of REQUIRED_PAGES) {
      assert.ok(problems.includes(`${page}: required page missing`), page);
    }
  });

  test("reports a missing required page", async () => {
    const dir = await completeDist();
    const { rm } = await import("node:fs/promises");
    await rm(join(dir, "horarios/index.html"));
    assert.deepEqual(await checkReviewBuild(dir), [
      "horarios/index.html: required page missing",
    ]);
  });

  test("reports missing headers file", async () => {
    const problems = await checkReviewBuild(
      await completeDist({}, { headers: null }),
    );
    assert.deepEqual(problems, ["_headers: file missing"]);
  });

  test("reports a noindex header that is not under /*", async () => {
    const dir = await completeDist(
      {},
      {
        headers:
          "/_astro/*\n  X-Robots-Tag: noindex, nofollow\n/*\n  Cache-Control: no-store\n",
      },
    );
    assert.deepEqual(await checkReviewBuild(dir), [
      "_headers: no X-Robots-Tag noindex rule for /*",
    ]);
  });

  test("reports an indexable page", async () => {
    const dir = await completeDist({
      "contacto/index.html": "<html><head></head><body></body></html>",
    });
    assert.deepEqual(await checkReviewBuild(dir), [
      "contacto/index.html: missing noindex",
      "contacto/index.html: contact form missing",
    ]);
  });

  test("reports a form in live mode", async () => {
    const dir = await completeDist({
      "contacto/index.html": `<html>${NOINDEX_HEAD}<body><form data-enquiry-form data-endpoint="/api/contact"></form></body></html>`,
    });
    assert.deepEqual(await checkReviewBuild(dir), [
      "contacto/index.html: contact form is in live mode",
    ]);
  });

  test("reports preview notes left visible", async () => {
    const dir = await completeDist({
      "horarios/index.html": `<html>${NOINDEX_HEAD}<body><p data-testid="schedule-example-note"></p></body></html>`,
      "sobre-nosotros/index.html": `<html>${NOINDEX_HEAD}<body><details class="preview-note info-note"></details></body></html>`,
    });
    assert.deepEqual(await checkReviewBuild(dir), [
      "horarios/index.html: preview notes are visible",
      "sobre-nosotros/index.html: preview notes are visible",
    ]);
  });
});
