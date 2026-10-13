# Yerbarium App

App nativa para iOS y Android, basada en la web de Yerbarium y conectada directamente a su API Django.

## Empezar

Requisitos: Node.js 24 LTS y Bun. Para iOS: Xcode y CocoaPods en macOS. Para Android: Android Studio y un emulador configurado. La app usa `expo-dev-client` para probar los módulos nativos, el ícono y el splash de Yerbarium.

```sh
cd yerbarium-app
bun install --frozen-lockfile
bun run ios
```

La primera ejecución genera el proyecto nativo, instala los pods, compila e instala un development build en el simulador iOS y arranca Metro. Para Android, usá `bun run android`. Esto requiere las herramientas nativas de cada plataforma, pero no una cuenta EAS.

Con el build instalado, para iniciar únicamente Metro y abrir la app:

```sh
bun run dev:ios
# o
bun run dev:android
```

`bun run start` inicia Metro en modo development client sin abrir un dispositivo. Cuando agregues módulos nativos o cambies el ícono, el splash o los config plugins, volvé a ejecutar `bun run ios` o `bun run android` para recompilar. Cambios en TypeScript y pantallas usan Fast Refresh.

El mensaje “No development build (app.yerbarium.mobile) … is installed” significa que se inició Metro antes de compilar/instalar el build. Se resuelve ejecutando `bun run ios` por primera vez.

Para probar explícitamente en Expo Go compatible con SDK 57, usá `bun run start:go`; Expo Go no muestra todos los cambios de branding nativo. En entornos configurados con Argent, usá sus herramientas para seleccionar dispositivos e instalar/abrir apps.

Para Android con Expo Go, instalá una versión compatible con SDK 57 desde https://expo.dev/go, conectá el teléfono a la misma red que la computadora y arrancá Metro con caché limpia:

```sh
bun run start:go --clear
```

Si Metro ya está abierto, detenelo con Ctrl+C antes de ejecutar ese comando y volvé a abrir el proyecto desde Expo Go. Reanimated y Worklets deben coincidir con las versiones incluidas en el SDK (`4.5.1` y `0.10.1` respectivamente); comprobalo con `bunx expo install --check`. No excluyas estas dependencias del chequeo para conservar versiones de un development build anterior: después de cambiarlas, recompilá ese cliente con `bun run ios` o `bun run android`. El cliente iOS compilado con `4.7.1`/`0.13.0` necesita esta recompilación.

La API se inicia desde `../yerba-plataform`:

```sh
docker compose up --build
```

No se necesitan cambios en el backend ni una cuenta EAS para desarrollar. El login usa las mismas cuentas que la web.

## Configurar la API

Sin `.env`, los valores de desarrollo son `http://localhost:8000` en iOS y `http://10.0.2.2:8000` en el emulador Android. Para otro destino, copiá `.env.example` como `.env` y ajustá:

```dotenv
EXPO_PUBLIC_API_URL=https://tu-api.example.com
```

La variable es el **origen de la API**, sin `/api/v1/`. En un teléfono físico usá la IP LAN de tu computadora (por ejemplo `http://192.168.1.10:8000`), escuchando en `0.0.0.0`, o una URL HTTPS accesible. Reiniciá Metro después de cambiar el entorno. Nunca incluyas contraseñas ni claves privadas en variables `EXPO_PUBLIC_*`.

Las URLs de imágenes que devuelve el backend también deben ser accesibles desde el dispositivo. Configurá el origen de media/CDN en el backend; la app conserva las URLs y sus atribuciones.

## Qué incluye

- Inicio, catálogo paginado, marcas, búsqueda con debounce y filtros de marca, estilo, elaboración, tradición y productos discontinuados.
- Fichas con imágenes, ficha técnica, origen, presentaciones, disponibilidad, fuentes y enlaces externos de compra.
- Comparación de dos a cuatro yerbas con diferencias resaltadas y datos sensoriales comunitarios.
- Registro, ingreso, sesión persistente, perfil editable y privacidad; perfiles públicos y sus bibliotecas.
- Biblioteca personal: favoritas, probadas y quiero probar.
- Opiniones: puntuación rápida, comentario opcional, nueve atributos sensoriales, notas de sabor, edición, borrado y estado de moderación.
- Cultura matera y sobre la yerba como artículos nativos con contenido y fuentes de la web.

La búsqueda y los filtros se presentan por separado porque `/search/` solo admite búsqueda textual; `/yerbas/` aplica filtros. Los datos desconocidos se muestran como tales; no se calculan promedios comunitarios en el cliente.

## Arquitectura

`src/app` contiene únicamente rutas y layouts de Expo Router. Las pantallas viven en `src/screens`; componentes compartidos en `src/components`; contratos, HTTP y reglas en `src/api`; consultas en `src/hooks`; sesión, caché y comparación en `src/providers`; tema en `src/theme`.

Axios controla HTTP, timeout de 15 segundos, errores y renovación de credenciales. TanStack Query controla caché, consultas, cancelación, paginación e invalidación. React Hook Form y Zod validan los formularios. `@expo/ui` proporciona pickers y controles nativos de ajustes; los botones de marca usan Pressable con la identidad visual compartida y los catálogos usan FlatList.

El access token queda en memoria. SecureStore conserva solamente el refresh token, separado por origen API. Las solicitudes privadas renuevan el token una sola vez ante un 401, compartiendo una renovación entre solicitudes concurrentes. Un refresh rechazado limpia la sesión y caché privada; una falla de red conserva las credenciales para reintentar. El cierre local elimina credenciales incluso si la revocación remota no está disponible.

Solo las consultas públicas exitosas se persisten en AsyncStorage por 24 horas, separadas por origen API. La biblioteca y los datos privados no se persisten. Sin conexión se puede consultar lo ya guardado y leer los artículos empaquetados; las escrituras requieren conexión. No hay cola de sincronización. Los borradores se conservan en el formulario si una escritura falla.

## Validación

```sh
bun run typecheck
bun run lint
bun run test
bun run format:check
bunx expo-doctor
bun run export:ios
bun run export:android
```

Las pruebas cubren renovación concurrente, rechazo y recuperación de sesión, carreras con logout, persistencia de tokens, headers y cancelación HTTP, aislamiento de caché pública, paginación y exclusión probada/quiero probar.

Ver `QA.md` para resultados y recorridos que requieren la API y dispositivos.

## Assets y contenido

Las fotografías de ambientación y los archivos de Lilita One/Caveat provienen de la web existente. Se conservan sus licencias OFL bajo `assets/fonts`. Nunito Sans se empaqueta con `@expo-google-fonts/nunito-sans`. Las imágenes de productos vienen exclusivamente de la API y muestran sus atribuciones; cuando faltan, se indica “Imagen no disponible”.

Los artículos de `src/content/editorial.json` son una copia local del contenido existente, incluyendo las fuentes. Si cambia la web, actualizar esa copia como parte del mismo cambio editorial. La app no importa código de Next.js durante la ejecución.

La publicación en tiendas, EAS Update, notificaciones y sincronización de escrituras sin conexión requieren un trabajo posterior.

## Diseño de la web en la app

La segunda pasada recupera la identidad editorial de la web: verde profundo, papel crema, Lilita, Nunito Sans y Caveat, collages originales y tarjetas horizontales. El sistema normativo está en `DESIGN.md` y `.impeccable/design.json`. Capturas antes/después y evidencia iOS en `docs/design-pass/`; resultados y límites de validación en `QA.md`. Los cambios de esta pasada son de JavaScript y assets y se reflejan con Fast Refresh en el development build existente.
