# Validación de Yerbarium App

## 2026-10-13 — Estilos de yerba en la guía editorial

- La guía “Sobre la yerba” describe Tradicional, Suave, Barbacuá, Orgánica, Compuesta, Saborizada, Tereré y Chimarrão. Cada estilo abre Explorar filtrado por su categoría, y se agregaron referencias institucionales y normativas.
- Pasaron `bun run typecheck` y la validación de `src/content/editorial.json`. `bun run lint` terminó sin errores y con un aviso preexistente en `src/screens/home.tsx:37` (`moveCarousel` sin uso).
- La vista no se comprobó en simulador porque Argent no está disponible en este entorno. Presentación y navegación en iOS/Android pendientes de revisión visual.

## 2026-10-13 — Configuración de privacidad y manifiesto Android

- `app.json` declara los datos enviados para funciones de cuenta/perfil y actividad/analítica en `ios.privacyManifests`; el manifiesto se genera al hacer prebuild. También conserva los motivos de APIs requeridas que ya tenía el Privacy Manifest nativo.
- `expo-build-properties` fija `android.targetSdkVersion` en 36. La configuración bloquea almacenamiento externo heredado, `SYSTEM_ALERT_WINDOW` y `VIBRATE`; deja `INTERNET`, necesario para API y analítica.
- Pasaron prebuild limpios de iOS y Android. `plutil -lint ios/Yerbarium/PrivacyInfo.xcprivacy` pasó. El manifiesto Android generado contiene solo `INTERNET` como permiso activo y directivas `tools:node="remove"` para los cuatro permisos bloqueados; `android/gradle.properties` fija `android.targetSdkVersion=36`.
- No se pudo ejecutar el merge de manifiestos Gradle ni comprobar el manifiesto del AAB: falta un Java Runtime en este entorno. Repetir `./gradlew :app:processReleaseMainManifest` y revisar el reporte/manifiesto del AAB antes de subir.

## 2026-10-13 — Hojas y selección de pestañas en Android

- `LeafRating` usa el ícono nativo Material Community Icons en Android, con relleno parcial por recorte; iOS conserva las hojas SVG. Esto evita depender del renderizado Android de SVG embebido como URI de imagen.
- Las pestañas nativas fijan el indicador activo y el ripple al verde seleccionado del tema (`#d0e3b8`), evitando el azul dinámico de Material You.
- Pasan `bun run typecheck`, `bun run lint` (con avisos preexistentes) y `bun run export:android`. Argent no encuentra emulador Android ni AVD; la apariencia en dispositivo queda pendiente de verificación visual.

## 2026-10-13 — Acciones visibles en sheets de autenticación

- Ingresar y registro conservan sus campos y errores en un área desplazable. Los botones y el cambio entre formularios ahora ocupan un footer fijo con su propio inset inferior; quedan visibles al abrir el sheet en cualquiera de sus detents parciales.
- Tras el reporte de que persistía el problema, ajusté también el detent inicial Android a 0.92 (con expansión hasta 1.0); iOS conserva 0.68/0.8. El primer detent anterior era demasiado bajo para alojar las acciones del footer dentro de la ventana nativa.
- Revisiones pendientes en Android físico/emulador; el entorno no tiene AVD disponible.

## 2026-10-13 — Compatibilidad con Expo Go Android

- Se detectó Reanimated 4.7.1 / Worklets 0.13.0, versiones conservadas para el development client iOS instalado y excluidas de la validación del SDK. Expo SDK 57 incluye Reanimated 4.5.1 / Worklets 0.10.1: Expo Go necesita esas versiones nativas y JavaScript coincidentes.
- Instaladas las versiones del SDK con `bunx expo install react-native-reanimated react-native-worklets --bun`; actualizado bun.lock y retirado expo.install.exclude. Las rutas revisadas sí tienen export default; el desajuste de módulos compartidos es la causa probable de los avisos en cadena, pendiente de confirmar en el teléfono Android del usuario.
- Pasaron TypeScript, 15 pruebas y exportaciones Hermes de Android (con caché limpia) e iOS. Lint terminó sin errores, con un aviso existente por Alert sin usar en src/screens/account.tsx.
- Expo Doctor: 20/21 checks. El único fallo corresponde a parches pendientes dentro del SDK 57: @expo/ui 57.0.22 → ~57.0.23, expo 57.0.27 → ~57.0.28, expo-dev-client 57.0.19 → ~57.0.20, expo-router 57.0.25 → ~57.0.26 y expo-splash-screen 57.0.9 → ~57.0.10. Sin actualización adicional del SDK o sus otros módulos en esta corrección.
- Argent no encuentra dispositivo ni AVD Android. No se verificó arranque en Expo Go ni recorrido visual. Reiniciar el Metro existente con `bun run start:go --clear` y abrir el proyecto en Expo Go compatible con SDK 57.
- ios/Podfile.lock y el cliente iOS instalado todavía usan 4.7.1 / 0.13.0: ejecutar `bun run ios` para recompilar antes de volver a probar en ese development client. No se reconstruyó ni modificó el cliente instalado durante esta corrección.

## Header de ficha — 2026-10-10

- Header compartido con safe area real, fila flexible y botón de volver de 44 puntos. Se elimina el posicionamiento absoluto que ubicaba el título detrás de la isla dinámica.
- La ficha muestra «Ficha de yerba» en navegación y conserva nombre/marca completos en el hero.
- Comprobación visual en iPhone 17 Pro iOS 26.4: título visible bajo la isla dinámica y alineado con Volver. Captura: `docs/design-pass/detail-header-safe-area.png`.
- Pasan TypeScript, ESLint, 15 tests y exportaciones iOS/Android. Detector sin hallazgos.
- Android (sin AVD), landscape, tablet y texto grande quedan pendientes de comprobación visual. Esta pasada no ejecutó el botón Volver.

Fecha: 8 de octubre de 2026.

## Comprobaciones ejecutadas

| Comprobación                                                            | Resultado                                 |
| ----------------------------------------------------------------------- | ----------------------------------------- |
| TypeScript estricto                                                     | Pasa                                      |
| ESLint                                                                  | Pasa, sin errores ni advertencias         |
| Pruebas automatizadas                                                   | 15 pruebas pasan en 4 archivos            |
| Exportación Hermes para iOS                                             | Pasa                                      |
| Exportación Hermes para Android                                         | Pasa                                      |
| Configuración nativa / config plugins (`expo config --type introspect`) | Pasa                                      |
| Expo Doctor                                                             | Pasa: 21/21 comprobaciones, sin problemas |

Las pruebas cubren rotación concurrente, 401 tardío de un token anterior, límite de un reintento HTTP, credenciales conservadas tras fallos de red, carreras entre almacenamiento y logout, exclusión de estados de biblioteca, paginación por origen configurado, caducidad de caché pública y valores técnicos desconocidos/cero.

La exportación genera bundles JavaScript/Hermes y assets. No equivale a construir un IPA/APK ni a verificar los recorridos en dispositivos.

## Limitaciones del entorno

- Argent encontró un iPhone 17 Pro iniciado. Expo Go se abrió mediante Argent y rechazó el proyecto por incompatibilidad con SDK 57. No se reinstaló Expo Go ni se borraron sus datos.
- No hay emulador Android ni AVD configurado en este entorno.
- El acceso al socket de Docker fue denegado por el sandbox. La API local no estaba disponible para los recorridos completos.
- La primera ejecución de Expo Doctor encontró dos versiones de `react-native-screens`. Se resolvió con una única versión compatible, un override explícito y una reinstalación de dependencias. La última ejecución pasó las 21 comprobaciones, incluidas las remotas.
- Las verificaciones remotas de Expo Doctor pueden fallar con `ENOTFOUND exp.host` o errores de React Native Directory por restricciones de red.

## Recorridos pendientes en iOS y Android

Usar Expo Go con soporte para SDK 57 y una API de desarrollo accesible. Para recorridos de escritura, usar una cuenta de pruebas y datos de desarrollo.

