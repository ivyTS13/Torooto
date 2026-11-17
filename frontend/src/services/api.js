import axios from "axios";
import useAuthStore from "../stores/authStore";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5146";
const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": undefined,
  },
});

const extractErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.detail ||
  error.response?.data?.title ||
  fallback;

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) =>
    response.data?.data !== undefined ? response.data.data : response.data,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (status === 401) {
      if (url && (url.includes("/auth/jwt/login") || url.includes("/auth/jwt/logout"))) {
        return Promise.reject(extractErrorMessage(error, "Unauthorized"));
      }

      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject("Session expired");
    }

    if (status === 403) {
      window.location.href = "/403";
    } else if (status >= 500) {
      window.location.href = "/500";
    }

    return Promise.reject(extractErrorMessage(error, "Something went wrong"));
  },
);

export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};

export default api;
