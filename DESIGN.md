---
name: Yerbarium App
description: Catálogo editorial matero coherente con la web de Yerbarium
colors:
  background: "#f4efdf"
  surface: "#f9f5e8"
  ink: "#153d32"
  green: "#075441"
  deep: "#064c3b"
  muted: "#3e5b4e"
  sage: "#e7ebd5"
  border: "#b7b28c"
  error: "#a72f35"
  amber: "#a5742e"
  cream: "#fff8e8"
  lime: "#c4e38c"
  selected: "#d0e3b8"
  white: "#ffffff"
  subtle-border: "#d9d2b9"
typography:
  display:
    fontFamily: "Lilita"
    fontSize: "46px"
    lineHeight: "48px"
  title:
    fontFamily: "Lilita"
    fontSize: "28px"
    lineHeight: "31px"
  body:
    fontFamily: "NunitoSans_400Regular"
    fontSize: "16px"
    lineHeight: "24px"
  caption:
    fontFamily: "NunitoSans_400Regular"
    fontSize: "13px"
    lineHeight: "19px"
  hand:
    fontFamily: "Caveat"
    fontSize: "25px"
    lineHeight: "27px"
rounded:
  control: "12px"
  card: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  chip-selected:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 14px"
  field:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "{spacing.md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.md}"
  search:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "60px"
---

# Design System: Yerbarium App

## Overview

**Creative North Star: "Catálogo editorial matero"**

La app conserva el catálogo editorial matero de la web hermana: regiones verdes, papel cálido y fotografías recortadas reales. Su identidad acompaña descubrir, buscar, comparar, guardar y conocer, con navegación nativa y controles accesibles.

La autoridad visual es `../yerba-plataform/apps/web`, especialmente sus estilos de inicio y catálogo. Esta documentación registra el código terminado de la app; no propone un rebrand. La primera pantalla es una entrada al catálogo: “Tu próxima yerba”, collage pequeño, búsqueda, estilos y yerbas destacadas. Se eliminaron los bloques de landing y las cabeceras de marca en las pestañas.

**Key Characteristics:**

- Verde profundo y papel cálido como materiales principales.
- Lilita en titulares, Nunito Sans en lectura y Caveat en anotaciones.
- Collages, fotografías y textura provenientes de la web existente.
- Stacks y pestañas nativas con campos etiquetados.

## Colors

La paleta une vegetación profunda, crema y papel; los valores normativos están en el frontmatter y corresponden al tema de la app.

### Primary

- **Verde yerba** (`green`): heroes, acciones principales, enlaces y selección de navegación.
- **Verde profundo** (`deep`): variante disponible en el tema.

### Secondary

- **Lima** (`lime`): palabras destacadas y anotaciones sobre verde.
- **Verde seleccionado** (`selected`): chips y acciones de comparación seleccionados.
- **Salvia** (`sage`): paneles de imágenes de catálogo.

### Neutral

- **Papel** (`background`) y **superficie cálida** (`surface`): fondo de lectura y contenedores.
- **Crema** (`cream`): titulares sobre verde y campos de formulario.
- **Tinta** (`ink`) y **lectura secundaria** (`muted`): texto principal y metadatos.
- **Oliva** (`border`) y **separador suave** (`subtle-border`): límites de campos, tarjetas y filas.
- **Blanco** (`white`): token existente del tema.
- **Error** (`error`) y **ámbar** (`amber`): mensajes de error y estado discontinuado.

**The Material Rule.** El verde estructura regiones editoriales; el papel organiza lectura y datos.

## Typography

**Display Font:** Lilita One, registrada como `Lilita`.
**Body Font:** Nunito Sans, registrada en pesos regular y extrabold.
**Annotation Font:** Caveat, registrada como `Caveat`.

Los titulares en mayúsculas tienen una voz popular y contundente. Nunito Sans sostiene controles y lectura; Caveat aporta anotaciones breves, con una inclinación de −4 grados.

### Hierarchy

