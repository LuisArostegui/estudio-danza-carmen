# Asset, Licence, And Consent Inventory

Research date: 2026-08-24.

This document resolves CD-9 for the repository foundation stage. It creates the asset-status inventory and publication rules for future design, CMS, media, and content work. It does not provide legal advice and does not store private evidence.

## Status Values

| Status | Meaning |
| --- | --- |
| `approved` | Public use is allowed for the stated purpose and evidence exists outside the public repo. |
| `pending verification` | Likely usable, but ownership/licence/source still needs confirmation. |
| `needs consent` | Contains identifiable people, testimonials, minors, or other personal material that needs consent before publication. |
| `replace` | Should be replaced with newly created or properly licensed material. |
| `reference only` | Can inform design/content direction but must not be copied into production. |
| `do not publish` | Must not be included in the public site or repository. |

## Inventory

| Asset / category | Source | Owner | Licence / consent | Use intended | Status | Action |
| --- | --- | --- | --- | --- | --- | --- |
| Carmen Danza logo | Not present in repository | Needs owner confirmation | Needs source and usage rights confirmation | Brand identity | `pending verification` | Obtain original file and owner confirmation before adding. |
| Current website copy | `carmendanza.es` public website | Needs owner confirmation | Needs confirmation that Carmen can reuse/adapt it | Content reference and possible migration source | `pending verification` | Use as content reference only until owner confirms rights and accuracy. |
| Current website photographs | `carmendanza.es` public website | Needs owner confirmation | Needs photographer/source rights and identifiable-person consent | Possible production imagery | `needs consent` | Inventory image-by-image before CMS upload or publication. |
| Current website videos | Existing public channels/site if any | Needs owner confirmation | Needs source rights, music rights, and identifiable-person consent | Possible production media | `needs consent` | Do not publish until rights and consents are verified. |
| Teacher profile photos | Not present in repository | Needs owner confirmation | Teacher consent and photographer/source rights required | Teachers page | `needs consent` | Collect current portraits and consent status outside repo. |
| Student/minor photos | Not present in repository | Needs owner confirmation | Explicit consent required; minors require parent/guardian consent | Classes, performances, facilities, home | `needs consent` | Use only when consent is verified; store signed consent outside repo. |
| Performance photos | Not present in repository | Needs owner confirmation | Photographer rights plus participant consent required | Performances page and home | `needs consent` | Track event, photographer, and consent status before use. |
| Testimonials | Not present in repository | Needs owner confirmation | Written permission from quoted person required; minors need guardian consent | Trust/social proof | `needs consent` | Store only approved public quote and display name in CMS; private consent evidence stays outside repo. |
| Arabesque theme layout/screenshots | ThemeForest Arabesque package/demo | Theme author / Envato seller | Purchased theme can be used as design reference only for this project; do not port runtime/plugins | Visual reference | `reference only` | Rebuild with owned Astro/CSS/components; do not copy theme runtime. |
| `public/assets/hero-ballet.png` | `static-arabesque-demo/assets/hero-ballet.png` | Unknown photographers / licensors | Licence and identifiable-person rights need confirmation before live publication | Temporary CD-21 visual parity hero background | `pending verification` | Replace with Carmen-owned/licensed imagery or record explicit production approval before deploying publicly. |
| Arabesque demo photographs | Theme demo/import/export/package | Unknown photographers / licensors | Theme purchase does not automatically license demo images for live site | None | `do not publish` | Replace with Carmen-owned or properly licensed images. |
| Arabesque logos/brand marks | Theme demo/package | Theme author / demo brand | Not Carmen assets | None | `do not publish` | Do not use. |
| WPBakery plugin files | Theme bundle/current WordPress runtime | Plugin vendor/theme bundle | Not part of new Astro project | None | `do not publish` | Do not redistribute or copy into repo. |
| Slider Revolution plugin files | Theme bundle/current WordPress runtime | Plugin vendor/theme bundle | Not part of new Astro project | None | `do not publish` | Do not redistribute or copy into repo. |
| Fonts from Arabesque/theme | Theme package or external font services | Font authors/vendors | Licence must be checked before use | Typography reference only | `pending verification` | Prefer open-source fonts with explicit licences unless theme font rights are confirmed. |
| Icons | Future design/system source | Needs selection | Licence must allow website use and redistribution if committed | UI/navigation/social icons | `pending verification` | Prefer `lucide` or another explicitly licensed icon set when implementation begins. |
| Legal/privacy/cookie text | Future legal drafting | Site owner/legal provider | Must be reviewed for this site and selected processors | Legal pages | `pending verification` | Do not copy generic or unrelated legal text without review. |
| Purchase certificates, invoices, contracts | Private owner records | Site owner/vendors | Private evidence only | Rights verification | `do not publish` | Store outside public repository and record only status here. |
| Signed consent forms, IDs, guardian permissions | Private owner records | Individuals/site owner | Sensitive personal data | Consent evidence | `do not publish` | Store outside public repository; record only `consent verified: yes/no/pending`. |
| Credentials, API keys, provider tokens | Service dashboards | Site owner/providers | Secrets | Configuration only | `do not publish` | Store only in provider secret management. |

