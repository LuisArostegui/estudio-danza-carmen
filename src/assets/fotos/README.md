# Fotos de la web

Photos used by the site. Astro generates optimised sizes at build time.
Keep high-resolution originals in Synology (`Web carmen danza/`), not here.

| File                           | Origin                                                            | Rights                                                                                     | Used in (content file · slot)                                                                                                                                                            |
| ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `escenario-vestidos-rojos.jpg` | Synology `Web carmen danza/imagenes/14042024-_MG_7283-scaled.jpg` | Provided by Luis on 2026-11-18 for web use; consent records to confirm (students on stage) | `home/inicio.md` · hero slide 1, Instagram tile 1; `pages/sobre-nosotros.md` · hero                                                                                                      |
| `escenario-tutus-rosas.jpg`    | Synology `imagenes/14042024-_MG_7508-scaled.jpg`                  | Same as above                                                                              | `home/inicio.md` · hero slide 2, card «Clases de ballet», testimonials background (decorative), Instagram tile 2; `categories/clases-de-ballet-granada.md` · hero                        |
| `aula-barra.jpg`               | Synology `imagenes/P1010014-scaled.jpg`                           | Same as above                                                                              | `home/inicio.md` · hero slide 3, card «Ballet para adultos», RAD block, Instagram tile 3; `activities/ballet-para-adultos.md` · hero; `pages/sobre-nosotros.md` · #instalaciones photo 1 |
| `zapatillas-barra.jpg`         | Synology `imagenes/P1010236-scaled.jpg`                           | Same as above (no faces)                                                                   | `home/inicio.md` · hero slide 4, Instagram tile 4; `pages/sobre-nosotros.md` · #instalaciones photo 2                                                                                    |

All four are reused across several slots until more authorised photos arrive.
Crops (`focusDesktop` / `focusMobile`) were reviewed at 390, 768 and 1440 px on
2026-11-19: faces and main subjects stay in frame in every slot, so the values
were kept.

To replace a photo: drop the new file here and change its `src:` path in the
Markdown file under `src/content/` that uses it. Only add photos with recorded
permission (identifiable people need consent; minors need guardian consent).
Write alt text that says what the photo shows; leave it empty only where a link
or heading next to it already names it (decorative).

## Slots still waiting for an authorised photo

Every slot below shows an identified «Foto pendiente» gap in the preview.
Needs owner confirmation: which photos exist, with rights and consent.

| Priority | Screen                            | Slot (content file · field)                                                                                                                                                                                                              |
| -------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Inicio                            | `home/inicio.md` · card «Salud corporal» (barre or pilates class), card «Otras disciplinas» (sevillanas or another discipline)                                                                                                           |
| 1        | Inicio + Espectáculos             | `performances/*.md` · `photo` for each of the seven productions: Mary Poppins, Orquesta Clásica de Granada, Pulgarcita, La Bella y la Bestia, La Bella Durmiente, Alicia en el País de las Maravillas, La leyenda de las Princesas Cisne |
| 2        | Fichas de ballet                  | `activities/*.md` · `photo`: Diverballet, Pre Ballet, Ballet junior, Ballet nivel medio, Técnica de puntas, Repertorio clásico, Sesiones privadas                                                                                        |
| 2        | Ballet para adultos               | `activities/ballet-para-adultos.md` · `gallery`: barra, centro, grupo en escena                                                                                                                                                          |
| 2        | Fichas de salud corporal          | `activities/*.md` · `photo`: Pilates, Barre, Acondicionamiento físico para bailarines, Gimnasia senior, Salud para la mujer                                                                                                              |
| 2        | Fichas de otras disciplinas       | `activities/*.md` · `photo`: Sevillanas, Danza urbana, Contemporáneo, Bailes de salón, Bailes para bodas y eventos, Planes en Granada los viernes                                                                                        |
| 3        | Sobre nosotros                    | `pages/sobre-nosotros.md` · history gallery, portrait of Carmen Sánchez, teacher portraits, another room or reception                                                                                                                    |
| 3        | Salud corporal, Otras disciplinas | `categories/salud-corporal.md`, `categories/otras-disciplinas.md` · `photo` (category hero; the hero shows no photo block while it is empty)                                                                                             |
| 3        | Inicio                            | `home/inicio.md` · Instagram tiles 5 and 6                                                                                                                                                                                               |
