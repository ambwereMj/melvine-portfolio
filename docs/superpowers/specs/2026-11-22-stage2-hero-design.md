# Stage 2 — Hero and CTAs (design)

Status: approved by Melvine, 2026-11-22. Short design.

## Intent
In the first seconds, tell a Kenyan SME that Melvine builds WhatsApp AI agents, and give each audience
(Kenyan/African SMEs, international clients, recruiters) one obvious next step. WhatsApp is never hidden.

## Goals
- Headline (chosen by Melvine): "WhatsApp AI agents for businesses that can't afford to miss a message."
- Supporting sentence (my draft, editable): "I also build automations and web apps that save your team hours."
- Availability badge with timezone.
- Audience-ordered CTAs: Africa timezones → [Chat on WhatsApp] primary, [See my work] secondary;
  all other timezones → [Book a 15-min call] primary, [Email me] secondary.
- Reassurance line, verbatim: "Replies within 12 hours · Pay via M-Pesa, Wise or Payoneer · Weekly progress demos"
- Quiet recruiter line: Download CV, View GitHub.
- Proof strip: Diploma in Software Engineering; BSc Electronics & Computer Engineering (in progress);
  agents shipped; client quote slot.

## Non-goals
Analytics events (Stage 7), Cal.com embed (link only, placeholder until provided), animations (Stage 4).

## Anti-goals
Invented numbers or quotes; dead links; CTA order changing after first paint (CLS); hiding WhatsApp.

## Approaches
1. **Audience tag set in the existing pre-paint inline script; CSS shows the right CTA pair (chosen).** No layout shift, no JS framework, no-JS gets the Kenyan default.
2. Swap buttons with JS after load. Simple, but visible jump and CLS for international visitors.
3. Server/edge geolocation. Needs a server and is less accurate than the visitor's own timezone; overkill for a static site.

## Decisions
- `audienceFor(timeZone)` → `"local"` when the IANA zone starts with `Africa/`, otherwise `"international"`; unknown/empty → `"local"`. Sets `data-audience` on `<html>` before paint.
- Both CTA pairs are in the HTML; CSS hides the pair that doesn't match `data-audience`. Without JS (no attribute) the local pair shows.
- Facts not yet supplied are rendered honestly, never invented:
  - December capacity unknown → badge reads "Booking projects for December · EAT (UTC+3)"; with a number → "Available for N projects in December · EAT (UTC+3)".
  - Agents-shipped count unknown → that proof item is omitted.
  - No client quote → quote slot not rendered.
  - No CV file → "CV coming soon" as plain text (not a link).
- All of these live in one content file (`src/content/profile.ts`) so real values drop in without code changes.
- Badge uses the amber second accent as a small static "signal" dot (no animation).

## Verification
Unit: `audienceFor`, badge text. E2E: CTA order for `Africa/Nairobi` vs `Europe/London` vs no JS; no CLS (layout-shift entries sum ≤ 0.01 on load); hero h1 is the LCP element; reassurance copy exact; recruiter line; proof strip omits unknowns; axe clean; tap targets ≥ 44px; screenshots at 375/1440 in both themes.

## Left to the builder
Exact spacing, proof-strip layout (row on desktop, 2×2 on mobile).
