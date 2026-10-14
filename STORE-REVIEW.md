# Yerbarium — revisión para App Store y Google Play

**Fecha:** 13 de octubre de 2026  
**Alcance:** revisión estática del cliente Expo/React Native y de los endpoints de cuenta, catálogo y opiniones del backend; actualización posterior a la implementación del flujo de eliminación de cuenta. No se generó un binario de tienda.  
**Producto observado:** guía y catálogo de yerba mate: explorar y comparar productos, consultar artículos editoriales y, con una cuenta, guardar una biblioteca personal y publicar opiniones con notas sensoriales.

> Los datos de App Store Connect y Play Console no están en el repositorio. Las declaraciones de privacidad, clasificación por edades, ficha de tienda, formulario Data safety, disponibilidad territorial y arte final quedan por confirmar contra el binario y las cuentas de publicación.

## 1. Resumen ejecutivo

- La propuesta de valor está clara y se puede explorar sin iniciar sesión; cuenta necesaria solo para biblioteca y opiniones (`yerbarium-app/README.md`, rutas `src/app/(tabs)` y `src/screens/detail.tsx`).
- **Eliminación de cuenta implementada; pendiente validar en binarios y publicar:** la app tiene una pantalla separada “Eliminar cuenta”; la privacidad del perfil permanece en Editar perfil. La web ofrece `/eliminar-cuenta/`; `DELETE /api/v1/auth/me/` pide contraseña, revoca refresh tokens y elimina perfil, biblioteca y opiniones en cascada. Registrar la URL HTTPS final en Play Console después del despliegue.
- **Prioridad alta en ambas tiendas:** las opiniones son UGC visible públicamente, pero el cliente no ofrece reportar contenido/usuarios ni bloquear usuarios. El backend sí tiene moderación administrativa (`reviews/admin.py`), pero no equivale a controles disponibles para quien usa la app.
- **Prioridad alta en Apple; alta de confianza y política en Play:** Registro dice que crear una cuenta implica aceptar términos, pero no enlaza términos ni pide una acción afirmativa (`src/screens/account.tsx`, `RegistrationForm`).
- **Privacidad pendiente de cerrar:** `posthog-react-native` recoge eventos/pantallas e identifica al usuario por ID si se configura el token (`src/analytics.ts`, `src/app/_layout.tsx`). La baja elimina datos propios de Yerbarium, pero no solicita purga de eventos/personas ya enviados a PostHog. Sigue faltando una política pública y la ruta de privacidad que la enlace.
- No se encontró monetización en el cliente ni integración de StoreKit/Google Play Billing. Sin compras no hace falta implementar restauración; si se introducen funciones digitales de pago, deberán implementarse con el sistema de compra de cada tienda y sus pantallas de términos.
- No se encontraron permisos sensibles de cámara, micrófono, ubicación o contactos. Confirmar los permisos del **AAB/IPA final**, incluidos los añadidos por dependencias.
- La app ya tiene suficiente funcionalidad visible para construir una ficha concreta. No publicar capturas de pantallas vacías, login como experiencia principal ni funciones futuras (por ejemplo, modo offline completo o compra dentro de la app).
- Pendiente inmediato: publicar la política de privacidad y los términos, exigir aceptación afirmativa al registrarse, definir purga/retención de PostHog y probar eliminación con cuentas de prueba en builds de distribución.

## 2. Registro de riesgos priorizado

