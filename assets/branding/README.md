# Identidad de Yerbarium App

Adaptación vectorial de `yerba-plataform/apps/web/public/logos/yerbatica-small.svg`. Se conserva el trazado original del mate, la hoja y la bombilla; solo cambian el color, la escala y el centrado óptico.

- `icon.png` / `.svg`: lima `#c4e38c` sobre verde; ícono principal de 1024 × 1024, sin transparencia ni esquinas redondeadas.
- `icon-light.png` / `.svg`: verde sobre crema, variante clara.
- `logo-green`, `logo-cream`, `logo-white`: símbolos con fondo transparente, en PNG y SVG.
- `android-foreground.png`: símbolo verde `#0c5947` sobre transparencia, centrado con 432 px de alto en el lienzo de 1024 px para conservar margen tras el recorte adaptativo de Android.
- `android-background.png`: fondo crema independiente.
- `android-monochrome.png`: máscara blanca transparente para íconos temáticos de Android, con la misma escala y posición que el foreground.
- `splash-logo.png`: símbolo verde transparente para la pantalla de inicio.
- `preview.png`: lámina de referencia.
- `source.svg`: copia del SVG original para generar assets sin depender del proyecto web.

Paleta: verde `#0c5947`, lima `#c4e38c`, crema `#f4f0e4`, blanco `#ffffff`, tinta `#173d32`.

Regeneración: `bun run branding:generate`. La configuración de Expo usa estos assets en `app.json`. Los cambios del splash y del ícono requieren un nuevo build nativo; Expo Go no reproduce todo el splash de una app instalada.