1. Abrir Inicio; explorar estilos, marcas y yerbas; paginar y actualizar. Buscar un nombre con tildes, probar una consulta sin resultados y limpiar los filtros.
2. Abrir una ficha; comprobar textos largos, imágenes ausentes y URL de imagen fallida, estadísticas sin opiniones, fuentes, disponibilidad y navegación de vuelta.
3. Seleccionar 2, 3 y 4 yerbas; verificar diferencias, desplazamiento horizontal y el rechazo de una quinta selección.
4. Registrarse, cerrar sesión e ingresar con usuario/email. Reabrir la app con sesión guardada y comprobar un refresh expirado y un fallo de red durante la restauración.
5. Guardar una favorita, marcar probada y cambiar a quiero probar; confirmar exclusión y actualización de resumen/listados. Cerrar sesión y verificar que los datos privados desaparezcan.
6. Editar perfil y privacidad; verificar un perfil privado desde otra cuenta y uno público desde una opinión.
7. Publicar una puntuación rápida, editar comentario/sensorial/notas y borrar. Forzar una respuesta de error en desarrollo: el borrador debe conservarse y un reintento debe guardar una sola vez.
8. Consultar catálogo/fichas con conexión, reiniciar sin conexión y verificar datos guardados y artículos. Confirmar que las escrituras estén deshabilitadas y se recuperen al reconectar.
9. Probar tamaño de texto grande, VoiceOver/TalkBack, teclado en formularios, orientación y volver/cancelar. Ningún botón principal debe quedar inaccesible.

No se presenta ningún recorrido pendiente como aprobado.

## Segunda pasada visual

La app recupera la identidad editorial de la web: verde profundo, papel crema, títulos Lilita en mayúsculas, acentos lima, anotaciones Caveat y collages originales. Capturas en `docs/design-pass/`.

En esta sesión el usuario ya había instalado el development build. Se verificaron en el iPhone 17 Pro Inicio, catálogo, perfil sin sesión, ingreso y una ficha de catálogo. El buscador vacío enfoca el campo y abre el teclado; tocar fuera lo cierra. No se modificaron datos comunitarios ni credenciales.

La revisión independiente de las tres correcciones visuales dio `ship` para las cuatro superficies capturadas. El recorrido `.argent/flows/editorial-design-pass.yaml` pasó seis pasos de inicio/catálogo. Sus dos checks de idle informaron movimiento residual pequeño; se comprobaron visualmente las pantallas y las identidades de destino. No se usa esa advertencia como prueba de carga de datos completada.

TypeScript, ESLint, las 15 pruebas y los bundles Hermes iOS/Android pasan después de los cambios. El detector de diseño no informó hallazgos. Android queda pendiente de comprobación visual porque no hay AVD disponible. No se verificaron en esta pasada los flujos de escritura autenticados ni todos los estados de accesibilidad/texto grande.

## Home alineada con la web — 2026-10-09

- Portada compacta con titular en tres líneas según ancho disponible, collage completo antes de la descripción y búsqueda. Logo compartido con lettering Lilita. Accesos con feedback de presión y una columna para texto grande o pantallas estrechas.
- Verificación visual en development build del iPhone 17 Pro iOS 26.4: home sin recorte del mate ni superposición de texto; búsqueda abre Explorar en modo Búsqueda y la pestaña Inicio permite regresar. Captura: `docs/design-pass/home-web-native.png`.
- Pasan typecheck, lint, 15 tests y exportaciones Hermes iOS/Android. Android, tablet y Dynamic Type quedan pendientes de revisión visual.
- Web hermana: se reemplazó la imagen mobile al 25% de opacidad por un collage completo en una fila propia. Pasan typecheck, lint, 181 tests, build de producción y detector de diseño sin hallazgos. La revisión visual en navegador está pendiente: el sandbox denegó abrir el puerto 3000 (`listen EPERM`). No se publicó el cambio.

## Simplificación nativa y tarjetas del catálogo — 2026-10-09

- Se retiró la cabecera de Yerbarium en las cuatro pestañas. Safe areas explícitas para Inicio, Explorar, Biblioteca y Perfil; stacks secundarios conservan sus cabeceras y navegación de vuelta.
- Inicio: título corto y mate pequeño, búsqueda, estilos, cuatro yerbas y un acceso editorial. Se retiraron el hero de landing, accesos duplicados de pestañas, secciones promocionales y footer. Explorar tiene título simple, búsqueda directa y selector nativo de Yerbas/Marcas (SwiftUI en iOS, Compose en Android). Biblioteca, Perfil, Ingresar y Registro ya no incluyen heroes promocionales.
- Tarjetas compartidas: fondo/borde, composición botánica a opacidad completa, chip de estilo y banderas SVG originales de la web. Sin panel salvia ni franja inferior. Corazón de favoritas conectado a PATCH de biblioteca con estado pendiente, control de conexión, error y protección al cambiar de sesión. Comparación en diálogo nativo mediante pulsación larga.
- iPhone 17 Pro iOS 26.4: se comprobaron home, catálogo, teclado/dismiss, selector nativo, perfil sin sesión, apertura de ingreso desde favoritas y pulsación larga/agregado a comparación. Capturas: `docs/design-pass/home-native.png`, `catalog-native.png`, `profile-native.png`.
- Pasan TypeScript, lint sin warnings, 15 tests y exportaciones Hermes iOS/Android. Detector sin hallazgos.
- Los productos DEV locales carecen de fotos; se verificó el placeholder explícito y no se sustituyeron con packs inventados. No se verificó el guardado autenticado de favoritas, el producto con foto real, Dynamic Type, tablet ni el comportamiento visual en Android (sin AVD).

## Ficha de yerba compacta — 2026-10-10

- Se revisó visualmente la ficha web local de `dev-amanda-sample` y su organización por pestañas. La app conserva el fondo crema elegido por el usuario.
- Resumen con nombre, acceso a marca, valoración, origen/tradición/estilo y acciones de biblioteca/comparación. Galería horizontal de imágenes reales; créditos y licencias en Fuentes. Se retiraron las tarjetas y el texto decorativo del detalle.
- Cuatro pestañas: Ficha (descripción, presentaciones, disponibilidad y compra), Perfil (datos técnicos y perfil comunitario), Opiniones y Fuentes. Solo se muestran dos opiniones inicialmente; Más opiniones conserva la paginación. Evaluación sensorial individual bajo demanda; se evita duplicar la propia opinión pública.
- Se verificó la presentación sin sesión y sin imágenes en iPhone 17 Pro iOS 26.4. Los handlers de Opiniones, Perfil y Fuentes se ejecutaron mediante el depurador y se comprobaron sus contenidos renderizados. La capa flotante de Expo Dev Menu se ocultó en el simulador después de que el hit-test la identificara como receptora de los toques.
- La automatización de toques de Argent no activó los controles, incluso tras ocultar esa capa. No se presenta como aprobado el recorrido por toques, la vuelta ni el guardado autenticado. Quedan pendientes la galería con fotos reales, errores/reintentos de API, texto grande, VoiceOver, tablet y revisión visual Android.
- Pasan TypeScript, ESLint, las 15 pruebas existentes y las exportaciones Hermes iOS/Android. Captura: `docs/design-pass/detail-compact.png`.

### Composición de imagen recuperada

Se restauró el collage botánico original detrás de la foto del envase, a opacidad completa y dentro de una galería horizontal de 240 puntos de alto. El collage también aparece cuando falta la foto del producto, con una indicación explícita. Se mantienen las pestañas y las filas compactas. Verificado visualmente en iPhone 17 Pro tras recargar Metro; TypeScript y ESLint pasan. La foto real del envase sigue pendiente por falta de imágenes en los productos DEV.

## Explorar: grilla de marcas y selector estable — 2026-10-10

- Marcas usa una grilla de dos columnas sin tarjetas: logo real y nombre; toda la celda abre la ficha. Las marcas sin imagen o con error de carga muestran su inicial. Se mantienen paginación, errores y actualización por pull-to-refresh.
- Cabecera, búsqueda y selector nativo fuera de las listas; título Explorar estable. Ambas listas permanecen montadas y solo se muestra la seleccionada, evitando recrear el selector y conservando el estado/scroll. El contenido oculto se excluye de accesibilidad. Sin animación de desplazamiento entre pestañas pares.
- Se comprobó en iPhone 17 Pro la grilla con cinco marcas (cantidad impar), un logo real y respaldos sin logo. El cambio Yerbas/Marcas mediante el handler mantiene iguales las posiciones de la cabecera y el selector. El handler de Development Lab abre su ficha y se confirmó el contenido de destino.
- Los toques automatizados de Argent siguen sin activar controles; estas verificaciones de cambio y navegación se realizaron ejecutando los handlers desde el depurador. No se verificó por toques ni se midió fluidez en un build release/dispositivo lento. Android y texto grande pendientes.
- TypeScript, ESLint, 15 pruebas y exportaciones Hermes iOS/Android pasan. Captura: docs/design-pass/brands-grid.png.

