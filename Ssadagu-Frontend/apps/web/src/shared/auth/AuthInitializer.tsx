'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from './useAuthStore';
import { ENDPOINTS } from '../api/endpoints';

export function AuthInitializer() {
  const initialized = useRef(false);

  useEffect(() => {
    // Clean up any legacy tokens
    try {
      localStorage.removeItem('auth-storage');
      sessionStorage.removeItem('auth-storage');
    } catch {
      // ignore
    }

    // Ensure we only run this once on mount
    if (initialized.current) return;
    initialized.current = true;

    const attemptReissue = async () => {
      const state = useAuthStore.getState();
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';
        const res = await fetch(`${baseUrl}${ENDPOINTS.AUTH.REISSUE}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
          
          if (res.ok) {
            const body = await res.json() as Record<string, any>;
            const tokenData = body.data || body;
            state.setToken(tokenData.accessToken);
          } else {
            state.clearToken();
          }
        } catch (err) {
          console.error('[Auth] failed to reissue token on navigation/reload:', err);
        }
    };

    // To ensure Zustand's persist has rehydrated from localStorage
    setTimeout(attemptReissue, 10);
  }, []);

  return null;
}
