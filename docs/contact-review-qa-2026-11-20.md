# Contact And Private Review QA · 2026-11-20

Refs #28, #35, #32, #33, #34. Follows
[preview-qa-2026-11-19.md](preview-qa-2026-11-19.md).

Base commit: `b4daab8` (`origin/main` after #78, checked with `git fetch` on
2026-11-20; nothing newer). Branch `qa/contact-delivery-review-prep`.

Environment: macOS (Darwin 27.2), Node 22.23.5, pnpm 11.21.0, Wrangler 4.164.0
(local Workers runtime), Claude desktop built-in browser (Chromium) at its
default pane size.

Modes: **Automated** (repeatable script or test), **Simulated** (real code,
test keys or a deliberately invalid key, no email sent), **Manual** (a person
at a real device or screen reader), **Real delivery** (an email actually
received and answered), **Deployed access** (Cloudflare Access on a deployed
Worker).

## Results

| #   | Case                                                                      | Mode            | Result                                                                                                                                                | Next action · owner                                                          |
| --- | ------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | Live mode gate in code                                                    | Automated       | Pass: live only with `formEndpoint` **and** `PUBLIC_TURNSTILE_SITE_KEY` (`EnquiryForm.astro`); `main` has `formEndpoint: ""`                          | None                                                                         |
| 2   | Ficha → Contacto with activity preselected (review build)                 | Simulated       | Pass: «Consulta sin compromiso» → `/contacto/?actividad=ballet-para-adultos`, selector value `ballet-para-adultos`                                    | None                                                                         |
| 3   | Empty submit, then correction and real click on the privacy checkbox      | Simulated       | Pass: summary (`role=alert`) focused, 4 fields invalid; after typing, errors clear and the checkbox click registers                                   | Repeat in Safari · Luis                                                      |
| 4   | Valid submit in test mode (review build)                                  | Simulated       | Pass: «Modo de prueba…» status, no `/api/` request                                                                                                    | None                                                                         |
| 5   | Live form, Turnstile passes, delivery fails (always-pass test keys)       | Simulated       | Pass: dummy token issued, POST → 502 `delivery`, generic error focused, values and activity kept, Worker log has no data                              | None                                                                         |
| 6   | Retry after a failed delivery                                             | Simulated       | Pass: token reset; second POST passes Siteverify again and fails only at Resend (502, not 403)                                                        | None                                                                         |
| 7   | Verification failure path (always-fail secret)                            | Simulated       | Pass on 2026-11-19 (403, message, values kept); code path unchanged                                                                                   | None                                                                         |
| 8   | Real delivery, receipt, activity in the email, reply to `Reply-To`        | Real delivery   | **Not run**: no authorisation, Resend account, key or test mailbox                                                                                    | Authorise and provide prerequisites · Luis                                   |
| 9   | `pnpm build:review` artifact                                              | Automated       | Pass: 91 files, every page `noindex`, `_headers` rule, form in test mode, notes hidden, **no photos**                                                 | None                                                                         |
| 10  | Review Worker locally (`wrangler dev --env review`)                       | Automated       | Pass: see «Review Worker over HTTP»                                                                                                                   | None                                                                         |
| 11  | Inicio, Horarios, Contacto in the browser (review build)                  | Simulated       | Pass: no console errors, no failed requests, 23 gaps on Inicio, Horarios empty state, no horizontal overflow                                          | None                                                                         |
| 12  | Photo permission for private review                                       | Automated       | Gaps shipped: permission not confirmed, so photos are removed from the artifact                                                                       | Confirm per photo · Luis and Elena                                           |
| 13  | Cloudflare Access prerequisites                                           | Automated       | Partial: Wrangler logged in with Workers Scripts write; no Access scope; no Access app or Worker created                                              | Create Access app in the dashboard, authorise deploy · Luis                  |
| 14  | Deployed review Worker behind Access (anonymous, outsider, Luis, headers) | Deployed access | **Not run**: no deploy authorisation                                                                                                                  | See «Deploy checklist» · Luis                                                |
| 15  | Elena signs in                                                            | Deployed access | **Not run**: depends on 14 and on authorisation to send the link                                                                                      | Send link after 14 passes · Luis                                             |
| 16  | Safari macOS, Safari iOS, VoiceOver, browser zoom 200 %                   | Manual          | **Pending**: needs a person at the device (steps in the 2026-11-19 report, «Pending Cases»)                                                           | Run on the review build · Luis                                               |
| 17  | Lighthouse, Playwright, SEO                                               | Automated       | Production output unchanged (the new flag only affects `build:review`), so the 2026-11-19 Lighthouse figures stand. `pnpm validate` re-run, see below | Production SEO (canonical, sitemap, robots, OG, JSON-LD) after domain · Luis |

## Defect Found And Fixed

### R1 · Review build would ship photos without permission

- **Reproduce (before):** `pnpm build:review`, then list raster files in
  `dist-review/_astro/`: 64 files from the four photos (16 variants each).
- **Why it matters:** Luis has not confirmed that the photos may be shown to
  Elena (`private-review-preview.md` → Photos). The runbook asked for gaps in
  that case, but nothing produced or enforced them.
