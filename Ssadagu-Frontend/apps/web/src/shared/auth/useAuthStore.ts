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

const SECRET_KEY = process.env.NEXT_PUBLIC_AUTH_SECRET_KEY || "ssadagu-default-secret-key";

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
      clearToken: () => {
        set({ accessToken: null, userId: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage");
      },
      setInitialized: (initialized) => set({ isInitialized: initialized }),
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (name) => {
          const val = localStorage.getItem(name);
          if (!val) return null;
          try {
            const bytes = CryptoJS.AES.decrypt(val, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            if (!decrypted) return null;
            const parsed = JSON.parse(decrypted);
            
            // Self-healing: 만약 userId가 누락되어 있다면 (예전 버그 버전 저장소), JWT 토큰을 풀어 복구합니다.
            if (parsed && parsed.accessToken && !parsed.userId) {
              const base64Url = parsed.accessToken.split('.')[1];
              if (base64Url) {
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const decoded = JSON.parse(jsonPayload);
                parsed.userId = decoded?.userId ?? decoded?.id;
              }
            }
            return parsed;
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
          localStorage.setItem(name, encrypted);
        },
        removeItem: (name) => localStorage.removeItem(name),
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
