# CMS Integration And Preview Workflow

This document records the CD-22 implementation boundary for connecting Astro to Sanity.

## Sanity Studio

The repository keeps Sanity Studio as a standalone app in `studio/`. The Astro app remains at the repository root; do not create a separate `web/` app.

Use these root scripts:

```text
pnpm studio:dev
pnpm studio:build
```

The first content document required by the Astro build is the singleton Home document. In Studio, open `Inicio`, fill the required fields, and publish it. The editor-facing field map lives in [cms-editor-field-map.md](cms-editor-field-map.md).

Minimum Home content for the current frontend:

- Hero title: `El movimiento\nse convierte en arte` if you want the current Arabesque-style line break.
- Decorative script label: `Dance with soul`.
- Hero intro.
- Primary CTA: label `Descubrir clases`, href `/classes/`.
- Secondary CTA: label `Conócenos`, href `/#academia`.
- Academy eyebrow: `Academia`.
- Academy title: `Estudio de Danza Carmen`.
- Academy intro.

Minimum Site Settings content for the current shared shell:

- Site name: `Estudio de Danza Carmen`.
- Visible brand label: `Danza Carmen`.
- Top bar message.
- Public address, email, and visible phone label.
- Header navigation.
- Footer primary, secondary, and legal navigation groups.
- Accessibility labels for the main navigation, footer navigation, search icon, and mobile menu.

Do not add hero media unless the image has `licenceStatus = approved` and the required alt/consent status. The temporary Arabesque reference hero remains a local fallback pending rights verification. During local rendering, pending hero media is ignored so editors can keep working; `pnpm check:content` remains the strict production gate.

## CMS Field Key Preview

Use this query parameter on the website to show which visible Home text comes from which Sanity field:

```text
?cms=keys
```

Example:

```text
http://localhost:4321/?cms=keys
```

This replaces visible Home text with field keys such as `homeContent.title` and `homeContent.primaryCta.label`. It is a debugging helper only; it does not edit Sanity content and should not be used as production copy.

## Node Runtime

Use Node 22 for local development and CI. Astro 7 requires Node `>=22.12.0`, and Node 24 currently crashes on Windows after a successful `astro build` with `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)`. The repository pins `.nvmrc` to `22.13.2` and `package.json` to `>=22.12 <24` until the Windows Node 24 exit crash is no longer reproducible.

With nvm-windows:

```text
nvm install 22.13.2
nvm use 22.13.2
pnpm install
```

## Runtime Integration

The Astro app now has a small Sanity integration layer under `src/lib/sanity/`:

| File            | Responsibility                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `client.ts`     | Creates a Sanity client for published or preview builds.                                                          |
| `queries.ts`    | Stores GROQ projections used by the Astro frontend.                                                               |
| `types.ts`      | Defines the project-facing content types consumed by Astro.                                                       |
| `validation.ts` | Fails visibly when required content, CTAs, or media publication status is invalid.                                |
| `content.ts`    | Loads home content from Sanity when configured and uses a local fallback while owner credentials are unavailable. |
| `image.ts`      | Builds responsive Sanity image URLs while respecting the media publication checks.                                |

The home page consumes `getHomeContent()` already. Without Sanity environment variables, it keeps the current Arabesque-faithful local fallback so local development and CI remain usable before the owner creates the Sanity project/dataset.

## Environment Variables

Use `.env.example` as the non-secret template.

| Variable                   | Required                       | Scope                | Notes                                                               |
| -------------------------- | ------------------------------ | -------------------- | ------------------------------------------------------------------- |
| `PUBLIC_SANITY_PROJECT_ID` | Required once Sanity is active | Public               | Safe to expose. Enables remote content loading and validation.      |
| `PUBLIC_SANITY_DATASET`    | Required once Sanity is active | Public               | Defaults to `production` in code.                                   |
| `PUBLIC_SANITY_STUDIO_URL` | Optional                       | Public               | Future editor/studio link.                                          |
| `SANITY_API_READ_TOKEN`    | Required for draft preview     | Secret               | Server-side only. Never prefix with `PUBLIC_`.                      |
| `SANITY_PREVIEW_DRAFTS`    | Optional                       | Secret/build setting | Set to `true` only in preview deployments that should query drafts. |
| `SANITY_REVALIDATE_SECRET` | Future                         | Secret               | Reserved for CMS-triggered rebuilds or revalidation.                |

Do not commit `.env`, Sanity tokens, deployment hooks, or owner account details.

## Published Builds

Production builds must use the published perspective:

```text
SANITY_PREVIEW_DRAFTS=false
```

With this mode, Sanity queries use the `published` perspective and the CDN. Draft documents are excluded from production output.

## Draft Preview Builds

Preview deployments can show draft content by setting:

```text
SANITY_PREVIEW_DRAFTS=true
SANITY_API_READ_TOKEN=<server-side read token>
```

With this mode, queries use the `drafts` perspective, disable Sanity CDN caching, and require the server-side read token. This supports editor preview before publication through a protected preview deployment. Do not enable this mode for production.

## Validation

`pnpm validate` now includes:

```text
pnpm check:content
pnpm check:media
```

`check:content` behaves as follows:

- if Sanity is not configured, it reports that remote content validation is skipped;
- if Sanity is configured, it fetches `homeContent` and fails when required title, intro, CTA, or production media fields are missing or invalid;
- if draft preview is enabled without a token, it fails immediately.

This keeps local development possible before account setup while making configured environments fail visibly when CMS content is not publishable.

## Build Triggers

Cloudflare Workers Static Assets remains the deployment direction. Once CD-35 configures deployment, Sanity publish events should trigger the selected Cloudflare build hook or deployment workflow using provider-managed secrets. The hook URL and any rebuild secret must stay outside the repository.

## Boundaries

- The Studio is standalone in `studio/`; do not embed it inside Astro or create a separate `web/` app.
- This batch does not enter final content.
- This batch does not store private rights evidence, consent forms, credentials, or legal records in Sanity.
- Visual direction remains Arabesque-faithful; CMS copy/media must not change the shell style by itself.
