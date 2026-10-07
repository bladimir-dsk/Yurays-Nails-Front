import { api } from "../axiosInstance";

export const SaleApi = {
  getAll: ({ page, limit, sale_number }) =>
    api
      .get("/sale", {
        params: {
          page,
          limit,
          sale_number: sale_number || undefined,
        },
      })
      .then((res) => res.data),

  getById: (id) => api.get(`/sale/${id}`).then((res) => res.data),

  create: (payload) => api.post("/sale", payload).then((res) => res.data),

  delete: (id) => api.delete(`/sale/${id}`).then((res) => res.data),

  // Dashboard: ventas y dinero por día
  getDailyStats: ({ from, to } = {}) =>
    api
      .get("/sale/stats/daily", {
        params: { from: from || undefined, to: to || undefined },
      })
      .then((res) => res.data),

  // Dashboard: cada venta de la semana (lunes a domingo)
  getWeeklyStats: ({ date } = {}) =>
    api
      .get("/sale/stats/weekly", {
        params: { date: date || undefined },
      })
      .then((res) => res.data),
};
