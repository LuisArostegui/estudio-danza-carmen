# CMS Selection

Research date: 2026-08-24.

This document resolves CD-6. It selects the CMS/editing workflow for the future Astro site without implementing the integration or the content model.

## Needs

The CMS must support one non-technical editor maintaining a small dance-school website. Expected content includes pages, classes, teachers, schedules, facilities, courses, performances, Royal Academy of Dance information, contact content, SEO fields, images, and reusable media.

The project direction is Astro, TypeScript, static-first output where reasonable, and React only for justified islands. The CMS should therefore work well with build-time fetching, preview/draft workflows, typed structured content, and portable exports.

## Shortlist

| CMS | Why considered |
| --- | --- |
| Sanity | Structured content, official Astro integration, TypeScript-friendly schemas, strong draft and preview tooling, usable free tier for small projects. |
| Storyblok | Strong visual editor and official Astro SDK; attractive for non-technical editing. |
| Decap CMS | Open-source, Git-based, low vendor lock-in, compatible with Astro content collections. |
| Contentful | Mature headless CMS with Astro documentation and structured content. |

## Comparison

| Criterion | Sanity | Storyblok | Decap CMS | Contentful |
| --- | --- | --- | --- | --- |
| Editor workflow | Structured Studio forms; can be tailored to the school's language and page types. | Strong visual editor and component-style editing. | Admin UI edits repository-backed Markdown/YAML; more developer-shaped and Git-oriented. | Mature web UI, but can feel heavier for a very small site. |
| Cost | Free plan is suitable for smaller projects: $0 forever, up to 20 seats, 2 public datasets, unlimited content types/locales, live preview and visual editing tools. | Starter is free but positioned as limited/testing/personal; Growth is $99/month. | CMS is free/open-source; authentication and preview infrastructure may add hosting complexity. | Free tier has hard caps and current usage-limit docs state it is for testing/learning, not commercial production. Lite is $300/month. |
| Drafts | Built-in draft documents preserve published content until explicit publish. | Draft/published versions are core to Storyblok. | Editorial workflow can create pull-request-like review flow when configured. | Preview API supports unpublished content. |
| Preview | Supports Astro integration and Presentation/visual editing; high-fidelity preview may require a preview URL and draft-mode wiring. | Visual Editor is a major strength; the Astro guide often assumes server output for live editing. | Preview pane exists, but deployed previews depend on Git auth/hosting setup. | Content preview can point to local or online preview URLs and uses the Preview API. |
| Media | Built-in image assets and CDN transforms; regular image fields are enough for MVP. Advanced Media Library is not required for this batch. | Asset Manager and image optimization are available. | Stores media in the Git repo or configured media path; can bloat the repository over time. | Asset fields and CDN are mature; free plan bandwidth cap applies. |
| Modeling | Strong structured documents, references, validation, reusable objects. | Strong component/block model. | YAML configuration can model collections, but complex relationships get awkward. | Strong structured model with content types and references. |
| Astro | Official Sanity integration and Astro docs. | Official `@storyblok/astro` SDK and Astro guide. | Astro docs describe Decap as Git-based CMS for Astro. | Astro docs show Contentful SDK usage with zero client-side JavaScript. |
| TypeScript | Schemas can use `defineType`/`defineField`; Sanity TypeGen can generate types from schema/query extraction. | Type generation is possible but depends on SDK/API workflow. | Content collection types are controlled in Astro, not Decap itself. | SDK typing exists, but content model typing still needs project setup. |
| Portability | Dataset export and GROQ/API access; not Git-native but data is structured and exportable. | API export possible; content model is service-specific. | Highest portability because content lives in Git. | API export possible; service-specific model and pricing risk. |
| Vendor lock-in | Medium. Content lives in Sanity Content Lake and schemas are Sanity-specific. | Medium-high. Block model and visual editor are Storyblok-specific. | Low. Content lives in the repository. | Medium-high. Service and pricing model are a concern. |
| Maintenance | Moderate developer setup, low routine editing burden once Studio is shaped. | Moderate setup, potentially higher cost. | Higher operational burden for auth, Git gateway/OAuth, editor training, and media hygiene. | Moderate setup, but free commercial suitability is a blocker. |
| Hosting/build | Static Astro build can fetch published content. Preview can use branch/preview URL and preview tokens. Webhooks can trigger rebuilds later. | Static build possible, but live visual preview may push toward server output. | Works best with Netlify Identity/Git Gateway or custom OAuth; hosting choice matters. | Static build can fetch Delivery API; preview requires Preview API token and preview environment. |

