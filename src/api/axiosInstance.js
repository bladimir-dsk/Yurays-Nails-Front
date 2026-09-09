import axios from "axios";
import { env } from "@/lib/env";
import {
  getAccessToken,
  getRefreshToken,
  useAuthStore,
} from "@/store/authStore";

/**
 * Instancia base. Todos los endpoints (auth, users, etc.)
 * deben importar y usar esta instancia, nunca axios directo.
 */
export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---- Request interceptor: inyecta el token en cada petición ----
api.interceptors.request.use((config) => {
  const token = getAccessToken();

  // console.log("TOKEN:", token);
  // console.log("REQUEST:", config.url);

  if (token) {
    config.headers.set
      ? config.headers.set("Authorization", `Bearer ${token}`)
      : (config.headers["Authorization"] = `Bearer ${token}`);
  }

  return config;
});

// ---- Manejo de refresh token concurrente ----
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(token, error) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No hay refresh token disponible");

  // Petición "cruda" para no pasar por los interceptores de esta misma instancia
  const { data } = await axios.post(`${env.apiBaseUrl}/auth/refresh`, {
    refreshToken,
  });

  const newAccessToken = data.accessToken;
  useAuthStore.getState().setAccessToken(newAccessToken);
  return newAccessToken;
}

// ---- Response interceptor: normaliza errores + refresh automático en 401 ----
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Intento de refresh solo una vez por request, y solo si hay refresh token
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      getRefreshToken()
    ) {
      if (isRefreshing) {
        // Si ya hay un refresh en curso, esperamos a que termine
        return new Promise((resolve, reject) => {
          pendingQueue.push({
            resolve: (token) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        resolveQueue(newToken);
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        resolveQueue(null, refreshError);
        useAuthStore.getState().logout();
        return Promise.reject(normalizeError(error));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

/** Convierte cualquier error de axios/red en un objeto consistente para la UI */
function normalizeError(error) {
  if (error.response) {
    const data = error.response.data;
    return {
      message: data?.message ?? "Ocurrió un error en el servidor.",
      status: error.response.status,
      code: data?.code,
      details: data,
    };
  }

  if (error.request) {
    return {
      message: "No se pudo conectar con el servidor. Revisa tu conexión.",
      code: "NETWORK_ERROR",
    };
  }

  return { message: error.message || "Ocurrió un error inesperado." };
}
