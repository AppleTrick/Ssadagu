'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { HistoryItemCard, TransactionListSkeleton } from '@/entities/transaction';
import { FadeIn } from '@/shared/ui';
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
  const { accessToken, userId } = useAuthStore();

  // 해당 사용자의 구매 내역 조회
  const { data, isLoading, isError, refetch } = useQuery<Purchase[]>({
    queryKey: ['userPurchases', userId],
    queryFn: () => {
      if (!userId) throw new Error('계정 정보가 없습니다.');
      return getUserPurchases(userId, accessToken ?? undefined);
    },
    enabled: !!accessToken && !!userId,
    staleTime: 0,
    gcTime: 0,
  });

  return (
    <Page>
      <HeaderBack title="나의 구매 내역" onBack={() => router.back()} />
      <ContentArea>
        {isLoading && <TransactionListSkeleton count={5} />}

        {isError && (
          <CenterWrapper>
            <span>구매 내역을 불러오지 못했습니다.</span>
            <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
          </CenterWrapper>
        )}

        {!isLoading && !isError && (
          <FadeIn>
            {data && data.length > 0 ? (
              <ListWrapper>
                {data.map((purchase) => (
                  <HistoryItemCard
                    key={purchase.id}
                    transaction={purchase}
                    role="buyer"
                    onClick={() => router.push(`/products/${purchase.productId}`)}
                  />
                ))}
              </ListWrapper>
            ) : (
              <CenterWrapper>구매 내역이 없습니다.</CenterWrapper>
            )}
          </FadeIn>
        )}
      </ContentArea>
    </Page>
  );
}
