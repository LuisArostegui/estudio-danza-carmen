# Preview handoff

## Update 2026-11-19 · CD-28 contact form

- The enquiry form has a live mode (Turnstile widget, Worker POST, delivery
  states). It is inactive in the preview: `formEndpoint` is empty and no
  `PUBLIC_TURNSTILE_SITE_KEY` is set, so the form still runs in test mode.
- Configuration, response codes and owner items: `docs/contact-form-config.md`.
- E2E coverage of the live states runs against stubbed Turnstile and Worker:
  `tests/e2e/contact-form.spec.ts`.

---

## Update 2026-11-19 · branch `feat/preview-completion`

Every planned screen can now be walked in the local preview. Route inventory,
discrepancies and the owner checklist: `docs/preview-inventory.md`.

- New `review` status for categories and activities (noindex, not announced
  as «en preparación»). The 18 remaining fichas carry dossier copy; Salud
  corporal and Otras disciplinas landings are in review.
- New pages: `/sobre-nosotros/` (with `#profesorado` and `#instalaciones`),
  `/examenes-rad/`, `/cursos/` (empty state + `src/content/courses/`),
  `/regala-danza/`, `404`. Shared layout: `src/components/InfoPage.astro`,
  copy in `src/content/info/`.
- Inicio: the seven show tiles link to `/espectaculos/#slug` (from the
  `performances` collection). Header Escape closes the focused and hovered
  panels and keeps focus on the owning category.
- Horarios shows an empty state in public builds while the data is an example.
- Still pending: the three legal pages (approved texts) and Horarios (real
  timetable). Blog is post-MVP backlog.

Next session: start from `docs/preview-inventory.md` and the owner answers;
replace pending facts in `src/content/**` and move pages from `review` to
`complete` (and into `VERIFIED_ROUTES` / `VERIFIED_PAGES`) once Elena signs off.

---

## 2026-11-18 · Inicio → Clases de ballet → Ballet para adultos → Consulta

Branch `feat/preview-ballet-adultos` (from `main` at `160586c`). Nothing published,
merged or deployed. Session date: 2026-11-18.

## Decisions

- **Base:** Astro repo plus Elena's reference screenshot. The headline «El ballet es
  nuestra historia…» exists in no branch, commit or local copy, so no more advanced
  implementation was reused. The live WordPress site was left out of scope.
- **Content source:** local Markdown files in `src/content/` (schema in
  `src/content.config.ts`). Sanity (`src/lib/sanity/`, `studio/`) is untouched and
  stays available for later. No `.env` with Sanity credentials exists locally, so
  published Sanity content could not be inspected.
- **Routes:** Elena's category slugs (`/clases-de-ballet-granada/`,
  `/salud-corporal/`, `/otras-disciplinas/`) with activity pages nested under them
  (proposed: Elena gave no child slugs). Enquiry page: `/contacto/?actividad=<id>`.
- **One catalogue:** `src/lib/catalog.ts` feeds the header dropdowns, category cards
  and the form selector from the same `activities` collection.
- **Pending pages:** every visibly linked page that is not built renders an explicit
  "en preparación" page with `noindex` and `data-page-status="pending"` (never a
  404). Tests treat only `/`, `/clases-de-ballet-granada/`,
  `/clases-de-ballet-granada/ballet-para-adultos/` and `/contacto/` as verified.
- **Photos:** only one approved image exists (`src/assets/fotos/ballet-para-adultos-ia.png`,
  AI-generated, see `docs/asset-inventory.md`). Images embedded in Elena's Word
  files are Arabesque/stock references and are not shipped. Every other slot shows
  an identified "Foto pendiente" gap. The Synology folder did not respond during
  the session, so the originals could not be inspected.
- **Fonts:** Montserrat Variable and Pinyon Script (closest OFL script to the
  screenshot's calligraphy), self-hosted through `@fontsource`. Scriptina was not
  used because its licence is unverified.
- **Form:** test mode while `formEndpoint` in `src/content/school/escuela.md` is
  empty. A valid submission sends nothing and says so. The planned delivery is a
  Cloudflare Worker + Turnstile + Resend (`docs/contact-form-strategy.md`).
- **Hidden blocks:** testimonials (no real reviews), Regala danza and Instagram
  (no destination or material yet).
- **Preview notes:** pending facts are shown on the activity page for Elena. Set
  `PUBLIC_HIDE_PREVIEW_NOTES=true` at build time before any public release.

## Relevant files

- Content: `src/content/home/inicio.md`, `src/content/categories/*.md`,
  `src/content/activities/*.md` (`ballet-para-adultos.md` is the complete template),
  `src/content/school/escuela.md`.
- Photos: `src/assets/fotos/` (see its README).
- Components: `src/components/Photo.astro`, `EnquiryForm.astro`, `Carousel.astro`,
  `ActivityCard.astro`, `Breadcrumbs.astro`, `SiteHeader.astro`, `SiteFooter.astro`,
  `src/components/home/*`.
- Routes: `src/pages/index.astro`, `src/pages/[category]/index.astro`,
  `src/pages/[category]/[activity]/index.astro`, `src/pages/contacto/index.astro`,
  `src/pages/[...pending].astro`.
- Agents: `.claude/agents/carmen-*.md`; preview server: `.claude/launch.json`
  (`carmen-dev`).

## Pending

- Needs owner confirmation: see `pendingFacts` in the content files and the
  Obsidian note `Wiki/Pantallas y contenidos de Elena.md`.
- Authorised photos for the hero, class cards, RAD block, 7 productions and the
  adult class gallery.
- Form delivery: mailbox, provider account, privacy text, then a real end-to-end
  test of delivery and reply.
- The other 18 activity pages (apply the `ballet-para-adultos.md` template),
  Salud corporal and Otras disciplinas landings, Espectáculos, RAD, Cursos,
  Sobre nosotros, Horarios and the legal pages.

## Next step

Show Elena the 390 px and 1440 px captures, get decisions on hero scale and photo
crop, then fill the remaining activity pages from the dossier.
