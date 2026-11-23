// Generates 1200×630 Open Graph images into public/og/ (run: node scripts/og.mjs). Re-run when titles change.
import { chromium } from "@playwright/test";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { parse } from "yaml";

// Embedded as data URLs: a page created with setContent() may not load file:// fonts.
const font = (pkg, file) => `data:font/woff2;base64,${readFileSync(`node_modules/@fontsource/${pkg}/files/${file}`).toString("base64")}`;
const frontmatter = (path) => parse(readFileSync(path, "utf8").split(/^---\r?\n/m)[1]);
const collect = (dir, label) =>
  readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => {
    const fm = frontmatter(`${dir}/${f}`);
    return { slug: f.replace(/\.md$/, ""), title: fm.title, label: label(fm) };
  });

const pages = [
  { slug: "home", title: "WhatsApp AI agents for businesses that can't afford to miss a message.", label: "Portfolio" },
  ...collect("src/content/work", (fm) => `Case study · ${fm.project}`),
  ...collect("src/content/notes", () => "Lab note"),
];

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const html = ({ title, label }) => `<!doctype html><html><head><style>
@font-face{font-family:Display;font-weight:700;src:url("${font("schibsted-grotesk", "schibsted-grotesk-latin-700-normal.woff2")}")}
@font-face{font-family:Mono;font-weight:400;src:url("${font("ibm-plex-mono", "ibm-plex-mono-latin-400-normal.woff2")}")}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0B0F0E;color:#E6EDEA;position:relative;overflow:hidden;font-family:Display}
.trace{position:absolute;left:88px;top:72px;bottom:72px;width:4px;background:#22302B}
.fill{position:absolute;left:88px;top:72px;height:60%;width:4px;background:#3DDC97;box-shadow:0 0 18px #3DDC97aa}
.pad{position:absolute;left:78px;width:24px;height:24px;border-radius:50%;border:4px solid #3DDC97;background:#0B0F0E}
.label{position:absolute;left:148px;top:88px;font-family:Mono;font-size:26px;color:#9AABA4}
h1{position:absolute;left:148px;right:96px;top:150px;font-size:64px;line-height:1.08;letter-spacing:-0.02em}
.foot{position:absolute;left:148px;bottom:72px;font-family:Mono;font-size:24px;color:#9AABA4}
.foot b{color:#F5A623;font-weight:400}
</style></head><body>
<div class="trace"></div><div class="fill"></div>
<div class="pad" style="top:84px"></div><div class="pad" style="top:300px"></div>
<div class="label">${esc(label)}</div>
<h1>${esc(title)}</h1>
<div class="foot">Melvine Jerry <b>·</b> AI agents, automations and web apps</div>
</body></html>`;

mkdirSync("public/og", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of pages) {
  await page.setContent(html(p), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/og/${p.slug}.png` });
  console.log(`public/og/${p.slug}.png`);
}
await browser.close();
