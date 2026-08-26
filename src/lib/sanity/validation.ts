import type { Cta, HomeContent, MediaItem, SiteSettings } from "./types";

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export interface HomeContentValidationOptions {
  validateMedia?: boolean;
}

export function assertCta(
  value: Cta | undefined,
  context: string,
): asserts value is Cta {
  if (!value || !hasText(value.label) || !hasText(value.href)) {
    throw new Error(`${context} must include a CTA label and href.`);
  }
}

export function assertNavigationItems(
  value: Cta[] | undefined,
  context: string,
): asserts value is Cta[] {
  if (!value?.length) {
    throw new Error(`${context} must include at least one navigation item.`);
  }

  value.forEach((item, index) => assertCta(item, `${context}[${index}]`));
}

export function assertSiteSettings(
  settings: SiteSettings | null,
): asserts settings is SiteSettings {
  if (!settings) {
    throw new Error("Sanity siteSettings document is missing.");
  }

  if (!hasText(settings.siteName)) {
    throw new Error("siteSettings.siteName is required.");
  }

  if (!hasText(settings.brandLabel)) {
    throw new Error("siteSettings.brandLabel is required.");
  }

  assertNavigationItems(
    settings.headerNavigation,
    "siteSettings.headerNavigation",
  );
  assertNavigationItems(
    settings.footerPrimaryNavigation,
    "siteSettings.footerPrimaryNavigation",
  );
}

export function isPublishableMedia(
  media: MediaItem | undefined,
): media is MediaItem {
  if (!media) return false;
  if (media.licenceStatus !== "approved") return false;
  if (media.consentStatus && media.consentStatus !== "yes") return false;
  if (!media.decorative && !hasText(media.altText)) return false;
  return Boolean(media.asset?.asset?._ref);
}

export function assertPublishableMedia(
  media: MediaItem | undefined,
  context: string,
): asserts media is MediaItem {
  if (!media) return;

  if (media.licenceStatus !== "approved") {
    throw new Error(
      `${context} is not approved for production. Current licence status: ${media.licenceStatus ?? "missing"}.`,
    );
  }

  if (media.consentStatus && media.consentStatus !== "yes") {
    throw new Error(
      `${context} includes identifiable-person consent status ${media.consentStatus}. Production media requires consent status yes.`,
    );
  }

  if (!media.decorative && !hasText(media.altText)) {
    throw new Error(`${context} is informative and must include alt text.`);
  }

  if (!media.asset?.asset?._ref) {
    throw new Error(`${context} must include a Sanity image asset reference.`);
  }
}

export function assertHomeContent(
  content: HomeContent | null,
  options: HomeContentValidationOptions = {},
): asserts content is HomeContent {
  if (!content) {
    throw new Error("Sanity homeContent document is missing.");
  }

  if (!hasText(content.title)) {
    throw new Error("homeContent.title is required.");
  }

  if (!hasText(content.intro)) {
    throw new Error("homeContent.intro is required.");
  }

  assertCta(content.primaryCta, "homeContent.primaryCta");
  assertCta(content.secondaryCta, "homeContent.secondaryCta");

  if (options.validateMedia ?? true) {
    assertPublishableMedia(content.heroMedia, "homeContent.heroMedia");
  }
}
