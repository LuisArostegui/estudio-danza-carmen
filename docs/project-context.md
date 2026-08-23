# Estudio de Danza Carmen - Project Context

This document is the lightweight source of truth for product scope, technical direction, design references, decisions, and open questions. GitHub issues remain the source of truth for issue-specific acceptance criteria.

## Product

Estudio de Danza Carmen is a dance school in Granada, Spain. Project context currently describes it as a school founded in 1988 and directed by Carmen Sanchez.

Known address:

```text
Calle Casillas de Prats, 10
18002 Granada
Spain
```

## Goals

Confirmed direction:

- Build the new official website for Estudio de Danza Carmen.
- Present the school as professional, close, human, inclusive, and safe.
- Make classes, schedules, teachers, facilities, performances, courses, RAD information, contact, and legal information discoverable.
- Support future editing by a non-technical editor.

## Positioning

Confirmed direction:

- Lead with ballet, training, experience, care, and continuity.
- Treat Royal Academy of Dance as an important trust signal without inventing specific accreditation claims before they are verified.
- Avoid presenting ballet as elitist or inaccessible.

## Audience

Confirmed direction:

- Families evaluating dance classes for children.
- Adults starting or returning to dance.
- Students looking for structured ballet training.
- People interested in RAD, courses, performances, or body-work classes.
- Existing students and families checking schedules or contact information.

## Tone Of Voice

Confirmed direction:

- Warm, respectful, close, professional, welcoming, and inclusive.
- Prefer clear, human language over institutional jargon.
- Communicate professionality without elitism.

## MVP

Confirmed for first-release planning:

- Home.
- Classes.
- Schedules.
- Teachers.
- Facilities.
- Performances.
- Courses.
- Royal Academy of Dance.
- Contact.
- Legal pages.

Detailed sitemap and navigation decisions live in [sitemap-and-navigation.md](sitemap-and-navigation.md).

## Deferred / Post-MVP

Deferred from the first release:

- Blog.
- Booking flows.
- Payments.
- Gift Dance.
- Friday events or reservable Friday plans.
- Ecommerce.

These are not rejected permanently. They are excluded from the initial MVP unless a later issue changes scope.

## Technical Direction

Confirmed direction:

- Use Astro as the primary frontend framework when application implementation begins.
- Use TypeScript.
- Prefer a static-first deployment model whenever possible.
- Use React only for interactive islands that justify client-side state or complex interaction.
- Keep JavaScript proportional to the interaction being implemented.

Open:

- Astro initialisation is tracked by CD-19.
- Final hosting and deployment strategy are tracked by CD-7.

## CMS

Confirmed direction:

- The site needs a CMS or equivalent editing workflow suitable for one non-technical editor.
- Expected editable content includes copy, images, classes, teachers, schedules, courses, performances, and related structured content.

Open:

- CMS provider and integration approach are not selected yet.
- Decision issue: CD-6.

## Design Reference

Confirmed direction:

- Arabesque is a visual and interaction reference, not a runtime dependency.
- The new site should rebuild the visual language with Astro, CSS, and owned components.
- WordPress, WPBakery, Slider Revolution, jQuery, demo markup, and copied theme CSS are not production architecture.

Open:

- Canonical design source will be linked when available.
- Penpot/design source decision is tracked by CD-10.
- Production design tokens are tracked by CD-11.

## Assets And Licensing

Confirmed boundary:

- Demo Arabesque images are not automatically licensed for this project.
- Arabesque logos are not final assets.
- Theme-bundled plugins must not be redistributed as project assets.
- Fonts, photos, videos, and other media need known rights before production use.
- Private certificates, purchase evidence, keys, and credentials must not be committed.

Open:

- Asset inventory and licensing review are tracked by CD-9.

## Forms

Confirmed direction:

- The site needs a contact flow.
- Expected fields include name, email, optional phone, message, and mandatory privacy acceptance.
- The final implementation must include server-side validation and anti-spam protection.

Open:

- Form provider, delivery mechanism, and anti-spam approach are tracked by CD-8.

## SEO

Confirmed direction:

- Local SEO matters for the project.
- Future work should support relevant searches for ballet and dance classes in Granada, adult ballet, children's ballet, RAD, Pilates, and related services.

Open:

- SEO matrix, metadata implementation, structured data, sitemap generation, and keyword research belong to later issues.

## Analytics

Confirmed direction:

- The project should eventually measure visits, contact intent, CTAs, class interest, schedules, RAD, courses, phone, and email interactions.

Open:

- Analytics strategy is tracked by CD-38.

## Accessibility

Confirmed direction:

- Accessibility is a core implementation constraint.
- Future UI work should preserve semantic HTML, keyboard navigation, visible focus, readable contrast, responsive behaviour, and reduced-motion support.

## Hosting And Deployment

Confirmed direction:

- Static-first Astro deployment is preferred unless later requirements prove a runtime is needed.

Open:

- Domain, DNS, preview environments, hosting, rollback, serverless needs, and production deployment are tracked by CD-7.

## Open Decisions

| Decision | Status | Issue |
| --- | --- | --- |
| Select CMS | Open | CD-6 |
| Select hosting and DNS strategy | Open | CD-7 |
| Select form provider and anti-spam approach | Open | CD-8 |
| Confirm asset rights and licensing | Open | CD-9 |
| Define canonical design source | Open | CD-10 |
| Define production visual tokens | Open | CD-11 |
| Define CMS content model | Open | CD-12 |
| Define analytics strategy | Open | CD-38 |

## Decision Log

| Decision | Status | Issue |
| --- | --- | --- |
| Use lightweight GitHub Issues and PR workflow | Confirmed | CD-1 |
| Maintain a living project context in `docs/project-context.md` | Confirmed | CD-2 |
| Use concise GitHub issue forms and disable blank issues | Confirmed | CD-3 |
| Use a small label taxonomy without priority labels initially | Confirmed | CD-4 |
| Use the MVP sitemap in `docs/sitemap-and-navigation.md` | Confirmed | CD-5 |
| Use Astro as the primary frontend framework | Confirmed direction | CD-19 |
| Use React only for justified interactive islands | Confirmed direction | CD-19 |

## Related Issues

- CD-1: repository foundation and workflow.
- CD-2: living project context.
- CD-3: issue forms and PR guidance.
- CD-4: repository label taxonomy.
- CD-5: MVP sitemap and navigation.
- CD-6 through CD-12: early product, content, hosting, design, and implementation decisions.
