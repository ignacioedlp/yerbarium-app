import { afterEach, expect, it, vi } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import {
  publicApi,
  privateApi,
  connectAuth,
  get,
  normalizeError,
} from "./client";
afterEach(() => {
  vi.restoreAllMocks();
});
it("retries a 401 once with one shared renewal and then surfaces rejection", async () => {
  let access = "expired",
    calls = 0;
  const refresh = vi.fn(async () => {
    access = "renewed";
    return access;
  });
  const dispose = connectAuth({
    access: () => access,
    generation: () => 1,
    refresh,
  });
  const previous = privateApi.defaults.adapter;
  privateApi.defaults.adapter = async (config) => {
    calls++;
    if (calls === 1)
      throw new AxiosError("unauthorized", "401", config, undefined, {
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config,
        data: {},
      });
    expect(config.headers.Authorization).toBe("Bearer renewed");
    return {
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      data: { ok: true },
    };
  };
  try {
    await expect(get("auth/me/", undefined, undefined, true)).resolves.toEqual({
      ok: true,
    });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(calls).toBe(2);
  } finally {
    privateApi.defaults.adapter = previous;
    dispose();
  }
});
it("public requests carry no bearer credentials and propagate cancellation", async () => {
  const previous = publicApi.defaults.adapter;
  const signal = new AbortController().signal;
  publicApi.defaults.adapter = async (config) => {
    expect(config.headers.Authorization).toBeUndefined();
    expect(config.signal).toBe(signal);
    return {
      status: 200,
      statusText: "OK",
      headers: new AxiosHeaders(),
      config,
      data: { count: 0, next: null, previous: null, results: [] },
    };
  };
  try {
    await get("yerbas/", { page: 2 }, signal);
  } finally {
    publicApi.defaults.adapter = previous;
  }
});
it("normalizes field validation while preserving HTTP status", () => {
  const config = { headers: new AxiosHeaders() };
  const error = new AxiosError("Bad Request", "400", config, undefined, {
    status: 400,
    statusText: "Bad Request",
    config,
    headers: {},
    data: { email: ["Email en uso."] },
  });
  expect(normalizeError(error)).toMatchObject({
    status: 400,
    fields: { email: ["Email en uso."] },
    message: "Email en uso.",
  });
});

it("does not renew again for a delayed 401 using an older access token", async () => {
  let access = "old";
  const refresh = vi.fn(async () => {
    access = "new";
    return access;
  });
  const dispose = connectAuth({
    access: () => access,
    generation: () => 1,
    refresh,
  });
  const previous = privateApi.defaults.adapter;
  privateApi.defaults.adapter = async (config) => {
    if (!(config as typeof config & { retried?: boolean }).retried) {
      access = "new";
      throw new AxiosError("Unauthorized", "401", config, undefined, {
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config,
        data: {},
      });
    }
    expect(config.headers.Authorization).toBe("Bearer new");
    return { status: 200, statusText: "OK", headers: {}, config, data: true };
  };
  try {
    await expect(get("auth/me/", undefined, undefined, true)).resolves.toBe(
      true,
    );
    expect(refresh).not.toHaveBeenCalled();
  } finally {
    privateApi.defaults.adapter = previous;
    dispose();
  }
});
it("surfaces a second unauthorized response without infinite token rotation", async () => {
  const refresh = vi.fn().mockResolvedValue("same");
  const dispose = connectAuth({
    access: () => "same",
    generation: () => 1,
    refresh,
  });
  const previous = privateApi.defaults.adapter;
  let calls = 0;
  privateApi.defaults.adapter = async (config) => {
    calls++;
    throw new AxiosError("Unauthorized", "401", config, undefined, {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
      data: { detail: "Sin acceso." },
    });
  };
  try {
    await expect(
      get("auth/me/", undefined, undefined, true),
    ).rejects.toMatchObject({ status: 401 });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(calls).toBe(2);
  } finally {
    privateApi.defaults.adapter = previous;
    dispose();
  }
});
