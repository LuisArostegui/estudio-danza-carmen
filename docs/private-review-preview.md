# Private Review Preview For Elena

Research date: 2026-11-19. Refs #35, #28, #34.

This document records the hosting recommendation for the private review URL,
the repository configuration that is ready for it, and the procedure to create
it. Nothing has been deployed. Creating the Worker, the Access policy and
sharing the URL each need Luis's explicit authorisation.

## Recommendation

Use a **separate review Worker on `workers.dev`**, protected by **Cloudflare
Access** from the first deploy:

- Worker name: `estudio-danza-carmen-review` (`wrangler.jsonc` → `env.review`).
- URL: `https://estudio-danza-carmen-review.<account-subdomain>.workers.dev`.
- Built with `pnpm build:review`, deployed with
  `pnpm dlx wrangler@4.164.0 deploy --env review`.

| Criterion        | Separate review Worker (recommended)                                                       | Worker Version URLs / Previews of the production Worker                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Stable URL       | Yes, one hostname for Elena.                                                               | Version URLs change per upload; aliases and Worker Previews are per branch.                                                                |
| Access           | Access on that Worker's `workers.dev` hostname only.                                       | One account-wide "Workers Preview URLs" Access policy shared by every Worker.                                                              |
| Config isolation | Own vars and secrets. None are set, so the form stays in test mode.                        | Version URLs reuse the version's own configuration. Worker Previews have a separate `previews` block and secrets, but are a newer feature. |
| Indexing         | No automatic header on the production `workers.dev` URL, so the build adds `X-Robots-Tag`. | Cloudflare documents `X-Robots-Tag: noindex` on `workers.dev` preview URLs.                                                                |
| Updating         | One command after `pnpm build:review`. Workers Builds can run it later from a branch.      | Automatic per branch with Workers Builds.                                                                                                  |
| Cost             | Workers Free covers static assets. Access Free plan allows up to 50 users.                 | Same.                                                                                                                                      |
| Rollback         | `wrangler rollback --env review` or the dashboard Deployments tab.                         | Same mechanism on the production Worker.                                                                                                   |

