import { api } from "@/api/axiosInstance";

export const AccessLogApi = {
  getAll: ({ page = 1, limit = 10, salonId = null }) =>
    api
      .get("/access-log", {
        params: {
          page,
          limit,
          salonId,
        },
      })
      .then((res) => res.data),

  getById: (id) => api.get(`/access-log/${id}`).then((res) => res.data),

  create: (payload) => api.post("/access-log", payload).then((res) => res.data),
};
