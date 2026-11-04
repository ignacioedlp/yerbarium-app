import type { PaginatedResponse, YerbaMateListItem } from "@/api/types";

export const NEARBY_QUERY = "nearby-stores";
export const NEARBY_RADIUS_KM = 25;
export interface Position {
  latitude: number;
  longitude: number;
}
export interface Store {
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  website: string;
}
export interface StoreBranch {
  id: number;
  store: Store;
  name: string;
  address: string;
  city: string;
  province: string;
  country_code: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  yerbas: YerbaMateListItem[];
}
export type BranchResponse = Omit<
  StoreBranch,
  "latitude" | "longitude" | "distance_km"
> & {
  latitude: string | number;
  longitude: string | number;
  distance_km: number | null;
};
export function normalizeBranch(value: BranchResponse): StoreBranch | null {
  const latitude = Number(value.latitude),
    longitude = Number(value.longitude);
  if (
    value.latitude === "" ||
    value.longitude === "" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    value.distance_km === null ||
    !Number.isFinite(value.distance_km) ||
    value.distance_km < 0
  )
    return null;
  return { ...value, latitude, longitude, distance_km: value.distance_km };
}
export async function loadNearbyBranches(
  position: Position,
  limit: 5 | "all",
  fetchPage: (
    body: Position & { page: number; page_size: number; yerba?: string },
  ) => Promise<PaginatedResponse<BranchResponse>>,
  yerba?: string,
): Promise<StoreBranch[]> {
  const branches: StoreBranch[] = [];
  for (let page = 1; ; page++) {
    const result = await fetchPage({
      ...position,
      ...(yerba ? { yerba } : {}),
      page,
      page_size: limit === 5 ? 5 : 100,
    });
    for (const value of result.results) {
      const branch = normalizeBranch(value);
      if (branch && branch.distance_km <= NEARBY_RADIUS_KM)
        branches.push(branch);
    }
    if (
      limit === 5 ||
      !result.next ||
      !result.results.length ||
      result.results.some(
        (b) => b.distance_km !== null && b.distance_km > NEARBY_RADIUS_KM,
      )
    )
      break;
  }
  return branches;
}
export function directionsUrl(branch: Position, platform: string) {
  const point = `${branch.latitude},${branch.longitude}`;
  return platform === "ios"
    ? `https://maps.apple.com/?daddr=${point}`
    : `https://www.google.com/maps/dir/?api=1&destination=${point}`;
}
