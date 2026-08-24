# Shared Site Shell Design Handoff

This document records the implementation-ready shared site shell handoff for CD-15: navigation, footer, and site-wide interaction/state patterns. Penpot remains the canonical editable design source; this document is the repository-side implementation brief.

Canonical Penpot file:

```text
https://design.penpot.app/#/workspace?team-id=81f57451-85cc-819d-8008-7273b4e9b9c5&project-id=c269caa0-e456-818c-8008-88624b219662&file-id=c269caa0-e456-818c-8008-886e7082047d
```

Relevant Penpot areas: `Components / Patterns` and `MVP Pages` / shared navigation and footer frames.

Last reviewed: 2026-08-24.

Review note: the project owner confirmed on 2026-08-24 that the canonical file contains responsive shared site-shell frames and states.

## Desktop Navigation

Primary navigation follows [sitemap-and-navigation.md](sitemap-and-navigation.md):

| Label | Destination |
| --- | --- |
| Inicio | `/` |
| Clases | `/classes/` |
| Horarios | `/schedules/` |
| Profesorado | `/teachers/` |
| RAD | `/rad/` |
| Contacto | `/contact/` |

Desktop intent:

- keep the header compact and stable;
- make the school identity visible without requiring a final logo asset;
- present primary destinations as direct links;
- keep facilities, performances, and courses discoverable through page content and footer rather than overloading the primary navigation.

Default header behaviour: the header is not sticky for MVP. Sticky behaviour should only be introduced later if implementation or usability testing demonstrates a clear benefit.

## Mobile Navigation

Closed state:

- show school identity;
- show one clearly labelled menu button;
- expose the current page through the page title and active state where space allows.

Expanded state:

- reveal the same primary destinations as desktop;
- keep the menu as an inline expanded region below the header;
- avoid modelling it as a modal, drawer, dialog, or focus-trapped overlay unless a later implementation issue changes the interaction;
- keep Contact easy to find.

The menu button should communicate expanded/collapsed state in implementation with real button semantics and an accessible name.

Closing model:

- activating the menu button again closes the expanded navigation;
- following a navigation link closes the menu as the route changes;
- Escape should close the menu when focus is currently within the expanded navigation;
- closing the menu returns focus to the menu button when closure was explicitly triggered without navigation;
- the interaction must not require a focus trap because the menu is an inline disclosure, not a modal.

## Current Page State

The current page state should be visible but restrained:

- primary color or border treatment is acceptable;
- do not rely on color alone;
- for nested class pages, mark `Clases` as the active primary section;
- legal pages can mark the relevant footer legal link rather than adding legal pages to primary navigation.

## Focus And Hover Intent

Focus:

- use the `color.focus` token from [visual-foundations.md](visual-foundations.md);
- keep focus indicators visible on light and brand surfaces;
- ensure focus order follows the visual reading order.

Hover:

- use short, subtle state changes;
- keep hover states decorative, not required for discovering destinations;
- preserve equivalent information for touch and keyboard users.

Pressed/active states should be distinguishable where controls are interactive.

## Footer Content Groups

Footer groups:

| Group | Content |
| --- | --- |
| Primary | Home, Classes, Schedules, Teachers, RAD, Contact |
| Secondary | Facilities, Performances, Courses |
| Legal | Legal notice, Privacy policy, Cookie policy if required |
| Business | Verified address, phone, email, opening/contact hours |
| Social | Official social links only when confirmed |

Footer content should come from Site Settings and approved route records where possible.

## Contact And Legal Discoverability

Contact must be discoverable from:

- primary navigation;
- Home calls to action;
- footer primary group;
- relevant class, RAD, course, and performance contexts.

Legal pages must be discoverable from the footer. Do not place legal links in the primary navigation unless a later legal or compliance issue requires it.

## Site-Wide State Patterns

Use consistent state language for shared UI:

| State | Pattern |
| --- | --- |
| Empty optional content | Omit the section rather than rendering an empty frame. |
| Missing optional media | Use text-led layout; do not show broken placeholders. |
| Form validation | Inline field messages, clear summary where useful, preserve recoverable input. |
| Form success | Clear confirmation that the enquiry was accepted for sending, without implying enrolment or legal status. |
| Form error | Plain retry/support message that does not expose anti-spam or provider details. |
| External links | Clear label and standard browser behaviour; avoid surprise new-window dependency unless implementation records it. |
| Loading | Use only where future interaction requires it; static pages should not introduce artificial loading states. |

The future contact form implementation belongs to CD-28 and must follow [contact-form-strategy.md](contact-form-strategy.md).

## Implementation Boundary

This handoff does not add Astro layouts, React islands, CSS, icons, assets, dependencies, or JavaScript behaviour.

Future implementation should validate semantic HTML, keyboard interaction, focus management, screen-reader output, zoom/reflow, reduced-motion behaviour, and link integrity in the built site.
