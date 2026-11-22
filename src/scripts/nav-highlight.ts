/**
 * Marks the nav link for the section under the reading line (120px from the top,
 * just below where a jumped-to heading lands)
 * with aria-current="true". At the very bottom of the page the last section wins,
 * since a short final section may never reach the reading line.
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
    const line = Math.min(120, window.innerHeight * 0.4);
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let active = sections[0];
    if (atBottom) active = sections[sections.length - 1];
    else for (const s of sections) if (s.getBoundingClientRect().top <= line) active = s;

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
