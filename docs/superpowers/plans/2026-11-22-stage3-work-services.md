# Stage 3 — Case studies and services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three case-study cards on the home page linking to three static case-study pages with circuit-style diagrams, plus three services with audience-specific prices.

**Architecture:** An Astro content collection `work` (plain Markdown, no MDX dependency) holds case studies; a dynamic route renders `/work/<slug>`. Services and diagrams are typed TS data. Audience-specific CTAs and prices reuse Stage 2's `data-for` pattern. A pre-build script blocks production builds while any `draft: true` remains.

**Tech Stack:** Astro 7 content collections (check current docs for `content.config.ts` + `glob` loader + `astro/zod` before writing), Tailwind v4, Vitest, Playwright + axe. Base: `0da8dda`.

**Spec:** `docs/superpowers/specs/2026-11-22-stage3-work-services-design.md`

## Global Constraints

- Never invent facts. Only the "Facts available today" and "Answers from Melvine" sections of the spec are sources. My drafted prose is `draft: true`.
- Slugs and order: 1 `luxe-condos` ("Luxe Condos: room site + WhatsApp agent", status `In development · agent live January 2027`), 2 `opportunity-finder` (status `Live`), 3 `applaude` (status `In development`). Role on all: `Solo builder`.
- Links: Opportunity Finder → `https://github.com/ambwereMj/orppotunities`; Applaude → `https://github.com/ambwereMj/applaude-check-pages` ("Public test pages (GitHub)"); Luxe Condos → none. Rendered HTML must never contain `github.com/ambwereMj/Applaude"`, `Applaude-internal` or `luxe-condos` repo URLs.
- Luxe Condos agent capabilities are labelled **Planned**: availability, prices, location and directions, check-in details, amenities, handoff of bookings to Melvine.
- Prices (local KES / international USD): Starter `KES 25,000` / `USD 250`; Automation Sprint `KES 20,000` / `USD 300`; Web/App Build `KES 35,000` (+ M-Pesa checkout from `KES 20,000`) / `USD 400`. Rendered "From KES 25,000". Running-costs line: "Running costs (WhatsApp message fees, AI usage, hosting) are billed at cost."
- Service CTA "Get a quote in 24h": local → WhatsApp with `I need: <service name>` in the prefilled message; international → `mailto:` with subject `Quote request: <service name>`.
- Case-study CTA band: local [Chat on WhatsApp][Email me]; international [Book a 15-min call][Chat on WhatsApp]. Heading: "Want one for your business?"
- No canonical URLs yet. Unique `<title>` = `<project> case study | Melvine Jerry`; description = `summary`.
- Single stage commit after Melvine approves screenshots. AA contrast, tap targets ≥ 44px, no new runtime JS.

## Review Focus

1. **Drafts shipping by accident** → `npm run build:prod` fails while any `draft: true` exists; `npm run build` doesn't. Test in Task 1.
2. **Private links or invented numbers leaking** → rendered HTML of all pages has no private repo URLs, no `undefined`/`null`/`TODO`/`NaN`. Test in Task 5.
3. **Direct visit to `/work/<slug>` on a phone** (from a shared link) → sidebar/bottom bar work, nav links go to `/#section`, WhatsApp reachable on first screen. Test in Task 4.
4. **Unknown slug `/work/nope`** → 404 page, not a crash. Test in Task 4.
5. **Screen readers and diagrams** → each diagram has `role="img"`, an accessible name, and a visible ordered-list text alternative. Test in Task 3.

---

### Task 1: Services data, price formatting and draft guard

**Files:**
- Create: `src/content/services.ts`, `src/lib/price.ts`, `scripts/check-drafts.mjs`, `tests/unit/price.test.ts`, `tests/unit/services.test.ts`, `tests/unit/check-drafts.test.ts`
- Modify: `package.json` (add `"build:prod": "node scripts/check-drafts.mjs && astro build"`)

