/**
 * Single source of truth for theme colours. tokens.css mirrors these values;
 * tests/unit/tokens-sync.test.ts keeps the two in step.
 * `line` is a decorative hairline (exempt from 3:1); `border` is for UI component boundaries.
 */
export type Theme = "dark" | "light";
export interface Palette {
  bg: string; surface: string; text: string; muted: string;
  accent: string; onAccent: string; accent2: string; accent2Text: string;
  border: string; line: string;
}

export const PALETTE: Record<Theme, Palette> = {
  dark: {
    bg: "#0B0F0E", surface: "#121917", text: "#E6EDEA", muted: "#9AABA4",
    accent: "#3DDC97", onAccent: "#0B0F0E", accent2: "#F5A623", accent2Text: "#F5A623",
    border: "#5E716A", line: "#22302B",
  },
  light: {
    bg: "#F4F1EA", surface: "#FFFFFF", text: "#14201B", muted: "#4D5A54",
    accent: "#0B7A4B", onAccent: "#FFFFFF", accent2: "#D9480F", accent2Text: "#B83D0C",
    border: "#7A847F", line: "#DCD6C8",
  },
};
