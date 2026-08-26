import { createClient, type ClientPerspective } from "@sanity/client";

export const sanityApiVersion = "2026-03-01";

export type SanityMode = "published" | "preview";

export function getSanityProjectId(): string | undefined {
  return import.meta.env.PUBLIC_SANITY_PROJECT_ID;
}

export function getSanityDataset(): string {
  return import.meta.env.PUBLIC_SANITY_DATASET ?? "production";
}

export function isSanityConfigured(): boolean {
  return Boolean(getSanityProjectId() && getSanityDataset());
}

export function isSanityPreviewBuild(): boolean {
  return import.meta.env.SANITY_PREVIEW_DRAFTS === "true";
}

export function getSanityClient(mode: SanityMode = "published") {
  const projectId = getSanityProjectId();

  if (!projectId) {
    throw new Error(
      "Missing PUBLIC_SANITY_PROJECT_ID. Add it to the local environment or deployment secrets.",
    );
  }

  const preview = mode === "preview";
  const token = import.meta.env.SANITY_API_READ_TOKEN;

  if (preview && !token) {
    throw new Error(
      "Missing SANITY_API_READ_TOKEN. Draft preview requires a server-side Sanity read token.",
    );
  }

  const perspective: ClientPerspective = preview ? "drafts" : "published";

  return createClient({
    projectId,
    dataset: getSanityDataset(),
    apiVersion: sanityApiVersion,
    perspective,
    useCdn: !preview,
    token: preview ? token : undefined,
  });
}

export async function fetchSanityQuery<T>(
  query: string,
  mode: SanityMode = "published",
): Promise<T> {
  const projectId = getSanityProjectId();

  if (!projectId) {
    throw new Error(
      "Missing PUBLIC_SANITY_PROJECT_ID. Add it to the local environment or deployment secrets.",
    );
  }

  const preview = mode === "preview";
  const token = import.meta.env.SANITY_API_READ_TOKEN;

  if (preview && !token) {
    throw new Error(
      "Missing SANITY_API_READ_TOKEN. Draft preview requires a server-side Sanity read token.",
    );
  }

  const host = preview ? "api.sanity.io" : "apicdn.sanity.io";
  const url = new URL(
    `https://${projectId}.${host}/v${sanityApiVersion}/data/query/${getSanityDataset()}`,
  );
  url.searchParams.set("query", query);
  url.searchParams.set("perspective", preview ? "drafts" : "published");

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `Sanity query failed with ${response.status} ${response.statusText}.`,
    );
  }

  const payload = (await response.json()) as { result?: T; error?: unknown };

  if (payload.error) {
    throw new Error(`Sanity query failed: ${JSON.stringify(payload.error)}`);
  }

  return payload.result as T;
}
