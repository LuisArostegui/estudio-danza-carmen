# Sanity Content Model

This document defines the CD-12 content model for the future Sanity Studio. It is an implementation-facing model record, not executable schema code.

Sanity remains the selected CMS. This batch does not add Sanity schemas, GROQ queries, Astro integration, preview routes, or Studio configuration.

## Principles

- Model the school in the editor's language: class, teacher, schedule, course, performance, facility, RAD, contact, legal content.
- Keep content structured and portable.
- Avoid WPBakery-style rows, columns, widgets, shortcodes, or arbitrary page-builder sections.
- Use optional fields where content may not exist yet; future presentation should hide missing optional content cleanly.
- Keep private evidence outside Sanity: contracts, signed consent, IDs, certificates, credentials, private licence proof, and legal records are not CMS content.
- Use Sanity drafts/published. Do not duplicate a generic editorial status unless a content type has a real business state.

## Reusable Objects

### SEO

| Field | Required | Validation / notes |
| --- | --- | --- |
| `metaTitle` | Optional | Recommended `30-60` characters. Falls back to page/document title. |
| `metaDescription` | Optional | Recommended `80-155` characters. Falls back to a curated excerpt where safe. |
| `canonicalOverride` | Optional | URL field. Use only for an explicit canonical need. |
| `ogTitle` | Optional | Falls back to `metaTitle` or title. |
| `ogDescription` | Optional | Falls back to `metaDescription`. |
| `ogImage` | Optional | Uses the media object rules below. |
| `noIndex` | Optional | Default `false`. Use only for pages that should intentionally stay out of search. |

Do not implement the full structured-data matrix in this model. That belongs to later SEO work.

### Media Item

| Field | Required | Validation / notes |
| --- | --- | --- |
| `asset` | Required | Sanity image/file asset. |
| `altText` | Required when informative | Required for meaningful images; empty only for decorative images. |
| `caption` | Optional | Public caption only. |
| `focalPoint` | Optional | Use Sanity hotspot/crop where possible. |
| `licenceStatus` | Required | `approved`, `pending verification`, `needs consent`, `reference only`, or `do not publish`. |
| `consentStatus` | Required when identifiable people appear | `yes`, `no`, or `pending`. Store only status, not proof. |
| `credit` | Optional | Public photographer/source credit. |
| `usageNotes` | Optional | Public-safe restrictions, such as page/date limits. |

Validation rule: production queries should exclude or warn on media where `licenceStatus` is not `approved` or `consentStatus` is required but not `yes`.

### CTA

| Field | Required | Validation / notes |
| --- | --- | --- |
| `label` | Required | Short action text. |
| `href` | Required | Internal route or approved external URL. |
| `style` | Optional | `primary`, `secondary`, or `text`. |

### FAQ Item

| Field | Required | Validation / notes |
| --- | --- | --- |
| `question` | Required | Clear visitor-facing question. |
| `answer` | Required | Plain rich text; no arbitrary embed blocks for MVP. |
| `order` | Optional | Number, ascending. |

### Portable Rich Text

Use a limited rich-text object for body copy:

- paragraphs;
- headings `h2` and `h3`;
- bold and italic;
- ordered and unordered lists;
- internal links;
- approved external links.

Do not include arbitrary HTML, script embeds, generic layout blocks, rows, columns, spacers, or unknown component props.

## Documents

### Site Settings

One singleton document for global public information.

| Field | Required | Validation / notes |
| --- | --- | --- |
| `siteName` | Required | Default: Estudio de Danza Carmen. |
| `legalBusinessName` | Optional | Required before legal pages go live if different from site name. |
| `address` | Required | Structured address fields; current known address is in project context. |
| `phone` | Optional | Public phone format. |
| `email` | Optional | Public contact email only. No private account credentials. |
| `generalHours` | Optional | Public office/contact hours text. |
| `socialLinks` | Optional | Array of platform + URL; official URLs only. |
| `primaryNavigation` | Required | Ordered links matching sitemap primary navigation. |
| `footerNavigation` | Required | Primary, secondary, and legal groups. |
| `seoDefaults` | Optional | SEO object. |
| `businessIdentity` | Optional | Public identity needed for metadata, not private records. |

### Home Content

Singleton document for `/`.

| Field | Required | Validation / notes |
| --- | --- | --- |
| `title` | Required | Page heading. |
| `intro` | Required | Short school introduction. |
| `featuredClasses` | Optional | References to published classes. |
| `featuredLinks` | Optional | Curated links to classes, schedules, RAD, contact. |
| `heroMedia` | Optional | Media item; must be approved before production use. |
| `trustHighlights` | Optional | Short public claims; unverifiable claims stay unpublished. |
| `seo` | Optional | SEO object. |

### Class

