# Contact form configuration

This document covers the configuration needed to take the contact form from test
mode to live delivery. It implements the strategy in
[contact-form-strategy.md](contact-form-strategy.md) (CD-28). Nothing here is
configured in the repository: secrets and account setup belong to the owner and
the deployment provider.

## Modes

| Mode | When                                                                                      | Behaviour                                                                             |
| ---- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Test | `formEndpoint` is empty, or `PUBLIC_TURNSTILE_SITE_KEY` is not set                        | Validates the form, shows «Modo de prueba», sends nothing. This is the default build. |
| Live | `formEndpoint` is `/api/contact` **and** `PUBLIC_TURNSTILE_SITE_KEY` is set at build time | Renders the Turnstile widget, posts to the Worker, shows delivery states.             |

The client only goes live when the form carries both `data-endpoint` and
`data-turnstile-sitekey`. The component renders them only in live mode.

## Environment variables

| Name                        | Type                | Where it is set                     | Purpose                                                                         |
| --------------------------- | ------------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| `CONTACT_TO_EMAIL`          | Non-secret variable | Cloudflare Worker variables         | Destination mailbox that receives enquiries.                                    |
| `CONTACT_FROM_EMAIL`        | Non-secret variable | Cloudflare Worker variables         | Sender on the verified sending subdomain (see below).                           |
| `RESEND_API_KEY`            | Secret              | Cloudflare Worker secrets           | Sends the transactional email through Resend.                                   |
| `TURNSTILE_SECRET_KEY`      | Secret              | Cloudflare Worker secrets           | Validates Turnstile tokens with Cloudflare Siteverify.                          |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public, build-time  | Build environment (CI or local)     | Renders the Turnstile widget. Read by Astro at build time.                      |
| `CONTACT_RATE_LIMITER`      | Optional binding    | `wrangler.jsonc` rate-limit binding | Limits submissions per client IP. The Worker skips the check when it is absent. |

Secrets must never be committed. Set them with `wrangler secret put` or in the
Cloudflare dashboard. The repository only holds the non-secret names.

## How to go live

1. Confirm every item in the owner list below.
2. Create the Turnstile widget (Managed mode) for the production hostnames only
   (`carmendanza.es` and `www.carmendanza.es`, once confirmed) and copy its
   site key and secret key. Siteverify returns the `hostname` where the
   challenge was served; the Worker does not check it yet. Cloudflare
   recommends validating it, so decide before go-live whether to add that
   check (test keys always return `example.com`, so it needs real keys).
3. Create the Resend API key and verify the sending subdomain `send.carmendanza.es`
   in Resend. Add the Resend SPF, DKIM and return-path records **only** to that
   subdomain. Do not change the root `dsmail.es` MX records or the root SPF record.
4. Set the Worker variables `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`, and the
   secrets `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY`.
5. Optionally bind `CONTACT_RATE_LIMITER` in `wrangler.jsonc` if abuse appears.
6. Set `formEndpoint: "/api/contact"` in `src/content/school/escuela.md`.
7. Build with `PUBLIC_TURNSTILE_SITE_KEY` set, deploy, and run one real end-to-end
   test: a submission must arrive in the destination mailbox, and a reply must
   reach the visitor.

Until steps 6 and 7 are done the public form stays in test mode.

## Preview test environment

The private review Worker (`env.review`, see
[private-review-preview.md](private-review-preview.md)) stays in **test mode**
and is never used for a delivery test: it has no vars or secrets, the review
build keeps `formEndpoint` empty, and `pnpm build:review` and
`pnpm deploy:review` fail if the form is live. Do not run
`wrangler secret put … --env review`. Switching the review Worker to live would
need its own approved configuration and data handling, plus a change to
`scripts/verify-review-build.mjs`.

## Real delivery test (local, isolated)

The first real send runs on the developer's machine with `wrangler dev` on the
top-level Worker config. Nothing is deployed and `env.review` is not involved.
It proves the Worker → Resend → mailbox → reply path. Turnstile uses
Cloudflare's always-pass test keys, so the production widget and its
hostnames are checked separately at go-live (step 7 above).

Prerequisites (Luis):

| Item                   | Value                                                                                                    |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| Authorisation          | Luis authorises one real send and names the test mailbox.                                                |
| Resend account         | An account whose login address is the test mailbox (see «Resend test sender»).                           |
| `RESEND_API_KEY`       | A key with sending access only, created for this test and revoked afterwards.                            |
| `CONTACT_FROM_EMAIL`   | `onboarding@resend.dev` (until `send.carmendanza.es` is verified).                                       |
| `CONTACT_TO_EMAIL`     | The Resend account owner's address: `onboarding@resend.dev` delivers only there.                         |
| `TURNSTILE_SECRET_KEY` | `1x0000000000000000000000000000000AA` (always passes; only accepts the dummy token).                     |
| Site key at build time | `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA` (always passes, visible).                           |
| Reply-to mailbox       | A second mailbox the tester controls, typed as «Correo electrónico» in the form. Never a real visitor's. |

Procedure:

1. Write the four Worker values to `.env.delivery-test` in the repository root
   (ignored by Git through `.env.*`). Never paste them into chat, issues or logs.
2. Temporarily set `formEndpoint: "/api/contact"` in
   `src/content/school/escuela.md` and build to a separate folder:
   `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA pnpm exec astro build --outDir dist-delivery-test`.
   Then restore the content file at once:
   `git restore src/content/school/escuela.md`.