| Prioridad | Área                     | Hallazgo                                                                                                                                                                                      | Por qué puede frenar/rechazar                                                                                                                                                                                                                            | Evidencia                                                                                                                                                                 | Recomendación                                                                                                                                                                                                                                                       | Esfuerzo | Confianza |
| --------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- |
| P1        | Cuenta / privacidad      | Eliminación implementada en app, web y API; falta verificar el despliegue público y registrar su URL en Play Console. La baja borra también opiniones identificables y revoca refresh tokens. | Apple requiere inicio de eliminación dentro de la app; Play pide también recurso web público y registro de esa URL en consola.                                                                                                                           | `src/screens/privacy-account.tsx`; `apps/web/app/eliminar-cuenta/page.tsx`; `apps/api/accounts/views.py`, `MeView.delete`.                                                | Publicar `/eliminar-cuenta/` bajo HTTPS, registrar URL en Play Console y verificar baja de punta a punta con cuenta de prueba.                                                                                                                                      | M        | Alta      |
| P1        | UGC / contenido          | Reporte de opinión/usuario y bloqueo implementados en API, app y web; el bloqueo filtra opiniones y perfiles para quien bloquea.                                                              | La función ya está disponible en código. Antes de publicar, configurar operación de moderación y validar la experiencia con cuentas reales en builds de tienda.                                                                                          | `apps/api/moderation/`; `src/components/community-safety-actions.tsx`; `apps/web/components/reviews/community-safety-actions.tsx`.                                        | Asignar responsables de revisar la cola en Django Admin, publicar reglas/contacto de comunidad y verificar el flujo en iOS, Android y web.                                                                                                                          | M        | Alta      |
| P1        | Legal / cuenta           | Registro declara aceptación implícita de términos, sin enlace ni checkbox explícito.                                                                                                          | En Apple, los términos deben estar accesibles y aceptarse antes del registro/login cuando corresponda; una frase sin destino ni acción deja sin demostrar el consentimiento. También dificulta cumplimiento UGC en Google.                               | `src/screens/account.tsx`, `RegistrationForm`: texto “Al crear una cuenta, aceptás los términos y condiciones…” inmediatamente antes de “Crear cuenta”.                   | Publicar términos accesibles; enlazarlos en registro e ingreso y exigir una casilla inicialmente desmarcada antes de enviar registro. Los términos deben prohibir contenido abusivo y describir moderación.                                                         | M        | Alta      |
| P1        | Privacidad               | Sigue faltando política pública y una ruta de privacidad que explique datos, finalidad, retención, terceros y contacto.                                                                       | App Store Connect requiere URL de privacidad y declaración de datos propios y de terceros. Google pide política pública y coherencia con Data safety.                                                                                                    | `src/api/account-types.ts`, `src/providers/session.tsx`, `src/analytics.ts`; existe página de eliminación, pero no política de privacidad.                                | Publicar política HTTPS para ambas tiendas y enlazarla dentro de app y consolas. Falta el correo oficial de privacidad/soporte antes de publicar el contacto.                                                                                                       | M        | Alta      |
| P1        | Privacidad / analítica   | PostHog recibe vistas/eventos e identificación estable de la cuenta cuando se configura.                                                                                                      | Debe reflejarse en las etiquetas de privacidad de Apple y Data safety de Play; identificadores ligados a una cuenta pueden considerarse datos vinculados. No se ve un control para desactivar analítica.                                                 | `src/analytics.ts`; `src/app/_layout.tsx` identifica `user.id`, captura `$screen`; `posthog-react-native` en `package.json`.                                              | Inventariar eventos y datos de dispositivo del SDK/configuración del proyecto PostHog; declarar recopilación/propósitos/compartición y establecer consentimiento/control si la operación o jurisdicción lo requiere. Verificar retención y eliminación con PostHog. | M        | Alta      |
| P1        | Privacidad / analítica   | La baja no elimina actualmente eventos/personas ya recibidos por PostHog.                                                                                                                     | La información de privacidad y la respuesta de eliminación deben corresponder al tratamiento real; el borrado Django por sí solo no purga el proveedor.                                                                                                  | `src/analytics.ts`; `src/app/_layout.tsx`; `apps/api/accounts/apps.py`.                                                                                                   | Definir retención y mecanismo de supresión en PostHog; revisar identificación persistente y declaraciones App Privacy/Data safety antes de publicar.                                                                                                                | M        | Alta      |
| P1        | Revisión / UX            | No se documenta una cuenta reviewer ni datos de demo.                                                                                                                                         | La cuenta desbloquea biblioteca/opiniones; sin credenciales válidas el equipo de revisión no puede recorrer escritura ni perfil, aunque el catálogo es público.                                                                                          | `src/components/ui.tsx` `RequireSession` y `src/screens/account.tsx`; `QA.md` menciona cuenta de prueba de desarrollo, no credenciales para tienda.                       | Preparar cuenta demo estable, datos semilla seguros y pasos en App Review Notes y Play App access. No compartir credenciales reales del equipo.                                                                                                                     | S        | Alta      |
| P2        | Configuración / Android  | El target API, permisos fusionados y manifiesto final no quedan demostrados por `app.json` solamente.                                                                                         | Play no acepta nuevas apps/actualizaciones por debajo del target API vigente. Los permisos heredados de dependencias también deben estar justificados.                                                                                                   | `yerbarium-app/app.json` no declara `targetSdkVersion` ni permisos explícitos; no se encontró proyecto Android nativo versionado en el alcance.                           | Antes de subir, revisar el manifiesto del AAB y Play Console; cumplir API 36 desde el 31-08-2026 según la política actual, o la excepción/extensión aplicable. Quitar permisos innecesarios.                                                                        | S        | Media     |
| P2        | Privacidad / iOS         | El `PrivacyInfo.xcprivacy` versionado declara `NSPrivacyCollectedDataTypes` vacío, mientras la app puede enviar datos de cuenta y analítica.                                                  | La etiqueta de App Store debe ser completa y concordar con las prácticas reales y SDKs. La manifestación de datos propia y los manifests de SDK son piezas distintas; el archivo vacío no prueba por sí solo incumplimiento, pero merece reconciliación. | `ios/Yerbarium/PrivacyInfo.xcprivacy`; configuración PostHog en cliente y backend (`apps/api/accounts/apps.py`).                                                          | Generar/revisar Privacy Report del archive de distribución y manifests de dependencias; confirmar qué debe declarar el manifest de la app y declarar todos los datos en App Store Connect.                                                                          | M        | Media     |
| P2        | Técnico / disponibilidad | Si la API productiva falla, escritura y restauración de sesión dependen de red; no hay modo demo local.                                                                                       | Puede aparentar que funciones importantes están rotas para el reviewer; HTTP/API no disponible interrumpe registro, biblioteca y publicación.                                                                                                            | `src/api/client.ts` timeout de 15 s; `src/providers/session.tsx`; `README.md` indica que escrituras requieren conexión.                                                   | Probar IPA/AAB con backend de producción; añadir estados de error y reintento claros y mantener catálogo/artículos públicos disponibles. Entregar credenciales demo funcionales.                                                                                    | M        | Alta      |
| P3        | Metadata                 | No hay metadata ni capturas de tienda dentro del repo.                                                                                                                                        | Ficha incompleta, vaga o con screenshots ajenas a la app puede perjudicar revisión, conversión y políticas de metadata.                                                                                                                                  | `app.json` define nombre/IDs/íconos, no subtitle, descripción, keywords, URL legal ni screenshots. `assets/branding/preview.png` es branding, no evidencia de ficha real. | Usar las propuestas de la sección 7 como primer borrador; capturar builds de release con datos reales, sin precios/claims no implementados ni testimonios inventados.                                                                                               | M        | Alta      |

