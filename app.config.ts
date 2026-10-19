import type { ConfigContext, ExpoConfig } from "expo/config";
import { existsSync } from "node:fs";
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Yerbarium",
  slug: config.slug ?? "yerbarium",
  ios: { ...config.ios, usesAppleSignIn: true },
  plugins: [
    ...(config.plugins ?? []),
    "expo-apple-authentication",
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
