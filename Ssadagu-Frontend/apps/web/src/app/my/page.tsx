'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderMain } from '@/widgets/header';
import { BottomNav } from '@/widgets/bottom-nav';
import { ProfileHeader } from '@/entities/user';
import type { User } from '@/entities/user';
import { QuickMenuItem, MenuListItem, ConfirmDialog } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { ROUTES } from '@/shared/constants/routes';
import {
  colors,
  typography,
  HEADER_HEIGHT,
  STATUS_BAR_HEIGHT,
  BOTTOM_NAV_HEIGHT,
} from '@/shared/styles/theme';

/* ── Styled ─────────────────────────────────────────────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.bg};
`;

const ContentArea = styled.main`
  flex: 1;
  padding-top: ${HEADER_HEIGHT + STATUS_BAR_HEIGHT}px;
  padding-bottom: ${BOTTOM_NAV_HEIGHT}px;
  overflow-y: auto;
`;

const ProfileSection = styled.div`
  background: ${colors.surface};
  margin-bottom: 8px;
`;

const QuickMenuRow = styled.div`
  display: flex;
  flex-direction: row;
  background: ${colors.surface};
  padding: 8px 12px;
  gap: 4px;
  border-top: 1px solid ${colors.border};
  border-bottom: 1px solid ${colors.border};
  margin-bottom: 8px;
`;

const MenuGroup = styled.div`
  background: ${colors.surface};
  border-top: 1px solid ${colors.border};
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  gap: 8px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const RetryButton = styled.button`
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.primary};
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
`;

/* ── Icons ──────────────────────────────────────────────── */

const SellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const BuyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const WishIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/* ── API Types ──────────────────────────────────────────── */

interface UserResponse {
  data?: User;
}

/* ── Component ───────────────────────────────────────────── */

export default function MyPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const clearToken = useAuthStore((s) => s.clearToken);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  /* ── Fetch user profile ─────────────────────────────────── */

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery<User>({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.USERS.ME, accessToken ?? undefined);
      if (!res.ok) throw new Error('프로필을 불러오지 못했습니다.');
      const json = await res.json() as User | UserResponse;
      if ((json as UserResponse).data) return (json as UserResponse).data as User;
      return json as User;
    },
    enabled: !!accessToken,
  });

  /* ── Handlers ───────────────────────────────────────────── */

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {}, accessToken ?? undefined);
    } catch {
      // ignore network error on logout
    } finally {
      clearToken();
      setShowLogoutDialog(false);
      setLogoutLoading(false);
      router.push('/');
    }
  };

  const handleWithdraw = async () => {
    try {
      await apiClient.post('/users/me/withdraw', {}, accessToken ?? undefined);
    } catch {
      // ignore
    } finally {
      clearToken();
      setShowWithdrawDialog(false);
      router.push('/');
    }
  };

  return (
    <Page>
      <HeaderMain title="나의" />

      <ContentArea>
        {/* Profile Section */}
        <ProfileSection>
          {isLoading && (
            <LoadingWrapper aria-live="polite" aria-busy="true">
              불러오는 중...
            </LoadingWrapper>
          )}
          {isError && (
            <ErrorWrapper>
              <span>프로필을 불러오지 못했습니다.</span>
              <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
            </ErrorWrapper>
          )}
          {!isLoading && !isError && user && <ProfileHeader user={user} />}
        </ProfileSection>

        {/* Quick Menu */}
        <QuickMenuRow>
          <QuickMenuItem
            icon={<SellIcon />}
            label="판매 내역"
            onClick={() => router.push(ROUTES.MY_PRODUCTS)}
          />
          <QuickMenuItem
            icon={<BuyIcon />}
            label="구매 내역"
            onClick={() => router.push(ROUTES.MY_TRANSACTIONS)}
          />
          <QuickMenuItem
            icon={<WishIcon />}
            label="관심 목록"
            onClick={() => router.push(ROUTES.MY_WISHES)}
          />
        </QuickMenuRow>

        {/* Settings Menu */}
        <MenuGroup>
          <MenuListItem
            label="동네 재인증"
            onClick={() => router.push(ROUTES.MY_ACCOUNT)}
          />
          <MenuListItem
            label="알림 설정"
            onClick={() => {
              // placeholder for notification settings
            }}
          />
          <MenuListItem
            label="로그아웃"
            onClick={() => setShowLogoutDialog(true)}
          />
          <MenuListItem
            label="탈퇴하기"
            color="danger"
            onClick={() => setShowWithdrawDialog(true)}
          />
        </MenuGroup>
      </ContentArea>

      <BottomNav />

      {/* Logout Confirm Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmLabel={logoutLoading ? '로그아웃 중...' : '로그아웃'}
        cancelLabel="취소"
        onConfirm={handleLogout}
        variant="default"
      />

      {/* Withdraw Confirm Dialog */}
      <ConfirmDialog
        isOpen={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        title="탈퇴하기"
        message="탈퇴하면 모든 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?"
        confirmLabel="탈퇴"
        cancelLabel="취소"
        onConfirm={handleWithdraw}
        variant="danger"
      />
    </Page>
  );
}
