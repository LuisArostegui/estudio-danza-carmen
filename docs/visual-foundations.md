# Visual Foundations And Design Tokens

This document records the repository-side visual direction for CD-11. It defines a small MVP token set and separates Arabesque reference observations from approved Carmen decisions.

Because the canonical Penpot file is still blocked by missing real Penpot access, CD-11 should be referenced rather than closed until these decisions are also reflected in Penpot.

## Design Direction

Carmen Danza should feel professional, close, warm, inclusive, and disciplined. The visual language should support ballet and structured training without feeling elitist.

Use Arabesque as a reference for restraint, editorial rhythm, soft contrast, and ballet-adjacent atmosphere. Do not copy its demo imagery, logos, theme CSS, bundled plugins, or unverified font assets.

## Reference To Decision

| Arabesque reference value | Carmen decision | Production token impact |
| --- | --- | --- |
| Pastel rose tones | Use a deeper rose as the primary brand color so text and buttons can remain readable. | `color.brand.primary` |
| Large negative space | Keep calm layouts with generous vertical rhythm, but avoid sparse pages that hide practical information. | `space.*`, `layout.*` |
| Montserrat as historical base | Use Montserrat as the primary typeface candidate because its open-source licence is verified; keep system fallbacks. | `font.family.base` |
| Script typography as decoration | Do not select a script font for MVP production until a specific licensed face is chosen. | No approved script token |
| Rectangular geometry | Prefer rectangular media and panels with modest radii. | `radius.*` |
| Thin separators and soft shadows | Use subtle borders first; reserve shadows for overlays or elevated controls. | `color.border.subtle`, `shadow.*` |
| Short discreet animation | Use short motion for state changes only; support reduced motion. | `motion.*` |
| Uppercase tracked navigation | Consider small uppercase labels only where readability survives. Do not force all navigation into a decorative style. | Typography guidance, no hard token |

## Color Tokens

| Token | Value | Use |
| --- | --- | --- |
| `color.brand.primary` | `#8A2F48` | Primary brand actions, active states, strong accents. |
| `color.brand.secondary` | `#E7C98E` | Warm secondary surfaces and small highlights. |
| `color.brand.accent` | `#2F6F73` | Cool counterpoint for links, focus-adjacent details, or schedule/status accents. |
| `color.text.primary` | `#251C1F` | Main text. |
| `color.text.secondary` | `#5D5458` | Supporting text and metadata. |
| `color.text.inverse` | `#FFFDFC` | Text on primary brand surfaces. |
| `color.surface.default` | `#FFFDFC` | Default page background. |
| `color.surface.soft` | `#F7F1EC` | Subtle section background. |
| `color.surface.brand` | `#8A2F48` | Primary call-to-action surface. |
| `color.border.subtle` | `#DACEC7` | Dividers, form borders, low-emphasis rules. |
| `color.border.strong` | `#8C7E78` | Focusable boundaries where more contrast is needed. |
| `color.focus` | `#1D6FDB` | Visible keyboard focus outline. |

Do not use the secondary gold as small text on white. It is a surface/highlight token, not a body-text token.

## Representative Contrast Checks

These checks cover common token pairings for the design decision. They are not a full WCAG audit of future production screens.

| Pair | Contrast |
| --- | --- |
| `color.text.primary` on `color.surface.default` | `16.38:1` |
| `color.text.secondary` on `color.surface.default` | `7.20:1` |
| `color.brand.primary` on `color.surface.default` | `8.02:1` |
| `color.text.inverse` on `color.brand.primary` | `8.02:1` |
| `color.text.primary` on `color.surface.soft` | `14.83:1` |
| `color.text.secondary` on `color.surface.soft` | `6.52:1` |
| `color.focus` on `color.surface.default` | `4.76:1` |
| `color.text.primary` on `color.brand.secondary` | `10.39:1` |

## Typography Tokens

