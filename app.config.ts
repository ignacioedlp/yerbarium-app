import type { ConfigContext, ExpoConfig } from "expo/config";
import { existsSync } from "node:fs";
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Yerbarium",
  slug: config.slug ?? "yerbarium",
  ios: { ...config.ios, usesAppleSignIn: true },
  extra: {
    ...config.extra,
    mapsAndroidConfigured: Boolean(process.env.GOOGLE_MAPS_ANDROID_API_KEY),
  },
  plugins: [
    ...(config.plugins ?? []),
    "expo-apple-authentication",
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Yerbarium usa tu ubicación para mostrarte tiendas de yerba mate a menos de 25 km.",
        motionUsagePermission: false,
        locationAlwaysPermission: false,
        locationAlwaysAndWhenInUsePermission: false,
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
        isAndroidForegroundServiceEnabled: false,
      },
    ],
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY ?? "",
      },
    ],
    ...(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
      ? [
          [
            "@react-native-google-signin/google-signin",
            {
              iosUrlScheme: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.split(
                ".",
              )
                .reverse()
                .join("."),
            },
          ] as [string, Record<string, string>],
        ]
      : []),
  ],
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ??
      (existsSync("./google-services.json")
        ? "./google-services.json"
        : undefined),
  },
});
