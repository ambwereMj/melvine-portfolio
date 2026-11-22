# Stage 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static Astro shell with design tokens, dark/light themes, a reduce-motion toggle, a sticky desktop sidebar and a mobile bottom CTA bar, verified by Playwright.

**Architecture:** Astro outputs plain HTML. Tokens live in CSS custom properties exposed to Tailwind v4 via `@theme`. A tiny inline head script resolves theme and motion before first paint; one small module script highlights the nav. No UI framework yet.

**Tech Stack:** Astro (latest stable), Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript strict, Fontsource (Schibsted Grotesk, IBM Plex Sans, IBM Plex Mono), Vitest, @playwright/test, @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-11-22-stage1-foundation-design.md`

## Global Constraints

- Check current Astro / Tailwind v4 docs (context7, else official docs) before writing config.
- Commits: **one commit for the whole stage, after Melvine approves screenshots** (overrides per-task commits).
- Breakpoint: sidebar layout at `≥1024px`; single column + bottom bar below.
- Spacing: multiples of 8px only (4px allowed for hairline/inline gaps).
- Dark "Signal Green": bg `#0B0F0E`, surface `#121917`, text `#E6EDEA`, accent `#3DDC97`, accent-2 `#F5A623`.
- Light "Datasheet Light": bg `#F4F1EA`, surface `#FFFFFF`, text `#14201B`, accent `#0B7A4B`, accent-2 `#D9480F` (large/decorative only), accent-2-text `#B83D0C`.
- Contrast: body text and button labels ≥ 4.5:1; large text and UI boundaries ≥ 3:1.
- Tap targets ≥ 44×44px. Visible focus ring on every interactive element. Never hide the cursor.
- WhatsApp URL: `https://wa.me/254110753069?text=` + `encodeURIComponent("Hi Melvine, I saw your portfolio. I need: ___ · Budget: ___ · Deadline: ___")`.
- Email: `melvinambwere@gmail.com`. Timezone label: `EAT (UTC+3)`.
- Section IDs, in order: `hero, work, services, process, about, lab, contact`.

## Review Focus

1. **localStorage throws** (Safari private, blocked storage) → prefs fall back to system setting, no JS error. Test in Task 3.
2. **JS disabled** → theme follows `prefers-color-scheme` via CSS, nav anchors still work, nothing hidden. Test in Task 3.
3. **Deep link `/#work` on load** → section heading not covered by any sticky element (`scroll-margin`). Test in Task 4.
4. **Bottom bar over content** → last content and footer remain fully visible above the bar at 375px, including safe-area inset. Test in Task 4.
5. **200% text zoom / short desktop viewport (1440×700)** → sidebar scrolls internally; CTAs stay reachable. Test in Task 4.

---

### Task 1: Scaffold and tooling

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `vitest.config.ts`, `playwright.config.ts`, `src/pages/index.astro` (stub), `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces: scripts `npm run dev` (port 4321), `build`, `preview`, `test:unit` (vitest), `test:e2e` (playwright, `webServer` = `npm run build && npm run preview`). Playwright projects: `mobile` (375×812, isMobile, hasTouch) and `desktop` (1440×900).

- [ ] **Step 1:** Create the Astro project (minimal template, TS strict) in the repo root; add Tailwind v4 via `@tailwindcss/vite`, Vitest, @playwright/test, @axe-core/playwright, Fontsource packages.
- [ ] **Step 2: Write smoke test** `smoke.spec.ts`: `test('home renders', …)` → `page.goto('/')`, expect status 200 and `html[lang="en"]`.
- [ ] **Step 3:** Run `npm run test:e2e` → PASS on both projects. Run `npm run build` → exit 0.

### Task 2: Design tokens, themes and contrast

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/lib/contrast.ts`, `src/lib/palette.ts`, `tests/unit/contrast.test.ts`

