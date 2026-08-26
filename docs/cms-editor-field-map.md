# CMS Editor Field Map

This guide helps a non-technical editor understand which Sanity field changes which visible part of the website.

## How To Preview Field Keys

Open the local or preview website and add this query parameter:

```text
?cms=keys
```

Example:

```text
http://localhost:4321/?cms=keys
```

In this mode, visible Home text is replaced with the internal Sanity field key and outlined with a dashed blue border. It is only a local/preview debugging helper for editors and developers; it does not change Sanity content. Remove the query parameter to see the normal published content again.

## Home

Sanity path: `Structure > Inicio`

| Studio field                    | Sanity key                       | Visible website area                                | Current recommended content                                                                 |
| ------------------------------- | -------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Titular principal               | `homeContent.title`              | Large uppercase hero headline over the ballet image | `El movimiento` then line break, then `se convierte en arte`                                |
| Texto decorativo superior       | `homeContent.scriptLabel`        | Script-style phrase above the large hero headline   | `Dance with soul`                                                                           |
| Texto introductorio del hero    | `homeContent.intro`              | Short paragraph below the large hero headline       | `Danza clásica y contemporánea para descubrir una técnica más libre, expresiva y personal.` |
| Boton principal > Label         | `homeContent.primaryCta.label`   | Pink hero button text                               | `Descubrir clases`                                                                          |
| Boton principal > URL or path   | `homeContent.primaryCta.href`    | Pink hero button destination                        | `/classes/`                                                                                 |
| Enlace secundario > Label       | `homeContent.secondaryCta.label` | Underlined hero link text                           | `Conócenos`                                                                                 |
| Enlace secundario > URL or path | `homeContent.secondaryCta.href`  | Underlined hero link destination                    | `/#academia`                                                                                |
| Imagen principal                | `homeContent.heroMedia`          | Optional hero background image from Sanity          | Leave empty until production image rights are approved.                                     |
| Etiqueta de la seccion academia | `homeContent.academyEyebrow`     | Small uppercase label above the academy block title | `Academia`                                                                                  |
| Titulo de la seccion academia   | `homeContent.academyTitle`       | Heading below the hero                              | `Estudio de Danza Carmen`                                                                   |
| Texto de la seccion academia    | `homeContent.academyIntro`       | Paragraph below the academy heading                 | `Escuela de danza en Granada con una trayectoria cercana y cuidada.`                        |
| Clases destacadas               | `homeContent.featuredClasses`    | Future home class links                             | Leave empty for now.                                                                        |
| SEO                             | `homeContent.seo`                | Search/social metadata                              | Leave empty for now unless a specific metadata task asks for it.                            |

## Site Settings

Sanity path: `Structure > Ajustes del sitio`

These fields control the shared header and footer. They appear on every page, so changes here should be treated as global site changes.

| Studio field                 | Sanity key                                                                                                     | Visible website area                          | Current recommended content                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| Site name                    | `siteSettings.siteName`                                                                                        | Default page title and footer business name   | `Estudio de Danza Carmen`                                           |
| Visible brand label          | `siteSettings.brandLabel`                                                                                      | Header logo text                              | `Danza Carmen`                                                      |
| Top bar message              | `siteSettings.topbarMessage`                                                                                   | Pink top bar left text                        | `Bienvenidos a nuestra academia de danza`                           |
| Public email                 | `siteSettings.email`                                                                                           | Top bar email link                            | Owner-confirmed public email.                                       |
| Public address               | `siteSettings.address`                                                                                         | Top bar address and footer address            | `Calle Casillas de Prats, 10` then line break, then `18002 Granada` |
| Visible phone label          | `siteSettings.phoneLabel`                                                                                      | Top bar phone text                            | `Teléfono pendiente` until the public number is confirmed.          |
| Footer note                  | `siteSettings.footerNote`                                                                                      | Paragraph under footer address                | `Contacto y horarios de atención pendientes de confirmación.`       |
| Header navigation            | `siteSettings.headerNavigation[].label`                                                                        | Main desktop/mobile menu labels               | Inicio, Academia, Clases, Horarios, Contacto.                       |
| Footer primary group title   | `siteSettings.footerPrimaryTitle`                                                                              | First footer navigation heading               | `Principal`                                                         |
| Footer primary navigation    | `siteSettings.footerPrimaryNavigation[].label`                                                                 | First footer navigation links                 | Inicio, Clases, Horarios, Profesorado, RAD, Contacto.               |
| Footer secondary group title | `siteSettings.footerSecondaryTitle`                                                                            | Second footer navigation heading              | `También en la escuela`                                             |
| Footer secondary navigation  | `siteSettings.footerSecondaryNavigation[].label`                                                               | Second footer navigation links                | Instalaciones, Actuaciones, Cursos.                                 |
| Footer legal group title     | `siteSettings.footerLegalTitle`                                                                                | Legal footer navigation heading               | `Legal`                                                             |
| Footer legal navigation      | `siteSettings.footerLegalNavigation[].label`                                                                   | Legal footer links                            | Aviso legal, Política de privacidad, Política de cookies.           |
| Search link aria label       | `siteSettings.searchLabel`                                                                                     | Header search icon accessible name            | `Buscar clases`                                                     |
| Mobile menu label            | `siteSettings.menuLabel`                                                                                       | Mobile menu button text                       | `Menú`                                                              |
| Navigation aria labels       | `siteSettings.mainNavigationLabel`, `siteSettings.mobileNavigationLabel`, `siteSettings.footerNavigationLabel` | Accessibility labels for navigation landmarks | Keep short and descriptive.                                         |

Use `?cms=keys` to confirm these mappings in the browser. Header and footer labels should turn into their Sanity keys the same way Home fields do.

## Media Rules

Do not upload or select production media unless rights and consent are known.

| Situation                              | What to do                                                                                                                                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The image is only decorative           | Mark `Decorative image`. Alt text is not needed.                                                                                                                                                                                          |
| The image communicates useful content  | Add clear `Alt text`.                                                                                                                                                                                                                     |
| The image licence is not confirmed     | Remove the image from the CMS field, or keep it pending only while editing. The website will ignore pending hero media and keep the local fallback; `pnpm check:content` remains strict and will fail until production media is approved. |
| The image includes identifiable people | Only use it in production when consent status is `Yes`.                                                                                                                                                                                   |
| Open Graph image is not needed         | Leave `SEO > Open Graph image` empty.                                                                                                                                                                                                     |

## Home Visual Reference

The first screen should continue matching the Arabesque visual reference: pastel topbar, white header, script label, full-bleed ballet hero image, large uppercase headline, pink CTA, underlined secondary CTA, and dark footer. Changing CMS text should not change the layout or visual style.
