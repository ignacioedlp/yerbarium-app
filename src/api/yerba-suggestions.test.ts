import { beforeEach, expect, it, vi } from "vitest";
import { write } from "./client";
import {
  suggestYerba,
  suggestionFromScan,
  validSuggestionWeight,
} from "./yerba-suggestions";

vi.mock("./client", () => ({ write: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

it("passes the original scanned digits into the suggestion even when lookup used an alias", () => {
  expect(
    suggestionFromScan("0123456789012", {
      status: "NOT_FOUND",
      barcode: "123456789012",
    }),
  ).toEqual({ barcode: "0123456789012" });
  expect(
    suggestionFromScan("0123456789012", {
      status: "FOUND_EXTERNAL",
      barcode: "0123456789012",
      external_source: "OPEN_FOOD_FACTS",
      product: { name: "Suave", brand: "Marca" },
    }),
  ).toEqual({ barcode: "0123456789012", name: "Suave", brand: "Marca" });
});

it("sends the hidden barcode and weight in grams, preserving leading zeroes", async () => {
  await suggestYerba({
    name: " Suave ",
    brand: " Marca ",
    barcode: "0123456789012",
    weight: "500",
  });
  expect(write).toHaveBeenCalledWith("yerba-suggestions/", "POST", {
    name: "Suave",
    brand: "Marca",
    barcode: "0123456789012",
    weight_grams: 500,
  });
});

it("allows a suggestion without a scan or weight", async () => {
  await suggestYerba({ name: "Suave", brand: "Marca", weight: "" });
  expect(write).toHaveBeenCalledWith("yerba-suggestions/", "POST", {
    name: "Suave",
    brand: "Marca",
  });
});

it("can send a scan without specifying weight", async () => {
  await suggestYerba({ name: "Suave", brand: "Marca", barcode: "12345678" });
  expect(write).toHaveBeenCalledWith("yerba-suggestions/", "POST", {
    name: "Suave",
    brand: "Marca",
    barcode: "12345678",
  });
});

it.each(["0", "-1", "500.5", "1e3", "abc", "2147483648"])(
  "rejects invalid gram values: %s",
  (value) => {
    expect(validSuggestionWeight(value)).toBe(false);
    expect(() =>
      suggestYerba({ name: "Suave", brand: "Marca", weight: value }),
    ).toThrow();
    expect(write).not.toHaveBeenCalled();
  },
);

it.each(["", " ", "250", "500", "750", "1000"])(
  "accepts optional integer gram values: %s",
  (value) => {
    expect(validSuggestionWeight(value)).toBe(true);
  },
);