**Interfaces:**
- Produces: `formatPrice(p: { amount: number; currency: "KES" | "USD" }): string` → `"KES 25,000"` / `"USD 250"` (`Intl.NumberFormat("en-KE")` grouping, currency code prefix, no decimals).
- Produces: `interface Service { id: "starter" | "sprint" | "build"; name: string; forWho: string; includes: string[]; timeline: string; price: { local: Price; international: Price }; addOn: { label: string; price: Price } | null; draft: boolean }` and `SERVICES: Service[]` (order starter, sprint, build; names "WhatsApp AI Agent Starter", "Automation Sprint", "Web/App Build"; build `addOn = { label: "M-Pesa checkout", price: KES 20,000 }`); `RUNNING_COSTS` string per Global Constraints.
- Produces: `findDrafts(files: { path: string; text: string }[]): string[]` in `scripts/check-drafts.mjs` (exported; CLI exits 1 and lists paths when non-empty). Detects `draft: true` in Markdown frontmatter and in `src/content/services.ts`.

- [ ] **Step 1: Failing tests:** `formatPrice({amount:25000,currency:"KES"})==="KES 25,000"`, `({amount:250,currency:"USD"})==="USD 250"`; SERVICES names/order/prices equal Global Constraints; `findDrafts` returns `["a.md"]` for frontmatter `draft: true`, `[]` for `draft: false`, ignores `draft: true` text outside frontmatter in `.md`.
- [ ] **Step 2:** `npm run test:unit` → FAIL. **Step 3:** Implement (my drafted `includes`/`timeline`/`forWho`, `draft: true`). **Step 4:** PASS; `npm run build:prod` → exits 1 naming `src/content/services.ts`.

### Task 2: Work collection and drafted case studies

**Files:**
- Create: `src/content.config.ts`, `src/content/work/luxe-condos.md`, `src/content/work/opportunity-finder.md`, `src/content/work/applaude.md`, `tests/unit/work-schema.test.ts`

**Interfaces:**
- Produces collection `work` with schema: `title: string`, `project: string`, `summary: string.max(160)`, `status: string`, `order: number`, `role: "Solo builder"`, `stack: string[]`, `links: {label, href}[]`, `result: string | null`, `diagram: "luxe-condos" | "opportunity-finder" | "applaude"`, `planned: string[]` (default `[]`), `draft: boolean`.
- Body: Markdown with `## Context and problem`, `## Approach`, `## What's next` headings; 150–600 words (short where facts are thin). Luxe Condos stack: Next.js, Supabase, Vercel. Opportunity Finder stack: GitHub Actions, Supabase, Vercel, Telegram. Applaude stack: none listed (private). `result`: Opportunity Finder `"All four phases live, running daily at $0/month on free tiers."`; others `null`.

- [ ] **Step 1: Failing test** (`work-schema.test.ts`, parses frontmatter of the three files with the exported zod schema from `src/lib/work-schema.ts`): all valid; orders 1,2,3; Luxe Condos `planned` equals the six Global Constraints items; Applaude `links[0].href` is the public check-pages URL; word count of each body ≤ 600.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (schema in `src/lib/work-schema.ts`, reused by `content.config.ts`). **Step 4:** PASS; `npm run build` exit 0.

### Task 3: Circuit diagram component

**Files:**
- Create: `src/lib/diagrams.ts`, `src/components/CircuitDiagram.astro`, `tests/unit/diagrams.test.ts`, `tests/e2e/diagram.spec.ts` (runs against a case page after Task 4; written now, expected RED until then)

**Interfaces:**
- Produces: `interface Diagram { title: string; nodes: { id: string; label: string; col: number; row: number }[]; edges: [string, string][]; steps: string[] }`, `DIAGRAMS: Record<"luxe-condos" | "opportunity-finder" | "applaude", Diagram>` with node chains per spec "Diagrams"; `tracePath(a: {col,row}, b: {col,row}, cell: {w,h}): string` (SVG path, orthogonal: horizontal then vertical).
- `CircuitDiagram.astro` props `{ id: keyof typeof DIAGRAMS }` → `<figure><svg role="img" aria-labelledby=…><title/>…</svg><figcaption><ol>steps</ol></figcaption></figure>`; pads at edge ends, labels in mono; colours from tokens only.

