# SEO Metadata And Structured Data Matrix

This document resolves CD-40 by defining the implementation-ready SEO metadata and structured data contract for MVP routes. CD-29 should implement metadata from this matrix without creating new product decisions.

This document does not implement metadata in Astro, write final legal text, add keyword research for post-MVP blog content, or create structured data output.

## Global Rules

- Generate canonical URLs from the approved route in [sitemap-and-navigation.md](sitemap-and-navigation.md) unless `canonicalOverride` is explicitly set.
- Every public route needs a title and meta description, either curated in CMS or generated from a documented fallback.
- Preview and draft URLs should use `noIndex`.
- Use Open Graph title and description fallbacks from SEO fields, then page/document title and summary.
- Use OG images only when media is approved in [asset-inventory.md](asset-inventory.md) and the Media Item has suitable alt/caption context.
- Do not invent reviews, ratings, awards, phone numbers, opening hours, geo coordinates, price range, official social links, RAD claims, or teacher qualifications.
- Legal pages normally need standard title, description, canonical, and `noIndex` only when intentionally excluded; they do not need rich structured data for MVP.

## Confirmed Local Business Data

Use only confirmed repository data:

| Field               | Status                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| Name                | `Estudio de Danza Carmen`                                                                         |
| City                | Granada                                                                                           |
| Address             | `Calle Casillas de Prats, 10, 18002 Granada, Spain` from [project-context.md](project-context.md) |
| Phone               | Requires confirmed Site Settings/final content                                                    |
| Email               | Requires confirmed Site Settings/final content                                                    |
| Opening hours       | Requires confirmed Site Settings/final content                                                    |
| SameAs/social links | Requires confirmed official URLs                                                                  |
| Geo coordinates     | Requires owner/source confirmation                                                                |
| Price range         | Not defined for MVP                                                                               |

## Structured Data Guidance

| Type                                  | MVP use                                                                                                   | Rule                                                                                                                        |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `LocalBusiness`                       | Recommended for Home or site-wide graph when business details are confirmed.                              | Use confirmed name, address, URL, and only confirmed phone/email/opening hours/social links.                                |
| `Organization`                        | Optional fallback or complement if implementation prefers a simpler site identity graph.                  | Do not duplicate conflicting business identity data.                                                                        |
| `EducationalOrganization` or `School` | Optional if implementation wants a school-oriented schema.org identity.                                   | Use only confirmed school data; do not invent accreditation, awards, or programme claims.                                   |
| `Event`                               | Use only on future individual event/performance pages if the page and content meet Google Event guidance. | Do not add `Event` to listing pages, class schedules, business hours, private/ineligible school events, or undated content. |
| `Course`                              | Optional for course pages where the content genuinely describes a course.                                 | Do not imply certification, price, booking, or completion outcomes unless verified.                                         |
| `FAQPage`                             | Optional where visible FAQs exist.                                                                        | Mark up only visible published FAQs.                                                                                        |
| `Article`                             | Not recommended for MVP.                                                                                  | Blog is post-MVP and these routes are not articles.                                                                         |

## Route Matrix

