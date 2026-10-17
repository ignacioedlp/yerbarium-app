import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { get } from "@/api/client";
import { setBrandFollowing, type BrandFollowState } from "@/api/brand-follows";
import { useSession } from "@/providers/session";
import type { BrandListItem, PaginatedResponse } from "@/api/types";

export function useBrandFollow(slug: string) {
  const client = useQueryClient();
  const { user } = useSession();
  return useMutation({
    mutationFn: (following: boolean) => setBrandFollowing(slug, following),
    onMutate: () => ({ viewer: user?.username }),
    onSuccess: (state, _following, context) => {
      client.setQueriesData<BrandFollowState>(
        {
          predicate: (q) =>
            q.queryKey[1] === "social" &&
            q.queryKey[2] === context?.viewer &&
            q.queryKey[3] === `brands/${encodeURIComponent(slug)}/follow/`,
        },
        state,
      );
    },
    onSettled: () =>
      client.invalidateQueries({ queryKey: ["private", "social"] }),
  });
}

export function useBrandPages<T>(path: string, enabled = true) {
  const { user, ready } = useSession();
  const query = useInfiniteQuery({
    queryKey: ["private", "social", user?.username ?? "anonymous", path],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      get<PaginatedResponse<T>>(path, { page: pageParam }, signal, true),
    getNextPageParam: (last, pages) =>
      last.next ? pages.length + 1 : undefined,
    enabled: ready && !!user && enabled,
    staleTime: 0,
  });
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (ready && user && enabled) void refetch();
    }, [ready, user, enabled, refetch]),
  );
  return query;
}

export function useFollowedBrands(enabled = true) {
  return useBrandPages<BrandListItem>("auth/following/brands/", enabled);
}