## 3. Hallazgos detallados

### Privacidad y manejo de datos

**Qué aparece en el código.** El registro solicita usuario, email y contraseña. El perfil contiene nombre público, bio, país/idioma y privacidad. La app guarda biblioteca y opiniones en la API. `SecureStore` conserva el refresh token; el access token es de memoria; caché persistente solo para consultas públicas según `README.md`. PostHog se activa por `EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN`, captura eventos/pantallas e identifica cuenta. El backend también configura PostHog con `POSTHOG_PROJECT_TOKEN` y captura sucesos de cuentas/reseñas.

**Qué falta.** Política accesible públicamente y dentro de la app; Data safety de Play; App Privacy de Apple; confirmación del contenido del Privacy Report final y de las prácticas de retención del backend/analytics. No se encontró permiso ATT ni señales de publicidad/IDFA o tracking entre apps; no concluir que se necesita ATT solo por usar analítica.

**Acciones.** Hacer inventario de los datos enviados por cliente/API/SDK (incluidos logs, IP/identificadores, ubicación aproximada inferida, email, opiniones y perfil); propósitos, vinculación a identidad, retención, destinatarios y eliminación. Completar ambas fichas usando el comportamiento real. Incluir URL pública de privacidad; App Store también acepta URL opcional para controles de privacidad.

