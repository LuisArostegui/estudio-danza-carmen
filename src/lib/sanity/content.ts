import {
  headerNavigation,
  legalNavigation,
  primaryNavigation,
  secondaryNavigation,
} from "../navigation";
import {
  fetchSanityQuery,
  isSanityConfigured,
  isSanityPreviewBuild,
} from "./client";
import { homeContentQuery, siteSettingsQuery } from "./queries";
import type { HomeContent, SiteSettings } from "./types";
import {
  assertHomeContent,
  assertSiteSettings,
  isPublishableMedia,
} from "./validation";

export const fallbackSiteSettings: SiteSettings = {
  siteName: "Estudio de Danza Carmen",
  brandLabel: "Danza Carmen",
  topbarMessage: "Bienvenidos a nuestra academia de danza",
  address: "Calle Casillas de Prats, 10\n18002 Granada",
  email: "hola@estudiodanzacarmen.test",
  phone: undefined,
  phoneLabel: "Teléfono pendiente",
  footerNote: "Contacto y horarios de atención pendientes de confirmación.",
  headerNavigation,
  footerPrimaryTitle: "Principal",
  footerPrimaryNavigation: primaryNavigation,
  footerSecondaryTitle: "También en la escuela",
  footerSecondaryNavigation: secondaryNavigation,
  footerLegalTitle: "Legal",
  footerLegalNavigation: legalNavigation,
  mainNavigationLabel: "Navegación principal",
  mobileNavigationLabel: "Navegación principal",
  footerNavigationLabel: "Navegación de pie de página",
  searchLabel: "Buscar clases",
  menuLabel: "Menú",
};

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

function withSiteSettingsFallback(
  settings: Partial<SiteSettings> | null,
): SiteSettings {
  return {
    ...fallbackSiteSettings,
    ...settings,
    brandLabel:
      settings?.brandLabel ||
      settings?.siteName ||
      fallbackSiteSettings.brandLabel,
    phoneLabel:
      settings?.phoneLabel ||
      settings?.phone ||
      fallbackSiteSettings.phoneLabel,
    headerNavigation: settings?.headerNavigation?.length
      ? settings.headerNavigation
      : fallbackSiteSettings.headerNavigation,
    footerPrimaryNavigation: settings?.footerPrimaryNavigation?.length
      ? settings.footerPrimaryNavigation
      : fallbackSiteSettings.footerPrimaryNavigation,
    footerSecondaryNavigation: settings?.footerSecondaryNavigation?.length
      ? settings.footerSecondaryNavigation
      : fallbackSiteSettings.footerSecondaryNavigation,
    footerLegalNavigation: settings?.footerLegalNavigation?.length
      ? settings.footerLegalNavigation
      : fallbackSiteSettings.footerLegalNavigation,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured()) {
    return fallbackSiteSettings;
  }

  const settings = await fetchSanityQuery<Partial<SiteSettings> | null>(
    siteSettingsQuery,
    isSanityPreviewBuild() ? "preview" : "published",
  );
  const mergedSettings = withSiteSettingsFallback(settings);

  assertSiteSettings(mergedSettings);

  return mergedSettings;
}

export async function getHomeContent(): Promise<HomeContent> {
  if (!isSanityConfigured()) {
    return fallbackHomeContent;
  }

  const content = await fetchSanityQuery<HomeContent | null>(
    homeContentQuery,
    isSanityPreviewBuild() ? "preview" : "published",
  );

  assertHomeContent(content, { validateMedia: false });

  return {
    ...content,
    heroMedia: isPublishableMedia(content.heroMedia)
      ? content.heroMedia
      : undefined,
  };
}
