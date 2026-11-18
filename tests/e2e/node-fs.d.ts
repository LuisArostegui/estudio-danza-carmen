// The project has no @types/node; declare the single Node API the e2e helpers use.
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
}
