import { access } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const sourceExtensions = [".ts", ".js"];

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    if (!specifier.startsWith(".") || /\.[a-z]+$/i.test(specifier)) {
      throw error;
    }

    for (const extension of sourceExtensions) {
      const candidate = new URL(`${specifier}${extension}`, context.parentURL);
      try {
        await access(fileURLToPath(candidate));
        return nextResolve(
          pathToFileURL(fileURLToPath(candidate)).href,
          context,
        );
      } catch {
        // Try the next source extension.
      }
    }

    throw error;
  }
}
