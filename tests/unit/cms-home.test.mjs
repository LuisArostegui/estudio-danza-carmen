import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { normalizeConfiguredHomeContent } from "../../src/lib/sanity/content.ts";
import {
  assertHomeContent,
  isPublishableMedia,
} from "../../src/lib/sanity/validation.ts";

const requiredHomeContent = {
  title: "Contenido de CMS",
  intro: "Introduccion de CMS",
  primaryCta: { label: "Empezar", href: "/classes/" },
  secondaryCta: { label: "Conocenos", href: "/#academia" },
};

test("configured Home content keeps empty optional lists empty", () => {
  const content = normalizeConfiguredHomeContent({
    ...requiredHomeContent,
    classPathways: [],
    planningCards: [],
    trustItems: [],
    discoveryCards: [],
  });

  assert.deepEqual(content.classPathways, []);
  assert.deepEqual(content.planningCards, []);
  assert.deepEqual(content.trustItems, []);
  assert.deepEqual(content.discoveryCards, []);
});

test("configured Home content keeps missing optional lists absent", () => {
  const content = normalizeConfiguredHomeContent(requiredHomeContent);

  assert.equal(content.classPathways, undefined);
  assert.equal(content.planningCards, undefined);
  assert.equal(content.trustItems, undefined);
  assert.equal(content.discoveryCards, undefined);
});

test("configured Home content treats Sanity null optionals as absent", () => {
  const content = normalizeConfiguredHomeContent({
    ...requiredHomeContent,
    classPathways: null,
    planningCards: null,
    trustItems: null,
    discoveryCards: null,
    finalPrompt: null,
  });

  assert.equal(content.classPathways, undefined);
  assert.equal(content.planningCards, undefined);
  assert.equal(content.trustItems, undefined);
  assert.equal(content.discoveryCards, undefined);
  assert.equal(content.finalPrompt, undefined);
});

test("configured Home content does not resurrect the optional final CTA", () => {
  const content = normalizeConfiguredHomeContent({
    ...requiredHomeContent,
    finalPrompt: {
      eyebrow: "Hablemos",
      title: "Escribenos",
      intro: "Te orientamos.",
      primaryCta: { label: "Contactar", href: "/contact/" },
    },
  });

  assert.equal(content.finalPrompt.secondaryCta, undefined);
});

test("Home validation accepts missing optional lists", () => {
  assert.doesNotThrow(() =>
    assertHomeContent(requiredHomeContent, { validateMedia: false }),
  );
});

test("Home validation rejects an invalid required CTA", () => {
  assert.throws(
    () =>
      assertHomeContent(
        {
          ...requiredHomeContent,
          primaryCta: { label: "", href: "/classes/" },
        },
        { validateMedia: false },
      ),
    /homeContent\.primaryCta must include a CTA label and href/,
  );
});

test("Home validation rejects malformed optional cards", () => {
  assert.throws(
    () =>
      assertHomeContent(
        { ...requiredHomeContent, classPathways: [null] },
        { validateMedia: false },
      ),
    /homeContent\.classPathways\[0\] must include a title and text/,
  );
});

test("publishable media requires approval and informative alt text", () => {
  const asset = {
    asset: {
      _type: "image",
      asset: { _ref: "image-hero", _type: "reference" },
    },
  };

  assert.equal(
    isPublishableMedia({
      ...asset,
      licenceStatus: "approved",
      altText: "Bailarina en el estudio",
    }),
    true,
  );
  assert.equal(
    isPublishableMedia({
      ...asset,
      licenceStatus: "pending verification",
      altText: "Bailarina en el estudio",
    }),
    false,
  );
  assert.equal(
    isPublishableMedia({ ...asset, licenceStatus: "approved" }),
    false,
  );
});

test("Home hero uses semantic responsive image attributes for CMS media", async () => {
  const source = await readFile(
    new URL("../../src/pages/index.astro", import.meta.url),
    "utf8",
  );

  assert.match(source, /<img\s+class="home-hero__image"/);
  assert.match(source, /src=\{heroImage\.src\}/);
  assert.match(source, /srcset=\{heroImage\.srcset\}/);
  assert.match(source, /sizes=\{heroImage\.sizes\}/);
  assert.match(source, /alt=\{heroImage\.alt\}/);
});
