import axios from 'axios';
import useAuthStore from '../stores/authStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- REQUEST INTERCEPTOR ---
// Automatically adds the token to every request if it exists
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- RESPONSE INTERCEPTOR ---
// Handles the "Envelope Pattern" and global errors
apiClient.interceptors.response.use(
  (response) => {
    // If your backend follows the { success, data, message } structure
    // we return response.data.data directly to the component
    return response.data?.data !== undefined ? response.data.data : response.data;
  },
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      // Unauthorized: Clear store and redirect to login
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else if (status === 403) {
      window.location.href = '/403';
    } else if (status >= 500) {
      window.location.href = '/500';
    }

    return Promise.reject(error.response?.data?.message || "Something went wrong");
  }
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