# Stage 7 — Polish and launch (design)

Status: approved by Melvine, 2026-11-23.

## Intent and why
Get the finished site in front of real visitors so it can start bringing in paid work, internships and collaborations, and be
able to see what visitors do (WhatsApp, booking, CV clicks). Launch cheaply now on a free Vercel address; move to a custom
domain once Melvine is established (his decision).

## Goals
1. **Live on Vercel** at a free `*.vercel.app` address (target `melvine-jerry.vercel.app`, else the closest free name),
   deployed from a GitHub repository so every push to `main` redeploys.
2. **SEO**: real `site` URL in `astro.config.mjs`; canonical link on every page; `sitemap.xml` and `robots.txt`; Open Graph
   and Twitter card tags with a 1200×630 image per page (home, 3 case studies, 2 Lab notes); JSON-LD `Person` on the home
   page (`sameAs`: GitHub only; Melvine has no LinkedIn yet) and `BlogPosting` on Lab notes.
3. **Analytics with Umami Cloud** (Melvine chose this): page views plus events for WhatsApp clicks, booking clicks, email
   clicks, quote clicks (with service name), CV downloads (once a CV exists) and contact-form sends (with method:
   web3forms / whatsapp-fallback). wa.me clicks don't appear in analytics by default, which is why these events exist.
4. **Measured quality** on the deployed preview, mobile profile: Lighthouse Performance ≥ 90, Accessibility 100,
   Best Practices ≥ 95, SEO 100; LCP ≤ 2.5s, CLS ≤ 0.1, INP target ≤ 200ms (lab proxy: TBT ≤ 200ms); axe clean on every page.
5. **Polish**: fix the deferred minor items from earlier stages that a visitor could actually hit (list below).
6. **Payment line verified**: keep "Pay via M-Pesa (local) or Wise/Payoneer (international)" only if true for Melvine
   (see Facts).

## Non-goals
Buying a domain (later), Stage 5 live demo (January), paid analytics, a CMS, A/B testing.

## Anti-goals
- Tracking that needs a cookie banner or collects personal data (no cookies, no form contents in events).
- Analytics or OG work that slows the page (Umami script deferred; no client JS for OG).
- Launching with a broken booking, form or CV link; publishing fees or routes for Wise/Payoneer.
- Any outward action (creating the GitHub repo, pushing, creating the Vercel project, deploying, connecting accounts)
  without Melvine's explicit go-ahead at that moment.

## Facts (checked 2026-11-23)
- Wise does not let Kenyan residents receive money into a Wise account; a client abroad can pay with Wise directly to a
  Kenyan bank account or M-Pesa wallet. So "pay via Wise" is true from the client's side.
- Payoneer supports Kenya with withdrawal to a Kenyan bank (not directly to M-Pesa). Melvine needs a Payoneer account for
  this to be true at launch.
- Domain prices for later: `.com` ≈ USD 12/yr; `.dev` ≈ USD 10 first year, USD 13 renewal (Vercel live prices); `.co.ke`
  via Kenyan registrars, promos ≈ KES 300–800 then ≈ KES 1,000–2,500 renewals. `melvinejerry.com` was available.

## Approaches (decided)
- Hosting: free Vercel address now, custom domain later (Melvine chose).
- Analytics: Umami Cloud free hobby tier (Melvine chose) over Vercel Web Analytics (custom events need Pro) and Plausible (paid).
- OG images (my call): generated once by a script that renders an HTML template with Playwright (already a dev dependency)
  into `public/og/<page>.png`, committed. Rejected: runtime image generation (needs a server function) and Satori/resvg
  (new dependencies for six images).
- Deploy (my call): Vercel project connected to the GitHub repo (git integration), Astro static output, build command
  `npm run build` (which already runs the draft guard on production builds).

## Decisions (my calls)
- `SITE_URL` comes from one constant in `src/lib/site.ts` used by `astro.config.mjs`; changing to a custom domain later is
  that one line plus a Vercel domain setting (old address redirects).
