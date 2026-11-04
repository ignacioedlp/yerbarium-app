import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/api/client";
import type { PaginatedResponse } from "@/api/types";
import { useNearbyLocation } from "@/providers/nearby-location";
import {
  loadNearbyBranches,
  NEARBY_QUERY,
  type BranchResponse,
} from "@/stores/catalog";
export function useNearbyStores(limit: 5 | "all", yerba?: string) {
  const { position } = useNearbyLocation();
  return useQuery({
    queryKey: [NEARBY_QUERY, position, limit, yerba ?? null],
    enabled: position !== null,
    gcTime: 0,
    queryFn: ({ signal }) => {
      if (!position) throw new Error("Location required");
      return loadNearbyBranches(
        position,
        limit,
        async (body) =>
          (
            await publicApi.post<PaginatedResponse<BranchResponse>>(
              "store-branches/",
              body,
              { signal },
            )
          ).data,
        yerba,
      );
    },
  });
}
