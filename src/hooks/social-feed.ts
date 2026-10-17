import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { socialFeedOptions } from "@/api/social-feed-query";
import type { SocialTab } from "@/api/social-feed";
import { useSession } from "@/providers/session";

export function useSocialFeed(tab: SocialTab) {
  const { user, ready } = useSession();
  const query = useInfiniteQuery({
    ...socialFeedOptions(user?.username ?? "anonymous", tab),
    enabled: ready && !!user,
  });
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (ready && user) void refetch();
    }, [ready, user, refetch]),
  );
  return query;
}
