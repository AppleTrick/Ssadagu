'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { LoginForm } from '@/features/auth';

export function LandingPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, isInitialized, router]);

  // 서버 사이드 렌더링 시점이나 초기 인증 확인 중에는 아무것도 보여주지 않습니다
  if (!isInitialized || isAuthenticated) return null;

  return <LoginForm onSuccess={() => router.push('/home')} />;
}
