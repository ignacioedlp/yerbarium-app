# Yerbarium App

- Proyecto Expo independiente. La API y la web están en `../yerba-plataform`.
- Usar Bun y conservar `bun.lock`. Instalar módulos con `bunx expo install <paquete> --bun`.
- `src/app` solo contiene rutas/layouts; mantener servicios, tipos, hooks y pantallas fuera de esa carpeta.
- Axios centraliza HTTP y autenticación; TanStack Query centraliza estado del servidor. No duplicar consultas con effects.
- Mantener el refresh token en SecureStore y el access token en memoria. Nunca persistir queries privadas ni credenciales en AsyncStorage.
- Usar el tema compartido y datos reales de API. No inventar imágenes ni valoraciones de productos.
- Respetar las reglas de Argent del workspace para interacción con dispositivos.
- Validar con `bun run typecheck`, `bun run lint`, `bun run test` y exportaciones nativas. Documentar lo que no pueda verificarse en `QA.md`.
