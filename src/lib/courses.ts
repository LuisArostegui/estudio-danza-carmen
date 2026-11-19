/**
 * Splits courses into upcoming and past ones. Pure (no Astro imports) so it
 * can be tested directly.
 *
 * Only structured dates (`startDate`, `endDate`, YYYY-MM-DD) count. The free
 * text in `dates` is for display and is never interpreted:
 * - last day (`endDate`, or `startDate` for a one-day course) before today
 *   → past, no booking;
 * - structured date today or later → upcoming, bookable;
 * - no structured date → upcoming but «fecha por confirmar»: the card offers
 *   an enquiry link, never a booking link.
 */
export type CourseDates = {
  published: boolean;
  startDate?: string;
  endDate?: string;
};

export type CourseMode = "book" | "ask" | "past";

/** Today in Granada as YYYY-MM-DD (the site is rebuilt to refresh it). */
export function todayInMadrid(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function courseMode(course: CourseDates, today: string): CourseMode {
  const last = course.endDate ?? course.startDate;
  if (!last) return "ask";
  return last < today ? "past" : "book";
}

export function splitCourses<T extends { data: CourseDates }>(
  courses: T[],
  today: string,
): {
  upcoming: (T & { mode: "book" | "ask" })[];
  past: (T & { mode: "past" })[];
} {
  const withMode = courses
    .filter((course) => course.data.published)
    .map((course) => ({ ...course, mode: courseMode(course.data, today) }));
  const upcoming = withMode
    .filter(
      (course): course is T & { mode: "book" | "ask" } =>
        course.mode !== "past",
    )
    // Dated courses first, by start date; undated ones after them.
    .sort((a, b) =>
      (a.data.startDate ?? "9999").localeCompare(b.data.startDate ?? "9999"),
    );
  const last = (course: T) => (course.data.endDate ?? course.data.startDate)!;
  const past = withMode
    .filter((course): course is T & { mode: "past" } => course.mode === "past")
    .sort((a, b) => last(b).localeCompare(last(a)));
  return { upcoming, past };
}
