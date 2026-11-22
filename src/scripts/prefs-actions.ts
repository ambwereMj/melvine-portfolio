import { THEME_KEY, MOTION_KEY, writeStored } from "../lib/prefs";

/** Theme and motion switches shared by the Stage 1 toggle buttons, the palette and the terminal. */
const root = document.documentElement;

export const isLight = () => root.dataset.theme === "light";
export const isReduced = () => root.dataset.motion === "reduce";

/** Keep every toggle button's pressed state in step with <html>. */
export function syncPrefButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("button[data-pref]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.pref === "theme" ? isLight() : isReduced()));
  });
}

export function toggleTheme(): void {
  root.dataset.theme = isLight() ? "dark" : "light";
  writeStored(THEME_KEY, root.dataset.theme);
  syncPrefButtons();
}

export function toggleMotion(): void {
  root.dataset.motion = isReduced() ? "full" : "reduce";
  writeStored(MOTION_KEY, root.dataset.motion);
  syncPrefButtons();
}