## Escalas con hojas SVG — 2026-10-11

- Componente compartido LeafRating con la silueta SVG y el relleno parcial de la web. Se usa en catálogo, ficha, perfil comunitario, opiniones individuales, comparación y formulario de opinión/sensorial. Se eliminaron estrellas y barras sensoriales. La nota de la opinión mantiene incrementos de medio punto; No evaluar conserva el valor null de los atributos.
- Corrección del renderizador SVG nativo: una máscara de ancho cero podía dejar una hoja vacía rellena. Ahora no se incluye el path relleno cuando la fracción vale cero. Hojas de izquierda a derecha; cifras con ancho fijo y un decimal para mantener la alineación.
- Verificado visualmente en iPhone 17 Pro: nota 3,5 (tres hojas, media y una vacía) y perfil comunitario con 2,0, 1,25 y 3,0. Escalas y cifras alineadas; captura docs/design-pass/leaf-ratings.png. El perfil y el scroll se activaron mediante el depurador por la limitación de toques automatizados ya documentada.
- TypeScript, ESLint, 15 tests existentes y bundles Hermes iOS/Android pasan. No se verificó el guardado autenticado de la opinión ni el formulario por toques, ni accesibilidad/texto grande y Android visual.

## Favorita junto al título — 2026-10-11

- Corazón junto al nombre de la yerba con estado seleccionado, carga y deshabilitado durante escritura o lectura de biblioteca. Sin sesión abre Ingresar. Con sesión usa el PATCH existente de biblioteca; refleja la respuesta en la caché y actualiza biblioteca/resumen. Se descarta la respuesta si cambió la cuenta activa.
- Retirados Ingresar y guardar y los controles de comparación de la ficha. Se conserva comparación desde catálogo. Se retiró el botón Favorita duplicado de la fila de biblioteca; Probada y Quiero probar siguen disponibles.
- Verificado visualmente en iPhone 17 Pro y mediante handler: el corazón sin sesión abre el formulario de ingreso. La ficha no muestra los botones retirados. Captura actualizada: docs/design-pass/detail-compact.png.
- Pasan TypeScript, ESLint, 15 pruebas existentes y exportaciones Hermes iOS/Android. Guardado autenticado, fallo/reintento de escritura, cambio de cuenta durante petición y prueba por toques siguen pendientes.

## Enlaces editoriales en filas — 2026-10-11

- Sobre la yerba y Cultura matera comparten EditorialSourceLink: nombre, editor y nota dentro de una fila completa, con flecha discreta y divisor inferior. Se retiró el botón independiente de cada fuente. La fila tiene rol de enlace y usa openExternal, conservando el error y el reintento.
- Ambas listas revisadas visualmente y con el árbol de accesibilidad en iPhone 17 Pro. No hay botones de fuentes; cada bloque se expone como un único enlace. Capturas: docs/design-pass/culture-source-rows.png y about-source-rows.png. El desplazamiento se hizo desde el depurador; la apertura externa por toques no se verificó.
- Pasan TypeScript, ESLint, 15 pruebas y exportaciones Hermes iOS/Android. Android visual y texto grande pendientes.

## Edición de ingreso y registro — 2026-10-11

- Los cinco campos de ingreso/registro dejan el buffer de edición en el TextInput nativo (defaultValue constante); React Hook Form recibe el texto mediante onChangeText y conserva validación, errores y envío. Field ahora acepta inputRef para que Controller pueda enfocar el campo inválido.
- Antes del cambio se observó un único carácter en el valor controlado, con foco y la misma instancia nativa. Tras el cambio se verificaron valores largos en el buffer nativo y en el modelo RHF: 14 caracteres en usuario/contraseña de ingreso, 14 en usuario/contraseña de registro y 18 en email. Solo datos ficticios; no se enviaron los formularios.
- La inyección de teclado de Argent no produjo entradas de forma fiable. La comprobación de valores completos se hizo aplicando texto nativo y sus eventos onChange con el depurador; no constituye una prueba de escritura física. Teclado real, autofill, borrado/pegado, validación con foco y Android visual pendientes. Capturas: docs/design-pass/login-inputs.png y registration-inputs.png.
- TypeScript, ESLint, 15 pruebas y exportaciones Hermes iOS/Android pasan.

## Header solo en ficha de yerba — 2026-10-11

- El stack oculta el header por defecto y lo activa explícitamente solo en yerbas/[slug]. La visibilidad ya no depende del título; títulos dinámicos de las otras rutas no activan cabecera.
- Se añadieron safe areas superiores a las pantallas secundarias sin header, incluidos ingreso/registro, marca, comparación, editoriales, opinión, edición/perfil público y fallback.
- Verificado visualmente Ingresar sin header, con contenido bajo la barra de estado. La cabecera Ficha de yerba se detectó en accesibilidad al abrir su ruta, aunque el modal de ingreso permaneció al frente; no se presenta como una captura visual de la ficha en esta pasada.
- TypeScript, ESLint, 15 pruebas y exportaciones Hermes iOS/Android pasan. Android visual pendiente.

## Transición entre tabs de ficha — 2026-10-11

- Ficha/Perfil/Opiniones/Fuentes comparten un indicador inferior que se desplaza en 200 ms y un panel con fundido de entrada de 140 ms. Solo transform y opacidad se animan en el hilo UI; la altura sigue al contenido. Las tabs mantienen sus roles, etiquetas y estado seleccionado. Reduce Motion elimina el desplazamiento y el fundido; la línea usa el ancho medido, sin fijar dimensiones de pantalla.
- Reanimated 4.7.1 y Worklets 0.13.0 coinciden con las versiones ya compiladas en ios/Podfile.lock y el cliente instalado. Expo sugiere 4.5.1/0.10.1 por defecto; se conservaron las versiones nativas existentes para evitar desajustes. Se reinició Metro con caché limpia. El intento de reconstrucción se canceló durante la instalación de Pods; no se presenta como una compilación nativa nueva.
- Verificado en iPhone 17 Pro mediante el handler de Perfil en el depurador: contenido técnico visible, captura durante el desplazamiento y captura estable con indicador alineado. Sin errores ni warnings en el registro nuevo. El toque de Argent no activó la tab, una limitación ya documentada; prueba física, cambios rápidos, Reduce Motion real, texto grande, Android visual y fluidez release pendientes.
- Pasan TypeScript, ESLint, las 15 pruebas existentes y exportaciones Hermes iOS/Android.

## Tabs animadas en perfil público y biblioteca — 2026-10-11

- Reemplacé los botones de colecciones en ambas pantallas por `AnimatedTabs`, reutilizado también en la ficha. La barra comparte accesibilidad, indicador de 200 ms, colores de estado y respeto por Reduce Motion; el contenido entra con el fundido de 140 ms. Cada tab sigue consultando su colección correspondiente.
- En iPhone 17 Pro comprobé Mi biblioteca: Favoritas muestra dos yerbas; al seleccionar Probadas el indicador se desplaza y queda bajo la segunda tab y la lista pasa a una yerba. El toque automatizado de Argent informó éxito sin cambiar la selección; la activación se verificó desde el handler React en el depurador. Perfil público no comprobado visualmente en esta sesión.
- Pasan TypeScript, ESLint, 15 pruebas existentes y exportaciones Hermes iOS/Android. No se hizo una nueva compilación nativa.

## Conteos en tabs de colecciones — 2026-10-11

- Los conteos se muestran al lado de Favoritas, Probadas y Quiero probar, y se retiró la línea superior que repetía los tres totales. Se mantienen en ambos contextos: perfil público y Mi biblioteca. Los controles accesibles anuncian la etiqueta y el conteo; mientras carga el resumen, la etiqueta aparece sin un cero temporal.
- Comprobado en la biblioteca del iPhone 17 Pro: “Favoritas 2”, “Probadas 1” y “Quiero probar 0”, en una sola línea y sin el resumen redundante. El perfil público no tiene datos públicos en la cuenta de desarrollo usada para la verificación; allí se aplicó la misma barra compartida.
- Pasan TypeScript, ESLint, las 15 pruebas existentes y exportaciones Hermes iOS/Android.

