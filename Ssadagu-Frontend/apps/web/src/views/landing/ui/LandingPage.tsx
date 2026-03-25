'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { LoginForm } from "@/features/auth";
import { useMyProfile } from "@/entities/user";

export function LandingPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { data: user, isLoading: isUserLoading } = useMyProfile();
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인되어 있고 초기화가 완료된 경우
    if (isInitialized && isAuthenticated) {
      // 유저 정보를 가져올 수 있으면 정보를 바탕으로 리다이렉션
      if (!isUserLoading && user) {
        if (!user.regionName) {
          router.replace("/verify-account");
        } else {
          router.replace("/home");
        }
      } 
      // 유저 정보가 없더라도 단순 인증된 상태라면 일단 메인으로 (메인에서 가드 처리)
      else if (!isUserLoading && !user) {
        router.replace("/home");
      }
    }
  }, [isAuthenticated, isInitialized, isUserLoading, user, router]);

  // 초기 로딩 스플래시는 AuthGuard가 담당합니다
  // 로그인된 경우 리다이렉트 전까지 기다립니다 (깜빡임 방지용 null)
  if (isAuthenticated && (isUserLoading || !user)) return null;
  if (isAuthenticated) return null;

  return <LoginForm onSuccess={() => router.push("/home")} />;
}
