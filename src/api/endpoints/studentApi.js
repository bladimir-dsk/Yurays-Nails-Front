import { api } from "@/api/axiosInstance";

export const studentApi = {
  getAll: ({ page = 1, limit = 10 }) =>
    api
      .get("/student", {
        params: {
          page,
          limit,
        },
      })
      .then((res) => res.data),

  getById: (id) => api.get(`/student/${id}`).then((res) => res.data),

  create: (payload) => api.post("/student", payload).then((res) => res.data),

  update: (id, payload) =>
    api.patch(`/student/${id}`, payload).then((res) => res.data),
};
