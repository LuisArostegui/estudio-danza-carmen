# Home Page Design Handoff

This document records the implementation-ready Home page handoff for CD-13. Penpot remains the canonical editable design source; this document is the repository-side implementation brief.

Canonical Penpot file:

```text
https://design.penpot.app/#/workspace?team-id=81f57451-85cc-819d-8008-7273b4e9b9c5&project-id=c269caa0-e456-818c-8008-88624b219662&file-id=c269caa0-e456-818c-8008-886e7082047d
```

Relevant Penpot area: `MVP Pages` / `Home`.

Last reviewed: 2026-08-24.

Review note: the project owner confirmed on 2026-08-24 that the canonical file contains responsive Home page frames.

## First-Screen Message

The Home first screen should introduce Estudio de Danza Carmen as a professional, close, and welcoming dance school in Granada.

Message priorities:

- school name and location;
- ballet and structured dance training as the lead offer;
- human, inclusive teaching tone;
- practical paths into classes, schedules, RAD information, and contact.

Do not invent unverified accreditation, awards, years-in-business claims beyond the confirmed project context, or testimonial claims.

## Primary Actions

Primary actions should support high-intent visitor decisions:

| Action | Destination | Intent |
| --- | --- | --- |
| View classes | `/classes/` | Help new visitors understand the offer. |
| Check schedules | `/schedules/` | Help families and students plan attendance. |
| Contact the school | `/contact/` | Convert interest into an enquiry. |

RAD should remain visible as a trust path, either in the first screen, near the class-introduction area, or as a clear contextual section. It should not overstate unverified RAD claims.

## Content Hierarchy

Recommended Home hierarchy:

1. First screen: school introduction, primary actions, optional approved hero media.
2. Class pathways: clear entry points for children's ballet, ballet by level, adult ballet, body work, and specialist/private training.
3. Practical planning: schedules and contact routes.
4. Trust context: teaching experience, RAD, care, facilities, and performances where verified content exists.
5. Secondary discovery: facilities, courses, and performances.
6. Final contact prompt.

The page should avoid burying practical information behind purely atmospheric sections.

## Responsive Behaviour

Mobile:

- lead with concise text and actions before secondary content;
- stack class pathways vertically;
- keep tap targets comfortable;
- avoid hover-only discovery;
- preserve direct access to classes, schedules, RAD, and contact through the shared mobile navigation.

Tablet:

- allow two-column groupings where content density improves scanning;
- preserve section order from mobile;
- avoid introducing content that is absent on mobile.

Desktop:

- use a bounded content width and generous rhythm;
- support stronger side-by-side editorial layouts where media is available;
- keep the primary action group visible without turning the page into a marketing splash screen.

Review widths in Penpot are design evidence, not production breakpoints.

## Optional Or Missing Media

Home media must follow [asset-inventory.md](asset-inventory.md).

If approved hero media is missing:

- use a text-led first screen with strong typography, spacing, and approved color tokens;
- do not substitute Arabesque demo images;
- do not use unverified Carmen photos;
- keep the layout balanced without reserving a broken image area.

If a section has no approved image, use copy, links, and simple structural rhythm instead of placeholder media.

## Motion And Accessibility Intent

Use the tokens in [visual-foundations.md](visual-foundations.md) for color, spacing, typography, radius, shadows, and motion.

Accessibility intent:

- semantic section hierarchy;
- one clear page heading;
- visible keyboard focus;
- readable contrast using the representative token pairings;
- meaningful link and button text;
- no essential information hidden behind animation;
- reduced-motion support for animated state changes.

This design handoff is not a WCAG audit. Keyboard behaviour, screen-reader output, zoom/reflow, link integrity, and final contrast must be validated during implementation.

## Content Model Dependencies

Future implementation should source Home content from the Sanity model in [sanity-content-model.md](sanity-content-model.md):

| Home area | Content source |
| --- | --- |
| Site name, address, contact basics, navigation | Site Settings |
| First-screen title and intro | Home Content |
| Featured class pathways | Home Content + Class documents |
| Schedule prompt | Site Settings + Schedule |
| RAD prompt | RAD Content + related Classes |
| Hero or section media | Media Item with approved licence and consent status |
| SEO | Home Content SEO plus Site Settings defaults |

Optional CMS fields should not produce empty sections in production.

## Related Implementation Handoffs

- Classes: [design-classes.md](design-classes.md).
- Structured MVP page families: [design-structured-pages.md](design-structured-pages.md).
- Contact: [design-contact.md](design-contact.md).
- Shared site shell: [design-site-shell.md](design-site-shell.md).
