# Stage 1 — Foundation (design)

Status: approved by Melvine, 2026-11-22. Short design (small change within a larger project).

## Intent
Lay the base for a fast, single-page portfolio ("Signal Path" concept) that wins paid freelance work,
internships and collaborations. Primary audiences: Kenyan SMEs on phones (WhatsApp-first),
international clients, recruiters (GitHub proof). Stage 1 delivers no real content, only the system
everything else sits on.

## Goals
- Design tokens: 8-point spacing grid, colour palette, fluid type scale.
- Two themes: "Signal Green" (dark) and "Datasheet Light", following the OS setting unless the visitor overrides it; no flash of the wrong theme.
- Reduce-motion toggle (in addition to honouring `prefers-reduced-motion`), persisted.
- Layout shell: sticky identity sidebar on desktop (name, one-liner, scroll-highlighted nav, CTAs);
  single column plus sticky bottom CTA bar ([WhatsApp] [Book call]) on mobile.
- Placeholder sections with stable IDs: hero, work, services, process, about, lab, contact.

## Non-goals (later stages)
Hero copy, case studies, PCB-trace animation, command palette, demo widget, analytics, deploy.

## Anti-goals
Template look; client-only rendering; hidden WhatsApp; motion that ignores user preference;
tap targets < 44px; removing focus rings or the system cursor.

## Constraints
- LCP ≤ 2.5s (text headline), CLS ≤ 0.1, INP ≤ 200ms; mobile-first, mid-range Android, slow 3G-ish.
- WCAG AA contrast for text and buttons in both themes.
- Real HTML at build time.

## Approaches considered
1. **Astro static + Tailwind v4, no UI framework in Stage 1 (chosen).** Zero JS except a tiny inline
   theme/motion script and a small nav-highlight script. Fastest; islands framework decided at Stage 4.
2. Astro + React from day one. Familiar, enables `cmdk` early, but ships a runtime before it's needed.
3. Next.js. Heavier, SPA tendencies; nothing in Stage 1 needs it.

## Decisions
- Stack: Astro (latest stable), Tailwind CSS v4 via `@tailwindcss/vite`, TypeScript strict.
- Fonts (self-hosted via Fontsource, latin subset): Schibsted Grotesk (display/headline), IBM Plex Sans
  (body), IBM Plex Mono (labels, data, "module" chrome). Only the headline weight is preloaded.
- Theme: `data-theme` on `<html>`, set by an inline head script from `localStorage` → `prefers-color-scheme` → dark.
- Motion: `data-motion="reduce|full"` on `<html>`, same resolution order; CSS gates all transitions on it.
- **Contrast fix:** Datasheet Light second accent `#D9480F` measures ~3.8:1 on `#F4F1EA`; it's used only
  for large text/decoration. A darker `#B83D0C` token (`--accent-2-text`) is used where it must be body-size text.
- Nav highlighting: `IntersectionObserver`, sets `aria-current="true"` on the active link.
- Mobile bottom bar: WhatsApp link (pre-filled message) and "Book call" (placeholder `#contact` until Cal.com link exists). Respects `env(safe-area-inset-bottom)`.
- Repo: `C:\dev\melvine-portfolio`, branch `main`. One commit after Stage 1 approval.

## Verification
Playwright: screenshots at 375×812 and 1440×900 in both themes; computed-colour contrast check of
token pairs; all interactive elements ≥ 44×44px; keyboard Tab order reaches skip link, nav, toggles, CTAs
with visible focus; no theme flash (theme attribute present before first paint); `astro build` passes.

## Left to the builder
Exact type-scale ratios, sidebar width, focus-ring style, iconography.
