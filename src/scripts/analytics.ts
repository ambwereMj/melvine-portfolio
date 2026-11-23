import { eventFromElement, track } from "../lib/analytics";

// Capture phase so the event is recorded even if a later handler navigates away.
document.addEventListener(
  "click",
  (e) => {
    const ev = e.target instanceof Element ? eventFromElement(e.target) : null;
    if (ev) track(ev.name, ev.data);
  },
  { capture: true },
);
