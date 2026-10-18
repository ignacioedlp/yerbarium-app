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

## Splash animado en tres aumentos — 2026-10-16

- Se conserva el mate nativo sobre #f4f0e4 hasta pintar la misma imagen en React. Fuentes, idioma, sesión y primer layout de navegación deben estar listos antes de iniciar la salida. Dos frames permiten completar el montaje nativo.
- Tres aumentos sin pausas intermedias: 180 + 220 + 360 ms, mate sobredimensionado según la pantalla y desvanecido final de 160 ms. Total 960 ms. Transformación en UI runtime y capa del logo rasterizada; sin renders de React por cuadro. Reducir movimiento sustituye el zoom por un desvanecido de 120 ms. El inicio no admite interacción ni lectura de accesibilidad durante el splash.
- Medición temporal con useFrameCallback en iPhone 17 Pro / iOS 26.4, build de desarrollo: antes, 58 cuadros, 5 intervalos >25 ms, máximo 184,6 ms y promedio 21,26 ms. Después, dos recargas: 56 cuadros, 1–2 intervalos >25 ms, máximo 33,75/33,33 ms y promedio 16,96/17,18 ms. Se retiró la instrumentación al terminar. Estos valores no equivalen a una medición de GPU ni de rendimiento release.
- Inicio visible tras la transición y sin errores de JS. TypeScript correcto, 41 tests pasan, lint sin errores (advertencia previa de moveCarousel), exportaciones Hermes iOS/Android correctas.
- Límites: sin dispositivo Android ni teléfono físico; pendiente comprobar build release, arranque nativo en frío y reducir movimiento activado. No pudo grabarse video porque Argent no encuentra ffmpeg.

## Splash: crecimiento continuo — 2026-10-16

- Sustituida la secuencia de tres ease-out (cada tramo frenaba casi a cero) por un único progreso de 1100 ms. Escala exponencial con tres modulaciones suaves y velocidad continua positiva entre ellas; opacidad derivada del mismo progreso. Se elimina la espera final y la rasterización forzada de un contenedor; se transforma directamente Animated.Image.
- Medición temporal useFrameCallback en el mismo iPhone 17 Pro, build de desarrollo: 66 cuadros, intervalo máximo 23,54 ms, promedio 16,77 ms, cero intervalos >25 ms. La instrumentación se retiró. Inicio visible y sin errores de JS. El resultado mide callbacks del UI runtime, no GPU ni rendimiento release; pendiente teléfono físico/Android y apreciación del usuario.
- Validación final: TypeScript, 41 tests y exportaciones iOS/Android correctos; lint sin errores, con advertencia previa de moveCarousel. git diff --check correcto.

## Sobre la yerba: encabezado editorial — 2026-10-16

- Cambiado únicamente el encabezado introductorio de las referencias de «Fuentes» a «Sobre esta guía». La lista conserva «Fuentes»; se reutilizan las traducciones existentes. TypeScript y diff correctos. Sin revisión visual nativa para este cambio de texto.

## Marca: bandera junto al verificado — 2026-10-16

- Bandera movida inmediatamente después del ícono de verificado, en la fila del nombre. Revisado visualmente con Mañanita en iPhone 17 Pro / iOS 26.4 mediante Argent.
- TypeScript, 41 tests y exportaciones iOS/Android correctos. Lint sin errores; advertencia previa de moveCarousel en Inicio. Sin dispositivo Android disponible para revisión visual.

## Seguimiento de perfiles públicos — 2026-10-16

