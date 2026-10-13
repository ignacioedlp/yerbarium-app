import { expect, it } from "vitest";
import {
  publicQuery,
  canPersistPublicQuery,
  publicCacheKey,
  CACHE_MAX_AGE,
  nextPage,
} from "./cache-policy";
it("persists only public queries and isolates API environments", () => {
  expect(publicQuery(["public", "yerbas/"])).toBe(true);
  expect(publicQuery(["private", "auth/me/"])).toBe(false);
  expect(publicCacheKey("http://localhost:8000")).not.toBe(
    publicCacheKey("https://api.example.com"),
  );
  expect(CACHE_MAX_AGE).toBe(86400000);
});
it("follows pagination using configured API origin, never backend absolute URLs", () => {
  expect(
    nextPage({ next: "http://internal-api:8000/api/v1/yerbas/?page=3" }, [
      {},
      {},
    ]),
  ).toBe(3);
  expect(nextPage({ next: null }, [{}])).toBeUndefined();
});

it("retains last successful public data after refresh failures and expires it by fetch time", () => {
  const now = 100000000;
  expect(
    canPersistPublicQuery(
      ["public", "yerbas/"],
      { results: [] },
      now - 1000,
      now,
    ),
  ).toBe(true);
  expect(
    canPersistPublicQuery(["public", "yerbas/"], undefined, now - 1000, now),
  ).toBe(false);
  expect(
    canPersistPublicQuery(
      ["private", "auth/me/"],
      { email: "private" },
      now,
      now,
    ),
  ).toBe(false);
  expect(
    canPersistPublicQuery(
      ["public", "yerbas/"],
      { results: [] },
      now - CACHE_MAX_AGE,
      now,
    ),
  ).toBe(false);
});
