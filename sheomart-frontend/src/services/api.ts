import axios from "axios";
import { useAuthStore } from "@/store/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL  ,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
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
        if (refreshToken) {
          const response = await api.post("/api/v1/auth/refresh", { refreshToken });
          const nextAccessToken = response.data?.data?.accessToken;
          const nextRefreshToken = response.data?.data?.refreshToken;

          if (nextAccessToken) {
            useAuthStore.getState().setAccessToken(nextAccessToken);
            if (nextRefreshToken) {
              useAuthStore.setState({ refreshToken: nextRefreshToken });
            }
            originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch {
        useAuthStore.getState().logout();
      }
    }

    if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409 || status === 500) {
      const message = error.response?.data?.message || "Request failed";
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);
// console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);

export default api;
