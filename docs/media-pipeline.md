# Image And Media Pipeline

This document records the CD-30 media pipeline implementation boundary.

## Accepted Media

| Media               | Accepted formats                               | Notes                                                                    |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ |
| Editorial photos    | `jpg`, `jpeg`, `png`, `webp`, `avif`           | Prefer Sanity image assets with crop/hotspot enabled.                    |
| Decorative graphics | `svg`, `png`, `webp`, `avif`                   | Must be marked decorative when they convey no content.                   |
| Video               | Externally hosted embed or linked provider URL | Do not commit video files to the repo for MVP.                           |
| Documents/files     | Case-by-case through Sanity file assets        | Do not upload private certificates, contracts, IDs, or consent evidence. |

Repository `public/assets/` is intentionally limited. Real production photography should normally go through Sanity so dimensions, alt text, licence status, consent status, and crop/hotspot can travel with the media record.

## Responsive Images

`src/lib/sanity/image.ts` provides `getSanityImageAttrs()` for Sanity images. It generates:

- `src`;
- `srcset` with representative widths;
- `sizes`;
- fixed `width` and optional `height` values;
- `alt` based on the CMS media record;
- `loading` and `decoding` attributes.

The helper uses Sanity image transforms with `auto=format`, quality control, and `fit=max` to avoid unnecessary upscaling. Sanity crop/hotspot data is preserved when the image object is supplied.

## Layout Stability

Front-end components should reserve space through one of these approaches:

- explicit `width` and `height` attributes for rendered images;
- stable CSS `aspect-ratio` for image containers;
- fixed section constraints when a background image is used.

The current home hero keeps a stable section height and can switch from the local temporary hero background to a Sanity-provided approved hero image without changing the Arabesque-faithful layout.

## Alt Text And Decorative Media

| Media type                | Requirement                                                 |
| ------------------------- | ----------------------------------------------------------- |
| Informative image         | `altText` is required.                                      |
| Decorative image          | Mark `decorative: true`; rendered alt text may be empty.    |
| Captioned editorial image | Caption must be public-safe.                                |
| Identifiable person       | Consent status must be `yes` before production publication. |

## Licence And Consent Gate

Production media must satisfy:

```text
licenceStatus = approved
consentStatus = yes, when identifiable people appear
```

The validation layer rejects unapproved Sanity media when it is used by a production-facing page. The temporary Arabesque reference hero remains documented as pending verification in `docs/asset-inventory.md` and must not be treated as approved production media until rights are confirmed.

## Oversized Or Invalid Uploads

`pnpm check:media` validates repository public assets. It currently fails when:

- a public asset uses an unsupported file extension;
- a representative public asset exceeds `2 MiB`.

Sanity-side upload constraints should be added to Studio schema validation when the Studio schemas are implemented. At minimum, image fields should require media metadata, hotspot/crop where useful, and the licence/consent fields described in `docs/sanity-content-model.md`.

## Video Handling

For MVP, videos should remain externally hosted. The CMS should store only public-safe embed/link metadata and should not store private files, music licence evidence, or raw performance footage.

## Performance Measurement

Use this sequence for representative page checks:

```text
pnpm validate
pnpm preview
```

Then inspect the representative page in the browser or a later Lighthouse/PageSpeed issue. For this batch, the executable baseline is that build output succeeds, local public assets stay within the defined size gate, and Sanity images have a responsive URL helper available for pages that consume CMS media.
