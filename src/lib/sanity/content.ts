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
import type {
  Cta,
  EditorialCard,
  HomeContent,
  HomeFinalPrompt,
  MediaItem,
  SiteSettings,
} from "./types";
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
  phoneLabel: "Telefono pendiente",
  footerNote: "Contacto y horarios de atencion pendientes de confirmacion.",
  headerNavigation,
  footerPrimaryTitle: "Principal",
  footerPrimaryNavigation: primaryNavigation,
  footerSecondaryTitle: "Tambien en la escuela",
  footerSecondaryNavigation: secondaryNavigation,
  footerLegalTitle: "Legal",
  footerLegalNavigation: legalNavigation,
  mainNavigationLabel: "Navegación principal",
  mobileNavigationLabel: "Navegación principal",
  footerNavigationLabel: "Navegacion de pie de pagina",
  searchLabel: "Buscar clases",
  menuLabel: "Menu",
};

export const fallbackHomeContent: HomeContent = {
  title: "El movimiento\nse convierte en arte",
  scriptLabel: "Dance with soul",
  intro:
    "Danza clasica y contemporanea para descubrir una tecnica mas libre, expresiva y personal.",
  primaryCta: {
    label: "Descubrir clases",
    href: "/classes/",
    style: "primary",
  },
  secondaryCta: {
    label: "Conocenos",
    href: "/#academia",
    style: "text",
  },
  academyEyebrow: "Academia",
  academyTitle: "Estudio de Danza Carmen",
  academyIntro:
    "Escuela de danza en Granada con una trayectoria cercana y cuidada.",
  classPathwaysEyebrow: "Clases",
  classPathwaysTitle: "Elige tu camino en la escuela",
  classPathwaysIntro:
    "Una entrada clara a los recorridos principales, sin perder el tono editorial y sereno de Arabesque.",
  classPathways: [
    {
      eyebrow: "Infantil",
      title: "Ballet infantil",
      text: "Primeros pasos en la danza con tecnica, musicalidad y un ritmo adaptado a cada edad.",
      linkLabel: "Ver clases",
      href: "/classes/",
    },
    {
      eyebrow: "Niveles",
      title: "Ballet por niveles",
      text: "Grupos organizados para avanzar con base clasica, precision y continuidad.",
      linkLabel: "Consultar grupos",
      href: "/classes/",
    },
    {
      eyebrow: "Adultos",
      title: "Ballet adultos",
      text: "Clases para retomar, empezar o profundizar en la danza desde una practica cuidada.",
      linkLabel: "Descubrir opciones",
      href: "/classes/",
    },
    {
      eyebrow: "Especializado",
      title: "Trabajo corporal y privado",
      text: "Sesiones orientadas a tecnica, movilidad, preparacion y acompanamiento personalizado.",
      linkLabel: "Pedir informacion",
      href: "/contact/",
    },
  ],
  planningEyebrow: "Organiza tu semana",
  planningTitle: "Horarios y contacto claros para empezar",
  planningIntro:
    "La Home debe llevar rapido a las decisiones practicas: que clase encaja, cuando se imparte y como resolver dudas.",
  planningCards: [
    {
      title: "Horarios",
      text: "Consulta la organizacion semanal antes de elegir grupo o pedir plaza.",
      linkLabel: "Ver horarios",
      href: "/schedules/",
    },
    {
      title: "Contacto",
      text: "Escribe a la escuela para resolver disponibilidad, nivel recomendado o proceso de entrada.",
      linkLabel: "Contactar",
      href: "/contact/",
    },
  ],
  trustEyebrow: "Escuela",
  trustTitle: "Una practica cercana, tecnica y cuidada",
  trustIntro:
    "La comunicacion debe transmitir disciplina, atencion personal y un ambiente academico sin inventar claims no confirmados.",
  trustItems: [
    {
      title: "Acompanamiento",
      text: "Grupos pensados para aprender con progresion y seguimiento docente.",
    },
    {
      title: "RAD",
      text: "Informacion especifica sobre RAD disponible como ruta de confianza cuando el contenido este confirmado.",
      linkLabel: "Ver RAD",
      href: "/rad/",
    },
    {
      title: "Escenario",
      text: "Actuaciones y experiencias de escuela como parte del recorrido formativo cuando proceda.",
      linkLabel: "Ver actuaciones",
      href: "/performances/",
    },
  ],
  discoveryEyebrow: "Tambien en Carmen",
  discoveryTitle: "Mas formas de vivir la danza",
  discoveryCards: [
    {
      title: "Instalaciones",
      text: "Conoce el espacio de trabajo antes de visitar la escuela.",
      linkLabel: "Ver instalaciones",
      href: "/facilities/",
    },
    {
      title: "Cursos",
      text: "Programas y propuestas puntuales cuando haya informacion publicada.",
      linkLabel: "Ver cursos",
      href: "/courses/",
    },
    {
      title: "Actuaciones",
      text: "Momentos escenicos y actividades vinculadas a la vida de la escuela.",
      linkLabel: "Ver actuaciones",
      href: "/performances/",
    },
  ],
  finalPrompt: {
    eyebrow: "Hablemos",
    title: "Encuentra la clase que encaja contigo",
    intro:
      "Cuentanos edad, experiencia y disponibilidad para orientarte hacia el grupo mas adecuado.",
    primaryCta: {
      label: "Contactar",
      href: "/contact/",
      style: "primary",
    },
    secondaryCta: {
      label: "Ver horarios",
      href: "/schedules/",
      style: "text",
    },
  },
};

