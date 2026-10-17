import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { get } from "@/api/client";
import { useSession } from "@/providers/session";
import type { PublicProfile } from "@/api/account-types";
import type { PaginatedResponse } from "@/api/types";

import {
  setFollowing,
  type FollowMember,
  type FollowDirection,
} from "@/api/follows";
export type { FollowDirection } from "@/api/follows";

// Viewer-dependent social data is never persisted, including anonymous views.
export function useSocialResource<T>(path: string, enabled = true) {
  const { user, ready } = useSession();
  const query = useQuery({
    queryKey: ["private", "social", user?.username ?? "anonymous", path],
    queryFn: ({ signal }) => get<T>(path, undefined, signal, !!user),
    enabled: enabled && ready,
    staleTime: 0,
  });
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (enabled && ready) void refetch();
    }, [enabled, ready, refetch]),
  );
  return query;
}

export function useFollowList(username: string, direction: FollowDirection) {
  const { user, ready } = useSession();
  const path = `profiles/${encodeURIComponent(username)}/${direction}/`;
  const query = useInfiniteQuery({
    queryKey: ["private", "social", user?.username ?? "anonymous", path],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      get<PaginatedResponse<FollowMember>>(
        path,
        { page: pageParam },
        signal,
        !!user,
      ),
    getNextPageParam: (last, pages) =>
      last.next ? pages.length + 1 : undefined,
    enabled: ready && user?.username === username,
    staleTime: 0,
  });
  const { refetch } = query;
  useFocusEffect(
    useCallback(() => {
      if (ready && user?.username === username) void refetch();
    }, [ready, user?.username, username, refetch]),
  );
  return query;
}

export function useFollow(username: string) {
  const client = useQueryClient();
  const { reload } = useSession();
  return useMutation({
    mutationFn: (following: boolean) => setFollowing(username, following),
    onSuccess: (state) => {
      client.setQueriesData<PublicProfile>(
        {
          predicate: (q) =>
            q.queryKey[1] === "social" &&
            q.queryKey[3] === `profiles/${encodeURIComponent(username)}/`,
        },
        (previous) => (previous ? { ...previous, ...state } : previous),
      );
      void reload().catch(() => {});
    },
    onSettled: () =>
      client.invalidateQueries({ queryKey: ["private", "social"] }),
  });
}