Per-branch previews remain useful for pull request review once Workers Builds
is connected (#35), but Elena needs one stable private link, kept apart from
production configuration and secrets.

## What The Repository Provides

- `wrangler.jsonc` → `env.review`: Worker `estudio-danza-carmen-review`,
  `workers_dev: true`, `preview_urls: false` (no extra Version URL hostnames),
  same static assets and `/api/*` routing as production. No vars or secrets.
- `pnpm build:review`:
  1. builds with `PUBLIC_HIDE_PREVIEW_NOTES=true` and `PUBLIC_REVIEW_NOINDEX=true`
     (`BaseLayout` then adds `<meta name="robots" content="noindex">` to every
     page);
  2. writes `dist/_headers` with `X-Robots-Tag: noindex, nofollow` for `/*`
     (`scripts/write-review-headers.mjs`);
  3. fails if any page lacks `noindex`, if `_headers` is missing, or if the form
     is in live mode (`scripts/verify-review-build.mjs`).

`noindex` and a hard-to-guess hostname do not replace Access. They only keep
the review build out of search engines if Access is ever misconfigured.

Verified locally on 2026-11-19 with `wrangler dev --env review`: `/`,
`/contacto/`, an image under `/_astro/` and the 404 page all return
`x-robots-tag: noindex, nofollow`; `/api/contact` answers without secrets
(`415` for a request with no form body, `503 not_configured` for a form body).

## Photos

The four photos in `src/assets/fotos/` were provided for web use, but the
consent records for the students on stage are still to be confirmed
(`src/assets/fotos/README.md`). Before the first deploy, Luis must confirm that
showing them to Elena behind Access is allowed. If not, the review build needs
those slots switched to the «Foto pendiente» gaps first. Do not publish review
screenshots that include these photos.

## Access Policy

Create in Cloudflare Zero Trust before (or as part of) the first deploy:

| Setting          | Value                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Protected URL    | `estudio-danza-carmen-review.<account-subdomain>.workers.dev` (the Worker's `workers.dev` route) |
| Policy action    | Allow                                                                                            |
| Include          | Emails: Elena's and Luis's authorised addresses. Needs owner confirmation.                       |
| Login method     | One-time PIN (email code), so no identity provider is needed                                     |
| Session duration | 24 hours or less                                                                                 |

Safe order so site content is never public. Cloudflare's docs do not say
whether Access can be switched on while the `workers.dev` route is off, so the
first upload carries no site content:

1. Build a placeholder: a `dist` folder with only an `index.html` that says
   «Acceso restringido» (no photos, no copy), and deploy it with
   `deploy --env review`. This creates the Worker and its hostname.
2. In Workers & Pages → `estudio-danza-carmen-review` → Settings → Domains &
   Routes, enable Cloudflare Access on the `workers.dev` route and set the
   policy below (the Access application can also be edited in Zero Trust →
   Access → Applications).
3. Check from a session with no Access cookie that the hostname redirects to
   the Access login (see below). Stop here if it returns `200`.
4. Only then run `pnpm build:review` and deploy the real build.
5. Run the checks below again before sharing anything.

## Verification After Deploy

Run from a machine with no Access session:

```bash
curl -sI https://estudio-danza-carmen-review.<account-subdomain>.workers.dev/ | grep -iE "^HTTP|^location|cf-access"
```

Expected: a `302` redirect to `<team>.cloudflareaccess.com` (or `403`), never
`200` with the site HTML. Repeat for `/contacto/`, one `/_astro/*.avif` image
and `/api/contact`.

Then:

1. Luis signs in with the one-time PIN and sees the site; response headers
   include `x-robots-tag: noindex, nofollow`.
2. An address outside the policy requests a PIN and is refused.
3. Only after Luis authorises sending the link: Elena signs in and confirms she
   sees Inicio.

Record the date, the status codes and who signed in, without personal data or
screenshots containing pending photos.

## Updating And Rollback

- Update: `pnpm build:review && pnpm dlx wrangler@4.164.0 deploy --env review`.
- Rollback: `pnpm dlx wrangler@4.164.0 rollback --env review` or the dashboard
  Deployments tab.
- Remove: delete the Worker `estudio-danza-carmen-review` and its Access
  application.

## Later: Custom Domain And Production

Out of scope here and blocked on DNS access ([hosting-and-deployment.md](hosting-and-deployment.md)):

- Production Worker `estudio-danza-carmen` on `carmendanza.es` as a Custom Domain
  once the zone is on Cloudflare; choose the canonical host and redirect the
  other (`www` or root).
- Add canonical URLs, `robots.txt` and a sitemap for the final domain only
  (see the SEO findings in [preview-qa-2026-11-19.md](preview-qa-2026-11-19.md)).
- Map the current WordPress URLs to new routes with 301 redirects before
  cutover.
- Rollback: keep the old hosting live and DNS records exported until the new
  site is verified; a Worker rollback covers code, DNS rollback covers the
  domain.

## Needs Owner Confirmation

- Cloudflare account owner, the `workers.dev` subdomain, and a user with
  Workers Scripts edit and Zero Trust (Access) edit permissions.
- Elena's and Luis's authorised email addresses for the Access policy.
- Permission to show the four current photos privately to Elena.
- Authorisation to deploy, and separately to send Elena the link.

## Sources

- Cloudflare workers.dev routing and Access, accessed 2026-11-19: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- Cloudflare Version URLs, accessed 2026-11-19: https://developers.cloudflare.com/workers/configuration/previews/
- Cloudflare Worker Previews, accessed 2026-11-19: https://developers.cloudflare.com/workers/previews/
- Cloudflare Workers Static Assets headers, accessed 2026-11-19: https://developers.cloudflare.com/workers/static-assets/headers/
