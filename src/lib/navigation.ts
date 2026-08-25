export type NavigationItem = {
  href: string;
  label: string;
  match?: "exact" | "section";
};

export const primaryNavigation: NavigationItem[] = [
  { href: "/", label: "Inicio", match: "exact" },
  { href: "/classes/", label: "Clases", match: "section" },
  { href: "/schedules/", label: "Horarios", match: "exact" },
  { href: "/teachers/", label: "Profesorado", match: "exact" },
  { href: "/rad/", label: "RAD", match: "exact" },
  { href: "/contact/", label: "Contacto", match: "exact" },
];

export const secondaryNavigation: NavigationItem[] = [
  { href: "/facilities/", label: "Instalaciones", match: "exact" },
  { href: "/performances/", label: "Actuaciones", match: "exact" },
  { href: "/courses/", label: "Cursos", match: "exact" },
];

export const legalNavigation: NavigationItem[] = [
  { href: "/legal/legal-notice/", label: "Aviso legal", match: "exact" },
  {
    href: "/legal/privacy-policy/",
    label: "Política de privacidad",
    match: "exact",
  },
  {
    href: "/legal/cookie-policy/",
    label: "Política de cookies",
    match: "exact",
  },
];

export function isCurrentPath(pathname: string, item: NavigationItem): boolean {
  if (item.match === "section") {
    return pathname === item.href || pathname.startsWith(item.href);
  }

  return pathname === item.href;
}
