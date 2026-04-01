'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { LoginForm } from "@/features/auth";
import { useMyProfile } from "@/entities/user";
import { useModalStore } from "@/shared/hooks/useModalStore";

export function LandingPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { data: user, isLoading: isUserLoading } = useMyProfile();
  const { alert: modalAlert } = useModalStore();
  const router = useRouter();

  useEffect(() => {
    // 이미 로그인되어 있고 초기화가 완료된 경우
    if (isInitialized && isAuthenticated) {
      // 유저 정보를 가져올 수 있으면 정보를 바탕으로 리다이렉션
      if (!isUserLoading && user) {
        if (user.status === "UNVERIFIED") {
          modalAlert({
            title: "인증 필요",
            message: "1원 인증을 완료하지 않았습니다.\n1원 인증 페이지로 이동합니다.",
            confirmLabel: "확인",
          }).then(() => {
            router.replace("/verify-account");
          });
        } else if (!user.regionName) {
          // 계좌 인증은 되었으나 동네 인증이 없는 경우
          router.replace("/location-auth");
        } else {
          router.replace("/home");
        }
      }
      // 유저 정보가 없더라도 단순 인증된 상태라면 일단 메인으로 (메인에서 가드 처리)
      else if (!isUserLoading && !user) {
        router.replace("/home");
      }
    }
  }, [isAuthenticated, isInitialized, isUserLoading, user, router, modalAlert]);

  // 초기 로딩 스플래시는 AuthGuard가 담당합니다
  // 로그인된 경우 리다이렉트 전까지 빈 배경 유지 (깜빡임 방지)
  if (isAuthenticated && (isUserLoading || !user)) return <div style={{ height: '100dvh', background: '#F2F4F6' }} />;
  if (isAuthenticated) return <div style={{ height: '100dvh', background: '#F2F4F6' }} />;

  return <LoginForm onSuccess={() => router.push("/home")} />;
}