- Se agregaron Seguir/Siguiendo, contadores navegables, listas paginadas de seguidores/seguidos y navegación a los perfiles. Los perfiles privados no ofrecen seguimiento; el propietario conserva acceso a sus contadores/listas.
- Las cuentas privadas pueden seguir perfiles públicos. Cambiar a privado elimina solo seguidores, conserva seguidos y no restaura relaciones. Bloquear elimina relaciones en ambos sentidos.
- Consultas sociales con TanStack Query y claves por visitante; sin persistencia. Mutaciones por Axios autenticado; se actualizan estado, contadores y listas. Las rutas de listas manejan carga, vacío, error y reintento.
- Verificado: typecheck, 43 pruebas Vitest, exportaciones iOS y Android. Lint: sin errores, una advertencia existente sobre `moveCarousel` en `src/screens/home.tsx`.
- Argent en iPhone 17 Pro/iOS 26.4: se verificó que los deep links de perfil y seguidores resuelven y presentan error recuperable con Reintentar cuando falla la API. El inspector React Native ya estaba activo. No se verificaron visualmente los botones ni el recorrido autenticado: se requiere aplicar `accounts.0005_userfollow` a la base local, y el entorno no permite acceder al socket Docker ni a PostgreSQL. No hay emulador Android configurado.
- API: 37 pruebas relevantes correctas en SQLite; 2 de concurrencia pendientes en PostgreSQL. OpenAPI y coherencia de migraciones correctos. Detalles y comando de migración en `../yerba-plataform/docs/following.md`.

### Filas de seguidores y seguidos — 2026-10-16

- Se reemplazó la tarjeta de cada persona por una fila transparente con un único borde inferior y la misma respuesta al pulsar de Aprende. Se aplica a seguidores y seguidos mediante la pantalla compartida.
- Verificado visualmente con Argent en iPhone 17 Pro: `dev-reviewer-diego/seguidores` muestra nombre, usuario y separador inferior, sin borde alrededor ni esquinas redondeadas.
- Typecheck correcto; lint sin errores y con la advertencia existente de `moveCarousel` en `home.tsx`.

### Listados exclusivos del propietario — 2026-10-16

- Los contadores continúan visibles en perfiles públicos ajenos, como texto sin enlaces. Los propios contadores conservan la navegación a seguidores/seguidos.
- Las listas, públicas o privadas, requieren autenticación y pertenecer al usuario de sesión. La app y la web impiden abrir listas ajenas incluso por URL directa; la API devuelve 401 sin sesión y 404 si se intenta consultar otra cuenta.
- Verificación con Argent en iPhone 17 Pro: el perfil público de Diego conserva las cantidades y Seguir; abrir directamente su lista de seguidores muestra el aviso de acceso exclusivo.
- Validaciones: tipos y lint de ambos clientes; 271 pruebas web, 43 móviles y 41 de API relevantes correctas. Dos escenarios de concurrencia PostgreSQL siguen pendientes en el entorno SQLite. OpenAPI valida sin advertencias.

## Seguimiento de marcas — 2026-10-16

- Ficha de marca: Seguir marca/Siguiendo y cantidad pública de seguidores. El botón de visitantes lleva a Ingresar. Los errores conservan el estado anterior y permiten reintentar.
- Seguidos: pestañas Personas y Marcas; filas con borde inferior, navegación a marca y paginación propia. Los listados permanecen exclusivos del dueño; los contadores públicos de personas conservan su comportamiento.
- Inicio: Novedades de tus marcas, con productos reales del catálogo y novedades publicadas desde administración. Se filtran por las marcas seguidas, se ordenan por fecha y se excluyen borradores, publicaciones futuras e inactivos. Consultas privadas sin persistencia, separadas por cuenta, con invalidación al seguir/dejar de seguir.
- Validado: tipos, 44 pruebas móviles y exportaciones iOS/Android; lint sin errores y con la advertencia existente de `moveCarousel` en `home.tsx`. API/administración: 87 pruebas relevantes correctas en SQLite, 2 anteriores de concurrencia pendientes en PostgreSQL. Web: 278 pruebas y build con Webpack correctos. OpenAPI sin advertencias y migraciones coherentes.
- Argent en iPhone 17 Pro/iOS 26.4: `yerbarium://usuarios/2tofi/seguidos` presenta ambas pestañas y mantiene el listado de personas con el separador inferior. No se completó el recorrido real de seguir marca/feed: las migraciones nuevas no pudieron aplicarse por las restricciones de acceso a Docker/PostgreSQL. Android no tiene emulador configurado.
- Contratos, decisiones del feed y pasos de publicación/migración: `../yerba-plataform/docs/brand-following.md`.

