import { afterEach, expect, it } from "vitest";
import { privateApi, connectAuth } from "./client";
import { setBrandFollowing } from "./brand-follows";
const previous = privateApi.defaults.adapter;
afterEach(() => {
  privateApi.defaults.adapter = previous;
});
it("uses authenticated idempotent brand writes and preserves the public counter", async () => {
  const dispose = connectAuth({
    access: () => "test-access",
    generation: () => 1,
    refresh: async () => "test-access",
  });
  const methods: string[] = [];
  privateApi.defaults.adapter = async (config) => {
    methods.push(config.method!);
    expect(config.url).toBe("brands/mate%2Bbrand/follow/");
    expect(config.headers.Authorization).toBe("Bearer test-access");
    return {
      config,
      headers: {},
      status: 200,
      statusText: "OK",
      data: {
        is_following: config.method === "put",
        followers_count: config.method === "put" ? 2 : 1,
      },
    };
  };
  try {
    await expect(setBrandFollowing("mate+brand", true)).resolves.toEqual({
      is_following: true,
      followers_count: 2,
    });
    await expect(setBrandFollowing("mate+brand", false)).resolves.toEqual({
      is_following: false,
      followers_count: 1,
    });
    expect(methods).toEqual(["put", "delete"]);
  } finally {
    dispose();
  }
});
