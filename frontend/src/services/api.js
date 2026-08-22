import axios from "axios";
import useAuthStore from "../stores/authStore";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5146";
const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": undefined,
  },
});

// --- REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- RESPONSE INTERCEPTOR ---
apiClient.interceptors.response.use(
  (response) => {
    // If your backend uses { success, data, message } envelope
    return response.data?.data !== undefined
      ? response.data.data
      : response.data;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;  // get the request URL

    if (status === 401) {
      // ⚠️ Skip automatic logout for login and logout endpoints
      if (url && (url.includes("/auth/jwt/login") || url.includes("/auth/jwt/logout"))) {
        // Just reject with the error message – the component (login) will handle it
        return Promise.reject(
          error.response?.data?.message || "Unauthorized"
        );
      }

      // For all other endpoints, clear session and redirect
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject("Session expired");
    }

    if (status === 403) {
      window.location.href = "/403";
    } else if (status >= 500) {
      window.location.href = "/500";
    }

    return Promise.reject(
      error.response?.data?.message || "Something went wrong"
    );
  },
);

// --- WRAPPER FUNCTIONS ---
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
};

export default api;