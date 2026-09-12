# Project agent guidance

- Keep repository artifacts in English and public UI copy in Spanish.
- Start from the linked GitHub issue and its acceptance criteria. Keep implementation, local verification, remote CI state, and owner confirmation as separate evidence.
- Preserve the existing Astro static-site architecture and Sanity content patterns. Rebuild Carmen-owned components; use Arabesque only as a visual reference and never copy or ship its legacy runtime.
- Do not invent schedules, prices, testimonials, metrics, rights, or business claims. Mark unknown business facts as `Needs owner confirmation`.
- Reuse existing components and tokens before adding abstractions. Keep optional CMS sections absent when their content is missing.
- Use test-driven development for behavior changes and run the narrow test first. Before a PR, run `pnpm validate` and report any checks that could not run.
- Route selectively to control cost: use Sol with high reasoning for planning, Luna for bounded exploration and mechanical execution, Terra for routine multi-file integration or QA, and at most two child agents at once. Use a stronger model only after a concrete failure or ambiguity.
- Preserve unrelated working-tree changes. Never merge, deploy, publish, or close an issue unless the user explicitly authorized that external action.
