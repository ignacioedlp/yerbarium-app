import { get, normalizeError } from "./client";

export type BarcodeLookup =
  | {
      status: "FOUND_LOCAL";
      barcode: string;
      yerba: {
        slug: string;
        name: string;
        brand: { slug: string; name: string };
      };
      presentation: { weight_grams: number; package_type: string };
    }
  | {
      status: "FOUND_EXTERNAL";
      barcode: string;
      external_source: "OPEN_FOOD_FACTS";
      product: { name: string; brand: string };
    }
  | { status: "NOT_FOUND"; barcode: string };

export function scannedBarcode(type: string, data: string): string | null {
  const code = data.trim();
  const lengths: Record<string, number> = { ean13: 13, upc_a: 12, upc_e: 8 };
  return Object.hasOwn(lengths, type) &&
    /^[0-9]+$/.test(code) &&
    code.length === lengths[type]
    ? code
    : null;
}

export async function lookupBarcode(
  code: string,
  signal?: AbortSignal,
): Promise<BarcodeLookup> {
  if (!/^(?:[0-9]{8}|[0-9]{12}|[0-9]{13})$/.test(code))
    throw new Error("Invalid barcode");
  // iOS reports UPC-A as EAN-13 with a leading zero; the backend preserves digits.
  const alias =
    code.length === 12
      ? `0${code}`
      : code.length === 13 && code.startsWith("0")
        ? code.slice(1)
        : null;
  let firstResult: BarcodeLookup | undefined;
  let unavailable: unknown;
  for (const candidate of alias ? [code, alias] : [code]) {
    try {
      const result = await get<BarcodeLookup>(
        `barcodes/${candidate}/`,
        undefined,
        signal,
      );
      if (result.status === "FOUND_LOCAL") return result;
      firstResult ??= result;
    } catch (error) {
      // External discovery may fail for one spelling even though its UPC alias is local.
      if (!signal?.aborted && alias && normalizeError(error).status === 503)
        unavailable ??= error;
      else throw error;
    }
  }
  if (unavailable) throw unavailable;
  return firstResult!;
}
