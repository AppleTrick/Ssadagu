'use client';

import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ItemCard, type ProductSummary } from '@/entities/product';
import { apiClient } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAuthStore } from '@/shared/auth/useAuthStore';
import { typography, colors } from '@/shared/styles/theme';

interface ProductListProps {
  searchQuery?: string;
}

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

export const ProductList = ({ searchQuery = '' }: ProductListProps) => {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Debug: Log the current token
  useEffect(() => {
    console.log('Current Token:', accessToken);
  }, [accessToken]);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<ProductSummary[]>({
      queryKey: ['products', searchQuery],
      queryFn: async () => {
        // Backend returns all products at once, so we ignore page/size parameters in queryFn
        // and handle slicing in the component if needed, or fetch once and use cached data.
        const res = await apiClient.get(
          `${ENDPOINTS.PRODUCTS.BASE}`,
          accessToken ?? undefined,
        );
        
        if (!res.ok) throw new Error('상품 목록을 불러오지 못했습니다.');
        
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data ?? []);
        return items;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        // Since backend doesn't support pagination, we fetch all once. 
        // To strictly follow "Infinite Scroll" request, we simulate it by showing all if data exists.
        // If we want real client-side chunking, we'd fetch all and slice 'allPages'.
        return undefined; // Stop infinite query after first fetch of all items
      },
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

  if (isLoading) {
    return <LoadingWrapper aria-live="polite" aria-busy="true">불러오는 중...</LoadingWrapper>;
  }

  if (isError) {
    return <LoadingWrapper>상품 목록을 불러오지 못했습니다.</LoadingWrapper>;
  }

  const allProducts = data?.pages.flat() || [];

  if (allProducts.length === 0) {
    return (
      <EmptyWrapper>
        {searchQuery ? `'${searchQuery}' 검색 결과가 없습니다.` : '등록된 상품이 없습니다.'}
      </EmptyWrapper>
    );
  }

  return (
    <>
      <ListWrapper>
        {allProducts.map((product) => (
          <li key={product.id}>
            <ItemCard product={product} onClick={() => router.push(`/products/${product.id}`)} />
          </li>
        ))}
      </ListWrapper>
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetchingNextPage && <FetchMoreIndicator>더 불러오는 중...</FetchMoreIndicator>}
    </>
  );
};
