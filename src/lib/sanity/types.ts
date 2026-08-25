export type CtaStyle = "primary" | "secondary" | "text";

export interface Cta {
  label: string;
  href: string;
  style?: CtaStyle;
}

export type LicenceStatus =
  | "approved"
  | "pending verification"
  | "needs consent"
  | "reference only"
  | "do not publish";

export type ConsentStatus = "yes" | "no" | "pending";

export interface SanityImageRef {
  _ref: string;
  _type: "reference";
}

export interface SanityImageSource {
  _type: "image";
  asset?: SanityImageRef;
  crop?: Record<string, number>;
  hotspot?: Record<string, number>;
}

export interface MediaItem {
  asset?: SanityImageSource;
  altText?: string;
  decorative?: boolean;
  caption?: string;
  licenceStatus?: LicenceStatus;
  consentStatus?: ConsentStatus;
  credit?: string;
  usageNotes?: string;
}

export interface HomeContent {
  title: string;
  scriptLabel: string;
  intro: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  academyEyebrow: string;
  academyTitle: string;
  academyIntro: string;
  heroMedia?: MediaItem;
}
