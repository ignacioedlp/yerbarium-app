import { describe, expect, it } from "vitest";
import { formatWeight, presentationMatrix } from "./presentations";
import type { PresentationAvailability } from "./types";
const pack = (weight_grams: number, package_type = "bag") => ({
  weight_grams,
  package_type,
  barcode: "",
});
const evidence = (
  overrides: Partial<PresentationAvailability> = {},
): PresentationAvailability => ({
  weight_grams: 100,
  status: "UNAVAILABLE",
  presentations: [],
  source: { title: "Official catalogue", url: "https://example.com/catalogue" },
  verified_at: "2026-10-26",
  ...overrides,
});
describe("presentationMatrix", () => {
  it("keeps the five canonical sizes unknown without evidence", () => {
    const { canonical, other } = presentationMatrix([]);
    expect(canonical.map((item) => [item.weight_grams, item.status])).toEqual([
      [100, "UNKNOWN"],
      [250, "UNKNOWN"],
      [500, "UNKNOWN"],
      [1000, "UNKNOWN"],
      [5000, "UNKNOWN"],
    ]);
    expect(other).toEqual([]);
  });
  it("groups physical packages and supports the older API", () => {
    const { canonical } = presentationMatrix([
      pack(500),
      pack(500, "tin"),
      pack(1000),
    ]);
    expect(canonical[2].status).toBe("AVAILABLE");
    expect(canonical[2].presentations).toHaveLength(2);
    expect(canonical[3].status).toBe("AVAILABLE");
  });
  it("requires both source URL and verification date for a negative", () => {
    expect(presentationMatrix([], [evidence()]).canonical[0].status).toBe(
      "UNAVAILABLE",
    );
    for (const invalid of [
      { source: null },
      { verified_at: null },
      { source: { title: "Source", url: "" } },
    ])
      expect(
        presentationMatrix([], [evidence(invalid)]).canonical[0].status,
      ).toBe("UNKNOWN");
  });
  it("does not invent physical packages or override them with conflicting evidence", () => {
    expect(
      presentationMatrix([], [evidence({ status: "AVAILABLE" })]).canonical[0]
        .status,
    ).toBe("UNKNOWN");
    expect(
      presentationMatrix([pack(100)], [evidence()]).canonical[0].status,
    ).toBe("AVAILABLE");
  });
  it("sorts additional physical sizes and ignores nonstandard unknown sizes", () => {
    expect(
      presentationMatrix(
        [pack(2000), pack(750)],
        [evidence({ weight_grams: 300 })],
      ).other.map((item) => item.weight_grams),
    ).toEqual([750, 2000]);
  });
});
it("formats grams and kilograms in the selected locale", () => {
  expect(formatWeight(500, "es-AR")).toBe("500 g");
  expect(formatWeight(1000, "es-AR")).toBe("1 kg");
  expect(formatWeight(1500, "es-AR")).toBe("1,5 kg");
  expect(formatWeight(1500, "en-GB")).toBe("1.5 kg");
});
