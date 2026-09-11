import { api } from "../axiosInstance";

export const CategoryApi = {
  getAll: ({ page = 1, limit = 10, name = "" }) =>
    api
      .get("/category", {
        params: {
          page,
          limit,
          ...(name ? { name } : {}),
        },
      })
      .then((res) => res.data),

  getById: (id) => api.get(`/category/${id}`).then((res) => res.data),

  create: (payload) => api.post("/category", payload).then((res) => res.data),

  update: (id, payload) =>
    api.patch(`/category/${id}`, payload).then((res) => res.data),

  delete: (id) => api.delete(`/category/${id}`).then((res) => res.data),
};
