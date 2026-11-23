# Stage 6 — About, How I work, Lab and Contact (design)

Status: approved by Melvine, 2026-11-23.

## Intent and why
Visitors convinced by the hero and the work need two more things before they act: trust (who is this, how does working
with him go, how do I pay) and an easy way to reach him. Recruiters additionally look for depth (writing, process).
Stage 6 replaces the last four placeholders: `#process`, `#about`, `#lab`, `#contact`.

## Goals
1. **How I work (`#process`)**: four numbered steps (a real sequence, so numbering is justified):
   1. A short call, 2. A scoped quote, 3. Build with weekly demos, 4. Handover and support.
   Plus three facts: timezone "EAT (UTC+3)", "Replies within 12 hours", "Pay via M-Pesa (local) or Wise/Payoneer (international)".
2. **About (`#about`)**: three short paragraphs in this order: software diploma → BSc Electronics & Computer Engineering
   (in progress) → building agents and automations now. A photo slot and a CV link, both shown only when supplied.
3. **Lab (`#lab`)**: two real notes (Melvine chose this), each with its own page at `/lab/<slug>`:
   - "How Opportunity Finder runs daily for $0" — sourced only from the Opportunity Finder README.
   - "Building this portfolio in stages with Claude Code" — sourced only from this repository (specs, plans, commits, tests).
   The section lists notes newest first: title, date, one-line summary, link.
4. **Contact (`#contact`)**: WhatsApp (primary for local visitors), "Book a 15-min call" (primary for international),
   email, and a short form: name, how to reach you (WhatsApp number or email), "What do you need?", optional budget.
   The footer keeps repeating the CTA (already does).

## Non-goals
Analytics events (Stage 7), CMS, comments, newsletter, RSS (could follow later), live agent demo (Stage 5, after January).

## Anti-goals
- Invented facts: no institutions, years, grades, client names or numbers that Melvine hasn't given.
- A form that silently fails or loses a lead; a form that requires JavaScript to reach Melvine at all.
- Publishing Wise/Payoneer fees or routes before they're checked (Stage 7). Naming the methods is fine.
- Empty or "coming soon" sections.

## Constraints
- Static site; no server. Form service: **Web3Forms** (Melvine chose this, 2026-11-23): free, 250 submissions/month,
  access key tied to Melvine's email (he creates it himself), honeypot spam trap.
- Copy I draft (About paragraphs, process step descriptions, both notes) is `draft: true` until Melvine approves it;
  the existing draft guard must cover the new content too.
- Same quality bar as earlier stages: AA contrast, tap targets ≥ 44px, axe clean, CLS ≈ 0, keyboard and screen-reader friendly.

## Approaches (decided)
- Form: **Web3Forms** (chosen) over Formspree (50/month free, needs an account) and Resend via a serverless function
  (a backend and a secret to maintain for a 4-field form).
- Lab: a second content collection `notes` (Markdown, draft flag, own pages), the same pattern as `work`.

## Content model (my calls)
- `src/content/profile.ts` gains: `about: string[]` (3 paragraphs, drafted), `photo: string | null` (null),
  `aboutDraft: boolean` (true). `cvUrl` already exists (null). Process steps and the three facts live in
  `src/content/process.ts` with `draft: true`.
- Collection `notes`: frontmatter `title`, `summary` (≤ 160), `date` (ISO date), `draft`. Body Markdown, 300–700 words.
- `src/lib/site.ts` gains `WEB3FORMS_KEY: string | null = null`.
- The draft guard (`scripts/check-drafts.mjs`) also scans `src/content/notes/*.md`, `aboutDraft` in profile.ts and
  `process.ts`.

