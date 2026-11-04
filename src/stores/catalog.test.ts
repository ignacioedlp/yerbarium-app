import { describe, expect, it, vi } from "vitest";
import {
  directionsUrl,
  loadNearbyBranches,
  normalizeBranch,
  NEARBY_QUERY,
  type BranchResponse,
} from "./catalog";
import { canPersistPublicQuery } from "@/api/cache-policy";
const position = { latitude: -34.6, longitude: -58.4 };
const branch = (distance_km: number | null, id = 1): BranchResponse => ({
  id,
  store: {
    name: "Matera",
    slug: "matera",
    description: "",
    image_url: null,
    website: "",
  },
  name: "Centro",
  address: "Calle 123",
  city: "Buenos Aires",
  province: "",
  country_code: "AR",
  latitude: "-34.600000",
  longitude: "-58.400000",
  distance_km,
  yerbas: [],
});
const page = (results: BranchResponse[], next: string | null = null) => ({
  results,
  next,
  previous: null,
  count: 200,
});
describe("nearby store catalog", () => {
  it("converts decimal coordinates and rejects invalid markers or missing distances", () => {
    expect(normalizeBranch(branch(0))).toMatchObject({
      ...position,
      distance_km: 0,
    });
    for (const value of [
      branch(null),
      branch(-1),
      { ...branch(1), latitude: "oops" },
      { ...branch(1), longitude: 181 },
    ]) {
      expect(normalizeBranch(value)).toBeNull();
    }
  });
  it("requests five nearest branches and includes the 25 km boundary", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        page([branch(0), branch(25, 2), branch(25.001, 3)], "next"),
      );
    expect(
      (await loadNearbyBranches(position, 5, fetch)).map((b) => b.id),
    ).toEqual([1, 2]);
    expect(fetch).toHaveBeenCalledExactlyOnceWith({
      ...position,
      page: 1,
      page_size: 5,
    });
  });
  it("paginates using body page numbers and stops when the sorted results leave the radius", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(page([branch(1)], "http://internal/next"))
      .mockResolvedValueOnce(
        page([branch(20, 2), branch(26, 3)], "http://internal/more"),
      );
    expect(
      (await loadNearbyBranches(position, "all", fetch)).map((b) => b.id),
    ).toEqual([1, 2]);
    expect(fetch).toHaveBeenNthCalledWith(2, {
      ...position,
      page: 2,
      page_size: 100,
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("keeps the selected yerba filter in every page of the nearby lookup", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(page([branch(1)], "next"))
      .mockResolvedValueOnce(page([branch(2, 2)]));
    const result = await loadNearbyBranches(
      position,
      "all",
      fetch,
      "canarias-tradicional",
    );
    expect(result.map((b) => b.id)).toEqual([1, 2]);
    expect(fetch).toHaveBeenNthCalledWith(1, {
      ...position,
      page: 1,
      page_size: 100,
      yerba: "canarias-tradicional",
    });
    expect(fetch).toHaveBeenNthCalledWith(2, {
      ...position,
      page: 2,
      page_size: 100,
      yerba: "canarias-tradicional",
    });
  });
  it("handles empty data and propagates request failures instead of reporting no results", async () => {
    expect(
      await loadNearbyBranches(position, "all", async () => page([])),
    ).toEqual([]);
    await expect(
      loadNearbyBranches(position, 5, async () => {
        throw new Error("offline");
      }),
    ).rejects.toThrow("offline");
  });
  it("never persists query keys containing the user's position or nearby results", () => {
    expect(
      canPersistPublicQuery(
        [NEARBY_QUERY, position, 5],
        [branch(1)],
        Date.now(),
      ),
    ).toBe(false);
  });
  it("opens destination-only directions on the platform map", () => {
    expect(directionsUrl(position, "ios")).toBe(
      "https://maps.apple.com/?daddr=-34.6,-58.4",
    );
    expect(directionsUrl(position, "android")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=-34.6,-58.4",
    );
  });
});
