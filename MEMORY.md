## Project Environment

Argent environment inspection, 2026-10-21. Native flags refer to project type; this is an Expo React Native app with generated native projects.

```json
{
  "workspace_path": "/Users/toxedev/Develop/yerbarium/yerbarium-app",
  "is_react_native": true,
  "is_expo": true,
  "is_native_ios": false,
  "is_native_android": false,
  "react_native_version": "0.86.3",
  "expo_version": "~57.0.28",
  "platforms": ["ios", "android"],
  "package_manager": "bun",
  "native_projects": {
    "ios_directory": true,
    "android_directory": true,
    "ios_workspace": "Yerbarium.xcworkspace",
    "ios_podfile": true
  },
  "startup": {
    "development_client": "bun run start",
    "ios_build": "bun run ios",
    "android_build": "bun run android",
    "expo_go": "bun run start:go"
  },
  "metro": {
    "default_port": 8081,
    "custom_metro_config": false
  },
  "checks": {
    "typecheck": "bun run typecheck",
    "lint": "bun run lint",
    "unit_tests": "bun run test"
  },
  "bundle_identifier": "app.yerbarium.mobile",
  "url_scheme": "yerbarium",
  "argent_available": true
}
```
