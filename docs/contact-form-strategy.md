# Contact Form Strategy

Research date: 2026-08-24.

This document resolves CD-8. It selects the future contact form approach without implementing the form, writing final legal text, or committing secrets.

## Required Fields

The future contact form should collect:

- Name.
- Email.
- Phone, optional.
- Message.
- Privacy acceptance, mandatory.

The destination email must be configurable. No personal mailbox, API key, token, or secret should be committed.

## Options Compared

| Criterion              | Cloudflare Worker + Turnstile + Resend                                                                                | Netlify Forms                                                                                | Formspree                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Astro/static fit       | Works with static assets plus a single `/api/contact` Worker path.                                                    | Excellent if hosting on Netlify.                                                             | Works from any static site using hosted endpoint.                                                          |
| Server-side validation | Full validation in the Worker before email delivery.                                                                  | Provider handles form submission; custom validation is limited unless paired with functions. | Provider-side validation/rules depend on plan and configuration.                                           |
| Email delivery         | Resend transactional email API sends to the school mailbox.                                                           | Built-in email notifications.                                                                | Built-in email notifications.                                                                              |
| Spam                   | Turnstile token validated server-side; can add honeypot and rate limiting later.                                      | Akismet filtering; honeypot and reCAPTCHA available.                                         | Machine-learning spam checks; reCAPTCHA, honeypot, domain restriction, and custom rules depending on plan. |
| CAPTCHA burden         | Turnstile can be non-intrusive/managed and is free for most production apps.                                          | Default extra CAPTCHA is reCAPTCHA 2 if enabled.                                             | reCAPTCHA is recommended for strong protection.                                                            |
| Privacy                | The project controls submitted payload, forwarding, and whether data is stored. Resend retains message data per plan. | Netlify stores submissions in its UI unless retention/deletion is managed.                   | Formspree stores submission history; Free stores 30 days.                                                  |
| Logs                   | Cloudflare Worker logs plus Resend delivery logs; keep PII out of application logs.                                   | Netlify submissions UI and logs.                                                             | Formspree dashboard/history.                                                                               |
| Confirmation email     | Possible via Resend, but not selected for MVP.                                                                        | Possible through notifications/workflows, but adds complexity.                               | Supported depending on configuration/plan.                                                                 |
| Cost                   | Cloudflare Turnstile Free; Workers Free likely enough for MVP; Resend Free includes 3,000 emails/month and 100/day.   | Netlify Free is credit-metered across deploys, requests, bandwidth, forms, and compute.      | Free tier starts at 50 submissions/month with 30-day history.                                              |
| Hosting compatibility  | Best fit with selected Cloudflare hosting.                                                                            | Strong only if Netlify is selected as hosting.                                               | Hosting-neutral but adds another vendor and less project-controlled validation.                            |

## Selected Approach

Selected: Cloudflare Worker contact endpoint with Cloudflare Turnstile and Resend.

Why:

- It fits the selected Cloudflare hosting strategy.
- It keeps the public site static-first while adding only one small server-side boundary.
- It gives the project explicit server-side validation for every field.
- It avoids a visual CAPTCHA by default while still validating Turnstile tokens server-side.
- It keeps the recipient configurable and secrets outside the repository.
- It avoids storing enquiries in the repository or CMS.
- It does not tie the form to a hosting vendor's form product.

## Submission Flow

1. Visitor completes the contact form.
2. Client-side validation gives immediate feedback for missing or malformed fields.
3. The form submits to a future Worker endpoint such as `/api/contact`.
4. The Worker validates:
   - request method and content type;
   - name presence and length;
   - email syntax and length;
   - optional phone length/characters;
   - message presence and length;
   - privacy acceptance;
   - Turnstile token with Cloudflare Siteverify.
5. If validation fails, the endpoint returns a safe error status and the UI shows failure feedback.
6. If validation passes, the Worker sends a transactional email through Resend.
7. The email goes to `CONTACT_TO_EMAIL`, configured in the deployment environment.
8. The endpoint returns success only after the provider accepts the email request.
9. The school replies manually from its mailbox.

## Anti-Spam

Baseline protection:

- Cloudflare Turnstile widget in managed/non-intrusive mode where possible.
- Mandatory server-side Turnstile validation.
- Hidden honeypot field as an additional low-cost signal.
- Strict field length limits.
- Reject unknown fields where practical.
- Optional Cloudflare rate limiting or WAF rules later if abuse appears.

