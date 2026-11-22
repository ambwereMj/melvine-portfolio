// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://example.com", // TODO(stage 7): real domain
  compressHTML: true, // Astro 7 default 'jsx' can drop spaces between inline elements
  vite: { plugins: [tailwindcss()] },
});
