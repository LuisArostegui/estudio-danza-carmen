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
- Home page smoke checks;
- Linkinator internal-link smoke checks over `dist`; and
- Playwright browser smoke checks for Home, mobile navigation, CMS-key debug mode, and an axe automated accessibility signal.

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

The initial Playwright suite covers the current implemented Home route only. It checks the shared shell, Home hero, representative calls to action, mobile menu open/close behaviour, `?cms=keys`, and an automated axe scan. The axe result is a smoke signal only; it is not a WCAG conformance claim.

Linkinator currently skips planned internal route families that are linked in the shell but not implemented yet, including Classes, Schedules, Teachers, Facilities, Performances, Courses, RAD, Contact, and Legal routes. CD-42 should remove those skips route by route as the pages are implemented.

## Dependency Updates

Dependabot checks npm and pnpm workspace dependencies weekly on Monday. Minor and patch updates are grouped as routine updates, and the repository keeps at most two open dependency update pull requests at a time.

Every dependency PR still needs normal review:

- read changelogs for framework, Sanity, Astro, build, and type tooling updates;
- verify that `pnpm validate` passes;
- avoid merging major updates just because they are automated; and
- handle security updates promptly while still checking compatibility.

## Boundaries

These checks do not currently provide full browser journey coverage, visual regression testing, WCAG conformance, production deployment validation, or real form-delivery validation.

CD-42 owns expansion of route, link, and browser smoke checks as additional pages become real. CD-32, CD-33, CD-34, and CD-37 remain responsible for responsive QA, accessibility audit, performance/SEO verification, and production launch validation.
