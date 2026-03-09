'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderBack } from '@/widgets/header';
import { ItemCard } from '@/entities/product';
import type { ProductSummary } from '@/entities/product';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT, STATUS_BAR_HEIGHT } from '@/shared/styles/theme';

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

interface WishesResponse {
  content?: ProductSummary[];
  data?: ProductSummary[] | { content?: ProductSummary[] };
}

/* ── Component ───────────────────────────────────────────── */

export function MyWishlistPage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError, refetch } = useQuery<ProductSummary[]>({
    queryKey: ['myWishes'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.USERS.MY_WISHES, accessToken ?? undefined);
      if (!res.ok) throw new Error('관심 목록을 불러오지 못했습니다.');
      const json = await res.json() as WishesResponse | ProductSummary[];
      if (Array.isArray(json)) return json;
      if (Array.isArray((json as WishesResponse).content)) return (json as WishesResponse).content as ProductSummary[];
      const d = (json as WishesResponse).data;
      if (Array.isArray(d)) return d as ProductSummary[];
      if (d && !Array.isArray(d) && Array.isArray((d as { content?: ProductSummary[] }).content)) {
        return (d as { content: ProductSummary[] }).content;
      }
      return [];
    },
    enabled: !!accessToken,
  });

  return (
    <Page>
      <HeaderBack title="나의 관심 목록" onBack={() => router.back()} />
      <ContentArea>
        {isLoading && <CenterWrapper>불러오는 중...</CenterWrapper>}

        {isError && (
          <CenterWrapper>
            <span>관심 목록을 불러오지 못했습니다.</span>
            <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
          </CenterWrapper>
        )}

        {!isLoading && !isError && (
          <>
            {data && data.length > 0 ? (
              <ListWrapper>
                {data.map((product) => (
                  <li key={product.id}>
                    <ItemCard
                      product={product}
                      onClick={() => router.push(`/products/${product.id}`)}
                    />
                  </li>
                ))}
              </ListWrapper>
            ) : (
              <CenterWrapper>관심 목록이 없습니다.</CenterWrapper>
            )}
          </>
        )}
      </ContentArea>
    </Page>
  );
}