## Espaciado entre yerbas en biblioteca y perfil público — 2026-10-11

- Las listas de ambas pantallas agrupan las `YerbaCard` con un `gap` vertical de `theme.spacing.md` (16 pt), para separarlas sin alterar las tarjetas ni el orden.
- Verificado visualmente en Mi biblioteca en iPhone 17 Pro: separación uniforme entre las dos yerbas. Perfil público comparte el mismo contenedor y espaciado; sin datos públicos disponibles para comprobar esa pantalla con la cuenta de desarrollo.
- Pasan TypeScript, ESLint, las 15 pruebas existentes y exportaciones Hermes iOS/Android.

## Selector Yerbas / Marcas como tabs — 2026-10-11

- Reemplacé el Picker nativo de `CatalogMode` por `AnimatedTabs`, manteniendo las etiquetas, el estado seleccionado y la lógica existente de las listas montadas.
- Pasan TypeScript, ESLint, las 15 pruebas y las exportaciones Hermes iOS/Android. El simulador siguió mostrando el bundle anterior tras recargar; falta reiniciar Metro para comprobar la apariencia actualizada.

## Rutas Expo y compatibilidad Android — 2026-10-11

- Las rutas de biblioteca, perfil público y ficha de yerba exportan ahora componentes de ruta explícitos. La exportación Android dejó de informar que faltaba el `default export` en esas rutas.
- Restauré Reanimated 4.7.1 y Worklets 0.13.0, que coinciden con las versiones compiladas en el cliente nativo instalado. El cliente avisaba del desajuste C++ 0.13.0/JavaScript 0.10.1 después de la actualización previa. Se excluyen estas dos dependencias de la validación automática del SDK porque el cliente instalado requiere esas versiones.
- Tras recargar, el registro JS del simulador iOS quedó sin errores ni avisos de Worklets. Las exportaciones Hermes Android/iOS no muestran avisos de exportación de rutas; pasan typecheck, ESLint, 15 pruebas y Expo Doctor (21/21).
- No se pudo probar el runtime Android en este entorno: no tiene Android SDK, `adb` ni emulador. La exportación JS Android pasa; la verificación de ejecución en un cliente Android sigue pendiente.

## 2026-10-11 — Hero de Inicio y buscadores

- Hero: mismo asset de mate y paisaje, con imagen en el flujo del layout y titular de tres líneas; “yerba” en lima.
- SearchBox compartido: cápsula crema con borde oliva y acción verde de 44 pt; foco verde en Explorar, controles accesibles y selección de texto verde.
- Verificado visualmente en iPhone 17 Pro / iOS 26.4: Inicio y Explorar con teclado abierto mediante deep link.
- Pasaron typecheck, lint, 15 tests y exportaciones iOS/Android. Detector de diseño sin hallazgos.
- Limitación: Argent informó tap y escritura exitosos, pero la pantalla no reflejó navegación por tap ni texto ingresado; no se pudo confirmar el recorrido completo de búsqueda mediante esas acciones. Android, tablet y texto ampliado no se verificaron en dispositivo.

### Ajuste posterior — hero compacto

- Tarjeta verde reducida de 192 a 128 pt de altura mínima; imagen de 160 pt anclada al pie, sobresaliendo 32 pt por arriba. Contenedor externo con margen superior de 16 pt y texto con espacio reservado para el collage.
- Confirmación visual en iPhone 17 Pro / iOS 26.4: collage sobresale por arriba, sin recorte superior ni superposición con el título; buscador conserva el diseño anterior.
- Sin prueba visual nueva en Android, tablet o fuente ampliada.

## 2026-10-11 — Filtros, fuentes y selección

- Filtros de Explorar en BottomSheet nativo de @expo/ui: papel, cabecera con cierre, selectores nativos, contenido desplazable y acciones al pie.
- Borrador aislado: cerrar descarta cambios; Aplicar transfiere la selección al catálogo; Limpiar restablece todas las opciones del borrador, incluido estilo.
- Fuentes de ficha reutilizan EditorialSourceLink de Cultura, con título, editorial, consulta y enlace.
- Token global selected: #d0e3b8 para No evaluar, notas percibidas y demás botones seleccionados.
- iOS 26.4 / iPhone 17 Pro: sheet verificado visualmente. Se comprobó mediante callbacks del runtime que cerrar descarta país AR y aplicar lo transfiere al estado del catálogo. La automatización táctil de Argent seguía informando éxito sin efecto visible, por lo que no se considera un recorrido táctil completo.
- Evaluación sensorial verificada visualmente en iOS; se seleccionó una nota solo en el borrador, sin publicar ni guardar una opinión.
- Typecheck, lint sin avisos, 15 tests y exportación iOS/Android pasaron. Sin verificación en dispositivo Android, tablet o fuente ampliada.

## 2026-10-11 — Tarjetas de biblioteca y perfil público

- Ambas colecciones reutilizan YerbaCard mediante LibraryYerbaCard, sin duplicar su composición o sus acciones.
- La API de biblioteca devuelve un resumen sin stats, styles ni país. La app completa esos campos desde la ficha pública con TanStack Query y reutiliza datos del catálogo/ficha ya almacenados en caché. La tarjeta básica permanece visible mientras carga y ante falta de conexión; error sin datos completos ofrece reintento.
- El tipo de biblioteca acepta los datos completos si la API los incorpora, y en ese caso no solicita enriquecimiento.
- Verificado visualmente en Biblioteca de iPhone 17 Pro/iOS 26.4: Amanda con valoración y estilo; Andresito con estilo y bandera. Se conservan corazones y navegación a la ficha.
- Perfil público usa el mismo componente. La cuenta disponible es privada y el usuario de prueba no existe; no se verificó una colección pública con datos en dispositivo. No se alteró la privacidad ni se publicaron datos para realizar QA.
- Pasaron typecheck, lint, 15 tests y exportaciones iOS/Android. Sin prueba visual Android, tablet o red offline en esta pasada.

## 2026-10-11 — Espacio debajo del header

- Perfil público, Marca, Cultura, Sobre la yerba y Editar perfil ya no solicitan safeTop a Page: AppHeader contempla la zona segura superior y el stack coloca el contenido debajo.
- Se mantienen los márgenes editoriales normales (16 pt en hero compacto, 24 pt en artículos/formulario), sin sumar nuevamente el inset superior del dispositivo.
- Verificado visualmente en las cinco pantallas en iPhone 17 Pro / iOS 26.4. Sin edición ni guardado de datos de perfil.
- Pasaron typecheck, lint, 15 tests y exportaciones iOS/Android. Sin prueba visual Android o tablet.

## 2026-10-11 — Ingreso y registro

- Rutas de autenticación presentadas como formSheet nativo, con tirador, fondo papel y cierre circular. Ingreso abre al 68% y registro al 80%; pueden expandirse.
- AuthSheet comparte cabecera, espaciado, contenido desplazable, gestión de teclado y footer de acciones; cambio de formulario como enlace secundario.
- AuthField conserva el buffer nativo y React Hook Form; campos de 56 pt, borde verde al enfocar, errores en rojo y mostrar/ocultar contraseña. Teclado Siguiente pasa al próximo campo; Ir valida y envía desde contraseña.
- Estados pendientes deshabilitan edición, cierre, cambio de formulario y gesto de dismissal.
- Verificados visualmente Ingreso y Registro en iOS 26.4 / iPhone 17 Pro, además de teclado y errores de registro vacío. Mediante callbacks del runtime se verificaron validación de ambos formularios, mostrar/ocultar contraseña y cambio de Registro a Ingreso. No se enviaron credenciales, crearon cuentas ni cambió la sesión existente.
- Pasaron typecheck, lint, 15 tests y exportaciones finales iOS/Android. La automatización táctil no se considera validación del recorrido completo; no se probó autenticación exitosa contra servidor ni dispositivo Android/tablet/fuente ampliada.

### Ajuste — iconos y aceptación de términos

