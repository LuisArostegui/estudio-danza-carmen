# Hosting And Deployment Strategy

Research date: 2026-08-24.

This document addresses the technical hosting decision for CD-7 and records the domain/account facts that still require owner confirmation before the issue can fully close. It does not change DNS, create infrastructure, or deploy production.

## Current Evidence

Known public website:

- Current domain: `carmendanza.es`.
- Current public website URL: https://carmendanza.es/
- `carmendanza.es` and `www.carmendanza.es` currently resolve to `104.45.28.146`.
- Authoritative nameservers are:
  - `ns.gestiondecuenta.com`
  - `ns2.gestiondecuenta.com`
  - `ns3.gestiondecuenta.com`
  - `ns4.gestiondecuenta.com`
- Mail exchange records are:
  - `poolmx.dsmail.es` priority 10
  - `mta01.dsmail.es` priority 20
  - `mta02.dsmail.es` priority 30
- SPF TXT record: `v=spf1 include:mail.dsmail.es ~all`

These DNS records are public technical evidence. They do not prove account ownership, registrar, renewal date, billing owner, or available credentials.

## Needs Owner Confirmation

The following items cannot be safely inferred from public DNS or the repository:

| Missing item                      | Where owner should check                                                          | Why it matters                                                            | Blocks technical recommendation? |
| --------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| Domain registrar                  | Registrar account, invoices, email renewal notices, or current provider dashboard | Required to retain `carmendanza.es`, change nameservers, and avoid expiry | No                               |
| Domain renewal date               | Registrar dashboard or invoice                                                    | Prevents accidental expiry during migration                               | No                               |
| Account owner                     | Registrar/DNS/hosting account profile                                             | Determines who can approve DNS and billing changes                        | No                               |
| DNS access                        | Current DNS provider dashboard for `gestiondecuenta.com`-hosted zone              | Required to export current records or change nameservers                  | No                               |
| Current hosting provider and plan | Existing hosting dashboard or invoices                                            | Required to know cancellation consequences and migration timing           | No                               |
| Email account provider/access     | Mail provider dashboard for `dsmail.es` service                                   | Required to preserve MX/SPF and mailbox delivery                          | No                               |

Because domain ownership and access are not confirmed, CD-7 should be referenced rather than closed until the owner verifies these administrative facts.

## CD-7 Status After Astro Foundation

As of 2026-08-25, the technical hosting recommendation is complete:

- Astro static output exists and validates locally through `pnpm validate`.
- Cloudflare Workers Static Assets remains the selected hosting direction.
- Pull request and branch previews should be handled through Cloudflare Workers Builds once CD-35 configures the project.
- Production remains `main` -> Cloudflare production deployment -> `https://carmendanza.es/`.
- DNS cutover remains blocked on owner-confirmed registrar, DNS, current hosting, email, and billing/account access.

This means implementation work can continue through CD-22 and later MVP routes without waiting for DNS ownership facts. CD-35 must not perform production cutover, domain attachment, or cancellation of existing services until the owner confirmation checklist below is complete.

## Requirements

- Keep the final site static-first.
- Do not assume a persistent Node runtime.
- Support GitHub-connected builds and pull request previews.
- Support a custom domain and HTTPS.
- Preserve existing email service unless the owner explicitly changes it.
- Support a minimal future form endpoint for CD-8 without requiring a VPS.
- Support rollback.
- Keep cost near zero for the MVP.
- Keep production cutover reversible until the new site is verified.

## Options Compared

