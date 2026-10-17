import { infiniteQueryOptions } from "@tanstack/react-query";
import { get } from "@/api/client";
import { nextPage } from "@/api/cache-policy";
import type { PaginatedResponse } from "@/api/types";
import type { SocialFeedEvent, SocialTab } from "@/api/social-feed";

export function socialFeedOptions(username: string, tab: SocialTab) {
  return infiniteQueryOptions({
    queryKey: ["private", "social", username, "feed", tab],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      get<PaginatedResponse<SocialFeedEvent>>(
        "auth/social-feed/",
        { tab, page: pageParam },
        signal,
        true,
      ),
    getNextPageParam: nextPage,
    staleTime: 0,
  });
}
