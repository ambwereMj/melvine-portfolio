export const THEME_KEY = "mj-theme";
export const MOTION_KEY = "mj-motion";
export const THEMES = ["dark", "light"] as const;
export const MOTIONS = ["full", "reduce"] as const;
export type ThemePref = (typeof THEMES)[number];
export type MotionPref = (typeof MOTIONS)[number];

/** A stored value wins if it's allowed; otherwise the system value. */
export function resolvePref<T extends string>(stored: string | null, allowed: readonly T[], system: T): T {
  return stored !== null && (allowed as readonly string[]).includes(stored) ? (stored as T) : system;
}

export function readStored(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

export function writeStored(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* storage blocked: preference lasts for this page only */ }
}
