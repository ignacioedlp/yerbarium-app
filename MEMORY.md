# Project Environment

Argent environment inspector result (confirmed 2026-10-23):

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