One temporary public-path media asset is present for CD-21 visual parity only: `public/assets/hero-ballet.png`. Treat it as pending verification and do not deploy it publicly until licence and identifiable-person rights are confirmed.

## Rules For Identifiable People

Before publishing photos, videos, or testimonials involving identifiable people, record:

- asset description;
- person category: student, minor, teacher, staff, parent, testimonial author, or public participant;
- source/photographer;
- intended website use;
- consent status: `yes`, `no`, or `pending`;
- any restrictions, such as page, date range, or no social reuse.

For minors, consent must be verified with a parent or legal guardian. Do not store signed consent, IDs, contracts, or private contact data in the public repository.

The public repo may record only status-level evidence such as:

```text
consent verified: yes
consent verified: no
consent verified: pending
```

## Rules For Private Evidence

Never commit:

- purchase certificates;
- invoices;
- contracts;
- identity documents;
- credentials;
- API keys;
- dashboard screenshots containing account details;
- signed consent forms;
- private emails;
- raw exports containing personal data.

Private evidence should live in the owner's private administrative storage, not in GitHub. The repository only tracks whether evidence has been verified.

## Arabesque Boundary

Arabesque remains a visual and interaction reference only.

Do not:

- treat demo photographs as licensed because they appear in a demo, XML import, WordPress media folder, or purchased package;
- redistribute WPBakery;
- redistribute Slider Revolution;
- copy bundled plugins into the Astro project;
- copy Arabesque logos as Carmen branding;
- publish theme demo copy as Carmen copy;
- publish private Envato certificates or purchase codes.

Envato's own guidance says demo images, fonts, or assets may be preview-only and the buyer is responsible for checking the files and licence before live use.

## Future Media Workflow

When real assets become available:

1. Add one inventory row per asset or tightly grouped set.
2. Record source, owner, licence/consent, intended use, status, and next action.
3. Keep private evidence outside GitHub.
4. Only upload `approved` assets to the CMS or commit them to the repo when the future implementation issue requires it.
5. Prefer descriptive filenames and required alt text during CMS/media pipeline work.

## Sources

- Current website, accessed 2026-08-24: https://carmendanza.es/
- Envato demo image guidance, accessed 2026-08-24: https://help.market.envato.com/hc/en-us/articles/54303638886041-Can-I-use-demo-images-on-my-live-website
- Envato licence overview, accessed 2026-08-24: https://help.market.envato.com/hc/en-us/articles/115005593363-Which-Envato-Market-Licence-Do-I-Need
- ThemeForest standard licence overview, accessed 2026-08-24: https://themeforest.net/licenses/standard
- Envato theme/plugin licensing overview, accessed 2026-08-24: https://help.author.envato.com/hc/en-us/articles/360000534626-Theme-Plugin-Licensing-Options
