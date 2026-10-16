export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface BrandSummary {
  name: string;
  slug: string;
  image_url?: string | null;
  image_alt_text?: string;
}

export interface BrandDetail extends BrandSummary {
  description: string;
  country_code: string;
  website: string;
  founded_year: number | null;
  is_verified: boolean;
}

export interface BrandListItem extends BrandSummary {
  country_code: string;
  is_verified: boolean;
}

export interface YerbaStyleSummary {
  name: string;
  slug: string;
  description?: string;
  image_url?: string | null;
  image_alt_text?: string;
}

export interface YerbaStyle extends YerbaStyleSummary {
  description: string;
}

export interface CatalogImage {
  url: string;
  alt_text: string;
  position: number;
  attribution?: {
    text: string;
    source_url: string;
    license_code: string;
    license_url: string;
    change_note: string;
  } | null;
}

export interface YerbaMateListItem {
  stats: YerbaStats;
  slug: string;
  name: string;
  short_description: string;
  brand: BrandSummary;
  manufacturing_country_code: string;
  tradition_country_code: string;
  styles: YerbaStyleSummary[];
  is_discontinued: boolean;
  images: CatalogImage[];
}

export interface YerbaStats {
  review_count: number;
  rating_average: string | null;
  rating_median: string | null;
  rating_stddev: string | null;
  weighted_rating: string | null;
}

export interface RankedYerba {
  rank: number;
  slug: string;
  name: string;
  brand: BrandSummary;
  image: CatalogImage | null;
  average_rating: string;
  review_count: number;
}

export interface CommunityRanking {
  results: RankedYerba[];
}

export type SensoryAttribute =
  | "intensity"
  | "bitterness"
  | "astringency"
  | "smokiness"
  | "body"
  | "durability"
  | "perceived_dust"
  | "clogging_tendency"
  | "brewing_ease";

export interface SensoryAttributeStats {
  attribute: SensoryAttribute;
  evaluator_count: number;
  average: string | null;
  median: string | null;
  stddev: string | null;
  has_sufficient_evidence: boolean;
}

export interface CommunitySensoryProfile {
  minimum_evaluators: number;
  attributes: SensoryAttributeStats[];
}

export interface YerbaMateDetail extends YerbaMateListItem {
  description: string;
  purchase_links?: YerbaPurchaseLink[];
  brand: BrandDetail;
  presentations: ProductPresentation[];
  presentation_availability?: PresentationAvailability[];
  technical_profile: TechnicalProfile | null;
  sources: ProductSource[];
  sensory_profile: CommunitySensoryProfile;
}

export interface ProductPresentation {
  weight_grams: number;
  package_type: string;
  barcode: string;
}

export type StemContent = "" | "PRESENT" | "REDUCED" | "NONE";

export interface TechnicalProfile {
  stem_content: StemContent;
  aging_months_min: number | null;
  aging_months_max: number | null;
  leaf_origin_country_code: string;
  leaf_origin_description: string;
  drying_method: string;
  grind_description: string;
  declared_leaf_percentage: string | null;
  declared_stem_percentage: string | null;
  declared_dust_percentage: string | null;
  ingredients: string;
}

export interface ProductSource {
  source_type: string;
  publisher: string;
  title: string;
  url: string;
  accessed_at: string;
  is_official: boolean;
  evidence: { field_key: string; verified_at: string }[];
}

export interface PresentationAvailability {
  weight_grams: number;
  status: "AVAILABLE" | "UNAVAILABLE" | "UNKNOWN";
  presentations: ProductPresentation[];
  source: { title: string; url: string } | null;
  verified_at: string | null;
}

export interface YerbaPurchaseLink {
  id: number;
  provider: string;
  url: string;
  affiliate_url: string;
  price: string | null;
  currency: string;
  is_official: boolean;
  priority: number;
}