- **Display:** tamaño del tema para inicio; el componente editorial usa interlínea proporcional 1,02 y tracking −0,5. Los heroes secundarios usan 39 puntos, o 34 en versión compacta.
- **Title:** titulares de sección; las tarjetas de producto usan 25 puntos con interlínea 26.
- **Body:** lectura con interlínea amplia; las descripciones de hero usan interlínea 23.
- **Caption:** metadatos y estados secundarios.
- **Hand:** anotaciones, nunca etiquetas de formulario.

**The Three Voices Rule.** Lilita encabeza, Nunito explica y Caveat anota.

## Layout

Pantallas con margen habitual de 24 puntos, separación por la escala del tema y final de lectura de 40 puntos. Heroes pueden ocupar el ancho completo; listas de catálogo mantienen márgenes laterales y separación de 16 puntos. El inicio agrupa accesos en dos columnas; las tarjetas de catálogo distribuyen texto e imagen lado a lado. FlatList sostiene catálogos extensos; stacks y NativeTabs conservan safe areas y navegación nativa. Campos conviven con scroll y adaptación al teclado.

## Elevation & Depth

Los componentes comunes no usan sombras decorativas. La profundidad surge de regiones verdes, paneles salvia, fotografía y textura de papel. `Paper` usa opacidad 0,2 sobre fondos claros; en regiones verdes usa opacidad 0,13, mezcla `soft-light` y contenedor con `isolation: isolate`. Esto conserva el verde profundo sin lavar el contraste del contenido.

**The Paper Rule.** La textura acompaña al material y nunca reemplaza el contraste de texto y controles.

## Shapes

Campos suavemente redondeados, tarjetas con esquinas amplias y acciones en cápsula. Los bordes de campos y tarjetas son de un punto. Las imágenes editoriales adoptan el radio de tarjeta; collages recortados conservan su silueta original. Las acciones comunes tienen altura mínima 48; búsqueda 56; acciones auxiliares y targets de navegación al menos 44 puntos.

## Components

### Buttons

Principal verde con texto crema; secundaria transparente con borde oliva y texto tinta. Seleccionada verde claro con texto tinta y check vectorial. Presión reduce opacidad a 0,75; deshabilitado a 0,45. La versión compacta usa texto de 13 puntos y padding horizontal 14; la normal usa 15 puntos y padding horizontal 20.

### Chips

Son botones compactos secundarios. Estado seleccionado usa `#d0e3b8` y check; pueden desplazarse horizontalmente en filtros por estilo.

### Cards / Containers

Superficie cálida con textura, borde oliva y padding del tema. La tarjeta de yerba reproduce la composición del catálogo web: papel crema, borde oliva, nombre Lilita, rating real, chip de estilo verde, bandera original y fotografía sobre el fondo botánico original a color completo. El corazón superior guarda favoritas. Mantener presionada la tarjeta abre las acciones nativas de comparación; se eliminó la fila inferior. Si falta imagen, muestra una indicación explícita y letras de la marca; no inventa un pack.

### Inputs / Fields

Campo crema, tinta y borde oliva, tamaño 17 puntos. Etiqueta visible y accesible; error textual debajo del campo. El buscador compartido de Inicio y Explorar usa una cápsula crema de al menos 60 puntos, borde oliva, lupa verde y acción circular verde de 44 puntos. En Explorar, el borde se vuelve verde al enfocar y la acción permite limpiar el texto. El input permite enviar desde el teclado.

### Navigation

Las cabeceras secundarias respetan los insets del dispositivo y ubican la flecha y el título en una fila centrada de al menos 56 puntos. La ficha usa «Ficha de yerba» como contexto de navegación; el nombre completo y la marca aparecen en el hero editorial.