## Contact form behaviour (my calls)
- Fields: `name` (required, autocomplete name), `contact` (required; label "WhatsApp number or email"),
  `message` (required, textarea, label "What do you need?"), budget (optional select). Budget options follow the
  visitor's audience (two selects, `budget_kes` / `budget_usd`, only the matching one visible; the other submits empty):
  - KES: Not sure yet; Under KES 20,000; KES 20,000–50,000; KES 50,000–100,000; Over KES 100,000 (floor derived from services; see below).
  - USD: Not sure yet; Under USD 250; USD 250–500; USD 500–1,000; Over USD 1,000.
  (Ranges start at the approved "from" prices.)
- **With a Web3Forms key**: the form posts to `https://api.web3forms.com/submit` with the key, subject
  "New portfolio enquiry", a honeypot field, and `redirect` to `/thanks` (so it works without JavaScript).
  With JavaScript it submits with `fetch` and shows an inline result in a live region: success "Thanks, I'll reply within
  12 hours." or failure "That didn't send. Please message me on WhatsApp instead." with the WhatsApp link prefilled with
  what they typed, so the lead is never lost.
- **Without a key (today)**: with JavaScript, submitting opens WhatsApp with the standard message template filled from the
  form ("I need: <message> · Budget: <budget or ___> · Deadline: ___", plus name and contact). Without JavaScript the form
  is not shown; the WhatsApp/email links are.
- Client-side validation uses native constraints with clear messages; errors are linked to fields (`aria-describedby`).
- Under the form: "I only use these details to reply to you."
- A `/thanks` page (same shell) for the no-JS path.

## Layout and look (my calls)
- Sections keep the page rhythm (`border-b`, same spacing). How I work: a horizontal row of four steps on desktop joined by
  a trace with pads (the PCB motif, static, no animation), stacked on phones. About: text column + photo column when a photo
  exists, otherwise text only (no placeholder image). Lab: a simple list, not cards. Contact: two columns on desktop
  (direct options left, form right), stacked on phones, form after the direct options.

## Facts allowed (sources)
Melvine's brief (diploma in Software Engineering; BSc Electronics & Computer Engineering in progress, University in Kenya;
builds AI agents, automations and web apps; EAT; 12-hour replies; M-Pesa/Wise/Payoneer; weekly demos; the four process
steps), the Opportunity Finder README, this repository's own history, and already-approved site content.

## Settled after builder check (my calls)
- **Opportunity Finder README**: read from the public repo `ambwereMj/orppotunities`, current `main`, via `gh api` (the same
  source the Stage 3 case study used). Its text is not copied into the repo; the note paraphrases it.
- **Budget ranges are derived, not hard-coded**: the lowest bracket is "Under <cheapest local/international 'from' price>"
  computed from `SERVICES` (today: Under KES 20,000 / Under USD 250), then fixed brackets KES 20,000–50,000, 50,000–100,000,
  Over 100,000 and USD 250–500, 500–1,000, Over 1,000 (the second bracket starts at that same cheapest price). This replaces
  the KES list above, which wrongly started at 25,000.
- **No-JS redirect and the placeholder domain**: the `redirect` URL is built from `Astro.site`. A build-time check fails the
  build if `WEB3FORMS_KEY` is set while `site` is still `https://example.com`, so the no-JS path can't send people to the wrong
  domain. Today the key is `null`, so nothing changes until Stage 7 sets the domain.
- **Note dates**: both notes carry the date Melvine approves them; the list sorts by date (newest first), then by title.

## Verification
Unit: draft guard covers notes/profile/process; budget options; WhatsApp-fallback message builder. E2E: the four
sections render with no placeholder text left; process shows 4 ordered steps + three facts; About hides photo/CV when null;
Lab lists 2 notes linking to pages with unique titles/descriptions; contact form: required-field errors are announced and
linked; without key + JS, submit opens a `wa.me` URL containing the typed need (intercept `window.open`); with a test key
and a mocked API (Playwright route), success and failure messages appear and failure offers the WhatsApp link; no-JS hides
the form and shows direct links; budget options follow audience; `/thanks` renders; axe clean both themes; tap targets.

## Left to the builder
Exact wording of field hints and validation messages (plain, specific), spacing, the step-trace drawing.