## Pantalla Social — 2026-10-17

- Quinta pestaña Social antes de Perfil, con Para vos/Siguiendo y sesión requerida. Feed cronológico de reseñas públicas, catálogo y novedades existentes. Inicio conserva su listado de marcas.
- Privacidad y bloqueos filtrados por API antes de paginar. Queries privadas por cuenta/pestaña, sin persistencia y con cancelación. Guardar/eliminar reseñas, seguir/dejar de seguir, privacidad y bloqueos invalidan las consultas sociales.
- Verificado: tipos, 46 pruebas Vitest (incluidas autenticación de consultas, aislamiento por cuenta/pestaña y cancelación al retirar consultas), exportaciones iOS/Android. Lint sin errores; permanece la advertencia anterior de `moveCarousel` en Inicio.
- Argent/iPhone 17 Pro/iOS 26.4: deep link `yerbarium://social` carga reseñas locales reales, hojas de valoración y tarjetas enlazadas. Se inspeccionaron Para vos y Siguiendo (este último activando el callback de selección desde el depurador). Capturas y árboles nativos muestran el cambio de selección y de resultados.
- Los taps de Argent no activaron controles nativos ni React Native, incluso tras reiniciar. No se da por verificado el recorrido táctil completo, enlaces, scroll o Cargar más en dispositivo. No hay emulador Android configurado; revisión visual pendiente. Contrato y QA backend/web: `../yerba-plataform/docs/social-feed.md` y `../yerba-plataform/QA.md`.

### Rediseño visual del feed móvil — 2026-10-17

- Se reemplazaron las tarjetas anidadas por una lista editorial con separadores. Autor y fecha comparten cabecera; la reseña conserva su valoración en hojas y su texto completo. La yerba aparece como referencia compacta con nombre, marca, imagen real o icono de hoja y enlace a su ficha. Se retiraron del feed la descripción de catálogo, estadísticas duplicadas, collage decorativo y controles de favorito/comparación de la tarjeta completa; esas funciones siguen en sus pantallas existentes.
- Se conservan los datos y contratos de API, pestañas, privacidad, paginación, actualización y estados de error/vacío. No se modificó la web ni la API en esta revisión.
- Captura iPhone 17 Pro/iOS 26.4: `.impeccable/review/phone-ios.png`. Se ven dos reseñas completas y el comienzo de una tercera. Revisión visual independiente: aprobada para el alcance de teléfono iOS, sin correcciones materiales. No equivale a verificación de VoiceOver, tipografía ampliada, iPad o Android.
- Tipos y 46 pruebas correctas; lint sin errores y con la advertencia previa de `moveCarousel` en Inicio. Exportaciones iOS/Android verificadas. El tap de Argent sobre el nuevo enlace de producto no cambió la pantalla; se mantiene pendiente el recorrido táctil completo. Los enlaces y etiquetas están presentes en el árbol de accesibilidad.

### Imagen de yerba y diferenciación de marcas — 2026-10-17

- Referencias de yerba en reseñas: espacio de foto de 68×88 pt con imagen real del catálogo en modo contain. Imagen ausente/fallida: símbolo nativo de foto y texto traducido «Sin foto». Una URL de imagen nueva puede recuperarse del estado de error anterior.
- Eventos de marcas: panel de superficie con borde, logo real o símbolo de tienda, etiqueta explícita «Marca», símbolo de anuncio y descripción de actividad. Producto destacado con foto de 84×108 pt, nombre y «Ver yerba»; las reseñas mantienen su lista abierta y su puntuación en hojas.
- Iconos definidos para SF Symbols en iOS y Material Community Icons en Android. Fecha visible compacta y etiqueta accesible completa.
- Verificado: tipos, lint (solo advertencia previa de Inicio), 46 pruebas y exportaciones iOS/Android. Capturas reales iPhone 17 Pro: `.impeccable/review/phone-ios-review.png` y `phone-ios-brand.png`. Revisión visual independiente aprobada sin correcciones materiales.
- Los productos locales de prueba no tienen imágenes, por lo que se verificó visualmente el estado Sin foto. Quedan pendientes la carga de una foto real, tipografía ampliada, VoiceOver, Android/iPad y navegación táctil. Para alcanzar las marcas se activaron callbacks existentes de Cargar más y scroll del listado mediante depurador, sin modificar los datos de API.

