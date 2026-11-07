import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppState, Platform } from "react-native";
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import { initializeAds } from "./consent";

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
  AppState: { currentState: "active", addEventListener: vi.fn() },
}));
vi.mock("expo-tracking-transparency", () => ({
  getTrackingPermissionsAsync: vi.fn(),
  requestTrackingPermissionsAsync: vi.fn(),
}));

const initialize = vi.fn();
const gatherConsent = vi.fn();
const sdk = {
  default: () => ({ initialize }),
  AdsConsent: { gatherConsent },
} as unknown as Parameters<typeof initializeAds>[0];

describe("advertising consent and ATT", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    Platform.OS = "ios";
    AppState.currentState = "active";
    gatherConsent.mockResolvedValue({ canRequestAds: true });
    vi.mocked(getTrackingPermissionsAsync).mockResolvedValue({
      status: "undetermined",
      granted: false,
      canAskAgain: true,
      expires: "never",
    } as Awaited<ReturnType<typeof getTrackingPermissionsAsync>>);
  });

  it("waits for ATT authorization before initializing the ads SDK", async () => {
    let resolvePermission!: (
      value: Awaited<ReturnType<typeof requestTrackingPermissionsAsync>>,
    ) => void;
    vi.mocked(requestTrackingPermissionsAsync).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePermission = resolve;
        }),
    );
    const pending = initializeAds(sdk, false);
    await vi.waitFor(() =>
      expect(requestTrackingPermissionsAsync).toHaveBeenCalledOnce(),
    );
    expect(initialize).not.toHaveBeenCalled();
    resolvePermission({
      status: "granted",
      granted: true,
      canAskAgain: false,
      expires: "never",
    } as Awaited<ReturnType<typeof requestTrackingPermissionsAsync>>);
    await expect(pending).resolves.toEqual({
      requestNonPersonalizedAdsOnly: false,
    });
    expect(initialize).toHaveBeenCalledOnce();
  });

  it.each(["denied", "undetermined"])(
    "uses non-personalized ads when ATT returns %s",
    async (status) => {
      vi.mocked(requestTrackingPermissionsAsync).mockResolvedValue({
        status,
        granted: false,
      } as Awaited<ReturnType<typeof requestTrackingPermissionsAsync>>);
      await expect(initializeAds(sdk, false)).resolves.toEqual({
        requestNonPersonalizedAdsOnly: true,
      });
      expect(initialize).toHaveBeenCalledOnce();
    },
  );

  it.each([true, false])(
    "does not re-prompt after an existing ATT decision (%s)",
    async (granted) => {
      vi.mocked(getTrackingPermissionsAsync).mockResolvedValue({
        status: granted ? "granted" : "denied",
        granted,
        canAskAgain: false,
      } as Awaited<ReturnType<typeof getTrackingPermissionsAsync>>);
      await expect(initializeAds(sdk, false)).resolves.toEqual({
        requestNonPersonalizedAdsOnly: !granted,
      });
      expect(requestTrackingPermissionsAsync).not.toHaveBeenCalled();
    },
  );

  it("does not initialize ads or ask ATT when UMP disallows requests", async () => {
    gatherConsent.mockResolvedValue({ canRequestAds: false });
    await expect(initializeAds(sdk, false)).resolves.toBeNull();
    expect(getTrackingPermissionsAsync).not.toHaveBeenCalled();
    expect(initialize).not.toHaveBeenCalled();
  });

  it("does not initialize the SDK if the tracking module fails", async () => {
    vi.mocked(getTrackingPermissionsAsync).mockRejectedValue(
      new Error("unavailable"),
    );
    await expect(initializeAds(sdk, false)).rejects.toThrow("unavailable");
    expect(initialize).not.toHaveBeenCalled();
  });

  it("leaves Android's consent flow unchanged", async () => {
    Platform.OS = "android";
    await expect(initializeAds(sdk, false)).resolves.toEqual({});
    expect(gatherConsent).toHaveBeenCalledOnce();
    expect(getTrackingPermissionsAsync).not.toHaveBeenCalled();
    expect(initialize).toHaveBeenCalledOnce();
  });
});