- El control de contraseña usa ojo / ojo tachado: SF Symbols en iOS y Material Community Icons en Android, conservando las etiquetas accesibles Mostrar/Ocultar contraseña.
- Registro muestra antes de Crear cuenta: “Al crear una cuenta, aceptás los términos y condiciones de Yerbarium.” Es un aviso textual, sin enlace a una página inexistente.
- Se mantiene la validación y la autenticación existente, sin checkbox nuevo ni cambio del contrato de registro.

## 2026-10-11 — Skeletons de tarjetas de yerbas

- Inicio, Explorar (catálogo/búsqueda/filtros), Marca, Biblioteca y colecciones públicas muestran tres skeletons en carga inicial y refresco. Paginación agrega tres al pie y conserva resultados anteriores. Se mantienen errores, reintentos, estados vacíos y datos offline.
- YerbaCard comparte un fundido de skeleton a contenido de 220 ms, con demoras de 0/55/110 ms por fila y máximo 110 ms. Reduce Motion omite animación y demoras; imagen real usa transición de 180 ms. LibraryYerbaCard también cubre consultas de enriquecimiento.
- iPhone 17 Pro / iOS 26.4: refresco del catálogo Barbacuá verificado con una consulta pública retenida temporalmente desde el debugger. Se confirmó un grupo con tres skeletons, se capturó su composición y se liberó la consulta; regresaron las dos tarjetas reales. La instrumentación temporal fue retirada y las opciones de consulta restauradas.
- Pasaron typecheck, lint, 15 tests y exportaciones iOS/Android. Sin recorrido visual completo de todas las listas, paginación, modo offline, Reduce Motion o Android/tablet. El comportamiento temporal no se midió en un build release ni en un dispositivo físico de menor rendimiento.

## 2026-10-12 — Tamaño uniforme de tarjetas de marcas

- La grilla reparte el ancho entre contenedores iguales y cada BrandTile ocupa el 100% de su celda con proporción 1,15. El relleno del texto ya no modifica el reparto de ancho frente a los logos; la celda vacía mantiene el ancho de la última fila impar.
- Verificado visualmente en Explorar / Marcas, iPhone 17 Pro / iOS 26.4: Amanda, Andresito, Baldo, Cachamai, Canarias y Cruz de Malta tienen el mismo tamaño. El árbol de accesibilidad confirma ancho 0,420 y altura 0,168 en las seis tarjetas.
- Pasaron typecheck, lint, 15 pruebas y exportaciones Hermes iOS/Android. Detector de layout sin hallazgos. Sin verificación visual en Android, tablet o texto ampliado.

## 2026-10-12 — Guías de preparación y curado

- Aprende en Perfil incluye Cómo preparar un mate y Cómo curar un mate; ambas usan la ruta editorial existente y contenido local disponible sin una consulta nueva a la API.
- Contenido trasladado de las guías web: seis pasos de preparación, cinco pasos de curado de calabaza, cuidados de cinco materiales, secado, señales de alerta y sus cinco fuentes. Los artículos ofrecen enlaces para seguir aprendiendo.
- Heroes con la misma imagen mate-hero-inicio.webp que Cultura en la web. Verificados visualmente ambos artículos y la sección Aprende de Perfil en iPhone 17 Pro / iOS 26.4 mediante Argent. Apertura de artículos comprobada por deep links; no se verificó el recorrido táctil completo ni enlaces externos.
- Pasaron typecheck, lint, 15 pruebas y exportaciones Hermes iOS/Android. Sin revisión visual en Android, tablet o texto ampliado.
- Web: TypeScript, lint y las nueve pruebas existentes de guías/navegación pasaron. Ambos heroes verificados en Brave a 1440 px y 390 px; fotografía visible y sin solapamiento con el texto. Playwright local no pudo iniciar Chromium por las restricciones del sandbox; la comprobación visual se completó con el navegador conectado.

## 2026-10-12 — Comprar en detalle de yerba

- Comprar aparece junto a Quiero probar en la fila de acciones y despliega/cierra Dónde comprar, como en la web. Disponible sin sesión y solo cuando la API devuelve enlaces; se retiró la lista duplicada de la pestaña Ficha.
- Tiendas ordenadas por prioridad e ID; precio formateado con moneda, etiqueta Tienda oficial, aviso de salida a tienda externa y aviso de afiliados cuando corresponde. Los enlaces prefieren affiliate_url y manejan errores con reintento.
- iPhone 17 Pro / iOS 26.4: Baldo con enlace real muestra el botón junto a los estados de biblioteca y el panel con tienda oficial, ARS 11.490,00 y aviso de afiliados. Amanda sin enlaces oculta Comprar. Apertura y cierre ejercitados mediante el callback del botón en el debugger de Argent; no recorrido táctil completo. Inspección temporal del query client retirada sin cambiar datos ni sesión.
- Pasaron typecheck, lint, 15 pruebas y exportaciones Hermes iOS/Android. No se abrió una tienda externa ni se realizó una compra. Sin verificación visual Android/tablet/texto ampliado, sesión anónima ni simulación de errores externos.

## 2026-10-12 — Notas percibidas agrupadas

- Selector de notas de opinión organizado por las mismas diez familias y etiquetas en español de la web, en el mismo orden. Chips con +/✓, selección múltiple, fondo verde suave al seleccionar y filas que se ajustan al ancho disponible. Los códigos de familia ya no aparecen en cada chip.
- Ayuda sobre selección independiente de atributos, Limpiar notas y estado vacío explícito. Se conserva la paginación existente; las notas cargadas se agrupan y deduplican por slug. Familias nuevas desconocidas se muestran en Otras notas.
- Verificado en iPhone 17 Pro / iOS 26.4 con las 38 notas reales: grupos y acomodo visual, selección simultánea de Cacao y Café conservando una nota previamente seleccionada, y deselección de ambas para restaurar el borrador. Interacciones por callbacks del debugger de Argent, sin publicar/guardar una opinión ni modificar datos del servidor. Variables temporales eliminadas.
- Pasaron typecheck, lint, 15 pruebas y exportaciones Hermes iOS/Android. Sin recorrido táctil completo, prueba de guardado, acción Limpiar notas ni verificación visual Android/tablet/texto ampliado.

## 2026-10-12 — Títulos de artículos en el header

- El header editorial toma siempre el título del artículo. Cultura matera y Sobre la yerba ya no reciben un título vacío.
- Verificados ambos títulos en iPhone 17 Pro / iOS 26.4 mediante Argent.
- Pasaron typecheck, lint, 15 pruebas y exportaciones iOS/Android. Sin revisión visual Android/tablet.

## 2026-10-12 — Ancho de botones outline

- Button ocupa todo el ancho disponible por defecto tanto para acciones principales como outline. Las acciones marcadas compact mantienen su tamaño para filas de controles; fullWidth sigue siendo una opción explícita.
- Perfil sin sesión verificado visualmente en iPhone 17 Pro / iOS 26.4: Crear cuenta ocupa el mismo ancho que Ingresar dentro de Tu ronda empieza acá.
- Pasaron typecheck, lint, 15 pruebas y exportaciones iOS/Android. Sin revisión visual Android/tablet.
# 2026-10-13 — Skeletons de carga de contenido

- QueryState reemplaza la tarjeta con spinner por placeholders de texto; detalle agrega imagen y acciones, marca/perfil un encabezado, y estilos chips. Las listas de yerbas conservan sus skeletons existentes. Errores, reintentos y mensajes offline conservan su comportamiento.
- Verificado visualmente en iPhone 17 Pro / iOS 26.4 con el estado de una consulta pública de detalle cambiado temporalmente a pendiente desde Argent. Skeleton visible sin tarjeta/spinner; datos originales restaurados y contenido real confirmado. Instrumentación temporal eliminada.
- Pasaron TypeScript, 15 pruebas y exportaciones Hermes iOS/Android. Lint sin errores, con tres warnings previos en _layout.tsx/account.tsx. Detector de diseño sin hallazgos. Sin revisión visual Android/tablet, variantes de encabezado/chips ni simulación de error/offline.

## Transición de skeleton a contenido

