// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { assertFormConfig } from "./src/lib/contact.ts";
import { WEB3FORMS_KEY } from "./src/lib/site.ts";

export default defineConfig({
  site: "https://example.com", // TODO(stage 7): real domain
  compressHTML: true, // Astro 7 default 'jsx' can drop spaces between inline elements
  vite: { plugins: [tailwindcss()] },
  integrations: [
    {
      // Refuse to build a live contact form whose no-JS redirect would point at the placeholder domain.
      name: "form-config-guard",
      hooks: { "astro:config:done": ({ config }) => assertFormConfig(WEB3FORMS_KEY, config.site) },
    },
  ],
});
