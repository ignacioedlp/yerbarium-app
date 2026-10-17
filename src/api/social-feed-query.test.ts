import { afterEach, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { privateApi, connectAuth } from "./client";
import { socialFeedOptions } from "./social-feed-query";
import { publicQuery } from "./cache-policy";

const previous = privateApi.defaults.adapter;
afterEach(() => {
  privateApi.defaults.adapter = previous;
});
it("authenticates both feeds, keeps account and tab caches separate and never persists them", async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const dispose = connectAuth({
    access: () => "test-access",
    generation: () => 1,
    refresh: async () => "test-access",
  });
  const requests: string[] = [];
  privateApi.defaults.adapter = async (config) => {
    expect(config.url).toBe("auth/social-feed/");
    expect(config.params.page).toBe(1);
    expect(config.headers.Authorization).toBe("Bearer test-access");
    requests.push(config.params.tab);
    return {
      config,
      headers: {},
      status: 200,
      statusText: "OK",
      data: { count: 0, results: [], next: null },
    };
  };
  try {
    for (const [user, tab] of [
      ["one", "for_you"],
      ["one", "following"],
      ["two", "for_you"],
    ] as const) {
      await client.fetchInfiniteQuery(socialFeedOptions(user, tab));
    }
    expect(requests).toEqual(["for_you", "following", "for_you"]);
    expect(client.getQueryCache().getAll()).toHaveLength(3);
    expect(
      client
        .getQueryCache()
        .getAll()
        .every((q) => !publicQuery(q.queryKey)),
    ).toBe(true);
  } finally {
    dispose();
    client.clear();
  }
});
it("cancels outstanding transport when its account queries are removed", async () => {
  const client = new QueryClient();
  let requestSignal: AbortSignal | undefined;
  privateApi.defaults.adapter = (config) => {
    requestSignal = config.signal as AbortSignal;
    return new Promise(() => {});
  };
  const pending = client
    .fetchInfiniteQuery(socialFeedOptions("one", "for_you"))
    .catch(() => {});
  client.removeQueries({ queryKey: ["private", "social", "one"] });
  await pending;
  expect(requestSignal?.aborted).toBe(true);
  expect(client.getQueryCache().getAll()).toHaveLength(0);
});
