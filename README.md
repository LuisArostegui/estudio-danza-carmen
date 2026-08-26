# Estudio de Danza Carmen

Official website project for Estudio de Danza Carmen, a dance school in Granada.

## Status

This repository has the Astro application foundation, strict TypeScript, global visual tokens, and the responsive shared shell in place. The current first screen intentionally tracks the Arabesque visual reference closely while remaining rebuilt with project-owned Astro/CSS rather than copied WordPress runtime.

## Project Goal

Build a modern, accessible, static-first website for Estudio de Danza Carmen that can later support classes, schedules, teachers, courses, performances, Royal Academy of Dance information, contact enquiries, and legal pages.

## Repository Workflow

Work happens through short branches and pull requests:

```text
main -> feature branch -> pull request -> review -> merge
```

See [docs/repository-workflow.md](docs/repository-workflow.md) for the repository structure, branch naming, commit conventions, and pull request expectations.

## Project Context

The living product and planning context is in [docs/project-context.md](docs/project-context.md). It records current scope, MVP routes, deferred work, technical direction, and open decisions.

Foundation decisions are documented in:

- [docs/cms-selection.md](docs/cms-selection.md)
- [docs/design-source.md](docs/design-source.md)
- [docs/visual-foundations.md](docs/visual-foundations.md)
- [docs/design-home.md](docs/design-home.md)
- [docs/design-classes.md](docs/design-classes.md)
- [docs/design-structured-pages.md](docs/design-structured-pages.md)
- [docs/design-contact.md](docs/design-contact.md)
- [docs/design-site-shell.md](docs/design-site-shell.md)
- [docs/design-implementation-readiness.md](docs/design-implementation-readiness.md)
- [docs/seo-metadata-matrix.md](docs/seo-metadata-matrix.md)
- [docs/conversion-copy-briefs.md](docs/conversion-copy-briefs.md)
- [docs/sanity-content-model.md](docs/sanity-content-model.md)
- [docs/hosting-and-deployment.md](docs/hosting-and-deployment.md)
- [docs/contact-form-strategy.md](docs/contact-form-strategy.md)
- [docs/asset-inventory.md](docs/asset-inventory.md)

## Current Boundaries

This repository currently documents how the project is organised, the project context, the MVP sitemap, issue forms, and the lightweight label taxonomy, and includes the Astro application foundation, Arabesque-faithful responsive shell, and Sanity CMS foundation.

Sanity Studio is kept as a standalone app in `studio/` and is deployed at `https://estudio-danza-carmen.sanity.studio`. The Astro frontend can query published Sanity content when configured and keeps local fallbacks for development before live content is publishable.

Production page families, production forms, SEO implementation, analytics, deployment configuration, and full Sanity Visual Editing / Presentation Tool click-to-edit are not implemented yet.

The foundation uses system font fallbacks until a final licensed font delivery source is selected. The AI-generated hero asset is documented as approved for this project fallback while final Carmen-owned photography remains a future option. Sanity environment variables are documented in `.env.example`, with CMS preview details in `docs/cms-integration-preview.md` and media rules in `docs/media-pipeline.md`.

Backlog and planning live in the GitHub issues for this repository.
