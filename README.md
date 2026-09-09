# my-app-js

Stack: **Vite + React (JavaScript) + Tailwind CSS v4 + Ant Design v6 + Zustand + Axios + React Router**.

## Empezar

```bash
npm install
cp .env.example .env   # ajusta VITE_API_BASE_URL a tu API real
npm run dev
```

Abre `http://localhost:5173`. La ruta `/login` tiene el formulario funcional; `/dashboard` es una ruta protegida de ejemplo.

## Estructura

```
src/
  api/
    axiosInstance.js       # instancia central de axios: baseURL, headers, interceptores
    endpoints/
      auth.js               # llamadas a /auth/login, /auth/me, /auth/logout
      users.js               # ejemplo de endpoint adicional (patrón a copiar)
  features/
    auth/
      LoginForm.jsx           # formulario AntD con validación y conexión a useAuth
      LoginPage.jsx            # layout de la pantalla de login (AntD Card)
    dashboard/
      DashboardPage.jsx       # página protegida de ejemplo
  hooks/
    useAuth.js                # orquesta login/logout entre la API y el store
  store/
    authStore.js              # Zustand: user, tokens, isAuthenticated (persistido)
  routes/
    AppRouter.jsx              # definición de rutas
    ProtectedRoute.jsx          # wrapper que redirige a /login si no hay sesión
  theme/
    antdTheme.js                # tokens de tema de AntD (colores, radios, alturas)
  lib/
    env.js                      # acceso centralizado a variables de entorno
```

## Ant Design + Tailwind conviviendo

Para que no choquen los estilos:

- En `src/index.css` **no** se importa el preflight de Tailwind (`@import "tailwindcss/theme.css"` y `@import "tailwindcss/utilities.css"` en lugar de `@import "tailwindcss"`), así el reset de estilos base lo controla AntD y Tailwind solo aporta clases utilitarias (`flex`, `px-4`, `text-sm`, etc.) sobre los componentes de AntD.
- El tema visual (color primario, radios, alturas de inputs) se define en `src/theme/antdTheme.js` y se inyecta vía `<ConfigProvider theme={antdTheme}>` en `App.jsx`, usando los mismos tonos de marca que Tailwind tiene en `@theme` (`brand-500`, `brand-600`, etc.) para que ambos se vean consistentes.
- Puedes seguir usando clases de Tailwind libremente en tus propios `div`/layouts; para los componentes interactivos (inputs, botones, checkboxes, alerts) usa los de AntD para mantener accesibilidad y comportamiento consistente.

## Cómo conectar un nuevo recurso de tu API

1. Crea `src/api/endpoints/miRecurso.js` siguiendo el patrón de `users.js`, usando siempre la instancia `api` de `axiosInstance.js` (así hereda el token, el timeout y el manejo de errores).
2. Si necesitas estado global para ese recurso, crea un store en `src/store/` con Zustand siguiendo el patrón de `authStore.js`.
3. Si necesitas lógica de UI (loading, error, orquestación), crea un hook en `src/hooks/`.

## Autenticación

- `authStore.js` guarda `user`, `accessToken`, `refreshToken` en memoria y los persiste en `localStorage` (clave `auth-storage`).
- `axiosInstance.js` añade automáticamente el `Authorization: Bearer <token>` a cada request.
- Si una respuesta da `401`, intenta refrescar el token automáticamente contra `/auth/refresh` y reintenta la petición original. Si el refresh falla, hace logout.
- Ajusta las rutas (`/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/me`) y la forma de la respuesta en `src/api/endpoints/auth.js` para que coincidan con tu backend real.
