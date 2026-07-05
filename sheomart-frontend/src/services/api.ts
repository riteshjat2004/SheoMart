import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const state = useAuthStore.getState();
  const token = state.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await api.post("/api/v1/auth/refresh", { refreshToken });
        const nextAccessToken = response.data?.data?.accessToken;
        const nextRefreshToken = response.data?.data?.refreshToken;

        if (!nextAccessToken) {
          throw new Error("Refresh failed");
        }

        useAuthStore.getState().setAccessToken(nextAccessToken);
        if (nextRefreshToken) {
          useAuthStore.setState({ refreshToken: nextRefreshToken });
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        }

        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }

    if (status && [400, 401, 403, 404, 409, 500].includes(status)) {
      const message = error.response?.data?.message || "Request failed";
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);

export default api;
