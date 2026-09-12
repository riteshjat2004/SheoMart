import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof FormData !== "undefined" && config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

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

    if (status) {
      const message = error.response?.data?.message || error.response?.data?.error || `Request failed with status ${status}`;
      const normalizedError = new Error(message) as Error & { status?: number; details?: unknown };
      normalizedError.status = status;
      normalizedError.details = error.response?.data;
      return Promise.reject(normalizedError);
    }

    return Promise.reject(new Error(error.message || "Network request failed"));
  }
);

export default api;
