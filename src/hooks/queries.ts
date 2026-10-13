import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { get } from "@/api/client";
import { PaginatedResponse } from "@/api/types";
import { nextPage } from "@/api/cache-policy";
export function useResource<T>(
  path: string,
  authenticated = false,
  enabled = true,
) {
  return useQuery({
    queryKey: [authenticated ? "private" : "public", path],
    queryFn: ({ signal }) => get<T>(path, undefined, signal, authenticated),
    enabled,
  });
}
export function usePages<T>(
  path: string,
  params: Record<string, unknown> = {},
  authenticated = false,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: [authenticated ? "private" : "public", path, params],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      get<PaginatedResponse<T>>(
        path,
        { ...params, page: pageParam, page_size: 20 },
        signal,
        authenticated,
      ),
    getNextPageParam: (last, pages) => nextPage(last, pages),
    enabled,
  });
}
