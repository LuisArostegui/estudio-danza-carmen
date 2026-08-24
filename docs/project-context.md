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
- Use Cloudflare Workers Static Assets as the selected hosting direction when deployment work begins, keeping static output as the default and adding only proportionate Worker code where needed.

Open:

- Astro initialisation is tracked by CD-19.
- Production deployment and DNS cutover are tracked by CD-35.

## CMS

Confirmed direction:

- Use Sanity as the selected CMS/editing workflow for one non-technical editor.
- Expected editable content includes copy, images, classes, teachers, schedules, courses, performances, and related structured content.
- Keep private evidence, consent documents, credentials, and legal records outside the CMS.
- Details live in [cms-selection.md](cms-selection.md).

Open:

- Sanity content model is defined in [sanity-content-model.md](sanity-content-model.md).
- Sanity integration is tracked by CD-22.

## Design Reference

Confirmed direction:

- Arabesque is a visual and interaction reference, not a runtime dependency.
- The new site should rebuild the visual language with Astro, CSS, and owned components.
- WordPress, WPBakery, Slider Revolution, jQuery, demo markup, and copied theme CSS are not production architecture.

Confirmed direction:

- Canonical design source structure is documented in [design-source.md](design-source.md), with the real private Penpot file URL, owner, access level, and review status recorded.
- Production visual foundations are documented in [visual-foundations.md](visual-foundations.md), and the owner confirmed on 2026-08-24 that they are represented in Penpot.
- Home implementation handoff is documented in [design-home.md](design-home.md).
- Shared navigation, footer, and site-wide state handoff is documented in [design-site-shell.md](design-site-shell.md).

## Assets And Licensing

Confirmed boundary:

- The practical asset, licence, and consent inventory lives in [asset-inventory.md](asset-inventory.md).
- Demo Arabesque images are not automatically licensed for this project.
- Arabesque logos are not final assets.
- Theme-bundled plugins must not be redistributed as project assets.
- Fonts, photos, videos, and other media need known rights before production use.
- Private certificates, purchase evidence, keys, and credentials must not be committed.
- Identifiable-person photos, videos, and testimonials require consent status before publication.

Open:

- Real Carmen media files, photographer rights, and consent evidence need owner confirmation before production use.

## Forms

Confirmed direction:

- The site needs a contact flow.
- Expected fields include name, email, optional phone, message, and mandatory privacy acceptance.
- The final implementation must include server-side validation and anti-spam protection.
- Use a Cloudflare Worker contact endpoint with Turnstile and Resend as the selected form approach.
- The form destination email must remain configurable; API keys and anti-spam secrets must be provider secrets, not repository content.
- Resend transactional sending should use a dedicated sending subdomain such as `send.carmendanza.es` so its DNS records do not interfere with the existing mailbox service.
- Store no contact submissions in the public repository, CMS, or project database for MVP; the operational copy is the delivered email.
- Do not send an automatic visitor confirmation email in the first implementation.
- Details live in [contact-form-strategy.md](contact-form-strategy.md).

Open:

- Final privacy/legal text must be completed before form implementation.
- Contact form implementation is tracked by CD-28.

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

- Use Cloudflare Workers Static Assets as the selected hosting direction for the future Astro site.
- Use GitHub-connected preview deployments for pull requests/branches.
- Use `carmendanza.es` as the current public domain to preserve during migration.
- Public DNS evidence currently shows `carmendanza.es` and `www.carmendanza.es` resolving to `104.45.28.146`, nameservers under `gestiondecuenta.com`, and mail records under `dsmail.es`.
- Preserve current email-related DNS records unless the owner explicitly migrates email.
- Before production cutover, crawl/export the current WordPress URLs, map relevant legacy URLs to new canonical routes, and deploy permanent 301 redirects so indexed or linked URLs do not silently become 404s.
- Details live in [hosting-and-deployment.md](hosting-and-deployment.md).

Open:

- Needs owner confirmation: registrar, renewal date, DNS access, current hosting account, billing/account owner, and email account access.
- Production deployment and DNS cutover are tracked by CD-35.

## Open Decisions

| Decision | Status | Issue |
| --- | --- | --- |
| Define canonical design source | Defined | CD-10 |
| Define production visual tokens | Confirmed in repository and Penpot | CD-11 |
| Define CMS content model | Defined | CD-12 |
| Complete responsive Home implementation handoff | Defined | CD-13 |
| Complete shared site-shell implementation handoff | Defined | CD-15 |
| Confirm registrar, renewal date, DNS/hosting/email access, and account owner | Needs owner confirmation | CD-7 |
| Verify real Carmen media rights and consent evidence | Needs owner confirmation | CD-9 |
| Define analytics strategy | Open | CD-38 |

## Decision Log

| Decision | Status | Issue |
| --- | --- | --- |
| Use lightweight GitHub Issues and PR workflow | Confirmed | CD-1 |
| Maintain a living project context in `docs/project-context.md` | Confirmed | CD-2 |
| Use concise GitHub issue forms and disable blank issues | Confirmed | CD-3 |
| Use a small label taxonomy without priority labels initially | Confirmed | CD-4 |
| Use the MVP sitemap in `docs/sitemap-and-navigation.md` | Confirmed | CD-5 |
| Use Sanity as the CMS/editing workflow | Confirmed | CD-6 |
| Use Cloudflare Workers Static Assets as the hosting direction | Confirmed with owner-confirmation dependency | CD-7 |
| Use a Cloudflare Worker contact endpoint with Turnstile and Resend | Confirmed | CD-8 |
| Use `docs/asset-inventory.md` as the asset, licence, and consent inventory | Confirmed | CD-9 |
| Use Penpot as the canonical private design source owned by Luis | Defined | CD-10 |
| Use the repository visual foundations as the MVP token baseline reflected in Penpot | Confirmed | CD-11 |
| Use the structured Sanity content model in `docs/sanity-content-model.md` for future schema implementation | Confirmed | CD-12 |
| Use `docs/design-home.md` as the Home page implementation handoff | Confirmed | CD-13 |
| Use `docs/design-site-shell.md` as the shared site-shell implementation handoff | Confirmed | CD-15 |
| Use Astro as the primary frontend framework | Confirmed direction | CD-19 |
| Use React only for justified interactive islands | Confirmed direction | CD-19 |

## Related Issues

- CD-1: repository foundation and workflow.
- CD-2: living project context.
- CD-3: issue forms and PR guidance.
- CD-4: repository label taxonomy.
- CD-5: MVP sitemap and navigation.
- CD-6 through CD-12: early product, content, hosting, design, and implementation decisions.
