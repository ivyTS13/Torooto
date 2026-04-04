import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import {api} from '../services/api'
// Base URL for your FastAPI server
const API_URL = "http://localhost:8000";

// Helper: determine zodiac sign from birthday (YYYY-MM-DD)
const getZodiacSign = (birthday) => {
  if (!birthday) return "";
  const [year, month, day] = birthday.split("-").map(Number);
  const monthDay = month * 100 + day;

  if (monthDay >= 321 && monthDay <= 419) return "Aries";
  if (monthDay >= 420 && monthDay <= 520) return "Taurus";
  if (monthDay >= 521 && monthDay <= 620) return "Gemini";
  if (monthDay >= 621 && monthDay <= 722) return "Cancer";
  if (monthDay >= 723 && monthDay <= 822) return "Leo";
  if (monthDay >= 823 && monthDay <= 922) return "Virgo";
  if (monthDay >= 923 && monthDay <= 1022) return "Libra";
  if (monthDay >= 1023 && monthDay <= 1121) return "Scorpio";
  if (monthDay >= 1122 && monthDay <= 1221) return "Sagittarius";
  if (monthDay >= 1222 || monthDay <= 119) return "Capricorn";
  if (monthDay >= 120 && monthDay <= 218) return "Aquarius";
  return "Pisces";
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      fetchUser: async (token) => {
        try {
          const response = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: response.data });
        } catch (err) {
          console.error("Failed to fetch user profile", err);
        }
      },


 updateAvatar: async (file) => {
  set({ isLoading: true, error: null });
  const { user, token } = get();

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.patch(`/users/${user.id}/image`, formData, {
      headers: {
        'Content-Type': undefined,
        Authorization: `Bearer ${token}`, // ensure token is sent
      },
    });

    set({ user: response, isLoading: false });
    return { success: true };
  } catch (err) {
    set({ error: err.message || "Failed to upload image", isLoading: false });
    console.error("Upload error:", err.response?.data); // log server response
    return { success: false };
  }
},
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new URLSearchParams();
          formData.append("username", email);
          formData.append("password", password);

          const response = await axios.post(
            `${API_URL}/auth/jwt/login`,
            formData,
          );
          const token = response.data.access_token;

          // 1. Save token first
          set({ token, isLoading: false });

          // 2. Fetch the full user info immediately
          await get().fetchUser(token);

          return true;
        } catch (err) {
          set({
            error: err.response?.data?.detail || "Login failed",
            isLoading: false,
          });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const zodiac_sign = getZodiacSign(userData.birthday);

          const payload = {
            email: userData.email,
            password: userData.password,
            name: userData.name,
            birthday: userData.birthday,
            zodiac_sign: zodiac_sign,
            is_active: true,
            is_superuser: false,
            is_verified: false,
          };

          // Register expects JSON
          await axios.post(`${API_URL}/auth/register`, payload);

          // Auto-login after successful registration
          return await get().login(userData.email, userData.password);
        } catch (err) {
          let errorMessage = "Registration failed";

          // Handle specific fastapi-users errors
          if (err.response?.data?.detail === "REGISTER_USER_ALREADY_EXISTS") {
            errorMessage = "A user with this email already exists.";
          } else if (err.response?.data?.detail) {
            // Handle validation errors (usually an array in FastAPI)
            errorMessage =
              typeof err.response.data.detail === "string"
                ? err.response.data.detail
                : "Invalid data provided";
          }

          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      logout: async () => {
        const { token } = get();
        try {
          // Tell the backend to invalidate the token
          await axios.post(
            `${API_URL}/auth/jwt/logout`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        } catch (err) {
          console.error("Logout error (backend):", err);
        } finally {
          // Always clear local state even if the network request fails
          set({ user: null, token: null, error: null });
          localStorage.removeItem("auth-storage");
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);

export default useAuthStore;