- QueryState mantiene un contenedor estable para las variantes de contenido y cruza las opacidades del skeleton y los datos durante 280 ms con Reanimated en el hilo UI. Los datos disponibles desde el inicio se muestran directamente; Reduce Motion omite el fundido. Las tarjetas de yerbas conservan su transición existente.
- En iPhone 17 Pro / iOS 26.4 se comprobó el skeleton de chips de estilos y el retorno a los datos reales mediante estado temporal de la consulta, restaurado al terminar. Expo Go mostró inicialmente un error de ExpoAsset; reiniciar y reabrir el proyecto permitió continuar. Variables temporales eliminadas.
- TypeScript, lint sin errores (tres warnings previos), 15 pruebas y exportaciones Hermes iOS/Android pasaron; detector de diseño sin hallazgos. Sin evaluación de fluidez en build release/dispositivo físico de menor rendimiento, Android o Reduce Motion activado.

## 2026-10-14 — Recuperación de contraseña y verificación de email

- Ingresar ofrece recuperación por email. Registro envía a la pantalla de verificación; Perfil muestra el estado y permite reenviar el enlace o actualizar el estado tras verificarlo desde el navegador. La verificación es opcional y no bloquea el acceso.
- Nuevas rutas `recuperar-contrasena`, `restablecer-contrasena` y `verificar-email`. Los correos abren la web y ofrecen continuar en la app. Los tokens se mantienen en memoria, sin AsyncStorage.
- API y web implementadas en el proyecto hermano. Configuración, despliegue y pruebas: `../yerba-plataform/docs/account-email-flows.md`. Aplicar migración `accounts.0004_email_actions` y configurar SMTP antes de habilitar correo real. El cambio de configuración JWT exige volver a iniciar sesión a usuarios con tokens previos al despliegue.
- Pasaron tipos, 15 pruebas y exportaciones Hermes iOS/Android. Lint sin errores, con una advertencia previa `moveCarousel` en `home.tsx`. La web pasó tipos, lint, 198 pruebas y build con webpack; el build Turbopack quedó sin progreso y se interrumpió. API: 35 pruebas con SQLite aislado y correo en memoria; Ruff, chequeos de Django, migraciones y esquema OpenAPI correctos.
- Inspección con Argent, iPhone 17 Pro / iOS 26.4: pantallas de recuperación, verificación y reset sin token visibles, con campos y acciones accesibles. Apertura mediante deep links. Dos taps de Argent sobre Solicitar otro enlace no provocaron navegación; no se confirmó el recorrido táctil. No se alteraron cuentas del servidor ni se enviaron correos reales.
- Pendiente: SMTP real, pruebas de concurrencia con PostgreSQL (socket Docker y conexión PostgreSQL bloqueados por el sandbox), recorrido completo de correo → web/app → confirmación, Android/tablet y texto ampliado.

### Verificación automática sin pedir el email nuevamente

- Web y app muestran la dirección de la cuenta como texto y ofrecen Reenviar verificación. El envío inicial sigue ocurriendo automáticamente al registrarse; no se duplica al visitar la pantalla. Sin sesión, la pantalla pide ingresar en lugar de pedir el email. La confirmación del enlace sigue disponible sin sesión.
- Verificado visualmente con Argent en iPhone 17 Pro / iOS 26.4: dirección como texto, sin campo editable, botón Reenviar verificación y acceso al perfil. Sin enviar correo real.
- Pasaron tipos, lint (una advertencia previa en home.tsx), 15 pruebas y exportaciones iOS/Android. Web: tipos, lint y 200 pruebas. API: 21 pruebas de email en SQLite, incluyendo envío automático al registrarse tanto en web como en app.

### Verificación de email sin botón de cerrar duplicado

- La pantalla de verificación omite la X junto al título; conserva la flecha de navegación del encabezado. AuthSheet permite ocultar el botón mediante `showClose`; Ingresar y Registro conservan el cierre de sus hojas.
- Verificado visualmente mediante Argent en iPhone 17 Pro / iOS 26.4. Pasaron tipos, 15 pruebas y exportaciones iOS/Android; lint sin errores y con la advertencia previa de home.tsx. Sin revisión visual Android/tablet.

### Insignia de verificación junto al username

- Perfil muestra el ícono `verified` de la app junto a @username cuando `email_verified` es verdadero; se elimina el texto separado Email verificado. La insignia tiene etiqueta accesible. El aviso y las acciones de cuentas pendientes se conservan.
- Verificado visualmente con una cuenta verificada en iPhone 17 Pro / iOS 26.4 mediante Argent. No se modificaron datos de cuenta ni estados temporales.
- Pasaron tipos, 15 pruebas y exportaciones iOS/Android; lint conserva una advertencia previa en home.tsx. Web: tipos, lint, 200 pruebas existentes y dos casos nuevos de insignia presente/ausente (ocho pruebas del archivo de email). Sin inspección visual Android ni web.

### Recuperación de cuenta sin botón de cancelar

- Se oculta la X de AuthSheet en el modo de solicitud de recuperación, tanto en el formulario como en la confirmación.
- Comprobado con Argent en iPhone 17 Pro / iOS 26.4 sobre la confirmación visible: título y acciones presentes, sin botón de cancelar.
- Pasaron tipos, 15 pruebas y exportaciones iOS/Android. Lint sin errores, con una advertencia previa en home.tsx. Sin inspección visual Android.

### Ícono adaptativo Android con más margen

- Reducido el mate un 20% (540 → 432 px en el lienzo de 1024 px), centrado y con escala idéntica en foreground y máscara monocromática. Regenerados SVG/PNG y los recursos adaptativos del proyecto Android local mediante el generador de Expo.
- Revisada una previsualización circular del recorte adaptativo. No hay dispositivos ni AVD Android disponibles en Argent; pendiente comprobar el launcher instalado con un nuevo build nativo. El cambio no se aplica mediante OTA ni recarga de Metro.
- Pasaron tipos, 15 pruebas y exportaciones Hermes iOS/Android. Lint sin errores, con la advertencia previa de `moveCarousel` en `home.tsx`.

## 2026-10-15 — Podio de la comunidad en Inicio

- Nueva sección encima de Yerbas destacadas, conectada a `community/rankings/yerbas/?limit=3`. Respeta los puestos del backend; presenta imagen real, marca, nombre, promedio en hojas y cantidad de opiniones. Primero al centro entre segundo y tercero; con menos de tres resultados conserva los disponibles. Pantalla menor a 350 pt o fontScale mayor a 1,3 usa filas verticales en orden natural.
- Reutiliza QueryState para carga, error, reintento, caché y desconexión; mensaje propio cuando no hay valoraciones. Imagen ausente o fallida tiene texto alternativo. Guardar/editar una opinión invalida el ranking; eliminar opiniones ya invalida todas las consultas públicas.
- Pasaron TypeScript, lint sin errores (advertencia previa moveCarousel en home.tsx), las 15 pruebas existentes y exportaciones Hermes iOS/Android en /private/tmp/yerbarium-podium-ios y /private/tmp/yerbarium-podium-android. Detector de diseño sin hallazgos; git diff --check correcto.
- Confirmado visualmente en iPhone 17 Pro / iOS 26.4 con datos reales: composición 2º–1º–3º encima de destacadas, fotografías, hojas, promedios y opiniones. Accesibilidad anuncia puesto, producto, promedio y opiniones. Captura: /var/folders/8p/dkj73qk9569f7x7931_v6bkr0000gn/T/simserver-q3nK06/media/876247000-1792105751900.png.
- Dos taps inyectados por Argent sobre el primero no provocaron navegación. Se verificó el callback onPress desde el depurador y abrió correctamente la ficha real Canarias Sabor Original. Pendiente confirmación táctil manual, revisión visual Android/tablet/texto ampliado y recorridos de carga/error/vacío/offline. No se modificaron valoraciones ni datos del servidor.

### Ajuste visual del podio

- Se retiraron los contenedores individuales, sus fondos y bordes. Imágenes con área de 188 pt (antes 128), a todo el ancho disponible; en formato vertical usan 120 × 152 pt. Se retiraron las hojas y el promedio numérico; permanecen marca, nombre, cantidad de opiniones y puesto.
- Confirmado visualmente con datos reales en iPhone 17 Pro / iOS 26.4. Captura: /var/folders/8p/dkj73qk9569f7x7931_v6bkr0000gn/T/simserver-U6vMvZ/media/658762000-1792105967669.png.
- TypeScript, las 15 pruebas y exportaciones iOS/Android correctos; lint sin errores con el warning previo moveCarousel. Detector sin hallazgos. Sin nueva revisión visual Android ni texto ampliado.

