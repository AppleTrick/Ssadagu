'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import { HeaderMain } from '@/widgets/header';
import { BottomNav } from '@/widgets/bottom-nav';
import { ItemCard } from '@/entities/product';
import type { ProductSummary } from '@/entities/product';
import { FABWrite } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
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

const ListWrapper = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const ErrorWrapper = styled.div`
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

const EmptyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

/* ── Component ───────────────────────────────────────────── */

interface ProductsResponse {
  content?: ProductSummary[];
  data?: ProductSummary[] | { content?: ProductSummary[] };
}

export default function HomePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<ProductSummary[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PRODUCTS.BASE, accessToken ?? undefined);
      if (!res.ok) throw new Error('상품 목록을 불러오지 못했습니다.');
      const json = await res.json() as ProductsResponse | ProductSummary[];
      if (Array.isArray(json)) return json;
      if (Array.isArray((json as ProductsResponse).content)) {
        return (json as ProductsResponse).content as ProductSummary[];
      }
      const d = (json as ProductsResponse).data;
      if (Array.isArray(d)) return d as ProductSummary[];
      if (d && !Array.isArray(d) && Array.isArray((d as { content?: ProductSummary[] }).content)) {
        return (d as { content: ProductSummary[] }).content;
      }
      return [];
    },
  });

  const handleCardClick = (id: number) => {
    router.push(`/products/${id}`);
  };

  const handleFABClick = () => {
    router.push('/products/new');
  };

  return (
    <Page>
      <HeaderMain />

      <ContentArea>
        {isLoading && (
          <LoadingWrapper aria-live="polite" aria-busy="true">
            불러오는 중...
          </LoadingWrapper>
        )}

        {isError && (
          <ErrorWrapper>
            <span>상품 목록을 불러오지 못했습니다.</span>
            <button
              onClick={() => refetch()}
              style={{
                color: colors.primary,
                fontFamily: typography.fontFamily,
                fontSize: typography.size.sm,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              다시 시도
            </button>
          </ErrorWrapper>
        )}

        {!isLoading && !isError && (
          <>
            {data && data.length > 0 ? (
              <ListWrapper>
                {data.map((product) => (
                  <li key={product.id}>
                    <ItemCard
                      product={product}
                      onClick={() => handleCardClick(product.id)}
                    />
                  </li>
                ))}
              </ListWrapper>
            ) : (
              <EmptyWrapper>등록된 상품이 없습니다.</EmptyWrapper>
            )}
          </>
        )}
      </ContentArea>

      <FABWrite onClick={handleFABClick} />
      <BottomNav />
    </Page>
  );
}
