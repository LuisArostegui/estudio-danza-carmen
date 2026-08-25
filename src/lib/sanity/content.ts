import {
  getSanityClient,
  isSanityConfigured,
  isSanityPreviewBuild,
} from "./client";
import { homeContentQuery } from "./queries";
import type { HomeContent } from "./types";
import { assertHomeContent } from "./validation";

export const fallbackHomeContent: HomeContent = {
  title: "El movimiento\nse convierte en arte",
  scriptLabel: "Dance with soul",
  intro:
    "Danza clásica y contemporánea para descubrir una técnica más libre, expresiva y personal.",
  primaryCta: {
    label: "Descubrir clases",
    href: "/classes/",
    style: "primary",
  },
  secondaryCta: {
    label: "Conócenos",
    href: "/#academia",
    style: "text",
  },
  academyEyebrow: "Academia",
  academyTitle: "Estudio de Danza Carmen",
  academyIntro:
    "Escuela de danza en Granada con una trayectoria cercana y cuidada.",
};

export async function getHomeContent(): Promise<HomeContent> {
  if (!isSanityConfigured()) {
    return fallbackHomeContent;
  }

  const client = getSanityClient(
    isSanityPreviewBuild() ? "preview" : "published",
  );
  const content = await client.fetch<HomeContent | null>(homeContentQuery);

  assertHomeContent(content);

  return content;
}
