"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "./useAuthStore";
import { ENDPOINTS } from "../api/endpoints";

export function AuthInitializer() {
  const initialized = useRef(false);
  const { setInitialized, setToken, clearToken } = useAuthStore();

  useEffect(() => {
    // Ensure we only run this once on mount
    if (initialized.current) return;
    initialized.current = true;

    const attemptReissue = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";
        const res = await fetch(`${baseUrl}${ENDPOINTS.AUTH.REISSUE}`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const body = (await res.json()) as Record<string, any>;
          const tokenData = body.data || body;
          // 백엔드 명세에 따라 id 또는 userId로 올 수 있음
          const userId = tokenData.userId || tokenData.id || 1; 
          useAuthStore.getState().setAuthInfo(tokenData.accessToken, userId);
        } else {
          clearToken();
        }
      } catch (err) {
        console.error(
          "[Auth] failed to reissue token on navigation/reload:",
          err,
        );
        clearToken();
      } finally {
        setInitialized(true);
      }
    };

    // To ensure Zustand's persist has rehydrated from localStorage
    setTimeout(attemptReissue, 10);
  }, [setInitialized, setToken, clearToken]);

  return null;
}