Document type for all class offers, including current MVP route details and grouped class families.

| Field | Required | Validation / notes |
| --- | --- | --- |
| `name` | Required | Visitor-facing class name. |
| `slug` | Required when public detail exists | Unique among classes; stable lowercase slug. |
| `hasDetailPage` | Required | Boolean. Controls whether `/classes/[slug]/` is generated later. |
| `category` | Required | Ballet, Body Work, Other Discipline, Private Training, or another approved family. |
| `shortDescription` | Required | Recommended `80-180` characters. |
| `audience` | Optional | Families, children, adults, regular students, etc. |
| `ageRange` | Optional | Public text or structured min/max where known. |
| `level` | Optional | Beginner, intermediate, advanced, mixed, by assessment, etc. |
| `longDescription` | Optional | Limited rich text. |
| `benefits` | Optional | Short ordered list. |
| `differentiators` | Optional | Short ordered list; claims must be verified. |
| `gallery` | Optional | Array of approved media items. |
| `faqs` | Optional | Array of FAQ items. |
| `testimonials` | Optional | References or embedded approved quote objects. Consent required. |
| `scheduleSlots` | Optional | Reverse relationship from Schedule Slot in implementation. |
| `primaryCta` | Optional | CTA object. |
| `order` | Optional | Number, ascending in indexes. |
| `seo` | Optional | SEO object. |

Publication rule: if `hasDetailPage` is true, `slug`, `shortDescription`, and enough body content for a useful detail page are required. Optional blocks disappear from presentation when empty.

Initial MVP detail slugs should match [sitemap-and-navigation.md](sitemap-and-navigation.md): `diverballet`, `pre-ballet`, `ballet-levels`, `adult-ballet`, `pointe-technique`, `classical-repertoire`, `private-sessions`, `pilates`, and `barre`.

### Teacher

| Field | Required | Validation / notes |
| --- | --- | --- |
| `name` | Required | Public name. |
| `slug` | Optional | Required only if teacher detail routes are later approved. |
| `role` | Required | Public role/title. |
| `biography` | Optional | Limited rich text. |
| `portrait` | Optional | Media item; consent and rights required. |
| `qualifications` | Optional | Public qualifications only; private certificates stay outside CMS. |
| `relevantClasses` | Optional | References to classes. |
| `order` | Optional | Number, ascending. |
| `seo` | Optional | Only needed if a public teacher detail route exists. |

### Schedule

Use a clean Schedule / Schedule Slot model instead of historical WordPress plugin structures.

Schedule document:

| Field | Required | Validation / notes |
| --- | --- | --- |
| `title` | Required | Example: Current weekly schedule. |
| `effectiveFrom` | Optional | Date. |
| `effectiveTo` | Optional | Date; must be after `effectiveFrom` when both exist. |
| `notes` | Optional | Public temporal notes. |
| `slots` | Required | Array of Schedule Slot objects or references. |

Schedule Slot object/document:

| Field | Required | Validation / notes |
| --- | --- | --- |
| `class` | Required | Reference to Class. |
| `day` | Required | Monday-Sunday enum. |
| `startTime` | Required | `HH:mm` 24-hour format. |
| `endTime` | Required | `HH:mm`; must be after `startTime`. |
| `room` | Optional | Public room/studio label. |
| `levelOrGroup` | Optional | Public group/level note. |
| `teacher` | Optional | Reference to Teacher when useful. |
| `displayOrder` | Optional | Number for same-day sorting. |
| `temporalNotes` | Optional | Public note such as seasonal changes. |

Do not model booking, capacity, payment, attendance, or availability in MVP.

### Facility

| Field | Required | Validation / notes |
| --- | --- | --- |
| `title` | Required | Facility or space name. |
| `slug` | Optional | Required only if detail routes are later approved. |
| `summary` | Required | Short description. |
| `body` | Optional | Limited rich text. |
| `gallery` | Optional | Approved media items. |
| `features` | Optional | Short list, such as floor, mirrors, equipment, changing space. |
| `order` | Optional | Number, ascending. |
| `seo` | Optional | Only needed if a public detail route exists. |

### Course

| Field | Required | Validation / notes |
| --- | --- | --- |
| `title` | Required | Public course title. |
| `slug` | Required when public | Unique among courses. |
| `summary` | Required | Short description. |
| `body` | Optional | Limited rich text. |
| `startDate` | Optional | Date. |
| `endDate` | Optional | Date; must be after `startDate` when both exist. |
| `seasonLabel` | Optional | Example: Summer intensive. |
| `relatedClasses` | Optional | References to classes. |
| `media` | Optional | Approved media items. |
| `state` | Optional | `upcoming`, `current`, `past`, or `hidden`; only because dated courses need visitor-facing filtering. |
| `cta` | Optional | CTA object. |
| `order` | Optional | Number. |
| `seo` | Optional | SEO object. |

