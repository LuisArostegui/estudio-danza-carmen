import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Builds /cursos/ with controlled fixture courses, independent of the real
 * content in src/content/courses/:
 * - tests/fixtures/courses-empty: only an unpublished course → empty state;
 * - tests/fixtures/courses-mixed: a future dated course (booking), a course
 *   with its date only as free text (enquiry link, no booking) and a past
 *   course («Cursos anteriores», no link).
 * Each build uses its own outDir and cacheDir, so nothing leaks into dist/
 * or into the normal content cache.
 */
const require = createRequire(import.meta.url);
const astroCli = path.join(
  path.dirname(require.resolve("astro/package.json")),
  "bin",
  "astro.mjs",
);

async function buildCursos(fixture) {
  const work = await mkdtemp(path.join(tmpdir(), `carmen-${fixture}-`));
  try {
    const build = spawnSync(
      process.execPath,
      [astroCli, "build", "--outDir", path.join(work, "dist")],
      {
        env: {
          ...process.env,
          CARMEN_COURSES_DIR: `./tests/fixtures/${fixture}`,
          CARMEN_CACHE_DIR: path.join(work, "cache"),
        },
        stdio: ["ignore", "ignore", "inherit"],
      },
    );
    if (build.status !== 0) throw new Error(`build with ${fixture} failed`);
    return await readFile(path.join(work, "dist/cursos/index.html"), "utf8");
  } finally {
    await rm(work, { recursive: true, force: true });
  }
}

/** Each course card's HTML, keyed by title. */
function cards(html) {
  const found = new Map();
  for (const chunk of html.split(/<li class="course\b/).slice(1)) {
    const card = chunk.split("</li>")[0];
    const title = card.match(/class="course__title"[^>]*>([^<]+)</)?.[1];
    if (title) found.set(title.trim(), card);
  }
  return found;
}

const problems = [];
const check = (ok, message) => ok || problems.push(message);

// Empty state.
const empty = await buildCursos("courses-empty");
check(
  empty.includes('data-testid="courses-empty"'),
  "empty: empty state missing",
);
check(
  !empty.includes('data-testid="course-card"'),
  "empty: a course card is shown",
);
check(
  !empty.includes('data-testid="past-courses"'),
  "empty: past list is shown",
);
check(!empty.includes("Curso oculto"), "empty: unpublished course is shown");

// Mixed: future, undated and past.
const mixed = await buildCursos("courses-mixed");
const [upcomingHtml, pastHtml = ""] = mixed.split('data-testid="past-courses"');
const upcoming = cards(upcomingHtml);
const past = cards(pastHtml);
check(
  !mixed.includes('data-testid="courses-empty"'),
  "mixed: empty state shown with courses",
);

const future = upcoming.get("Taller futuro") ?? "";
check(future, "mixed: future course missing from «Próximos cursos»");
check(
  future.includes('data-course-mode="book"'),
  "mixed: future course is not bookable",
);
check(
  future.includes('data-testid="course-book"'),
  "mixed: future course has no booking link",
);
for (const fact of [
  "Profesora invitada",
  "6 y 7 de marzo de 2099",
  "10:00–14:00",
  "Intermedio",
  "45",
  "12 plazas",
])
  check(future.includes(fact), `mixed: future course lacks «${fact}»`);

const undated = upcoming.get("Taller sin fecha estructurada") ?? "";
check(undated, "mixed: undated course missing from «Próximos cursos»");
check(
  undated.includes('data-course-mode="ask"'),
  "mixed: undated course is not in ask mode",
);
check(
  undated.includes('data-testid="course-ask"'),
  "mixed: undated course has no enquiry link",
);
check(
  !undated.includes('data-testid="course-book"'),
  "mixed: undated course offers booking",
);
check(
  undated.includes("Fecha por confirmar"),
  "mixed: undated course lacks «Fecha por confirmar»",
);
check(
  !undated.includes("6 de enero de 2025"),
  "mixed: undated course shows its unconfirmed free-text date",
);

check(
  [...upcoming.keys()].join("|") ===
    "Taller futuro|Taller sin fecha estructurada",
  `mixed: unexpected upcoming order ${[...upcoming.keys()].join(", ")}`,
);

const finished = past.get("Taller vencido") ?? "";
check(!upcoming.has("Taller vencido"), "mixed: past course listed as upcoming");
check(finished, "mixed: past course missing from «Cursos anteriores»");
check(!/<a\b/.test(finished), "mixed: past course has a link");
check(!finished.includes("Completo"), "mixed: past course still shows places");

if (problems.length) {
  console.error("Courses page check FAILED:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}
console.log(
  "Courses page verified with fixtures: empty state, bookable, to-confirm and past courses.",
);
