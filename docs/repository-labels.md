# Repository Labels

This repository uses a small label taxonomy for filtering work. Labels should clarify the work without creating process overhead.

## Rules

- Every issue should have exactly one `type:` label.
- Issues may have zero or more `area:` labels.
- Use `status: ready` only when prerequisites are complete and the issue can be worked.
- Use `status: blocked` only when an unresolved dependency or external condition prevents progress.
- Do not introduce priority labels initially.

## Type Labels

| Label             | Colour   | Description                                                   |
| ----------------- | -------- | ------------------------------------------------------------- |
| `type: feature`   | `1D76DB` | User-facing capability or product behaviour.                  |
| `type: technical` | `5319E7` | Engineering, architecture, tooling, or infrastructure task.   |
| `type: content`   | `0E8A16` | Copy, content model, editorial inventory, or migration work.  |
| `type: design`    | `FBCA04` | Visual design, interaction design, design handoff, or assets. |
| `type: decision`  | `D876E3` | Decision, research, evaluation, or documented recommendation. |
| `type: bug`       | `D73A4A` | Defect, regression, broken behaviour, or incorrect output.    |

## Area Labels

| Label            | Colour   | Description                                                              |
| ---------------- | -------- | ------------------------------------------------------------------------ |
| `area: frontend` | `0052CC` | Astro, UI implementation, components, routing, browser behaviour.        |
| `area: cms`      | `8E44AD` | CMS selection, content editing workflow, schemas, and integration.       |
| `area: content`  | `2E7D32` | Website copy, class data, teacher data, schedules, and editorial review. |
| `area: design`   | `C2A500` | Penpot, visual direction, layout, tokens, and interaction states.        |
| `area: forms`    | `008672` | Contact forms, validation, delivery, privacy acceptance, and anti-spam.  |
| `area: hosting`  | `0366D6` | Domain, DNS, preview, deployment, rollback, and hosting decisions.       |

## Status Labels

| Label             | Colour   | Description                                                        |
| ----------------- | -------- | ------------------------------------------------------------------ |
| `status: ready`   | `0E8A16` | The issue has enough context and no known blocker.                 |
| `status: blocked` | `D93F0B` | Work is blocked by an unresolved dependency or external condition. |

## GitHub CLI Commands

If labels need to be created or updated manually, run these from the repository:

```sh
gh label create "type: feature" --color "1D76DB" --description "User-facing capability or product behaviour." --force
gh label create "type: technical" --color "5319E7" --description "Engineering, architecture, tooling, or infrastructure task." --force
gh label create "type: content" --color "0E8A16" --description "Copy, content model, editorial inventory, or migration work." --force
gh label create "type: design" --color "FBCA04" --description "Visual design, interaction design, design handoff, or assets." --force
gh label create "type: decision" --color "D876E3" --description "Decision, research, evaluation, or documented recommendation." --force
gh label create "type: bug" --color "D73A4A" --description "Defect, regression, broken behaviour, or incorrect output." --force
gh label create "area: frontend" --color "0052CC" --description "Astro, UI implementation, components, routing, browser behaviour." --force
gh label create "area: cms" --color "8E44AD" --description "CMS selection, content editing workflow, schemas, and integration." --force
gh label create "area: content" --color "2E7D32" --description "Website copy, class data, teacher data, schedules, and editorial review." --force
gh label create "area: design" --color "C2A500" --description "Penpot, visual direction, layout, tokens, and interaction states." --force
gh label create "area: forms" --color "008672" --description "Contact forms, validation, delivery, privacy acceptance, and anti-spam." --force
gh label create "area: hosting" --color "0366D6" --description "Domain, DNS, preview, deployment, rollback, and hosting decisions." --force
gh label create "status: ready" --color "0E8A16" --description "The issue has enough context and no known blocker." --force
gh label create "status: blocked" --color "D93F0B" --description "Work is blocked by an unresolved dependency or external condition." --force
```

Required initial issue labels:

| Issue | Labels                                           |
| ----- | ------------------------------------------------ |
| `#1`  | `type: technical`, `area: frontend`              |
| `#2`  | `type: content`, `area: content`, `area: design` |
| `#3`  | `type: technical`                                |
| `#4`  | `type: technical`                                |
| `#5`  | `type: content`, `area: content`                 |

```sh
gh issue edit 1 --add-label "type: technical,area: frontend"
gh issue edit 2 --add-label "type: content,area: content,area: design"
gh issue edit 3 --add-label "type: technical"
gh issue edit 4 --add-label "type: technical"
gh issue edit 5 --add-label "type: content,area: content"
```
