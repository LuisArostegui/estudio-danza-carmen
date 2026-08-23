# Repository Workflow

This repository uses a lightweight workflow for a small website project. The goal is clear collaboration without adding process that costs more than the work itself.

## Repository Structure

Current foundation-level structure:

```text
.github/
  pull_request_template.md
docs/
  repository-workflow.md
README.md
.gitignore
LICENSE
```

Application folders such as `src/`, `public/`, framework configuration, package manifests, CMS configuration, and deployment files are intentionally not part of CD-1. They should be added by the issues that implement those responsibilities.

## Documentation Boundary

- `README.md` is the entry point: project purpose, current status, and links to deeper documentation.
- `docs/repository-workflow.md` defines how repository work is organised.
- Future project context, sitemap, implementation decisions, and handoff notes should live in `docs/` when their issues are implemented.
- GitHub issues remain the source of truth for issue-specific acceptance criteria and scope.

## Branches

Use `main` as the stable integration branch. Do not use Git Flow, `develop`, long-lived release branches, or hotfix branches unless a future issue explicitly changes the workflow.

Create short-lived branches from `main`:

```text
<type>/cd-<issue-number>-short-description
```

Examples:

```text
docs/cd-2-project-context
chore/cd-3-issue-templates
feat/cd-19-astro-foundation
fix/header-focus-state
```

If the local environment cannot create branch names with slashes, use the same meaning without slashes:

```text
cd-1-repository-foundation
```

## Commits

Use clear, lightweight commit prefixes:

```text
feat: add a user-facing capability
fix: correct a defect
docs: update documentation
chore: update repository or tooling structure
refactor: improve structure without changing behaviour
test: add or update tests
```

Commit linting is not required for CD-1. Prefer understandable history over extra tooling.

## Pull Requests

Every meaningful change should be proposed through a pull request.

Pull requests should include:

- a concise summary;
- related issue links using `Closes #`;
- a short list of changes;
- verification performed;
- screenshots when there is a visual change, otherwise `N/A`;
- any notes or intentionally deferred work.

Keep pull requests focused. A pull request may close multiple issues only when the issues are tightly related and the PR body makes each acceptance criterion easy to review.

## Out Of Scope For CD-1

CD-1 does not install or configure:

- Astro or any other application framework;
- package managers or dependencies;
- CMS providers or content models;
- CI/CD;
- hosting or deployment;
- issue forms or label automation;
- production application code.
