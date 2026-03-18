import { create } from "zustand";
import { persist } from "zustand/middleware";
import CryptoJS from "crypto-js";

interface AuthState {
  accessToken: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuthInfo: (accessToken: string, userId: number) => void;
  setToken: (accessToken: string) => void;
  clearToken: () => void;
  setInitialized: (initialized: boolean) => void;
}

const SECRET_KEY =
  process.env.NEXT_PUBLIC_AUTH_SECRET_KEY || "ssadagu-default-secret-key";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      userId: null,
      isAuthenticated: false,
      isInitialized: false,
      setAuthInfo: (accessToken, userId) =>
        set(() => ({
          accessToken,
          userId,
          isAuthenticated: true,
        })),
      setToken: (accessToken) =>
        set(() => ({
          accessToken,
          isAuthenticated: true,
        })),
      clearToken: () =>
        set({ accessToken: null, userId: null, isAuthenticated: false }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (name) => {
          const val = sessionStorage.getItem(name);
          if (!val) return null;
          try {
            const bytes = CryptoJS.AES.decrypt(val, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted ? JSON.parse(decrypted) : null;
          } catch (e) {
            console.error("Auth decryption failed:", e);
            return null;
          }
        },
        setItem: (name, value) => {
          const encrypted = CryptoJS.AES.encrypt(
            JSON.stringify(value),
            SECRET_KEY,
          ).toString();
          sessionStorage.setItem(name, encrypted);
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
      partialize: (state) =>
        ({
          accessToken: state.accessToken,
          userId: state.userId,
          isAuthenticated: state.isAuthenticated,
        }) as any,
    },
  ),
);
