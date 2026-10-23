import { describe, expect, it } from "vitest";
import { parseAppearance, resolveAppearance } from "./appearance";
import { darkTheme, lightTheme } from "../theme/palettes";

describe("appearance preference", () => {
  it("uses the system when no valid preference is saved", () => {
    for (const value of [null, "", "invalid", "system"]) {
      expect(parseAppearance(value)).toBe("system");
    }
    expect(parseAppearance("dark")).toBe("dark");
    expect(parseAppearance("light")).toBe("light");
  });
  it("follows system changes only in automatic mode", () => {
    expect(resolveAppearance("system", "dark")).toBe("dark");
    expect(resolveAppearance("system", "light")).toBe("light");
    expect(resolveAppearance("system", "unspecified")).toBe("light");
    expect(resolveAppearance("dark", "light")).toBe("dark");
    expect(resolveAppearance("light", "dark")).toBe("light");
  });
});

function luminance(hex: string) {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
describe("readable brand palettes", () => {
  for (const theme of [lightTheme, darkTheme]) {
    it(`keeps text and actions readable in ${theme.dark ? "dark" : "light"} mode`, () => {
      const c = theme.colors;
      for (const surface of [c.background, c.surface, c.cream, c.productCard]) {
        for (const text of [c.ink, c.muted, c.green, c.error]) {
          expect(contrast(text, surface)).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(contrast(c.onDark, c.hero)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