### Referencia editorial de yerba en reseñas — 2026-10-17

- Se retiraron de las reseñas el contenedor salvia y el recuadro de imagen ausente. La referencia queda sobre el papel con un separador fino, nombre en Lilita, marca y estado «Sin foto» como metadatos. Las imágenes reales conservan su miniatura cuando estén disponibles; las publicaciones de marcas mantienen su diseño diferenciado.
- Captura iPhone: `.impeccable/review/phone-ios-reference.png`. Tipos, formato y lint correctos (advertencia previa de Inicio). Cambio visual local; no se modificaron API, datos ni navegación. Carga de imagen real, texto ampliado y recorrido táctil siguen sin comprobarse en esta revisión.

### Composición editorial de marcas — 2026-10-17

- Publicaciones de marcas con cabecera compacta, logo real o iniciales, fecha y procedencia «Marca». Nombre de la yerba en Lilita de 28 pt y enlace «Ver yerba» al pie con separador fino.
- Se eliminó el bloque grande de foto ausente de los eventos de marcas. Las imágenes disponibles conservan un espacio amplio de 164 pt en modo contain. Los estados sin foto/fallo se resuelven con la composición textual; las reseñas conservan su diseño anterior.
- Captura real de iPhone: `.impeccable/review/phone-ios-brand-editorial.png`. Tipos, lint y formato correctos; advertencia previa en Inicio. Imagen presente, texto ampliado y navegación táctil permanecen fuera de esta revisión visual.

### Yerba protagonista e insignia de incorporación — 2026-10-17

- Los eventos de tipo producto tienen una composición propia centrada en la yerba: región verde, nombre en Lilita de 34 pt, insignia lima «Nueva en el catálogo», fecha y acceso a la ficha. La marca pasa a un enlace secundario al pie. La insignia describe la incorporación al catálogo y no afirma un lanzamiento comercial; no se aplica a reseñas ni noticias de marca.
- La foto real usa un espacio de 192 pt cuando existe; no se dibuja una foto ni un hueco cuando falta/falla. Reseñas y noticias conservan sus representaciones anteriores.
- Verificados tipos, lint (advertencia previa de Inicio), 46 pruebas y exportaciones iOS/Android. Captura real de teléfono iOS: `.impeccable/review/phone-ios-new-yerba.png`. Revisión visual independiente sin correcciones materiales en ese alcance. Persisten las limitaciones de imagen real, tipografía ampliada, VoiceOver y navegación táctil.

### Reutilización directa de la tarjeta de Explorar — 2026-10-17

- Por indicación explícita del usuario, los eventos de incorporación de yerba usan ahora el mismo componente `YerbaCard` que Explorar. Se retiró el anuncio verde alternativo. Se conservan collage, imagen/fallback, tipografía, puntuación, estilo, país y funciones de favorito/comparación del catálogo.
- Se agregó a `YerbaCard` una propiedad opcional `badge` con texto visible y etiqueta accesible. Social muestra «Nueva» y anuncia «Nueva en el catálogo»; Explorar no pasa esta propiedad y conserva su representación. Fecha y enlace a marca permanecen debajo de la tarjeta en Social.
- Verificados tipos, formato, lint (advertencia previa de Inicio), 46 pruebas y exportaciones iOS/Android. Captura real de teléfono: `.impeccable/review/phone-ios-explore-cards.png`. No se verificaron gestos/favoritos/comparación manualmente, ni rama de foto real o tipografía ampliada.