### Performance

| Field | Required | Validation / notes |
| --- | --- | --- |
| `title` | Required | Public performance title. |
| `slug` | Required when public | Unique among performances. |
| `summary` | Required | Short description. |
| `body` | Optional | Limited rich text. |
| `performanceDate` | Optional | Date. |
| `venue` | Optional | Public venue text. |
| `isUpcoming` | Optional | Can be derived from date later, but explicit override may help when dates are partial. |
| `gallery` | Optional | Approved media items. |
| `relatedClasses` | Optional | References to classes. |
| `cta` | Optional | CTA object for future or information requests. |
| `seo` | Optional | SEO object. |

Past/future display can be derived from dates where possible. Do not duplicate a full event-management system.

### RAD Content

Singleton or small document group for `/rad/`.

| Field | Required | Validation / notes |
| --- | --- | --- |
| `title` | Required | Page title. |
| `intro` | Required | Plain-language RAD explanation. |
| `verifiedClaims` | Optional | Array of public claims that have owner/source confirmation. |
| `pendingClaims` | Optional | Draft-only editorial notes; not queried for production. |
| `relatedClasses` | Optional | References to ballet classes. |
| `faqs` | Optional | FAQ items. |
| `media` | Optional | Approved media items. |
| `cta` | Optional | CTA object. |
| `seo` | Optional | SEO object. |

RAD is a key commercial differentiator, but claims that require verification must stay unpublished until confirmed. Do not duplicate RAD facts across multiple page documents.

### Contact Content

Singleton document for `/contact/`.

| Field | Required | Validation / notes |
| --- | --- | --- |
| `title` | Required | Page title. |
| `intro` | Required | Supportive contact copy. |
| `directions` | Optional | Public directions/access notes. |
| `contactBlocks` | Optional | Phone, email, address, hours display groups sourced from Site Settings where possible. |
| `formIntro` | Optional | Text above future form. |
| `privacyNote` | Optional | Must align with final legal/privacy text before form implementation. |
| `seo` | Optional | SEO object. |

The form fields and endpoint belong to CD-28. Do not store contact submissions in Sanity.

### Legal Content

Document type or singleton set for legal pages.

| Field | Required | Validation / notes |
| --- | --- | --- |
| `title` | Required | Legal page title. |
| `slug` | Required | Must match approved legal routes. |
| `body` | Required | Approved legal text only. |
| `lastReviewed` | Optional | Date. |
| `seo` | Optional | Usually no special object needed beyond title/description. |

Legal slugs for MVP: `legal-notice`, `privacy-policy`, and `cookie-policy`.

## Route To Content Mapping

| Route | Content source |
| --- | --- |
| `/` | Site Settings + Home Content |
| `/classes/` | Published Classes, grouped by category and ordered |
| `/classes/[slug]/` | Published Class where `hasDetailPage` is true |
| `/schedules/` | Current Schedule + Schedule Slots + referenced Classes/Teachers |
| `/teachers/` | Published Teachers |
| `/facilities/` | Published Facilities |
| `/courses/` | Published Courses |
| `/performances/` | Published Performances |
| `/rad/` | RAD Content + related Classes |
| `/contact/` | Contact Content + Site Settings |
| `/legal/legal-notice/` | Legal Content with slug `legal-notice` |
| `/legal/privacy-policy/` | Legal Content with slug `privacy-policy` |
| `/legal/cookie-policy/` | Legal Content with slug `cookie-policy` |

Do not change the URL architecture as a side effect of content modelling.

## Validation Summary

| Rule | Applies to |
| --- | --- |
| Required title/name fields | All public documents. |
| Slug uniqueness | Class, Course, Performance, Legal Content, and any future detail-routed document. |
| Slug stability | Public routed documents; changes require redirect consideration. |
| Reasonable text lengths | Short descriptions, SEO fields, CTA labels. |
| Date ordering | Courses, schedules, performances where start/end or effective dates exist. |
| Required references | Schedule Slot to Class; related content only where the relationship is meaningful. |
| Informative alt text | Media Item when image is informative. |
| Consent/licence status | All media and testimonials involving identifiable people or third-party rights. |
| Display order | Classes, teachers, facilities, schedule slots where curated ordering matters. |
| Publication hygiene | Production should query published documents and hide optional empty blocks. |

## Implementation Notes For CD-22

- Use Sanity schema helpers such as `defineType` and `defineField` when implementation begins.
- Shape Studio navigation around the document groups above.
- Use published-only queries for production builds.
- Use draft-aware preview only with a token stored outside the repository.
- Generate TypeScript types only during the implementation issue.
- Keep private evidence out of Sanity and GitHub.