Las cuatro pestañas no muestran cabecera de marca; sus títulos aparecen dentro del contenido con safe area superior. Las fichas y pantallas secundarias conservan el stack y la vuelta nativa. NativeTabs usa verde como tint, superficie cálida de fondo y etiquetas Nunito; cuatro destinos: Inicio, Explorar, Mi biblioteca y Perfil. Explorar ofrece búsqueda directa y un selector nativo de Yerbas/Marcas: SwiftUI segmented Picker en iOS y Material SegmentedButton en Android. Los filtros se presentan en un BottomSheet nativo de `@expo/ui`, con fondo papel, selectores nativos, secciones separadas y acciones al pie. La selección es un borrador hasta aplicar; cerrar o deslizar descarta los cambios. Limpiar restablece el borrador, incluyendo el estilo.

### Editorial Hero

Región verde con textura suave, Lilita crema y palabras lima. Hero secundario incorpora botánica original; inicio usa collage original y anotación Caveat. Cuenta y perfil extienden el mismo componente sin introducir otra identidad.

El hero de Inicio conserva el collage de mate y paisaje junto al titular. La tarjeta verde tiene una altura mínima de 128 puntos; el collage de 160 puntos se alinea al pie y sobresale 32 puntos por arriba. Un contenedor exterior permite ese desborde mientras la textura respeta el radio de la tarjeta. “Tu próxima yerba.” usa tres líneas en Lilita de 30 puntos e interlínea 32, con “yerba” en lima. El texto reserva espacio para la imagen y la tarjeta puede crecer con el tamaño de fuente.

## Do's and Don'ts

### Do:

- **Do** reutilizar los tokens y componentes existentes para nuevas pantallas.
- **Do** usar imágenes reales de productos y assets editoriales de la web.
- **Do** conservar contraste crema o lima sobre verde y tinta sobre papel.
- **Do** mantener etiquetas accesibles y controles con targets de al menos 44 puntos.

### Don't:

- **Don't** sustituir la identidad web por una nueva marca visual.
- **Don't** inventar imágenes de productos ni métricas para completar la composición.
- **Don't** aplicar la textura clara en modo normal sobre regiones verdes; usar soft-light con aislamiento.

Las fuentes de la ficha de yerba reutilizan `EditorialSourceLink`, igual que Cultura: título verde con flecha, editorial y fecha de consulta; los enlaces conservan su manejo de errores.

Biblioteca y colecciones de perfil público usan la misma YerbaCard que Inicio y Explorar. LibraryYerbaCard completa el resumen de biblioteca con datos públicos de catálogo (valoración, estilos y país) mediante la caché y la ficha pública; conserva el contenido disponible si no puede cargar los detalles. Mantiene la misma imagen, hojas, chip, bandera, corazón y acceso a comparación.

Las listas de yerbas muestran tres skeletons con la composición y altura mínima de las tarjetas durante la carga inicial, los refrescos, búsquedas y filtros. La paginación conserva las tarjetas existentes y agrega tres skeletons al pie. La tarjeta real reemplaza su skeleton mediante un fundido de 220 ms, escalonado 55 ms entre las primeras tres filas y con demora máxima de 110 ms. Reduce Motion elimina el fundido y las demoras. Las imágenes usan transición de 180 ms. El enriquecimiento de biblioteca también muestra el skeleton de cada tarjeta mientras consulta el catálogo; ante error o falta de conexión conserva los datos disponibles y el reintento.

Las pantallas de Perfil público, Marca, Cultura, Sobre la yerba y Editar perfil usan Page sin safeTop porque AppHeader ya contempla la zona segura superior. El contenido conserva su margen habitual bajo el header, sin duplicar el inset de la barra de estado.

Ingreso y Registro se presentan como formSheet nativo, con tirador y radio 32, alturas iniciales 68% y 80% y expansión completa. Comparten AuthSheet: papel, título Lilita, cierre circular salvia, campos crema, acción verde y enlace secundario para cambiar de formulario. AuthField usa etiquetas Nunito bold de 15 pt, campos de 56 pt, foco verde, errores rojos y control de visibilidad de contraseña. El contenido se desplaza con el teclado; acciones y navegación se deshabilitan durante el envío.
