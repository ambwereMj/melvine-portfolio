# Stage 3 — Case studies and services (design)

Status: approved by Melvine, 2026-11-22 (prices and Luxe Condos framing approved).

## Intent and why
Visitors give a portfolio 30 seconds to 3 minutes. Engineering hiring managers look for proof; Kenyan SMEs want to
know "can he build this for me, and what does it cost". Stage 3 supplies that proof with three case studies and
makes buying easy with three productised services. Success: a visitor can read a case-study card in seconds, open a
full story in under 3 minutes, see roughly what a service costs, and has a one-tap next step on every page.

## Goals
1. **Selected work section (`#work`)**: three case-study cards, in this order:
   1. WhatsApp AI agent for Melvine's short-stay rentals in Juja (marketing + guest-inquiry handling, handoff to Melvine)
   2. Opportunity Finder (daily verified opportunities → Telegram; free tiers)
   3. Applaude (AI-powered software testing platform; in development)
2. **Case-study pages** at `/work/<slug>` (`whatsapp-rental-agent`, `opportunity-finder`, `applaude`), 300–600 words each,
   structured: outcome headline → result (near the top) → context and problem → approach with architecture diagram →
   stack and links → CTA "Want one for your business? Chat on WhatsApp".
3. **Services section (`#services`)**: three offers with "from" prices: WhatsApp AI Agent Starter; Automation Sprint;
   Web/App Build (optional M-Pesa Daraja checkout). Each: who it's for, what's included, typical timeline, price, CTA.
4. Each case-study page has its own `<title>`, meta description and canonical URL; it is real HTML at build time.

## Non-goals (later stages)
Open Graph images and JSON-LD (Stage 7), live agent demo widget (Stage 5; the rental case study reserves a slot for
"See the agent in action"), analytics events (Stage 7), Signal Path scroll animation (Stage 4).

## Anti-goals
- Invented numbers, results, clients, quotes, stacks or timelines. Unknown facts are omitted or worded honestly.
- Exposing private code or internals of Applaude or the rental agent, or any guest's personal data.
- Screenshots without a story; more than three case studies; the generic SaaS card kit.
- A service price or inclusion Melvine hasn't confirmed shown as fact.

## Public-disclosure rules (Melvine delegated; my call)
| Project | Code link | Visuals | Detail level |
|---|---|---|---|
| Opportunity Finder | Public repo (after rename from `orppotunities`) | Telegram digest screenshot when supplied | Full: from its README |
| WhatsApp rental agent | None | Guest-chat screenshots only with names/numbers blurred, when supplied | High level; no vendor named unless Melvine confirms it |
| Applaude | None (private); link `ambwereMj/applaude-check-pages` (public test pages) | Product screenshots only when supplied | Public description only; status "In development" |

## Facts available today (the only sources allowed)
Allowed sources (added after final review): the full Opportunity Finder README (`ambwereMj/orppotunities`) and the `luxe-condos` README (rooms, photos, prices, availability admin, changes live within a few seconds, stats on visitors, room views, WhatsApp taps and traffic sources, `?src=` links for social posts and WhatsApp Status). The summaries below are excerpts.
- **Opportunity Finder** (public README): runs daily in the cloud; finds scholarships, internships, remote paid work,
  paid programmes and hackathons; resolves each to its official page and reads facts quoted from that page (unknown
  is never guessed); eligibility and scam rules; 0–100 score; Telegram digest at 07:00 EAT with Apply/Save/Skip buttons;
  instant alerts, deadline reminders, source-health alerts, kill switch; application assistant (checklist, tailored CV,
  letter outline, referee email drafts), encrypted document vault, form helper that never submits; $0/month on
  GitHub Actions, Supabase, Vercel Hobby and Telegram; no AI model unless a budget is approved; phases 1–4 live.
- **Applaude** (public repo description): "AI-powered software testing platform that evaluates frontend UI, backend APIs,
  and database reliability to identify issues and assess application readiness for scale." In development.
- **Rental agent** (Melvine's brief): WhatsApp AI agent for his short-stay rentals in Juja; does marketing and guest-inquiry
  handling with handoff to him. Nothing else is known yet.

## Content model (my call)
- Astro content collection `work`, one MDX file per case study. Frontmatter:
  `title` (outcome headline), `summary` (≤ 160 chars, used for card and meta description), `project` (name),
  `status` (`"Live" | "In development"`), `order` (1–3), `role`, `stack: string[]` (only confirmed items),
  `links: {label, href}[]`, `result: string | null` (omitted when null), `diagram` (key into a diagram registry),
  `demoSlot: boolean` (rental only, Stage 5).
- Services live in `src/content/services.ts`: `name`, `forWho`, `includes: string[]`, `timeline: string | null`,
  `priceFrom: { amount: number; currency: "KES" | "USD" } | null`, `cta`. `priceFrom: null` renders "Price on request"
  and the CTA "Get a quote in 24h" (WhatsApp); a number renders "From KES 25,000" style (formatted with `Intl.NumberFormat`).
- Copy I draft (case-study prose, service inclusions/timelines) is marked `draft: true` until Melvine approves it.
  A build check fails a **production** build (`CONTEXT=production` or `npm run build:prod`) if any `draft: true` remains,
  so drafts can't ship by accident. Local builds and tests are unaffected.

## Design (my call)
- **Cards as "modules"**: a bordered panel whose top edge carries a row of small square pads (a pin header), echoing the
  sidebar's solder pads. Content: status chip (Live in accent, In development in amber), outcome headline (h3, links to
  the page; whole card clickable via stretched link), one-line summary, up to 4 stack items, "Read the case study".
  Not identical rounded SaaS cards: square-ish corners (radius-sm), no shadows, no gradients.
