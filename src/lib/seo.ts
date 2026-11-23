import { SITE_URL, GITHUB_URL } from "./site";

/** Absolute URL on the configured site (canonicals, Open Graph and JSON-LD must never be relative). */
export function absoluteUrl(path: string, site: string = SITE_URL): string {
  return new URL(path, site.endsWith("/") ? site : `${site}/`).href;
}

export const ogImageFor = (slug: string) => `/og/${slug}.png`;

export function personJsonLd(site: string = SITE_URL): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Melvine Jerry",
    url: absoluteUrl("/", site),
    jobTitle: "Software engineer",
    description: "I build AI agents, automations and web apps that answer customers and save hours.",
    address: { "@type": "PostalAddress", addressCountry: "KE" },
    sameAs: [GITHUB_URL],
    knowsAbout: ["AI agents", "Automation", "Web development"],
  };
}

export function blogPostingJsonLd(note: { title: string; summary: string; date: Date; slug: string }, site: string = SITE_URL): object {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: note.title,
    description: note.summary,
    datePublished: note.date.toISOString().slice(0, 10),
    url: absoluteUrl(`/lab/${note.slug}/`, site),
    image: absoluteUrl(ogImageFor(note.slug), site),
    author: { "@type": "Person", name: "Melvine Jerry", url: absoluteUrl("/", site) },
  };
}
