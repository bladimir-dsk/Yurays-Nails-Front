import { api } from "@/api/axiosInstance";

/**
 * Ejemplo de endpoint adicional. Copia este archivo para
 * cada nuevo recurso de tu API (posts.js, products.js, etc.)
 */
export const usersApi = {
  getAll: () => api.get("/users").then((res) => res.data),
  getById: (id) => api.get(`/users/${id}`).then((res) => res.data),
  update: (id, payload) => api.patch(`/users/${id}`, payload).then((res) => res.data),
};
