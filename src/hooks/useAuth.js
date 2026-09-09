import { useState } from "react";

import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/api/endpoints/auth";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    setSession,
    logout: logoutStore,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.login(credentials);

      console.log("LOGIN RESPONSE:", response);

      setSession({
        user: {
          id: response.id,
          name: response.name,
          email: response.email,
          role: response.role,
          id_empresa: response.id_empresa,
        },

        accessToken: response.token,

        refreshToken: null,
      });

      console.log("ACCESS TOKEN:", useAuthStore.getState().accessToken);

      return true;
    } catch (error) {
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      logoutStore();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}