function isUsableCta(value: Cta | undefined): value is Cta {
  return Boolean(value?.label?.trim() && value.href?.trim());
}

function textOrFallback(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback;
}

type HomeContentQueryResult = Omit<
  Partial<HomeContent>,
  | "classPathways"
  | "planningCards"
  | "trustItems"
  | "discoveryCards"
  | "finalPrompt"
  | "heroMedia"
> & {
  classPathways?: EditorialCard[] | null;
  planningCards?: EditorialCard[] | null;
  trustItems?: EditorialCard[] | null;
  discoveryCards?: EditorialCard[] | null;
  finalPrompt?: HomeFinalPrompt | null;
  heroMedia?: MediaItem | null;
};

function normalizeHomeContentQueryResult(
  content: HomeContentQueryResult,
): Partial<HomeContent> {
  return {
    ...content,
    classPathways: content.classPathways ?? undefined,
    planningCards: content.planningCards ?? undefined,
    trustItems: content.trustItems ?? undefined,
    discoveryCards: content.discoveryCards ?? undefined,
    finalPrompt: content.finalPrompt ?? undefined,
    heroMedia: content.heroMedia ?? undefined,
  };
}
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

export function normalizeConfiguredHomeContent(
  content: HomeContentQueryResult,
): HomeContent {
  const normalizedContent = normalizeHomeContentQueryResult(content);
  const fallbackFinalPrompt = fallbackHomeContent.finalPrompt!;
  const finalPrompt = normalizedContent.finalPrompt
    ? {
        ...fallbackFinalPrompt,
        ...normalizedContent.finalPrompt,
        eyebrow: textOrFallback(
          normalizedContent.finalPrompt.eyebrow,
          fallbackFinalPrompt.eyebrow,
        ),
        title: textOrFallback(
          normalizedContent.finalPrompt.title,
          fallbackFinalPrompt.title,
        ),
        intro: textOrFallback(
          normalizedContent.finalPrompt.intro,
          fallbackFinalPrompt.intro,
        ),
        primaryCta: isUsableCta(normalizedContent.finalPrompt.primaryCta)
          ? normalizedContent.finalPrompt.primaryCta
          : fallbackFinalPrompt.primaryCta,
        secondaryCta: isUsableCta(normalizedContent.finalPrompt.secondaryCta)
          ? normalizedContent.finalPrompt.secondaryCta
          : undefined,
      }
    : undefined;

  return {
    ...fallbackHomeContent,
    ...normalizedContent,
    title: textOrFallback(normalizedContent.title, fallbackHomeContent.title),
    scriptLabel: textOrFallback(
      normalizedContent.scriptLabel,
      fallbackHomeContent.scriptLabel,
    ),
    intro: textOrFallback(normalizedContent.intro, fallbackHomeContent.intro),
    academyEyebrow: textOrFallback(
      normalizedContent.academyEyebrow,
      fallbackHomeContent.academyEyebrow,
    ),
    academyTitle: textOrFallback(
      normalizedContent.academyTitle,
      fallbackHomeContent.academyTitle,
    ),
    academyIntro: textOrFallback(
      normalizedContent.academyIntro,
      fallbackHomeContent.academyIntro,
    ),
    classPathwaysEyebrow: textOrFallback(
      normalizedContent.classPathwaysEyebrow,
      fallbackHomeContent.classPathwaysEyebrow,
    ),
    classPathwaysTitle: textOrFallback(
      normalizedContent.classPathwaysTitle,
      fallbackHomeContent.classPathwaysTitle,
    ),
    classPathwaysIntro: textOrFallback(
      normalizedContent.classPathwaysIntro,
      fallbackHomeContent.classPathwaysIntro,
    ),
    planningEyebrow: textOrFallback(
      normalizedContent.planningEyebrow,
      fallbackHomeContent.planningEyebrow,
    ),
    planningTitle: textOrFallback(
      normalizedContent.planningTitle,
      fallbackHomeContent.planningTitle,
    ),
    planningIntro: textOrFallback(
      normalizedContent.planningIntro,
      fallbackHomeContent.planningIntro,
    ),
    trustEyebrow: textOrFallback(
      normalizedContent.trustEyebrow,
      fallbackHomeContent.trustEyebrow,
    ),
    trustTitle: textOrFallback(
      normalizedContent.trustTitle,
      fallbackHomeContent.trustTitle,
    ),
    trustIntro: textOrFallback(
      normalizedContent.trustIntro,
      fallbackHomeContent.trustIntro,
    ),
    discoveryEyebrow: textOrFallback(
      normalizedContent.discoveryEyebrow,
      fallbackHomeContent.discoveryEyebrow,
    ),
    discoveryTitle: textOrFallback(
      normalizedContent.discoveryTitle,
      fallbackHomeContent.discoveryTitle,
    ),
    primaryCta: isUsableCta(normalizedContent.primaryCta)
      ? normalizedContent.primaryCta
      : fallbackHomeContent.primaryCta,
    secondaryCta: isUsableCta(normalizedContent.secondaryCta)
      ? normalizedContent.secondaryCta
      : fallbackHomeContent.secondaryCta,
    classPathways: normalizedContent.classPathways,
    planningCards: normalizedContent.planningCards,
    trustItems: normalizedContent.trustItems,
    discoveryCards: normalizedContent.discoveryCards,
    finalPrompt,
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

  const content = await fetchSanityQuery<HomeContentQueryResult | null>(
    homeContentQuery,
    isSanityPreviewBuild() ? "preview" : "published",
  );

  if (!content) {
    throw new Error("Sanity homeContent document is missing.");
  }

  const normalizedContent = normalizeHomeContentQueryResult(content);
  assertHomeContent(normalizedContent, { validateMedia: false });

  const mergedContent = normalizeConfiguredHomeContent(content);

  assertHomeContent(mergedContent, { validateMedia: false });

  return {
    ...mergedContent,
    heroMedia: isPublishableMedia(mergedContent.heroMedia)
      ? mergedContent.heroMedia
      : undefined,
  };
}
