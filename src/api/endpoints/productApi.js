import { api } from "../axiosInstance";

export const ProductApi = {
  getAll: ({ page, limit, name, code, id_category }) =>
    api
      .get("/product", {
        params: {
          page,
          limit,
          name: name || undefined,
          code: code || undefined,
          id_category: id_category || undefined,
        },
      })
      .then((res) => res.data),

  getById: (id) => api.get(`/product/${id}`).then((res) => res.data),

  getByCode: (code) =>
    api.get(`/product/by-code/${code}`).then((res) => res.data),

  create: (payload) => api.post("/product", payload).then((res) => res.data),

  update: (id, payload) =>
    api.patch(`/product/${id}`, payload).then((res) => res.data),

  delete: (id) => api.delete(`/product/${id}`).then((res) => res.data),
};
