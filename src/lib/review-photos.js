// Per-photo permission for the private review build. The approved list lives
// in src/assets/fotos/review-approved.json (file names, e.g. "aula-barra.jpg").
// Photo.astro hides every other photo when PUBLIC_REVIEW_HIDE_PHOTOS=true, and
// scripts/verify-review-build.mjs rejects any unapproved photo in dist-review/.

/**
 * Stem of a photo path: "aula-barra" for "aula-barra.jpg", the built
 * "/_astro/aula-barra.BE6TVaKY_Z1abcd.avif" or a dev "/@fs/…/aula-barra.jpg?…".
 * @param {string} path
 * @returns {string}
 */
export function photoStem(path) {
  const file = path.split("?")[0].split("/").pop() ?? "";
  return file.split(".")[0];
}

/**
 * @param {string} path
 * @param {readonly string[]} approved file names from review-approved.json
 * @returns {boolean}
 */
export function isApprovedForReview(path, approved) {
  const stem = photoStem(path);
  return approved.some((name) => photoStem(name) === stem);
}
