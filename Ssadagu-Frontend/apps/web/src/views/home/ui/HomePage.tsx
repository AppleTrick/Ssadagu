'use client';

import { useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { HeaderMain } from '@/widgets/header';
import { BottomNav } from '@/widgets/bottom-nav';
import { ItemCard } from '@/entities/product';
import type { ProductSummary } from '@/entities/product';
import { FABWrite } from '@/shared/ui';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { colors, typography, HEADER_HEIGHT, BOTTOM_NAV_HEIGHT } from '@/shared/styles/theme';

interface PageData {
  content: ProductSummary[];
  hasNext: boolean;
  page: number;
}

interface ProductsResponse {
  data?: PageData;
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: ${colors.bg};
`;

const ContentArea = styled.main`
  flex: 1;
  padding-top: ${HEADER_HEIGHT}px;
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

const EmptyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.base};
  color: ${colors.textSecondary};
`;

const FetchMoreIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  font-family: ${typography.fontFamily};
  font-size: ${typography.size.sm};
  color: ${colors.textSecondary};
`;

export function HomePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [searchQuery, setSearchQuery] = useState('');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<PageData>({
      queryKey: ['products', searchQuery],
      queryFn: async ({ pageParam }) => {
        const page = pageParam as number;
        const q = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
        const res = await apiClient.get(
          `${ENDPOINTS.PRODUCTS.BASE}?page=${page}${q}`,
          accessToken ?? undefined,
        );
        if (!res.ok) throw new Error('상품 목록을 불러오지 못했습니다.');
        const json = await res.json() as ProductsResponse;
        return json.data ?? { content: [], hasNext: false, page };
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((p) => p.content) ?? [];

  return (
    <Page>
      <HeaderMain onSearchChange={setSearchQuery} />
      <ContentArea>
        {isLoading && (
          <LoadingWrapper aria-live="polite" aria-busy="true">불러오는 중...</LoadingWrapper>
        )}
        {isError && <LoadingWrapper>상품 목록을 불러오지 못했습니다.</LoadingWrapper>}
        {!isLoading && !isError && (
          <>
            {allProducts.length > 0 ? (
              <ListWrapper>
                {allProducts.map((product) => (
                  <li key={product.id}>
                    <ItemCard product={product} onClick={() => router.push(`/products/${product.id}`)} />
                  </li>
                ))}
              </ListWrapper>
            ) : (
              <EmptyWrapper>
                {searchQuery ? `'${searchQuery}' 검색 결과가 없습니다.` : '등록된 상품이 없습니다.'}
              </EmptyWrapper>
            )}
            <div ref={sentinelRef} style={{ height: 1 }} />
            {isFetchingNextPage && <FetchMoreIndicator>더 불러오는 중...</FetchMoreIndicator>}
          </>
        )}
      </ContentArea>
      <FABWrite onClick={() => router.push('/products/new')} />
      <BottomNav />
    </Page>
  );
}
