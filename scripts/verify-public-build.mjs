import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { parse as parseYaml } from "yaml";

/**
 * Builds the site as it would be published (PUBLIC_HIDE_PREVIEW_NOTES=true)
 * into a temporary folder and checks that no review-only content leaks:
 * owner-confirmation notes, the example-timetable notice and its description.
 */
const require = createRequire(import.meta.url);
const astroCli = path.join(
  path.dirname(require.resolve("astro/package.json")),
  "bin",
  "astro.mjs",
);
const outDir = await mkdtemp(path.join(tmpdir(), "carmen-public-"));

try {
  const build = spawnSync(
    process.execPath,
    [astroCli, "build", "--outDir", outDir],
    {
      env: { ...process.env, PUBLIC_HIDE_PREVIEW_NOTES: "true" },
      stdio: ["ignore", "ignore", "inherit"],
    },
  );
  if (build.status !== 0) throw new Error("public build failed");

  const files = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith(".html")) files.push(full);
    }
  };
  await walk(outDir);

  const problems = [];
  for (const file of files) {
    const html = await readFile(file, "utf8");
    const route = path.relative(outDir, file);
    if (html.includes("Needs owner confirmation"))
      problems.push(`${route}: owner-confirmation note in public build`);
    if (html.includes("Pendiente de confirmar con Elena"))
      problems.push(`${route}: preview facts block in public build`);
  }

  const horarios = await readFile(
    path.join(outDir, "horarios/index.html"),
    "utf8",
  );
  // Expected state follows the timetable data: an example timetable must be
  // replaced by the empty state; a confirmed one must be shown.
  // Parse the frontmatter (any valid YAML layout, e.g. one-line sessions).
  const scheduleSource = await readFile(
    "src/content/schedule/horario.md",
    "utf8",
  );
  const frontmatter = scheduleSource.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!frontmatter)
    throw new Error("src/content/schedule/horario.md has no frontmatter");
  const schedule = parseYaml(frontmatter) ?? {};
  const isExample = schedule.isExample === true;
  const hasSessions =
    Array.isArray(schedule.sessions) && schedule.sessions.length > 0;
  const hasTable = horarios.includes('data-testid="timetable"');
  const hasEmpty = horarios.includes('data-testid="schedule-empty"');
  if (horarios.includes('data-testid="schedule-example-note"'))
    problems.push("horarios: example notice in public build");
  if (/<meta name="description" content="Ejemplo/.test(horarios))
    problems.push("horarios: example meta description in public build");
  if (isExample || !hasSessions) {
    if (!hasEmpty)
      problems.push("horarios: empty state missing for example data");
    if (hasTable) problems.push("horarios: example timetable in public build");
    if (horarios.includes("Actualizado:"))
      problems.push("horarios: «Actualizado» date without a timetable");
  } else {
    if (!hasTable) problems.push("horarios: confirmed timetable missing");
    if (hasEmpty)
      problems.push("horarios: empty state shown with a confirmed timetable");
  }

  if (problems.length) {
    console.error("Public build check FAILED:");
    for (const problem of problems) console.error(`- ${problem}`);
    process.exit(1);
  }
  console.log(
    `Public build verified: ${files.length} HTML files, no review-only content.`,
  );
} finally {
  await rm(outDir, { recursive: true, force: true });
}