**Verificación.** Revisar tráfico/eventos de una cuenta de pruebas, el proyecto/configuración PostHog, Privacy Report del archive y manifiesto Android del AAB; cotejar cada categoría con las respuestas publicadas en App Store Connect y Data safety.

### Permisos y capacidades

No se encontraron usos de cámara, micrófono, contactos, ubicación ni notificaciones. La configuración Expo incluye Router, SecureStore, fuentes, splash y localización. Esto apunta a una superficie de permisos limitada, pero no permite asegurar qué acabará en el IPA/AAB tras resolver plugins y dependencias.

**Acciones/verificación.** Inspeccionar permisos fusionados del AAB y `Info.plist` del IPA de distribución. Si aparece uno sensible, eliminarlo si no hay función de usuario que lo justifique; si se necesita, explicar en lenguaje concreto y pedirlo justo cuando el usuario activa esa función. Completar clasificación de edad/contenido de ambas tiendas, incluida la presencia de interacción social y contenido creado por usuarios.

### Monetización

No hay SDK de compras, StoreKit ni Google Play Billing visibles en dependencias o flujos revisados. Los enlaces de compra de yerbas aparecen como enlaces externos de catálogo (`src/screens/detail.tsx`, `PurchaseOptions`), aparentemente para productos físicos; verificar los destinos reales y que no se conviertan en pagos externos para desbloquear contenido/funciones digitales.

Si se añade una suscripción o funcionalidad digital: Apple In-App Purchase y Google Play Billing en territorios donde las reglas lo exijan; mostrar precio, período, renovación/prueba y condiciones; ofrecer gestión/restauración cuando aplique; actualizar esta auditoría y las fichas antes de publicar.

### Cuenta y autenticación

Registro e ingreso son rutas públicas, pero no se observó Sign in with Apple, Google Sign-In u otro login social; **no hay hallazgo de obligación de iniciar sesión con Apple** a partir del código actual. El backend admite alta por `auth/token/register/`, muestra perfil público y permite privacidad de perfil. No aparece baja de cuenta.

**Acciones.** Crear baja desde los ajustes de cuenta, anular tokens, eliminar/anonimizar perfil, biblioteca y opiniones atribuibles, definir qué datos agregados o legalmente retenidos subsisten y mostrarlo al usuario. Google además necesita recurso web de eliminación y su URL en Play Console. Hacer que términos/privacy estén disponibles antes de completar alta y asegurar que la elección de aceptación no venga premarcada.

**Verificación.** Alta nueva acepta términos explícitamente; cuenta demo inicia sesión; baja elimina cuenta y datos conforme a política; URL web funciona sin iniciar sesión; intento de sesión vieja falla; opinión propia y perfil dejan de aparecer o quedan anonimizados según lo explicado.

### Contenido, comunidad y enlaces externos

Las reseñas incluyen puntuación, texto opcional, atributos sensoriales y nombre de usuario y se muestran en fichas/perfiles. El backend modela estados `PUBLISHED`, `PENDING` y `HIDDEN` y ofrece acciones administrativas de moderación. La app y la web ahora permiten reportar opiniones/usuarios y bloquear/desbloquear usuarios. Los reportes quedan en una cola de Django Admin. Términos no están disponibles en un destino visible.

**Acciones.** Asignar responsables para revisar la cola de reportes, publicar contacto de seguridad/soporte y definir normas contra acoso/abuso en términos. No prometer una ventana de resolución que el equipo no pueda cumplir. Mantener los enlaces editoriales y de compra verificados, con etiquetas claras de salida a web.

