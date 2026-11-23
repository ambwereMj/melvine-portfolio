# Stage 6 — About, How I work, Lab and Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the last four placeholders with How I work, About, a Lab of two notes with their own pages, and a Contact section whose form never loses a lead.

**Architecture:** Content lives in `src/content/` (TS data + a `notes` Markdown collection) behind the existing draft guard. Sections are static Astro components; the only new JS is a small contact-form enhancer built on pure, unit-tested helpers in `src/lib/contact.ts`.

**Tech Stack:** Astro 7 content collections, Tailwind v4, plain TS, Vitest, Playwright + axe. Base: `3973fee`.

**Spec:** `docs/superpowers/specs/2026-11-23-stage6-about-process-lab-contact-design.md`

## Global Constraints

- No invented facts; allowed sources per the spec's "Facts allowed". Drafted copy is `draft: true` (notes), `aboutDraft: true` (profile), `PROCESS.draft: true`.
- Process steps, in order: "A short call", "A scoped quote", "Build with weekly demos", "Handover and support". Facts: "EAT (UTC+3)", "Replies within 12 hours", "Pay via M-Pesa (local) or Wise/Payoneer (international)".
- Note titles: "How Opportunity Finder runs daily for $0", "Building this portfolio in stages with Claude Code"; slugs `opportunity-finder-for-zero`, `building-this-portfolio`.
- Form copy: labels "Your name", "WhatsApp number or email", "What do you need?", "Budget (optional)"; button "Send"; privacy line "I only use these details to reply to you."; success "Thanks, I'll reply within 12 hours."; failure "That didn't send. Please message me on WhatsApp instead."; Web3Forms subject "New portfolio enquiry".
- `WEB3FORMS_KEY: string | null = null` in `src/lib/site.ts`. Build fails if key set while `site` is `https://example.com`.
- Single stage commit after Melvine approves screenshots and copy; drafts flipped only then.

## Review Focus

1. **Long or special-character input** (emoji, `&`, `#`, newlines in "What do you need?") → WhatsApp fallback URL is correctly encoded and opens with the full text. Test in Task 4 (unit).
2. **Double-submit / slow network** → button disabled while sending, one request only. Test in Task 4 (e2e with delayed mocked route).
3. **Screen-reader users** → validation errors and the result message are announced (live region, `aria-invalid`, `aria-describedby`). Test in Task 4.
4. **No-JS visitors** → no form shown, WhatsApp and email links present; `/thanks` reachable. Test in Task 4.
5. **New notes added later without a date or with a long summary** → schema rejects them at build time. Test in Task 2 (unit, schema).

---

### Task 1: How I work and About

**Files:**
- Create: `src/content/process.ts`, `src/components/ProcessSection.astro`, `src/components/AboutSection.astro`, `tests/unit/process.test.ts`, `tests/e2e/about-process.spec.ts`
- Modify: `src/content/profile.ts` (`about: string[]`, `photo: string | null`, `aboutDraft: boolean`), `scripts/check-drafts.mjs` (+ profile `aboutDraft`, `PROCESS.draft`), `tests/unit/check-drafts.test.ts`, `tests/unit/profile.test.ts`, `src/pages/index.astro`

**Interfaces:**
- Produces: `PROCESS: { steps: { title: string; detail: string }[]; facts: string[]; draft: boolean }`.
- Draft guard: `profileHasDraft(p: { aboutDraft: boolean }): boolean`, `processHasDraft(p: { draft: boolean }): boolean` exported from `check-drafts.mjs`; CLI imports `src/content/profile.ts` and `src/content/process.ts`.

- [ ] **Step 1: Tests.** Unit: PROCESS titles/facts equal Global Constraints; `profile.about.length === 3`, `photo === null`; guard flags `aboutDraft: true` and `PROCESS.draft: true`. E2E: `#process` has an `ol` with 4 `li` in order and the 3 facts; `#about` has 3 paragraphs, no `img`, and "CV coming soon" (no CV link) while `cvUrl` is null; neither section contains "arrives in Stage".
- [ ] **Step 2:** FAIL. **Step 3:** Implement (process row joined by a static trace with pads on ≥1024px, stacked on phones). **Step 4:** PASS + full suite.

### Task 2: Lab notes

**Files:**
- Create: `src/lib/note-schema.ts`, `src/content/notes/opportunity-finder-for-zero.md`, `src/content/notes/building-this-portfolio.md`, `src/components/LabSection.astro`, `src/pages/lab/[slug].astro`, `tests/unit/notes.test.ts`, `tests/e2e/lab.spec.ts`
- Modify: `src/content.config.ts` (collection `notes`), `scripts/check-drafts.mjs` (scan `src/content/notes`), `src/lib/commands.ts` (no change needed unless Lab notes are added to palette — they are not, YAGNI), `src/pages/index.astro`

**Interfaces:**
- Produces: `noteSchema` (`title: string`, `summary: string.max(160)`, `date: z.coerce.date()`, `draft: boolean`); `sortNotes<T extends { data: { date: Date; title: string } }>(notes: T[]): T[]` (date desc, then title asc) in `src/lib/note-schema.ts`.
- Facts for the Opportunity Finder note: fetch the README with `gh api repos/ambwereMj/orppotunities/readme`; paraphrase only.

