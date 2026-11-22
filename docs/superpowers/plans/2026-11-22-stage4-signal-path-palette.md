# Stage 4 — Signal Path and command palette Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Light the sidebar trace as a scroll-progress indicator (plus a top-edge bar on phones), and add a Ctrl/Cmd+K command palette with a terminal easter egg, all in plain TypeScript.

**Architecture:** Pure, unit-tested functions in `src/lib/` (reading-line maths, command filtering, terminal command runner) driven by small DOM scripts in `src/scripts/`. The palette's items are server-rendered inside a native `<dialog>`; terminal data is embedded once as JSON. Nav highlighting is refactored onto the shared reading-line maths.

**Tech Stack:** Astro 7, Tailwind v4, plain TS, Vitest, Playwright + axe. Base: `e303937`.

**Spec:** `docs/superpowers/specs/2026-11-22-stage4-signal-path-palette-design.md`

## Global Constraints

- No UI/animation libraries. Native `<dialog>`. New client JS for Stage 4 ≤ 8 KB gzipped (measured from `dist/_astro/*.js` added in this stage).
- Animate only `transform`/`opacity`. Reading line = `Math.min(120, 0.4 * innerHeight)`.
- Reduced motion = `<html data-motion="reduce">` (set by the Stage 1 head script from OS + toggle). Under it: no solder pulse, no glow/fill transitions, no dialog open animation; fill and bar still track scroll.
- Only global shortcut: Ctrl+K / Meta+K. Shortcut label "⌘K" on Apple platforms, "Ctrl K" otherwise (server default "Ctrl K").
- Copy only from existing sources (`PROFILE`, `work` collection, `SERVICES`, `site.ts`); no new claims.
- Palette accessible names: sidebar button "Search and jump"; mobile header button "Open menu"; dialog heading "Menu"; input label "Search or type a command".
- Single stage commit after Melvine approves screenshots.

## Review Focus

1. **Resizing / fonts loading after first measure** → fill still lines up with pads (tops re-measured). Test in Task 2 (resize then check lit pad matches `aria-current`).
2. **Palette opened while already open, or Ctrl+K pressed inside the palette's input** → toggles closed, no duplicate dialogs, focus returns. Test in Task 3.
3. **Navigating to a section from the palette on the home page** → dialog closes, page scrolls to the section, URL hash updates, focus lands on the section heading's region. Test in Task 3.
4. **Theme/motion toggled from palette or terminal** → Stage 1 toggle buttons' `aria-pressed` and storage stay in sync. Test in Task 4.
5. **Very short page (404) or no sections** → no JS errors, bar shows reading progress or stays at 0. Test in Task 2.

---

### Task 1: Reading-line maths (shared)

**Files:**
- Create: `src/lib/reading.ts`, `tests/unit/reading.test.ts`
- Modify: `src/scripts/nav-highlight.ts` (use `activeIndex`)