**Verificación.** Probar reporte y bloqueo entre dos cuentas, moderación y retirada del contenido, aviso al operador, privacidad de perfil y enlaces web. Incluir recorrido y cuenta demo en notas.

### Estabilidad técnica y calidad

El proyecto tiene manejo de timeout, errores HTTP, refresh de sesión y contenido público cacheado/offline; los artículos editoriales están empaquetados localmente (`README.md`, `src/api/client.ts`). No se encontró evidencia de crashes en esta revisión estática. `QA.md` registra validaciones previas, pero también deja recorridos Android/iOS y API pendientes; no considero eso evidencia de release de tienda verificado.

**Acciones/verificación.** Antes de enviar, validar el build de distribución (no solo Metro/export JS), backend público HTTPS con datos de catálogo, registro/login, sesión rechazada/expirada, biblioteca/opinión, fallos y recuperación de red, enlaces, teléfono/tablet, VoiceOver/TalkBack y tamaño de texto. La app debe abrir y explicar su valor sin cuenta y mostrar fallos de red entendibles.

### UX y revisión

Los flujos más útiles para revisión son: explorar catálogo → ficha → comparar; cultura matera; registro/ingreso → biblioteca → opinión; perfil público/privacidad. La revisión completa de escritura necesita cuenta y backend. La guía QA menciona cuenta de pruebas, sin credenciales de tienda en el repo.

**Acciones.** Preparar una cuenta de revisión estable con una biblioteca, perfil y opiniones de muestra no sensibles; preservar la cuenta y resetear contraseña/datos entre envíos; completar los campos App Review Information / App access en Play Console. Mantener instrucciones por pasos en ambos canales de revisión.

## 4. Checklist de experiencia de revisión

| Paso del reviewer                | App Store                                          | Google Play                                        | Evidencia / pendiente                                                                                                                                                                                                                                     |
| -------------------------------- | -------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Instalar y abrir                 | Pendiente                                          | Pendiente                                          | Revisar IPA/AAB y backend de producción; no se inspeccionó binario firmado.                                                                                                                                                                               |
| Entender el propósito sin cuenta | Parece posible                                     | Parece posible                                     | Catálogo y artículos públicos según rutas y README; probar desde instalación limpia.                                                                                                                                                                      |
| Permisos                         | Sin permisos sensibles identificados en `app.json` | Sin permisos sensibles identificados en `app.json` | Confirmar manifests finales, SDK y permisos indirectos.                                                                                                                                                                                                   |
| Función central                  | Parcialmente disponible sin sesión                 | Parcialmente disponible sin sesión                 | Catálogo/fichas/comparación/editorial; revisar el resto con demo account.                                                                                                                                                                                 |
| Crear cuenta / términos          | No listo                                           | No listo                                           | Texto no enlazado, sin consentimiento afirmativo visible.                                                                                                                                                                                                 |
| Eliminar cuenta                  | Implementado, sin validar en build final           | Implementado, sin URL pública registrada           | App tiene pantalla independiente `Eliminar cuenta`; la privacidad de perfil queda en Editar perfil. La web ofrece `/eliminar-cuenta/`; la API pide contraseña, elimina datos propios y revoca refresh tokens. Despliegue/HTTPS y Play Console pendientes. |
| UGC: reporte/bloqueo             | Implementado en código; pendiente validar en build | Implementado en código; pendiente validar en build | Reportes y bloqueos en API; moderación disponible en Django Admin.                                                                                                                                                                                        |
| Compras/restaurar                | No aplica en la versión inspeccionada              | No aplica en la versión inspeccionada              | No se encontró IAP ni suscripción. Verificar enlaces externos de producto.                                                                                                                                                                                |
| Privacidad/soporte               | Pendiente                                          | Pendiente                                          | Falta política pública, enlace desde la app, contacto oficial y declaraciones de tienda.                                                                                                                                                                  |
| Sin conexión / estados vacíos    | Parcial por diseño                                 | Parcial por diseño                                 | Lectura pública guardada; escrituras dependen de red; probar offline, catálogo vacío y error API.                                                                                                                                                         |