- [ ] **Step 1: Tests.** Unit: both notes parse; summary > 160 or missing date is rejected; `sortNotes` order; body 300–700 words. E2E: `#lab` lists 2 items (title, date, summary) linking to `/lab/<slug>`; each page has `<title>` `<note title> | Melvine Jerry`, meta description = summary, one `h1`, a "Back to the Lab" link; guard lists both notes while drafts.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (reuse `.prose` styles from case pages by moving them to `global.css` under `.prose`). **Step 4:** PASS + full suite.

### Task 3: Contact helpers (pure)

**Files:**
- Create: `src/lib/contact.ts`, `tests/unit/contact.test.ts`
- Modify: `src/lib/site.ts` (`WEB3FORMS_KEY`), `astro.config.mjs` (integration or `astro:config:done` hook calling `assertFormConfig`)

**Interfaces:**
- Produces: `budgetOptions(audience: "local" | "international", services: Service[]): string[]` → `["Not sure yet", "Under <cheapest>", "<cheapest>–<next>", "<next>–<third>", "Over <third>"]` with KES brackets 20,000/50,000/100,000 and USD 250/500/1,000 (first two numbers derived from the cheapest service price; formatted with `formatPrice`, e.g. "KES 20,000–50,000").
  `whatsappFallbackUrl(f: { name: string; contact: string; message: string; budget: string }): string` → `whatsappUrlFor(...)`-style URL whose decoded text is `Hi Melvine, I saw your portfolio. I need: <message> · Budget: <budget or ___> · Deadline: ___\nName: <name>\nContact: <contact>`.
  `assertFormConfig(key: string | null, site: string | undefined): void` throws `Error("WEB3FORMS_KEY is set but site is still https://example.com …")` when key is set and site is the placeholder.

- [ ] **Step 1: Unit tests:** local options exactly `["Not sure yet","Under KES 20,000","KES 20,000–50,000","KES 50,000–100,000","Over KES 100,000"]`; international `["Not sure yet","Under USD 250","USD 250–500","USD 500–1,000","Over USD 1,000"]`; fallback URL decodes to the template with emoji/`&`/`#`/newline preserved and "___" when budget empty; `assertFormConfig("k","https://example.com")` throws, `(null, …)` and `("k","https://melvine.dev")` don't.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS.

### Task 4: Contact section, form enhancer and /thanks

**Files:**
- Create: `src/components/ContactSection.astro`, `src/scripts/contact-form.ts`, `src/pages/thanks.astro`, `tests/e2e/contact.spec.ts`
- Modify: `src/pages/index.astro` (remove the last placeholder; `Section.astro` becomes unused → delete it)

**Interfaces:**
- Consumes: Task 3 helpers, `AudienceCtas`, site constants.
- DOM: `form#contact-form` (`hidden` in HTML, shown by JS → no-JS sees only direct links); when `WEB3FORMS_KEY` is set: `action="https://api.web3forms.com/submit" method="post"` with hidden `access_key`, `subject`, `redirect` (`new URL("/thanks", Astro.site)`), honeypot `botcheck` (visually hidden checkbox). Budget: `select[name=budget_kes][data-for=local]`, `select[name=budget_usd][data-for=international]`. Result region `p#contact-status[role=status]`. Field errors `p#<field>-error` linked via `aria-describedby`, `aria-invalid` set on invalid fields.
- `initContactForm(form: HTMLFormElement, opts: { key: string | null }): void`: on submit, validate (native constraints; first invalid field focused); no key → `window.open(whatsappFallbackUrl(...), "_blank", "noopener")` and status "Opening WhatsApp with your message…"; with key → disable button, `fetch` POST JSON, success/failure messages per Global Constraints (failure includes a link to the fallback URL), re-enable.

- [ ] **Step 1: E2E:** direct options visible (WhatsApp, Book a 15-min call, email) with audience order; empty submit → 3 errors announced, first field focused, `aria-invalid=true`; without key (default build) filling fields + Send calls `window.open` with a `wa.me` URL containing the need (stub `window.open` via `addInitScript`); with key: build-time override not available, so test the enhancer on a fixture page? → instead expose `data-key` on the form and, in the test, set `form.dataset.key = "test"` before submit and `page.route("https://api.web3forms.com/submit", …)` to return 200 (success message) / 500 (failure message + fallback link) / delayed 200 (button disabled, exactly one request); budget select matches audience; no-JS → form hidden, links visible; `/thanks` returns 200 with h1 "Thanks for getting in touch"; axe clean (both themes) on `#contact`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement (enhancer reads key from `data-key`; server renders `data-key` only when `WEB3FORMS_KEY` is set). **Step 4:** PASS + full suite; bundle test still ≤ 8 KB.

### Task 5: Verify, screenshots, review

- [ ] `npm run build && npm run test:unit && npm run test:e2e` green; `npm run build:prod` lists the new drafts.
- [ ] Screenshots at 375/1440 (dark) of `#process`, `#about`, `#lab`, `#contact`; one Lab note page (light).
- [ ] Fresh reviewer; fix Critical/Important test-first. Show Melvine the screenshots and all drafted copy; after approval flip drafts, confirm `build:prod`, commit `feat: stage 6 about, process, lab and contact`.
