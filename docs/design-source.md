# Canonical Design Source

This document prepares CD-10 from the repository side. It records the intended Penpot source of truth, the required file structure, ownership, and current blocker.

## Status

Current status: blocked pending real Penpot access.

No Penpot file URL is recorded because this session does not have verified access to create, inspect, or modify a Penpot file. Do not treat this document as evidence that a canonical Penpot file exists.

## Decision

Penpot remains the intended canonical design source for the MVP.

The repository records:

- what the canonical file must contain;
- how Arabesque references must be separated from approved Carmen design;
- which MVP pages must be represented;
- which owner confirmations are still needed.

The real Penpot file must be created or updated by someone with project Penpot access before CD-10 can close.

## Ownership

| Responsibility | Owner |
| --- | --- |
| Create or identify the canonical Penpot file | Project owner or designer with Penpot access |
| Maintain approved visual direction and page designs | Designer / product owner |
| Keep repository documentation aligned with approved Penpot decisions | Engineering |
| Confirm whether a Penpot URL can be public, private, or reviewer-only | Project owner |

## Required Penpot File Structure

Use a small page structure. Avoid turning Penpot into a full content repository or asset archive.

| Penpot page | Purpose | Notes |
| --- | --- | --- |
| `Foundations / Tokens` | Approved color, typography, spacing, layout, border, radius, shadow, and motion decisions. | Mirror [visual-foundations.md](visual-foundations.md). |
| `Components / Patterns` | Reusable UI and content patterns once design begins. | Keep as patterns, not production components. |
| `MVP Pages` | Approved page designs for the first-release sitemap. | One frame group per route family. |
| `Arabesque References` | Screenshots, notes, and extracted reference observations. | Must be labelled as reference only. |
| `Archive / Explorations` | Superseded experiments and rejected directions. | Never treat as approved design. |

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

Examples of acceptable reference notes:

| Arabesque observation | Allowed use |
| --- | --- |
| Pastel rose tones | Considered as visual input for Carmen palette decisions. |
| Editorial whitespace | Considered for page rhythm and content density. |
| Rectangular image blocks | Considered for image composition. |
| Small uppercase navigation | Considered for navigation mood, subject to readability. |

## Repository Alignment

When the Penpot file exists, update this document with:

- the canonical Penpot URL;
- access level: public, private, or reviewer-only;
- owner;
- last reviewed date;
- whether [visual-foundations.md](visual-foundations.md) has been synced into Penpot;
- any known divergence between Penpot and repository decisions.

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

Current result: this repository prepares the structure, but CD-10 remains blocked until real Penpot access is available.