## 5. Borradores para consola

### App Store Connect — App Review Notes

```text
Yerbarium es una guía y catálogo de yerba mate. El catálogo, la comparación y los artículos editoriales se pueden consultar sin crear una cuenta.

Para revisar biblioteca personal, perfil y opiniones:
1. Abrir Perfil > Ingresar.
2. Usar la cuenta demo indicada abajo.
3. Abrir Explorar > elegir una yerba > guardar en biblioteca o abrir Opiniones.

Cuenta demo: [EMAIL/USUARIO]
Contraseña: [CONTRASEÑA TEMPORAL]

No hay compras, suscripciones ni permisos sensibles requeridos en esta versión.
Soporte: [URL]
Privacidad: [URL]
Términos: [URL]
```

Reemplazar campos solo después de tener una cuenta demo operativa y URLs públicas funcionales. Si se agrega permiso o compra, explicar aquí cómo invocarlos.

### Play Console — App access / instrucciones al reviewer

```text
Todas las funciones de catálogo y artículos son accesibles sin cuenta.

Para probar biblioteca y opiniones:
1. Abrir Perfil > Ingresar.
2. Iniciar sesión con la cuenta de prueba indicada.
3. Abrir Explorar > una ficha de yerba > Biblioteca u Opiniones.

Usuario/email: [USUARIO DE PRUEBA]
Contraseña: [CONTRASEÑA TEMPORAL]

No se requieren permisos sensibles ni compras para probar la versión enviada.
Política de privacidad: [URL PÚBLICA PENDIENTE]
Solicitud web de eliminación de cuenta: [DOMINIO]/eliminar-cuenta/
```

Configurar en Play Console las credenciales de acceso y la URL de eliminación de cuenta en los campos actuales, además de este texto. No incluir secretos permanentes ni cuentas personales.

## 6. Checklist de configuración para ambas tiendas

### App Store Connect

- [ ] Nombre, bundle ID `app.yerbarium.mobile`, SKU, idioma principal, copyright y disponibilidad.
- [ ] Categoría principal **Food & Drink**; secundaria sugerida **Lifestyle** si App Store Connect la ofrece para el storefront y la ficha sigue siendo principalmente catálogo/guía. Revisar la categoría contra el producto final.
- [ ] Subtitle (≤30 caracteres), descripción (≤4.000), keywords (≤100 bytes), URL promocional opcional, URL soporte y URL privacidad.
- [ ] Responder App Privacy incluyendo PostHog/terceros, cuenta, email, actividad/opiniones y datos de perfil según el flujo real.
- [ ] Completar rating por edades con comunidad/UGC y contenido real. No marcar Made for Kids sin que sea un producto dirigido a niños y haber cumplido sus requisitos.
- [ ] Subir screenshots requeridos para iPhone compatible con Dynamic Island y para iPad de 13 pulgadas porque `supportsTablet: true`. Al menos uno por tamaño requerido; hasta diez por tamaño.
- [ ] Confirmar export compliance a partir de la configuración real. `ITSAppUsesNonExemptEncryption: false` ya figura en `app.json`, pero debe concordar con el binario/uso criptográfico.
- [ ] Completar información de contacto de revisión y notas; usar TestFlight/IAP sandbox si se incorporan compras.

### Google Play Console

