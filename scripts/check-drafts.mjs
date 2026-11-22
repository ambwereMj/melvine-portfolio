// Blocks production builds while any content is still marked `draft: true`.
//   node scripts/check-drafts.mjs                 always check (used by `npm run build:prod`)
//   node scripts/check-drafts.mjs --if-production check only when the host says this is a production build
//                                                 (used by `npm run build`, so a host running plain `build` is covered)
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parse } from "yaml";

/** Markdown files whose YAML frontmatter has `draft` set to true (any YAML spelling). @param {{ path: string; text: string }[]} files */
export function findDrafts(files) {
  return files
    .filter(({ text }) => {
      const fm = text.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fm) return false;
      return parse(fm[1])?.draft === true;
    })
    .map((f) => f.path);
}

/** @param {{ draft: boolean }[]} services */
export const servicesHaveDrafts = (services) => services.some((s) => s.draft === true);

/** Vercel sets VERCEL_ENV=production; Netlify sets CONTEXT=production. */
export const isProductionBuild = (env) => env.VERCEL_ENV === "production" || env.CONTEXT === "production";

async function run() {
  if (process.argv.includes("--if-production") && !isProductionBuild(process.env)) return;
  const workDir = "src/content/work";
  const md = readdirSync(workDir)
    .filter((n) => n.endsWith(".md"))
    .map((n) => join(workDir, n).replaceAll("\\", "/"))
    .map((path) => ({ path, text: readFileSync(path, "utf8") }));
  const drafts = findDrafts(md);
  const { SERVICES } = await import(pathToFileURL("src/content/services.ts").href);
  if (servicesHaveDrafts(SERVICES)) drafts.unshift("src/content/services.ts");
  if (drafts.length) {
    console.error("Production build blocked: these files still have draft content awaiting Melvine's approval:");
    for (const d of drafts) console.error(`  - ${d}`);
    process.exit(1);
  }
  console.log("No drafts: OK to build for production.");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await run();