## Push, preferencias y Me gusta — 2026-10-17

- Implementación sin worker: envío directo post-commit, preferencias por cuenta y permisos por dispositivo.
- `bun run typecheck` pasó; tests móviles: 51 pruebas, incluyendo destinos tipados, permiso explícito, baja/alta serializada y cambio de vinculación.
- Exportaciones iOS y Android completadas. Ejecutar también la reconstrucción nativa: exportar JS no incorpora módulos al binario instalado.
- `bun run lint`: sin errores; queda el warning existente moveCarousel en src/screens/home.tsx.
- Web: typecheck, lint, build y 314 pruebas pasaron, incluyendo guardado fallido de preferencias y reacciones.
- API: 166 pruebas nuevas y de cuentas/seguimientos/reseñas pasan en SQLite aislado (2 pruebas de concurrencia omitidas por requerir PostgreSQL). La suite completa inicial obtuvo 720 aprobadas, 2 omitidas y 24 fallidas: 23 requieren capacidades PostgreSQL/infraestructura no disponibles en SQLite; una detectó una consulta extra de reacciones y fue corregida mediante subconsultas anotadas. Verificar nuevamente la suite oficial contra PostgreSQL antes del despliegue.
- Docker no fue accesible desde el entorno de ejecución. Las dependencias Python se instalaron desde wheels locales en un entorno temporal, sin modificar dependencias del proyecto.
- No se confirmó entrega push real ni QA visual de la versión nueva: CocoaPods falló al preparar Hermes por falta de acceso a GitHub y del ejecutable cmake. No hay Android disponible para validación de dispositivo.
- Pendiente en un entorno con toolchain y credenciales: reconstruir iOS/Android, validar APNs/FCM, aceptar/rechazar permisos, sincronización tras volver de ajustes del sistema, múltiples dispositivos y logout, taps en los tres estados de la app y contenido eliminado/bloqueado.
- Preparación y variables de producción: ../yerba-plataform/docs/notifications.md. Los envíos quedan deshabilitados por defecto (PUSH_ENABLED=false). Newsletter no dispara campañas; solo registra consentimiento.


## Últimas reseñas en perfil público — 2026-10-17

- Carrusel entre Seguir y las pestañas de biblioteca, con hasta cinco reseñas públicas ordenadas por creación descendente y desempate por ID. Tarjetas enlazadas al detalle, con marca, yerba, hojas de valoración, comentario y fecha. Sin reseñas se oculta; carga y error tienen estados propios.
- Avance cada cinco segundos, sin botón Pausar/Reanudar. Se detiene durante el contacto y retoma al soltar; también se detiene fuera de foco, en segundo plano y con movimiento reducido o lector de pantalla.
- GET profiles/<username>/reviews/recent/ respeta cuentas activas, privacidad, bloqueos en ambas direcciones y moderación de reseñas/productos/marcas. Datos por visitante mediante TanStack Query, sin persistencia.
- Validación: typecheck, 51 tests móviles y 43 pruebas de API aprobadas; 2 pruebas de concurrencia PostgreSQL omitidas en SQLite. Lint sin errores, con warning previo moveCarousel en home.tsx.
- Argent/iPhone 17 Pro: se comprobó ubicación, cinco tarjetas reales del perfil de desarrollo y avance de primera a segunda reseña. Se verificó visualmente la eliminación del botón Pausar. Android no disponible; comportamiento táctil con movimiento reducido/lector de pantalla pendiente de validación manual.


## Corazón y contador en todas las reseñas — 2026-10-17

