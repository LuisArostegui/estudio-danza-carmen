# Canonical Design Source

This document resolves the repository-side CD-10 record. It records the canonical Penpot source of truth, the required file structure, ownership, access status, and review status.

## Status

Current status: defined.

Canonical Penpot file:

```text
https://design.penpot.app/#/workspace?team-id=81f57451-85cc-819d-8008-7273b4e9b9c5&project-id=c269caa0-e456-818c-8008-88624b219662&file-id=c269caa0-e456-818c-8008-886e7082047d
```

Access level: private.

Owner: Luis.

Last reviewed: 2026-08-24.

Review note: the project owner confirmed on 2026-08-24 that this file contains the required foundations/tokens, shared patterns, MVP page areas, Arabesque reference area, archive/exploration area, responsive Home design frames, and shared site-shell design frames.

## Decision

Penpot is the canonical editable design source for the MVP.

The repository records:

- what the canonical file must contain;
- how Arabesque references must be separated from approved Carmen design;
- which MVP pages must be represented;
- which owner confirmations are still needed.

Repository documentation remains the implementation-facing written handoff. If the Penpot file and repository documents diverge, record the divergence in this file or the relevant handoff document before implementation begins.

## Ownership

| Responsibility | Owner |
| --- | --- |
| Create or identify the canonical Penpot file | Luis |
| Maintain approved visual direction and page designs | Luis / designer |
| Keep repository documentation aligned with approved Penpot decisions | Engineering |
| Confirm whether a Penpot URL can be public, private, or reviewer-only | Luis |

## Penpot File Structure

Use a small page structure. Avoid turning Penpot into a full content repository or asset archive.

| Penpot page | Purpose | Notes |
| --- | --- | --- |
| `Foundations / Tokens` | Approved color, typography, spacing, layout, border, radius, shadow, and motion decisions. | Mirror [visual-foundations.md](visual-foundations.md). |
| `Components / Patterns` | Reusable UI and content patterns once design begins. | Keep as patterns, not production components. |
| `MVP Pages` | Approved page designs for the first-release sitemap. | One frame group per route family. |
| `Arabesque References` | Screenshots, notes, and extracted reference observations. | Must be labelled as reference only. |
| `Archive / Explorations` | Superseded experiments and rejected directions. | Never treat as approved design. |

Owner confirmation from 2026-08-24 records that the canonical file has these areas or equivalent reviewed areas.

## MVP Page Coverage

The `MVP Pages` area must make the routes from [sitemap-and-navigation.md](sitemap-and-navigation.md) easy to find:

| Route | Penpot representation |
| --- | --- |
| `/` | Home frame set |
| `/classes/` | Classes index frame set |
| `/classes/diverballet/` | Class detail frame or class-detail template variant |
| `/classes/pre-ballet/` | Class detail frame or class-detail template variant |
| `/classes/ballet-levels/` | Class detail frame or class-detail template variant |
| `/classes/adult-ballet/` | Class detail frame or class-detail template variant |
| `/classes/pointe-technique/` | Class detail frame or class-detail template variant |
| `/classes/classical-repertoire/` | Class detail frame or class-detail template variant |
| `/classes/private-sessions/` | Class detail frame or class-detail template variant |
| `/classes/pilates/` | Class detail frame or class-detail template variant |
| `/classes/barre/` | Class detail frame or class-detail template variant |
| `/schedules/` | Schedules frame set |
| `/teachers/` | Teachers frame set |
| `/facilities/` | Facilities frame set |
| `/courses/` | Courses frame set |
| `/performances/` | Performances frame set |
| `/rad/` | RAD frame set |
| `/contact/` | Contact frame set |
| `/legal/legal-notice/` | Legal text page pattern |
| `/legal/privacy-policy/` | Legal text page pattern |
| `/legal/cookie-policy/` | Legal text page pattern |

The individual class-detail routes do not require completely separate bespoke layouts unless content depth justifies them. A clear class-detail template with named route examples is enough for MVP design review.

## Arabesque Reference Boundary

Arabesque can inform visual analysis, but it is not Carmen's final design.

In Penpot:

- place Arabesque screenshots or notes only under `Arabesque References`;
- label each reference frame with `Reference only - not Carmen approved design`;
- do not copy Arabesque logos, demo photos, theme CSS, WPBakery structures, Slider Revolution structures, or bundled plugin assets;
- record observations as patterns or qualities, not as unreviewed production tokens.

Owner confirmation from 2026-08-24 records that Arabesque material in the canonical file is labelled as reference only.

Examples of acceptable reference notes:

| Arabesque observation | Allowed use |
| --- | --- |
| Pastel rose tones | Considered as visual input for Carmen palette decisions. |
| Editorial whitespace | Considered for page rhythm and content density. |
| Rectangular image blocks | Considered for image composition. |
| Small uppercase navigation | Considered for navigation mood, subject to readability. |

## Repository Alignment

Current sync status:

- [visual-foundations.md](visual-foundations.md) is represented in Penpot.
- Home implementation handoff: [design-home.md](design-home.md).
- Classes implementation handoff: [design-classes.md](design-classes.md).
- Structured MVP page-family handoff: [design-structured-pages.md](design-structured-pages.md).
- Contact implementation handoff: [design-contact.md](design-contact.md).
- Shared site shell implementation handoff: [design-site-shell.md](design-site-shell.md).
- Known divergence between Penpot and repository decisions: none recorded as of 2026-08-24.

Do not add private access tokens, invite links with secrets, account screenshots, or unrelated project files.

## CD-10 Completion Checklist

CD-10 can close only when all of the following are true:

- a real Penpot file exists or an existing file is explicitly selected as canonical;
- the file is accessible to the project owner/reviewers;
- the page structure above exists or has an equivalent reviewed structure;
- Arabesque material is visibly separated as reference only;
- MVP routes can be identified in the design source;
- the repository records the real URL, owner, and review status;
- no invented Penpot URL or unverified file claim is present.

Current result: CD-10 is defined from the repository side because the real Penpot file URL, owner, access level, review date, structure, and Arabesque reference boundary are recorded.
