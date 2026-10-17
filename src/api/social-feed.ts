import type { BrandSummary, YerbaMateListItem } from "@/api/types";
export type SocialTab = "for_you" | "following";
type EventBase = {
  id: string;
  published_at: string;
  title: string;
  body: string;
  brand: BrandSummary;
};
export type SocialFeedEvent = EventBase &
  (
    | {
        kind: "review";
        product: YerbaMateListItem;
        author: { username: string; display_name: string };
        review: { id: number; rating: string; comment: string };
      }
    | {
        kind: "product";
        product: YerbaMateListItem;
        author: null;
        review: null;
      }
    | {
        kind: "news";
        product: YerbaMateListItem | null;
        author: null;
        review: null;
      }
  );
