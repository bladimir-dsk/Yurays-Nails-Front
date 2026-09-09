import { api } from "@/api/axiosInstance";

/**
 * @typedef {Object} LoginPayload
 * @property {string} email
 * @property {string} password
 *
 * @typedef {Object} LoginResponse
 * @property {import("@/store/authStore").AuthUser} user
 * @property {string} accessToken
 * @property {string} refreshToken
 */

export const authApi = {
  /** @param {LoginPayload} payload @returns {Promise<LoginResponse>} */
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),

  me: () => api.get("/auth/me").then((res) => res.data),

  logout: () => api.post("/auth/logout").then((res) => res.data),
};
