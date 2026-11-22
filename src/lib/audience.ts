export type Audience = "local" | "international";

/**
 * Visitors on an African IANA timezone get the WhatsApp-first CTAs; everyone else gets the call-first CTAs.
 * Unknown timezones default to local (most traffic is Kenyan). Mirrored by the inline script in PrefsScript.astro.
 */
export function audienceFor(timeZone: string | null | undefined): Audience {
  if (!timeZone) return "local";
  return timeZone.startsWith("Africa/") ? "local" : "international";
}
