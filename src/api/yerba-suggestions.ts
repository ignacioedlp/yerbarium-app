import { write } from "./client";
import type { BarcodeLookup } from "./barcodes";

export function suggestionFromScan(barcode: string, result: BarcodeLookup) {
  if (result.status === "FOUND_LOCAL") return null;
  return {
    barcode,
    ...(result.status === "FOUND_EXTERNAL"
      ? { name: result.product.name, brand: result.product.brand }
      : {}),
  };
}

export function validSuggestionWeight(value: string) {
  return (
    value.trim() === "" ||
    (/^[0-9]+$/.test(value.trim()) &&
      Number(value) > 0 &&
      Number(value) <= 2147483647)
  );
}

export function suggestYerba(input: {
  name: string;
  brand: string;
  barcode?: string;
  weight?: string;
}) {
  if (!validSuggestionWeight(input.weight ?? ""))
    throw new Error("Invalid weight");
  return write("yerba-suggestions/", "POST", {
    name: input.name.trim(),
    brand: input.brand.trim(),
    ...(input.barcode ? { barcode: input.barcode } : {}),
    ...(input.weight?.trim() ? { weight_grams: Number(input.weight) } : {}),
  });
}