Do not introduce a visible image challenge by default. Add a more intrusive challenge only if the real spam volume proves the baseline insufficient.

## Storage And Retention

Selected storage decision:

- The project should not persist messages in the public repository, CMS, or a project database for MVP.
- The canonical operational copy is the email delivered to the school mailbox.
- Resend retains email data according to the selected plan; current Free/Pro/Scale pricing material lists 30-day data retention.
- Cloudflare logs may contain request metadata; implementation should avoid logging message bodies, phone numbers, email addresses, or full names.
- Any later decision to store submissions needs a privacy and retention decision before implementation.

## Confirmation Email

Decision: do not send an automatic confirmation email to the visitor in the first implementation.

Reasons:

- The school can reply manually with the correct context.
- It avoids extra template maintenance and reduces outbound email volume.
- It avoids implying legal or enrolment status from an automated acknowledgement.

The UI should still show a clear success state after accepted submission.

## Failure Handling

The future UI should handle:

- invalid fields with inline messages;
- failed Turnstile verification;
- provider/API errors;
- network failure;
- temporary rate limiting.

User-facing messages should be clear but not reveal spam/security details. The form should preserve already-entered non-sensitive content where feasible after a recoverable error.

## Configuration

Future environment configuration:

| Name                        | Type                | Purpose                             |
| --------------------------- | ------------------- | ----------------------------------- |
| `CONTACT_TO_EMAIL`          | Non-secret variable | Destination mailbox for the school. |
| `CONTACT_FROM_EMAIL`        | Non-secret variable | Verified sender/domain identity.    |
| `RESEND_API_KEY`            | Secret              | Sends transactional email.          |
| `TURNSTILE_SECRET_KEY`      | Secret              | Validates Turnstile tokens.         |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public variable     | Renders the Turnstile widget.       |

Secrets must be stored in Cloudflare secrets or equivalent deployment-provider secret storage. They must not be committed.

## Sending Domain Boundary

Resend should use a dedicated transactional sending subdomain, preferably `send.carmendanza.es`, unless the owner approves a different sender identity during implementation.

This boundary keeps website email sending separate from the existing school mailbox service:

- Do not replace current `dsmail.es` MX records for the root domain.
- Do not replace or weaken the current root-domain SPF record used by the existing mailbox.
- Add Resend verification, SPF, and DKIM records only for the dedicated sending subdomain.
- Keep `CONTACT_FROM_EMAIL` aligned with that verified sending subdomain.

CD-28 should configure this when implementing the form. CD-35 should verify that the DNS migration preserves existing mailbox delivery and includes the Resend sending-subdomain records.

## Privacy Dependency

The final form implementation depends on legal/privacy content that explains at least:

- controller identity;
- purpose of processing contact enquiries;
- legal basis;
- destination/processor services;
- retention;
- user rights;
- required privacy acceptance.

This document is not legal advice and does not write final legal text.

## Sources

- Cloudflare Turnstile plans, accessed 2026-08-24: https://developers.cloudflare.com/turnstile/plans/
- Cloudflare Turnstile get started and server-side validation, accessed 2026-08-24: https://developers.cloudflare.com/turnstile/get-started/
- Cloudflare Turnstile token validation, accessed 2026-08-24: https://developers.cloudflare.com/turnstile/turnstile-analytics/token-validation/
- Cloudflare Workers Static Assets, accessed 2026-08-24: https://developers.cloudflare.com/workers/static-assets/
- Cloudflare Workers pricing, accessed 2026-08-24: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers secrets, accessed 2026-08-24: https://developers.cloudflare.com/workers/configuration/secrets/
- Resend pricing, accessed 2026-08-24: https://resend.com/pricing
- Resend send email API, accessed 2026-08-24: https://resend.com/docs/api-reference/emails/send-email
- Resend domain management, accessed 2026-08-24: https://resend.com/docs/dashboard/domains/introduction
- Resend Cloudflare DNS setup, accessed 2026-08-24: https://resend.com/docs/knowledge-base/cloudflare
- Netlify Forms setup, accessed 2026-08-24: https://docs.netlify.com/manage/forms/setup/
- Netlify Forms spam filters, accessed 2026-08-24: https://docs.netlify.com/manage/forms/spam-filters/
- Formspree account limits, accessed 2026-08-24: https://help.formspree.io/articles/account-management/account-limits
- Formspree spam prevention, accessed 2026-08-24: https://help.formspree.io/articles/troubleshooting/how-to-prevent-spam