- `UMAMI_WEBSITE_ID: string | null` in `site.ts`; when null no analytics script is emitted. The script tag uses
  `defer`, `data-website-id`, `data-do-not-track="true"` and `data-domains` set to the production host (so local and
  preview builds don't pollute numbers).
- Events are sent from one small delegated click listener reading `data-event` / `data-event-*` attributes on links and
  buttons (so markup declares what's tracked), plus the contact form calling the same helper. Event names:
  `whatsapp-click`, `booking-click`, `email-click`, `quote-click` (data: service), `cv-download`, `contact-send`
  (data: method), each with `location` (hero, sidebar, bottom-bar, services, case-study, contact, footer, palette, terminal).
- Polish items included (from earlier reviews): card focus fallback without `:has()`; card link text includes the project
  name for screen readers; terminal JSON escapes `<`; fallback email field re-hidden on reopen; contact form survives a lone
  surrogate in pasted text; message `maxlength` 2000; Web3Forms `json.success` checked and `replyto` set when the contact is
  an email; reserve the form's space to avoid a shift when landing on `/#contact`; full-page screenshots restored in the
  screenshot script.

## Melvine's actions (each asked for at the moment it's needed)
1. Go-ahead to create the GitHub repository and push (and whether it's public or private).
2. Connect Vercel to that repository (or approve me doing it through the Vercel connector) and approve the first deploy.
3. Create a free Umami Cloud account and website, then give me the website ID.
4. Optional before launch: Web3Forms key, Cal.com link, CV, photo, Opportunity Finder repo rename, Payoneer account.

## Settled after builder check (my calls)
- **Order of launch**: create the Vercel project first (after Melvine's go-ahead), read back the actual `*.vercel.app`
  name, then set `SITE_URL` and build. No URL is guessed and committed in advance.
- **Where quality is measured**: Lighthouse and axe run locally against `astro preview` before the first deploy
  (gate: targets met), then again against the live production URL right after deploy (confirmation). No preview branch or
  deployment-protection bypass is needed.
- **Analytics can follow launch**: launching with `UMAMI_WEBSITE_ID = null` is allowed (no script, no errors); events are
  wired and tested with a stubbed `umami`, and go live as soon as Melvine supplies the ID.
- **GitHub owner**: `gh` is signed in as `ambwereMj`, matching `GITHUB_URL`; the repo will be created under that account.
- `/404` and `/thanks` are `noindex` and excluded from the sitemap; `contact-send` fires on successful send (web3forms)
  or when WhatsApp is opened (fallback).

## Answers from Melvine (2026-11-23)
- **Payoneer stays** in the payment line ("Pay via M-Pesa (local) or Wise/Payoneer (international)").
- **Show M-Pesa payment details** (not an STK-push button; that's a separate post-launch project needing Daraja and a
  server function). Model (my call): `MPESA_PAYMENT: { kind: "till" | "paybill" | "send-money"; number: string;
  account?: string; name?: string } | null` in `src/lib/site.ts`. When set, a short "Paying by M-Pesa" block appears in
  How I work and in Contact: "After we agree a quote, pay by M-Pesa: Till <n>" / "Paybill <n>, account <a>" /
  "Send Money to <n> (<name>)", with a copy button for the number. When null, nothing extra is shown. The number is
  never shown in the terminal or analytics events. Melvine supplies the details.

## Still open for Melvine
- The M-Pesa details to display (Till, Paybill + account, or phone number + registered name).
- Public or private GitHub repo (recommended: public; recruiters can read the code, specs and tests, nothing secret is in
  it). Asked again at the moment of creation either way.

## Verification
Unit: event-attribute helper, JSON-LD builders, OG manifest covers every page. E2E: canonical/OG/Twitter tags per page with
absolute URLs on the configured site; one JSON-LD `Person` on home (valid JSON, `sameAs` GitHub), `BlogPosting` on notes;
`sitemap-index.xml` lists all pages; `robots.txt` points to it; analytics script absent when ID null and present with the
right attributes when set; clicking each tracked CTA calls `umami.track` with the right name and location (stubbed);
the polish items each have a test. Lighthouse run on the deployed preview with the targets above (report saved to
`docs/launch/lighthouse-<date>.json` summary in the stage notes). axe on every page.

## Left to the builder
OG template styling (must use the site's palette and type), exact event `location` assignment where ambiguous.
