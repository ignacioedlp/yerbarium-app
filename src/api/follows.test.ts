import { afterEach, expect, it } from "vitest";
import { AxiosError } from "axios";
import { connectAuth, privateApi, ApiError } from "./client";
import { setFollowing } from "./follows";
const previous = privateApi.defaults.adapter;
afterEach(() => {
  privateApi.defaults.adapter = previous;
});

it("uses authenticated idempotent writes and preserves the server counts", async () => {
  const dispose = connectAuth({
    access: () => "test-access",
    generation: () => 1,
    refresh: async () => "test-access",
  });
  const methods: string[] = [];
  privateApi.defaults.adapter = async (config) => {
    expect(config.headers.Authorization).toBe("Bearer test-access");
    expect(config.url).toBe("profiles/mate%2Buno/follow/");
    methods.push(config.method!);
    return {
      config,
      headers: {},
      status: 200,
      statusText: "OK",
      data: {
        is_following: config.method === "put",
        followers_count: config.method === "put" ? 3 : 2,
        following_count: 5,
      },
    };
  };
  try {
    await expect(setFollowing("mate+uno", true)).resolves.toMatchObject({
      is_following: true,
      followers_count: 3,
    });
    await expect(setFollowing("mate+uno", false)).resolves.toMatchObject({
      is_following: false,
      followers_count: 2,
    });
    expect(methods).toEqual(["put", "delete"]);
  } finally {
    dispose();
  }
});

it("surfaces a private-profile rejection without retrying the mutation", async () => {
  let calls = 0;
  const dispose = connectAuth({
    access: () => "test-access",
    generation: () => 1,
    refresh: async () => "test-access",
  });
  privateApi.defaults.adapter = async (config) => {
    calls++;
    throw new AxiosError("Forbidden", "403", config, undefined, {
      config,
      status: 403,
      statusText: "Forbidden",
      headers: {},
      data: { detail: "Solo podés seguir perfiles públicos disponibles." },
    });
  };
  try {
    await expect(setFollowing("privado", true)).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(calls).toBe(1);
  } finally {
    dispose();
  }
});
