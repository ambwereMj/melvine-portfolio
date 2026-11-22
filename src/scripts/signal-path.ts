import { activeIndex, progressIndex, readingProgress, sectionShares } from "../lib/reading";
import { measure } from "./measure";

/**
 * Signal Path: fills the sidebar trace up to the section being read (desktop) and a 2px bar along the top
 * of the screen (phones). Writes only `transform` and data attributes, once per animation frame.
 */
export function initSignalPath({ nav, bar }: { nav: HTMLElement | null; bar: HTMLElement | null }): () => void {
  const links = nav ? [...nav.querySelectorAll<HTMLAnchorElement>("a[href*='#']")] : [];
  const pairs = links
    .map((a) => ({ a, s: document.getElementById(a.hash.slice(1)) }))
    .filter((p): p is { a: HTMLAnchorElement; s: HTMLElement } => p.s !== null);
  const sections = pairs.map((p) => p.s);
  const fill = nav?.querySelector<HTMLElement>(".signal-fill") ?? null;
  const barFill = bar?.querySelector<HTMLElement>("[data-bar-fill]") ?? null;
  const reduced = () => document.documentElement.dataset.motion === "reduce";

  if (fill && sections.length < 2) fill.style.display = "none";
  if (bar) bar.hidden = false;

  const ticks: HTMLElement[] = sections.map(() => {
    const t = document.createElement("span");
    t.dataset.tick = "";
    bar?.append(t);
    return t;
  });

  const reached = new Set<number>();
  let frame = 0;

  function update() {
    frame = 0;
    const layout = measure(sections);
    const progress = readingProgress(layout.scrollY, layout.viewportH, layout.docH);
    if (barFill) barFill.style.transform = `scaleX(${progress})`;

    if (sections.length === 0) return;
    const shares = sectionShares(layout);
    ticks.forEach((t, i) => { t.style.left = `${shares[i] * 100}%`; t.dataset.lit = String(progress >= shares[i] - 0.001); });

    if (fill && sections.length > 1) fill.style.transform = `scaleY(${progressIndex(layout) / (sections.length - 1)})`;
    const active = activeIndex(layout);
    pairs.forEach(({ a }, i) => {
      const lit = i <= active;
      a.dataset.lit = String(lit);
      if (lit && !reached.has(i)) {
        reached.add(i);
        if (!reduced() && i > 0) a.classList.add("soldered");
      }
    });
  }

  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const onAnimEnd = (e: AnimationEvent) => (e.target as HTMLElement).closest("a")?.classList.remove("soldered");

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  nav?.addEventListener("animationend", onAnimEnd);
  const main = document.querySelector("main");
  const ro = main && "ResizeObserver" in window ? new ResizeObserver(schedule) : null;
  if (main) ro?.observe(main);
  update();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    nav?.removeEventListener("animationend", onAnimEnd);
    ro?.disconnect();
    if (frame) cancelAnimationFrame(frame);
  };
}