| Token | Value | Notes |
| --- | --- | --- |
| `font.family.base` | `"Montserrat", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | Primary MVP typeface candidate. Do not commit font files in this batch. |
| `font.family.decorative` | `pending` | No approved script/decorative production font yet. |
| `font.weight.regular` | `400` | Body text. |
| `font.weight.medium` | `500` | Navigation and compact emphasis. |
| `font.weight.semibold` | `600` | Section headings and buttons. |
| `font.weight.bold` | `700` | Reserved for strong hierarchy. |
| `font.size.body` | `1rem` | Browser default-relative body size. |
| `font.size.small` | `0.875rem` | Metadata and secondary labels. |
| `font.size.h1` | `clamp(2.25rem, 4vw, 4.25rem)` | Hero/page title scale for later implementation. |
| `font.size.h2` | `clamp(1.75rem, 3vw, 2.75rem)` | Major section headings. |
| `font.lineHeight.body` | `1.6` | Comfortable long-form reading. |
| `font.lineHeight.heading` | `1.15` | Headings. |

Montserrat licence note: the Montserrat project records the font under the SIL Open Font License 1.1. Implementation should still verify the exact delivery source before adding font-loading code.

## Spacing Tokens

Use a compact scale that supports simple editorial layouts without over-modelling every component.

| Token | Value |
| --- | --- |
| `space.1` | `0.25rem` |
| `space.2` | `0.5rem` |
| `space.3` | `0.75rem` |
| `space.4` | `1rem` |
| `space.6` | `1.5rem` |
| `space.8` | `2rem` |
| `space.12` | `3rem` |
| `space.16` | `4rem` |
| `space.24` | `6rem` |

## Layout Tokens

| Token | Value | Use |
| --- | --- | --- |
| `layout.contentMax` | `72rem` | Main content width. |
| `layout.textMax` | `42rem` | Long-form readable text. |
| `layout.narrowMax` | `56rem` | Forms, legal pages, focused content. |
| `layout.gutter` | `clamp(1rem, 4vw, 2rem)` | Page side padding. |
| `layout.sectionY` | `clamp(3rem, 8vw, 6rem)` | Standard section rhythm. |

## Borders, Radius, And Shadows

| Token | Value | Use |
| --- | --- | --- |
| `border.width.hairline` | `1px` | Dividers and form controls. |
| `radius.none` | `0` | Editorial media blocks where sharp geometry fits. |
| `radius.sm` | `0.25rem` | Inputs and compact controls. |
| `radius.md` | `0.5rem` | Repeated cards only when a frame is needed. |
| `shadow.soft` | `0 12px 30px rgba(37, 28, 31, 0.10)` | Modals, menus, or elevated overlays. |

Cards are not the default page structure. Use full-width sections and simple layout first.

## Motion Tokens

| Token | Value | Use |
| --- | --- | --- |
| `motion.duration.fast` | `120ms` | Focus, hover, pressed states. |
| `motion.duration.base` | `180ms` | Small menu or disclosure transitions. |
| `motion.duration.slow` | `240ms` | Rare larger transitions. |
| `motion.ease.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default easing. |

Respect `prefers-reduced-motion`. Essential state changes should not depend on animation.

## Usage Rules

- Use semantic token names in future implementation.
- Do not introduce component-specific token names until a repeated component actually needs them.
- Do not use Arabesque extracted values as production tokens without recording the Carmen decision.
- Do not add production CSS, Astro files, or dependencies in this batch.
- Sync these tokens into Penpot when CD-10 gains real access.

## Sources

- Project context and asset boundaries: [project-context.md](project-context.md), [asset-inventory.md](asset-inventory.md).
- Montserrat licence, accessed 2026-08-24: https://github.com/JulietaUla/Montserrat
- Google Fonts Montserrat description, accessed 2026-08-24: https://github.com/google/fonts/blob/main/ofl/montserrat/DESCRIPTION.en_us.html
