"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import styled from "@emotion/styled";
import { HeaderMain } from "@/widgets/header";
import { BottomNav } from "@/widgets/bottom-nav";
import { ProfileHeader, useMyProfile, useMyAccount, useAccountDetail, useDeposit } from "@/entities/user";
import type { User } from "@/entities/user";
import { QuickMenuItem, MenuListItem, ConfirmDialog, Button } from "@/shared/ui";
import { apiClient } from "@/shared/api/client";
import { ENDPOINTS } from "@/shared/api/endpoints";
import { useAuthStore } from "@/shared/auth/useAuthStore";
import { useModalStore } from "@/shared/hooks/useModalStore";
import { ROUTES } from "@/shared/constants/routes";
import {
  colors,
  typography,
  HEADER_HEIGHT,
  BOTTOM_NAV_HEIGHT,
} from "@/shared/styles/theme";

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  background: ${colors.bg};
`;

const ContentArea = styled.main`
  flex: 1;
  min-height: 0;
  margin-top: ${HEADER_HEIGHT}px;
  margin-bottom: ${BOTTOM_NAV_HEIGHT}px;
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

const SellIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const BuyIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const WishIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BalanceCardContainer = styled.div`
  background: ${colors.surface};
  padding: 16px 20px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BalanceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const BalanceLabel = styled.span`
  font-size: ${typography.size.xs};
  color: ${colors.textSecondary};
  font-family: ${typography.fontFamily};
`;

const BalanceAmount = styled.span`
  font-size: ${typography.size.lg};
  font-weight: ${typography.weight.bold};
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily};
`;

const BANK_MAP: Record<string, string> = {
  "001": "한국은행",
  "002": "산업은행",
  "003": "기업은행",
  "004": "국민은행",
  "007": "수협은행",
  "011": "농협은행",
  "020": "우리은행",
  "023": "SC제일은행",
  "031": "대구은행",
  "032": "부산은행",
  "034": "광주은행",
  "035": "제주은행",
  "037": "전북은행",
  "039": "경남은행",
  "045": "새마을금고",
  "048": "신협중앙회",
  "071": "우체국",
  "081": "하나은행",
  "088": "신한은행",
  "089": "케이뱅크",
  "090": "카카오뱅크",
  "092": "토스뱅크",
};

function BalanceCardSection({ accessToken, userId }: { accessToken: string; userId: number | undefined }) {
  const { data: account } = useMyAccount(userId, accessToken);
  const { data: detail, isLoading: isDetailLoading } = useAccountDetail(account?.accountNumber, accessToken);
  const depositMutation = useDeposit(accessToken);
  const { alert: modalAlert } = useModalStore();

  const handleDeposit = async () => {
    if (!account?.accountNumber) return;
    try {
      await depositMutation.mutateAsync({
        accountNo: account.accountNumber,
        amount: 10000,
        summary: "테스트 충전",
      });
      modalAlert({ message: "10,000원이 성공적으로 충전되었습니다!\n금융망 잔액이 갱신되었습니다." });
    } catch (e) {
      modalAlert({ message: "충전 중 오류가 발생했습니다." });
    }
  };

  if (!account) return null;

  const bankDisplayName = BANK_MAP[account.bankCode] || account.bankName || "금융망 등록 은행";

  return (
    <BalanceCardContainer>
      <BalanceInfo>
        <BalanceLabel>내 지갑 잔액 ({bankDisplayName})</BalanceLabel>
        <BalanceAmount>
          {isDetailLoading ? "..." : `${Number(detail?.accountBalance || 0).toLocaleString()}원`}
        </BalanceAmount>
      </BalanceInfo>
      <Button 
        variant="outline" 
        size="sm" 
        loading={depositMutation.isPending}
        onClick={handleDeposit}
        style={{ width: "80px" }}
      >
        충전
      </Button>
    </BalanceCardContainer>
  );
}


export function MyPage() {
  const router = useRouter();
  const { accessToken, userId, clearToken } = useAuthStore();
  const { confirm: modalConfirm } = useModalStore();

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useMyProfile();

  const handleLogout = async () => {
    const isConfirmed = await modalConfirm({
      title: "로그아웃",
      message: "정말 로그아웃 하시겠습니까?",
      confirmLabel: "로그아웃",
    });

    if (!isConfirmed) return;

    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {}, accessToken ?? undefined);
    } catch {
      // ignore
    } finally {
      clearToken();
      router.push("/");
    }
  };

  const handleWithdraw = async () => {
    const isConfirmed = await modalConfirm({
      title: "탈퇴하기",
      message: "탈퇴하면 모든 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?",
      confirmLabel: "탈퇴",
      variant: "danger",
    });

    if (!isConfirmed || !userId) return;

    try {
      await apiClient.delete(ENDPOINTS.USERS.PROFILE(userId), accessToken ?? undefined);
    } catch {
      // ignore
    } finally {
      clearToken();
      window.location.href = "/goodbye";
    }
  };

  return (
    <Page>
      <HeaderMain title="MY" />
      <ContentArea>
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
          {!isLoading && !isError && user && (
            <ProfileHeader
              user={user}
              onEditClick={() => router.push(ROUTES.MY_PROFILE)}
            />
          )}
        </ProfileSection>

        {/* {accessToken && <BalanceCardSection accessToken={accessToken} userId={user?.id} />} */}

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

        <MenuGroup>
          <MenuListItem
            label="동네 재인증"
            onClick={() => router.push('/region-select?mode=reauth')}
          />
          <MenuListItem
            label="2차 비밀번호 변경"
            onClick={() => router.push('/secondary-password-change')}
          />
          <MenuListItem label="알림 설정" onClick={() => {}} />
          <MenuListItem label="로그아웃" onClick={handleLogout} />
          <MenuListItem
            label="탈퇴하기"
            color="danger"
            onClick={handleWithdraw}
          />
        </MenuGroup>
      </ContentArea>

      <BottomNav />
    </Page>
  );
}
