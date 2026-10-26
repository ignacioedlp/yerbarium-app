import type { PresentationAvailability, ProductPresentation } from "./types";

export const canonicalWeights = [100, 250, 500, 1000, 5000] as const;

export function formatWeight(grams: number, locale: string) {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(grams >= 1000 ? grams / 1000 : grams)} ${grams >= 1000 ? "kg" : "g"}`;
}

export function presentationMatrix(
  presentations: ProductPresentation[],
  availability: PresentationAvailability[] = [],
) {
  const weights = new Map<number, PresentationAvailability>();
  for (const item of availability) {
    weights.set(item.weight_grams, {
      ...item,
      presentations: [],
      // Missing evidence never means that a size is not offered. Physical
      // packages below remain the source of truth for confirmed sizes.
      status:
        item.status === "UNAVAILABLE" && item.source?.url && item.verified_at
          ? "UNAVAILABLE"
          : "UNKNOWN",
    });
  }
  for (const pack of presentations) {
    const entry = weights.get(pack.weight_grams) ?? {
      weight_grams: pack.weight_grams,
      status: "AVAILABLE",
      presentations: [],
      source: null,
      verified_at: null,
    };
    entry.status = "AVAILABLE";
    entry.presentations.push(pack);
    weights.set(pack.weight_grams, entry);
  }
  const canonical = canonicalWeights.map(
    (weight_grams) =>
      weights.get(weight_grams) ?? {
        weight_grams,
        status: "UNKNOWN" as const,
        presentations: [],
        source: null,
        verified_at: null,
      },
  );
  const other = [...weights.values()]
    .filter(
      (item) =>
        !canonicalWeights.some((weight) => weight === item.weight_grams) &&
        item.presentations.length > 0,
    )
    .sort((a, b) => a.weight_grams - b.weight_grams);
  return { canonical, other };
}
