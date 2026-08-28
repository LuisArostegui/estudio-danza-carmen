import { readFile } from "node:fs/promises";

async function read(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

const files = {
  workflow: await read(".github/workflows/quality.yml"),
  dependabot: await read(".github/dependabot.yml"),
  packageJson: await read("package.json"),
  playwright: await read("playwright.config.mjs"),
  e2eHome: await read("tests/e2e/home.spec.ts"),
  generatedLinks: await read("scripts/verify-generated-site-links.mjs"),
  readme: await read("README.md"),
  testing: await read("docs/testing.md"),
};

const expectedFragments = [
  ["workflow", "name: CI"],
  ["workflow", "pull_request:"],
  ["workflow", "push:"],
  ["workflow", "branches: [main]"],
  ["workflow", "pnpm/action-setup"],
  ["workflow", "version: 11.21.0"],
  ["workflow", "node-version-file: .nvmrc"],
  ["workflow", "pnpm install --frozen-lockfile"],
  ["workflow", "pnpm validate"],
  ["workflow", "pnpm exec playwright install --with-deps chromium"],
  ["dependabot", "version: 2"],
  ["dependabot", 'package-ecosystem: "npm"'],
  ["dependabot", 'directory: "/"'],
  ["dependabot", 'interval: "weekly"'],
  ["dependabot", "open-pull-requests-limit: 2"],
  ["dependabot", "update-types:"],
  ["packageJson", '"test:site"'],
  ["packageJson", '"test:e2e"'],
  ["packageJson", '"@axe-core/playwright"'],
  ["packageJson", '"@playwright/test"'],
  ["packageJson", '"linkinator"'],
  ["generatedLinks", "linkinator"],
  ["generatedLinks", "viteCliPath"],
  ["generatedLinks", "PLANNED_ROUTE_PATTERN"],
  ["playwright", 'testDir: "./tests/e2e"'],
  ["playwright", "mobile-chromium"],
  ["playwright", "viteCliPath"],
  ["e2eHome", "AxeBuilder"],
  ["e2eHome", "mobile navigation opens and closes"],
  ["e2eHome", "cms debug mode exposes Sanity field keys"],
  ["readme", "[docs/testing.md](docs/testing.md)"],
  ["testing", "pnpm validate"],
  ["testing", "pnpm test:site"],
  ["testing", "pnpm test:e2e"],
  ["testing", "Playwright"],
  ["testing", "Linkinator"],
  ["testing", "CI / quality"],
  ["testing", "Dependabot"],
  ["testing", "CD-42"],
];

const missing = expectedFragments.filter(
  ([fileKey, fragment]) => !files[fileKey].includes(fragment),
);

if (missing.length > 0) {
  console.error("Missing expected project tooling fragments:");
  for (const [fileKey, fragment] of missing) {
    console.error(`- ${fileKey}: ${fragment}`);
  }

  process.exit(1);
}
