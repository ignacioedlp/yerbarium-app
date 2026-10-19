import { beforeEach, expect, it, vi } from "vitest";
import { Platform } from "react-native";
import { ApiError, publicApi } from "./client";
import { socialSignIn, type SocialConfig } from "./social-auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Apple from "expo-apple-authentication";

vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("@/i18n", () => ({ tr: (s: string) => s }));
vi.mock("./client", async (original) => ({
  ...(await original<typeof import("./client")>()),
  publicApi: { post: vi.fn() },
}));
vi.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: vi.fn(),
    signOut: vi.fn(),
    signIn: vi.fn(),
    hasPlayServices: vi.fn(),
  },
  isSuccessResponse: (result: { type: string }) => result.type === "success",
}));
vi.mock("expo-apple-authentication", () => ({
  isAvailableAsync: vi.fn(),
  signInAsync: vi.fn(),
  AppleAuthenticationScope: { EMAIL: 0 },
}));
const config: SocialConfig = {
  google: { client_id: "web-client" },
  apple: { client_id: "app.yerbarium.mobile" },
};
beforeEach(() => {
  vi.resetAllMocks();
  Platform.OS = "ios";
  vi.stubEnv("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID", "ios-client");
});
it("exchanges Google identity via the public API without persisting provider tokens", async () => {
  vi.mocked(GoogleSignin.signIn).mockResolvedValue({
    type: "success",
    data: { idToken: "google-token" },
  } as never);
  vi.mocked(publicApi.post).mockResolvedValue({
    data: { access: "access", refresh: "refresh" },
  });
  await expect(socialSignIn("google", config, true)).resolves.toEqual({
    access: "access",
    refresh: "refresh",
  });
  expect(GoogleSignin.configure).toHaveBeenCalledWith({
    webClientId: "web-client",
    iosClientId: "ios-client",
  });
  expect(publicApi.post).toHaveBeenCalledWith("auth/token/social/login/", {
    provider: "google",
    id_token: "google-token",
    newsletter: true,
  });
});
it("does not contact the API when Google is cancelled", async () => {
  vi.mocked(GoogleSignin.signIn).mockResolvedValue({
    type: "cancelled",
    data: null,
  });
  await expect(socialSignIn("google", config)).resolves.toBeNull();
  expect(publicApi.post).not.toHaveBeenCalled();
});
it("checks Play Services on Android", async () => {
  Platform.OS = "android";
  vi.mocked(GoogleSignin.signIn).mockResolvedValue({
    type: "cancelled",
    data: null,
  });
  await socialSignIn("google", config);
  expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
});
it("binds Apple identity to the server challenge and ignores unsigned profile fields", async () => {
  vi.mocked(Apple.isAvailableAsync).mockResolvedValue(true);
  vi.mocked(Apple.signInAsync).mockResolvedValue({
    identityToken: "apple-token",
    email: "untrusted@example.test",
  } as never);
  vi.mocked(publicApi.post)
    .mockResolvedValueOnce({ data: { nonce: "server-challenge" } })
    .mockResolvedValueOnce({ data: { access: "access" } });
  await socialSignIn("apple", config);
  expect(Apple.signInAsync).toHaveBeenCalledWith({
    nonce: "server-challenge",
    requestedScopes: [0],
  });
  expect(publicApi.post).toHaveBeenLastCalledWith("auth/token/social/login/", {
    provider: "apple",
    id_token: "apple-token",
    nonce: "server-challenge",
    newsletter: false,
  });
});
it("returns to login when Apple is cancelled", async () => {
  vi.mocked(Apple.isAvailableAsync).mockResolvedValue(true);
  vi.mocked(publicApi.post).mockResolvedValue({ data: { nonce: "challenge" } });
  vi.mocked(Apple.signInAsync).mockRejectedValue({
    code: "ERR_REQUEST_CANCELED",
  });
  await expect(socialSignIn("apple", config)).resolves.toBeNull();
  expect(publicApi.post).toHaveBeenCalledTimes(1);
});
it("rejects empty tokens and disabled providers before session exchange", async () => {
  vi.mocked(GoogleSignin.signIn).mockResolvedValue({
    type: "success",
    data: { idToken: null },
  } as never);
  await expect(socialSignIn("google", config)).rejects.toThrow();
  await expect(
    socialSignIn("google", { ...config, google: null }),
  ).rejects.toThrow();
  expect(publicApi.post).not.toHaveBeenCalled();
});

it("keeps a pending identity in memory and confirms linking without reopening the provider", async () => {
  vi.mocked(GoogleSignin.signIn).mockResolvedValue({
    type: "success",
    data: { idToken: "google-token" },
  } as never);
  vi.mocked(publicApi.post)
    .mockRejectedValueOnce(
      new ApiError("Confirm password", 409, {
        code: ["account_link_required"],
      }),
    )
    .mockRejectedValueOnce(new ApiError("Wrong password", 403))
    .mockResolvedValueOnce({
      data: {
        user: { id: 7 },
        access: "access",
        refresh: "refresh",
        created: false,
      },
    });
  const pending = await socialSignIn("google", config);
  expect(pending).toHaveProperty("kind", "link_required");
  if (!pending || !("kind" in pending))
    throw new Error("Expected linking challenge");
  await expect(pending.complete("wrong-password")).rejects.toThrow(
    "Wrong password",
  );
  await expect(pending.complete("correct-password")).resolves.toMatchObject({
    user: { id: 7 },
    created: false,
  });
  expect(GoogleSignin.signIn).toHaveBeenCalledTimes(1);
  expect(publicApi.post).toHaveBeenLastCalledWith("auth/token/social/login/", {
    provider: "google",
    id_token: "google-token",
    newsletter: false,
    link_password: "correct-password",
  });
  expect(JSON.stringify(pending)).not.toContain("google-token");
});

it("translates native Apple errors instead of exposing exception names and source paths", async () => {
  vi.mocked(Apple.isAvailableAsync).mockResolvedValue(true);
  vi.mocked(publicApi.post).mockResolvedValue({ data: { nonce: "challenge" } });
  vi.mocked(Apple.signInAsync).mockRejectedValue(
    Object.assign(
      new Error(
        "RequestUnknownException at AppleAuthenticationExceptions.swift:61",
      ),
      { code: "ERR_REQUEST_UNKNOWN" },
    ),
  );
  await expect(socialSignIn("apple", config)).rejects.toThrow(
    "No pudimos iniciar sesión con Apple. Volvé a intentar.",
  );
  expect(publicApi.post).toHaveBeenCalledTimes(1);
});

it("preserves API failures while requesting an Apple challenge", async () => {
  vi.mocked(Apple.isAvailableAsync).mockResolvedValue(true);
  const failure = new ApiError("Proveedor no disponible", 503);
  vi.mocked(publicApi.post).mockRejectedValue(failure);
  await expect(socialSignIn("apple", config)).rejects.toBe(failure);
  expect(Apple.signInAsync).not.toHaveBeenCalled();
});
