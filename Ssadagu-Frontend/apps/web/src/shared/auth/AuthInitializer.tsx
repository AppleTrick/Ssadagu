"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "./useAuthStore";

export function AuthInitializer() {
  const initialized = useRef(false);
  const { setInitialized } = useAuthStore();

  useEffect(() => {
    // 마운트 시 최초 1회만 실행됨을 보장합니다.
    if (initialized.current) return;
    initialized.current = true;

    // Zustand persist 로직이 클라이언트 렌더링에 맞춰 동기화되었음을 알립니다.
    // 기존에 있던 무조건적인 `/reissue` 요청은 비로그인 유저 진입 시 500 에러를 유발하므로 삭제했습니다.
    // 세션 만료 시 백엔드로의 `reissue` 요청은 apiClient.ts의 401 인터셉터가 자동으로 담당합니다.
    setInitialized(true);
  }, [setInitialized]);

  return null;
}
