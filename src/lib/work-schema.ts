import { z } from "astro/zod";

/** Frontmatter for case studies in src/content/work/*.md. Shared by content.config.ts and unit tests. */
export const workSchema = z.object({
  title: z.string(),
  project: z.string(),
  summary: z.string().max(160),
  status: z.string(),
  order: z.number().int(),
  role: z.literal("Solo builder"),
  stack: z.array(z.string()),
  links: z.array(z.object({ label: z.string(), href: z.string().url() })),
  result: z.string().nullable(),
  diagram: z.enum(["luxe-condos", "opportunity-finder", "applaude"]),
  planned: z.array(z.string()).default([]),
  draft: z.boolean(),
});

export type WorkData = z.infer<typeof workSchema>;
