import { afterEach, expect, it } from "vitest";
import { privateApi, publicApi } from "./client";
import {
  getOwnGamification,
  groupAchievements,
  progressRatio,
  type Achievement,
} from "./gamification";

const privateAdapter = privateApi.defaults.adapter;
const publicAdapter = publicApi.defaults.adapter;
afterEach(() => {
  privateApi.defaults.adapter = privateAdapter;
  publicApi.defaults.adapter = publicAdapter;
});

it("fetches private progress with cancellation and preserves badge presentation", async () => {
  const controller = new AbortController();
  const payload = {
    level: 1,
    total_xp: 95,
    image_url: "https://media.example.test/level-1.webp",
    image_alt_text: "Primer Cebado",
    achievements: [],
  };
  publicApi.defaults.adapter = async () => {
    throw new Error("Progress must use the authenticated client");
  };
  privateApi.defaults.adapter = async (config) => {
    expect(config.url).toBe("auth/me/gamification/");
    expect(config.signal).toBe(controller.signal);
    return {
      config,
      headers: {},
      status: 200,
      statusText: "OK",
      data: payload,
    };
  };
  await expect(getOwnGamification(controller.signal)).resolves.toEqual(payload);
});

it("keeps revoked awards out of completed achievements even with full progress", () => {
  const awards = [
    { key: "first", status: "unlocked", progress: 1, requirement: 1 },
    { key: "explorer", status: "locked", progress: 3, requirement: 15 },
    { key: "revoked", status: "revoked", progress: 1, requirement: 1 },
  ] as Achievement[];
  const groups = groupAchievements(awards);
  expect(groups.completed.map((award) => award.key)).toEqual(["first"]);
  expect(groups.pending.map((award) => award.key)).toEqual([
    "explorer",
    "revoked",
  ]);
  expect(groupAchievements([])).toEqual({ completed: [], pending: [] });
});

it("propagates load failures and can recover with a new request", async () => {
  privateApi.defaults.adapter = async () => {
    throw new Error("offline");
  };
  await expect(getOwnGamification()).rejects.toThrow();
  privateApi.defaults.adapter = async (config) => ({
    config,
    headers: {},
    status: 200,
    statusText: "OK",
    data: { level: 1, achievements: [] },
  });
  await expect(getOwnGamification()).resolves.toMatchObject({ level: 1 });
});

it("bounds level and achievement progress, including empty and max-level values", () => {
  expect(progressRatio(0.95)).toBe(0.95);
  expect(progressRatio(3, 5)).toBe(0.6);
  expect(progressRatio(1)).toBe(1);
  expect(progressRatio(6, 5)).toBe(1);
  expect(progressRatio(-1, 5)).toBe(0);
  expect(progressRatio(3, 0)).toBe(0);
  expect(progressRatio(Number.NaN)).toBe(0);
});
