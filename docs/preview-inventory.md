# Preview inventory by route

Last update: branch `feat/preview-visual-close` (from `origin/main` at
`2deeabe`, after #71), 2026-11-19. Previous update: `feat/preview-completion`
(#71). Nothing merged, published or deployed. Local preview:
`http://127.0.0.1:4321/` (`.claude/launch.json` → `carmen-dev`).

Statuses: `complete` = verified and indexable; `review` = full content with
`noindex`, waiting for Elena's sign-off; `pending` = placeholder page with
`noindex`. Evidence = Playwright spec that covers the route at 390 and 1440 px
(screenshots in `test-results/preview-shots/`); `responsive-review.spec.ts`
adds 768 px (and 1024 px for the home hero).

PDF references: `00` = «Estructura y desarrollo web», `01` = «Instrucciones
menú», `02` = «Menú». Page numbers are counted from each PDF's cover.

## Visual close · 2026-11-19 (#30 photos, #32 responsive)

**Elena's approval:** none received yet. No page changed status and no
`pendingFacts` entry was replaced; `VERIFIED_ROUTES` and `VERIFIED_PAGES` are
unchanged. Every unconfirmed fact stays as Needs owner confirmation.

**Photos:** no new authorised photos were provided. The site still uses the
four photos in `src/assets/fotos/` (consent records still to confirm). The
exact list of slots that still need a photo, by priority, is in
`src/assets/fotos/README.md` → «Slots still waiting for an authorised photo»:
2 Inicio class cards, 7 productions (Inicio tiles + Espectáculos), 18 ficha
heroes, 3 adult-class gallery photos, Sobre nosotros (history gallery,
portraits, another room), 2 category heroes and 2 Instagram tiles.

**Responsive review at 390, 768 and 1440 px:**

| Check                                    | Result                                                                                                                                                                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Horizontal overflow, all 33 built routes | None at 390, 768 or 1440 px                                                                                                                                                                                                                                                          |
| Home hero, carousel arrows               | **Fixed.** At 768 px the left arrow covered the first letter of «TUYA.». The copy now keeps clear of both arrows (checked at 390, 768, 1024–1080, 1280 and 1440 px); 1440 px is unchanged                                                                                            |
| Home hero, text over the four photos     | **Fixed from 768 to 1280 px.** The veil faded out before the copy ended (body text down to 2.6:1 at 768 px, title down to 2.6:1 between 1025 and 1152 px). The wider veil now covers 48–80rem; swept 768–1440 px in 16 px steps on all four slides: title ≥ 5.1:1, body text ≥ 7.1:1 |
| Home hero at 390 px                      | Text sits below the photo on the solid stage colour (≥ 15:1)                                                                                                                                                                                                                         |
| Show tiles (Inicio)                      | No photos yet: labels sit on the dark gap tiles                                                                                                                                                                                                                                      |
| Crops of the four photos in every slot   | Faces and main subjects stay in frame; focus values kept                                                                                                                                                                                                                             |

**Visual change:** accepted in review on 2026-11-19. Still open: purging
the cached copies of the early public captures (owner checklist item 13).

**Owner decisions needed for this pass:** which production, class and team
photos can be used (with rights and guardian consent), and sign-off per screen
from the captures (shared privately, not in the PR, because the photos' consent is still pending).

## Routes

| Route                                                                                               | Status                                                                                                                                                                 | PDF · pages                | Evidence                                                               | Issue         | Needs owner confirmation                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                                                                 | complete                                                                                                                                                               | 02 · 11–18                 | `home*.spec.ts`, `sobre-nosotros.spec.ts` (gallery links)              | #24, #26      | Five reviews (placeholders now), production photos, card photos for Salud and Otras, gift vouchers, Instagram handle                                                                          |
| `/sobre-nosotros/` (#historia, #metodo, #profesorado, #rad, #escenario, #inclusion, #instalaciones) | review                                                                                                                                                                 | 00 · 60–64                 | `sobre-nosotros.spec.ts`                                               | #24, #26, #27 | Other teachers' names, roles and portraits; Carmen's portrait; history gallery; classroom photos; «más de 15 grupos», «tres aulas», Vive tu Sueño awards (removed from copy); RAD designation |
| `/clases-de-ballet-granada/`                                                                        | complete                                                                                                                                                               | 01 · 15–17                 | `preview-flow.spec.ts`, `catalog.spec.ts`                              | #25           | «Más de 15 grupos» in the presentation block                                                                                                                                                  |
| 8 ballet fichas                                                                                     | 1 complete (adultos), 7 review                                                                                                                                         | 00 · 20–35                 | `catalog.spec.ts`                                                      | #25           | Ages and groupings (see below), schedules, photos, trial-class wording, «más de 30 años»                                                                                                      |
| `/salud-corporal/`                                                                                  | review                                                                                                                                                                 | 00 · 36–42; 02 · card text | `catalog.spec.ts`                                                      | #25           | Intro, presentation block and form title (proposed), category photo                                                                                                                           |
| 5 salud fichas                                                                                      | review                                                                                                                                                                 | 00 · 36–42                 | `catalog.spec.ts`                                                      | #25           | Teacher qualifications (pilates, women's health), PBT name, schedules, photos                                                                                                                 |
| `/otras-disciplinas/`                                                                               | review                                                                                                                                                                 | 00 · 43–51; 02 · card text | `catalog.spec.ts`                                                      | #25           | Intro, presentation block and form title (proposed), category photo                                                                                                                           |
| 6 otras fichas                                                                                      | review                                                                                                                                                                 | 00 · 43–51                 | `catalog.spec.ts`                                                      | #25           | 12-hour sevillanas intensives and next dates, dance styles taught, private groups, Viernes calendar                                                                                           |
| `/otras-disciplinas/planes-en-granada-los-viernes/`                                                 | review (informative)                                                                                                                                                   | 00 · 49–51                 | `catalog.spec.ts` (no past-calendar claim)                             | #25           | Current Friday calendar (the dossier announced September 2026), per-class booking, price                                                                                                      |
| `/espectaculos/` (7 anchors)                                                                        | review                                                                                                                                                                 | 00 · 55–57; 02 · 16        | `espectaculos.spec.ts`, `support-pages.spec.ts`                        | #27           | Photos per production with rights and consent, dates, venues                                                                                                                                  |
| `/examenes-rad/`                                                                                    | review                                                                                                                                                                 | 00 · 52–54                 | `support-pages.spec.ts`                                                | #27           | «Preparadora» vs «examinador oficial», exam venue, RAD figures, levels prepared now, RAD logo use                                                                                             |
| `/cursos/`                                                                                          | review (empty state; booking only with a structured future date, «Fecha por confirmar» + enquiry link without one, past courses in «Cursos anteriores» without a link) | 00 · 58–59                 | `support-pages.spec.ts`, `courses.spec.ts`, `check:courses` (fixtures) | #27           | Upcoming courses (poster, teacher, dates, schedule, levels, price, places), booking channel                                                                                                   |
| `/horarios/`                                                                                        | pending (example data)                                                                                                                                                 | 01 · 3                     | `horarios.spec.ts`, `support-pages.spec.ts`, `check:public`            | #28           | Real weekly timetable; public builds show an empty state, without the example notice or description                                                                                           |
| `/contacto/`                                                                                        | complete (form in test mode)                                                                                                                                           | 02 · 17–18                 | `preview-flow.spec.ts`, `support-pages.spec.ts`                        | #29, #43      | Mailbox and provider, privacy text, map pin, WhatsApp and phone                                                                                                                               |
| `/regala-danza/`                                                                                    | review (invites to ask; announces no voucher)                                                                                                                          | 02 · 16–17; 00 · 44        | `support-pages.spec.ts`, `home-sections.spec.ts`                       | #44           | Which vouchers exist, price, validity, delivery, redemption; Elena's original gift copy returns once confirmed                                                                                |
| `/legal/privacy-policy/`, `/legal/legal-notice/`, `/legal/cookie-policy/`                           | pending                                                                                                                                                                | —                          | `support-pages.spec.ts`                                                | #29           | Approved legal texts, data controller, owner details                                                                                                                                          |
| unknown routes → 404 view                                                                           | complete + noindex, HTTP 404 under `astro preview`                                                                                                                     | —                          | `support-pages.spec.ts`                                                | —             | Proposed error copy; the host must serve `404.html` with status 404                                                                                                                           |
| Blog                                                                                                | not built (post-MVP backlog)                                                                                                                                           | 01 · 3, 14                 | —                                                                      | —             | Listed in 01 under «Otras páginas»; deferred with its articles                                                                                                                                |

## Discrepancies kept open

- **Pre Ballet age:** 4–6 in the 01 keywords, 5–7 in the menu and in 00.
- **Ballet junior:** the menu says «según edad», the 01 keywords say 6–8, and 00
  describes «Ballet por niveles (8 a 15 años)». The ficha describes the group by
  level and invites to ask; no age range is shown.
- **Nivel medio:** 15–18 in 00, «9+» in the 01 keywords. The ficha describes the
  group by level; no age range is shown.
- **Pre Ballet and Diverballet** still show Elena's menu ages (5–7, 3–4) in the
  menu, title and copy.
- **Diverballet:** 3–4 in the menu and in 00, «3 años» in the 01 keywords.
- **RAD designation:** «escuela preparadora oficial» (00 · Sobre nosotros, 02 ·
  Inicio, 01 · p. 3) vs «centro preparador y examinador oficial» (00 · RAD).
  `/examenes-rad/` uses neither.
- **Espectáculos:** 01 · p. 2 lists the productions under the menu, 01 · p. 13
  defines a direct link. The direct link and in-page anchors are kept.
- **Years:** «más de 35 años» (Inicio, Sobre nosotros) vs «más de 30 años»
  (fichas).

## Owner checklist (Elena / Luis)

1. Photo permissions: production photos, class photos, teachers, classrooms,
   minors' guardian consent.
2. Team: names, roles and portraits besides Carmen Sánchez.
3. Facilities: number of rooms, photos of rooms and reception.
4. Ages and current offer for every ballet group.
5. RAD accreditation wording and exam venue.
6. Weekly timetable.
7. Courses and workshops.
8. Gift vouchers: types, price, validity, delivery, redemption.
9. Reviews: five authorised Google reviews.
10. Map pin, WhatsApp and phone.
11. Mailbox and form delivery provider.
12. Legal texts.
13. Cached preview captures (open): the capture branch from the visual-close
    PR was deleted, but its commit is still served by SHA without signing in.
    Luis asks GitHub Support to purge it (commit id in the private session
    notes, not in this repo). Keep open while photo consent is pending.
