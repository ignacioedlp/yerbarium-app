# Project Environment

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
