import { api } from "@/api/axiosInstance";

export const LoungeApi = {
  getAll: ({ page = 1, limit = 10 }) =>
    api
      .get("/salon", {
        params: {
          page,
          limit,
        },
      })
      .then((res) => res.data),

  getById: (id) => api.get(`/salon/${id}`).then((res) => res.data),

  create: (payload) => api.post("/salon", payload).then((res) => res.data),

  update: (id, payload) =>
    api.patch(`/salon/${id}`, payload).then((res) => res.data),
};