### Podio sin cantidad de opiniones

- Se retiró el número de opiniones del contenido visible y de accesibilidad, junto con su contenedor. El podio conserva imagen, marca, nombre y puesto.

### Colores de medallas en el podio

- Bases oro, plata y bronce para los puestos 1, 2 y 3; números en tinta oscura. Tokens compartidos en theme/index.ts. Confirmado visualmente en iPhone 17 Pro / iOS 26.4: /var/folders/8p/dkj73qk9569f7x7931_v6bkr0000gn/T/simserver-hFB2cr/media/156347000-1792106077200.png.
- TypeScript y 15 pruebas correctos; lint sin errores, con advertencia previa moveCarousel. Sin revisión visual Android.

### Números de puestos en blanco

- Los números 1º, 2º y 3º usan el token white sobre las bases oro, plata y bronce, por pedido del usuario. TypeScript y diff --check correctos; sin nueva revisión visual para este ajuste de color.

### Escala de imágenes del podio

- La columna del ganador tiene 25% más espacio relativo. Las imágenes usan contain, alineación inferior y límites de altura 180/140/112 pt para primero/segundo/tercero; modo vertical conserva 152 pt. Esto compensa la distinta proporción de los paquetes sin deformarlos ni recortarlos.
- Inspección visual iPhone 17 Pro / iOS 26.4 confirmó mayor presencia del primero tras ampliar su columna. Último ajuste reduce la altura máxima del tercero de 124 a 112 pt. Captura previa a esa reducción: /var/folders/8p/dkj73qk9569f7x7931_v6bkr0000gn/T/simserver-ss7fY1/media/613684000-1792106300627.png.
- TypeScript, 15 pruebas, lint sin errores (warning previo moveCarousel), detector y exportaciones iOS/Android correctos antes del ajuste final de 12 pt. No se revisó visualmente Android ni otras futuras fotografías del ranking.

### Alternativa a dropdowns de filtros — 2026-10-15

- País, tradición y estado: botones de selección única visibles, distribuidos en filas, verde + check para selección y roles radio/checked. Marca: lista virtualizada con búsqueda local sin distinguir acentos/mayúsculas; completa las páginas usando la consulta existente de TanStack Query. Conserva borrador hasta aplicar; limpiar incluye estilo. Sin dependencias nuevas.
- BottomSheet nativo abre a altura completa: la inspección de la altura parcial detectó acciones recortadas; con altura completa se confirmaron todas las secciones y ambos botones visibles. Contenido central desplazable para pantallas más pequeñas o fuentes ampliadas.
- Inspección visual en iPhone 17 Pro / iOS 26.4. Panel final: `/private/tmp/yerbarium-filtros-ios.png`. Búsqueda de Canarias y selección comprobadas vía callbacks reales con Argent debugger-evaluate; se verificó país Uruguay marcado y estado aplicado: marca `canarias`, país `UY`, panel cerrado. Limpiar y aplicar restablecieron filtros al terminar.
- Limitación: gesture-tap informó éxito pero los toques no cambiaron la UI, incluso en las pestañas nativas después de recargar. La comprobación funcional usó callbacks desde el runtime; no equivale a un recorrido táctil completo. No se verificó interacción con teclado visible, VoiceOver/TalkBack, fuente ampliada ni un dispositivo Android (sin dispositivos ni AVD disponibles).
- TypeScript, 15 pruebas, Prettier, diff --check y exportaciones iOS/Android correctos sobre el cambio final. Lint sin errores; conserva el warning previo de `moveCarousel` en Inicio. Detector Impeccable sin hallazgos.

### Ancho de descripción de YerbaCard — 2026-10-16

- Descripción limitada al 60% de la columna de texto (aproximadamente un tercio de la tarjeta), con el límite existente de tres líneas. Conserva ancho del título e imágenes. Cambio compartido para iOS y Android.
- Confirmado visualmente con las tarjetas reales de Amanda Tradicional y Andresito Despalada en iPhone 17 Pro / iOS 26.4: descripción separada de hojas y paquetes. Captura: `/var/folders/8p/dkj73qk9569f7x7931_v6bkr0000gn/T/simserver-gS44yu/media/212846000-1792155270230.png`. Sin emulador Android disponible.
- TypeScript, 15 pruebas, exportaciones iOS/Android correctos; lint sin errores con warning previo `moveCarousel` en Inicio. Hook de diseño sin hallazgos deterministas; sidecar de DESIGN.md previamente desactualizado, sin regenerarlo fuera del alcance.

### Botones de puntuación — 2026-10-16

- Reemplazados «Bajar 0,5» / «Subir 0,5» por iconos menos y más: SF Symbols en iOS y Material en Android, botones circulares de 48 puntos. Conservan pasos de 0,5, límites 1–5, estados deshabilitados y etiquetas accesibles que explican el incremento.
- Confirmados visualmente ambos iconos en iPhone 17 Pro / iOS 26.4. Captura: `/var/folders/8p/dkj73qk9569f7x7931_v6bkr0000gn/T/simserver-NYIeSt/media/844750000-1792155414868.png`. Sin recorrido táctil ni revisión visual Android; no se publicó ninguna opinión.
- TypeScript, 15 pruebas, Prettier, diff --check y exportaciones iOS/Android correctos. Lint sin errores; warning previo `moveCarousel` en Inicio.

### Composición de puntuación — 2026-10-16

- Valor numérico al lado del título «Tu puntuación»; una fila debajo con menos, cinco hojas centradas y más. Botones de 44 puntos y pasos de 0,5 dentro de 1–5. La escala central se expone como adjustable con acciones de incremento/decremento para lector de pantalla; la edición visual usa los botones laterales.
- Confirmado visualmente en iPhone 17 Pro / iOS 26.4: `/var/folders/8p/dkj73qk9569f7x7931_v6bkr0000gn/T/simserver-8s2YLA/media/542804000-1792155587560.png`. Sin publicación de opinión ni revisión visual Android.
- TypeScript, 15 pruebas y exportaciones iOS/Android correctos; lint sin errores tras quitar el import styles sin uso. Persiste warning previo moveCarousel en Inicio.

### Presentaciones en español — 2026-10-16

- La ficha móvil usa packageTypeLabel: bag/bolsa/paquete/package/packet → Paquete, box/caja → Caja, paper bag → Paquete de papel, tin/can/lata → Lata y jar/frasco → Frasco. Ignora mayúsculas y espacios externos. Descripciones específicas desconocidas se conservan; valor vacío muestra Sin información. No modifica registros, pesos ni códigos de barras. La web y la API no fueron modificadas.
- AX de iPhone 17 Pro confirmó 500 g / Paquete en Andresito Despalada. Sin dispositivo Android disponible.
- TypeScript y 24 pruebas correctos (9 casos de formato incluidos). Lint sin errores con warning previo moveCarousel; exportaciones iOS/Android correctas antes de añadir la comprobación de propiedad propia al diccionario.
### 2026-10-14 — Restauración de verificación y recuperación

- Restaurados desde el cambio original `f3a152f` los ocho archivos de implementación que había eliminado/modificado el revert `793c74b`: rutas, pantallas de email, tipo de cuenta, ingreso/registro, perfil y AuthSheet. Se conservan los ajustes posteriores del ícono Android.
- Recuperación desde Ingresar, nueva contraseña con confirmación, verificación después de registrarse, reenvío a la dirección de la cuenta y actualización/insignia en Perfil. Los cuatro endpoints coinciden con `apps/api/accounts/urls.py` del proyecto hermano.
- Pasaron TypeScript, 15 pruebas existentes y exportaciones Hermes iOS/Android. Lint sin errores, con la advertencia previa de `moveCarousel` en `home.tsx`. `git diff --check` correcto.
- No se pudo completar la revisión visual: el development client iOS instalado mostró error de conexión a Metro; al intentar conectarlo por IPv6 volvió al inicio del simulador. Metro iniciado para esta comprobación se detuvo al terminar. Sin Android disponible. Pendientes el recorrido visual y la prueba completa mediante correo real; no se enviaron correos ni se cambiaron contraseñas.


### Canales de EAS Update — 2026-10-16