| Criterion            | Cloudflare Workers Static Assets                                                                                             | Netlify                                                                                                                    | Vercel                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Astro static support | Official Cloudflare Astro/Workers docs; static Astro can deploy without a Worker script when fully prerendered.              | Mature static hosting and Astro support.                                                                                   | Static Astro deploys with zero configuration.                                                     |
| GitHub integration   | Workers Builds supports GitHub integration, builds, versions, and preview URLs for PR/branch builds.                         | Strong GitHub integration and unlimited deploy previews on current Free plan.                                              | Strong GitHub integration and preview deployments.                                                |
| Static hosting       | Static asset requests are free/unlimited under current Workers pricing notes.                                                | CDN static hosting included, but usage credits meter deploys, bandwidth, requests, forms, and compute.                     | Static hosting included, but Hobby is for personal/non-commercial use; Pro is the commercial fit. |
| Custom domain/HTTPS  | Custom Domains require an active Cloudflare zone; Cloudflare creates DNS records and certificates.                           | Custom domains with SSL on Free.                                                                                           | Custom domains and HTTPS supported.                                                               |
| Rollback             | Workers versions can be uploaded/promoted; Pages has explicit rollback UI. Production strategy should use versioned deploys. | One-click rollbacks.                                                                                                       | Deployment rollback and aliases are mature; Hobby retention changed in 2026.                      |
| Serverless/form fit  | Native Worker endpoint can validate form data, call Turnstile, and send via Resend.                                          | Netlify Forms is simplest if Netlify is selected.                                                                          | Vercel Functions can implement the form, but commercial use points to Pro.                        |
| Cost                 | Workers Free can cover static assets and small form traffic; Paid starts at $5/month if needed.                              | Free may work, but the 2026 credit system creates shared metering across deploys, requests, bandwidth, forms, and compute. | Hobby is free but not the correct commercial posture; Pro starts at $20/month.                    |
| Maintenance          | One Cloudflare account can handle DNS, hosting, Turnstile, and Worker function.                                              | Very easy for static deploys/forms, but form choice ties hosting to Netlify.                                               | Easy deploys, but less cohesive with the selected Turnstile/Worker form approach.                 |

## Selected Hosting

Selected: Cloudflare Workers Static Assets, with Cloudflare DNS for the production zone once owner access is confirmed.

Why:

- It matches the static-first Astro direction and does not require a persistent server.
- It can serve static assets globally while allowing a very small `/api/contact` Worker boundary later.
- It aligns with CD-8 because Turnstile and the form endpoint can live in the same platform.
- It can consolidate DNS, custom domain TLS, hosting, previews, and form protection in one operational surface.
- It remains near-zero cost for MVP traffic and has a clear $5/month Workers Paid upgrade path if the form endpoint or limits require it.

## Environments

| Environment | Purpose              | Proposed URL pattern                                                       | Notes                                                                                     |
| ----------- | -------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Local       | Developer validation | `http://localhost:4321`                                                    | Astro foundation is present; use `pnpm dev`, `pnpm preview`, and `pnpm validate` locally. |
| Preview     | PR/branch review     | Cloudflare preview URL from Workers Builds or a branch/version preview URL | Used for design/content review and future Sanity preview configuration.                   |
| Production  | Public site          | `https://carmendanza.es/` with redirect between root and `www`             | Cut over only after owner confirms DNS access and production checks pass.                 |

No separate staging environment is needed for MVP. PR previews are enough until a later issue proves a standing staging URL is useful.

## Legacy URL Redirects

The new site replaces an existing WordPress website, so production cutover must include legacy URL handling, not only the `www`/root canonical redirect.

Before cutover:

1. Crawl or export the current production URL inventory from WordPress, analytics/search-console data if available, and any sitemap/backlink evidence the owner can provide.
2. Classify each legacy URL as keep, redirect, gone, or ignore.
3. Map every relevant old URL to its new canonical route.
4. Implement permanent 301 redirects for mapped URLs using the future deployment's appropriate mechanism: Workers Static Assets `_redirects` for a small static set, Cloudflare Redirect Rules/Bulk Redirects for a larger zone-level inventory, or Worker code only if those mechanisms do not cover the needed matching.
5. Verify that indexed, backlinked, and user-facing legacy URLs do not silently become 404s.

Examples of the required mapping shape:

| Legacy URL pattern                            | Future canonical route                                                   | Redirect                      |
| --------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------- |
| `/contacto/`                                  | `/contact/`                                                              | 301                           |
| `/clases-de-danza/`                           | `/classes/` or the correct class detail route                            | 301                           |
| `/ballet-adultos/`                            | `/classes/adult-ballet/`                                                 | 301                           |
| Old WordPress dated posts such as `/2024/...` | Relevant performance/course/news destination, or intentional gone status | 301 or explicit gone decision |

The final mapping depends on CD-12 content modelling and later route implementation. CD-35 should not cut over production until this mapping exists and redirects are deployed.

## DNS And Custom Domain

Recommended DNS strategy:

1. Export or record every current DNS record before migration.
2. Preserve mail records exactly unless the owner intentionally migrates email.
3. Create the Cloudflare zone for `carmendanza.es`.
4. Recreate current MX, SPF, and any other discovered records in Cloudflare DNS.
5. Add Resend DNS records only on a dedicated sending subdomain such as `send.carmendanza.es`, unless a later implementation issue records a different owner-approved sender identity.
6. Add the future Worker Custom Domain for the canonical hostname.
7. Configure a redirect between `www` and root after the canonical domain is chosen.
8. Configure legacy WordPress URL 301 redirects before production cutover.
9. Change nameservers only after the new zone has been reviewed.