## Selected CMS

Selected: Sanity.

Sanity best balances the project constraints:

- It gives the future editor a web-based Studio rather than asking them to edit Markdown files or understand Git.
- It supports structured content for classes, teachers, schedules, facilities, courses, performances, RAD content, SEO, and reusable site settings.
- It has an official Astro integration and current Astro-specific preview/visual-editing documentation.
- It supports drafts, published-only production queries, and preview queries with a token.
- It can be typed with schema helpers and Sanity TypeGen when CD-12 and CD-22 define and implement the content model.
- Its free plan is proportionate for a small school website and does not force a paid monthly CMS subscription at foundation stage.

## Rejected Alternatives

Storyblok is rejected for now because its visual editing is excellent but the free Starter plan is positioned as limited/testing/personal, while the next business-oriented tier is materially more expensive than this small MVP needs. It also encourages a component/block editing mental model that may be more than the site needs before design and content modelling are complete.

Decap CMS is rejected because the Git-based workflow is less friendly for a single non-technical owner. It also makes authentication and preview depend heavily on the hosting provider or custom OAuth routes. The low vendor lock-in is attractive, but the routine editorial experience is not the best fit.

Contentful is rejected because current official usage-limit material restricts the Free plan to testing/learning rather than commercial use. The Lite plan cost is disproportionate for this project.

## Editorial Workflow

Expected future workflow:

1. The editor logs into Sanity Studio.
2. The editor edits structured entries such as class pages, teacher profiles, schedule notes, facility entries, or SEO fields.
3. Sanity keeps unpublished edits as drafts until the editor explicitly publishes.
4. The editor previews draft content through a protected preview URL when implemented.
5. Publishing content triggers or participates in a future site rebuild.
6. Production Astro pages query only published content.

The Studio should be customized in CD-12/CD-22 so the editor sees school-specific sections and labels rather than a generic developer schema.

## Technical Implications

- CD-12 should design Sanity document types and reusable objects before implementation.
- CD-22 should implement the Sanity Studio/integration and decide whether Studio is embedded in the Astro app or kept as a separate workspace.
- Sanity project ID, dataset, and tokens must be configured as environment variables/secrets, not committed.
- Production builds should use published content.
- Preview builds or preview routes should use draft-aware queries with a read token.
- Webhooks/rebuild triggers belong to the CMS integration and deployment issues, not this batch.
- CMS content must not store private consent documents, credentials, contracts, invoices, or legal evidence.

## Risks

| Risk | Mitigation |
| --- | --- |
| Free plan datasets are public. | Store only public website content in Sanity; keep private evidence and consent records outside the CMS. |
| Preview with live visual editing can add complexity. | Start with route-level preview for draft content; add visual editing only if it helps the editor. |
| Vendor lock-in. | Keep content model simple, document schema decisions, and periodically export content before major migrations. |
| Editor overwhelm. | Shape Studio navigation around school concepts: Pages, Classes, Teachers, Schedules, Media, SEO, Settings. |

## Sources

- Sanity pricing, accessed 2026-08-24: https://www.sanity.io/pricing
- Sanity Astro integration, accessed 2026-08-24: https://www.sanity.io/docs/astro
- Sanity drafts, accessed 2026-08-24: https://www.sanity.io/docs/content-lake/drafts
- Sanity previewing, accessed 2026-08-24: https://www.sanity.io/docs/content-lake/presenting-and-previewing-content
- Sanity schema and TypeScript helpers, accessed 2026-08-24: https://www.sanity.io/docs/studio/schema-types
- Sanity TypeGen, accessed 2026-08-24: https://www.sanity.io/docs/apis-and-sdks/sanity-typegen
- Storyblok pricing, accessed 2026-08-24: https://www.storyblok.com/pricing
- Storyblok Astro SDK, accessed 2026-08-24: https://www.storyblok.com/docs/libraries/js/astro-sdk
- Astro Decap CMS guide, accessed 2026-08-24: https://docs.astro.build/en/guides/cms/decap-cms/
- Contentful pricing, accessed 2026-08-24: https://www.contentful.com/pricing/
- Contentful usage limits, accessed 2026-08-24: https://www.contentful.com/help/admin/usage/usage-limit/
- Astro Contentful guide, accessed 2026-08-24: https://docs.astro.build/en/guides/cms/contentful/
