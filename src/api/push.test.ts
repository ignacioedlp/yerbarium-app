import { beforeEach, expect, it, vi } from "vitest";
import * as notifications from "expo-notifications";
import { write } from "./client";
import { registerPush, unregisterPush } from "./push";
const mock = vi.hoisted(() => ({
  storage: new Map<string, string>(),
  permission: { granted: false, canAskAgain: true },
  uuid: 0,
  events: [] as string[],
}));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(async (key: string) => mock.storage.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    mock.storage.set(key, value);
  }),
  deleteItemAsync: vi.fn(async (key: string) => {
    mock.storage.delete(key);
  }),
}));
vi.mock("expo-crypto", () => ({ randomUUID: () => `uuid-${++mock.uuid}` }));
vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { eas: { projectId: "project" } } } },
}));
vi.mock("expo-notifications", () => ({
  getPermissionsAsync: vi.fn(async () => mock.permission),
  requestPermissionsAsync: vi.fn(async () => ({
    granted: true,
    canAskAgain: true,
  })),
  getExpoPushTokenAsync: vi.fn(async () => ({ data: "ExpoPushToken[test]" })),
}));
vi.mock("./client", () => ({
  apiBaseUrl: "http://test",
  write: vi.fn(async (_: string, method: string) => {
    mock.events.push(method);
  }),
}));
beforeEach(async () => {
  await unregisterPush();
  vi.clearAllMocks();
  mock.events = [];
  mock.storage.clear();
  mock.permission = { granted: false, canAskAgain: true };
  vi.stubGlobal("__DEV__", true);
});
it("never requests system permission during passive registration", async () => {
  await registerPush(1);
  expect(notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  expect(notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
});
it("requests permission only on explicit activation and unregisters before subsequent registration", async () => {
  await registerPush(1, true);
  expect(notifications.requestPermissionsAsync).toHaveBeenCalledOnce();
  const firstBody = vi.mocked(write).mock.calls[0][2] as { binding_id: string };
  const logout = unregisterPush();
  mock.permission = { granted: true, canAskAgain: true };
  const login = registerPush(2);
  await Promise.all([logout, login]);
  expect(mock.events).toEqual(["PUT", "DELETE", "PUT"]);
  const secondBody = vi.mocked(write).mock.calls[2][2] as {
    binding_id: string;
  };
  expect(secondBody.binding_id).not.toBe(firstBody.binding_id);
});
it("does not request permission again if the system blocks prompting", async () => {
  mock.permission = { granted: false, canAskAgain: false };
  await registerPush(1, true);
  expect(notifications.requestPermissionsAsync).not.toHaveBeenCalled();
});
