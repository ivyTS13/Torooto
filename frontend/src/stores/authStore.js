import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper: determine zodiac sign from birthday (YYYY-MM-DD)
const getZodiacSign = (birthday) => {
  if (!birthday) return '';
  const [year, month, day] = birthday.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const monthDay = month * 100 + day;

  if ((monthDay >= 321 && monthDay <= 419)) return 'Aries';
  if ((monthDay >= 420 && monthDay <= 520)) return 'Taurus';
  if ((monthDay >= 521 && monthDay <= 620)) return 'Gemini';
  if ((monthDay >= 621 && monthDay <= 722)) return 'Cancer';
  if ((monthDay >= 723 && monthDay <= 822)) return 'Leo';
  if ((monthDay >= 823 && monthDay <= 922)) return 'Virgo';
  if ((monthDay >= 923 && monthDay <= 1022)) return 'Libra';
  if ((monthDay >= 1023 && monthDay <= 1121)) return 'Scorpio';
  if ((monthDay >= 1122 && monthDay <= 1221)) return 'Sagittarius';
  if ((monthDay >= 1222 || monthDay <= 119)) return 'Capricorn';
  if ((monthDay >= 120 && monthDay <= 218)) return 'Aquarius';
  return 'Pisces'; // Feb 19 - Mar 20
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Mock login – replace with API call later
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API delay
          await new Promise((resolve) => setTimeout(resolve, 800));
          
          // Mock validation – accept any email/password for demo
          if (!email || !password) throw new Error('Email and password required');
          
          // Mock user object (in real app, this comes from backend)
          const mockUser = {
            email,
            name: email.split('@')[0],
            is_active: true,
            is_superuser: false,
            is_verified: true,
          };
          
          set({
            user: mockUser,
            token: 'mock-jwt-token',
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      // Mock register – auto-assigns zodiac sign
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          
          // Auto-assign zodiac sign based on birthday
          const zodiac_sign = getZodiacSign(userData.birthday);
          
          // Complete user object matching backend model
          const newUser = {
            email: userData.email,
            password: userData.password, // In real app, hash on backend
            name: userData.name,
            birthday: userData.birthday,
            zodiac_sign,
            is_active: true,
            is_superuser: false,
            is_verified: false,
          };
          
          // Mock: store in localStorage for demo "persistence"
          localStorage.setItem('mockRegisteredUser', JSON.stringify(newUser));
          
          // Auto-login after registration
          set({
            user: {
              email: newUser.email,
              name: newUser.name,
              is_active: newUser.is_active,
              is_superuser: newUser.is_superuser,
              is_verified: newUser.is_verified,
            },
            token: 'mock-jwt-token',
            isLoading: false,
            error: null,
          });
          return true;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, error: null });
        localStorage.removeItem('mockRegisteredUser');
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage', // persist to localStorage
      getStorage: () => localStorage,
      partialize: (state) => ({ user: state.user, token: state.token }), // only persist user & token
    }
  )
);

export default useAuthStore;