# Stage 7 — Polish and launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the visitor-facing leftovers, add M-Pesa payment details, SEO and Umami events, pass Lighthouse/axe locally, then (with Melvine's go-ahead at each step) push to GitHub and launch on a free `*.vercel.app` address.

**Architecture:** One `SITE_URL` constant drives `astro.config` `site`, canonicals, OG URLs, sitemap and Umami `data-domains`. SEO tags live in `Base.astro` (props for OG image and JSON-LD). Events are declared in markup (`data-event`, `data-event-location`, `data-event-service`) and sent by one delegated listener. OG images are generated once by a Playwright script and committed.

**Tech Stack:** Astro 7, `@astrojs/sitemap` (check current docs before use), Tailwind v4, Vitest, Playwright + axe, Lighthouse CLI (run with Playwright's Chromium via `CHROME_PATH`), Vercel connector, `gh`. Base: `3104a29`.

**Spec:** `docs/superpowers/specs/2026-11-23-stage7-polish-launch-design.md`

## Global Constraints

- No outward action (repo creation, push, Vercel project, deploy) without Melvine's explicit go-ahead at that moment.
- `SITE_URL` stays `https://example.com` until Task 6 reads the real Vercel name; nothing guesses it.
- No cookies, no personal data or form contents in analytics events; the M-Pesa number never appears in events or the terminal.
- Event names: `whatsapp-click`, `booking-click`, `email-click`, `quote-click` (data `service`), `cv-download`, `contact-send` (data `method`: `web3forms` | `whatsapp-fallback`); every event has `location` ∈ hero, sidebar, bottom-bar, services, case-study, contact, footer, palette, terminal.
- `/404` and `/thanks`: `<meta name="robots" content="noindex">`, excluded from sitemap.
- Quality targets (mobile Lighthouse): Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms.
- Whole-site client JS stays ≤ 8 KB gzipped (existing test), excluding the external Umami script.
- One stage commit after Melvine approves; deploy happens from that commit.

## Review Focus

1. **Canonical/OG URLs with the placeholder site** → absolute URLs built from `SITE_URL`, never relative; switching `SITE_URL` changes all of them. Test in Task 3 (unit: `absoluteUrl` + e2e reading the tags).
2. **Double counting** → one click fires exactly one event, even for links inside elements that also carry `data-event` (closest match only). Test in Task 4.
3. **Umami missing or blocked** (ad blocker, ID null) → clicks still navigate, no errors. Test in Task 4.
4. **OG images out of date** (a new case study or note without an image) → unit test fails when any page lacks `public/og/<slug>.png`. Test in Task 3.
5. **M-Pesa block with partial data** (paybill without account) → rejected at build by the formatter (throws). Test in Task 2.

---

### Task 1: Visitor-facing polish

**Files:** Modify `src/components/WorkCard.astro`, `src/components/Terminal.astro`, `src/scripts/palette.ts`, `src/scripts/contact-form.ts`, `src/lib/contact.ts`, `src/components/ContactSection.astro`, `scripts/screenshots.mjs`; tests in `tests/unit/contact.test.ts`, `tests/e2e/polish.spec.ts`.

**Interfaces:** `whatsappFallbackUrl` never throws (lone surrogates replaced with U+FFFD via `String.prototype.toWellFormed` fallback); Web3Forms success requires `res.ok && json.success === true`; payload adds `replyto` when `contact` matches a simple email pattern.

- [ ] **Step 1: Tests.** Unit: fallback URL with `"a\uD800b"` doesn't throw and decodes to `"a�b"`. E2E: (a) card link's accessible name includes the project (`getByRole("link", { name: /Luxe Condos/ })` inside `#work article`); (b) keyboard-focused card link has a visible outline even with `:has` disabled (inject `CSS.supports` stub not possible → assert link `outline-style` ≠ none on `:focus-visible`); (c) terminal data script contains no raw `<` (`textContent` has no `<`); (d) after a failed copy fallback, reopening the palette hides the email field again; (e) message textarea has `maxlength="2000"`; (f) mocked Web3Forms 200 with `{"success":false}` shows the failure message; request body has `replyto` for an email contact and none for a phone number; (g) landing on `/#contact` produces CLS ≤ 0.01.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (card: `aria-label` "<project>: <title>" on link + `.stretched:focus-visible` outline fallback; reserve form height with `min-height` while hidden pre-JS; restore `-full.png` captures in the screenshot script). **Step 4:** PASS + full suite.

### Task 2: M-Pesa payment details

**Files:** Create `src/lib/mpesa.ts`, `src/components/MpesaPayment.astro`, `tests/unit/mpesa.test.ts`, `tests/e2e/mpesa.spec.ts`; modify `src/lib/site.ts` (`MPESA_PAYMENT = null`), `ProcessSection.astro`, `ContactSection.astro`.

**Interfaces:** `type MpesaPayment = { kind: "till" | "paybill" | "send-money"; number: string; account?: string; name?: string }`; `mpesaLines(p: MpesaPayment): { label: string; value: string }[]` → till: `[{label:"Till number", value}]`; paybill: `[{label:"Paybill", value}, {label:"Account", value: account}]` (throws if no account); send-money: `[{label:"Send Money to", value}, {label:"Name", value: name}]` (throws if no name). Component renders "After we agree a quote, pay by M-Pesa:" + lines + a "Copy number" button (`data-copy`), and nothing when `MPESA_PAYMENT` is null.

- [ ] **Step 1: Tests.** Unit for the three kinds and both throws. E2E: with `MPESA_PAYMENT` null, neither `#process` nor `#contact` contains "pay by M-Pesa" or a `[data-mpesa]` element.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. (When Melvine supplies details, set the constant and add an e2e assertion for the visible block.)

### Task 3: SEO and Open Graph

**Files:** Create `src/lib/seo.ts`, `scripts/og.mjs`, `public/og/*.png` (home, luxe-condos, opportunity-finder, applaude, opportunity-finder-for-zero, building-this-portfolio), `public/robots.txt` generated via `src/pages/robots.txt.ts`, `tests/unit/seo.test.ts`, `tests/e2e/seo.spec.ts`; modify `src/lib/site.ts` (`SITE_URL`), `astro.config.mjs` (`site: SITE_URL`, sitemap integration with filter), `src/layouts/Base.astro` (props `ogImage`, `jsonLd`, `noindex`, `type`), `SiteShell.astro` (pass-through), pages.

**Interfaces:** `absoluteUrl(path: string, site = SITE_URL): string`; `personJsonLd(): object` (`@type` Person, name "Melvine Jerry", url SITE_URL, jobTitle "Software engineer", description = sidebar one-liner, `address.addressCountry` "KE", `sameAs` [GITHUB_URL], `knowsAbout` ["AI agents","Automation","Web development"]); `blogPostingJsonLd(note: { title; summary; date; slug }): object`; `ogImageFor(slug: string): string` → `/og/<slug>.png`.

- [ ] **Step 1: Tests.** Unit: `absoluteUrl("/work/applaude/", "https://x.vercel.app")`; JSON-LD shapes; every `work` and `notes` slug plus `home` has a file in `public/og/`. E2E per page (`/`, 3 case pages, 2 notes): `link[rel=canonical]` absolute and equal to `SITE_URL + pathname`; `og:title`, `og:description`, `og:image` (absolute, 1200×630 declared), `og:url`, `twitter:card=summary_large_image`; home has exactly one `application/ld+json` parsing to `@type: Person` with `sameAs` = [GitHub]; notes have `BlogPosting`; `/404` and `/thanks` have `noindex`; `/sitemap-index.xml` (200) and the sitemap lists 6 URLs, none of 404/thanks; `/robots.txt` contains `Sitemap: <SITE_URL>/sitemap-index.xml`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement; generate images with `node scripts/og.mjs` (renders a 1200×630 template in the site palette with the page title, project/note label and "Melvine Jerry"). **Step 4:** PASS + full suite.

### Task 4: Umami analytics events

**Files:** Create `src/lib/analytics.ts`, `src/scripts/analytics.ts`, `tests/unit/analytics.test.ts`, `tests/e2e/analytics.spec.ts`; modify `src/lib/site.ts` (`UMAMI_WEBSITE_ID = null`, `UMAMI_SCRIPT_URL = "https://cloud.umami.is/script.js"`), `Base.astro` (script tag when ID set), every CTA source (`Cta.astro` gains `event`/`location`/`service` props → data attributes; Hero, Sidebar, BottomBar, ServicesSection, case-study CTA band, ContactSection, footer, AboutSection CV link), `contact-form.ts`, `palette.ts`/`terminal.ts` (call `track` on WhatsApp/booking/email commands with location palette/terminal).

**Interfaces:** `eventFromElement(el: Element): { name: string; data: Record<string, string> } | null` (reads the closest `[data-event]`); `track(name: string, data: Record<string, string>): void` (calls `window.umami?.track` inside try/catch; no-op otherwise).

- [ ] **Step 1: Tests.** Unit: `eventFromElement` reads name/location/service; nested elements resolve to the closest; unknown → null. E2E (stub `window.umami = { track }` via `addInitScript`, recording calls; prevent navigation for external links by routing wa.me/mailto): click hero WhatsApp → one `whatsapp-click` `{location:"hero"}`; sidebar booking → `booking-click` sidebar; services quote (Nairobi) → `quote-click` `{service:"Automation Sprint", location:"services"}`; bottom bar WhatsApp (phone) → `bottom-bar`; contact form WhatsApp fallback → `contact-send` `{method:"whatsapp-fallback", location:"contact"}`; no Umami script tag when ID null; with `window.umami` absent, clicking still navigates and no `pageerror`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS + full suite; bundle test still ≤ 8 KB.

### Task 5: Local quality gate and stage commit

- [ ] `npm run build && npm run test:unit && npm run test:e2e` green; `npm run build:prod` passes (no drafts).
- [ ] Lighthouse (mobile, simulated throttling) on `astro preview` for `/`, `/work/opportunity-finder`, `/lab/building-this-portfolio`: record scores and LCP/CLS/TBT in `docs/launch/lighthouse-local-2026-11-23.md`; fix and re-run until targets in Global Constraints are met.
- [ ] axe on all 8 pages (both themes) via existing specs + a loop over the sitemap.
- [ ] Fresh reviewer; fix Critical/Important test-first. Screenshots (incl. OG images). Melvine approves → commit `feat: stage 7 polish, seo, analytics and launch prep`.

### Task 6: Launch (each step only after Melvine's go-ahead)

- [ ] **6a GitHub:** ask: create `ambwereMj/melvine-portfolio` (public, as recommended, unless he says private) and push `main`. Run `gh repo create ambwereMj/melvine-portfolio --public --source . --push` only after "yes".
- [ ] **6b Vercel project:** ask, then create the project linked to the repo via the Vercel connector (framework Astro, build `npm run build`, output `dist`). Read back the assigned `*.vercel.app` hostname.
- [ ] **6c Site URL:** set `SITE_URL` to that hostname; regenerate OG images if they embed the URL; run unit + e2e; commit `chore: set production site url`; ask, then push (Vercel deploys).
- [ ] **6d Verify live:** HTTP 200 on all sitemap URLs; canonical/OG point at the live host; Lighthouse on the live URL (record in `docs/launch/lighthouse-live-<date>.md`); axe on `/` live. Report results to Melvine with the live link.
- [ ] **6e Follow-ups recorded:** Umami ID, Web3Forms key (now allowed since the domain is real), Cal.com link, CV/photo, M-Pesa details, repo rename, Stage 5 in January.