- [ ] App name (≤30), short description (≤80), full description (≤4.000), categoría y tags exactos disponibles en consola.
- [ ] Categoría recomendada: **Food & Drink**; probar tags afines como **Food & Drink**, **Lifestyle** o cultura solo si el selector los ofrece y la ficha demuestra esa relevancia. Google Play usa tags seleccionados, no campo de keywords libre de Apple.
- [ ] URL de privacidad y formulario Data safety, incluida actividad de analítica, cuenta y eliminación. Declarar SDKs y backend, no solo lo que se ve en `app.json`.
- [ ] Desplegar y verificar el mecanismo ya implementado en app y web; registrar `https://[dominio]/eliminar-cuenta/` en el área de Data deletion y completar sus preguntas.
- [ ] Completar clasificación de contenido, Ads declaration (si no hay anuncios), target audience/children, App access y contacto.
- [ ] Revisar permisos/components del AAB final, backup/data extraction, enlaces y dominios HTTPS.
- [ ] A fecha de este informe, para nuevas apps y actualizaciones el target debe ser API 36 o superior desde el 31 de agosto de 2026; revisar la política por posible extensión/excepción y el requisito aplicable al canal.
- [ ] Subir AAB firmado, ficha de gráficos y capturas en todos los formatos requeridos por Play Console; no usar imágenes promocionales que impliquen funciones inexistentes.

## 7. Metadata y posicionamiento sugeridos

Son propuestas iniciales basadas en lo que hace el código, no en volumen de búsqueda. Antes de localizarlas, decidir mercado prioritario (Argentina/Cono Sur o distribución global) y validar en App Store Search Ads/Play Console datos de conversión y términos locales. Mantener español rioplatense para el mercado argentino; crear metadata separada en portugués para Brasil y en inglés solo si la experiencia está suficientemente localizada.

### App Store — español (Argentina)

- **Nombre:** `Yerbarium` (9 caracteres; conservar marca).
- **Subtitle:** `Descubrí y compará yerbas` (25 caracteres; dentro del máximo de 30).
- **Categoría primaria:** `Food & Drink`.
- **Categoría secundaria:** `Lifestyle` (sugerida si sigue siendo válida y disponible al configurar).
- **Keywords (borrador, ≤100 bytes):** `mate,yerba,tereré,chimarrão,infusión,catálogo,marcas,sabores`
  - No repetir `Yerbarium` (nombre de app); evitar nombres de competidores, términos ajenos, marcas no autorizadas y texto promocional/precios.
- **Descripción corta sugerida:** `Explorá yerbas, compará perfiles y guardá tus favoritas. Leé opiniones y descubrí la cultura matera.`
- Las palabras clave de Apple se separan por comas; el límite es en bytes. Comprobar conteo UTF-8 después de cada traducción.

### Google Play — español (Argentina)

- **Nombre:** `Yerbarium`.
- **Short description (≤80):** `Explorá, compará y guardá yerbas. Opiniones y cultura matera en un solo lugar.` (78 caracteres).
- **Categoría:** `Food & Drink`.
- **Tags:** seleccionar los tags actuales más cercanos a bebidas/alimentos y estilo de vida; validar que la etiqueta sea evidente en la ficha. No existe campo libre de keywords equivalente al de Apple.
- **Descripción larga sugerida:**

```text
Descubrí el mundo de la yerba mate con Yerbarium: explorá marcas, compará productos y encontrá información para elegir tu próxima ronda.

• Explorá un catálogo de yerbas con origen, estilos, presentaciones y fuentes.
• Compará entre dos y cuatro yerbas y revisá sus diferencias.
• Guardá favoritas, yerbas probadas y las que querés probar en tu biblioteca.
• Compartí una opinión con puntuación y notas sensoriales.
• Leé artículos sobre la cultura matera, el mate, el tereré y el chimarrão.

El catálogo y los artículos se pueden consultar sin crear una cuenta. Se necesita una cuenta para guardar tu biblioteca o publicar opiniones.

Yerbarium es una guía independiente. La disponibilidad, las presentaciones y los enlaces de compra dependen de la información publicada por cada marca o vendedor.
```

Eliminar la última oración si la app no puede sostenerla y enlazar la política de privacidad/soporte desde la ficha. No usar claims de salud o beneficios fisiológicos: no son la propuesta verificada en el código.

### Secuencia de screenshots propuesta

Preparar primero un build de distribución con API productiva, datos verdaderos y una cuenta semilla de demostración. Capturar pantallas del dispositivo; el copy superpuesto debe describir el contenido real y no tapar controles. Reusar la misma narrativa, adaptada a cada tienda y tamaño.