- **Case-study page**: same shell (sidebar/bottom bar) with nav linking back to `/#…` sections; a "Back to work" link;
  h1 outcome headline; meta row (role, status, stack, links); "Result" block directly under the headline (omitted when
  `result` is null — then the context section leads); prose; diagram figure; CTA band.
- **Diagrams**: a small Astro SVG component fed by a declarative spec (`nodes: {id, label, col, row}`,
  `edges: [from, to]`), drawn as orthogonal copper traces between pads, labels in Plex Mono. Each figure has
  `role="img"`, `<title>`, and a visible `<figcaption>` ordered list of the steps (the text alternative). Diagrams:
  - Opportunity Finder: Sources → Official page → Eligibility + scam rules → Score 0–100 → Supabase → Telegram digest → You decide.
  - Rental agent: Guest on WhatsApp → Agent answers common questions → Handoff to Melvine for bookings/edge cases. (No vendors.)
  - Applaude: Your app → UI checks / API checks / Database reliability checks → Readiness report.
- **Services**: three columns on desktop, stacked on mobile; the Starter is listed first for Kenyan visitors and the
  call-first audience sees the same order (services don't reorder). Each has one primary CTA; the price line is the
  most prominent text after the name.
- Mobile-first; tap targets ≥ 44px; AA contrast; reduced motion respected (no new motion in this stage).

## Constraints
LCP ≤ 2.5s with a text LCP on every page; CLS ≤ 0.1; static HTML; no new runtime JS except what Astro needs
(none expected). Images (when supplied) via `astro:assets`, lazy-loaded, with width/height.

## Verification
Unit: price formatting, services `null` handling, draft guard. E2E: 3 cards in order linking to 3 pages; each page
has unique title/meta description, an h1, a figure with figcaption list, a WhatsApp CTA; no `null`/`undefined`/`TODO`
text in rendered HTML; Applaude page has no link to the private repo; services show "Price on request" while prices
are null; axe clean; tap targets; screenshots at 375/1440 for home `#work`/`#services` and one case-study page.

## Settled after builder check (my calls unless marked)
- **Canonical URLs**: omitted until the real domain is chosen (Stage 7); pages still get unique `<title>` and meta description now. (My call.)
- **Draft guard**: there is no deploy until Stage 7, so failing production builds while drafts remain blocks nothing today. Kept as designed; `npm run build` (local/tests) never fails on drafts. (My call.)
- **Short pages**: the 300–600 word range is a ceiling and a target, not a floor to pad. A page with few confirmed facts stays short rather than invent. (My call.)
- **Opportunity Finder link**: uses the current URL `https://github.com/ambwereMj/orppotunities` until the rename; GitHub redirects the old URL afterwards, and the link is updated then. (My call.)
- **Applaude public link**: `https://github.com/ambwereMj/applaude-check-pages`, label "Public test pages (GitHub)". Tests forbid `github.com/ambwereMj/Applaude` and `Applaude-internal`. (Answered by GitHub.)
- **CTAs follow the Stage 2 audience pattern** (`data-for` pairs, decided before paint): case-study CTA band — local: [Chat on WhatsApp] primary, [Email me] secondary; international: [Book a 15-min call] primary, [Chat on WhatsApp] secondary (WhatsApp never hidden). Service CTA "Get a quote in 24h" — local: WhatsApp with the service name pre-filled; international: email with subject "Quote request: <service>". Services don't reorder. (My call.)
- **Rental agent status, role on each card, prices and currency**: Melvine's to answer (see open questions).

## Answers from Melvine (2026-11-22) and resulting calls
- **Role**: "Solo builder" on all three. (Melvine.)
- **Rental agent goes live January 2027.** (Melvine.) No agent code was found in his GitHub repos or earlier sessions; what exists is
  the private `luxe-condos` site (Next.js + Supabase + Vercel room catalogue with WhatsApp tap-through, hidden admin for rooms,
  photos, prices and availability, and stats on views and WhatsApp taps per room). Approved: case study 1 becomes
  "Luxe Condos: room site + WhatsApp agent", status "In development · agent live January 2027"; the built site is described as
  built; the agent's question types are listed as *planned* (a list Melvine confirms), never as handled volumes.
- **Prices**: Melvine asked for researched beginner rates; approved as below, shown in KES to local visitors and USD to international
  visitors via the existing `data-for` audience pattern (USD figures are rounded deliberately, not live conversions).
  | Service | Local | International | Basis |
  |---|---|---|---|
  | WhatsApp AI Agent Starter (FAQ + handoff, no payments) | from KES 25,000 | from USD 250 | Kenyan basic FAQ bots KES 15k–30k; agencies KES 30k–80k |
  | Automation Sprint (one workflow, about a week) | from KES 20,000 | from USD 300 | Kenyan freelance KES 1,500–8,000/hr; junior remote roughly USD 25–50/hr |
  | Web/App Build (optional M-Pesa Daraja checkout) | from KES 35,000 (+ M-Pesa checkout from KES 20,000) | from USD 400 | 5–7 page sites KES 20k–50k, booking sites KES 35k–70k, M-Pesa e-commerce KES 60k–150k |
  Running costs (Meta message fees, AI model usage, hosting) are billed at cost and stated as such.
- **Service inclusions/timelines**: drafted by me, `draft: true` until Melvine approves them.

## Left to the builder
Exact spacing, chip styling, diagram grid sizes, MDX component names.
