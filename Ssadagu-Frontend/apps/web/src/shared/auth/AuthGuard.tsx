'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useAuthStore } from './useAuthStore';
import { colors, typography } from '@/shared/styles/theme';

/**
 * 로그인 없이 접근 가능한 공개 경로
 */
const PUBLIC_ROUTES = ['/', '/signup', '/verify-account', '/test'];

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 전역 인증 가드 컴포넌트
 * 1. 초기 인증 확인(Reissue)이 끝날 때까지 프리미엄 스플래시 화면을 보여줍니다. (끊김 방지 장치)
 * 2. 인증되지 않은 사용자가 보호된 경로에 접근하면 메인으로 리다이렉트합니다.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || !pathname) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => 
      pathname === route || (route !== '/' && pathname.startsWith(`${route}/`))
    );

    // 인증되지 않았는데 비공개 경로인 경우 리다이렉트
    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/');
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  // 서버 사이드 렌더링 시에는 아무것도 하지 않음
  if (!mounted) return null;

  // 1. 초기 인증 확인 중일 때: 프리미엄 스플래시 화면 표시 (장치 1)
  if (!isInitialized) {
    return (
      <SplashContainer>
        <LogoWrapper>
          <LogoText>싸다구</LogoText>
          <Dot />
        </LogoWrapper>
        <LoadingText>안전한 거래를 준비하고 있어요</LoadingText>
      </SplashContainer>
    );
  }

  // 2. 인증 대기 중 리다이렉트가 필요한 경우 (깜빡임 방지용으로 빈 화면 혹은 스켈레톤 노출 가능)
  const isPublicRoute = pathname ? PUBLIC_ROUTES.some((route) => 
    pathname === route || (route !== '/' && pathname.startsWith(`${route}/`))
  ) : false;

  if (!isAuthenticated && !isPublicRoute) {
    return <SplashContainer />; // 리다이렉트 되는 동안 빈 화면 유지
  }

  return <>{children}</>;
};

/* ── 프리미엄 스플래시 디자인 ───────────────────────────────── */

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const SplashContainer = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${colors.surface};
  z-index: 9999;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
  animation: ${fadeIn} 0.6s ease-out forwards;
  margin-bottom: 16px;
`;

const LogoText = styled.h1`
  font-family: ${typography.fontFamily};
  font-size: 36px;
  font-weight: 800;
  color: ${colors.primary};
  letter-spacing: -1px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${colors.primary};
  animation: ${pulse} 1.5s infinite ease-in-out;
`;

const LoadingText = styled.p`
  font-family: ${typography.fontFamily};
  font-size: 14px;
  color: ${colors.textSecondary};
  animation: ${fadeIn} 0.8s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
`;
