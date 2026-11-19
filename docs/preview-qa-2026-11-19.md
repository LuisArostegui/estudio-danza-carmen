# Preview QA Evidence · 2026-11-19

Refs #32, #33, #34, #28, #35.

Base commit: `458c0ca` (`origin/main` after #77), in an isolated worktree on
branch `qa/preview-contact-hosting`. Fixes in this branch are listed under
**Changes made**; measurements marked _after_ include them.

Environment: macOS (Darwin 27.2), Node 22.23.5, pnpm 11.21.0, Wrangler 4.164.0
(`wrangler dev`, local Workers runtime serving `dist` and `/api/*`), Lighthouse
12.8.2 with headless Chrome, Playwright 1.65 (Chromium and Playwright WebKit).
Build: `PUBLIC_HIDE_PREVIEW_NOTES=true pnpm build` (34 pages, 11 MB `dist`).

Evidence types: **Manual** (a person at a real browser or screen reader),
**Automated** (repeatable script or test), **Simulated** (real code with test
keys or stubbed services), **Verified send** (a real email delivered).

## Summary

| #   | Check                                                      | Type          | Result                                                 |
| --- | ---------------------------------------------------------- | ------------- | ------------------------------------------------------ |
| 1   | Safari on macOS: journey, menu, focus, Horarios, form      | Manual        | **Pending**: needs a person (see Pending cases)        |
| 2   | Safari on iOS                                              | Manual        | **Pending**: no device access                          |
| 3   | VoiceOver on macOS and iOS                                 | Manual        | **Pending**: needs a person                            |
| 4   | Real browser zoom at 200 %                                 | Manual        | **Pending**: needs a person                            |
| 5   | Accessibility tree of the contact form (VoiceOver proxy)   | Automated     | Pass, after fix of defect D1                           |
| 6   | Ballet ficha → Contacto with the activity preselected      | Automated     | Pass                                                   |
| 7   | Lighthouse mobile, 4 routes × 3 runs                       | Automated     | Pass after fix of defect D2 (CLS)                      |
| 8   | Technical SEO over HTTP and generated HTML                 | Automated     | Findings S1–S6; preview noindex fixed                  |
| 9   | Worker and validation unit tests                           | Automated     | 56/56 pass (62 with the new review-build tests)        |
| 10  | Local Worker + Static Assets + `/api/contact` (Wrangler)   | Simulated     | Pass                                                   |
| 11  | Live form with Turnstile test keys                         | Simulated     | Pass (403 verification path)                           |
| 12  | Real email delivery and reply-to                           | Verified send | **Pending**: account, sender and mailbox not confirmed |
| 13  | Review build noindex headers (`wrangler dev --env review`) | Automated     | Pass                                                   |
| 14  | Deployed private preview behind Access                     | Manual        | **Pending**: not deployed, needs authorisation         |

## Defects Found And Fixed

### D1 · Privacy checkbox click lost after correcting the form

- **Reproduce (before fix):** open `/contacto/`, press «Enviar consulta» with
  the form empty, type a name, email and a message of at least 10 characters,
  then click the privacy checkbox directly from the message field.
- **Observed:** the checkbox stays unchecked. On `mousedown` focus leaves the
  message field, `focusout` re-validates it and removes its error line, and the
  checkbox moves up 27–28 px before `mouseup` (measured: y 450 → 423 in
  Chromium, 450 → 422 in WebKit, at 390×844). The click lands outside the
  control. The submit button below can miss clicks the same way.
- **Fix:** `EnquiryForm.astro` also re-validates already invalid fields on
  `input`, so the error clears while typing and nothing moves under the pointer.
- **Test:** `contact-form.spec.ts` → «fixing fields after an empty submit does
  not move the next control under the pointer». Fails without the fix, passes
  with it (390 and 1440).

### D2 · Layout shift on Ballet para adultos

- **Observed:** Lighthouse mobile CLS 0.179 in 3 of 3 runs (Good is ≤ 0.1). The
  culprit was `header.activity-hero` when the Montserrat web font replaced the
  system fallback.
- **Fix:** a metric-matched local fallback, `Montserrat Fallback` (Arial with
  Montserrat's size and ascent overrides), in `global.css`. No extra request.
- **Result:** CLS 0.000 in 3 of 3 runs; other routes unchanged or better.
  Measured on macOS headless Chrome, where Arial exists. The fallback also
  lists Arimo and Liberation Sans (Arial-metric fonts) and Helvetica; on a
  device with none of them the override is skipped and the original shift may
  remain. Confirm with field data or a real Android device.

### D3 · Review deploys would have been indexable

- **Observed:** the four verified routes (`/`, ballet index, Ballet para
  adultos, Contacto) have no `robots` meta and no `X-Robots-Tag`. Deployed as a
  review URL they could be indexed if Access failed.
- **Fix:** `pnpm build:review` writes a separate `dist-review/` artifact (meta
  `noindex` on every page, `_headers` with `X-Robots-Tag: noindex, nofollow`)
  and checks it is complete; `env.review` serves only `dist-review/`, and
  `pnpm deploy:review` re-checks it before uploading. See
  [private-review-preview.md](private-review-preview.md).

## Performance (Lighthouse Mobile)

Profile: Lighthouse 12.8.2 default mobile (Moto G Power emulation, 412 px,
simulated throttling: 150 ms RTT, 1.6 Mbps, 4× CPU slowdown), headless Chrome,
benchmark index 4627, against `wrangler dev` on `127.0.0.1`. Local laboratory
data only: no CDN, HTTP/1.1, no real network. Medians of three runs.

| Route               | Perf (before → after) | LCP median      | CLS (before → after) | TBT  | Transfer | Images | JS   | CSS   | Fonts |
| ------------------- | --------------------- | --------------- | -------------------- | ---- | -------- | ------ | ---- | ----- | ----- |
| `/`                 | 99 → 99               | 1.81 s → 1.74 s | 0.002 → 0.001        | 0 ms | 174 KB   | 71 KB  | 3 KB | 12 KB | 76 KB |
| Ballet index        | 100 → 100             | 1.58 s → 1.59 s | 0.000 → 0.000        | 0 ms | 91 KB    | 34 KB  | 3 KB | 9 KB  | 37 KB |
| Ballet para adultos | 92 → 100              | 1.51 s → 1.51 s | **0.179 → 0.000**    | 0 ms | 79 KB    | 20 KB  | 3 KB | 9 KB  | 37 KB |
| Contacto            | 100 → 100             | 1.51 s → 1.51 s | 0.005 → 0.003        | 0 ms | 93 KB    | 0 KB   | 3 KB | 8 KB  | 76 KB |

Accessibility 100, Best practices 96, SEO 100 on all four (first run).

LCP element: the hero photo (AVIF) on Inicio, ballet index and adultos; the H1
on Contacto. Remaining opportunities:

- Render-blocking CSS, estimated 0.6–0.75 s under simulated throttling. Small
  at these sizes; revisit only if field data disagrees.
- `uses-responsive-images` on the ballet index: about 16 KB saving.
- `/favicon.ico` returns 404 on every page (Best practices 96). Needs the
  owner's logo or favicon; none is invented here.
- Fonts are the largest asset class on Contacto (76 KB, Montserrat plus
  Cormorant). Acceptable for now.

## Technical SEO

Checked over HTTP (`wrangler dev`) and in `dist`.

| Route                    | Status | Title                                                                 | Description | H1  | robots    |
| ------------------------ | ------ | --------------------------------------------------------------------- | ----------- | --- | --------- |
| `/`                      | 200    | Estudio de Danza Carmen · Escuela de ballet en Granada                | yes         | 1   | indexable |
| Ballet index             | 200    | Clases de ballet en Granada · Estudio de Danza Carmen                 | yes         | 1   | indexable |
| Ballet para adultos      | 200    | Ballet para adultos – Clases de danza clásica para adultos en Granada | yes         | 1   | indexable |
| `/contacto/`             | 200    | Consulta · Estudio de Danza Carmen                                    | yes         | 1   | indexable |
| `/horarios/`             | 200    | Horarios · Estudio de Danza Carmen                                    | yes         | 1   | noindex   |
| `/legal/privacy-policy/` | 200    | Política de privacidad · Estudio de Danza Carmen (stub text)          | no          | 1   | noindex   |
| `/no-existe/`            | 404    | Página no encontrada · Estudio de Danza Carmen                        | no          | 1   | noindex   |

Findings:

- **S1 · No canonical URLs.** None are emitted. They need the final domain and
  canonical host (root or `www`), which are not confirmed. Do not add them for
  the review URL.
- **S2 · No `robots.txt`** (404). Add for production only, pointing to the
  sitemap.
- **S3 · No sitemap** (`/sitemap.xml` and `/sitemap-index.xml` are 404). Needs
  the final `site` URL in `astro.config.mjs`; should list only complete pages.
- **S4 · No structured data.** The matrix allows `LocalBusiness` with confirmed
  fields only (name, address). Phone, email, hours and social links still need
  confirmation.
- **S5 · No Open Graph tags.** Need approved images and the final domain.
- **S6 · Contacto title** is «Consulta · …», the matrix says «Contacto | …».
  Copy decision for Elena; left unchanged.
- Preview indexing: fixed for review deploys (D3).

To repeat with final content (#34): run the table above against the production
build and the real domain, plus `curl -sI` for `X-Robots-Tag` (must be absent
in production), canonical equal to the final URL, `robots.txt`, sitemap
listing only complete pages, and the Rich Results test for `LocalBusiness`.

## Accessibility Tree Of The Contact Form

Automated with Playwright `ariaSnapshot` at 390×844 in Chromium and WebKit, on
`/contacto/?actividad=ballet-para-adultos`. This is what the browser exposes to
assistive technology; it is not a VoiceOver recording.

- Landmarks: banner, main, contentinfo; region «¿Te gustaría bailar con
  nosotros?», breadcrumb navigation «Migas de pan», one H1, region «Formulario
  de consulta», region «Datos de contacto y mapa» with an H2.
- Controls: textboxes «Nombre», «Correo electrónico», «Cuéntanos qué estás
  buscando», «Teléfono (opcional)»; combobox «Clase o disciplina de interés»
  (preselected «Ballet para adultos» from the ficha link); checkbox «He leído y
  acepto la política de privacidad.» with its link; button «Enviar consulta».
- Empty submit: an `alert` with «Revisa los datos marcados:» and four links to
  the fields receives focus; the four fields become `invalid` with their
  messages.
- Valid submit in test mode: the `status` region reads «Modo de prueba: tu
  consulta es válida, pero todavía no se envía a ningún buzón…».

## Contact Worker

- Live mode needs both `formEndpoint: "/api/contact"` in
  `src/content/school/escuela.md` and `PUBLIC_TURNSTILE_SITE_KEY` at build time;
  the Worker needs `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `RESEND_API_KEY`
  and `TURNSTILE_SECRET_KEY`. Current `main`: `formEndpoint` is empty, so the
  form is in test mode.
- Local Worker with Static Assets (`wrangler dev`, no secrets): pages 200,
  unknown path 404 page, `GET /api/contact` → 405 `method`, form `POST` → 503
  `not_configured`, `/api/otro` → 404.
- Simulated live mode: temporary build with `formEndpoint` set and Cloudflare's
  public Turnstile test site key `1x00000000000000000000AA`; Worker run with
  the always-fail test secret `2x0000000000000000000000000000000AA` and
  placeholder `.invalid` addresses. Results: invalid fields → 400 `validation`
  with field codes; fictitious valid data with the test token → 403
  `verification` after a real Siteverify call. In the browser, the Turnstile
  test widget rendered, the activity was preselected, the POST returned 403,
  the verification message appeared, values were kept and focus moved to the
  status. Resend was never called; no data left the machine except the
  Siteverify test request to Cloudflare. The content change was reverted.

## Pending Cases (Need A Person)

Computer use only grants read access to Safari (no clicks or typing), so these
were not run. Use `dist-review/` from `pnpm build:review` served with
`pnpm dlx wrangler@4.164.0 dev --env review`, or the deployed review URL.

1. **Safari macOS.** Inicio → menu «Clases de ballet» → Ballet para adultos →
   «Consulta sin compromiso» (activity preselected) → back → Horarios →
   Contacto. Check: dropdown with mouse and keyboard (Option+Tab reaches links
   in Safari by default), Escape closes it, visible focus ring, Horarios example
   table readable, empty submit focuses the error summary, valid submit shows
   «Modo de prueba».
2. **Safari iOS** (iPhone, real device): same journey with touch; menu chevron;
   form with the on-screen keyboard; no horizontal scroll.
3. **VoiceOver macOS** (Cmd+F5) in Safari: rotor headings (one H1 per page),
   landmarks, links list; on Contacto: the selector announces «Clase o
   disciplina de interés, Ballet para adultos, botón emergente» (or similar);
   the checkbox announces its label and state; the empty submit announces the
   error summary; the test-mode confirmation is announced without moving focus.
   Record the exact phrases if any are missing.
4. **VoiceOver iOS**: swipe through Contacto and repeat point 3.
5. **Real zoom 200 %** (Safari and Chrome, window 1440×900, Cmd+= until 200 %):
   menu, Horarios table, Contacto form. Record browser, window size, zoom level
   and any overflow, overlap or unreachable control. Playwright's 720×450
   viewport (#77) is a reflow approximation, not browser zoom.

## Changes Made

- `src/components/EnquiryForm.astro`: re-validate invalid fields on `input` (D1).
- `src/styles/global.css`: `Montserrat Fallback` metric override (D2).
- `src/layouts/BaseLayout.astro`: `PUBLIC_REVIEW_NOINDEX` (D3).
- `scripts/write-review-headers.mjs`, `scripts/verify-review-build.mjs`,
  `package.json` → `build:review` and `deploy:review` (D3).
- `wrangler.jsonc` → `env.review` (#35).
- Tests: `tests/unit/review-build.test.mjs`, new case in
  `tests/e2e/contact-form.spec.ts`.
- Docs: this file, [private-review-preview.md](private-review-preview.md),
  [contact-form-config.md](contact-form-config.md), [testing.md](testing.md).
