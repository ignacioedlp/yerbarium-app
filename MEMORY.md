# Project Environment

## App Tracking Transparency (2026-11-06)

`expo-tracking-transparency` is configured with a Spanish purpose string in
`app.config.ts`; the app privacy manifest declares tracking. `src/ads/consent.ts`
waits for production UMP consent, then an active iOS app and ATT resolution before
initializing AdMob. Existing ATT decisions are not re-requested; denied or
undetermined authorization forces non-personalized banner requests. Development
uses test units and exercises ATT while skipping UMP. Initialization is shared
between banners. Native module/permission failures leave ads hidden.

Requires a new native iOS build, not an OTA-only update. Prebuild generated the
permission in Info.plist. Native validation was blocked: `pod install` could not
resolve github.com for Hermes and could not locate cmake. Typecheck, targeted
lint, and eight consent tests passed. App Store Connect privacy answers still
need to be updated separately.

Argent environment inspector result (confirmed 2026-10-26):

```json
{
  "is_react_native": true,
  "is_expo": true,
  "is_native_ios": false,
  "is_native_android": false,
  "has_ios_dir": true,
  "has_android_dir": true,
  "supported_platforms": ["ios", "android"],
  "expo_version": "~57.0.28",
  "react_native_version": "0.86.3",
  "package_manager": "bun",
  "bundle_identifier": "app.yerbarium.mobile",
  "scheme": "yerbarium",
  "startup_commands": {
    "dev_client": "bun run start",
    "ios_dev_client": "bun run dev:ios",
    "android_dev_client": "bun run dev:android"
  },
  "build_commands": { "ios": "bun run ios", "android": "bun run android" },
  "metro_port": 8081,
  "ios_workspace": "Yerbarium.xcworkspace",
  "qa_commands": {
    "typecheck": "bun run typecheck",
    "lint": "bun run lint",
    "unit_tests": "bun run test"
  }
}
```

Metro on 8081 was confirmed connected to this project. Prefer a running device from Argent `list-devices` each session. JavaScript changes use Fast Refresh / debugger reload without a native rebuild.

## Nearby stores

The mobile app uses the existing public Django `POST /api/v1/store-branches/`
endpoint, with coordinates in the request body. Home shows five branches within
25 km; `/tiendas` paginates the same distance-sorted endpoint until outside that
radius. `expo-location` only requests foreground permission after a user action;
position and nearby query data remain in memory. Query keys begin with
`nearby-stores` rather than `public`, excluding them from persisted public data.
Maps use `react-native-maps`: Apple Maps on iOS and Google Maps on Android.
Android builds require `GOOGLE_MAPS_ANDROID_API_KEY` (Maps SDK for Android,
restricted by package/signing certificate). New native modules require rebuilt
clients. No backend migration is required for mobile integration.

## AdMob (2026-11-04)
Environment rechecked with Argent inspector: Expo ~57.0.28 / RN 0.86.3, Bun,
ios + android native directories, Yerbarium.xcworkspace; existing commands above apply.
Installed react-native-google-mobile-ads. Native client rebuild required after prebuild
(sync config plugin) and pod installation. App IDs: ADMOB_IOS_APP_ID / ADMOB_ANDROID_APP_ID;
public banner IDs and enable flag documented in .env.example. Development uses Google
test IDs; release ads remain disabled without explicit enable flag and unit IDs.
Home banner follows featured yerbas; catalog rectangle after every 8 yerbas.
Consent is gathered before SDK initialization; failed/unavailable ads collapse.
