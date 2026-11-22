import type { Layout } from "../lib/reading";

/** Current document layout for the given sections (tops are document-relative). */
export function measure(sections: HTMLElement[]): Layout {
  const scrollY = window.scrollY;
  return {
    tops: sections.map((s) => s.getBoundingClientRect().top + scrollY),
    scrollY,
    viewportH: window.innerHeight,
    docH: document.documentElement.scrollHeight,
  };
}
