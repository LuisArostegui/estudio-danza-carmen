import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  REVIEW_HEADERS,
  writeReviewHeaders,
} from "../../scripts/write-review-headers.mjs";
import { checkReviewBuild } from "../../scripts/verify-review-build.mjs";

const NOINDEX_PAGE =
  '<html><head><meta name="robots" content="noindex"></head><body><form data-enquiry-form></form></body></html>';

async function fakeDist(pages) {
  const dir = await mkdtemp(join(tmpdir(), "carmen-review-"));
  for (const [path, html] of Object.entries(pages)) {
    await mkdir(join(dir, path, ".."), { recursive: true });
    await writeFile(join(dir, path), html);
  }
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

describe("review build check", () => {
  test("passes when headers exist and every page is noindex", async () => {
    const dir = await fakeDist({
      "index.html": NOINDEX_PAGE,
      "contacto/index.html": NOINDEX_PAGE,
    });
    await writeReviewHeaders(dir);
    assert.deepEqual(await checkReviewBuild(dir), []);
  });

  test("reports missing headers file", async () => {
    const dir = await fakeDist({ "index.html": NOINDEX_PAGE });
    const problems = await checkReviewBuild(dir);
    assert.ok(problems.some((p) => p.includes("_headers")));
  });

  test("reports an indexable page", async () => {
    const dir = await fakeDist({
      "index.html": NOINDEX_PAGE,
      "contacto/index.html": "<html><head></head><body></body></html>",
    });
    await writeReviewHeaders(dir);
    const problems = await checkReviewBuild(dir);
    assert.deepEqual(problems, ["contacto/index.html: missing noindex"]);
  });

  test("reports a form in live mode", async () => {
    const dir = await fakeDist({
      "contacto/index.html":
        '<html><head><meta name="robots" content="noindex"></head><body><form data-endpoint="/api/contact"></form></body></html>',
    });
    await writeReviewHeaders(dir);
    const problems = await checkReviewBuild(dir);
    assert.deepEqual(problems, [
      "contacto/index.html: contact form is in live mode",
    ]);
  });
});
