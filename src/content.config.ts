import { defineCollection, type SchemaContext } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

/**
 * Local content source for the first preview.
 *
 * Every public text and photo of the preview flow lives in Markdown files under
 * `src/content/`. Photos live in `src/assets/fotos/` and are optimised by Astro
 * at build time. Sanity stays available (see `src/lib/sanity/`) for later.
 *
 * A photo is optional everywhere: when it is missing, components render an
 * identified gap ("Foto pendiente") instead of a stock image.
 */

const photo = (image: SchemaContext["image"]) =>
  z
    .object({
      src: image().optional(),
      alt: z.string().default(""),
      /** What photo is still needed when `src` is empty. */
      pending: z.string().optional(),
      /** CSS object-position for wide screens, e.g. "60% 40%". */
      focusDesktop: z.string().default("50% 50%"),
      /** CSS object-position for phones. */
      focusMobile: z.string().default("50% 50%"),
    })
    .optional();

const cta = z.object({ label: z.string(), href: z.string() });

const pageStatus = z.enum(["complete", "pending"]);

const home = defineCollection({
  loader: glob({ pattern: "inicio.md", base: "./src/content/home" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      hero: z.object({
        eyebrow: z.string().optional(),
        title: z.string(),
        body: z.string(),
        primaryCta: cta,
        secondaryCta: cta,
        /** Home carousel photos; the text above stays fixed. */
        slides: z
          .array(
            photo(image)
              .unwrap()
              .extend({
                /** "light" = bright photo, gets a stronger scrim. */
                tone: z.enum(["dark", "light"]).default("dark"),
              }),
          )
          .min(1),
      }),
      story: z.object({
        accent: z.string().optional(),
        title: z.string(),
        body: z.string(),
        cta,
      }),
      classes: z.object({
        eyebrow: z.string().optional(),
        title: z.string(),
        body: z.string(),
        cards: z.array(
          z.object({
            title: z.string(),
            body: z.string(),
            href: z.string(),
            photo: photo(image),
          }),
        ),
      }),
      reasons: z.object({
        title: z.string(),
        body: z.string(),
        items: z.array(z.object({ title: z.string(), body: z.string() })),
      }),
      rad: z.object({
        accent: z.string().optional(),
        title: z.string(),
        lead: z.string(),
        paragraphs: z.array(z.string()),
        cta,
        photo: photo(image),
      }),
      shows: z.object({
        title: z.string(),
        lead: z.string(),
        body: z.string(),
        cta,
        items: z.array(z.object({ name: z.string(), photo: photo(image) })),
      }),
      contact: z.object({
        accent: z.string().optional(),
        title: z.string(),
        paragraphs: z.array(z.string()),
      }),
    }),
});

const categories = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/categories" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      menuLabel: z.string(),
      family: z.enum(["ballet", "salud", "otras"]),
      status: pageStatus,
      order: z.number(),
      subtitle: z.string().optional(),
      intro: z.string().optional(),
      description: z.string().optional(),
      photo: photo(image),
      presentation: z
        .object({
          title: z.string(),
          items: z.array(z.object({ title: z.string(), body: z.string() })),
          cta: cta.optional(),
        })
        .optional(),
      form: z.object({ title: z.string(), body: z.string() }).optional(),
    }),
});

const activities = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/activities" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Label used in the header dropdown (Elena's menu wording). */
      menuLabel: z.string(),
      family: z.enum(["ballet", "salud", "otras"]),
      order: z.number(),
      /** `complete` pages are verified by tests; `pending` ones are not. */
      status: pageStatus,
      summary: z.string().optional(),
      seoTitle: z.string().optional(),
      description: z.string().optional(),
      subtitle: z.string().optional(),
      intro: z.string().optional(),
      ctaLabel: z.string().optional(),
      photo: photo(image),
      benefits: z
        .array(z.object({ title: z.string(), body: z.string() }))
        .default([]),
      gallery: z.array(photo(image)).default([]),
      faqs: z
        .array(
          z.object({
            question: z.string(),
            answer: z.string().optional(),
          }),
        )
        .default([]),
      why: z
        .object({ title: z.string(), paragraphs: z.array(z.string()) })
        .optional(),
      closing: z.object({ title: z.string(), body: z.string() }).optional(),
      /** Facts Elena still has to confirm, shown only in the private preview. */
      pendingFacts: z.array(z.string()).default([]),
    }),
});

const school = defineCollection({
  loader: glob({ pattern: "escuela.md", base: "./src/content/school" }),
  schema: z.object({
    name: z.string(),
    addressLine: z.string(),
    whatsappLabel: z.string(),
    whatsappHref: z.string(),
    phoneLabel: z.string(),
    phoneHref: z.string(),
    directionsHref: z.string().optional(),
    /** Where enquiries are delivered. Empty means the form runs in test mode. */
    formEndpoint: z.string().default(""),
    pendingFacts: z.array(z.string()).default([]),
  }),
});

export const collections = { home, categories, activities, school };
