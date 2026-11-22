import { it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

// Requires a fresh `npm run build` (the e2e run does one).
// Stage 4's budget is 8 KB gzipped; measuring ALL client JS on the site against it is simpler and stricter.
it("all client JS on the site is at most 8 KB gzipped", () => {
  const dir = "dist/_astro";
  expect(existsSync(dir)).toBe(true);
  const files = readdirSync(dir).filter((f) => f.endsWith(".js"));
  expect(files.length).toBeGreaterThan(0);
  const total = files.reduce((n, f) => n + gzipSync(readFileSync(`${dir}/${f}`)).length, 0);
  console.log(`Client JS: ${files.length} files = ${total} bytes gzipped`);
  expect(total).toBeLessThanOrEqual(8192);
});
