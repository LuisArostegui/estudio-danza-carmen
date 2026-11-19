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

/**
 * `complete`: verified and indexable. `review`: full content awaiting owner
 * sign-off (noindex, not announced as pending). `pending`: placeholder.
 */
const pageStatus = z.enum(["complete", "review", "pending"]);

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
      }),
      contact: z.object({
        accent: z.string().optional(),
        title: z.string(),
        paragraphs: z.array(z.string()),
      }),
      testimonials: z.object({
        accent: z.string().optional(),
        /** Keep `pending: true` until a real, authorised review exists. */
        items: z.array(
          z.object({
            quote: z.string(),
            author: z.string().optional(),
            pending: z.boolean(),
          }),
        ),
        photo: photo(image),
      }),
      gift: z.object({
        eyebrow: z.string(),
        title: z.string(),
        subtitle: z.string(),
        body: z.string(),
        cta,
      }),
      instagram: z.object({
        // Needs owner confirmation: account handle taken from the WordPress site.
        handle: z.string(),
        href: z.string(),
        /** Six tiles, decorative. Missing photos render as identified gaps. */
        photos: z.array(photo(image).unwrap()),
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
      /** Facts Elena still has to confirm, shown only in the private preview. */
      pendingFacts: z.array(z.string()).default([]),
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
      /** `complete` pages are verified by tests; `review`/`pending` are not. */
      status: pageStatus,
      summary: z.string().optional(),
      /** Who the class is for, from the dossier. Shown as a hero fact. */
      audience: z.string().optional(),
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
    /** Map pin (OpenStreetMap). Needs owner confirmation. */
    mapLat: z.number().optional(),
    mapLon: z.number().optional(),
    /** Where enquiries are delivered. Empty means the form runs in test mode. */
    formEndpoint: z.string().default(""),
    pendingFacts: z.array(z.string()).default([]),
  }),
});

const time = z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM");

/**
 * Weekly timetable. `isExample: true` means the data is illustrative only:
 * the page shows an example note and stays noindex until the school confirms
 * the real schedule.
 */
const schedule = defineCollection({
  loader: glob({ pattern: "horario.md", base: "./src/content/schedule" }),
  schema: z.object({
    isExample: z.boolean(),
    updated: z.string().optional(),
    note: z.string().optional(),
    days: z.array(z.string()).min(1),
    slots: z.array(z.object({ start: time, end: time })).min(1),
    sessions: z.array(
      z.object({
        /** Activity id from src/content/activities, e.g. "diverballet". */
        activity: z.string(),
        day: z.string(),
        start: time,
        end: time,
        group: z.string().optional(),
      }),
    ),
  }),
});

/**
 * One file per production. Field names mirror the Sanity `performance`
 * document (studio/schemaTypes/documents/performance.ts): the file name is the
 * slug, `summary` is the dossier description. Dates and venues stay empty
 * until the school confirms them; the dossier order is kept meanwhile.
 */
const performances = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/performances" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Dossier order; used while no checked dates exist. */
      order: z.number(),
      summary: z.string(),
      performanceDate: z.string().optional(),
      venue: z.string().optional(),
      isUpcoming: z.boolean().default(false),
      /** Index tile and first gallery photo. Missing = identified gap. */
      photo: photo(image),
      gallery: z.array(photo(image)).default([]),
      pendingFacts: z.array(z.string()).default([]),
    }),
});

/** Page copy for /espectaculos/ (dossier 00 · «H1: Espectáculos»). */
const performancesPage = defineCollection({
  loader: glob({ pattern: "espectaculos.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    intro: z.string(),
    story: z.object({ title: z.string(), paragraphs: z.array(z.string()) }),
    archive: z.object({ title: z.string(), intro: z.string() }),
    closing: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()),
      question: z.string(),
      cta: cta,
    }),
    pendingFacts: z.array(z.string()).default([]),
  }),
});

/**
 * Page copy for /sobre-nosotros/ (dossier 00 · pp. 60–64). Each section has a
 * stable `id` used as its anchor (e.g. #profesorado, #instalaciones).
 */
const aboutPage = defineCollection({
  loader: glob({ pattern: "sobre-nosotros.md", base: "./src/content/pages" }),
  schema: ({ image }) => {
    const section = z.object({
      id: z.string(),
      /** Short label for the in-page index. */
      navLabel: z.string(),
      eyebrow: z.string(),
      title: z.string(),
      paragraphs: z.array(z.string()),
      cta: cta.optional(),
      photos: z.array(photo(image).unwrap()).default([]),
    });
    return z.object({
      title: z.string(),
      seoTitle: z.string(),
      description: z.string(),
      subtitle: z.string(),
      intro: z.string(),
      heroCta: cta,
      heroPhoto: photo(image),
      sections: z.array(section).min(1),
      team: z.object({
        sectionId: z.string(),
        members: z.array(
          z.object({
            name: z.string().optional(),
            role: z.string().optional(),
            photo: photo(image),
            /** Placeholder card: shown only in the private preview. */
            pending: z.boolean().default(false),
          }),
        ),
      }),
      closing: z.object({
        title: z.string(),
        paragraphs: z.array(z.string()),
        primaryCta: cta,
        secondaryCta: cta,
      }),
      pendingFacts: z.array(z.string()).default([]),
    });
  },
});

/**
 * Simple information pages (Exámenes RAD, Regala danza, Cursos copy): one
 * file per route in src/content/info/, file name = route slug.
 */
const infoPages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/info" }),
  schema: z.object({
    title: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    subtitle: z.string().optional(),
    intro: z.array(z.string()).min(1),
    sections: z
      .array(
        z.object({
          id: z.string().optional(),
          title: z.string(),
          paragraphs: z.array(z.string()).default([]),
          /** Short items with a title, e.g. benefits. */
          items: z
            .array(z.object({ title: z.string(), body: z.string() }))
            .default([]),
          /** Numbered process steps. */
          steps: z
            .array(z.object({ title: z.string(), body: z.string() }))
            .default([]),
          links: z.array(cta).default([]),
        }),
      )
      .default([]),
    /** Empty state shown when a list (e.g. courses) has no entries. */
    empty: z
      .object({ title: z.string(), paragraphs: z.array(z.string()) })
      .optional(),
    closing: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()),
      cta,
      secondaryCta: cta.optional(),
    }),
    pendingFacts: z.array(z.string()).default([]),
  }),
});

/**
 * One file per course or workshop in src/content/courses/. Every field except
 * the title and summary is optional: cards show only what is confirmed.
 */
const courses = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/courses" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      teacher: z.string().optional(),
      summary: z.string(),
      dates: z.string().optional(),
      schedule: z.string().optional(),
      levels: z.string().optional(),
      /** Euros, as confirmed by the school. */
      price: z.number().optional(),
      places: z.string().optional(),
      poster: photo(image),
      /** Sort key, ISO date of the first session. */
      startDate: z.string().optional(),
      /** Hide a course without deleting it. */
      published: z.boolean().default(true),
    }),
});

export const collections = {
  infoPages,
  courses,
  aboutPage,
  home,
  categories,
  activities,
  school,
  schedule,
  performances,
  performancesPage,
};
