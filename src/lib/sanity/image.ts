import { createImageUrlBuilder } from "@sanity/image-url";

import { getSanityDataset, getSanityProjectId } from "./client";
import type { MediaItem } from "./types";
import { assertPublishableMedia } from "./validation";

export interface ResponsiveImageOptions {
  width: number;
  height?: number;
  widths?: number[];
  sizes: string;
  quality?: number;
  loading?: "eager" | "lazy";
}

function uniqueSortedWidths(widths: number[]): number[] {
  return [...new Set(widths.filter((width) => width > 0))].sort(
    (a, b) => a - b,
  );
}

export function buildResponsiveWidths(targetWidth: number): number[] {
  return uniqueSortedWidths([
    Math.round(targetWidth * 0.5),
    targetWidth,
    Math.round(targetWidth * 1.5),
    targetWidth * 2,
  ]);
}

export function getSanityImageAttrs(
  media: MediaItem,
  options: ResponsiveImageOptions,
) {
  assertPublishableMedia(media, "Sanity image");

  if (!media.asset) {
    throw new Error(
      "Sanity image must include an asset before URL generation.",
    );
  }

  const source: NonNullable<MediaItem["asset"]> = media.asset;
  const projectId = getSanityProjectId();

  if (!projectId) {
    throw new Error(
      "Missing PUBLIC_SANITY_PROJECT_ID before image URL generation.",
    );
  }

  const builder = createImageUrlBuilder({
    projectId,
    dataset: getSanityDataset(),
  });
  const widths = uniqueSortedWidths(
    options.widths ?? buildResponsiveWidths(options.width),
  );
  const quality = options.quality ?? 82;

  function urlForWidth(width: number): string {
    const image = builder
      .image(source)
      .width(width)
      .quality(quality)
      .auto("format")
      .fit("max");

    const sizedImage = options.height ? image.height(options.height) : image;
    const url = sizedImage.url();

    if (!url) {
      throw new Error("Sanity image URL builder returned an empty URL.");
    }

    return url;
  }

  return {
    src: urlForWidth(options.width),
    srcset: widths.map((width) => `${urlForWidth(width)} ${width}w`).join(", "),
    sizes: options.sizes,
    width: options.width,
    height: options.height,
    alt: media.decorative ? "" : (media.altText ?? ""),
    loading: options.loading ?? "lazy",
    decoding: "async" as const,
  };
}
