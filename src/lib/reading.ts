/**
 * Reading-line maths shared by the nav highlight and the Signal Path, so the lit pad and the
 * highlighted link can never disagree.
 *
 * A section is "reached" when its top crosses the reading line. Sections that can't scroll far enough
 * to reach the line (short final sections) are treated as reached at the bottom of the page.
 */
export interface Layout { tops: number[]; scrollY: number; viewportH: number; docH: number }

const BOTTOM_SLACK = 2;

export const readingLine = (viewportH: number) => Math.min(120, 0.4 * viewportH);

/** Scroll position at which each section counts as reached (ascending, clamped to 0..max scroll). */
function targets({ tops, viewportH, docH }: Layout): number[] {
  const line = readingLine(viewportH);
  const maxScroll = Math.max(0, docH - viewportH);
  return tops.map((t) => Math.max(0, Math.min(t - line, maxScroll)));
}

function effectiveScroll(l: Layout): number {
  const maxScroll = Math.max(0, l.docH - l.viewportH);
  return l.scrollY >= maxScroll - BOTTOM_SLACK ? maxScroll : l.scrollY;
}

/** Index of the section being read: the last one reached (0 if none). */
export function activeIndex(l: Layout): number {
  const s = effectiveScroll(l);
  let active = 0;
  targets(l).forEach((t, i) => { if (t <= s) active = i; });
  return active;
}

/** Continuous position along the sections, 0..n−1: integer i = section i just reached; fractional = between. */
export function progressIndex(l: Layout): number {
  const ts = targets(l);
  if (ts.length <= 1) return 0;
  const s = effectiveScroll(l);
  if (s <= ts[0]) return 0;
  for (let i = ts.length - 1; i >= 0; i--) {
    if (s < ts[i]) continue;
    if (i === ts.length - 1) return i;
    const span = ts[i + 1] - ts[i];
    return span <= 0 ? i + 1 : i + (s - ts[i]) / span;
  }
  return 0;
}

/** Plain 0..1 reading progress through the document. */
export function readingProgress(scrollY: number, viewportH: number, docH: number): number {
  const max = docH - viewportH;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / max));
}

/** Where each section sits along readingProgress (0..1), for the phone bar's ticks. */
export function sectionShares(l: Layout): number[] {
  const maxScroll = l.docH - l.viewportH;
  if (maxScroll <= 0) return l.tops.map(() => 0);
  return targets(l).map((t) => t / maxScroll);
}
