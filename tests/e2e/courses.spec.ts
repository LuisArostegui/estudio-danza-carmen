import { expect, test } from "@playwright/test";
import { splitCourses, todayInMadrid } from "../../src/lib/courses";

const course = (
  id: string,
  data: { startDate?: string; endDate?: string; published?: boolean },
) => ({ id, data: { published: true, ...data } });

test.describe("course list dates", () => {
  test("a past course leaves «Próximos cursos»; a future one stays", () => {
    const { upcoming, past } = splitCourses(
      [
        course("vencido", { startDate: "2025-01-18" }),
        course("futuro", { startDate: "2027-03-06" }),
        course("sin-fecha", {}),
        course("en-curso", { startDate: "2026-11-10", endDate: "2026-11-25" }),
        course("oculto", { startDate: "2027-01-01", published: false }),
      ],
      "2026-11-19",
    );
    expect(upcoming.map((c) => c.id)).toEqual([
      "en-curso",
      "futuro",
      "sin-fecha",
    ]);
    expect(past.map((c) => c.id)).toEqual(["vencido"]);
  });

  test("only a structured date allows booking; free text never does", () => {
    const { upcoming, past } = splitCourses(
      [
        // Free text says January 2025 but there is no structured date.
        { id: "texto", data: { published: true, dates: "6 de enero de 2025" } },
        course("fechado", { startDate: "2027-03-06" }),
        course("vencido", { startDate: "2025-01-06" }),
      ],
      "2026-11-19",
    );
    expect(upcoming.map((c) => [c.id, c.mode])).toEqual([
      ["fechado", "book"],
      ["texto", "ask"],
    ]);
    expect(past.map((c) => [c.id, c.mode])).toEqual([["vencido", "past"]]);
  });

  test("a course ending today is still upcoming", () => {
    const { upcoming } = splitCourses(
      [course("hoy", { startDate: "2026-11-19" })],
      "2026-11-19",
    );
    expect(upcoming).toHaveLength(1);
  });

  test("today is computed in Europe/Madrid", () => {
    // 23:30 UTC on 31 Dec is already 1 Jan in Madrid.
    expect(todayInMadrid(new Date("2026-12-31T23:30:00Z"))).toBe("2027-01-01");
  });
});
