# Design Implementation Readiness

This document closes CD-18 as a lightweight implementation readiness gate. It reviews the existing MVP handoffs for route coverage, responsive intent, accessibility intent, content ownership, and implementability before CD-19 starts Astro implementation.

This is not a redesign and not a production audit. It records whether the repository handoffs are clear enough for implementation to begin.

## Source Handoffs Reviewed

| Area | Source |
| --- | --- |
| Canonical design source | [design-source.md](design-source.md) |
| Visual foundations and tokens | [visual-foundations.md](visual-foundations.md) |
| Home | [design-home.md](design-home.md) |
| Classes and class detail | [design-classes.md](design-classes.md) |
| Structured MVP pages | [design-structured-pages.md](design-structured-pages.md) |
| Contact and form states | [design-contact.md](design-contact.md) |
| Shared shell, navigation, footer, states | [design-site-shell.md](design-site-shell.md) |
| CMS model | [sanity-content-model.md](sanity-content-model.md) |
| Contact form strategy | [contact-form-strategy.md](contact-form-strategy.md) |
| Assets, licences, consent | [asset-inventory.md](asset-inventory.md) |

## MVP Route Coverage

| Route | Design handoff | Content source |
| --- | --- | --- |
| `/` | [design-home.md](design-home.md) | Site Settings + Home Content |
| `/classes/` | [design-classes.md](design-classes.md) | Published Classes grouped by category |
| `/classes/[slug]/` | [design-classes.md](design-classes.md) | Published Class where `hasDetailPage` is true |
| `/schedules/` | [design-structured-pages.md](design-structured-pages.md) | Schedule + Schedule Slot |
| `/teachers/` | [design-structured-pages.md](design-structured-pages.md) | Teacher documents |
| `/facilities/` | [design-structured-pages.md](design-structured-pages.md) | Facility documents |
| `/courses/` | [design-structured-pages.md](design-structured-pages.md) | Course documents |
| `/performances/` | [design-structured-pages.md](design-structured-pages.md) | Performance documents |
| `/rad/` | [design-structured-pages.md](design-structured-pages.md) | RAD Content + related Classes |
| `/contact/` | [design-contact.md](design-contact.md) | Contact Content + Site Settings + form strategy |
| `/legal/legal-notice/` | [sitemap-and-navigation.md](sitemap-and-navigation.md) | Legal Content with slug `legal-notice` |
| `/legal/privacy-policy/` | [sitemap-and-navigation.md](sitemap-and-navigation.md) | Legal Content with slug `privacy-policy` |
| `/legal/cookie-policy/` | [sitemap-and-navigation.md](sitemap-and-navigation.md) | Legal Content with slug `cookie-policy` |

Result: no MVP route family is missing from the repository-side handoff set.

## Shared State Coverage

| State or pattern | Source |
| --- | --- |
| Desktop navigation | [design-site-shell.md](design-site-shell.md) |
| Mobile navigation closed and expanded states | [design-site-shell.md](design-site-shell.md) |
| Mobile navigation closing model | [design-site-shell.md](design-site-shell.md) |
| Current page state | [design-site-shell.md](design-site-shell.md) |
| Footer content groups | [design-site-shell.md](design-site-shell.md) |
| Missing optional media | [design-home.md](design-home.md), [design-classes.md](design-classes.md), [design-structured-pages.md](design-structured-pages.md), [design-contact.md](design-contact.md) |
| Optional sections disappearing cleanly | [sanity-content-model.md](sanity-content-model.md), [design-classes.md](design-classes.md), [design-structured-pages.md](design-structured-pages.md) |
| Form default, focus, validation, submitting, success, and failure states | [design-contact.md](design-contact.md) |

Result: required shared states are documented for implementation.

## Responsive Readiness

The handoff set documents:

- mobile-first reading order for Home, Classes, structured pages, Contact, and navigation;
- tablet/desktop transformations for cards, page sections, schedule views, detail layouts, and contact layout;
- long-copy handling through readable content widths and wrapping guidance;
- missing-media behaviour without empty placeholders;
- optional content removal for galleries, FAQs, testimonials, dates, schedules, portraits, and media;
- design review widths as evidence, not production breakpoints.

Result: responsive intent is clear enough for CD-19+ implementation planning.

## Accessibility Intent

The handoff set documents:

- semantic section hierarchy and one clear page heading per page;
- visible keyboard focus using the approved focus token;
- mobile navigation button state and closing model;
- no hover-only discovery for essential information;
- form labels, required/optional distinction, field errors, summaries, status messaging, and privacy acceptance;
- informative versus decorative image guidance;
- gallery alternatives, captions, and missing-media behaviour;
- representative contrast notes, without claiming full WCAG conformance.

This review does not claim production WCAG conformance. Semantic HTML, screen-reader output, keyboard/focus behaviour, zoom/reflow, reduced-motion behaviour, final contrast, link integrity, and built-page validation remain implementation-time responsibilities.

## Implementation Notes For CD-19+

- Use Astro as the primary framework.
- Keep output static-first where possible.
- Use React only for justified interactive islands.
- Implement semantic tokens from [visual-foundations.md](visual-foundations.md).
- Treat Sanity content model fields as the content contract, not as page-builder blocks.
- Do not copy Arabesque runtime, WPBakery structures, Slider Revolution structures, theme CSS, demo images, logos, or bundled plugins.
- Keep private evidence, credentials, consent forms, and purchase records outside the repository and CMS.
- Keep final legal text, final media approval, DNS cutover, SEO implementation, analytics, and production browser testing in their later issues.

## Open Questions And Follow-Up Issues

| Topic | Status | Follow-up |
| --- | --- | --- |
| Final legal/privacy/cookie text | Pending | Future legal/content issue before production form and legal pages go live |
| Real Carmen media rights and consent | Pending owner confirmation | CD-9 follow-up workflow and future media upload |
| Domain/DNS/hosting/email account ownership | Pending owner confirmation | CD-7/CD-35 |
| Sanity implementation | Documented, not implemented | CD-22 |
| Contact form implementation | Strategy and design documented, not implemented | CD-28 |
| SEO metadata implementation | Matrix documented separately | CD-29 |
| Analytics strategy | Open | CD-38 |

No blocking inconsistency was found in the MVP design handoff set.

## Readiness Result

CD-18 readiness result: ready for CD-19 to begin Astro foundation work from the documented design, content, and implementation constraints.
