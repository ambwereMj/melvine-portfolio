import { z } from "astro/zod";

/** Frontmatter for Lab notes in src/content/notes/*.md. Shared by content.config.ts and unit tests. */
export const noteSchema = z.object({
  title: z.string(),
  summary: z.string().max(160),
  date: z.coerce.date(),
  draft: z.boolean(),
});

/** Newest first; ties broken by title so the order is stable. */
export function sortNotes<T extends { data: { date: Date; title: string } }>(notes: T[]): T[] {
  return [...notes].sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.data.title.localeCompare(b.data.title));
}
