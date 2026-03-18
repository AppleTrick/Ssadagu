'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { HistoryItemCard } from '@/entities/transaction';
import { getUserPurchases } from '@/entities/transaction/api/getUserPurchases';
import { getUserMe } from '@/entities/user/api/getUserMe';
import type { Purchase } from '@/entities/transaction';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT } from '@/shared/styles/theme';

/* ── Styled ─────────────────────────────────────────────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background: ${colors.bg};
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ListWrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  background: ${colors.surface};
`;

const CenterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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

/* ── Component ───────────────────────────────────────────── */

export function MyPurchasesPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  // 1. 현재 사용자 정보 조회 (userId를 알기 위해)
  const { data: user } = useQuery({
    queryKey: ['userMe'],
    queryFn: () => getUserMe(accessToken ?? undefined),
    enabled: !!accessToken,
  });

  // 2. 해당 사용자의 구매 내역 조회
  const { data, isLoading, isError, refetch } = useQuery<Purchase[]>({
    queryKey: ['userPurchases', user?.id],
    queryFn: () => getUserPurchases(user!.id, accessToken ?? undefined),
    enabled: !!accessToken && !!user?.id,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <Page>
      <HeaderBack title="나의 구매 내역" onBack={() => router.back()} />
      <ContentArea>
        {isLoading && <CenterWrapper>불러오는 중...</CenterWrapper>}

        {isError && (
          <CenterWrapper>
            <span>구매 내역을 불러오지 못했습니다.</span>
            <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
          </CenterWrapper>
        )}

        {!isLoading && !isError && (
          <>
            {data && data.length > 0 ? (
              <ListWrapper>
                {data.map((tx) => (
                  <li key={tx.id}>
                    <HistoryItemCard
                      transaction={tx}
                      role="buyer"
                      onClick={() => router.push(`/products/${tx.productId}`)}
                    />
                  </li>
                ))}
              </ListWrapper>
            ) : (
              <CenterWrapper>구매 내역이 없습니다.</CenterWrapper>
            )}
          </>
        )}
      </ContentArea>
    </Page>
  );
}
