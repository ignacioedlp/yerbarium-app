import { describe, expect, it } from "vitest";
import { packageTypeLabel } from "./format";

describe("packageTypeLabel", () => {
  it.each([
    ["bag", "Paquete"],
    ["paquete", "Paquete"],
    [" BOLSA ", "Paquete"],
    ["box", "Caja"],
    ["Caja", "Caja"],
    ["paper bag", "Paquete de papel"],
    ["tin", "Lata"],
    ["jar", "Frasco"],
  ])("shows %s in Spanish as %s", (input, label) => {
    expect(packageTypeLabel(input)).toBe(label);
  });

  it("keeps specific descriptions and handles missing information", () => {
    expect(packageTypeLabel(" Paquete de ejemplo ")).toBe("Paquete de ejemplo");
    expect(packageTypeLabel(" ")).toBe("Sin información");
  });
});
