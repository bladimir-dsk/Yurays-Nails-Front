/**
 * Punto único de acceso a variables de entorno.
 * Todas las env vars usadas por el cliente deben empezar con VITE_
 */
export const env = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1",
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 15000),
};
