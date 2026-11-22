import { activeIndex } from "../lib/reading";
import { measure } from "./measure";

/**
 * Marks the nav link for the section being read with aria-current="true".
 * Uses the shared reading-line maths (src/lib/reading.ts), the same as the Signal Path.
 */
export function initNavHighlight(nav: HTMLElement): () => void {
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const sections = links
    .map((a) => document.getElementById(a.hash.slice(1)))
    .filter((s): s is HTMLElement => s !== null);
  if (sections.length === 0) return () => {};

  let frame = 0;

  function update() {
    frame = 0;
    const active = sections[activeIndex(measure(sections))];
    for (const a of links) {
      if (a.hash === `#${active.id}`) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (frame) cancelAnimationFrame(frame);
  };
}
