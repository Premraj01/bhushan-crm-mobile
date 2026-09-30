import { useColorScheme } from "react-native";

/**
 * Brand tokens ported from the web dashboard (`frontend/src/styles.css`, `:root` and `.dark`).
 * The web defines them in oklch; these are the same colours converted to sRGB hex —
 * keep the two in sync when the brand changes.
 */
const light = {
  background: "#f8fcf9",
  foreground: "#0e191b",
  card: "#ffffff",
  primary: "#00383b",
  primaryForeground: "#fafdfa",
  secondary: "#ebf8ef",
  mutedForeground: "#49605e",
  accent: "#b4e9a6",
  accentForeground: "#022d2b",
  destructive: "#df2225",
  border: "#dbe8e4",
  success: "#00ad43",
  successSoft: "#dcfcdf",
  warning: "#c97500",
  warningSoft: "#fff3d4",
  errorSoft: "#ffe9e6",
  tealSoft: "#e2f3f1",
  overlay: "rgba(0, 8, 8, 0.58)",
  /** Headings and figures: primary teal on light, foreground on dark (as `.dark .page-header h1`). */
  heading: "#00383b",
  /** The sidebar colour — deep teal in both themes. */
  brand: "#00383b",
  brandForeground: "#fafdfa",
};

export type Colors = typeof light;

const dark: Colors = {
  background: "#112424",
  foreground: "#ebf3f1",
  card: "#192e2e",
  primary: "#69d67e",
  primaryForeground: "#071f1f",
  secondary: "#263b3a",
  mutedForeground: "#a1b7b2",
  accent: "#2f5d4a",
  accentForeground: "#ebf4f1",
  destructive: "#f45a56",
  border: "#314746",
  success: "#4cc466",
  successSoft: "#153c25",
  warning: "#e1a447",
  warningSoft: "#44311f",
  errorSoft: "#492826",
  tealSoft: "#1e3836",
  overlay: "rgba(0, 8, 8, 0.78)",
  heading: "#ebf3f1",
  brand: "#0b2c2d",
  brandForeground: "#ebf3f1",
};

/** Montserrat for headings, Inter for body copy — the same pair as the web app. */
export const fonts = {
  heading: "Montserrat_700Bold",
  headingSemi: "Montserrat_600SemiBold",
  headingHeavy: "Montserrat_800ExtraBold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemi: "Inter_600SemiBold",
};

/** Web `--radius` is .3125rem (5px); avatars and icon tiles use 4px. */
export const radius = { sm: 4, md: 5, lg: 8, pill: 99 };

export function useTheme() {
  const scheme = useColorScheme();
  const colors = scheme === "dark" ? dark : light;
  return { colors, dark: scheme === "dark" };
}

/** `--shadow-panel`, approximated for native. */
export const panelShadow = {
  boxShadow: "0 1px 2px rgba(20, 45, 45, 0.04), 0 8px 24px rgba(20, 45, 45, 0.045)",
};