- **Fix:** `PUBLIC_REVIEW_HIDE_PHOTOS=true` in `build:review` makes
  `Photo.astro` render each photo slot as «Foto pendiente · Permiso de uso por
  confirmar». Astro still emitted the four originals (content collection
  imports), reachable by URL although no page used them, so
  `scripts/prune-review-photos.mjs` removes unreferenced raster files from
  `_astro/`. `verify-review-build.mjs` now fails on any photo file or tag
  not listed in `src/assets/fotos/review-approved.json` (per-photo approval,
  empty for now; added after PR review so a partial approval cannot let
  pending photos through).
- **Tests:** `tests/unit/review-build.test.mjs` → «reports every photo when
  none is approved», «with partial approval, reports only the photos still
  pending», «passes when every shipped photo is approved», «the approved list
  names only existing photos», «allows illustrations and approved public
  assets», «removes unreferenced raster files and keeps referenced ones», and
  the `review-photos.js` stem and approval cases. They failed before each
  change (missing module) and pass after. A temporary build with
  `["aula-barra.jpg"]` shipped only that photo's variants.
- **After:** 91 files, only raster file `assets/hero-carmen.png` (approved
  AI-generated fallback, `docs/asset-inventory.md`); the former
  `/_astro/aula-barra.*.jpg` URL returns 404. The normal `pnpm build` is
  unchanged.

## Review Worker Over HTTP

`pnpm dlx wrangler@4.164.0 dev --env review` on `127.0.0.1`, serving the
photo-free `dist-review/`:

| Request                                                   | Status | `x-robots-tag`      |
| --------------------------------------------------------- | ------ | ------------------- |
| `/`, `/horarios/`, `/contacto/`, `/contacto/?actividad=…` | 200    | `noindex, nofollow` |
| `/clases-de-ballet-granada/ballet-para-adultos/`          | 200    | `noindex, nofollow` |
| `/_astro/*.css`, `/_astro/*.svg`, `/_astro/*.woff2`       | 200    | `noindex, nofollow` |
| `/_astro/aula-barra.*.jpg` (former photo)                 | 404    | `noindex, nofollow` |
| `/no-existe/`                                             | 404    | `noindex, nofollow` |
| `GET /api/contact`                                        | 405    | JSON `method`       |
| `POST /api/contact` without a body                        | 415    | `content_type`      |
| `POST /api/contact` with a form body                      | 503    | `not_configured`    |

The Contacto form has no `data-endpoint`, so the review build is in test mode.

## Simulated Live Run

Isolated from `env.review`: a temporary build into the scratchpad with
`formEndpoint: "/api/contact"` (content file restored right after the build)
and `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA`, served by the
top-level Worker with `wrangler dev --assets <dir> --env-file <file>`. Worker
values: always-pass secret `1x0000000000000000000000000000000AA`, a deliberately
invalid Resend key and `.invalid` addresses. Fictitious form data. Resend
rejected the key, so no email could be sent.

Observed: the Turnstile test widget rendered and wrote `XXXX.DUMMY.TOKEN.XXXX`;
POST → 502; the Worker logged only `{"event":"contact_delivery","status":502}`;
the page showed «No hemos podido enviar la consulta…» with focus on the status;
name, activity and privacy consent were kept; a second submit sent a new token
and failed the same way.

Note for the real test: the email body carries the activity as its slug
(`Actividad: ballet-para-adultos`), not its display name. It is preserved and
unambiguous; switching to the label is a copy decision, not a defect.

## Real Delivery: What Is Missing

The procedure is in [contact-form-config.md](contact-form-config.md) → «Real
delivery test (local, isolated)». It needs, from Luis:

1. Authorisation for one real send from the Ballet para adultos ficha.
2. A Resend account whose login address is the test mailbox, and a sending-only
   API key (revoked after the test).
3. A second mailbox he controls, used as the visitor's reply-to address.

`env.review` is not used: the two earlier references to
`wrangler secret put … --env review` were replaced, because the review build
check rejects a live form and the review Worker must stay in test mode.

Definitive activation stays blocked on: the operational inbox and who answers
it, the sender (`send.carmendanza.es` verified in Resend, DNS change authorised
separately), the production Turnstile widget and hostnames, and the approved
privacy text for the real flow (#28).

## Deploy Checklist (Needs Luis)

Order from [private-review-preview.md](private-review-preview.md) → Access
Policy, unchanged. Before step 1, Luis confirms: authorisation to deploy, the
allowed emails (his and Elena's), and that he can edit Zero Trust Access in
the dashboard (the Wrangler login has no Access scope). Then, from a session
with no Access cookie, `curl -sI` for `/`, `/contacto/`, one `/_astro/*.woff2`
(there are no photos to test with) and `/api/contact` must return 302 to
`<team>.cloudflareaccess.com` or 403, never 200. An address outside the policy
must be refused, Luis must get in, and the authenticated response must carry
`x-robots-tag: noindex, nofollow`.

## Validation

`pnpm validate` on this branch, 2026-11-20: exit 0. Unit tests 78/78 (after the per-photo approval change); Playwright
420 passed, 36 skipped (Chromium, 390 and 1440); Sanity content validation
skipped (no `PUBLIC_SANITY_PROJECT_ID` locally).
