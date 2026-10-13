export const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
export function publicQuery(key: readonly unknown[]) {
  return key[0] === "public";
}
export function publicCacheKey(apiUrl: string) {
  return `yerbarium.public.v1:${apiUrl}`;
}
export function nextPage(page: { next: string | null }, pages: unknown[]) {
  return page.next ? pages.length + 1 : undefined;
}

export function canPersistPublicQuery(
  key: readonly unknown[],
  data: unknown,
  updatedAt: number,
  now = Date.now(),
) {
  return (
    publicQuery(key) &&
    data !== undefined &&
    updatedAt > 0 &&
    now - updatedAt < CACHE_MAX_AGE
  );
}
