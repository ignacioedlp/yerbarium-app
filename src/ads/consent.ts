import { AppState, Platform } from "react-native";
import type { RequestOptions } from "react-native-google-mobile-ads";

type AdsSDK = typeof import("react-native-google-mobile-ads");

async function waitUntilActive() {
  if (AppState.currentState === "active") return;
  await new Promise<void>((resolve) => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        subscription.remove();
        resolve();
      }
    });
  });
}

export async function initializeAds(
  sdk: AdsSDK,
  development: boolean,
): Promise<RequestOptions | null> {
  // UMP consent and Apple's tracking authorization are separate requirements.
  if (!development) {
    const consent = await sdk.AdsConsent.gatherConsent();
    if (!consent.canRequestAds) return null;
  }

  const requestOptions: RequestOptions = {};
  if (Platform.OS === "ios") {
    // Load lazily so older clients without the native module can still open.
    const tracking = await import("expo-tracking-transparency");
    await waitUntilActive();
    let permission = await tracking.getTrackingPermissionsAsync();
    if (permission.status === "undetermined" && permission.canAskAgain) {
      permission = await tracking.requestTrackingPermissionsAsync();
    }
    // Denial never blocks the app; ads can still be served without personalization.
    requestOptions.requestNonPersonalizedAdsOnly = !permission.granted;
  }

  await sdk.default().initialize();
  return requestOptions;
}
