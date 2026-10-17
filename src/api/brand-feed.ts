import type { BrandSummary, YerbaMateListItem } from "@/api/types";
export interface BrandFeedEvent {
  id: string;
  kind: "product" | "news";
  published_at: string;
  title: string;
  body: string;
  brand: BrandSummary;
  product: YerbaMateListItem | null;
}