**Interfaces:**
- Produces: `contrastRatio(fg: string, bg: string): number` (WCAG 2.x relative luminance, hex input). `PALETTE: Record<'dark'|'light', {bg, surface, text, muted, accent, accent2, accent2Text, onAccent, border}>`. CSS vars `--color-*` set under `[data-theme="dark"]` / `[data-theme="light"]` and mapped in `@theme` so Tailwind classes like `bg-bg text-text text-accent` work. Spacing via Tailwind's `--spacing: 8px`-based scale (`p-1` = 8px). Fluid type tokens `--text-xs … --text-display` using `clamp()`. Font families `--font-display`, `--font-sans`, `--font-mono`.
- `muted`, `onAccent`, `border` are builder's picks, but must pass the tests below.

- [ ] **Step 1: Write failing tests** in `contrast.test.ts`:
  - `contrastRatio('#000000','#FFFFFF')` ≈ 21 (±0.01); `contrastRatio('#FFFFFF','#FFFFFF')` = 1.
  - For each theme: `text` on `bg` and on `surface` ≥ 4.5; `muted` on `bg` ≥ 4.5; `accent` on `bg` ≥ 4.5; `onAccent` on `accent` ≥ 4.5; `accent2Text` on `bg` ≥ 4.5; `accent2` on `bg` ≥ 3; `border` on `bg` ≥ 3.
- [ ] **Step 2:** `npm run test:unit` → FAIL (module missing).
- [ ] **Step 3:** Implement `contrast.ts`, `palette.ts`, then `tokens.css` mirroring `PALETTE` exactly. `global.css` imports Tailwind, tokens, fonts; sets base styles, `:focus-visible` ring (2px accent + 2px offset), and `@media (prefers-color-scheme: light)` default on `:root:not([data-theme])` so no-JS works.
- [ ] **Step 4:** `npm run test:unit` → PASS.

### Task 3: Theme and motion preferences

**Files:**
- Create: `src/lib/prefs.ts`, `src/components/PrefsScript.astro`, `src/components/PrefToggles.astro`, `tests/unit/prefs.test.ts`, `tests/e2e/prefs.spec.ts`

**Interfaces:**
- Produces: `resolvePref<T extends string>(stored: string | null, allowed: readonly T[], system: T): T`. Storage keys `mj-theme` (`dark|light`), `mj-motion` (`full|reduce`). `<html>` attributes `data-theme`, `data-motion`. `PrefToggles` renders two `<button aria-pressed>` controls with accessible names "Light theme" and "Reduce motion".
- `PrefsScript.astro` is `<script is:inline>` in `<head>` before CSS; it mirrors `resolvePref` (kept to ~15 lines) and wraps storage access in `try/catch`.