| Route family             | Title pattern                                            | Description intent                                                                     | Structured data                                                                                                      | Required CMS fields                                  | Optional enhancements                                            |
| ------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------- |
| `/`                      | `Estudio de Danza Carmen \| Escuela de danza en Granada` | Introduce the school, ballet/training focus, Granada, and practical next steps.        | `LocalBusiness` plus optional `EducationalOrganization`/`School` when confirmed business fields exist.               | Site Settings, Home title/intro, SEO defaults.       | Approved hero OG image, verified trust highlights.               |
| `/classes/`              | `Clases de danza en Granada \| Estudio de Danza Carmen`  | Explain class families, ages/levels, ballet/body work, and route to schedules/contact. | None required; optional `FAQPage` only if visible FAQs are added later.                                              | Published Classes with names, summaries, categories. | Class-family OG image if approved.                               |
| `/classes/[slug]/`       | `{Class.name} \| Estudio de Danza Carmen`                | Explain audience, age/level, benefits, schedule/contact path.                          | Optional `FAQPage` when the class has visible FAQs.                                                                  | Class name, slug, shortDescription, hasDetailPage.   | Class SEO fields, approved gallery image, related schedules.     |
| `/schedules/`            | `Horarios \| Estudio de Danza Carmen`                    | Help visitors find current class times and contact the school for placement questions. | None required.                                                                                                       | Schedule title, slots, effective dates.              | `noIndex` if schedule is intentionally unavailable; OG fallback. |
| `/teachers/`             | `Profesorado \| Estudio de Danza Carmen`                 | Present teaching team and trust context without inventing qualifications.              | None required.                                                                                                       | Teacher names, roles, biographies.                   | Approved portraits, qualifications when verified.                |
| `/facilities/`           | `Instalaciones \| Estudio de Danza Carmen`               | Present studio spaces and practical context.                                           | None required.                                                                                                       | Facility titles and summaries.                       | Approved facility gallery for OG image.                          |
| `/courses/`              | `Cursos \| Estudio de Danza Carmen`                      | Explain current/upcoming courses and contact path.                                     | Optional `Course`; avoid `Event` on the list page.                                                                   | Course title, summary, state.                        | Dates, season labels, related classes, approved media.           |
| `/performances/`         | `Actuaciones \| Estudio de Danza Carmen`                 | Present performance activity with past/future distinction.                             | Avoid `Event` on the list page; reserve it for future eligible individual event pages if approved.                   | Performance title, summary.                          | Date, venue, approved gallery.                                   |
| `/rad/`                  | `Royal Academy of Dance \| Estudio de Danza Carmen`      | Explain RAD as a trust signal and connect it to ballet training.                       | Optional `FAQPage` if visible FAQs exist.                                                                            | RAD title, intro, verified claims.                   | Related ballet classes, approved media.                          |
| `/contact/`              | `Contacto \| Estudio de Danza Carmen`                    | Provide address, contact options, and enquiry form path.                               | `LocalBusiness` and optional `EducationalOrganization`/`School` can supply confirmed contact data in the site graph. | Contact title/intro, Site Settings address.          | Confirmed phone/email/hours, map context if later approved.      |
| `/legal/legal-notice/`   | `Legal notice \| Estudio de Danza Carmen`                | Identify legal ownership once final text exists.                                       | None.                                                                                                                | Legal title/body.                                    | `noIndex` only if legal review requires it.                      |
| `/legal/privacy-policy/` | `Privacy policy \| Estudio de Danza Carmen`              | Explain personal data handling once final text exists.                                 | None.                                                                                                                | Legal title/body.                                    | `noIndex` only if legal review requires it.                      |
| `/legal/cookie-policy/`  | `Cookie policy \| Estudio de Danza Carmen`               | Explain cookie use if integrations require it.                                         | None.                                                                                                                | Legal title/body.                                    | `noIndex` only if legal review requires it.                      |

## Metadata Fallbacks

| Content type    | Title fallback                                             | Description fallback                          |
| --------------- | ---------------------------------------------------------- | --------------------------------------------- |
| Home Content    | `title` + site name                                        | `intro`                                       |
| Class           | `name` + site name                                         | `shortDescription`                            |
| Schedule        | `title` + site name                                        | Curated schedule intro or current public note |
| Teacher index   | Static route title + site name                             | Curated page intro                            |
| Facility        | `title` + site name where detail routes are later approved | `summary`                                     |
| Course          | `title` + site name                                        | `summary`                                     |
| Performance     | `title` + site name                                        | `summary`                                     |
| RAD Content     | `title` + site name                                        | `intro`                                       |
| Contact Content | `title` + site name                                        | `intro`                                       |
| Legal Content   | `title` + site name                                        | Curated legal excerpt only when safe          |

## Validation Rules For CD-29 And CD-22

- Public routes must produce non-empty title, description, canonical URL, and OG title/description.
- Descriptions should stay within the content-model recommended range where possible.
- Canonicals must match approved route slugs unless a documented canonical override exists.
- Class detail pages require a stable slug and `shortDescription`; missing class SEO fields fall back to class content.
- Dated content metadata must reflect `upcoming`, `current`, `past`, or date availability without inventing dates.
- `Event` structured data requires a future individual page focused on a real eligible event with accurate date and location data.
- `Course` structured data requires real course content and must not imply certification, booking, price, or completion claims not present in content.
- `FAQPage` structured data may only include visible published FAQ entries.
- Local business structured data must omit unknown phone, email, opening hours, sameAs, geo, and priceRange fields.
- Preview/draft routes must use `noIndex` and must not leak draft-only claims.
- OG images must be approved media; if absent, use a generic site fallback only when that asset is approved.

## Dependencies And Deferred Work

- Final content from CD-31 may refine titles/descriptions without changing this contract.
- CD-29 implements metadata and structured data.
- CD-22 implements Sanity fields and validation.
- CD-35 confirms production domain/canonical host during deployment.
- CD-38 analytics remains separate and should not be closed by this SEO matrix.

## Sources

- Google Local Business structured data, accessed 2026-08-24: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Google Event structured data, accessed 2026-08-24: https://developers.google.com/search/docs/appearance/structured-data/event
- Schema.org EducationalOrganization, accessed 2026-08-24: https://schema.org/EducationalOrganization