**Interfaces:**
- Produces: `readingLine(viewportH: number): number`; `interface Layout { tops: number[]; scrollY: number; viewportH: number; docH: number }` (tops are document-relative, ascending);
  `activeIndex(l: Layout): number` (index of last section whose top ≤ scrollY + line; last index when at bottom, within 2px; 0 when none);
  `progressIndex(l: Layout): number` (p ∈ [0, n−1]: 0 above first top-at-line; integer i when section i's top is at the line; linear between; n−1 at bottom; returns 0 for n ≤ 1);
  `readingProgress(scrollY: number, viewportH: number, docH: number): number` (clamped 0..1; 0 when docH ≤ viewportH).

- [ ] **Step 1: Failing tests** (tops `[0, 1000, 2000, 3000]`, viewportH 800 → line 120, docH 3600):
  scrollY 0 → activeIndex 0, progressIndex 0; scrollY 880 (section 1 at line) → 1 and exactly 1; scrollY 1380 → active 1, progress 1.5; scrollY 2800 (bottom: 2800+800 ≥ 3600−2) → 3 and 3;
  `progressIndex` with one section → 0; `readingProgress(0,800,3600)=0`, `(2800,800,3600)=1`, `(1400,800,3600)=0.5`, `(0,800,500)=0`; `readingLine(800)=120`, `readingLine(200)=80`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement; refactor `nav-highlight.ts` to call `activeIndex` with measured tops. **Step 4:** unit PASS; existing `nav.spec.ts` still PASS.

### Task 2: Signal Path (desktop fill + phone bar)

**Files:**
- Create: `src/scripts/signal-path.ts`, `src/components/SignalBar.astro`, `tests/e2e/signal-path.spec.ts`
- Modify: `src/components/Sidebar.astro` (fill element `<span class="signal-fill" aria-hidden="true">` inside the nav `ul`; pad lit state via `data-lit` on links), `src/layouts/SiteShell.astro` (render `SignalBar`), `src/styles/global.css` if needed

**Interfaces:**
- Consumes: Task 1 functions.
- Produces: `initSignalPath(opts: { nav: HTMLElement | null; bar: HTMLElement | null }): () => void`. Desktop fill: `transform: scaleY(p/(n−1))`, `transform-origin: top`. Links get `data-lit="true"` for index ≤ `activeIndex`; a link that becomes lit for the first time gets class `soldered` for the pulse (CSS animation, disabled under `[data-motion=reduce]`). Phone bar `[data-testid=signal-bar]`: fixed, top 0, 2px, `transform: scaleX(readingProgress)`, `lg:hidden`, ticks `[data-tick]` at each section's share (lit via `data-lit` when progress ≥ tick); no ticks on pages without sections. Bar is created by `SignalBar.astro` with `hidden` and un-hidden by the script (so no-JS shows nothing).

- [ ] **Step 1: E2E tests:**
  - desktop: fill scale at top < 0.05; after scrolling to `#services` > previous; monotonic over 4 scroll steps; links with `data-lit=true` are exactly those at or above the `aria-current` link; after `setViewportSize(1280,700)` and scrolling to `#process`, lit set still ends at the `aria-current` link.
  - phone: bar visible; scaleX ≈ 0 (< 0.05) at top and > 0.95 after scrolling to bottom; tick count = 7 on home, 0 on `/work/applaude`.
  - reduced motion (`reducedMotion: 'reduce'`): after scrolling to `#work`, `document.getAnimations().length === 0` and fill scale > 0.
  - no JS: bar not visible; no `pageerror` with JS on `/404` and the 404 page's bar scale is a number in [0,1].
  - CLS ≤ 0.01 while scrolling top→bottom in 5 steps (layout-shift observer).
- [ ] **Step 2:** FAIL. **Step 3:** Implement (one passive scroll listener + rAF; re-measure on resize and `ResizeObserver(main)`). **Step 4:** PASS + full suite.

### Task 3: Command palette

**Files:**
- Create: `src/lib/commands.ts`, `src/components/CommandPalette.astro`, `src/scripts/palette.ts`, `tests/unit/commands.test.ts`, `tests/e2e/palette.spec.ts`
- Modify: `src/components/Sidebar.astro` (trigger button), `src/components/MobileHeader.astro` (trigger icon button), `src/layouts/SiteShell.astro` (render palette once)

**Interfaces:**
- Produces: `interface Command { id: string; group: "Go to" | "Case studies" | "Contact" | "Display" | "Extras"; label: string; keywords: string[]; href?: string; external?: boolean; action?: "copy-email" | "toggle-theme" | "toggle-motion" | "open-terminal" }`;
  `buildCommands(input: { pathname: string; work: { id: string; project: string }[] }): Command[]` (order per spec; section hrefs via `sectionHref`; WhatsApp uses `WHATSAPP_URL`, booking `BOOKING_URL`, email `mailto:`);
  `matches(cmd: Command, query: string): boolean` (every whitespace-separated, lower-cased query word is a substring of label or any keyword; empty query matches all).
- DOM: `<dialog id="palette" aria-labelledby="palette-title">` with `h2#palette-title` "Menu" (`tabindex=-1`), `input[role=combobox][aria-controls=palette-list][aria-expanded][aria-autocomplete=list]`, `ul#palette-list[role=listbox]` with `li[role=option][id][data-cmd]` items grouped under `li[role=presentation]` headings, empty-state `p` "No matches. Try “work” or “contact”.", and `p[aria-live=polite]#palette-status`.
- `palette.ts`: `openPalette(trigger?: HTMLElement)`, `closePalette()`; Ctrl/Meta+K toggles; `(pointer: coarse)` → focus heading, else input; ↑/↓ wrap, Home/End, Enter runs (`href` → navigate, then close; actions → run); Escape closes, clears, returns focus; `aria-activedescendant` and `aria-selected` kept in sync; theme/motion labels reflect state ("Switch to light theme"/"Switch to dark theme", "Turn reduce motion on/off"); copy-email → Clipboard API, status "Email address copied"; fallback selects a read-only field with the address.

- [ ] **Step 1: Unit tests:** `buildCommands({pathname:"/", work})` group order and first item `{label:"Home", href:"#hero"}`; on `/work/applaude` Home href `/#hero`; case studies labelled by project; `matches` for "wa" → WhatsApp true, "work" → Work + case studies, "light theme" → theme item, "zzz" → false, "" → true.
  **E2E:** Ctrl+K and Meta+K open (dialog `open`), again closes; sidebar button opens (desktop); "Open menu" opens on phone with focus on heading (not input); desktop focus in input; typing "serv" leaves only Services; ArrowDown + Enter on "Work" navigates to `#work`, dialog closes, `location.hash === "#work"`; Escape closes and focus returns to the trigger; `aria-activedescendant` equals the selected option id; "No matches" for "zzz"; "Copy email address" → status text "Email address copied" (grant clipboard permissions in context); palette absent from tab order when closed.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS + full suite.

### Task 4: Terminal

**Files:**
- Create: `src/lib/terminal.ts`, `src/components/TerminalData.astro` (embeds `<script type="application/json" id="terminal-data">`), `tests/unit/terminal.test.ts`, `tests/e2e/terminal.spec.ts`
- Modify: `src/components/CommandPalette.astro` (terminal view), `src/scripts/palette.ts` (switch views)

**Interfaces:**
- Produces: `interface TerminalData { name: string; oneLiner: string; proof: string[]; timezone: string; work: { project: string; status: string; href: string }[]; services: { name: string; local: string; international: string }[]; whatsapp: string; email: string; booking: string }`;
  `type Line = { text: string; href?: string }[]` (one output line = array of segments); `runCommand(input: string, data: TerminalData, audience: "local" | "international"): { lines: Line[]; effect?: "clear" | "exit" | "toggle-theme" | "toggle-motion" }`.
  Commands: `help`, `whoami`, `projects`, `hire`, `contact`, `theme`, `motion`, `clear`, `exit`, unknown → `command not found: <x>. Type help.`; input trimmed and lower-cased; empty input → no lines.
  `whoami` lines: "Melvine Jerry. I build AI agents, automations and web apps.", then each proof item, then "Based in Kenya, EAT (UTC+3).". `hire` shows `From <price>` for the audience and a final line "Get a quote in 24h:" + WhatsApp (local) / email (international) link.

- [ ] **Step 1: Unit tests** for each command (exact first lines above; `hire` local contains "From KES 25,000" and not "USD"; international contains "From USD 250"; `projects` has 3 lines with hrefs `/work/<slug>`; `clear` → effect clear; `nope` → not found text). **E2E:** palette → "Open terminal" → input with prompt `melvine@portfolio:~$`; `whoami` output visible; `projects` renders 3 links; ↑ recalls last command; `theme` flips `data-theme` and the Stage 1 "Light theme" button's `aria-pressed`; `exit` returns to list; output region has `aria-live=polite`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS + full suite.

### Task 5: Quality gates, screenshots, review

**Files:**
- Create: `tests/e2e/stage4-quality.spec.ts`, `tests/unit/bundle-size.test.ts` (reads `dist/_astro/*.js`; requires a fresh `npm run build`)

- [ ] **Step 1: Tests:** axe clean with the palette open and with the terminal open (dark + light); bundle test: gzip size of JS files whose source includes `initSignalPath`, `openPalette` or `runCommand` ≤ 8192 bytes total.
- [ ] **Step 2:** Run → PASS or fix. Full `npm run build && npm run test:unit && npm run test:e2e` green.
- [ ] **Step 3:** Screenshots: desktop sidebar mid-scroll (dark/light), phone with bar mid-scroll, palette open (desktop + phone), terminal after `whoami` + `hire`.
- [ ] **Step 4:** Fresh reviewer; fix Critical/Important test-first. Show Melvine; commit `feat: stage 4 signal path and command palette` after approval.
