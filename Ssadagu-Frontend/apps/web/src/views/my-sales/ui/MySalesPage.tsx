'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { TabBar } from '@/widgets/tab-bar';
import { ItemCard } from '@/entities/product';
import type { ProductSummary, ProductStatus } from '@/entities/product';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography } from '@/shared/styles/theme';
import { getUserMe } from '@/entities/user/api/getUserMe';
import { getUserProducts } from '@/entities/product/api/getUserProducts';

/* ── Constants ──────────────────────────────────────────── */

const TABS = [
  { label: '판매중', value: 'ON_SALE' },
  { label: '판매완료', value: 'SOLD' },
];

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

const TabContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${colors.surface};
  border-bottom: 1px solid ${colors.border};
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

export function MySalesPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [activeTab, setActiveTab] = useState('ON_SALE');

  // 1. 현재 사용자 정보 조회 (userId를 알기 위해)
  const { data: user } = useQuery({
    queryKey: ['userMe'],
    queryFn: () => getUserMe(accessToken ?? undefined),
    enabled: !!accessToken,
  });

  // 2. 해당 사용자의 판매 상품 조회
  const { data, isLoading, isError, refetch } = useQuery<ProductSummary[]>({
    queryKey: ['userProducts', user?.id],
    queryFn: () => getUserProducts(user!.id, accessToken ?? undefined),
    enabled: !!accessToken && !!user?.id,
  });


  const filtered = (data ?? []).filter((p) => p.status === (activeTab as ProductStatus));

  return (
    <Page>
      <HeaderBack title="나의 판매 내역" onBack={() => router.back()} />
      <ContentArea>
        <TabContainer>
          <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
        </TabContainer>

        {isLoading && <CenterWrapper>불러오는 중...</CenterWrapper>}

        {isError && (
          <CenterWrapper>
            <span>판매 내역을 불러오지 못했습니다.</span>
            <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
          </CenterWrapper>
        )}

        {!isLoading && !isError && (
          <>
            {filtered.length > 0 ? (
              <ListWrapper>
                {filtered.map((product) => (
                  <li key={product.id}>
                    <ItemCard
                      product={product}
                      onClick={() => router.push(`/products/${product.id}`)}
                    />
                  </li>
                ))}
              </ListWrapper>
            ) : (
              <CenterWrapper>
                {activeTab === 'ON_SALE' ? '판매중인 상품이 없습니다.' : '판매완료된 상품이 없습니다.'}
              </CenterWrapper>
            )}
          </>
        )}
      </ContentArea>
    </Page>
  );
}
