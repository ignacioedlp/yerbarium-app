import type { ConfigContext, ExpoConfig } from "expo/config";
import { existsSync } from "node:fs";
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Yerbarium",
  slug: config.slug ?? "yerbarium",
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ??
      (existsSync("./google-services.json")
        ? "./google-services.json"
        : undefined),
  },
});