- Agregados channel production y preview a sus perfiles en eas.json. Se conservan URL, projectId y política appVersion existentes. Los proyectos nativos están ignorados por Git; EAS Build aplicará la configuración mediante CNG.
- Validación de JSON, canales, correspondencia URL/projectId y runtime correcta. Pasaron 24 pruebas y exportaciones Android/iOS. Lint sin errores, con warning previo moveCarousel en home.tsx. Typecheck detectó cuatro errores de rutas tipadas existentes en account.tsx y email-actions.tsx, fuera del cambio de configuración.
- eas update:configure falló por ENOTFOUND api.expo.dev; los canales se completaron siguiendo https://docs.expo.dev/eas-update/getting-started/. No se pudo verificar la asociación remota canal/rama, build instalada ni update publicada. No se creó ni publicó una build o actualización. La nueva configuración del canal requiere una nueva build de tienda.

### Fondo del subtítulo de filtros — 2026-10-16

- El texto auxiliar del encabezado (Filtros / Marcas) usa Text sin selección y con fondo transparente explícito, conservando styles.muted. Evita el tratamiento nativo del texto seleccionable heredado de Body en Android.
- Pasaron TypeScript, 24 pruebas y exportaciones iOS/Android. Lint sin errores; warning previo moveCarousel en home.tsx. No se pudo confirmar visualmente el arreglo en Android: Argent no encontró dispositivos ni AVD disponibles.

## Editar perfil: país e idioma — 2026-10-16

- País reemplazado por selector e idioma agregado con las mismas seis opciones de país y cinco de idioma que la web. Ambos admiten «Sin especificar» y conservan valores existentes fuera de las sugerencias.
- Selectores con nombres completos, iconos, filas de 56 puntos, estado seleccionado y cierre sin cambios. Se usa Modal nativo en formato pageSheet: la presentación de @expo/ui BottomSheet no resultó verificable en esta pantalla durante esta sesión.
- TypeScript y 24 tests pasan. Lint sin errores; advertencia preexistente en home.tsx (`moveCarousel`). Exportaciones iOS y Android correctas.
- iPhone 17 Pro / iOS 26.4: apertura y selección Argentina / Español (Argentina) verificadas por acciones de componentes mediante Argent debugger y observación de la UI. Los taps de Argent no activaron los elementos indicados por descubrimiento; queda pendiente validación táctil directa. No se guardaron cambios en la cuenta durante QA.
- No hay emulador Android disponible; interacción Android y guardado contra la API no probados en esta pasada.

### Banderas de perfil — 2026-10-16

- Banderas SVG en las seis opciones de país y en el valor seleccionado del formulario, reutilizando CountryFlag; agregadas Bolivia y Chile. «Sin especificar» conserva el globo.
- Comprobación visual en iPhone 17 Pro mediante Argent debugger: las seis banderas aparecen alineadas con los nombres. Se mantiene la limitación táctil de Argent descrita arriba.
- TypeScript y 24 tests pasan; lint sin errores (misma advertencia preexistente). Exportaciones iOS y Android verificadas.

### Banderas de idioma — 2026-10-16

- Agregadas banderas a las cinco opciones de idioma y al idioma seleccionado: España (es), Argentina (es-AR), Portugal (pt), Brasil (pt-BR) y Reino Unido (en). «Sin especificar» y códigos no reconocidos conservan el icono de idioma.
- Verificado visualmente el campo con Português y bandera de Portugal en iOS. La apertura solicitada por debugger no permaneció visible durante esta comprobación; no se modificaron valores de la cuenta.
- TypeScript, 24 tests y exportaciones iOS/Android pasan. Lint sin errores; se mantiene la advertencia previa de home.tsx.

## Traducciones de la app — 2026-10-16

- Interfaz y cuatro guías editoriales traducidas para es, es-AR, pt, pt-BR y en. Navegación, formularios, accesibilidad, filtros, estados vacíos, errores conocidos, biblioteca, comparación, valoraciones y escalas sensoriales usan el idioma activo. Números, fechas y precios usan su configuración regional.
- LocaleProvider toma el idioma de la cuenta después del guardado; si queda vacío usa el dispositivo. Conserva localmente solo el código de idioma para el inicio sin conexión/sin sesión. No se modificaron backend ni web. Los nombres y descripciones de productos, las biografías, las opiniones y los títulos originales de fuentes no se traducen automáticamente.
- iPhone 17 Pro / iOS 26.4: catálogo en inglés, guía de preparación en pt-BR, login en pt y variantes es / es-AR verificados mediante cambios temporales del módulo de idioma con Argent debugger, sin escribir cambios en la cuenta. Se verificó también que la preferencia pt se recupera al reiniciar.
- El runtime instalado carece de Intl.PluralRules e Intl.DisplayNames: se añadieron respaldos para plurales y nombres de países compatibles. Sin errores de JS en la revisión final. RNScreens emite una advertencia de composición de la hoja de autenticación que requiere una revisión independiente del layout existente.
- TypeScript correcto, 35 tests pasan, lint sin errores (advertencia previa por moveCarousel sin uso en home.tsx). Exportaciones iOS y Android correctas.
- Limitaciones: no hay sesión autenticada ni emulador Android disponible al finalizar QA; no se verificó el guardado de idioma contra la API ni la interacción en Android. La precedencia de preferencias, el cambio reactivo, la cobertura y la interpolación se verifican con tests; los taps de Argent siguen teniendo la limitación descrita en esta página.

## Idioma independiente del perfil — 2026-10-16

- Idioma retirado de Editar perfil: guardar nombre, biografía, país o privacidad no envía `language_code`.
- Perfil → Ajustes → Idioma está disponible con y sin sesión. Pantallas con listas nativas de Expo UI, cinco idiomas, banderas y selección actual. El cambio se aplica inmediatamente y se guarda como código en AsyncStorage.
- Prioridad: elección local → idioma guardado de la cuenta → idioma del dispositivo. La lectura inicial no genera PATCH. Una selección diferente con sesión sincroniza únicamente `{language_code}` si difiere del valor de la cuenta. Sin sesión no hace una solicitud de actualización.
- El guardado local funciona sin conexión (`networkMode: always`). Si falla el guardado o la sincronización, se mantiene el idioma en memoria y se muestra un reintento; si sólo falla la API, el código ya queda guardado localmente. Se evita sincronizar contra otra cuenta si la sesión cambia durante la persistencia local.
- TypeScript correcto; 41 pruebas pasan. Lint sin errores, con la advertencia previa de `moveCarousel` en home.tsx. Exportaciones Hermes iOS y Android correctas; `git diff --check` correcto.
- Revisión visual nativa pendiente: Argent detectó el iPhone arrancado, pero Metro no estaba disponible y los intentos de iniciarlo en este entorno no lograron abrir el servidor. No se probó el nuevo flujo en el simulador ni se modificó una cuenta real. Sin emulador Android disponible.
- La web agrega el mismo cambio desde el navbar y conserva la preferencia en cookie para SSR. Menú y banderas revisados en escritorio y a 390 px; pruebas de visitantes, prioridad local, actualización parcial, ausencia de cambios al recargar y reintento verificadas con API simulada.

## Ajustes e Idioma: filas abiertas — 2026-10-16

- Ajustes e Idioma siguen el patrón de filas de “Aprende”: fondo crema y opciones separadas por divisores superior e inferior, sin tarjeta contenedora.
- Ajustes conserva el icono de idioma, el idioma actual y la flecha. La lista de idiomas mantiene banderas, texto “Seleccionado” y tilde para la opción activa, sin fondo de selección.
- iPhone 17 Pro / iOS 26.4: pantallas Ajustes e Idioma revisadas visualmente mediante Argent. Navegación con el router del runtime porque los taps de Argent no activaron los controles. No se cambió el idioma ni se escribió en la cuenta.
- TypeScript correcto. No hay dispositivo Android disponible para revisión visual.

## Acceso sin sesión en Perfil y Mi biblioteca — 2026-10-16

- El bloque de bienvenida, descripción e ingreso/registro se muestra directamente sobre el fondo de Perfil y Mi biblioteca, sin borde ni fondo de tarjeta. Las otras pantallas que usan RequireSession conservan su tarjeta.
- Perfil verificado visualmente en iPhone 17 Pro / iOS 26.4; Mi biblioteca se actualizó con el mismo componente y estilo. TypeScript correcto; no se ejecutaron pruebas automatizadas para este ajuste visual.
