import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../services/api"; // Path to your api.js file

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

      fetchUser: async () => {
        try {
          // api interceptor handles the Bearer token and returns the data payload directly
          const user = await api.get("/users/me");
          set({ user });
        } catch (err) {
          console.error("Failed to fetch user profile", err);
        }
      },

      updateAvatar: async (file) => {
        set({ isLoading: true, error: null });
        const { user } = get();

        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await api.patch(`/users/${user.id}/image`, formData);

          set({ user: response, isLoading: false });
          return { success: true };
        } catch (err) {
          set({
            error: err || "Failed to upload image",
            isLoading: false,
          });
          return { success: false };
        }
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // ASP.NET [FromBody] expects JSON, so we pass a standard object
          const payload = { email, password };
          const response = await api.post("/auth/jwt/login", payload);

          const token = response.access_token;

          // 1. Save token first so the api interceptor can use it
          set({ token, isLoading: false });

          // 2. Fetch the full user info immediately
          await get().fetchUser();

          return true;
        } catch (err) {
          // The interceptor simplifies the error to a string
          set({
            error: err || "Login failed",
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

          await api.post("/auth/register", payload);

          // Auto-login after successful registration
          return await get().login(userData.email, userData.password);
        } catch (err) {
          // Use the simplified error string from the interceptor
          set({ error: err || "Email existed", isLoading: false });
          return false;
        }
      },

      validateSession: async () => {
        const { token, logout } = get();
        if (!token) return false;

        try {
          const user = await api.get("/users/me");
          set({ user });
          return true; // token still valid
        } catch (err) {
          await logout(); // clears user + token
          return false;
        }
      },
      logout: async () => {
        const { token } = get();
        if (token) {
          try {
            await api.post("/auth/jwt/logout");
          } catch (err) {
            console.error("Logout error (backend):", err);
          }
        }
        set({ user: null, token: null, error: null });
        localStorage.removeItem("auth-storage");
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const zodiac_sign = getZodiacSign(profileData.birthday);
          const payload = {
            name: profileData.name,
            birthday: profileData.birthday,
            zodiac_sign,
          };

          const response = await api.patch("/users/me", payload);

          set({ user: response, isLoading: false });
          return { success: true };
        } catch (err) {
          set({
            error: err || "Failed to update profile",
            isLoading: false,
          });
          return { success: false };
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
