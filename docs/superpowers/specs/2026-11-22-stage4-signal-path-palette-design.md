# Stage 4 — Signal Path and command palette (design)

Status: approved by Melvine, 2026-11-22.

## Intent and why
The site needs one memorable, on-brand moment that also does a job, plus fast navigation for keyboard users and phone users.
The **Signal Path** turns the sidebar's existing pads-and-trace nav into a scroll-progress indicator: the trace glows as you read and
each pad "solders" (lights) when its section is reached. The **command palette** (Ctrl/Cmd+K) gives instant jumps and actions, and,
opened from a header button, becomes the section menu phones don't have today. A terminal easter egg rewards the curious
(engineering recruiters especially) without being needed by anyone.

## Goals
1. **Signal Path, desktop (≥ 1024px)**: a glowing fill runs down the sidebar trace from the first pad to the pad of the section being read,
   moving continuously with scroll. Pads up to and including the current one are lit; the current one is strongest (already `aria-current`).
   When a pad is first reached it plays a short "solder" pulse (≤ 400ms).
2. **Signal Path, phones (< 1024px)**: a 2px glowing trace fixed to the top edge of the viewport, filling left to right with reading
   progress, with a small tick at each section's position that lights once passed.
3. **Command palette**: opens with Ctrl+K (Windows/Linux/Android keyboards) or Cmd+K (Mac), and from a visible button in the sidebar
   ("Search and jump", showing the shortcut) and in the mobile header (icon button, accessible name "Open menu").
4. **Terminal easter egg** inside the palette, reached via an "Open terminal" command (or typing `terminal`).
5. Works on the home page and case-study pages.

## Non-goals
Analytics events (Stage 7). Search across case-study body text. Sound. Any 3D.

## Anti-goals
- Anything required to navigate lives only in the palette (normal links always work; no-JS visitors lose nothing but the extras).
- Motion that ignores the OS setting or the site's reduce-motion toggle.
- Layout shift or janky scrolling (the fill must only use `transform`, never change layout).
- Hijacking typing: Ctrl/Cmd+K is the only global shortcut; no single-letter shortcuts.
- Hiding the system cursor or focus rings.

## Constraints
- Plain JavaScript/TypeScript bundled by Astro, no UI or animation libraries (Melvine chose this, 2026-11-22). Native `<dialog>`.
- Budget: Stage 4's new client JS ≤ 8 KB gzipped in total (palette + terminal + Signal Path).
- INP ≤ 200ms: opening the palette and filtering must respond within one frame on a mid-range phone (no work proportional to page size on keystrokes).
- CLS 0: the fill and the mobile bar use `transform: scaleY/scaleX`; the mobile bar is `position: fixed` and reserves no space.
- Accessibility: palette follows the WAI-ARIA combobox + listbox pattern; terminal output is announced (`aria-live="polite"`).

## Approaches (decided)
1. **Plain JS with native `<dialog>` (chosen by Melvine).** ~5–8 KB; built-in Escape/focus/inert handling.
2. GSAP + Svelte. ~40–50 KB more for polish nobody would notice on one line.
3. React + cmdk + Motion. ~60 KB+ of framework on an otherwise static site; worst for the speed targets.

Trace placement: **A, light the sidebar trace** (chosen by Melvine) over B, a separate trace down the content's left edge.

## Signal Path — behaviour (my calls)
- **Reading line** = `min(120px, 40% of viewport height)`, the same line the Stage 1 nav highlight uses. Both features share one
  computation so the lit pad and `aria-current` can never disagree.
- **Progress model** (pure function, unit-tested): given section tops, scroll position, viewport height and document height, return
  `p ∈ [0, n−1]` where integer `i` means "section i's top is at the reading line". Between sections, `p` interpolates linearly by scroll
  position. At the very bottom of the page `p = n − 1`. Above the first section `p = 0`. The desktop fill height maps `p` to the pad
  positions (pads are evenly spaced, so `fill = p / (n − 1)` of the trace length). The mobile bar uses plain reading progress
  `scrollY / (docHeight − viewportHeight)` and places ticks at each section's share of that range.
- **Case-study pages**: no home sections exist, so the desktop fill is hidden and the mobile bar shows article reading progress
  (no ticks).
- **Updates**: one passive scroll listener, coalesced to one `requestAnimationFrame`; section tops re-measured on resize and via
  `ResizeObserver` on `main` (fonts or images changing height).
- **Reduced motion** (OS setting or toggle): the fill and bar still track scroll (they are information, not decoration), but the solder
  pulse and glow transitions are off. **No JS**: no fill, no bar; the static trace remains.
