# CMS Integration And Preview Workflow

This document records the CD-22 implementation boundary for connecting Astro to Sanity.

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

- This batch does not create the Sanity Studio schema files.
- This batch does not enter final content.
- This batch does not store private rights evidence, consent forms, credentials, or legal records in Sanity.
- Visual direction remains Arabesque-faithful; CMS copy/media must not change the shell style by itself.
