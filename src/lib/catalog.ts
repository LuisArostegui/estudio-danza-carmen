import { getCollection, getEntry, type CollectionEntry } from "astro:content";

/**
 * Single source for routes, menus, cards and form selectors.
 * The header dropdown, the category cards and the enquiry selector all read
 * the same `activities` collection, so they can never drift apart.
 */

export type Family = "ballet" | "salud" | "otras";
export type Activity = CollectionEntry<"activities">;
export type Category = CollectionEntry<"categories">;

export const familyOrder: Family[] = ["ballet", "salud", "otras"];

export const familySlug: Record<Family, string> = {
  ballet: "clases-de-ballet-granada",
  salud: "salud-corporal",
  otras: "otras-disciplinas",
};

export const familyLabel: Record<Family, string> = {
  ballet: "Clases de ballet",
  salud: "Salud corporal",
  otras: "Otras disciplinas",
};

export function categoryHref(family: Family): string {
  return `/${familySlug[family]}/`;
}

export function activityHref(activity: Activity): string {
  return `/${familySlug[activity.data.family]}/${activity.id}/`;
}

/** Enquiry page with the activity preselected. */
export function enquiryHref(activity?: Activity): string {
  return activity ? `/contacto/?actividad=${activity.id}` : "/contacto/";
}

export async function getActivities(family?: Family): Promise<Activity[]> {
  const all = await getCollection("activities");
  return all
    .filter((entry) => !family || entry.data.family === family)
    .sort(
      (a, b) =>
        familyOrder.indexOf(a.data.family) -
          familyOrder.indexOf(b.data.family) || a.data.order - b.data.order,
    );
}

export async function getCategories(): Promise<Category[]> {
  const all = await getCollection("categories");
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getSchool() {
  const entry = await getEntry("school", "escuela");
  if (!entry) throw new Error("Missing src/content/school/escuela.md");
  return entry.data;
}

export type MenuLink = {
  label: string;
  href: string;
  /** Only `pending` is announced as "en preparación" in the header. */
  status: "complete" | "pending" | "review";
};

export type MenuItem = MenuLink & { children?: MenuLink[] };

/** The six header entries from Elena's navigation brief. */
export async function getSiteNavigation(): Promise<MenuItem[]> {
  const categories = await getCategories();
  const activities = await getActivities();

  const families: MenuItem[] = categories.map((category) => ({
    label: category.data.menuLabel,
    href: categoryHref(category.data.family),
    status: category.data.status,
    children: activities
      .filter((activity) => activity.data.family === category.data.family)
      .map((activity) => ({
        label: activity.data.menuLabel,
        href: activityHref(activity),
        status: activity.data.status,
      })),
  }));

  const direct: MenuItem[] = directPages.map(({ label, href }) => ({
    label,
    href,
    status: directPageStatus(href),
  }));

  return [...families, ...direct];
}

/** Header entries without a dropdown, in Elena's order (01 · §2). */
export const directPages = [
  { label: "Espectáculos", href: "/espectaculos/" },
  { label: "Exámenes RAD", href: "/examenes-rad/" },
  { label: "Cursos", href: "/cursos/" },
] as const;

/**
 * Built pages with real content that are still waiting for owner review.
 * They stay noindex but are no longer announced as "en preparación".
 */
export const reviewPaths: string[] = ["/espectaculos/"];

/** One status per route, shared by the header and the page itself. */
export function directPageStatus(href: string): MenuLink["status"] {
  if (pendingPages.some((page) => page.path === href)) return "pending";
  return reviewPaths.includes(href) ? "review" : "complete";
}

export type PendingPage = {
  /** Route with leading and trailing slash. */
  path: string;
  title: string;
  /** What Elena or the school still has to provide. */
  needs: string[];
};

/**
 * Pages that receive visible links but are not built yet. They render an
 * explicit "en preparación" page (never a 404) and are excluded from the
 * verified-page tests.
 */
export const pendingPages: PendingPage[] = [
  {
    path: "/sobre-nosotros/",
    title: "Sobre nosotros",
    needs: [
      "Historia y archivo fotográfico",
      "Nombres, funciones y fotos del equipo",
    ],
  },
  {
    path: "/examenes-rad/",
    title: "Exámenes RAD",
    needs: [
      "Denominación exacta: «preparadora» o «examinador oficial»",
      "Uso de la marca RAD",
    ],
  },
  {
    path: "/cursos/",
    title: "Cursos",
    needs: [
      "Próximas convocatorias con fecha, horario, nivel, precio y plazas",
    ],
  },
  {
    path: "/regala-danza/",
    title: "Regala danza",
    needs: ["Modalidades de bono, validez, entrega y canje"],
  },
  {
    path: "/legal/privacy-policy/",
    title: "Política de privacidad",
    needs: ["Texto legal revisado, responsable del tratamiento y buzón"],
  },
  {
    path: "/legal/legal-notice/",
    title: "Aviso legal",
    needs: ["Datos del titular"],
  },
  {
    path: "/legal/cookie-policy/",
    title: "Política de cookies",
    needs: ["Revisar según las integraciones que se publiquen"],
  },
];
