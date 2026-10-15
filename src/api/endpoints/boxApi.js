import { api } from "../axiosInstance";

export const BoxApi = {
  getAll: ({ page = 1, limit = 10 }) =>
    api
      .get("/caja", {
        params: {
          page,
          limit,
        },
      })
      .then((res) => res.data),

  getById: (id) => api.get(`/caja/${id}`).then((res) => res.data),

  getAllToday: () => api.get("/caja/hoy").then((res) => res.data),

  getByDate: (date) => api.get(`/caja/fecha/${date}`).then((res) => res.data),

  create: (payload) => api.post("/caja", payload).then((res) => res.data),

  createMovement: (payload) =>
    api.post("/caja/movimiento/hoy", payload).then((res) => res.data),

  closeToday: (id) => api.post(`/caja/${id}/cerrar`).then((res) => res.data),
};
