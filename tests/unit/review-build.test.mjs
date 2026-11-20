import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { pruneUnreferencedPhotos } from "../../scripts/prune-review-photos.mjs";
import { isApprovedForReview, photoStem } from "../../src/lib/review-photos.js";
import {
  REVIEW_HEADERS,
  writeReviewHeaders,
} from "../../scripts/write-review-headers.mjs";
import {
  REQUIRED_PAGES,
  REVIEW_OUT_DIR,
  REVIEW_APPROVED_PHOTOS_FILE,
  readApprovedPhotos,
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

  test("reports every photo when none is approved", async () => {
    const dir = await completeDist({
      "_astro/aula-barra.Ab12Cd34_Z1abcd.avif": "x",
      "_astro/escenario-tutus-rosas.Ef56Gh78.jpg": "x",
      "index.html": `<html>${NOINDEX_HEAD}<body><picture><img src="/_astro/aula-barra.Ab12Cd34_Z1abcd.avif" alt=""></picture></body></html>`,
    });
    assert.deepEqual(await checkReviewBuild(dir, { approvedPhotos: [] }), [
      "_astro/aula-barra.Ab12Cd34_Z1abcd.avif: photo aula-barra shipped without review permission",
      "_astro/escenario-tutus-rosas.Ef56Gh78.jpg: photo escenario-tutus-rosas shipped without review permission",
      "index.html: shows photo aula-barra without review permission",
    ]);
  });

  test("with partial approval, reports only the photos still pending", async () => {
    const dir = await completeDist({
      "_astro/aula-barra.Ab12Cd34_Z1abcd.avif": "x",
      "_astro/zapatillas-barra.Qr90St12_Z2efgh.webp": "x",
      "index.html": `<html>${NOINDEX_HEAD}<body><picture><source srcset="/_astro/aula-barra.Ab12Cd34_Z1abcd.avif 480w"><img src="/_astro/zapatillas-barra.Qr90St12_Z2efgh.webp" alt=""></picture></body></html>`,
    });
    assert.deepEqual(
      await checkReviewBuild(dir, { approvedPhotos: ["aula-barra.jpg"] }),
      [
        "_astro/zapatillas-barra.Qr90St12_Z2efgh.webp: photo zapatillas-barra shipped without review permission",
        "index.html: shows photo zapatillas-barra without review permission",
      ],
    );
  });

  test("passes when every shipped photo is approved", async () => {
    const dir = await completeDist({
      "_astro/aula-barra.Ab12Cd34_Z1abcd.avif": "x",
      "index.html": `<html>${NOINDEX_HEAD}<body><img src="/_astro/aula-barra.Ab12Cd34_Z1abcd.avif" alt=""></body></html>`,
    });
    assert.deepEqual(
      await checkReviewBuild(dir, { approvedPhotos: ["aula-barra.jpg"] }),
      [],
    );
  });

  test("the approved list names only existing photos", async () => {
    const approved = await readApprovedPhotos();
    assert.ok(Array.isArray(approved));
    const fotos = await readdir(
      new URL("../../src/assets/fotos/", import.meta.url),
    );
    for (const name of approved) {
      assert.ok(fotos.includes(name), `${name} is not in src/assets/fotos/`);
    }
    assert.match(REVIEW_APPROVED_PHOTOS_FILE, /review-approved\.json$/);
  });

  test("allows illustrations and approved public assets", async () => {
    const dir = await completeDist({
      "_astro/ballet-penche.CNOge64C.svg": "<svg></svg>",
      "assets/hero-carmen.png": "x",
    });
    assert.deepEqual(await checkReviewBuild(dir), []);
  });
});

describe("review photo pruning", () => {
  test("removes unreferenced raster files and keeps referenced ones", async () => {
    const dir = await fakeDist({
      "_astro/aula-barra.BE6TVaKY.jpg": "orphan original",
      "_astro/used.Ab12.avif": "referenced",
      "_astro/ballet-penche.CN.svg": "<svg></svg>",
      "_astro/site.css": "a{background:url(/_astro/bg.X1.webp)}",
      "_astro/bg.X1.webp": "referenced from css",
      "assets/hero-carmen.png": "public asset",
      "index.html": '<img src="/_astro/used.Ab12.avif" alt="">',
    });
    const removed = await pruneUnreferencedPhotos(dir);
    assert.deepEqual(removed, ["_astro/aula-barra.BE6TVaKY.jpg"]);
    assert.deepEqual((await readdir(join(dir, "_astro"))).sort(), [
      "ballet-penche.CN.svg",
      "bg.X1.webp",
      "site.css",
      "used.Ab12.avif",
    ]);
  });
});

describe("review photo approval", () => {
  test("reduces build, dev and source paths to the photo stem", () => {
    assert.equal(photoStem("aula-barra.jpg"), "aula-barra");
    assert.equal(photoStem("/_astro/aula-barra.BE6TVaKY.jpg"), "aula-barra");
    assert.equal(
      photoStem("/_astro/aula-barra.BE6TVaKY_Z1abcd.avif"),
      "aula-barra",
    );
    assert.equal(
      photoStem("/@fs/Users/x/src/assets/fotos/aula-barra.jpg?origWidth=2560"),
      "aula-barra",
    );
  });

  test("approves only the listed photos", () => {
    const approved = ["aula-barra.jpg"];
    assert.equal(
      isApprovedForReview("/_astro/aula-barra.BE.jpg", approved),
      true,
    );
    assert.equal(
      isApprovedForReview("/_astro/zapatillas-barra.B3.jpg", approved),
      false,
    );
    assert.equal(isApprovedForReview("/_astro/aula.X1.jpg", approved), false);
    assert.equal(isApprovedForReview("/_astro/aula-barra.BE.jpg", []), false);
  });
});
