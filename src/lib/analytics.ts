/**
 * Analytics events are declared in markup: data-event="whatsapp-click" data-event-location="hero"
 * (and data-event-service for quotes). One delegated listener sends them; see src/scripts/analytics.ts.
 */
export interface TrackedEvent { name: string; data: Record<string, string> }

/** The closest tracked element's event, or null. */
export function eventFromElement(el: Element): TrackedEvent | null {
  const host = el.closest<HTMLElement>("[data-event]");
  if (!host) return null;
  const data: Record<string, string> = {};
  if (host.dataset.eventLocation) data.location = host.dataset.eventLocation;
  if (host.dataset.eventService) data.service = host.dataset.eventService;
  return { name: host.dataset.event!, data };
}

/** Send to Umami if it's loaded; never throws (ad blockers, missing ID). */
export function track(name: string, data: Record<string, string>): void {
  try {
    (window as unknown as { umami?: { track: (n: string, d: object) => void } }).umami?.track(name, data);
  } catch {
    /* analytics must never break the page */
  }
}