- [ ] **Step 1: Unit tests:** every edge references existing node ids; `steps.length >= nodes.length - 1`; `tracePath({col:0,row:0},{col:1,row:0},{w:200,h:80})` contains only `M`/`H`/`V` commands. E2E: on each case page the figure's `svg[role=img]` has an accessible name equal to the diagram title and `figcaption ol li` count equals `steps.length`.
- [ ] **Step 2:** unit FAIL. **Step 3:** Implement. **Step 4:** unit PASS (e2e goes GREEN in Task 4).

### Task 4: Work cards and case-study pages

**Files:**
- Create: `src/components/WorkCard.astro`, `src/components/WorkSection.astro`, `src/components/AudienceCtas.astro`, `src/pages/work/[slug].astro`, `src/pages/404.astro`, `tests/e2e/work.spec.ts`
- Modify: `src/pages/index.astro` (replace `#work` placeholder), `src/components/Sidebar.astro` + `MobileHeader.astro` (nav hrefs become `/#id` when not on `/`), `src/layouts/Base.astro` if needed

**Interfaces:**
- Consumes: collection `work`, `DIAGRAMS`, `CircuitDiagram`, `Cta`, site constants, Stage 2 `data-for` CSS.
- Produces: `AudienceCtas.astro` props `{ local: {label, href, external?}[]; international: {label, href, external?}[] }` (first item primary); reused by Task 5.

- [ ] **Step 1: E2E tests:**
  - Home `#work` has 3 `article` cards in order Luxe Condos, Opportunity Finder, Applaude, each with status text and a link to `/work/<slug>`; whole card clickable (click card body → navigates).
  - Each `/work/<slug>`: `<title>` = `<project> case study | Melvine Jerry`; meta description = summary; exactly one `h1` = title; "Result" block present only for Opportunity Finder; Luxe Condos shows a "Planned" list with the six items; CTA band heading "Want one for your business?" with Nairobi → [Chat on WhatsApp, Email me], London → [Book a 15-min call, Chat on WhatsApp].
  - Direct load of `/work/luxe-condos` at 375px: bottom bar visible, WhatsApp link on first screen; sidebar nav links (desktop) are `/#hero` … `/#contact`.
  - `/work/nope` → status 404 and an h1 "Page not found" with a link home.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (cards per spec "Cards as modules": pin-header pads, status chip, stretched link). **Step 4:** PASS incl. Task 3 e2e; full e2e green.

### Task 5: Services section and site-wide content checks

**Files:**
- Create: `src/components/ServicesSection.astro`, `tests/e2e/services.spec.ts`, `tests/e2e/content-safety.spec.ts`
- Modify: `src/pages/index.astro` (replace `#services` placeholder)

**Interfaces:**
- Consumes: `SERVICES`, `RUNNING_COSTS`, `formatPrice`, `AudienceCtas`, `WHATSAPP_URL` builder.
- Produces: `whatsappUrlFor(need: string): string` in `src/lib/site.ts` (same message template with `I need: <need>`); `WHATSAPP_URL` stays equal to `whatsappUrlFor("___")`.

- [ ] **Step 1: E2E tests:** Nairobi shows "From KES 25,000", "From KES 20,000", "From KES 35,000" and "M-Pesa checkout from KES 20,000"; London shows "From USD 250", "From USD 300", "From USD 400" and no KES; running-costs line visible; each "Get a quote in 24h" links to WhatsApp (Nairobi, message contains the service name) / mailto with subject `Quote request: <name>` (London). Content safety: for `/` and all three case pages, HTML has none of the forbidden private URLs and no `undefined`, `null`, `NaN`, `TODO`, `[object`. Axe clean on `/` and `/work/luxe-condos` in both themes; tap targets ≥ 44px on a case page.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** full unit + e2e PASS.

### Task 6: Verify, screenshot, review

- [ ] `npm run build && npm run test:unit && npm run test:e2e` → all PASS; `npm run build:prod` → fails listing drafts (expected until approval).
- [ ] Screenshots: home scrolled to `#work` and `#services` at 375/1440 (dark), `/work/opportunity-finder` at 375/1440 (dark + light), `#services` London 1440.
- [ ] Fresh reviewer on the Stage 3 diff; fix Critical/Important test-first.
- [ ] Show Melvine the screenshots **and the drafted copy** (case studies + service inclusions). After he approves copy, flip `draft: false`, confirm `build:prod` passes, commit `feat: stage 3 case studies and services`.
