# Preview inventory by route

Branch `feat/preview-completion` (from `origin/main` at `0ca733f`). Session date
2026-11-19. Nothing merged, published or deployed. Local preview:
`http://127.0.0.1:4321/` (`.claude/launch.json` → `carmen-dev`).

Statuses: `complete` = verified and indexable; `review` = full content with
`noindex`, waiting for Elena's sign-off; `pending` = placeholder page with
`noindex`. Evidence = Playwright spec that covers the route at 390 and 1440 px
(screenshots in `test-results/preview-shots/`).

PDF references: `00` = «Estructura y desarrollo web», `01` = «Instrucciones
menú», `02` = «Menú». Page numbers are counted from each PDF's cover.

## Routes

| Route | Status | PDF · pages | Evidence | Issue | Needs owner confirmation |
| --- | --- | --- | --- | --- | --- |
| `/` | complete | 02 · 11–18 | `home*.spec.ts`, `sobre-nosotros.spec.ts` (gallery links) | #24, #26 | Five reviews (placeholders now), production photos, card photos for Salud and Otras, gift vouchers, Instagram handle |
| `/sobre-nosotros/` (#historia, #metodo, #profesorado, #rad, #escenario, #inclusion, #instalaciones) | review | 00 · 60–64 | `sobre-nosotros.spec.ts` | #24, #26, #27 | Other teachers' names, roles and portraits; Carmen's portrait; history gallery; classroom photos; «más de 15 grupos», «tres aulas», Vive tu Sueño awards (removed from copy); RAD designation |
| `/clases-de-ballet-granada/` | complete | 01 · 15–17 | `preview-flow.spec.ts`, `catalog.spec.ts` | #25 | «Más de 15 grupos» in the presentation block |
| 8 ballet fichas | 1 complete (adultos), 7 review | 00 · 20–35 | `catalog.spec.ts` | #25 | Ages and groupings (see below), schedules, photos, trial-class wording, «más de 30 años» |
| `/salud-corporal/` | review | 00 · 36–42; 02 · card text | `catalog.spec.ts` | #25 | Intro, presentation block and form title (proposed), category photo |
| 5 salud fichas | review | 00 · 36–42 | `catalog.spec.ts` | #25 | Teacher qualifications (pilates, women's health), PBT name, schedules, photos |
| `/otras-disciplinas/` | review | 00 · 43–51; 02 · card text | `catalog.spec.ts` | #25 | Intro, presentation block and form title (proposed), category photo |
| 6 otras fichas | review | 00 · 43–51 | `catalog.spec.ts` | #25 | 12-hour sevillanas intensives and next dates, dance styles taught, private groups, Viernes calendar |
| `/otras-disciplinas/planes-en-granada-los-viernes/` | review (informative) | 00 · 49–51 | `catalog.spec.ts` (no past-calendar claim) | #25 | Current Friday calendar (the dossier announced September 2026), per-class booking, price |
| `/espectaculos/` (7 anchors) | review | 00 · 55–57; 02 · 16 | `espectaculos.spec.ts`, `support-pages.spec.ts` | #27 | Photos per production with rights and consent, dates, venues |
| `/examenes-rad/` | review | 00 · 52–54 | `support-pages.spec.ts` | #27 | «Preparadora» vs «examinador oficial», exam venue, RAD figures, levels prepared now, RAD logo use |
| `/cursos/` | review (empty state; past courses move to «Cursos anteriores» without booking) | 00 · 58–59 | `support-pages.spec.ts`, `courses.spec.ts` | #27 | Upcoming courses (poster, teacher, dates, schedule, levels, price, places), booking channel |
| `/horarios/` | pending (example data) | 01 · 3 | `horarios.spec.ts`, `support-pages.spec.ts`, `check:public` | #28 | Real weekly timetable; public builds show an empty state, without the example notice or description |
| `/contacto/` | complete (form in test mode) | 02 · 17–18 | `preview-flow.spec.ts`, `support-pages.spec.ts` | #29, #43 | Mailbox and provider, privacy text, map pin, WhatsApp and phone |
| `/regala-danza/` | review (invites to ask; announces no voucher) | 02 · 16–17; 00 · 44 | `support-pages.spec.ts`, `home-sections.spec.ts` | #44 | Which vouchers exist, price, validity, delivery, redemption; Elena's original gift copy returns once confirmed |
| `/legal/privacy-policy/`, `/legal/legal-notice/`, `/legal/cookie-policy/` | pending | — | `support-pages.spec.ts` | #29 | Approved legal texts, data controller, owner details |
| unknown routes → 404 view | complete + noindex, HTTP 404 under `astro preview` | — | `support-pages.spec.ts` | — | Proposed error copy; the host must serve `404.html` with status 404 |
| Blog | not built (post-MVP backlog) | 01 · 3, 14 | — | — | Listed in 01 under «Otras páginas»; deferred with its articles |

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
