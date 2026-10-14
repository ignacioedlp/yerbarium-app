import type { YerbaMateListItem } from "./types";
export type LibraryState = {
  is_favorite: boolean;
  is_tried: boolean;
  wants_to_try: boolean;
};
export type LibraryCollection = "tried" | "favorite" | "want_to_try";
export type LibraryEntry = LibraryState & {
  yerba: Pick<
    YerbaMateListItem,
    | "slug"
    | "name"
    | "brand"
    | "images"
    | "short_description"
    | "is_discontinued"
  > &
    Partial<
      Pick<
        YerbaMateListItem,
        | "stats"
        | "styles"
        | "manufacturing_country_code"
        | "tradition_country_code"
      >
    >;
};
export type LibrarySummary = {
  tried: number;
  favorites: number;
  want_to_try: number;
};
export const sensoryLabels = {
  intensity: "Intensidad",
  bitterness: "Amargor",
  astringency: "Astringencia",
  smokiness: "Ahumado",
  body: "Cuerpo",
  durability: "Duración",
  perceived_dust: "Polvo percibido",
  clogging_tendency: "Tendencia a taparse",
  brewing_ease: "Facilidad de cebado",
} as const;
export type SensoryKey = keyof typeof sensoryLabels;
export const flavorFamilies: Record<string, string> = {
  HERBAL: "Herbal",
  WOODY: "Amaderado",
  SMOKY: "Ahumado",
  EARTHY: "Terroso",
  ROASTED: "Tostado",
  SPICY: "Especiado",
  FLORAL: "Floral",
  FRUITY: "Frutal",
  SWEET: "Dulce",
  FRESH: "Fresco",
};
export type FlavorNote = { name: string; slug: string; family: string };
export type Review = {
  id: number;
  yerba_slug: string;
  username: string;
  rating: string;
  comment: string;
  status: "PUBLISHED" | "PENDING" | "HIDDEN";
  sensory: Partial<Record<SensoryKey, number | null>> | null;
  flavor_notes: FlavorNote[];
  created_at: string;
};
export type ReportReason =
  "SPAM" | "ABUSE" | "HATE" | "INAPPROPRIATE" | "OTHER";
export type BlockStatus = { is_blocked: boolean };
export function libraryChanges(
  key: keyof LibraryState,
  value: boolean,
): Partial<LibraryState> {
  return {
    [key]: value,
    ...(value && key === "is_tried" ? { wants_to_try: false } : {}),
    ...(value && key === "wants_to_try" ? { is_tried: false } : {}),
  };
}
