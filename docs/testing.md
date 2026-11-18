# Testing and Quality Gates

This project uses a proportionate quality gate for the current Astro and Sanity foundation. The goal is to catch broken project-owned behaviour before review without pretending that automated checks replace manual design, content, accessibility, or launch validation.

## Local Gate

Run the same command before opening or updating a pull request:

```bash
pnpm validate
```

The command currently runs:

- project tooling configuration checks;
- Astro and TypeScript checks;
- repository formatting checks for the configured source file set;
- Sanity Studio build;
- published Sanity content contract checks when Sanity environment variables are configured;
- media policy checks;
- production Astro build;
- shared site-shell smoke checks; and
- Home page smoke checks (Elena's copy read from the content file);
- Linkinator internal-link smoke checks over `dist`; and
- Playwright browser checks at 390 and 1440 px for the preview flow (see below).

The content check does not require committed secrets. Without `PUBLIC_SANITY_PROJECT_ID`, it skips live Sanity validation for that environment. Local development can use `.env` to validate real published content.

## CI

GitHub Actions runs `CI / quality` for pull requests into `main` and pushes to `main`.

The workflow uses `.nvmrc` for Node, pnpm `11.21.0`, a frozen lockfile install, installs Chromium for Playwright, and then runs `pnpm validate`. This keeps CI aligned with the local gate instead of maintaining a second list of commands.

After the first successful workflow run on GitHub, protect `main` by requiring the `CI / quality` check in the repository ruleset or branch-protection settings. That protection is a GitHub repository setting, not a committed file.

## Browser And Link Smoke Checks

Run the generated-site link smoke check directly with:

```bash
pnpm test:site
```

Run the browser smoke checks directly with:

```bash
pnpm test:e2e
```

`pnpm test:e2e` builds the Astro site and runs Playwright against Vite preview of `dist`, following the same static-output pattern used by the portfolio project.

Playwright runs two projects only: `mobile-390` (390x844, touch) and `desktop-1440` (1440x900). The suite lives in `tests/e2e/`:

- `home.spec.ts`: landmarks, Elena's literal hero copy (read from `src/content/home/inicio.md`), the six header entries, footer contact links, mobile menu, `?cms=keys` flag, axe.
- `preview-flow.spec.ts`: the Inicio -> Clases de ballet -> Ballet para adultos -> contacto journey, header dropdown (desktop hover/focus/Escape, mobile chevron and 44px targets), focus outlines, internal links returning 200, no horizontal overflow, image rendering, show gallery hover/focus/touch/reduced motion, carousel, enquiry form validation and test mode (no network POST), axe on each verified page, and the pending-page guard.
- Screenshots (above the fold and full page, both widths) are written to `test-results/preview-shots/`, which is gitignored.

The axe result is an automated signal only; it is not a WCAG conformance claim.

## Verified vs Pending Pages

Only four routes are verified: `/`, `/clases-de-ballet-granada/`, `/clases-de-ballet-granada/ballet-para-adultos/` and `/contacto/` (`VERIFIED_ROUTES` in `scripts/verify-generated-site-links.mjs`, `VERIFIED_PAGES` in `tests/e2e/helpers.ts`).

Every other generated page (18 pending activity fichas, `/salud-corporal/`, `/otras-disciplinas/`, `/sobre-nosotros/`, `/espectaculos/`, `/examenes-rad/`, `/cursos/`, `/horarios/`, the legal stubs) renders `<body data-page-status="pending">` with `noindex`. `pnpm test:site` crawls everything with Linkinator (no route is skipped), then prints a `COMPLETE` and a `PENDING (not verified)` list and fails if a verified route is pending or missing, or if a pending page lacks `noindex`. Pending pages are only checked for being reachable and non-indexable, never counted as verified content. The enquiry form is in test mode (empty `formEndpoint`): valid submissions send nothing.

## Dependency Updates

Dependabot checks npm and pnpm workspace dependencies weekly on Monday. Minor and patch updates are grouped as routine updates, and the repository keeps at most two open dependency update pull requests at a time.

Every dependency PR still needs normal review:

- read changelogs for framework, Sanity, Astro, build, and type tooling updates;
- verify that `pnpm validate` passes;
- avoid merging major updates just because they are automated; and
- handle security updates promptly while still checking compatibility.

## Boundaries

These checks do not provide coverage of pending pages, visual regression testing, WCAG conformance, production deployment validation, or real form-delivery validation.

CD-42 owns expansion of route, link, and browser smoke checks as additional pages become real. CD-32, CD-33, CD-34, and CD-37 remain responsible for responsive QA, accessibility audit, performance/SEO verification, and production launch validation.