3. Serve it: `pnpm dlx wrangler@4.164.0 dev --assets dist-delivery-test --env-file .env.delivery-test --port 8798`.
4. Open `http://localhost:8798/clases-de-ballet-granada/ballet-para-adultos/`,
   follow «Consulta sin compromiso», check that «Ballet para adultos» is
   preselected, and send fictitious data with the reply-to mailbox.
5. Pass criteria, all required (an HTTP 200 alone is not proof):
   - the page shows the success message and clears the fields;
   - the email arrives in the test mailbox (check spam too) with subject
     «Nueva consulta web: …» and `Actividad: ballet-para-adultos` in the body;
   - replying from the test mailbox addresses the reply-to mailbox, and the
     reply arrives there.
6. Clean up: stop Wrangler, delete `dist-delivery-test/` and
   `.env.delivery-test`, revoke the Resend key, delete the test messages.
7. Record date, commit, environment («local wrangler dev, Turnstile test
   keys»), and pass or fail per criterion. No names, addresses, message text or
   screenshots with personal data.

Checks that need no account: the same setup with the always-fail secret
`2x0000000000000000000000000000000AA` exercises the 403 verification path, and
a placeholder Resend key exercises the 502 delivery path. Test keys only accept
the dummy token `XXXX.DUMMY.TOKEN.XXXX`, and production secrets reject it.

The simulated version of this run (always-pass Turnstile, an invalid Resend
key, no email sent) is recorded in
[contact-review-qa-2026-11-20.md](contact-review-qa-2026-11-20.md).

### Resend test sender

Resend's `onboarding@resend.dev` sender is for testing only and delivers only
to the email address associated with the Resend account; other recipients get a
403 («You can only send testing emails to your own email address»). So the
test mailbox must be the account owner's address. The `reply_to` header is set
by the Worker, so the reply goes from that mailbox to the visitor address
through the mailbox's own provider, not through Resend. Resend also offers `delivered@resend.dev`,
`bounced@resend.dev` and `complained@resend.dev` to simulate outcomes; they
count against the sending quota and do not test the reply-to.

### Sending subdomain records

Verifying `send.carmendanza.es` in Resend generates the exact records in the
domain's Records tab. Expect, all under `send.carmendanza.es` and never on the
root: an MX and an SPF TXT record for the bounce (return-path) subdomain, and a
DKIM TXT record at `resend._domainkey`. Resend notes that newer domains may get
CNAME records for SPF, so copy the dashboard values. If the zone moves to
Cloudflare, these records must be DNS only (not proxied). A DMARC record for
the subdomain is recommended. The root MX (`dsmail.es`) and root SPF stay
unchanged. No DNS change is made without separate authorisation.

## Response contract

The Worker (`src/worker/contact.js`) returns JSON with `ok` and, on failure, an
`error` code. The client maps them as follows.

| Status          | Body                                  | Client message                                           |
| --------------- | ------------------------------------- | -------------------------------------------------------- |
| 200             | `{ "ok": true }`                      | Success. Fields are cleared.                             |
| 400             | `{ "error": "validation", "fields" }` | Inline errors and summary for each field code.           |
| 400             | `{ "error": "bad_request" }`          | Generic error. Fields are kept.                          |
| 403             | `{ "error": "verification" }`         | Verification message. Fields are kept, Turnstile resets. |
| 405             | `{ "error": "method" }`               | Generic error.                                           |
| 413             | `{ "error": "too_large" }`            | Generic error.                                           |
| 415             | `{ "error": "content_type" }`         | Generic error.                                           |
| 429             | `{ "error": "rate_limited" }`         | Rate-limit message. Fields are kept.                     |
| 502             | `{ "error": "delivery" }`             | Generic error. Fields are kept.                          |
| 503             | `{ "error": "not_configured" }`       | Generic error. Operators see it in the Worker logs.      |
| Network failure | none                                  | Connection message. Fields are kept.                     |
| No request      | none (client only)                    | Turnstile message when no token exists. Nothing is sent. |

Field codes are `required`, `format`, `too_long` and `too_short`.

Limits and timeouts:

- The Worker counts the bytes it reads. A body above 65536 bytes (64 KB) returns
  413, whether or not a `Content-Length` header is sent. A declared
  `Content-Length` above the cap is refused before the body is read.
- `mensaje` allows 5000 characters. A CRLF line break counts as one character
  (the Worker and the client normalise `\r\n` to `\n` before counting).
- Siteverify and Resend calls abort after 8 seconds. An abort returns 502
  `unavailable` (Siteverify) or `delivery` (Resend).
- If the Turnstile script fails to load, or the widget writes no token, the
  client shows the verification-pending message and sends nothing. The next
  submit loads the script again if it failed, so verification recovers without
  a page reload.

Logs carry only an event name and status. They never contain names, emails,
phone numbers, messages, IP addresses or secrets.

## Needs owner confirmation

- Destination mailbox that receives enquiries (`CONTACT_TO_EMAIL`).
- Sender identity and the `send.carmendanza.es` DNS records (`CONTACT_FROM_EMAIL`).
- Approved privacy policy text. `/legal/privacy-policy/` is still a stub.
- Acceptance of Resend's 30-day data retention, and its disclosure in the privacy text.
- Cloudflare and Resend account owners, and the Turnstile hostnames to allow.
- Rate-limit threshold for `CONTACT_RATE_LIMITER`.
- Whether `actividad` (the activity selector) stays required.