| Orden | Pantalla real a capturar                                                                | Mensaje corto sugerido           | Valor que demuestra                                                        |
| ----- | --------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------- |
| 1     | Inicio (`src/screens/home.tsx`) con hero editorial y contenido cargado                  | **Tu próxima ronda empieza acá** | Marca y propósito en primer vistazo.                                       |
| 2     | Explorar (`src/screens/explore.tsx`) con catálogo, búsqueda y filtros                   | **Encontrá tu próxima yerba**    | Descubrimiento de productos y marcas.                                      |
| 3     | Detalle (`src/screens/detail.tsx`) en ficha técnica con origen/presentaciones           | **Conocé cada yerba en detalle** | Profundidad y fuentes reales del catálogo.                                 |
| 4     | Comparar (`src/screens/compare.tsx`) con 2–4 productos y diferencias                    | **Compará perfiles lado a lado** | Diferenciador funcional claro.                                             |
| 5     | Biblioteca (`src/screens/library.tsx`) con favoritas/probadas/por probar                | **Armá tu biblioteca matera**    | Utilidad personal; captura con cuenta demo.                                |
| 6     | Ficha, pestaña de opiniones o pantalla `src/screens/review.tsx` con contenido de prueba | **Compartí lo que descubrís**    | Función comunitaria; publicar solo cuando reporte/moderación estén listos. |
| 7     | Artículo de cultura/editorial (`src/screens/editorial.tsx`)                             | **Una cultura para compartir**   | Contenido educativo y fuentes citadas.                                     |

En el primer screenshot, que debe vender el valor central, no usar pantalla de login. Mostrar datos reales y legibles, estado sin error, teléfono en español y controles que existan en release. La ficha admite capturas reales del dispositivo, no mockups que cambien la interfaz. No incluir “Gratis”, precios, promociones, valoración inventada ni controles simulados dentro del screenshot.

**Tamaño y cantidad:** Apple permite 1–10 screenshots por tamaño/localización; hoy documenta como requerido al menos un tamaño iPhone con Dynamic Island (mediano) y, si la app soporta iPad, uno de iPad de 13 pulgadas. Usar las dimensiones exactas que App Store Connect muestra al cargar (pueden variar por generación). Play: subir capturas de teléfono en la relación/dimensiones aceptadas por Play Console y arte gráfico de ficha; comprobar la guía de assets actual al exportar. Para ambos, generar archivos dedicados y no asumir que un único screenshot sirve para iPad/tablet.

## 8. Referencias oficiales consultadas

- Apple [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) y [eliminación de cuenta 5.1.1(v)](https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion/).
- Apple [App privacy](https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy), [privacidad y uso de datos](https://developer.apple.com/app-store/user-privacy-and-data-use/), [metadata por plataforma](https://developer.apple.com/help/app-store-connect/reference/app-information/platform-version-information), [categorías](https://developer.apple.com/app-store/categories/) y [tamaños de screenshot](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications).
- Google Play [requisitos para crear y configurar una ficha](https://support.google.com/googleplay/android-developer/answer/9859152), [categorías y tags](https://support.google.com/googleplay/android-developer/answer/9859673), [requisitos de eliminación de cuenta](https://support.google.com/googleplay/android-developer/answer/13327111), [política de UGC](https://support.google.com/googleplay/android-developer/answer/9876937) y [target API](https://support.google.com/googleplay/android-developer/answer/11926878).

## 9. Siguiente pasada

El flujo propio de eliminación ya está implementado: borra perfil, biblioteca y opiniones asociadas; las estadísticas de catálogo se recalculan mediante las señales existentes. No purga eventos ya enviados a PostHog. Para cerrar publicación aún faltan la política de privacidad/los términos, el correo oficial de contacto, la URL de producción, la prueba con backend y builds finales, y validar reporte/bloqueo UGC en builds de tienda. También hay que asignar operación para atender la cola de moderación.