- **Look**: fill in `--c-accent` with a soft glow (`drop-shadow` / `box-shadow` in accent at ~40% alpha); unlit trace stays `--c-line`.
  The light theme uses the same tokens (contrast of the fill against the sidebar ≥ 3:1, already true for accent on bg).

## Command palette — behaviour (my calls)
- **Shortcut label** shows "⌘K" on Apple platforms and "Ctrl K" elsewhere (detected at runtime; server-rendered default "Ctrl K").
  Ctrl/Cmd+K toggles the palette; `preventDefault` only when the palette handles it.
- **Structure**: `<dialog>` containing an input (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`) and a
  grouped `role="listbox"`. Items are server-rendered HTML (real links where the action is navigation), so the list is correct without
  any client data fetch.
- **Commands** (grouped, in this order):
  - *Go to*: Home, Work, Services, How I work, About, Lab, Contact (`#id` on home, `/#id` elsewhere).
  - *Case studies*: the three case studies by project name.
  - *Contact*: Chat on WhatsApp; Book a 15-min call (`BOOKING_URL`); Email me; Copy email address (clipboard, then "Copied" announced;
    if the clipboard API is unavailable, select the address in a read-only field instead).
  - *Display*: Switch to light/dark theme; Turn reduce motion on/off (labels reflect current state; reuse Stage 1 prefs storage).
  - *Extras*: Open terminal.
- **Filtering**: case-insensitive; an item matches when every query word appears in its label or keywords (e.g. "wa" → WhatsApp,
  "cv" → nothing until a CV exists). Empty result shows "No matches. Try “work” or “contact”."
- **Keys**: ↑/↓ move (wrap), Home/End, Enter runs, Escape closes (and clears), Tab stays inside the dialog. Focus returns to the element
  that opened it. Mouse hover moves the active item; click runs.
- **Open/close motion**: a 150ms fade/scale; none under reduced motion.

## Terminal — behaviour (my calls)
- Replaces the palette's list area; prompt `melvine@portfolio:~$`; history with ↑/↓; output region `aria-live="polite"`.
- **Commands** (output text comes only from existing site content, never new claims):
  - `help` — lists commands.
  - `whoami` — "Melvine Jerry. I build AI agents, automations and web apps." + the two proof items + "Based in Kenya, EAT (UTC+3)."
  - `projects` — the three case studies: project, status, link.
  - `hire` — the three services with "from" prices for the visitor's audience (KES local / USD international) + how to get a quote.
  - `contact` — WhatsApp, email, booking links.
  - `theme`, `motion` — toggle, same as the palette commands.
  - `clear`, `exit` (back to the palette list), unknown → `command not found: <x>. Type help.`
- Links in output are real `<a>` elements.

## Settled after builder check (my calls)
- **Phones don't get the keyboard popped up.** On touch-first devices (`(pointer: coarse)`), opening the palette focuses the dialog
  itself (its heading "Menu", `tabindex="-1"`), not the search input, so the full list of sections is visible. Tapping the search box
  starts filtering as normal. With a keyboard/mouse (`(pointer: fine)`), focus goes straight to the input (standard combobox).
  Tests cover both.
- **Terminal and palette copy add no new facts.** Every text they show is assembled from already-approved sources (`PROFILE`, the
  `work` collection, `SERVICES`, site constants), so Melvine's approval of this document covers the wording; nothing new needs a
  draft flag.

## Verification
Unit: progress model (top, between, exact section, bottom, single section, unsorted/zero-height guard), filter matcher, terminal command
parser/outputs (pure functions with data passed in). E2E (both viewports where relevant): fill grows monotonically while scrolling down;
pad lit state matches `aria-current`; mobile bar visible and scaled ~0 at top and ~1 at bottom; reduced motion → no running animations
(`document.getAnimations()` empty after a pad is reached) while fill still tracks; no-JS → no bar, no errors; Ctrl+K and Meta+K open; the
header button opens on phones; full keyboard flow (type, arrows, Enter navigates; Escape closes and focus returns); listbox ARIA
attributes; terminal `help`/`whoami`/`projects`/`hire`/unknown; audience-correct prices in `hire`; axe clean with the palette open
(both themes); CLS ≤ 0.01 while scrolling; built JS for Stage 4 ≤ 8 KB gzipped (measured from `dist`).

## Left to the builder
Exact glow values, pulse easing, icon for the mobile menu button, keyword lists per command, group heading styling.