- Componente compartido sin borde en detalle de reseña, opiniones de yerba, feed social y carrusel del perfil. Corazón vacío/lleno según la cuenta actual, contador real y acción de Me gusta/Quitar Me gusta. En el carrusel, enlace al detalle y reacción son controles hermanos para evitar abrir la reseña al tocar el corazón.
- Feed de API ahora devuelve likes_count y liked_by_me con subconsultas anotadas por visitante; una prueba comprueba contadores, estado diferente entre cuentas y retiro de la reacción. La web reutiliza el corazón en tarjetas y feed. Reseñas no publicadas muestran el contador deshabilitado.
- Validación: typecheck en ambos clientes, 39 tests de API, 51 móviles y 314 web aprobados. Lint web sin advertencias; lint móvil mantiene solo el warning previo de home.tsx. Argent confirmó visualmente el corazón y contador en el carrusel iOS; apertura del feed por deep link no se confirmó.

## Social refresh — 2026-10-17

- Se separó el indicador de actualización manual de los refetch automáticos; el feed conserva su FlatList al cambiar de pestaña.
- Los me gusta actualizan las dos cachés del feed con la respuesta del servidor sin invalidarlas. Las otras consultas privadas conservan su invalidación.
- Al enfocar Social se reutiliza la caché fresca durante 60 segundos. Regresión cubierta en social-feed-query.test.ts para volver a ambas pestañas sin nuevas peticiones.
- Validación: typecheck OK; 51 tests OK; lint sin errores (warning existente en home.tsx: moveCarousel); exportaciones iOS y Android OK.
- Simulador iOS conectado y bundle recargado. La captura tras los taps no confirmó cambios de selección/contador; queda pendiente confirmar visualmente el ciclo completo de me gusta y alternancia de pestañas. Android sin dispositivo disponible.

## Probada tras opinar — 2026-10-17

- Guardar/editar una opinión invalida y actualiza el estado privado de la yerba, las listas y el resumen de biblioteca antes de volver a la ficha. También invalida las opiniones autenticadas que consume la ficha.
- Typecheck OK; 51 tests OK; lint sin errores (warning preexistente de moveCarousel en home.tsx); exportaciones iOS y Android OK en /private/tmp/yerbarium-reviewed-{ios,android}.
- Pendiente validación visual: publicar opinión de una yerba no probada y comprobar selección de Probada y contador de biblioteca al volver. No se publicó una opinión durante esta comprobación.

## Perfil técnico a ancho completo — 2026-10-17

- Las escalas del perfil de la comunidad usan LeafRating fullWidth: las cinco hojas se distribuyen en el espacio disponible y el valor queda alineado a la derecha.
- Typecheck y 51 tests OK; lint sin errores, con warning preexistente en home.tsx.
- Se intentó abrir Perfil desde Opiniones con Argent en iOS; el tap no cambió de pestaña, por lo que queda pendiente la confirmación visual del ancho. Android sin dispositivo disponible.

## Tamaño de hojas y títulos del perfil — 2026-10-17

- Hojas de atributos comunitarios de 30 puntos, igual que en la evaluación sensorial de la reseña; conservan distribución a ancho completo.
- Títulos de atributos de 20 puntos, interlineado 26 y fuente bold, con rol de encabezado accesible.
- Typecheck, 51 tests y diff --check OK; lint sin errores (warning preexistente de home.tsx). Confirmación visual pendiente; la navegación por taps en el simulador no respondió en la comprobación anterior.

## Descripciones de notificaciones — 2026-10-18

- Cada interruptor incluye una explicación visible y accesible, traducida a los cinco idiomas. Sociales describe seguidores y Me gusta; Marcas y Descubrimiento aclaran que guardan preferencias futuras; Newsletter explica el canal email y su independencia.
- Typecheck OK; lint sin errores (warning previo de moveCarousel); exportaciones iOS y Android OK; diff --check OK.
- Tests: 50 OK y 1 fallo de cobertura de traducciones por siete textos de otras pantallas ausentes del catálogo inglés, también ausentes en HEAD antes del cambio.
- Verificación visual pendiente: el simulador iOS muestra «Could not connect to development server» al intentar cargar Metro en localhost:8081. No hay emulador Android activo.
