import { expect, it } from "vitest";
import { libraryChanges } from "./community-types";
import { aging, technicalRows } from "./format";
it("never sends incompatible tried and want-to-try states", () => {
  expect(libraryChanges("is_tried", true)).toEqual({
    is_tried: true,
    wants_to_try: false,
  });
  expect(libraryChanges("wants_to_try", true)).toEqual({
    wants_to_try: true,
    is_tried: false,
  });
  expect(libraryChanges("is_favorite", true)).toEqual({ is_favorite: true });
});
it("preserves zero, exact ranges, one-sided ranges and unknown aging", () => {
  expect(aging(0, 0)).toBe("0 meses");
  expect(aging(null, null)).toBe("Sin información");
  expect(aging(4, 6)).toBe("4–6 meses");
  expect(aging(4, null)).toBe("Mínimo 4 meses");
  expect(aging(null, 6)).toBe("Máximo 6 meses");
  expect(technicalRows(null)).toEqual([]);
});
