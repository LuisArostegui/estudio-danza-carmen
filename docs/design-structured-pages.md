# Structured MVP Pages Design Handoff

This document records the repository-side implementation handoff for CD-16: Schedules, Teachers, Facilities, Courses, Performances, and RAD. The goal is reusable page-family patterns, not one-off compositions.

Canonical Penpot file:

```text
https://design.penpot.app/#/workspace?team-id=81f57451-85cc-819d-8008-7273b4e9b9c5&project-id=c269caa0-e456-818c-8008-88624b219662&file-id=c269caa0-e456-818c-8008-886e7082047d
```

Relevant routes: `/schedules/`, `/teachers/`, `/facilities/`, `/courses/`, `/performances/`, and `/rad/`.

Related source documents: [sitemap-and-navigation.md](sitemap-and-navigation.md), [visual-foundations.md](visual-foundations.md), [design-site-shell.md](design-site-shell.md), [sanity-content-model.md](sanity-content-model.md), and [asset-inventory.md](asset-inventory.md).

## Purpose

These pages should make structured school information understandable and actionable while reusing the same visual system. They should support missing media, partial dates, long text, empty future lists, and route-specific calls to action without adding bookings, payments, ticketing, or an interactive calendar.

## Shared Pattern Rules

- Use full-width sections with bounded inner content.
- Use cards only for repeated items such as teachers, facilities, courses, performances, and class references.
- Prefer clear lists and tables over decorative layouts when visitors need practical information.
- Use approved tokens from [visual-foundations.md](visual-foundations.md).
- Hide optional empty blocks.
- Keep contact and related classes discoverable through contextual CTAs.

## Schedules

Page goal: help students and families understand when classes happen, especially on narrow screens.

Recommended hierarchy:

1. Page intro and effective-date note.
2. Weekly schedule grouped by day.
3. Slot details: class, start/end time, level/group, room, teacher, and temporal note.
4. Related class links.
5. Contact CTA for questions or unclear placement.

Mobile should use day sections with stacked rows. Desktop may use a weekly table only if it remains readable; otherwise preserve the grouped day list.

Do not design booking, capacity, availability, payments, waitlists, or calendar interaction.

State handling:

| State | Behaviour |
| --- | --- |
| No current schedule | Show a concise unavailable-state message and contact CTA. |
| Missing room | Omit room metadata. |
| Missing teacher | Omit teacher metadata. |
| Temporary note | Show close to the affected day or slot. |
| Long class names | Allow wrapping without shrinking essential times. |

## Teachers

Page goal: present the teaching team and trust context without inventing qualifications.

Pattern:

- ordered teacher list or card grid;
- name and public role;
- short biography preview where available;
- portrait when approved;
- qualifications only when verified for public use;
- related class links where useful.

If a portrait is missing, use a text-led card with no fake silhouette required. Long bios should use readable text width and can be shortened in cards with a route-level decision later if teacher detail pages are approved.

## Facilities

Page goal: show the studio spaces and practical context in a warm, trustworthy way.

Pattern:

- intro explaining the practical value of the space;
- facility sections or cards with title, summary, features, and optional gallery;
- captions and alt text for informative media;
- contact or visit CTA.

If media is missing or rights are pending, the page remains text-led. Do not use Arabesque demo photos or unverified Carmen photos.

## Courses

Page goal: explain current, upcoming, or seasonal courses without creating booking or payment flows.

Pattern:

- page intro;
- current/upcoming course list first;
- past courses only if useful as context;
- course title, summary, dates or season label, related classes, and CTA;
- useful empty state if there are no current courses.

State handling:

| State | Behaviour |
| --- | --- |
| Upcoming | Prominent in the list with date or season where available. |
| Current | Visible before past items. |
| Past | Lower emphasis or archive grouping. |
| No concrete date | Use season/public note if available; do not invent dates. |
| Empty future list | Explain that courses are announced when confirmed and provide contact CTA. |

No purchase, reservation, payment, or checkout state belongs in this design.

## Performances

Page goal: present stage activity and school experience with clear past/future distinction.

Pattern:

- page intro;
- future performances first when they exist;
- past performances as a gallery/list archive where approved media exists;
- title, date, venue, summary, media, related classes, and CTA.

State handling:

| State | Behaviour |
| --- | --- |
| Future performance | Show date/venue and contextual contact CTA. |
| Past performance | Show as record/gallery when content is approved. |
| Missing date | Use a public-safe note only if confirmed. |
| No performances yet | Use a restrained empty state and link to contact or classes. |
| No media | Keep the performance text-led. |

Do not implement ticketing.

## RAD

Page goal: make RAD prominent as a trust signal while avoiding unsupported claims.

Recommended hierarchy:

1. Clear intro explaining RAD in visitor-friendly terms.
2. What it means for ballet training at the school.
3. Verified public claims.
4. Related ballet classes.
5. FAQs where useful.
6. Contact CTA.

Any claim without owner/source confirmation must remain unpublished or be marked in editorial context as `needs owner/source confirmation`. Do not strengthen pending claims in copy, headings, badges, or metadata.

## Responsive And State Intent

Mobile:

- prefer stacked sections and day-based schedule groups;
- keep dates, times, titles, and CTAs close together;
- avoid horizontal scrolling for critical content;
- ensure galleries remain operable without hover.

Tablet/desktop:

- use grids for repeated cards when content length is comparable;
- keep long biographies and rich text in readable widths;
- use tables only where the data remains legible.

Accessible galleries:

- provide alt text for informative images;
- provide captions where context matters;
- avoid image-only navigation;
- hide galleries when media is not approved.

## CMS Dependencies

| Route family | CMS source |
| --- | --- |
| Schedules | Schedule + Schedule Slot + referenced Class/Teacher |
| Teachers | Teacher documents ordered by `order` |
| Facilities | Facility documents + Media Item gallery |
| Courses | Course documents with `state`, dates, related classes, media, and CTA |
| Performances | Performance documents with date, venue, gallery, related classes, and CTA |
| RAD | RAD Content + related Classes + FAQs + verified claims |
| Shared contact CTAs | Site Settings + CTA object or route-level fallback |
| Media | Media Item with approved licence and consent status |

## Implementation Boundary

This handoff does not add Astro routes, React components, CSS, Sanity schemas, GROQ queries, media assets, dependencies, booking, payments, ticketing, or interactive calendars.
