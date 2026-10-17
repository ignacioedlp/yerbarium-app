import { write } from "@/api/client";
export interface BrandFollowState {
  is_following: boolean;
  followers_count: number;
}
export function setBrandFollowing(slug: string, following: boolean) {
  return write<BrandFollowState>(
    `brands/${encodeURIComponent(slug)}/follow/`,
    following ? "PUT" : "DELETE",
  );
}
