# Classes Design Handoff

This document records the repository-side implementation handoff for CD-14: the Classes index and the reusable class-detail template. Penpot remains the canonical editable design source; this document translates the approved sitemap, visual foundations, and Sanity content model into implementation guidance.

Canonical Penpot file:

```text
https://design.penpot.app/#/workspace?team-id=81f57451-85cc-819d-8008-7273b4e9b9c5&project-id=c269caa0-e456-818c-8008-88624b219662&file-id=c269caa0-e456-818c-8008-886e7082047d
```

Relevant routes: `/classes/` and `/classes/[slug]/`.

Related source documents: [sitemap-and-navigation.md](sitemap-and-navigation.md), [visual-foundations.md](visual-foundations.md), [design-site-shell.md](design-site-shell.md), [sanity-content-model.md](sanity-content-model.md), and [asset-inventory.md](asset-inventory.md).

## Purpose

The Classes experience should help a family, adult student, or continuing dancer find the right class quickly without making each discipline a bespoke page design.

The design should support:

- clear discovery by audience, level, and class family;
- stable detail pages for the MVP class routes;
- optional content that disappears cleanly when absent;
- calm, practical navigation toward schedules and contact.

## Classes Index

Page goal: explain the class offer and guide visitors toward the most relevant next step.

Recommended hierarchy:

1. Page introduction: concise offer summary and practical orientation.
2. Featured class groups: ballet for children, ballet by level, adult ballet, specialist ballet, private sessions, and body work.
3. Class cards or blocks: name, audience, age/level where known, short description, and detail CTA.
4. Grouped secondary disciplines: body work and other disciplines that remain visible without individual MVP pages.
5. Practical next steps: schedules and contact.

The index should not list every discipline in the primary navigation. It should keep the route family scalable as content grows.

Class card intent:

| Element            | Behaviour                                               |
| ------------------ | ------------------------------------------------------- |
| Title              | Link to detail when `hasDetailPage` is true.            |
| Audience/age/level | Show only when content exists.                          |
| Summary            | Short, readable preview from the class record.          |
| Primary CTA        | Link to detail for routed classes.                      |
| Secondary CTA      | Link to schedules or contact when useful.               |
| Media              | Optional; never show broken or unapproved placeholders. |

If a category has only one or two classes, keep the group compact rather than forcing a large grid. If a category has no publishable classes, omit it from production.

## Class-Detail Template

Page goal: give one class enough context for a visitor to understand fit, schedule relevance, and enquiry path.

Reusable detail hierarchy:

1. Header: class name, audience, age/level, short description, primary contact CTA, secondary schedules CTA.
2. Main description: body copy that explains who the class is for and what to expect.
3. Benefits and differentiators: short lists using verified, visitor-relevant claims.
4. Related schedules: day, time, room, teacher, and temporal notes where available.
5. Optional media: approved gallery or single media block.
6. FAQ: practical questions only when useful answers exist.
7. Testimonials or evidence: only with consent and verified public-safe text.
8. Related classes: nearby routes or class families.
9. Final contact prompt.

The template must support all MVP detail slugs from [sitemap-and-navigation.md](sitemap-and-navigation.md): `diverballet`, `pre-ballet`, `ballet-levels`, `adult-ballet`, `pointe-technique`, `classical-repertoire`, `private-sessions`, `pilates`, and `barre`.

## Optional Content Handling

Optional sections disappear rather than leaving empty frames.

| Missing content           | Behaviour                                                         |
| ------------------------- | ----------------------------------------------------------------- |
| No gallery                | Use a text-led layout; do not reserve a media slot.               |
| No FAQ                    | Omit the FAQ section.                                             |
| No testimonials/evidence  | Omit the section; do not invent quotes or claims.                 |
| No related schedule slots | Show a concise contact/schedules prompt without fake times.       |
| No main image             | Keep the header text-led and balanced.                            |
| No age/level              | Omit the metadata row item rather than displaying unknown values. |

## Responsive Behaviour

Mobile:

- use a single-column reading order;
- put class fit, description, and CTAs before secondary media;
- keep class cards as full-width blocks;
- avoid hover-only details;
- keep long labels wrapping naturally.

Tablet:

- use two-column card grids where it improves scanning;
- keep metadata close to each class title;
- avoid moving CTAs away from their related content.

Desktop:

- use bounded content widths from [visual-foundations.md](visual-foundations.md);
- allow cards to form a two- or three-column grid when summaries are comparable;
- use side-by-side detail layouts only when content and media are both strong;
- keep long body copy within readable text width.

Review widths in Penpot are design evidence, not production breakpoints.

## Interaction And State Intent

Class cards should use clear link semantics. If the whole card is clickable, the implementation must still provide an understandable accessible name and avoid nested ambiguous links.

CTA copy should describe the action, such as `View class`, `Check schedules`, or `Contact the school`, rather than vague labels.

Hover states are optional enhancement only. Focus, touch, and keyboard users must receive equivalent affordance.

## Accessibility Intent

- Use one page `h1` and logical section headings.
- Keep card titles and CTAs semantically clear.
- Use informative alt text for class images; decorative images can have empty alt text.
- Preserve visible focus using `color.focus`.
- Do not rely on color alone for category, level, or active state.
- Keep reading order consistent with visual order.
- Do not hide essential class-fit information behind hover.

This handoff is not a WCAG audit. Keyboard behaviour, screen-reader output, zoom/reflow, contrast in final compositions, and link integrity must be validated during implementation.

## CMS Dependencies

| UI area                | CMS source                                            |
| ---------------------- | ----------------------------------------------------- |
| Classes index groups   | Published Class documents grouped by `category`       |
| Class card title       | `Class.name`                                          |
| Class card slug/link   | `Class.slug` when `hasDetailPage` is true             |
| Class card summary     | `Class.shortDescription`                              |
| Audience label         | `Class.audience`                                      |
| Age/level metadata     | `Class.ageRange` and `Class.level`                    |
| Detail description     | `Class.longDescription`                               |
| Benefits               | `Class.benefits`                                      |
| Differentiators        | `Class.differentiators`                               |
| Related schedule slots | Schedule Slot records linked to Class                 |
| Gallery                | `Class.gallery` using Media Item rules                |
| FAQ                    | `Class.faqs`                                          |
| Testimonials/evidence  | `Class.testimonials` with consent verified            |
| CTA                    | `Class.primaryCta` or route-level fallback to Contact |
| Related classes        | Curated Class references or category siblings         |

## Implementation Boundary

This handoff does not add Astro routes, React components, CSS, Sanity schemas, GROQ queries, images, dependencies, booking, payments, or interactive calendars.
