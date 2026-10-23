export type AppearancePreference = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";
export const appearanceStorageKey = "yerbarium.appearance";
export function parseAppearance(value: string | null): AppearancePreference {
  return value === "light" || value === "dark" ? value : "system";
}
export function resolveAppearance(
  preference: AppearancePreference,
  system: ColorScheme | "unspecified" | null | undefined,
): ColorScheme {
  return preference === "system"
    ? system === "dark"
      ? "dark"
      : "light"
    : preference;
}
