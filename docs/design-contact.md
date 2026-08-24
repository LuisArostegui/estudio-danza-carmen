# Contact Page Design Handoff

This document records the repository-side implementation handoff for CD-17: the Contact page and form experience. It follows the selected strategy in [contact-form-strategy.md](contact-form-strategy.md) without implementing the endpoint, providers, legal text, or production UI.

Canonical Penpot file:

```text
https://design.penpot.app/#/workspace?team-id=81f57451-85cc-819d-8008-7273b4e9b9c5&project-id=c269caa0-e456-818c-8008-88624b219662&file-id=c269caa0-e456-818c-8008-886e7082047d
```

Relevant route: `/contact/`.

Related source documents: [contact-form-strategy.md](contact-form-strategy.md), [design-site-shell.md](design-site-shell.md), [visual-foundations.md](visual-foundations.md), [sanity-content-model.md](sanity-content-model.md), and [asset-inventory.md](asset-inventory.md).

## Purpose

The Contact page should provide practical ways to reach the school, explain the expected enquiry path, and support an accessible form with clear states and recovery options.

Do not promise immediate responses, reserved places, enrolment acceptance, or legal outcomes unless the owner later confirms that wording.

## Page Content

Recommended hierarchy:

1. Page title and supportive intro.
2. Business details: address, phone, email, and contact hours when confirmed.
3. Location or directions context.
4. Contact alternatives for visitors who cannot use the form.
5. Contact form.
6. Privacy note and link to privacy policy.
7. Final reassurance about manual follow-up without promising timing.

The known address from [project-context.md](project-context.md) can be displayed once confirmed as current public contact information:

```text
Calle Casillas de Prats, 10
18002 Granada
Spain
```

Phone and email must come from confirmed Site Settings, not from private account data.

## Form Fields

Expected fields from [contact-form-strategy.md](contact-form-strategy.md):

| Field | Required | Design intent |
| --- | --- | --- |
| Name | Yes | Clearly labelled text input. |
| Email | Yes | Clearly labelled email input with invalid-email state. |
| Phone | No | Label as optional. |
| Message | Yes | Multi-line input with useful length guidance if implemented. |
| Privacy acceptance | Yes | Unchecked checkbox with link to privacy policy. |

The privacy checkbox must not be preselected.

## Form States

| State | Intent |
| --- | --- |
| Default | Calm form, labels visible, required/optional status clear. |
| Focus | Visible focus using `color.focus`; no layout shift. |
| Missing required fields | Field-level errors and summary when useful. |
| Invalid email | Field-level message near email input. |
| Privacy not accepted | Message associated with the checkbox. |
| Submitting | Disable duplicate submission, preserve entered values, communicate progress. |
| Success | Confirm the enquiry was accepted for handling; do not imply enrolment or reserved place. |
| Delivery failure | Explain that sending failed and offer phone/email as next step when available. |
| Anti-spam failure | Generic recoverable message; do not expose Turnstile, provider, scoring, or security details. |

Example message direction:

| Situation | Copy intent |
| --- | --- |
| Success | Your enquiry has been sent to the school for review. |
| Delivery failure | The form could not be sent right now. Please try again or use the listed contact details. |
| Anti-spam failure | We could not verify the submission. Please review the form and try again. |
| Privacy missing | Please accept the privacy policy before sending the form. |

Final copy should remain human, clear, and legally reviewed where required.

## Turnstile And CAPTCHA Boundary

The selected approach uses Cloudflare Turnstile with server-side validation, but the design must not require a visual CAPTCHA by default.

Design guidance:

- leave room for a quiet verification element only if implementation needs it;
- do not make a visual challenge part of the core layout;
- keep anti-spam errors generic and recoverable;
- do not expose Resend, Turnstile, Cloudflare, stack traces, API errors, or provider names in visitor-facing error messages.

## Responsive Behaviour

Mobile:

- show contact alternatives before or immediately after the intro;
- keep form fields full width;
- place privacy acceptance and submit action in a predictable order;
- keep error messages directly associated with fields.

Tablet/desktop:

- allow business details and form to sit in a two-column layout only if both remain readable;
- keep the form within a comfortable max width;
- avoid making the address/contact block look secondary to decorative media.

If optional location media or map context is missing, keep the page text-led. Do not add unverified map embeds or tracking-heavy widgets in this design handoff.

## Accessibility Intent

- Every input has a persistent label.
- Required and optional fields are distinguishable in text, not color alone.
- Errors are associated with their fields.
- Use an error summary when several fields fail after submit.
- Move focus to the summary or first invalid field after a failed submit.
- Use status messaging for submitting, success, and failure states.
- Preserve keyboard operation without custom traps.
- Keep visible focus and readable contrast.
- Keep privacy text understandable and link directly to `/legal/privacy-policy/`.

This handoff is not a WCAG audit. Final semantic HTML, focus management, screen-reader output, live region behaviour, contrast, and failure recovery must be verified during implementation.

## CMS And Strategy Dependencies

| UI area | Source |
| --- | --- |
| Address/contact basics | Site Settings |
| Contact intro | Contact Content |
| Directions/context | Contact Content |
| Form intro | Contact Content |
| Form fields | Contact form strategy |
| Privacy note | Contact Content, aligned with final legal text |
| Privacy link | `/legal/privacy-policy/` |
| Success/failure copy | Contact design handoff and future implementation |
| Destination email | Deployment environment, not repository content |

Legal/privacy copy remains pending until reviewed legal text exists. The form implementation belongs to CD-28.

## Implementation Boundary

This handoff does not add Astro routes, React components, CSS, Sanity schemas, GROQ queries, Cloudflare Worker code, Turnstile configuration, Resend integration, secrets, legal text, analytics, map embeds, or production form behaviour.
