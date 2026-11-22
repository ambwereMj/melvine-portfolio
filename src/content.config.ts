import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { workSchema } from "./lib/work-schema";

const work = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/work" }),
  schema: workSchema,
});

export const collections = { work };
