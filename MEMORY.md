# Project Environment

- Workspace: `/Users/toxedev/Develop/yerbarium`.
- Mobile app: `yerbarium-app`, Expo SDK 57 / React Native 0.86, TypeScript strict.
- API and web source: sibling `yerba-plataform`, Django/PostgreSQL and Next.js.
- `is_react_native: true`, `is_native_ios: false`, `is_native_android: false` (managed Expo).
- Dependency manager: Bun; commit `bun.lock`.
- Start: `bun run start` (development client); Metro port 8081.
- Compilar e instalar: `bun run ios` / `bun run android` (`expo run:ios/android`).
- Build instalado: `bun run dev:ios` / `bun run dev:android` (Metro + abrir development client).
- Expo Go explícito: `bun run start:go`.
- Expo Go Android: reiniciar Metro con `bun run start:go --clear`; usar Expo Go compatible con SDK 57. Reanimated 4.5.1 / Worklets 0.10.1 alineados con el SDK, sin exclusiones de validación. El development client iOS instalado con 4.7.1 / 0.13.0 requiere recompilar con `bun run ios`.
- API starts from sibling project with `docker compose up --build`, port 8000.
- API origin configured with `EXPO_PUBLIC_API_URL`; iOS default localhost, Android emulator default 10.0.2.2.
- Validation: `bun run typecheck`, `bun run lint`, `bun run test`, `bunx expo-doctor`.
- Argent available. No CodeGraph index.
- Environment inspection ran in this session; do not repeat it.

Environment inspector snapshot (2026-10-13, before dependency correction):

```json
{
  "workspace_path": "/Users/toxedev/Develop/yerbarium/yerbarium-app",
  "is_react_native": true,
  "is_expo": true,
  "is_native_ios": false,
  "is_native_android": false,
  "has_ios_dir": true,
  "has_android_dir": false,
  "supported_platforms": ["ios", "android"],
  "package_manager": "bun",
  "lockfile": "bun.lock",
  "expo": "~57.0.21",
  "react_native": "0.86.3",
  "metro_config": null,
  "babel_config": null,
  "default_metro_port": 8081,
  "port_8081_listener": {
    "process": "node",
    "pid": 28844,
    "metro_identity_verified": false
  },
  "start": "bun run start",
  "start_go": "bun run start:go",
  "build_ios": "bun run ios",
  "build_android": "bun run android",
  "tests": "bun run test",
  "running_targets": [
    {
      "platform": "ios",
      "name": "iPhone 17 Pro",
      "udid": "9D6BF627-7CFD-4103-913A-EDFA79173694",
      "state": "Booted",
      "runtime": "iOS 26.4"
    }
  ],
  "android_devices": [],
  "android_avds": [],
  "argent_available": true
}
```

# Visual conventions

- Toda puntuación de 0 a 5 y toda escala sensorial debe usar las cinco hojas SVG de la web mediante `LeafRating` (`src/components/leaf-rating.tsx`). Relleno progresivo, parcial para decimales; no estrellas ni barras rectangulares para estas escalas. Mantener el nombre y valor en accesibilidad. La selección de notas conserva pasos de 0,5.
