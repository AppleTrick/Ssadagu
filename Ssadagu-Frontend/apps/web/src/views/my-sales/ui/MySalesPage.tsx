'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { TabBar } from '@/widgets/tab-bar';
import { ItemCard } from '@/entities/product';
import type { ProductSummary, ProductStatus } from '@/entities/product';
import { apiClient } from '@/shared/api/client';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT, STATUS_BAR_HEIGHT } from '@/shared/styles/theme';

/* ── Constants ──────────────────────────────────────────── */

const TABS = [
  { label: '판매중', value: 'ON_SALE' },
  { label: '판매완료', value: 'SOLD' },
];

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
  overflow-y: auto;
`;

const TabContainer = styled.div`
  position: sticky;
  top: ${HEADER_HEIGHT + STATUS_BAR_HEIGHT}px;
  z-index: 5;
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

/* ── Types ─────────────────────────────────────────────── */

interface ProductsResponse {
  content?: ProductSummary[];
  data?: ProductSummary[] | { content?: ProductSummary[] };
}

/* ── Component ───────────────────────────────────────────── */

export function MySalesPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [activeTab, setActiveTab] = useState('ON_SALE');

  const { data, isLoading, isError, refetch } = useQuery<ProductSummary[]>({
    queryKey: ['mySales'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me/products', accessToken ?? undefined);
      if (!res.ok) throw new Error('판매 내역을 불러오지 못했습니다.');
      const json = await res.json() as ProductsResponse | ProductSummary[];
      if (Array.isArray(json)) return json;
      if (Array.isArray((json as ProductsResponse).content)) return (json as ProductsResponse).content as ProductSummary[];
      const d = (json as ProductsResponse).data;
      if (Array.isArray(d)) return d as ProductSummary[];
      if (d && !Array.isArray(d) && Array.isArray((d as { content?: ProductSummary[] }).content)) {
        return (d as { content: ProductSummary[] }).content;
      }
      return [];
    },
    enabled: !!accessToken,
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
