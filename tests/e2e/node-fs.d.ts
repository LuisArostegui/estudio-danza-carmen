// The project has no @types/node; declare the few Node APIs the e2e tests use.
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
  export function readdirSync(path: string): string[];
}