Cloudflare Custom Domains require an active Cloudflare zone and a Worker. They create DNS records and certificates for the hostname. This means DNS ownership/access is a real prerequisite for production cutover, but not for selecting the hosting architecture.

Resend must not replace or weaken the existing mail DNS records. The current `dsmail.es` MX/SPF records support the school's existing mailbox service and should be preserved unless the owner explicitly migrates email. Transactional website sending should be isolated on a dedicated subdomain so CD-28/CD-35 can add SPF/DKIM/verification records without interfering with the corporate mailbox.

## Deployment And Rollback

Future deployment model:

- Production branch: `main`.
- Pull requests/branches: preview builds only.
- Production deploy command: future Astro build plus `wrangler deploy` once CD-35 authorizes deployment.
- Preview deploy command: upload a version for preview without promoting it to production.
- Rollback: promote a previous known-good Worker version or use the provider rollback UI if the final setup uses Pages rather than direct Workers Builds.

No production CI/CD configuration is added in this batch.

## Variables And Secrets

Future non-secret configuration may include:

- `PUBLIC_SITE_URL`
- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`

Future secrets must be stored as provider secrets, not committed:

- Sanity preview/read token (`SANITY_API_READ_TOKEN`).
- Turnstile secret key.
- Resend API key.
- Any deploy API token.

## Migration Sequence

1. Confirm registrar, renewal date, DNS access, hosting access, and email ownership.
2. Audit the current DNS zone and export records if possible.
3. Crawl/export the current WordPress production URLs and create the legacy URL to new canonical route mapping.
4. Build the new Astro site in later issues.
5. Configure Cloudflare project and preview deployments in the deployment issue.
6. Configure the form endpoint, secrets, and dedicated Resend sending subdomain in the form implementation issue.
7. Add the custom domain only when the new site is production-ready.
8. Implement and verify canonical redirects plus legacy WordPress URL 301 redirects.
9. Test root and `www`, TLS, redirects, legal pages, contact form, and email delivery.
10. Lower TTL before cutover if the current DNS provider allows it.
11. Switch nameservers or final DNS records during a low-risk window.
12. Monitor the new site and mailbox delivery.
13. Keep the old hosting active until production is verified for an agreed period.

## Do Not Cancel Yet

Do not cancel the current hosting, email, domain registration, or DNS service before:

- the registrar and renewal date are confirmed;
- all DNS records are exported or documented;
- the legacy WordPress URL inventory has been mapped and redirect behaviour has been tested;
- the new production site is live on `carmendanza.es`;
- email delivery is verified after DNS changes;
- rollback or restore path is understood;
- the owner confirms that no legacy content, files, or email services still depend on the current provider.

## Dependencies

- CD-6 selected Sanity; preview URLs from hosting will later be used in Sanity preview configuration.
- CD-8 selects a Worker form endpoint with Turnstile and Resend; this is compatible with Cloudflare Workers Static Assets.
- CD-35 remains responsible for production deployment and real DNS cutover.

## Sources

- Current website, accessed 2026-08-24: https://carmendanza.es/
- Public DNS lookup performed 2026-08-24 for `carmendanza.es` and `www.carmendanza.es`.
- Cloudflare Astro on Workers, accessed 2026-08-24: https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/
- Cloudflare Workers Static Assets, accessed 2026-08-24: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare Workers Builds, accessed 2026-08-24: https://developers.cloudflare.com/workers/ci-cd/builds/
- Cloudflare GitHub integration, accessed 2026-08-24: https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/
- Cloudflare Workers pricing, accessed 2026-08-24: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers limits, accessed 2026-08-24: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare Workers Custom Domains, accessed 2026-08-24: https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- Cloudflare DNS import/export, accessed 2026-08-24: https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/
- Cloudflare Workers Static Assets redirects, accessed 2026-08-24: https://developers.cloudflare.com/workers/static-assets/redirects/
- Cloudflare Redirect Rules, accessed 2026-08-24: https://developers.cloudflare.com/rules/url-forwarding/
- Netlify pricing, accessed 2026-08-24: https://www.netlify.com/pricing/
- Vercel Astro docs, accessed 2026-08-24: https://vercel.com/docs/frameworks/frontend/astro
- Vercel plans and limits, accessed 2026-08-24: https://vercel.com/docs/plans
