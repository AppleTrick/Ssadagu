import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setToken: (accessToken: string) => void;
  clearToken: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      setToken: (accessToken) => set({ accessToken, isAuthenticated: true }),
      clearToken: () => set({ accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    },
  ),
);
