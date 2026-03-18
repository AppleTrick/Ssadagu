import { create } from 'zustand';


interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // 초기 인증 확인 여부
  setToken: (accessToken: string) => void;
  clearToken: () => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isInitialized: false,
  setToken: (accessToken) => 
    set(() => ({ 
      accessToken, 
      isAuthenticated: true 
    })),
  clearToken: () => set({ accessToken: null, isAuthenticated: false }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
}));

