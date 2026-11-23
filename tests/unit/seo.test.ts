import { it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { absoluteUrl, personJsonLd, blogPostingJsonLd, ogImageFor } from "../../src/lib/seo";
import { GITHUB_URL } from "../../src/lib/site";

it("absolute URLs come from the site URL", () => {
  expect(absoluteUrl("/work/applaude/", "https://x.vercel.app")).toBe("https://x.vercel.app/work/applaude/");
  expect(absoluteUrl("/", "https://x.vercel.app/")).toBe("https://x.vercel.app/");
});

it("Person JSON-LD", () => {
  const p = personJsonLd("https://x.vercel.app") as Record<string, unknown>;
  expect(p).toMatchObject({ "@context": "https://schema.org", "@type": "Person", name: "Melvine Jerry", url: "https://x.vercel.app/", sameAs: [GITHUB_URL] });
  expect((p.address as Record<string, string>).addressCountry).toBe("KE");
});

it("BlogPosting JSON-LD", () => {
  const b = blogPostingJsonLd({ title: "T", summary: "S", date: new Date("2026-11-23"), slug: "x" }, "https://x.vercel.app") as Record<string, unknown>;
  expect(b).toMatchObject({ "@type": "BlogPosting", headline: "T", description: "S", datePublished: "2026-11-23", url: "https://x.vercel.app/lab/x/" });
  expect((b.author as Record<string, string>).name).toBe("Melvine Jerry");
});

it("every page has an Open Graph image file", () => {
  const slugs = [
    "home",
    ...readdirSync("src/content/work").map((f) => f.replace(/\.md$/, "")),
    ...readdirSync("src/content/notes").map((f) => f.replace(/\.md$/, "")),
  ];
  for (const s of slugs) {
    expect(ogImageFor(s)).toBe(`/og/${s}.png`);
    expect(existsSync(`public/og/${s}.png`), `missing public/og/${s}.png`).toBe(true);
  }
});
