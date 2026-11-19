/**
 * Splits courses into upcoming and past ones. Pure (no Astro imports) so it
 * can be tested directly.
 *
 * A course is past when its last day (`endDate`, or `startDate` for a
 * one-day course) is before `today`. A course with no date yet counts as
 * upcoming. Dates are ISO strings (YYYY-MM-DD), compared as text.
 */
export type CourseDates = {
  published: boolean;
  startDate?: string;
  endDate?: string;
};

/** Today in Granada as YYYY-MM-DD (the site is rebuilt to refresh it). */
export function todayInMadrid(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function splitCourses<T extends { data: CourseDates }>(
  courses: T[],
  today: string,
): { upcoming: T[]; past: T[] } {
  const published = courses.filter((course) => course.data.published);
  const lastDay = (course: T) => course.data.endDate ?? course.data.startDate;
  const upcoming = published
    .filter((course) => {
      const last = lastDay(course);
      return !last || last >= today;
    })
    .sort((a, b) =>
      (a.data.startDate ?? "9999").localeCompare(b.data.startDate ?? "9999"),
    );
  const past = published
    .filter((course) => {
      const last = lastDay(course);
      return Boolean(last) && last! < today;
    })
    .sort((a, b) => lastDay(b)!.localeCompare(lastDay(a)!));
  return { upcoming, past };
}
