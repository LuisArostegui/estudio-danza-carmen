import { createClient } from "@sanity/client";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function loadLocalEnv() {
  const envPath = join(process.cwd(), ".env");

  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const separator = trimmed.indexOf("=");
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^(["'])(.*)\1$/, "$2");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.PUBLIC_SANITY_DATASET || "production";
const preview = process.env.SANITY_PREVIEW_DRAFTS === "true";
const token = process.env.SANITY_API_READ_TOKEN;

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertCta(value, context) {
  if (!value || !hasText(value.label) || !hasText(value.href)) {
    throw new Error(`${context} must include a CTA label and href.`);
  }
}

function assertPublishableMedia(media, context) {
  if (!media) return;

  if (media.licenceStatus !== "approved") {
    throw new Error(
      `${context} is not approved for production. Current licence status: ${media.licenceStatus || "missing"}.`,
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

function assertHomeContent(content) {
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
  assertPublishableMedia(content.heroMedia, "homeContent.heroMedia");
}

const mediaProjection = `{
  asset,
  altText,
  decorative,
  caption,
  licenceStatus,
  consentStatus,
  credit,
  usageNotes
}`;

const homeContentQuery = `*[_type == "homeContent"][0]{
  "title": coalesce(title, ""),
  "intro": coalesce(intro, ""),
  "primaryCta": coalesce(primaryCta, featuredLinks[0]),
  "secondaryCta": coalesce(secondaryCta, featuredLinks[1]),
  "heroMedia": heroMedia${mediaProjection}
}`;

if (!projectId) {
  console.log(
    "Sanity content validation skipped: PUBLIC_SANITY_PROJECT_ID is not configured for this environment.",
  );
  process.exit(0);
}

if (preview && !token) {
  throw new Error("SANITY_PREVIEW_DRAFTS=true requires SANITY_API_READ_TOKEN.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-03-01",
  perspective: preview ? "drafts" : "published",
  useCdn: !preview,
  token: preview ? token : undefined,
});

const content = await client.fetch(homeContentQuery);
assertHomeContent(content);

console.log(
  `Sanity ${preview ? "draft" : "published"} content contract verified.`,
);
