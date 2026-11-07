import React, { useEffect, useState } from "react";
import { TurboModuleRegistry, Platform, View } from "react-native";
import { useTheme } from "@/theme";
import { initializeAds } from "@/ads/consent";
import type { RequestOptions } from "react-native-google-mobile-ads";

// Lazy loading keeps older development clients and web usable until rebuilt.
type AdsSDK = typeof import("react-native-google-mobile-ads");
let initialization: Promise<RequestOptions | null> | undefined;
function initialize(sdk: AdsSDK) {
  return (initialization ??= (async () => {
    try {
      return await initializeAds(sdk, __DEV__);
    } catch (error) {
      if (__DEV__) console.warn("[AdMob] No se pudo inicializar", error);
      return null;
    }
  })());
}

export function AdBanner({
  placement = "home",
}: {
  placement?: "home" | "catalog";
}) {
  const t = useTheme();
  const [sdk, setSDK] = useState<AdsSDK>();
  const [requestOptions, setRequestOptions] = useState<RequestOptions>({});
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);
  const configured =
    Platform.OS === "ios"
      ? placement === "home"
        ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID ||
          "ca-app-pub-5417303700723818/3273227603"
        : process.env.EXPO_PUBLIC_ADMOB_IOS_CATALOG_BANNER_ID ||
          "ca-app-pub-5417303700723818/8472537218"
      : placement === "home"
        ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID ||
          "ca-app-pub-5417303700723818/5604486280"
        : process.env.EXPO_PUBLIC_ADMOB_ANDROID_CATALOG_BANNER_ID ||
          "ca-app-pub-5417303700723818/7959186887";
  const enabled = __DEV__ || process.env.EXPO_PUBLIC_ADMOB_ENABLED === "true";
  useEffect(() => {
    let active = true;
    if (__DEV__)
      console.log("[AdMob] Estado", {
        enabled,
        native: !!TurboModuleRegistry.get("RNGoogleMobileAdsModule"),
      });
    if (
      !enabled ||
      Platform.OS === "web" ||
      !TurboModuleRegistry.get("RNGoogleMobileAdsModule")
    )
      return;
    // Load only when the native SDK exists (older clients do not include it).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ads: AdsSDK = require("react-native-google-mobile-ads");
    void initialize(ads).then((options) => {
      if (active && options) {
        setRequestOptions(options);
        setSDK(ads);
      }
    });
    return () => {
      active = false;
    };
  }, [enabled]);
  if (!sdk || failed || (!__DEV__ && !configured)) return null;
  const { BannerAd, BannerAdSize, TestIds } = sdk;
  return (
    <View
      style={{
        overflow: "hidden",
        marginTop: placement === "catalog" ? t.spacing.md : 0,
        borderRadius: t.radius.card,
        alignItems: "center",
      }}
      onLayout={({ nativeEvent }) =>
        setWidth(Math.floor(nativeEvent.layout.width))
      }
    >
      {width > 0 && (
        <BannerAd
          unitId={__DEV__ ? TestIds.BANNER : configured!}
          requestOptions={requestOptions}
          size={BannerAdSize.INLINE_ADAPTIVE_BANNER}
          width={width}
          maxHeight={placement === "home" ? 100 : 250}
          onAdFailedToLoad={(error) => {
            if (__DEV__)
              console.warn(`[AdMob] ${placement}: error al cargar`, error);
            setFailed(true);
          }}
        />
      )}
    </View>
  );
}