- [ ] **Step 1: Unit tests:** stored valid value wins; stored invalid → system; `null` → system.
- [ ] **Step 2: E2E tests** (`prefs.spec.ts`):
  - `colorScheme: 'light'` context → `data-theme="light"`; default → `dark`.
  - `reducedMotion: 'reduce'` → `data-motion="reduce"`.
  - Clicking "Light theme" flips `data-theme`, sets `aria-pressed="true"`, persists after reload.
  - `addInitScript` that makes `localStorage.getItem` throw → page has a `data-theme`, no `pageerror`.
  - No flash: `addInitScript` + `MutationObserver` records that `data-theme` exists at `DOMContentLoaded` (it's never absent once body parses).
  - `javaScriptEnabled: false` + `colorScheme: 'light'` → computed `body` background is `rgb(244, 241, 234)`.
- [ ] **Step 3:** Run both suites → FAIL.
- [ ] **Step 4:** Implement. CSS: under `[data-motion="reduce"]` and `@media (prefers-reduced-motion: reduce)` set `scroll-behavior: auto` and transition/animation durations to `0.01ms`.
- [ ] **Step 5:** Run both suites → PASS.

### Task 4: Layout shell — sidebar, bottom bar, sections

**Files:**
- Create: `src/lib/site.ts`, `src/layouts/Base.astro`, `src/components/SkipLink.astro`, `src/components/Sidebar.astro`, `src/components/BottomBar.astro`, `src/components/Section.astro`, `tests/e2e/layout.spec.ts`, `tests/e2e/a11y.spec.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `PrefsScript`, `PrefToggles`, tokens.
- Produces: `SECTIONS: readonly {id: string; label: string}[]` (IDs per Global Constraints; labels: Home, Work, Services, How I work, About, Lab, Contact). `WHATSAPP_URL: string`, `EMAIL: string`, `TIMEZONE_LABEL: string`. `Base.astro` props `{title: string; description: string}`. `Section.astro` props `{id: string; label: string}` renders `<section id aria-labelledby>` with an `h2`, a mono "module" label, and `scroll-margin-top`.
- Sidebar (≥1024px): sticky, `max-height: 100dvh`, `overflow-y: auto`; contains name (`Melvine Jerry`), one-liner placeholder, `<nav aria-label="Sections">` of `SECTIONS`, WhatsApp primary CTA, "Book a call" secondary, `PrefToggles`. Below 1024px the name/toggles collapse into a top header.
- BottomBar (<1024px): `position: fixed` bottom, `padding-bottom: env(safe-area-inset-bottom)`, two links "WhatsApp" (`WHATSAPP_URL`, `target=_blank rel=noopener`) and "Book call" (`#contact`). `main` gets bottom padding ≥ bar height.

- [ ] **Step 1: E2E tests** (`layout.spec.ts`):
  - desktop: sidebar visible and its `top` stays `0` after scrolling to `#contact`; bottom bar hidden.
  - mobile: bottom bar visible; sidebar nav hidden; WhatsApp `href` equals `WHATSAPP_URL` exactly.
  - all `a, button` visible elements have bounding box ≥ 44×44 (both projects).
  - keyboard: first Tab focuses "Skip to content"; activating it moves focus to `main`; focus ring visible (`outline-style` not `none`).
  - goto `/#work`: `#work h2` top ≥ 0 and not overlapped by header (`elementFromPoint` at its centre is inside `#work`).
  - mobile: scroll to bottom; footer's bottom ≤ bottom bar's top.
  - desktop 1440×700 with `document.documentElement.style.fontSize='200%'`: last sidebar CTA reachable by scrolling the sidebar (`scrollIntoViewIfNeeded` then visible).
- [ ] **Step 2: a11y test** (`a11y.spec.ts`): axe on `/` in both themes → 0 violations.
- [ ] **Step 3:** Run → FAIL.
- [ ] **Step 4:** Implement components and wire `index.astro` with the 7 placeholder sections and a footer repeating the WhatsApp CTA and email.
- [ ] **Step 5:** Run → PASS.

### Task 5: Scroll-highlighted nav

**Files:**
- Create: `src/scripts/nav-highlight.ts`, `tests/e2e/nav.spec.ts`
- Modify: `src/components/Sidebar.astro` (import script)

**Interfaces:**
- Produces: `initNavHighlight(nav: HTMLElement): () => void` (returns cleanup). Uses one `IntersectionObserver` with `rootMargin: '-40% 0px -55% 0px'`; sets `aria-current="true"` on exactly one link; styling keys off `[aria-current="true"]`.

- [ ] **Step 1: E2E test:** desktop, scroll `#services` into view → exactly one nav link has `aria-current="true"` and it's "Services"; at page top it's "Home".
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.

### Task 6: Stage verification and hand-off

- [ ] **Step 1:** `npm run build && npm run test:unit && npm run test:e2e` → all PASS.
- [ ] **Step 2:** Screenshots into `screenshots/stage-1/` (gitignored): `{375,1440}-{dark,light}.png`, full page.
- [ ] **Step 3:** Show Melvine the four screenshots and test summary. Wait for approval.
- [ ] **Step 4 (after approval):** single commit `feat: stage 1 foundation — tokens, themes, layout shell` including spec and plan.
