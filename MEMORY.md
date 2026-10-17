# Project Environment

Environment inspector refreshed 2026-10-13 for the loading skeleton change:

```json
{"is_react_native":true,"is_expo":true,"is_native_ios":false,"is_native_android":false,"expo_version":"~57.0.21","react_native_version":"0.86.3","package_manager":"bun","has_ios_dir":true,"has_android_dir":false,"platforms":["ios","android"],"start_command":"bun run start","ios_command":"bun run ios","android_command":"bun run android","metro_port_default":8081,"bundle_identifier":"app.yerbarium.mobile","recommended_device":{"platform":"ios","udid":"9D6BF627-7CFD-4103-913A-EDFA79173694","name":"iPhone 17 Pro","state":"Booted","runtime":"iOS 26.4"}}
```

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

## Environment inspection — 2026-10-15

```json
{"app_root":"yerbarium-app","backend_root":"../yerba-plataform","is_react_native":true,"is_expo":true,"is_native_ios":false,"is_native_android":false,"platforms":["ios","android"],"expo_version":"~57.0.28","react_native_version":"0.86.3","package_manager":"bun","native_dirs":{"ios":true,"android":true},"app_id":"app.yerbarium.mobile","scheme":"yerbarium","start":"bun run start","build_ios":"bun run ios","build_android":"bun run android","typecheck":"bun run typecheck","lint":"bun run lint","test":"bun run test","exports":["bun run export:ios","bun run export:android"],"metro_port":8081,"argent_available":true,"running_target":{"platform":"ios","name":"iPhone 17 Pro","udid":"9D6BF627-7CFD-4103-913A-EDFA79173694","runtime":"iOS 26.4"}}
```

Inicio consulta `community/rankings/yerbas/?limit=3` como recurso público. El orden lo define la API (puntuación combinada con cantidad de opiniones); no ordenar por promedio en el cliente. `CommunityPodium` muestra 2º–1º–3º y pasa a orden natural vertical con fuente ampliada o pantalla angosta. Guardar/editar una opinión invalida la consulta del ranking.

## Environment inspection — filter controls, 2026-10-15

```json
{"app_root":"yerbarium-app","is_react_native":true,"is_expo":true,"is_native_ios":false,"is_native_android":false,"platforms":["ios","android"],"versions":{"expo":"~57.0.28","react_native":"0.86.3","react":"19.2.3"},"package_manager":"bun","bundle_id":"app.yerbarium.mobile","scheme":"yerbarium","metro_port":8081,"native_projects":{"ios_workspace":"ios/Yerbarium.xcworkspace","ios_podfile":true,"android_gradle":true},"commands":{"start":"bun run start","ios":"bun run ios","android":"bun run android","typecheck":"bun run typecheck","lint":"bun run lint","test":"bun run test","export_ios":"bun run export:ios","export_android":"bun run export:android"},"running_target":"9D6BF627-7CFD-4103-913A-EDFA79173694","android_avds":[]}
```

## Environment inspection — subtitle filters, 2026-10-16

```json
{"app_root":"yerbarium-app","is_react_native":true,"is_expo":true,"is_native_ios":false,"is_native_android":false,"platforms":["ios","android"],"expo":"~57.0.28","react_native":"0.86.3","package_manager":"bun","app_id":"app.yerbarium.mobile","scheme":"yerbarium","metro_port":8081,"native_directories":["ios","android"],"commands":{"start":"bun run start","android":"bun run android","ios":"bun run ios"},"argent_available":true,"android_devices":[],"android_avds":[]}
```

## Environment inspection — brand flag, 2026-10-16

```json
{"is_react_native":true,"is_expo":true,"is_native_ios":false,"is_native_android":false,"platforms":["ios","android"],"versions":{"expo":"~57.0.28","react_native":"0.86.3","react":"19.2.3"},"package_manager":"bun","application_id":"app.yerbarium.mobile","url_scheme":"yerbarium","metro_port_default":8081,"commands":{"metro":"bun run start","ios":"bun run dev:ios","android":"bun run dev:android","typecheck":"bun run typecheck","lint":"bun run lint","test":"bun run test"}}
```

## Environment inspection — follow feature, 2026-10-16

```json
{"is_react_native":true,"is_expo":true,"is_native_ios":false,"is_native_android":false,"platforms":["ios","android"],"expo":"~57.0.28","react_native":"0.86.3","package_manager":"bun","application_id":"app.yerbarium.mobile","scheme":"yerbarium","metro_port":8081,"commands":{"start":"bun run start","ios":"bun run ios","android":"bun run android","typecheck":"bun run typecheck","lint":"bun run lint","test":"bun run test","exports":["bun run export:ios","bun run export:android"]},"argent_available":true}
```
