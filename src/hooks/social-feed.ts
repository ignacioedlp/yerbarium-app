import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { socialFeedOptions } from "@/api/social-feed-query";
import type { SocialTab } from "@/api/social-feed";
import { useSession } from "@/providers/session";

export function useSocialFeed(tab: SocialTab) {
  const { user, ready } = useSession();
  const client = useQueryClient();
  const username = user?.username;
  const query = useInfiniteQuery({
    ...socialFeedOptions(user?.username ?? "anonymous", tab),
    enabled: ready && !!user,
  });
  useFocusEffect(
    useCallback(() => {
      if (ready && username) {
        void client
          .fetchInfiniteQuery(socialFeedOptions(username, tab))
          .catch(() => {});
      }
    }, [ready, username, tab, client]),
  );
  return query;
}
